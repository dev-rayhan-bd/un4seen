// src/app/modules/Admin/admin.services.ts

import { PopupVideo } from '../PopupVideo/popupVideo.model';
import { UserModel } from '../User/user.model';

const getDashboardStatsFromDB = async (year: number) => {
  const startOfYear = new Date(`${year}-01-01`);
  const endOfYear = new Date(`${year}-12-31T23:59:59`);


  const topStats = await UserModel.aggregate([
    {
      $facet: {
        total: [{ $count: "count" }],
        active: [{ $match: { status: 'active' } }, { $count: "count" }],
        suspended: [{ $match: { status: 'blocked' } }, { $count: "count" }],
        premium: [{ $match: { role: 'member' } }, { $count: "count" }]
      }
    }
  ]);


  const chartData = await UserModel.aggregate([
    {
      $match: {
        createdAt: { $gte: startOfYear, $lte: endOfYear }
      }
    },
    {
      $group: {
        _id: {
          month: { $month: "$createdAt" },
          isPremium: { $cond: [{ $eq: ["$role", "member"] }, true, false] }
        },
        count: { $sum: 1 }
      }
    }
  ]);


  const formatMonthlyData = (isPremiumFilter: boolean) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "July", "Augst", "Sep", "Oct", "Nov", "Dec"];
    const data = Array(12).fill(0);
    
    chartData.forEach(item => {
      if (item._id.isPremium === isPremiumFilter || !isPremiumFilter) {

        data[item._id.month - 1] += item.count;
      }
    });

    return months.map((month, index) => ({
      name: month,
      value: data[index]
    }));
  };

  return {
    topStats: {
      totalUsers: topStats[0].total[0]?.count || 0,
      activeUsers: topStats[0].active[0]?.count || 0,
      suspendedUsers: topStats[0].suspended[0]?.count || 0,
      premiumUsers: topStats[0].premium[0]?.count || 0,
    },
    charts: {

      monthlyUserGrowth: formatMonthlyData(false), 

      premiumUsersOverview: formatMonthlyData(true)
    }
  };
};

const uploadPopupVideoToDB = async (videoUrl: string) => {
  const result = await PopupVideo.findOneAndUpdate(
    {},
    { videoUrl, isActive: true },
    { upsert: true, new: true }
  );
  return result;
};

const getActivePopupVideoFromDB = async () => {
  return await PopupVideo.findOne({ isActive: true });
};


export const AdminServices = { getDashboardStatsFromDB ,uploadPopupVideoToDB,getActivePopupVideoFromDB};