/**
 * Compute status based on startDate and endDate relative to now.
 * Returns 'upcoming' | 'active' | 'ended'
 */
export const computeDateBasedStatus = (
  startDate: Date | string,
  endDate: Date | string,
): 'upcoming' | 'active' | 'ended' => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now < start) return 'upcoming';
  if (now > end) return 'ended';
  return 'active';
};
