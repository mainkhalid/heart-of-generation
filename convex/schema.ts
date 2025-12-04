import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ⚙️ Settings
  settings: defineTable({
    type: v.union(
      v.literal("general"),
      v.literal("mpesa"),
      v.literal("email"),
      v.literal("sms")
    ),
    // General Settings
    siteName: v.optional(v.string()),
    siteDescription: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    baseUrl: v.optional(v.string()),

    // M-Pesa Settings
    consumerKey: v.optional(v.string()),
    consumerSecret: v.optional(v.string()),
    passKey: v.optional(v.string()),
    shortcode: v.optional(v.string()),
    callbackUrl: v.optional(v.string()),

    // Email Settings (Resend)
    resendApiKey: v.optional(v.string()),
    emailFrom: v.optional(v.string()),
    emailFromName: v.optional(v.string()),

    // SMS Settings
    smsApiKey: v.optional(v.string()),
    smsApiUrl: v.optional(v.string()),
    smsSenderId: v.optional(v.string()),

    customSettings: v.optional(v.any()),
    updatedBy: v.optional(v.string()),
    updatedAt: v.optional(v.number()),
  }).index("by_type", ["type"]),

  // 💸 Donations
  donations: defineTable({
    donor: v.string(),
    phone: v.string(),
    amount: v.number(),
    anonymous: v.boolean(),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed")
    ),
    campaignId: v.optional(v.id("campaigns")),
    userId: v.optional(v.string()),
    paymentMethod: v.string(),
    mpesaRequestId: v.optional(v.string()),
    merchantRequestId: v.optional(v.string()),
    mpesaReceiptNumber: v.optional(v.string()),
    mpesaTransactionDate: v.optional(v.string()),
    completedAt: v.optional(v.number()),
    createdAt: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_checkout_request", ["mpesaRequestId"]),

  // 📢 Campaigns
  campaigns: defineTable({
    title: v.string(),
    description: v.string(),
    targetAmount: v.number(),
    collectedAmount: v.optional(v.number()),
    startDate: v.number(),
    endDate: v.optional(v.number()),
    active: v.boolean(),
    createdAt: v.optional(v.number()),
  }).index("by_active", ["active"]),

  // 🏠 Visitations
  visitations: defineTable({
    homeName: v.string(),
    visitDate: v.string(),
    numberOfChildren: v.number(),
    status: v.string(),
    notes: v.optional(v.string()),
    budget: v.number(),
    budgetBreakdown: v.object({
      transportation: v.number(),
      food: v.number(),
      supplies: v.number(),
      gifts: v.number(),
      other: v.number(),
    }),
    images: v.optional(
      v.array(
        v.object({
          url: v.string(),
          publicId: v.string(),
        })
      )
    ),
    createdBy: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_createdBy", ["createdBy"])
    .index("by_createdAt", ["createdAt"]),

  // ❤️ Causes
  causes: defineTable({
    title: v.string(),
    description: v.string(),
    goalAmount: v.number(),
    currentAmount: v.number(),
    images: v.optional(
      v.array(
        v.object({
          url: v.string(),
          publicId: v.string(),
        })
      )
    ),
    createdBy: v.string(),
    active: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_createdBy", ["createdBy"])
    .index("by_active", ["active"])
    .index("by_createdAt", ["createdAt"]),

  // 📰 News
  news: defineTable({
    title: v.string(),
    description: v.string(),
    createdBy: v.string(),
    published: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_createdBy", ["createdBy"])
    .index("by_published", ["published"])
    .index("by_createdAt", ["createdAt"]),

  //gallery
  gallery: defineTable({
    url: v.string(),
    publicId: v.string(),
    uploadedBy: v.string(),
    uploadedAt: v.number(),
  }),
});
