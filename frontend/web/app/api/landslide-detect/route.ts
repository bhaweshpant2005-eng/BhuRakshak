import { NextRequest, NextResponse } from 'next/server';
import { runLandslideAiDetection, BENCHMARK_SECTORS } from '@/lib/api/landslideDetectionEngine';
import { execFile } from 'child_process';
import path from 'path';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sector = searchParams.get('sector') || 'sohra';
  const threshold = parseFloat(searchParams.get('threshold') || '0.5');

  const result = await executeDetection(sector, threshold);
  return NextResponse.json(result, { status: 200 });
}

export async function POST(request: NextRequest) {
  let body: { sector?: string; threshold?: number } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const sector = body.sector || 'sohra';
  const threshold = typeof body.threshold === 'number' ? body.threshold : 0.5;

  const result = await executeDetection(sector, threshold);
  return NextResponse.json(result, { status: 200 });
}

async function executeDetection(sector: string, threshold: number) {
  // 1. Run local detection engine
  const detectionResult = runLandslideAiDetection(sector, threshold);

  // 2. Optionally corroborate with Python checkpoint runner
  try {
    const scriptPath = path.resolve(process.cwd(), '../../model/infer.py');
    const pyOutput = await new Promise<string>((resolve, reject) => {
      execFile(
        'python3',
        [scriptPath, '--sector', sector, '--threshold', threshold.toString()],
        { timeout: 1500 },
        (error, stdout) => {
          if (error) reject(error);
          else resolve(stdout);
        }
      );
    });

    const parsed = JSON.parse(pyOutput);
    if (parsed && parsed.model_metadata) {
      detectionResult.model_metadata = {
        ...detectionResult.model_metadata,
        ...parsed.model_metadata,
        inference_device: parsed.model_metadata.inference_device || detectionResult.model_metadata.inference_device,
      };
    }
  } catch {
    // Python script not invoked or timed out; fall back cleanly to TypeScript engine
  }

  return detectionResult;
}
