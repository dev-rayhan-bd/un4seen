export type TMilestone = {
  title: string;
  description: string;
  image: string;
  pointsRequired: number; 
  rewardType: 'physical' | 'digital';
  status: 'active' | 'inactive';
};