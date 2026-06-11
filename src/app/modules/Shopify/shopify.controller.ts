import { Request, Response } from 'express';
import axios from 'axios';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { getShopifyProductsFromDB } from './shopify.service';



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
export const ShopifyControllers = {
  generateAdminToken,
  getStoreProducts

};