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
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="color-scheme" content="dark">
    <meta name="supported-color-schemes" content="dark">
    <title>${title}</title>
    <!--[if mso]>
    <style>
        table { border-collapse: collapse; }
        *, body, p, div, span, strong, em, h1, a { font-family: Arial, sans-serif !important; }
    </style>
    <![endif]-->
    <style>
        :root {
            color-scheme: dark;
            supported-color-schemes: dark;
        }
        body { margin: 0; padding: 0; width: 100% !important; background-color: #0a0a0a !important; font-family: 'Inter', Helvetica, Arial, sans-serif; }
        a { color: #00A3FF !important; text-decoration: none; }
        p, div, span { color: #f3f4f6; }
        .content p, .content div, .content span { color: #f3f4f6 !important; }
        .content strong { color: #ffffff !important; }
        .content em { color: #cbd5e1 !important; }
    </style>
</head>
<body style="margin: 0; padding: 24px 10px; background-color: #0a0a0a; font-family: 'Inter', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #141414; border: 1px solid #2a2a2a; border-radius: 12px; overflow: hidden;">
        <!-- Header -->
        <tr>
            <td align="center" style="background: linear-gradient(135deg, #00A3FF 0%, #0057FF 100%); padding: 36px 20px; text-align: center;">
                <img src="https://res.cloudinary.com/da1uxchgo/image/upload/v1780398927/syndicate_final_logo_Horizontal_1-01_1_1_esy7xf.png" alt="UN4SEEN SYNDICATE" width="180" style="max-width: 180px; width: 100%; height: auto; display: block; margin: 0 auto; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.3));" />
            </td>
        </tr>
        
        <!-- Content -->
        <tr>
            <td style="padding: 40px 30px; text-align: center; color: #ffffff; font-family: 'Inter', Helvetica, Arial, sans-serif;">
                <h1 style="color: #ffffff !important; font-size: 24px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 20px 0; font-family: 'Inter', Helvetica, Arial, sans-serif;">
                    ${title}
                </h1>
                
                <p style="color: #ffffff !important; font-size: 17px; line-height: 1.5; margin: 0 0 20px 0; font-family: 'Inter', Helvetica, Arial, sans-serif;">
                    Hey <strong style="color: #ffffff !important; font-weight: 700;">${userName}</strong>,
                </p>
                
                <div class="content" style="color: #f3f4f6 !important; font-size: 15px; line-height: 1.7; margin: 0 auto; text-align: center; font-family: 'Inter', Helvetica, Arial, sans-serif;">
                    ${body}
                </div>
                
                ${
                  otpCode
                    ? `
                <div style="margin: 28px auto; text-align: center;">
                    <div style="display: inline-block; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #00A3FF !important; background-color: #1a1a1a; padding: 16px 28px; border: 2px dashed #00A3FF; border-radius: 8px; font-family: monospace;">
                        ${otpCode}
                    </div>
                </div>`
                    : ''
                }
                
                ${
                  buttonText && buttonLink
                    ? `
                <div style="margin: 32px 0 10px 0; text-align: center;">
                    <a href="${buttonLink}" style="display: inline-block; background-color: #00A3FF; color: #ffffff !important; text-decoration: none; padding: 15px 36px; border-radius: 6px; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                        <span style="color: #ffffff !important; font-weight: 700;">${buttonText}</span>
                    </a>
                </div>`
                    : ''
                }
            </td>
        </tr>
        
        <!-- Footer -->
        <tr>
            <td style="padding: 24px 20px; text-align: center; border-top: 1px solid #262626; background-color: #0d0d0d; color: #9ca3af; font-family: 'Inter', Helvetica, Arial, sans-serif;">
                <p style="color: #d1d5db !important; font-size: 12px; line-height: 1.5; margin: 0 0 12px 0;">
                    &copy; ${new Date().getFullYear()} UN4SEEN DECALS. ALL RIGHTS RESERVED.
                </p>
                <div style="font-size: 12px;">
                    <a href="#" style="color: #00A3FF !important; text-decoration: none; font-weight: 600; margin: 0 8px;">INSTAGRAM</a>
                    <span style="color: #6b7280 !important;">|</span>
                    <a href="#" style="color: #00A3FF !important; text-decoration: none; font-weight: 600; margin: 0 8px;">TIKTOK</a>
                    <span style="color: #6b7280 !important;">|</span>
                    <a href="#" style="color: #00A3FF !important; text-decoration: none; font-weight: 600; margin: 0 8px;">FACEBOOK</a>
                </div>
            </td>
        </tr>
    </table>
</body>
</html>
  `;
};