import express from 'express';
import { AuthControllers } from './auth.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from './auth.constant';

const router = express.Router();

router.post('/login', AuthControllers.login);

//call after successfull payment from shopify 
router.post('/shopify-sync', AuthControllers.shopifyWebhook);
router.post('/forgot-password', AuthControllers.forgotPassword);
router.post('/verify-otp', AuthControllers.verifyOTP);
router.post('/reset-password', AuthControllers.resetPassword);
router.post('/resend-otp', AuthControllers.resendOTP);
router.post('/refresh-token', AuthControllers.refreshToken);


router.get('/shopify', (req, res) => {
  const shop = req.query.shop;
  const redirectUri = `https://un4seen-backend.vercel.app/api/v1/auth/shopify/callback`;
  const scopes = 'read_customers,read_orders,write_orders,read_products,read_price_rules,write_price_rules,read_discounts,write_discounts,write_inventory,read_inventory';
  
  const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${process.env.SHOPIFY_API_KEY}&scope=${scopes}&redirect_uri=${redirectUri}`;
  
  res.redirect(installUrl);
});


router.get('/shopify/callback', async (req, res) => {
  const { shop, code } = req.query;
  
  const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.SHOPIFY_API_KEY,
      client_secret: process.env.SHOPIFY_API_SECRET,
      code: code
    })
  });
  
  const data = await response.json();
  console.log('ACCESS TOKEN:', data.access_token);
  
  res.json({ access_token: data.access_token }); 
})
export const AuthRoutes = router;