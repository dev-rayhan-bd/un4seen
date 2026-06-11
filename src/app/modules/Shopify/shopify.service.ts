import axios from 'axios';
import config from '../../config';
import { ShopifyToken } from './shopify.model';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status'
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


const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_NAME 
const API_VERSION = "2024-04";

let productCache: any[] = [];
let lastCacheTime = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 mn chache

export const getShopifyProductsFromDB = async (query: Record<string, unknown>) => {
  try {
    const accessToken = await getValidShopifyToken();
    const baseUrl = `https://${SHOPIFY_DOMAIN}.myshopify.com/admin/api/${API_VERSION}`;

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const vendor = (query.brand as string) || '';

    const currentTime = Date.now();


    if (productCache.length === 0 || (currentTime - lastCacheTime) > CACHE_DURATION) {
      console.log("🚀 Cache empty/expired. Fetching first 250 products...");


      const response = await axios.get(`${baseUrl}/products.json?limit=250`, {
        headers: { 'X-Shopify-Access-Token': accessToken },
        timeout: 10000 
      });

      productCache = response.data.products;
      lastCacheTime = currentTime;
    }


    let filteredProducts = productCache;
    if (vendor) {
      filteredProducts = productCache.filter(
        (p: any) => p.vendor.toLowerCase() === vendor.toLowerCase()
      );
    }


    const total = filteredProducts.length;
    const skip = (page - 1) * limit;
    const paginated = filteredProducts.slice(skip, skip + limit);


    const result = paginated.map((p: any) => {
      const variant = p.variants[0];
      const price = parseFloat(variant.price);
      const comparePrice = variant.compare_at_price ? parseFloat(variant.compare_at_price) : null;
      let discount = null;
      if (comparePrice && comparePrice > price) {
        discount = Math.round(((comparePrice - price) / comparePrice) * 100);
      }

      return {
        id: p.id,
        title: p.title,
        handle: p.handle,
        price: price.toFixed(2),
        compareAtPrice: comparePrice ? comparePrice.toFixed(2) : null,
        discountPercentage: discount ? `-${discount}%` : null,
        image: p.image?.src || "",
        brand: p.vendor,
        category: p.product_type,
        productUrl: `https://un4seendecals.com/products/${p.handle}?discount=SYNDICATE`
      };
    });


    return {
      meta: {
        page,
        limit,
        total,
        totalPage: Math.ceil(total / limit)
      },
      result
    };

  } catch (error: any) {
    console.error("❌ Shopify Error:", error.message);
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Shopify products could not be loaded. Please try again.");
  }
};



