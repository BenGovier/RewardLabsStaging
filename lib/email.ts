import nodemailer from "nodemailer"

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number.parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    })
    return true
  } catch (error) {
    console.error("Error sending email:", error)
    return false
  }
}

export function generatePasswordResetEmail(firstName: string, lastName: string, resetToken: string): string {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`

  return `
   <!DOCTYPE html>
   <html>
   <head>
       <meta charset="utf-8">
       <title>Password Reset - Raffily RepPortal</title>
   </head>
   <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
       <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
           <h1 style="color: #2563eb;">Password Reset Request</h1>
           
           <p>Hello ${firstName} ${lastName},</p>
           
           <p>We received a request to reset your password for your Raffily RepPortal account. If you didn't make this request, you can safely ignore this email.</p>
           
           <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
               <p style="margin: 0;"><strong>To reset your password, click the button below:</strong></p>
           </div>
           
           <div style="text-align: center; margin: 30px 0;">
               <a href="${resetUrl}" 
                  style="background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                   Reset My Password
               </a>
           </div>
           
           <p><strong>Important Security Information:</strong></p>
           <ul>
               <li>This link will expire in 30 minutes</li>
               <li>The link can only be used once</li>
               <li>If you didn't request this reset, please contact your administrator</li>
           </ul>
           
           <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
           <p style="word-break: break-all; background-color: #f9f9f9; padding: 10px; border-radius: 4px; font-family: monospace;">
               ${resetUrl}
           </p>
           
           <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
           <p style="font-size: 14px; color: #6b7280;">
               This email was sent from Raffily RepPortal. Please do not reply to this email.
               <br>If you need assistance, please contact your system administrator.
           </p>
       </div>
   </body>
   </html>
 `
}

export function generateInvitationEmail(firstName: string, lastName: string, tempPassword: string): string {
  return `
   <!DOCTYPE html>
   <html>
   <head>
       <meta charset="utf-8">
       <title>Welcome to Raffily RepPortal</title>
   </head>
   <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
       <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
           <h1 style="color: #2563eb;">Welcome to Raffily RepPortal!</h1>
           
           <p>Hello ${firstName} ${lastName},</p>
           
           <p>You've been invited to join the Raffily RepPortal as a representative. Your account has been created and you can now access the platform.</p>
           
           <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
               <h3 style="margin-top: 0;">Your Login Credentials:</h3>
               <p><strong>Temporary Password:</strong> <code style="background-color: #e5e7eb; padding: 2px 4px; border-radius: 4px;">${tempPassword}</code></p>
           </div>
           
           <p><strong>Important:</strong> Please change your password after your first login for security purposes.</p>
           
           <p>
               <a href="${process.env.NEXTAUTH_URL}/auth/signin" 
                  style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                   Login to RepPortal
               </a>
           </p>
           
           <p>If you have any questions, please contact your administrator.</p>
           
           <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
           <p style="font-size: 14px; color: #6b7280;">
               This email was sent from Raffily RepPortal. Please do not reply to this email.
           </p>
       </div>
   </body>
   </html>
 `
}

export function generateEmailChangeNotification(firstName: string, lastName: string, newEmail: string): string {
  return `
   <!DOCTYPE html>
   <html>
   <head>
       <meta charset="utf-8">
       <title>Email Address Updated</title>
   </head>
   <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
       <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
           <h1 style="color: #2563eb;">Email Address Updated</h1>
           
           <p>Hello ${firstName} ${lastName},</p>
           
           <p>Your email address has been updated in the Raffily RepPortal system.</p>
           
           <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
               <p><strong>New Email Address:</strong> ${newEmail}</p>
           </div>
           
           <p>If you did not request this change, please contact your administrator immediately.</p>
           
           <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
           <p style="font-size: 14px; color: #6b7280;">
               This email was sent from Raffily RepPortal. Please do not reply to this email.
           </p>
       </div>
   </body>
   </html>
 `
}

export function generateRaffleEntryConfirmationEmail(
  firstName: string,
  lastName: string,
  raffleTitle: string,
  ticketNumber: string,
  drawDate: string,
  businessName: string,
  businessLogo?: string,
  primaryColor?: string,
): string {
  const color = primaryColor || "#2563eb"
  const lightColor = `${color}20` // 20% opacity for light backgrounds

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Entry Confirmed - ${raffleTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Business Branded Header -->
            <div style="background: linear-gradient(135deg, ${color} 0%, ${color}dd 100%); padding: 40px 20px; text-align: center; position: relative; overflow: hidden;">
                <!-- Decorative elements -->
                <div style="position: absolute; top: -50px; right: -50px; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%; opacity: 0.5;"></div>
                <div style="position: absolute; bottom: -30px; left: -30px; width: 60px; height: 60px; background: rgba(255,255,255,0.1); border-radius: 50%; opacity: 0.3;"></div>
                
                ${
                  businessLogo
                    ? `
                    <div style="margin-bottom: 20px;">
                        <img src="${businessLogo}" alt="${businessName}" style="max-height: 80px; max-width: 200px; height: auto; width: auto; filter: brightness(0) invert(1);" />
                    </div>
                `
                    : `
                    <div style="background: rgba(255,255,255,0.2); display: inline-block; padding: 15px 25px; border-radius: 50px; margin-bottom: 20px;">
                        <span style="color: white; font-size: 24px; font-weight: bold;">${businessName.charAt(0)}</span>
                    </div>
                `
                }
                
                <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">🎉 You're In!</h1>
                <p style="color: rgba(255,255,255,0.95); margin: 10px 0 0 0; font-size: 18px; font-weight: 500;">Entry confirmed for ${businessName}</p>
            </div>
            
            <!-- Main Content -->
            <div style="padding: 40px 30px;">
                <div style="text-align: center; margin-bottom: 35px;">
                    <p style="font-size: 20px; margin: 0 0 10px 0; color: #1f2937;">Hello ${firstName} ${lastName},</p>
                    <p style="font-size: 16px; margin: 0; color: #6b7280;">Your entry has been successfully confirmed!</p>
                </div>
                
                <!-- Raffle Details Card -->
                <div style="background: linear-gradient(135deg, ${lightColor} 0%, ${lightColor}40 100%); border: 2px solid ${color}; border-radius: 16px; padding: 30px; text-align: center; margin: 30px 0; position: relative; overflow: hidden;">
                    <!-- Decorative corner -->
                    <div style="position: absolute; top: 0; right: 0; width: 0; height: 0; border-left: 40px solid transparent; border-top: 40px solid ${color}; opacity: 0.1;"></div>
                    
                    <div style="font-size: 48px; margin-bottom: 15px;">🎫</div>
                    <h2 style="color: ${color}; margin: 0 0 15px 0; font-size: 28px; font-weight: 700;">${raffleTitle}</h2>
                    <div style="background: white; border-radius: 12px; padding: 20px; margin: 20px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Your Ticket Number</p>
                        <p style="font-size: 36px; font-weight: 800; color: ${color}; margin: 0; letter-spacing: 3px; font-family: 'Courier New', monospace;">${ticketNumber}</p>
                    </div>
                </div>
                
                <!-- Key Information -->
                <div style="background: #f8fafc; border-left: 4px solid ${color}; border-radius: 0 8px 8px 0; padding: 25px; margin: 30px 0;">
                    <h3 style="color: ${color}; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">📅 Important Details</h3>
                    <div style="display: grid; gap: 12px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                            <span style="color: #6b7280; font-weight: 500;">Draw Date:</span>
                            <span style="color: #1f2937; font-weight: 600;">${drawDate}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                            <span style="color: #6b7280; font-weight: 500;">Hosted by:</span>
                            <span style="color: #1f2937; font-weight: 600;">${businessName}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;">
                            <span style="color: #6b7280; font-weight: 500;">Your Ticket:</span>
                            <span style="color: ${color}; font-weight: 700;">#${ticketNumber}</span>
                        </div>
                    </div>
                </div>
                
                <!-- What's Next Section -->
                <div style="margin: 35px 0;">
                    <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">What happens next?</h3>
                    <div style="space-y: 15px;">
                        <div style="display: flex; align-items: flex-start; gap: 15px; margin-bottom: 15px;">
                            <div style="background: ${color}; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; flex-shrink: 0; margin-top: 2px;">1</div>
                            <div>
                                <p style="margin: 0; color: #1f2937; font-weight: 500;">Keep this email safe</p>
                                <p style="margin: 2px 0 0 0; color: #6b7280; font-size: 14px;">This is your proof of entry and contains your unique ticket number</p>
                            </div>
                        </div>
                        <div style="display: flex; align-items: flex-start; gap: 15px; margin-bottom: 15px;">
                            <div style="background: ${color}; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; flex-shrink: 0; margin-top: 2px;">2</div>
                            <div>
                                <p style="margin: 0; color: #1f2937; font-weight: 500;">Winners announced after ${drawDate}</p>
                                <p style="margin: 2px 0 0 0; color: #6b7280; font-size: 14px;">We'll contact you directly if you're selected as a winner</p>
                            </div>
                        </div>
                        <div style="display: flex; align-items: flex-start; gap: 15px;">
                            <div style="background: ${color}; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; flex-shrink: 0; margin-top: 2px;">3</div>
                            <div>
                                <p style="margin: 0; color: #1f2937; font-weight: 500;">Stay connected with ${businessName}</p>
                                <p style="margin: 2px 0 0 0; color: #6b7280; font-size: 14px;">Follow us for updates and future opportunities</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Good Luck Section -->
                <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border: 1px solid #a7f3d0; border-radius: 12px; padding: 25px; text-align: center; margin: 35px 0;">
                    <div style="font-size: 32px; margin-bottom: 10px;">🍀</div>
                    <h3 style="color: #065f46; margin: 0 0 8px 0; font-size: 20px; font-weight: 600;">Good Luck!</h3>
                    <p style="color: #047857; margin: 0; font-size: 16px;">Thank you for entering ${raffleTitle}. We wish you the best of luck!</p>
                </div>
            </div>
            
            <!-- Business Footer -->
            <div style="background: linear-gradient(135deg, ${color} 0%, ${color}dd 100%); padding: 30px 20px; text-align: center;">
                ${
                  businessLogo
                    ? `
                    <img src="${businessLogo}" alt="${businessName}" style="max-height: 40px; margin-bottom: 15px; filter: brightness(0) invert(1); opacity: 0.9;" />
                `
                    : ""
                }
                <p style="color: rgba(255,255,255,0.95); margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${businessName}</p>
                <p style="color: rgba(255,255,255,0.8); margin: 0; font-size: 14px;">Thank you for participating in our giveaway!</p>
            </div>
            
            <!-- System Footer -->
            <div style="background: #f1f5f9; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="font-size: 12px; color: #64748b; margin: 0; line-height: 1.5;">
                    This confirmation email was sent by ${businessName} via Raffily RepPortal.
                    <br>Please keep this email for your records. Do not reply to this email.
                </p>
            </div>
        </div>
    </body>
    </html>
  `
}

// NEW: Business Welcome Email Template
export function generateBusinessWelcomeEmail(
  firstName: string,
  lastName: string,
  businessName: string,
  planName: string,
  monthlyAmount: number,
  referringRepName?: string,
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Welcome to Raffily - Let's Get Started!</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">🎉 Welcome to Raffily!</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 18px;">Your giveaway platform is ready to go!</p>
            </div>
            
            <!-- Main content -->
            <div style="padding: 40px 20px;">
                <p style="font-size: 18px; margin-bottom: 20px;">Hello ${firstName},</p>
                
                <p style="font-size: 16px; margin-bottom: 30px;">
                    Congratulations! Your ${businessName} account has been successfully set up and your payment has been processed. 
                    You're now ready to start creating amazing giveaways that will grow your business!
                </p>
                
                <!-- Account Details -->
                <div style="background-color: #f8f9fa; border-radius: 12px; padding: 30px; margin: 30px 0;">
                    <h2 style="color: #2563eb; margin: 0 0 20px 0; font-size: 24px;">📋 Your Account Details</h2>
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        <p style="margin: 0;"><strong>Business:</strong> ${businessName}</p>
                        <p style="margin: 0;"><strong>Plan:</strong> ${planName}</p>
                        <p style="margin: 0;"><strong>Monthly Investment:</strong> £${monthlyAmount.toFixed(2)}</p>
                        ${referringRepName ? `<p style="margin: 0;"><strong>Your Rep:</strong> ${referringRepName}</p>` : ""}
                    </div>
                </div>
                
                <!-- Quick Start Guide -->
                <div style="margin: 30px 0;">
                    <h2 style="color: #2563eb; margin: 0 0 20px 0;">🚀 Quick Start Guide</h2>
                    <div style="background-color: #fff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                        <div style="padding: 20px; border-bottom: 1px solid #e5e7eb;">
                            <div style="display: flex; align-items: center; gap: 15px;">
                                <div style="background-color: #2563eb; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">1</div>
                                <div>
                                    <h3 style="margin: 0; color: #1f2937;">Set Up Your First Giveaway</h3>
                                    <p style="margin: 5px 0 0 0; color: #6b7280;">Create your branded giveaway in under 5 minutes</p>
                                </div>
                            </div>
                        </div>
                        <div style="padding: 20px; border-bottom: 1px solid #e5e7eb;">
                            <div style="display: flex; align-items: center; gap: 15px;">
                                <div style="background-color: #2563eb; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">2</div>
                                <div>
                                    <h3 style="margin: 0; color: #1f2937;">Customize Your Branding</h3>
                                    <p style="margin: 5px 0 0 0; color: #6b7280;">Add your logo, colors, and messaging</p>
                                </div>
                            </div>
                        </div>
                        <div style="padding: 20px;">
                            <div style="display: flex; align-items: center; gap: 15px;">
                                <div style="background-color: #2563eb; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">3</div>
                                <div>
                                    <h3 style="margin: 0; color: #1f2937;">Launch & Promote</h3>
                                    <p style="margin: 5px 0 0 0; color: #6b7280;">Share your giveaway and watch the entries roll in!</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- CTA Button -->
                <div style="text-align: center; margin: 40px 0;">
                    <a href="${process.env.NEXTAUTH_URL}/business/dashboard" 
                       style="background-color: #2563eb; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
                        Access Your Dashboard
                    </a>
                </div>
                
                <!-- What to Expect -->
                <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; margin: 30px 0;">
                    <h3 style="color: #065f46; margin-top: 0;">💡 What to Expect</h3>
                    <ul style="color: #065f46; margin: 0; padding-left: 20px;">
                        <li>247+ new email subscribers per campaign (on average)</li>
                        <li>89% email open rates vs 21% industry average</li>
                        <li>3x more social shares than standard promotions</li>
                        <li>Complete customer data capture with marketing consent</li>
                    </ul>
                </div>
                
                <!-- Support -->
                <div style="margin: 30px 0;">
                    <h3 style="color: #2563eb;">🤝 Need Help?</h3>
                    <p style="margin: 0;">
                        ${
                          referringRepName
                            ? `Your dedicated rep ${referringRepName} is here to help you succeed. They'll be in touch soon to ensure you get the most out of your Raffily platform.`
                            : `Our support team is here to help you succeed. If you have any questions, don't hesitate to reach out.`
                        }
                    </p>
                </div>
                
                <!-- Footer message -->
                <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
                    <p style="font-size: 16px; color: #1f2937; margin: 0;">
                        Welcome to the Raffily family! 🎊
                    </p>
                    <p style="font-size: 14px; color: #6b7280; margin: 10px 0 0 0;">
                        We're excited to see what amazing giveaways you'll create.
                    </p>
                </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="font-size: 12px; color: #6b7280; margin: 0;">
                    This email was sent from Raffily RepPortal.
                    <br>If you need assistance, please contact your representative or our support team.
                </p>
            </div>
        </div>
    </body>
    </html>
  `
}

// Winner notification e-mail
export function generateWinnerNotificationEmail(
  winnerFirstName: string,
  winnerLastName: string,
  raffleTitle: string,
  ticketNumber: string,
  prizeDescription: string,
  businessName: string,
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Congratulations – You&#39;ve Won ${raffleTitle}!</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height:1.6; color:#333; margin:0; padding:0;">
        <div style="max-width:600px; margin:0 auto; background:#ffffff;">
          <div style="background:#22c55e; padding:40px 20px; text-align:center;">
            <h1 style="color:#ffffff; margin:0; font-size:32px;">🎉 Congratulations!</h1>
            <p style="color:#f0fdf4; margin:0; font-size:18px;">You&rsquo;re a winner!</p>
          </div>

          <div style="padding:40px 30px;">
            <p style="font-size:18px;">Hello ${winnerFirstName} ${winnerLastName},</p>
            <p style="font-size:16px;">
              We&#39;re thrilled to let you know that your ticket <strong>#${ticketNumber}</strong>
              has been selected as a winner for <strong>${raffleTitle}</strong>.
            </p>

            <div style="background:#f8fafc; border-left:4px solid #22c55e; padding:20px; margin:30px 0;">
              <h2 style="margin:0 0 10px 0; color:#16a34a;">Your Prize</h2>
              <p style="margin:0;">${prizeDescription}</p>
            </div>

            <p style="font-size:16px;">A representative from <strong>${businessName}</strong> will contact you soon with the next steps.</p>

            <p style="font-size:16px; margin:30px 0 0 0;">Thank you for taking part and congratulations once again!</p>
          </div>

          <div style="background:#f1f5f9; padding:20px; text-align:center;">
            <p style="font-size:12px; color:#64748b; margin:0;">
              This email was sent by ${businessName} via Raffily RepPortal.
            </p>
          </div>
        </div>
      </body>
    </html>
  `
}
