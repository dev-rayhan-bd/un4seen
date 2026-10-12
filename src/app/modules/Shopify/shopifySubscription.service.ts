import { UserModel } from '../User/user.model';
import { sendNotification } from '../../utils/sendNotification';

// Strict keywords for customer tags
const SUBSCRIBER_TAG_KEYWORDS = [
  'active_subscriber',
  'active-subscriber',
  'subscriber',
  'subscription',
  'syndicate_member',
  'membership',
  'member',
  'vip',
  'premium',
];

const CANCELLATION_TAG_KEYWORDS = [
  'cancelled',
  'canceled',
  'expired',
  'inactive',
  'churned',
  'unsubscribed',
];

/**
 * Checks if a given line item from a Shopify order is a subscription package.
 * Prioritizes Shopify's official standard selling_plan_allocation object.
 */
export const isSubscriptionLineItem = (item: any): boolean => {
  if (!item) return false;

  // 1. Official Shopify Native Subscription check:
  // When a product is bought as a recurring subscription, Shopify attaches selling_plan_allocation.
  if (item.selling_plan_allocation) {
    return true;
  }

  // 2. Strict check: explicitly titled subscription or membership
  const title = (item.title || item.name || '').toLowerCase();
  if (title.includes('subscription') || title.includes('membership')) {
    return true;
  }

  return false;
};

/**
 * Determines subscription validity duration in days from line item or contract.
 */
export const parseSubscriptionDuration = (item: any): number => {
  const text = `${item?.title || ''} ${item?.name || ''} ${item?.variant_title || ''}`.toLowerCase();
  if (text.includes('year') || text.includes('annual') || text.includes('365')) {
    return 365;
  }
  // Default to 30 days (1 month)
  return 30;
};

/**
 * Checks if customer tags contain active subscriber keywords.
 */
export const hasSubscriberTag = (rawTags: string | string[]): boolean => {
  if (!rawTags) return false;
  const tagList = Array.isArray(rawTags)
    ? rawTags
    : rawTags.split(',').map((t) => t.trim().toLowerCase());

  return tagList.some((tag) =>
    SUBSCRIBER_TAG_KEYWORDS.some((kw) => tag.toLowerCase().includes(kw))
  );
};

/**
 * Checks if customer tags contain cancellation / expired keywords.
 */
export const hasCancellationTag = (rawTags: string | string[]): boolean => {
  if (!rawTags) return false;
  const tagList = Array.isArray(rawTags)
    ? rawTags
    : rawTags.split(',').map((t) => t.trim().toLowerCase());

  return tagList.some((tag) =>
    CANCELLATION_TAG_KEYWORDS.some((kw) => tag.toLowerCase().includes(kw))
  );
};

/**
 * Finds user by email or shopifyCustomerId.
 */
const findTargetUser = async (criteria: {
  email?: string;
  shopifyCustomerId?: string;
  contractId?: string;
}) => {
  const { email, shopifyCustomerId, contractId } = criteria;
  const query: any[] = [];

  if (email) {
    query.push({ email: email.toLowerCase().trim() });
  }
  if (shopifyCustomerId) {
    query.push({ shopifyCustomerId: shopifyCustomerId.toString() });
  }
  if (contractId) {
    query.push({ shopifySubscriptionContractId: contractId.toString() });
  }

  if (query.length === 0) return null;

  return await UserModel.findOne({ $or: query });
};

/**
 * Upgrades user to 'member' role and sets premium status.
 */
export const upgradeUserToMember = async (
  criteria: {
    email?: string;
    shopifyCustomerId?: string;
    contractId?: string;
  },
  details?: {
    planName?: string;
    durationDays?: number;
    contractId?: string;
    expiresAt?: Date;
  }
) => {
  const user = await findTargetUser(criteria);
  if (!user) {
    console.warn(`[ShopifySubscription] User not found for upgrade: ${JSON.stringify(criteria)}`);
    return null;
  }

  const userId = user._id.toString();

  // If user is admin or superAdmin, preserve their elevated role!
  const isElevatedRole = user.role === 'admin' || user.role === 'superAdmin';
  const newRole = isElevatedRole ? user.role : 'member';

  // Calculate expiration date
  let expiresAt: Date;
  if (details?.expiresAt) {
    expiresAt = new Date(details.expiresAt);
  } else {
    const durationDays = details?.durationDays || 30;
    const baseDate =
      user.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt).getTime() > Date.now()
        ? new Date(user.subscriptionExpiresAt)
        : new Date();
    expiresAt = new Date(baseDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
  }

  const updateData: any = {
    role: newRole,
    isPremium: true,
    subscriptionStatus: 'active',
    subscriptionExpiresAt: expiresAt,
  };

  if (details?.planName) {
    updateData.subscriptionPlan = details.planName;
  }
  if (details?.contractId) {
    updateData.shopifySubscriptionContractId = details.contractId;
  }
  if (criteria.shopifyCustomerId && !user.shopifyCustomerId) {
    updateData.shopifyCustomerId = criteria.shopifyCustomerId;
  }

  const updatedUser = await UserModel.findByIdAndUpdate(userId, updateData, { new: true });

  console.log(`[ShopifySubscription] Upgraded user ${user.email} to ${newRole} (expires: ${expiresAt.toISOString()})`);

  // Send push notification to user
  await sendNotification(
    userId,
    'Welcome to Syndicate Premium! 🏁',
    'Your premium membership is now active. Enjoy exclusive features!',
    'system'
  );

  return updatedUser;
};

/**
 * Downgrades user to 'guest' role and revokes premium status.
 */
export const downgradeUserToGuest = async (
  criteria: {
    email?: string;
    shopifyCustomerId?: string;
    contractId?: string;
  },
  reason: 'expired' | 'cancelled' | 'paused' | 'failed' = 'expired'
) => {
  const user = await findTargetUser(criteria);
  if (!user) {
    console.warn(`[ShopifySubscription] User not found for downgrade: ${JSON.stringify(criteria)}`);
    return null;
  }

  // Safety: NEVER downgrade admin or superAdmin!
  if (user.role === 'admin' || user.role === 'superAdmin') {
    console.log(`[ShopifySubscription] Preserving admin role for user ${user.email}`);
    await UserModel.findByIdAndUpdate(user._id, {
      isPremium: false,
      subscriptionStatus: reason,
    });
    return user;
  }

  const userId = user._id.toString();

  const updatedUser = await UserModel.findByIdAndUpdate(
    userId,
    {
      role: 'guest',
      isPremium: false,
      subscriptionStatus: reason,
    },
    { new: true }
  );

  console.log(`[ShopifySubscription] Downgraded user ${user.email} from member to guest (reason: ${reason})`);

  // Send push notification about expiry/cancellation
  await sendNotification(
    userId,
    'Membership Status Update ⚠️',
    'Your premium membership has expired or ended. Renew to continue accessing exclusive content.',
    'system'
  );

  return updatedUser;
};

/**
 * Scans database for users whose subscription has expired and downgrades them to 'guest'.
 */
export const checkAndDowngradeExpiredUsers = async () => {
  try {
    const now = new Date();
    const expiredUsers = await UserModel.find({
      role: 'member',
      subscriptionExpiresAt: { $lt: now, $ne: null },
    });

    if (expiredUsers.length > 0) {
      console.log(`[ShopifySubscription] Found ${expiredUsers.length} expired members to downgrade.`);

      for (const user of expiredUsers) {
        await downgradeUserToGuest(
          { email: user.email, shopifyCustomerId: user.shopifyCustomerId },
          'expired'
        );
      }
    }
  } catch (error) {
    console.error('[ShopifySubscription] Error in checkAndDowngradeExpiredUsers:', error);
  }
};

/**
 * Unified webhook dispatcher to handle subscription-related Shopify webhook topics.
 */
export const processSubscriptionWebhook = async (topic: string, payload: any) => {
  const email = (
    payload?.email ||
    payload?.customer?.email ||
    payload?.order?.email ||
    payload?.customer_email
  )
    ?.toLowerCase()
    ?.trim();

  const shopifyCustomerId = (
    payload?.customer?.id ||
    payload?.customer_id ||
    payload?.id
  )?.toString();

  const criteria = { email, shopifyCustomerId };

  switch (topic) {
    case 'orders/create':
    case 'orders/paid': {
      const lineItems = payload?.line_items || [];
      const subItem = lineItems.find((item: any) => isSubscriptionLineItem(item));

      if (subItem) {
        const planName = subItem.title || subItem.name || 'Syndicate Membership';
        const durationDays = parseSubscriptionDuration(subItem);

        console.log(`[ShopifySubscription] Subscription detected in order: "${planName}"`);
        await upgradeUserToMember(criteria, {
          planName,
          durationDays,
        });
      }
      break;
    }

    case 'orders/cancelled': {
      const lineItems = payload?.line_items || [];
      const subItem = lineItems.find((item: any) => isSubscriptionLineItem(item));

      if (subItem) {
        console.log(`[ShopifySubscription] Subscription order cancelled for ${email}`);
        await downgradeUserToGuest(criteria, 'cancelled');
      }
      break;
    }

    case 'subscription_contracts/create': {
      const contractId = (payload?.id || payload?.admin_graphql_api_id)?.toString();
      const nextBillingDate = payload?.next_billing_date ? new Date(payload.next_billing_date) : undefined;
      const planName = payload?.lines?.[0]?.title || 'Syndicate Subscription';

      console.log(`[ShopifySubscription] Subscription contract created: ${contractId}`);
      await upgradeUserToMember(criteria, {
        contractId,
        planName,
        expiresAt: nextBillingDate,
      });
      break;
    }

    case 'subscription_contracts/update': {
      const contractId = (payload?.id || payload?.admin_graphql_api_id)?.toString();
      const status = (payload?.status || '').toUpperCase();
      const nextBillingDate = payload?.next_billing_date ? new Date(payload.next_billing_date) : undefined;

      console.log(`[ShopifySubscription] Subscription contract updated: ${contractId}, status: ${status}`);

      if (status === 'ACTIVE') {
        await upgradeUserToMember(
          { ...criteria, contractId },
          {
            contractId,
            expiresAt: nextBillingDate,
          }
        );
      } else if (['CANCELLED', 'EXPIRED', 'PAUSED', 'FAILED'].includes(status)) {
        await downgradeUserToGuest(
          { ...criteria, contractId },
          status.toLowerCase() as any
        );
      }
      break;
    }

    case 'subscription_billing_attempts/success': {
      const contractId = (payload?.subscription_contract_id || payload?.admin_graphql_api_id)?.toString();
      console.log(`[ShopifySubscription] Billing attempt succeeded for contract ${contractId}`);
      await upgradeUserToMember(
        { ...criteria, contractId },
        {
          contractId,
          durationDays: 30,
        }
      );
      break;
    }

    case 'subscription_billing_attempts/failure': {
      const contractId = (payload?.subscription_contract_id || payload?.admin_graphql_api_id)?.toString();
      console.warn(`[ShopifySubscription] Billing attempt failed for contract ${contractId}`);
      // Notify user or mark payment failed
      await downgradeUserToGuest({ ...criteria, contractId }, 'failed');
      break;
    }

    case 'customers/update': {
      const rawTags = payload?.tags;
      if (rawTags) {
        if (hasSubscriberTag(rawTags)) {
          await upgradeUserToMember(criteria, {
            planName: 'Syndicate Member (Tagged)',
            durationDays: 30,
          });
        } else if (hasCancellationTag(rawTags)) {
          await downgradeUserToGuest(criteria, 'cancelled');
        }
      }
      break;
    }

    default:
      break;
  }
};
