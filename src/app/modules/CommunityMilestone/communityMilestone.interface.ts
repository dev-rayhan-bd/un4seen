export type TCommunityMilestone = {
  title: string;
  description: string;
  image: string;
  targetMemberCount: number;
  rewardType: 'physical' | 'info';
  status: 'active' | 'inactive';
};