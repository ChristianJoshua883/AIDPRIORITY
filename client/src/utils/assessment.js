export function calculatePriority(data) {
  let score = 0;
  if (data.low_income) score += 3;
  if (data.vulnerable_member) score += 2;
  if (data.disability_or_senior) score += 2;
  if (data.dependent_children) score += 1;
  if (data.housing_insecurity) score += 2;
  if (data.emergency_situation) score += 3;
  let recommended_priority = 'LOW';
  if (score >= 7) recommended_priority = 'HIGH';
  else if (score >= 4) recommended_priority = 'MEDIUM';
  return { score, recommended_priority };
}
