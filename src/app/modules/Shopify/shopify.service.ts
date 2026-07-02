import axios from 'axios';
import config from '../../config';
import { ShopifyToken } from './shopify.model';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status'
import { ShopifySelection } from './shopifySelection.model';
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

// -----------------------------------------------------------------------new feature-------------------------------------------------


export const saveAdminSelection = async (ids: string[]) => {
  return await ShopifySelection.findOneAndUpdate(
    {}, 
    { selectedProductIds: ids }, 
    { upsert: true, new: true }
  );
};


export const getSelectedProductsForApp = async () => {

  const selection = await ShopifySelection.findOne();
  if (!selection || selection.selectedProductIds.length === 0) return [];

  const accessToken = await getValidShopifyToken();
  const ids = selection.selectedProductIds.join(',');

  const response = await axios.get(`${SHOPIFY_URL}/products.json?ids=${ids}`, {
    headers: { 'X-Shopify-Access-Token': accessToken }
  });

  return response.data.products.map((p: any) => {
    const variant = p.variants[0];
    const price = parseFloat(variant?.price || "0");
    const comparePrice = parseFloat(variant?.compare_at_price || "0");

    let discount = null;
    if (comparePrice > price) {
      discount = `${Math.round(((comparePrice - price) / comparePrice) * 100)}% OFF`;
    }

    return {
      id: p.id,                   
      title: p.title,               
      handle: p.handle,             
      price: price.toFixed(2),     
      compareAtPrice: comparePrice > 0 ? comparePrice.toFixed(2) : null, 
      discountPercentage: discount,  
      image: p.image?.src || (p.images.length > 0 ? p.images[0].src : null),
      brand: p.vendor,              
      category: p.product_type,     
     
      productUrl: `https://un4seendecals.com/products/${p.handle}?discount=SYNDICATE`
    };
  });
};






export const fetchAllProductsFromShopify = async (query: Record<string, any>) => {
  const accessToken = await getValidShopifyToken();
  const SHOPIFY_URL = `https://${process.env.SHOPIFY_STORE_NAME}.myshopify.com/admin/api/2024-04/products.json`;
  const currentSelection = await ShopifySelection.findOne();
  const selectedIds = currentSelection ? currentSelection.selectedProductIds : [];

  const { limit = 50, page_info, title, vendor, product_type } = query;
  let params: any = { limit };

  if (page_info) {
    params.page_info = page_info;
  } else {
    if (title) params.title = title;
    if (vendor) params.vendor = vendor;
    if (product_type) params.product_type = product_type;
  }

  const response = await axios.get(SHOPIFY_URL, {
    headers: { 'X-Shopify-Access-Token': accessToken },
    params
  });

  const products = response.data.products.map((p: any) => {

    const variant = p.variants[0];
    const price = parseFloat(variant?.price || "0");
    const compareAtPrice = parseFloat(variant?.compare_at_price || "0");
    
    let discountPercentage = 0;
    if (compareAtPrice > price) {
      discountPercentage = Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
    }

    const cleanDescription = p.body_html 
      ? p.body_html.replace(/<[^>]*>?/gm, '').substring(0, 120) + '...'
      : "No description available";
 const pId = p.id.toString();
    return {
      id: p.id,
      title: p.title,
      handle: p.handle,
      description: cleanDescription,
      vendor: p.vendor, 
      category: p.product_type,
      tags: p.tags ? p.tags.split(',') : [], 
      status: p.status, // active, draft, or archived
      image: p.image?.src || (p.images.length > 0 ? p.images[0].src : null),
      price: price.toFixed(2),
      currency: "NZD",
      compareAtPrice: compareAtPrice > 0 ? compareAtPrice.toFixed(2) : null,
      discountPercentage: discountPercentage > 0 ? `${discountPercentage}% OFF` : null,
      isOnSale: compareAtPrice > price,
      inventory: variant?.inventory_quantity || 0,
      stockStatus: (variant?.inventory_quantity || 0) > 0 ? "In Stock" : "Out of Stock",
      publishedAt: p.published_at,
      shopifyUrl: `https://${process.env.SHOPIFY_STORE_NAME}.myshopify.com/products/${p.handle}`,
      isSelected: selectedIds.includes(pId) 
    };
  });


  const linkHeader = response.headers['link'];
  let nextPageToken = '';
  let prevPageToken = '';

  if (linkHeader) {
  
    const nextMatch = linkHeader.match(/page_info=([^>]+)>;\s*rel="next"/);
    if (nextMatch) nextPageToken = nextMatch[1];

   
    const prevMatch = linkHeader.match(/page_info=([^>]+)>;\s*rel="previous"/);
    if (prevMatch) prevPageToken = prevMatch[1];
  }

  return {
    meta: {
      next_page_info: nextPageToken,
        prev_page_info: prevPageToken,
      count: products.length
    },
    result: products
  };
};

export const toggleAdminSelection = async (productId: string) => {
  const selection = await ShopifySelection.findOne();

  if (!selection) {

    return await ShopifySelection.create({ selectedProductIds: [productId] });
  }

  const isAlreadySelected = selection.selectedProductIds.includes(productId);

  if (isAlreadySelected) {
  
    return await ShopifySelection.findOneAndUpdate(
      {},
      { $pull: { selectedProductIds: productId } },
      { new: true }
    );
  } else {

    return await ShopifySelection.findOneAndUpdate(
      {},
      { $addToSet: { selectedProductIds: productId } },
      { new: true }
    );
  }
};