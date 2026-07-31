import { Request, Response } from 'express';
import axios from 'axios';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import AppError from '../../errors/AppError';
import { UserModel } from '../User/user.model';
import { sendNotification } from '../../utils/sendNotification';
import {   
  fetchAllProductsFromShopify, 
  getMyOrdersFromShopify, 
  getSelectedProductsForApp, 
  getShopifyProductsFromDB, 
  saveAdminSelection, 
  toggleAdminSelection 
} from './shopify.service';

const generateAdminToken = catchAsync(async (req: Request, res: Response) => {
  const { client_id, client_secret } = req.body;

  const shopifyUrl = `https://${process.env.SHOPIFY_STORE_NAME}.myshopify.com/admin/oauth/access_token`;

  try {
    const response = await axios.post(shopifyUrl, {
      client_id: client_id || process.env.SHOPIFY_CLIENT_ID,
      client_secret: client_secret || process.env.SHOPIFY_CLIENT_SECRET,
      grant_type: 'client_credentials',
    });

    const { access_token, scope } = response.data;

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Shopify Admin Access Token generated successfully!',
      data: {
        access_token,
        scope,
        instruction: "Copy this access_token and save it as SHOPIFY_ACCESS_TOKEN in your .env file."
      },
    });
  } catch (error: any) {
    console.error("Shopify OAuth Error:", error.response?.data || error.message);
    sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: 'Failed to generate Shopify Token. Check your Client ID and Secret.',
      data: error.response?.data || error.message,
    });
  }
});

const getStoreProducts = catchAsync(async (req, res) => {
  const result = await getShopifyProductsFromDB(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Products retrieved successfully',
    data: result,
  });
});

const selectProducts = catchAsync(async (req: Request, res: Response) => {
  const { productIds } = req.body; // Array of IDs
  const result = await saveAdminSelection(productIds);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Products selected successfully',
    data: result
  });
});

const getAppStoreFeed = catchAsync(async (req: Request, res: Response) => {
  const result = await getSelectedProductsForApp();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'App store feed retrieved',
    data: result
  });
});

const getAllProducts = catchAsync(async (req: Request, res: Response) => {
  const result = await fetchAllProductsFromShopify(req.query);
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Shopify products retrieved with filters and images',
    data: result
  });
});

const toggleProduct = catchAsync(async (req: Request, res: Response) => {
  const { productId } = req.body;
  const result = await toggleAdminSelection(productId);
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Selection updated successfully',
    data: result
  });
});

/**
 * Controller to fetch authenticated user's Shopify orders.
 */
const getMyOrders = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as any)?.userId;

  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'User is not authenticated.');
  }

  const user = await UserModel.findById(userId);

  if (!user || !user.email) {
    throw new AppError(httpStatus.NOT_FOUND, 'User account or email address not found.');
  }

  const result = await getMyOrdersFromShopify(user.email, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User orders retrieved successfully from Shopify',
    data: result,
  });
});

/**
 * Unified Public Webhook Handler for Shopify order & fulfillment topics.
 * Handles topics: orders/create, fulfillments/create, fulfillments/update, orders/cancelled.
 */
const handleShopifyWebhook = catchAsync(async (req: Request, res: Response) => {
  const topicHeader = req.headers['x-shopify-topic'];
  const topic = Array.isArray(topicHeader) ? topicHeader[0] : topicHeader;

  const payload = req.body;
  const email = payload?.email || payload?.customer?.email || payload?.order?.email;
  const rawOrderNumber = payload?.name || (payload?.order_number ? `#${payload.order_number}` : payload?.number ? `#${payload.number}` : '');
  const orderNumber = rawOrderNumber ? (rawOrderNumber.startsWith('#') ? rawOrderNumber : `#${rawOrderNumber}`) : 'N/A';

  if (email && topic) {
    const user = await UserModel.findOne({ email });

    if (user) {
      const userId = user._id.toString();

      switch (topic) {
        case 'orders/create':
          await sendNotification(
            userId,
            'Order Confirmed! 🏁',
            `We received your order ${orderNumber}.`,
            'order'
          );
          break;

        case 'fulfillments/create':
        case 'fulfillments/update':
          await sendNotification(
            userId,
            'Order Shipped! 🚚',
            `Your order ${orderNumber} is on its way.`,
            'order'
          );
          break;

        case 'orders/cancelled':
          await sendNotification(
            userId,
            'Order Cancelled ⚠️',
            `Your order ${orderNumber} has been cancelled.`,
            'order'
          );
          break;

        default:
          console.log(`Unhandled Shopify Webhook Topic: ${topic}`);
          break;
      }
    } else {
      console.log(`User with email ${email} not found for Shopify Webhook topic ${topic}`);
    }
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Shopify Webhook received and processed successfully',
    data: null,
  });
});

export const ShopifyControllers = {
  generateAdminToken,
  getStoreProducts,
  selectProducts,
  getAppStoreFeed,
  getAllProducts,
  toggleProduct,
  getMyOrders,
  handleShopifyWebhook,
};