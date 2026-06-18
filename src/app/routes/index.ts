import { Router } from 'express';

import aboutRouter from '../modules/about/about.route';
import privacyPolicyRouter from '../modules/PrivacyPolicy/privacyPolicy.routes';
import termsRouter from '../modules/Terms/terms.route';
import { FaqRoutes } from '../modules/FAQ/faq.routes';
import { ContactRoutes } from '../modules/ContactUs/contact.route';
import { UserRoutes } from '../modules/User/user.routes';
import { AuthRoutes } from '../modules/Auth/auth.routes';
import { PointRoutes } from '../modules/ShredPoints/points.routes';
import { ShopifyRoutes } from '../modules/Shopify/shopify.routes';
import { RideRoutes } from '../modules/ride/ride.routes';

import { CompetitionRoutes } from '../modules/Competition/competition.routes';
import { GiveawayRoutes } from '../modules/Giveway/giveaway.routes';
import { MilestoneRoutes } from '../modules/Milestone/milestone.routes';
import { CommunityMilestoneRoutes } from '../modules/CommunityMilestone/communityMilestone.routes';
import { TestRiderRoutes } from '../modules/TestRider/testRider.routes';
import { StoryRoutes } from '../modules/Story/story.routes';
import { BikeRoutes } from '../modules/Bike/bike.routes';
import { MusicRoutes } from '../modules/Music/music.routes';
import { IdeaRoutes } from '../modules/Idea/idea.routes';
import { CrewChoiceRoutes } from '../modules/CrewChoice/crewChoice.routes';
import { ChannelRoutes } from '../modules/Channel/channel.routes';
import { NotificationRoutes } from '../modules/PrivacyPolicy/Notification/notification.routes';
import { PostRoutes } from '../modules/Post/post.routes';







const router = Router();

const moduleRoutes = [
  {
    path: '/auth',
    route:AuthRoutes
  },
  {
    path: '/user',
    route:UserRoutes
  },
  {
    path: '/about',
    route:aboutRouter
  },
  {
    path: '/privacy',
    route:privacyPolicyRouter
  },
  {
    path: '/terms',
    route:termsRouter
  },
  {
    path: '/faq',
    route:FaqRoutes
  },
  {
    path: '/contact',
    route:ContactRoutes
  },
{
    path: '/shred-points',
    route: PointRoutes
  },
  {
  path: '/shopify',
  route: ShopifyRoutes,
},
  {
  path: '/rides',
  route: RideRoutes,
},
  {
    path: '/competitions',
    route: CompetitionRoutes,
  },
  {
    path: '/giveaways',
    route: GiveawayRoutes,
  },
  {
    path: '/milestones',
    route: MilestoneRoutes,
  },
  {
    path: '/community-milestones',
    route: CommunityMilestoneRoutes,
  },

  {
    path: '/test-rider',
    route: TestRiderRoutes,
  },
  {
    path: '/stories',
    route: StoryRoutes,
  },
  {
    path: '/bikes',
    route: BikeRoutes,
  },
  {
    path: '/music',
    route: MusicRoutes,
  },
  {
    path: '/ideas',
    route: IdeaRoutes,
  },
  {
    path: '/crew-choices',
    route: CrewChoiceRoutes,
  },
  {
    path: '/channels',
    route: ChannelRoutes,
  },
  {
    path: '/notification',
    route: NotificationRoutes,
  },
  {
    path: '/posts',
    route: PostRoutes,
  }
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
