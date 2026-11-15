export const VOTE_PACKAGES = [10, 50, 100, 200, 500, 1000] as const;
export type VotePackage = typeof VOTE_PACKAGES[number];

export function amountForVotes(votes: number): number {
  if (!VOTE_PACKAGES.includes(votes as VotePackage)) {
    throw new Error('Unsupported voting package');
  }
  // Pricing policy: KSh 1 purchases 1 vote.
  return votes;
}
