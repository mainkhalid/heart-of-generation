import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { Resend } from "resend";

/**
 * Get email configuration from settings or environment variables
 */
async function getEmailConfig(ctx: any) {
  const emailSettings = await ctx.runQuery(api.settings.get, { type: "email" });
  
  const apiKey = emailSettings?.resendApiKey || process.env.RESEND_API_KEY;
  const fromEmail = emailSettings?.emailFrom || process.env.EMAIL_FROM;
  const fromName = emailSettings?.emailFromName || process.env.EMAIL_FROM_NAME || "Imani Foundation";
  
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  
  if (!fromEmail) {
    throw new Error("EMAIL_FROM is not configured");
  }
  
  return {
    apiKey,
    from: `${fromName} <${fromEmail}>`,
  };
}

/**
 * Send contact form email to admin
 */
export const sendContactFormEmail = action({
  args: {
    adminEmail: v.string(),
    formData: v.object({
      name: v.string(),
      email: v.string(),
      phone: v.optional(v.string()),
      subject: v.string(),
      message: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    try {
      const config = await getEmailConfig(ctx);
      const resend = new Resend(config.apiKey);
      const { formData } = args;

      const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #e86225; border-bottom: 3px solid #e86225; padding-bottom: 10px;">
            📧 New Contact Form Submission
          </h2>
          
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">Name:</td>
                <td style="padding: 8px 0;">${formData.name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">Email:</td>
                <td style="padding: 8px 0;">
                  <a href="mailto:${formData.email}" style="color: #e86225; text-decoration: none;">
                    ${formData.email}
                  </a>
                </td>
              </tr>
              ${formData.phone ? `
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">Phone:</td>
                <td style="padding: 8px 0;">
                  <a href="tel:${formData.phone}" style="color: #e86225; text-decoration: none;">
                    ${formData.phone}
                  </a>
                </td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">Subject:</td>
                <td style="padding: 8px 0;"><strong>${formData.subject}</strong></td>
              </tr>
            </table>
          </div>

          <div style="background-color: #fff; padding: 20px; border-left: 4px solid #e86225; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Message:</h3>
            <p style="color: #4b5563; line-height: 1.6; white-space: pre-wrap;">${formData.message}</p>
          </div>
          
          <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #9ca3af; font-size: 12px;">
            Received at: ${new Date().toLocaleString()}<br>
            Reply directly to this email to respond to ${formData.name}.
          </p>
        </div>
      `;

      const { data, error } = await resend.emails.send({
        from: config.from,
        to: "main.khalid051@gmail.com", // ✅ Hardcoded for testing
        // to: args.adminEmail, // Original line
        replyTo: formData.email,
        subject: `Contact Form: ${formData.subject}`,
        html,
      });


      if (error) {
        console.error("Resend error:", error);
        return { 
          success: false, 
          error: error.message 
        };
      }

      return { 
        success: true, 
        emailId: data?.id,
        message: "Contact form email sent successfully!" 
      };
    } catch (error: any) {
      console.error("Contact form email error:", error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  },
});

/**
 * Send auto-reply to contact form submitter
 */
export const sendContactFormAutoReply = action({
  args: {
    to: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const config = await getEmailConfig(ctx);
      const resend = new Resend(config.apiKey);

      const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #e86225;">Thank You for Contacting Us! 🙏</h1>
          
          <p>Dear ${args.name},</p>
          
          <p>Thank you for reaching out to Imani Foundation. We have received your message and appreciate you taking the time to contact us.</p>
          
          <div style="background-color: #fff7ed; padding: 20px; border-left: 4px solid #e86225; margin: 20px 0;">
            <p style="margin: 0; color: #9a3412;">
              <strong>What happens next?</strong><br><br>
              Our team will review your message and get back to you within 1-2 business days. 
              If your inquiry is urgent, please feel free to call us directly.
            </p>
          </div>
          
          <p>In the meantime, feel free to explore our website to learn more about our mission and the work we do in the community.</p>
          
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">Contact Information</h3>
            <p style="margin: 5px 0; color: #6b7280;">
              📧 Email: contact@imanifdn.org<br>
              📞 Phone: +254 700 000 000<br>
              📍 Location: Nairobi, Kenya
            </p>
            <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 14px;">
              <strong>Office Hours:</strong><br>
              Monday - Friday: 9:00 AM - 5:00 PM<br>
              Saturday: 10:00 AM - 2:00 PM<br>
              Sunday: Closed
            </p>
          </div>
          
          <p style="color: #6b7280;">
            Best regards,<br>
            <strong style="color: #e86225;">The Imani Foundation Team</strong>
          </p>
          
          <hr style="border: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            This is an automated response. Please do not reply to this email.<br>
            If you need immediate assistance, please contact us directly.
          </p>
        </div>
      `;

      const { data, error } = await resend.emails.send({
        from: config.from,
        to: args.to,
        subject: "Thank You for Contacting Imani Foundation",
        html,
      });

      if (error) {
        console.error("Resend error:", error);
        return { 
          success: false, 
          error: error.message 
        };
      }

      return { 
        success: true, 
        emailId: data?.id 
      };
    } catch (error: any) {
      console.error("Auto-reply email error:", error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  },
});

/**
 * Send test email to verify configuration
 */
export const sendTestEmail = action({
  args: {
    to: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const config = await getEmailConfig(ctx);
      const resend = new Resend(config.apiKey);

      const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #e86225;">✅ Email Configuration Test</h2>
          <p>This is a test email from Imani Foundation.</p>
          <p>If you're reading this, your email configuration is working correctly!</p>
          <hr style="margin: 20px 0; border: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            Sent at: ${new Date().toLocaleString()}
          </p>
        </div>
      `;

      const { data, error } = await resend.emails.send({
        from: config.from,
        to: args.to,
        subject: "✅ Email Configuration Test - Imani Foundation",
        html,
      });

      if (error) {
        console.error("Resend error:", error);
        return { 
          success: false, 
          error: error.message 
        };
      }

      return { 
        success: true, 
        emailId: data?.id,
        message: "Test email sent successfully!" 
      };
    } catch (error: any) {
      console.error("Email error:", error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  },
});

/**
 * Send donation notification to admin
 */
export const sendDonationNotification = action({
  args: { 
    adminEmail: v.string(),
    donation: v.object({
      amount: v.number(),
      donorName: v.optional(v.string()),
      phone: v.string(),
      mpesaReceiptNumber: v.optional(v.string()),
      anonymous: v.boolean(),
    }),
  },
  handler: async (ctx, args) => {
    try {
      const config = await getEmailConfig(ctx);
      const resend = new Resend(config.apiKey);
      const { donation } = args;

      const displayName = donation.anonymous ? "Anonymous" : (donation.donorName || "Anonymous");

      const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #e86225; border-bottom: 3px solid #e86225; padding-bottom: 10px;">
            🎉 New Donation Received
          </h2>
          
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666;">Amount:</td>
                <td style="padding: 8px 0;"><strong style="font-size: 18px; color: #e86225;">KES ${donation.amount.toLocaleString()}</strong></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Donor:</td>
                <td style="padding: 8px 0;"><strong>${displayName}</strong></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Phone:</td>
                <td style="padding: 8px 0;">${donation.phone}</td>
              </tr>
              ${donation.mpesaReceiptNumber ? `
              <tr>
                <td style="padding: 8px 0; color: #666;">M-Pesa Receipt:</td>
                <td style="padding: 8px 0;"><strong>${donation.mpesaReceiptNumber}</strong></td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px 0; color: #666;">Date:</td>
                <td style="padding: 8px 0;">${new Date().toLocaleString()}</td>
              </tr>
            </table>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 20px;">
            This is an automated notification from your donation system.
          </p>
        </div>
      `;

      const { data, error } = await resend.emails.send({
        from: config.from,
        to: args.adminEmail,
        subject: `New Donation: KES ${donation.amount.toLocaleString()} from ${displayName}`,
        html,
      });

      if (error) {
        console.error("Resend error:", error);
        return { success: false, error: error.message };
      }

      return { success: true, emailId: data?.id };
    } catch (error: any) {
      console.error("Email error:", error);
      return { success: false, error: error.message };
    }
  },
});

/**
 * Send donation receipt to donor
 */
export const sendDonationReceipt = action({
  args: {
    to: v.string(),
    donation: v.object({
      amount: v.number(),
      donorName: v.string(),
      receiptNumber: v.string(),
      mpesaReceiptNumber: v.optional(v.string()),
      date: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    try {
      const config = await getEmailConfig(ctx);
      const resend = new Resend(config.apiKey);
      const { donation } = args;

      const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #e86225;">Thank You for Your Donation! 🙏</h1>
          <p>Dear ${donation.donorName},</p>
          <p>We have received your generous donation of <strong style="color: #e86225; font-size: 18px;">KES ${donation.amount.toLocaleString()}</strong>.</p>
          
          <div style="background-color: #fff7ed; padding: 20px; border-left: 4px solid #e86225; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #e86225;">Receipt Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666;">Receipt Number:</td>
                <td style="padding: 8px 0; font-weight: bold;">${donation.receiptNumber}</td>
              </tr>
              ${donation.mpesaReceiptNumber ? `
              <tr>
                <td style="padding: 8px 0; color: #666;">M-Pesa Receipt:</td>
                <td style="padding: 8px 0; font-weight: bold;">${donation.mpesaReceiptNumber}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px 0; color: #666;">Amount:</td>
                <td style="padding: 8px 0; font-weight: bold;">KES ${donation.amount.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Date:</td>
                <td style="padding: 8px 0; font-weight: bold;">${donation.date}</td>
              </tr>
            </table>
          </div>
          
          <p>Your contribution helps us continue our mission to empower communities and support children in need.</p>
          <p>This email serves as your official receipt for tax purposes.</p>
          
          <hr style="border: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #6b7280; font-size: 14px; text-align: center;">
            <strong>Imani Foundation</strong><br>
            Empowering communities through charitable initiatives<br>
            Email: contact@imanifdn.org | Phone: +254700000000
          </p>
        </div>
      `;

      const { data, error } = await resend.emails.send({
        from: config.from,
        to: args.to,
        subject: `Donation Receipt - ${donation.receiptNumber}`,
        html,
      });

      if (error) {
        console.error("Resend error:", error);
        return { success: false, error: error.message };
      }

      return { success: true, emailId: data?.id };
    } catch (error: any) {
      console.error("Email error:", error);
      return { success: false, error: error.message };
    }
  },
});

/**
 * Send monthly donation report to admin
 */
export const sendMonthlyReport = action({
  args: { 
    to: v.string(),
    reportData: v.object({
      monthName: v.string(),
      year: v.number(),
      totalDonations: v.number(),
      totalAmount: v.number(),
      donations: v.array(v.object({
        amount: v.number(),
        donorName: v.optional(v.string()),
        anonymous: v.boolean(),
        createdAt: v.number(),
      })),
    }),
  },
  handler: async (ctx, args) => {
    try {
      const config = await getEmailConfig(ctx);
      const resend = new Resend(config.apiKey);
      const { reportData } = args;

      const donationsList = reportData.donations
        .map((d) => {
          const displayName = d.anonymous ? "Anonymous" : (d.donorName || "Anonymous");
          return `
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px 8px;">${new Date(d.createdAt).toLocaleDateString()}</td>
              <td style="padding: 12px 8px;">${displayName}</td>
              <td style="padding: 12px 8px; text-align: right; font-weight: bold;">KES ${d.amount.toLocaleString()}</td>
            </tr>
          `;
        })
        .join("");

      const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto;">
          <h1 style="color: #e86225; border-bottom: 3px solid #e86225; padding-bottom: 10px;">
            📊 Monthly Donation Report
          </h1>
          <h2 style="color: #666;">${reportData.monthName} ${reportData.year}</h2>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0;">
            <div style="background-color: #fff7ed; padding: 20px; border-radius: 8px; text-align: center;">
              <p style="margin: 0; color: #666; font-size: 14px;">Total Donations</p>
              <p style="margin: 10px 0 0 0; font-size: 32px; font-weight: bold; color: #e86225;">${reportData.totalDonations}</p>
            </div>
            <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; text-align: center;">
              <p style="margin: 0; color: #666; font-size: 14px;">Total Amount</p>
              <p style="margin: 10px 0 0 0; font-size: 32px; font-weight: bold; color: #16a34a;">KES ${reportData.totalAmount.toLocaleString()}</p>
            </div>
          </div>
          
          <h3 style="color: #374151; margin-top: 40px;">Donation Details</h3>
          <table style="width: 100%; border-collapse: collapse; background-color: white; border: 1px solid #e5e7eb;">
            <thead>
              <tr style="background-color: #f9fafb;">
                <th style="padding: 12px 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">Date</th>
                <th style="padding: 12px 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">Donor</th>
                <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #e5e7eb;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${donationsList}
            </tbody>
          </table>
          
          <hr style="border: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #6b7280; font-size: 12px; text-align: center;">
            This is an automated report generated by Imani Foundation donation system.
          </p>
        </div>
      `;

      const { data, error } = await resend.emails.send({
        from: config.from,
        to: args.to,
        subject: `Monthly Donation Report - ${reportData.monthName} ${reportData.year}`,
        html,
      });

      if (error) {
        console.error("Resend error:", error);
        return { success: false, error: error.message };
      }

      return { success: true, emailId: data?.id };
    } catch (error: any) {
      console.error("Email error:", error);
      return { success: false, error: error.message };
    }
  },
});

/**
 * Send visitation notification
 */
export const sendVisitationNotification = action({
  args: {
    to: v.string(),
    visitation: v.object({
      homeName: v.string(),
      visitDate: v.string(),
      numberOfChildren: v.number(),
      budget: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    try {
      const config = await getEmailConfig(ctx);
      const resend = new Resend(config.apiKey);
      const { visitation } = args;

      const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #e86225;">🏠 New Visitation Scheduled</h1>
          
          <div style="background-color: #fff7ed; padding: 20px; border-left: 4px solid #e86225; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #e86225;">Visitation Details</h3>
            <p><strong>Children's Home:</strong> ${visitation.homeName}</p>
            <p><strong>Visit Date:</strong> ${visitation.visitDate}</p>
            <p><strong>Number of Children:</strong> ${visitation.numberOfChildren}</p>
            <p><strong>Budget:</strong> KES ${visitation.budget.toLocaleString()}</p>
          </div>
          
          <p>Please ensure all preparations are complete before the visit date.</p>
          
          <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 14px;">
            Imani Foundation<br>
            Making a difference, one visit at a time
          </p>
        </div>
      `;

      const { data, error } = await resend.emails.send({
        from: config.from,
        to: args.to,
        subject: `Upcoming Visitation - ${visitation.homeName}`,
        html,
      });

      if (error) {
        console.error("Resend error:", error);
        return { success: false, error: error.message };
      }

      return { success: true, emailId: data?.id };
    } catch (error: any) {
      console.error("Email error:", error);
      return { success: false, error: error.message };
    }
  },
});