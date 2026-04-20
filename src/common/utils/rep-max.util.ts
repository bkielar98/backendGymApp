export function calculateBrzyckiRepMax(
  weight?: number | null,
  reps?: number | null,
) {
  if (
    typeof weight !== 'number' ||
    typeof reps !== 'number' ||
    weight <= 0 ||
    reps <= 0 ||
    reps >= 37
  ) {
    return null;
  }

  const repMax = weight * (36 / (37 - reps));
  return Math.round(repMax * 100) / 100;
}
