import { query, mutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get settings for a specific type (general, mpesa, email, sms)
 * Falls back to environment variables if no DB record exists
 */
export const get = query({
  args: { type: v.union(v.literal("general"), v.literal("mpesa"), v.literal("email"), v.literal("sms")) },
  handler: async (ctx, args) => {
    const dbSettings = await ctx.db
      .query("settings")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .first();

    // If settings exist in DB, return them
    if (dbSettings) {
      return dbSettings;
    }

    // Otherwise, return defaults from environment variables
    return getDefaultSettings(args.type);
  },
});

/**
 * Get default settings from environment variables
 */
function getDefaultSettings(type: string) {
  switch (type) {
    case "general":
      return {
        type: "general" as const,
        siteName: process.env.SITE_NAME || "",
        siteDescription: process.env.SITE_DESCRIPTION || "",
        contactEmail: process.env.CONTACT_EMAIL || "",
        contactPhone: process.env.CONTACT_PHONE || "",
      };

    case "mpesa":
      return {
        type: "mpesa" as const,
        baseUrl: process.env.MPESA_API_URL || "",
        consumerKey: process.env.MPESA_CONSUMER_KEY || "",
        consumerSecret: process.env.MPESA_CONSUMER_SECRET || "",
        passKey: process.env.MPESA_PASS_KEY || "",
        shortcode: process.env.MPESA_SHORTCODE || "",
        callbackUrl: process.env.MPESA_CALLBACK_URL || "",
      };

    case "email":
      return {
        type: "email" as const,
        resendApiKey: process.env.RESEND_API_KEY || "",
        emailFrom: process.env.EMAIL_FROM || "",
        emailFromName: process.env.EMAIL_FROM_NAME || "",
      };

    case "sms":
      return {
        type: "sms" as const,
        smsApiUrl: process.env.SMS_API_URL || "",
        smsApiKey: process.env.SMS_API_KEY || "",
        smsSenderId: process.env.SMS_SENDER_ID || "",
      };

    default:
      return {};
  }
}

/**
 * Update or create settings
 */
export const update = mutation({
  args: {
    type: v.union(v.literal("general"), v.literal("mpesa"), v.literal("email"), v.literal("sms")),
    settings: v.any(), // Using v.any() for flexibility with different setting types
  },
  handler: async (ctx, { type, settings }) => {
    const existing = await ctx.db
      .query("settings")
      .withIndex("by_type", (q) => q.eq("type", type))
      .first();

    const timestamp = Date.now();

    if (existing) {
      // Update existing settings
      await ctx.db.patch(existing._id, { 
        ...settings, 
        type,
        updatedAt: timestamp 
      });
      return { success: true, message: "Settings updated successfully" };
    } else {
      // Create new settings record
      await ctx.db.insert("settings", { 
        type, 
        ...settings, 
        updatedAt: timestamp 
      });
      return { success: true, message: "Settings created successfully" };
    }
  },
});

/**
 * Reset settings to environment variable defaults
 */
export const resetToDefaults = mutation({
  args: { 
    type: v.union(v.literal("general"), v.literal("mpesa"), v.literal("email"), v.literal("sms")) 
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("settings")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }

    return { 
      success: true, 
      message: "Settings reset to environment defaults",
      defaults: getDefaultSettings(args.type)
    };
  },
});

/**
 * Get all settings at once
 */
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const general = await ctx.db
      .query("settings")
      .withIndex("by_type", (q) => q.eq("type", "general"))
      .first();
    
    const mpesa = await ctx.db
      .query("settings")
      .withIndex("by_type", (q) => q.eq("type", "mpesa"))
      .first();
    
    const email = await ctx.db
      .query("settings")
      .withIndex("by_type", (q) => q.eq("type", "email"))
      .first();
    
    const sms = await ctx.db
      .query("settings")
      .withIndex("by_type", (q) => q.eq("type", "sms"))
      .first();

    return {
      general: general || getDefaultSettings("general"),
      mpesa: mpesa || getDefaultSettings("mpesa"),
      email: email || getDefaultSettings("email"),
      sms: sms || getDefaultSettings("sms"),
    };
  },
}); 

/**
 * Internal query for M-Pesa to access settings
 */
export const getInternal = internalQuery({
  args: { type: v.string() },
  handler: async (ctx, args) => {
    const dbSettings = await ctx.db
      .query("settings")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .first();

    // If settings exist in DB, return them
    if (dbSettings) {
      return dbSettings;
    }

    // Otherwise, return defaults from environment variables
    return getDefaultSettings(args.type);
  },
});