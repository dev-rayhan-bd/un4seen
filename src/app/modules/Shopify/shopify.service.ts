import axios from 'axios';
import config from '../../config';
import { ShopifyToken } from './shopify.model';

const SHOPIFY_URL = `https://un4seen.myshopify.com/admin/api/2024-04`;



export const getShopifyAccessToken = async () => {
  try {
    const response = await axios.post(
      `https://un4seen-decals.myshopify.com/admin/oauth/access_token`,
      {
        client_id: process.env.SHOPIFY_CLIENT_ID,
        client_secret: process.env.SHOPIFY_CLIENT_SECRET,
        grant_type: "client_credentials",
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error("Error fetching Shopify Token", error);
  }
};



const getValidShopifyToken = async () => {
  let tokenData = await ShopifyToken.findOne().sort({ createdAt: -1 });
  const now = new Date();

  if (!tokenData || new Date(tokenData.expiresAt).getTime() - now.getTime() < 600000) {
    console.log("🔄 Fetching fresh Shopify token...");
    
    const response = await axios.post(`https://un4seen.myshopify.com/admin/oauth/access_token`, {
      client_id: process.env.SHOPIFY_CLIENT_ID,
      client_secret: process.env.SHOPIFY_CLIENT_SECRET,
      grant_type: 'client_credentials',
    });

    const { access_token, expires_in } = response.data;
    const expiresAt = new Date(Date.now() + expires_in * 1000);


    tokenData = await ShopifyToken.findOneAndUpdate(
      {}, 
      { accessToken: access_token, expiresAt }, 
      { upsert: true, new: true }
    );
  }
  return tokenData?.accessToken;
};


export const createShopifyDiscountCode = async (amount: number) => {

  const accessToken = await getValidShopifyToken(); 


  const priceRuleResponse = await axios.post(`${SHOPIFY_URL}/price_rules.json`, {
    price_rule: {
      title: `REWARD-${Date.now()}`,
      value: `-${amount}.00`,
      target_type: "line_item",
      target_selection: "all",
      allocation_method: "across",
      value_type: "fixed_amount",
      customer_selection: "all",
      starts_at: new Date().toISOString(),
      usage_limit: 1
    }
  }, {
    headers: { 'X-Shopify-Access-Token': accessToken }
  });

  const ruleId = priceRuleResponse.data.price_rule.id;
  const randomCode = Math.random().toString(36).substring(2, 10).toUpperCase();

  const discountResponse = await axios.post(`${SHOPIFY_URL}/price_rules/${ruleId}/discount_codes.json`, {
    discount_code: { code: `SHRED-${randomCode}` }
  }, {
    headers: { 'X-Shopify-Access-Token': accessToken }
  });

  return discountResponse.data.discount_code.code;
};