type ConsistencyInput = {
  hasWeight: boolean;
  hasBodyFat: boolean;
  hasMeal: boolean;
  hasCalories: boolean;
  workoutDone: boolean;
  movementMinutes: number;
};

export function calculateDailyConsistency(input: ConsistencyInput) {
  let score = 0;

  if (input.hasWeight) score += 15;
  if (input.hasBodyFat) score += 10;
  if (input.hasMeal) score += 25;
  if (input.hasCalories) score += 10;
  if (input.workoutDone) score += 25;
  if (input.movementMinutes >= 20) score += 15;

  return Math.min(score, 100);
}
