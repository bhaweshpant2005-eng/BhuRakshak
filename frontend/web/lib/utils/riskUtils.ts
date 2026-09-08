import { RiskLevel } from '../api/types';

export function getRiskLevel(score: number): RiskLevel {
  if (score <= 25) return 'LOW';
  if (score <= 50) return 'MODERATE';
  if (score <= 75) return 'HIGH';
  return 'CRITICAL';
}

export function getRiskColor(levelOrScore: RiskLevel | number): string {
  const level = typeof levelOrScore === 'number' ? getRiskLevel(levelOrScore) : levelOrScore;
  switch (level) {
    case 'LOW':
      return '#10b981'; // Emerald
    case 'MODERATE':
      return '#f59e0b'; // Amber
    case 'HIGH':
      return '#f97316'; // Orange
    case 'CRITICAL':
      return '#ef4444'; // Red
    default:
      return '#6b7280';
  }
}

export function getRiskBadgeClasses(levelOrScore: RiskLevel | number): string {
  const level = typeof levelOrScore === 'number' ? getRiskLevel(levelOrScore) : levelOrScore;
  switch (level) {
    case 'LOW':
      return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    case 'MODERATE':
      return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    case 'HIGH':
      return 'bg-orange-500/15 text-orange-400 border-orange-500/30';
    case 'CRITICAL':
      return 'bg-red-500/15 text-red-400 border-red-500/30 animate-pulse';
    default:
      return 'bg-gray-500/15 text-gray-400 border-gray-500/30';
  }
}

export function getRiskBgGlow(levelOrScore: RiskLevel | number): string {
  const level = typeof levelOrScore === 'number' ? getRiskLevel(levelOrScore) : levelOrScore;
  switch (level) {
    case 'LOW':
      return 'shadow-emerald-950/20';
    case 'MODERATE':
      return 'shadow-amber-950/20';
    case 'HIGH':
      return 'shadow-orange-950/30';
    case 'CRITICAL':
      return 'shadow-red-950/50';
    default:
      return '';
  }
}
