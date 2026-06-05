export const getEmailTemplate = ({
  userName,
  title,
  body,
  otpCode,
  buttonText,
  buttonLink,
}: {
  userName: string;
  title: string;
  body: string;
  otpCode?: string;
  buttonText?: string;
  buttonLink?: string;
}) => {
  return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #000; color: #fff; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #111; border: 1px solid #222; border-radius: 12px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #00A3FF 0%, #0057FF 100%); padding: 40px 20px; text-align: center; }
        .logo { width: 180px; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.3)); }
        .content { padding: 40px 30px; text-align: center; }
        .content h1 { color: #fff; font-size: 26px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 20px; }
        .content p { color: #aaa; font-size: 16px; line-height: 1.6; }
        .otp-badge { display: inline-block; background: #222; border: 2px solid #00A3FF; color: #fff; font-size: 32px; font-weight: bold; padding: 15px 30px; border-radius: 8px; letter-spacing: 10px; margin: 30px 0; }
        .btn { display: inline-block; background: #00A3FF; color: #fff !important; text-decoration: none; padding: 16px 32px; border-radius: 6px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-top: 25px; }
        .footer { padding: 30px; text-align: center; font-size: 12px; color: #444; border-top: 1px solid #222; }
        .social { margin-top: 15px; }
        .social a { color: #00A3FF; text-decoration: none; margin: 0 10px; font-weight: bold; }
         .otp-box { 
            font-size: 32px; 
            font-weight: bold; 
            letter-spacing: 8px; 
            color: #00A3FF; 
            background: #111; 
            padding: 20px; 
            border: 1px dashed #00A3FF; 
            margin: 20px 0;
            display: inline-block;
        }
    </style>
    <head>
  
</head>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://res.cloudinary.com/da1uxchgo/image/upload/v1780398927/syndicate_final_logo_Horizontal_1-01_1_1_esy7xf.png" alt="UN4SEEN SYNDICATE" class="logo">
        </div>
           <div class="content">
            <h1>${title}</h1>
            <p>Hey <strong>${userName}</strong>,</p>
            <div style="line-height: 1.6;">${body}</div>
            ${otpCode ? `<div class="otp-box">${otpCode}</div>` : ""}
            ${buttonText ? `<a href="${buttonLink}" class="btn">${buttonText}</a>` : ""}
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} UN4SEEN DECALS. ALL RIGHTS RESERVED.</p>
            <div class="social">
                <a href="#">INSTAGRAM</a> | <a href="#">TIKTOK</a> | <a href="#">FACEBOOK</a>
            </div>
        </div>
    </div>
</body>
</html>
  `;
};