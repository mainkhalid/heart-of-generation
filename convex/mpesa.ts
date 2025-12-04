import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";


function formatPhoneNumber(phone: string) {
  let formatted = phone.replace(/\s+|-|\(|\)|\.|\+/g, "");
  if (formatted.startsWith("0")) formatted = `254${formatted.substring(1)}`;
  if (!formatted.startsWith("254")) formatted = `254${formatted}`;
  return formatted;
}

function getTimestamp(): string {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}${String(now.getDate()).padStart(2, "0")}${String(now.getHours()).padStart(
    2,
    "0"
  )}${String(now.getMinutes()).padStart(2, "0")}${String(
    now.getSeconds()
  ).padStart(2, "0")}`;
}

function generatePassword(
  shortcode: string,
  passKey: string,
  timestamp: string
) {
  return btoa(`${shortcode}${passKey}${timestamp}`);
}


async function getSettings(ctx: any) {
  const settings = await ctx.runQuery(internal.settings.get, { type: "mpesa" });
 
  const getValue = (settingsKey: string, envKey: string) => {
    const dbValue = settings?.[settingsKey];
    if (dbValue) return dbValue;
    
    const envValue = ctx.env[envKey];
    if (!envValue) {
      throw new Error(`Missing configuration: ${settingsKey} (env: ${envKey})`);
    }
    return envValue;
  };

  return {
    baseUrl: getValue("baseUrl", "MPESA_API_URL"),
    consumerKey: getValue("consumerKey", "MPESA_CONSUMER_KEY"),
    consumerSecret: getValue("consumerSecret", "MPESA_CONSUMER_SECRET"),
    shortcode: getValue("shortcode", "MPESA_SHORTCODE"),
    passKey: getValue("passKey", "MPESA_PASSKEY"),
    callbackUrl: getValue("callbackUrl", "MPESA_CALLBACK_URL"),
  };
}

export const getAccessToken = internalAction({
  handler: async (ctx): Promise<string> => {
    const config = await getSettings(ctx);
    const auth = btoa(`${config.consumerKey}:${config.consumerSecret}`);

    const response = await fetch(
      `${config.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: { Authorization: `Basic ${auth}` },
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `Failed to get access token: ${
          error.errorMessage || response.statusText
        }`
      );
    }

    const data = await response.json();
    return data.access_token;
  },
});

export const initiateSTKPush = action({
  args: {
    phone: v.string(),
    amount: v.number(),
    reference: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const token = await ctx.runAction(internal.mpesa.getAccessToken);
    const config = await getSettings(ctx);

    const timestamp = getTimestamp();
    const password = generatePassword(config.shortcode, config.passKey, timestamp);
    const formattedPhone = formatPhoneNumber(args.phone);
    const paymentAmount = Math.round(args.amount);

    const requestData = {
      BusinessShortCode: config.shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: paymentAmount,
      PartyA: formattedPhone,
      PartyB: config.shortcode,
      PhoneNumber: formattedPhone,
      CallBackURL: config.callbackUrl,
      AccountReference: args.reference || "HrtFdn",
      TransactionDesc: args.description || "Donation to Heart of Generation Foundation",
    };

    const response = await fetch(`${config.baseUrl}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `STK Push failed: ${error.errorMessage || response.statusText}`
      );
    }

    const data = await response.json();

    await ctx.runMutation(internal.mpesaInternal.createDonationRecord, {
      userId: identity.subject,
      amount: paymentAmount,
      phone: formattedPhone,
      checkoutRequestId: data.CheckoutRequestID,
      merchantRequestId: data.MerchantRequestID,
    });

    return data;
  },
});

export const checkSTKStatus = action({
  args: { checkoutRequestId: v.string() },
  handler: async (ctx, args) => {
    const token = await ctx.runAction(internal.mpesa.getAccessToken);
    const config = await getSettings(ctx);

    const timestamp = getTimestamp();
    const password = generatePassword(config.shortcode, config.passKey, timestamp);

    const requestData = {
      BusinessShortCode: config.shortcode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: args.checkoutRequestId,
    };

    const response = await fetch(`${config.baseUrl}/mpesa/stkpushquery/v1/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `Status check failed: ${error.errorMessage || response.statusText}`
      );
    }

    return await response.json();
  },
});

export const testConnection = action({
  handler: async (
    ctx
  ): Promise<{ success: boolean; message: string; token?: string }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    try {
      const token = await ctx.runAction(internal.mpesa.getAccessToken);
      return {
        success: true,
        message: "M-Pesa connection successful",
        token: token.slice(0, 10) + "...",
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Connection failed",
      };
    }
  },
});