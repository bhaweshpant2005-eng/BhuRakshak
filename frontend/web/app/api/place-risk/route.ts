import { NextRequest, NextResponse } from 'next/server';
import { evaluatePlaceRisk } from '@/lib/api/placeRiskEngine';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address')?.trim();
    const refreshWeather = searchParams.get('refresh_weather') === 'true' || searchParams.get('refreshWeather') === 'true';

    if (!address || address.length < 2) {
      return NextResponse.json(
        { detail: 'Please provide a valid Indian place name, town, or district (min 2 characters).' },
        { status: 400 },
      );
    }

    const result = await evaluatePlaceRisk(address, refreshWeather);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[API /api/place-risk] Unexpected error:', error);
    return NextResponse.json(
      { detail: 'Internal error evaluating place risk. Please try again.' },
      { status: 500 },
    );
  }
}
