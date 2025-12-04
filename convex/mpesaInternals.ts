import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

// Create a new donation record
export const createDonationRecord = internalMutation({
  args: {
    userId: v.string(),
    amount: v.number(),
    phone: v.string(),
    checkoutRequestId: v.string(),
    merchantRequestId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("donations", {
      donor: "M-Pesa Donor",
      phone: args.phone,
      amount: args.amount,
      anonymous: false,
      status: "pending",
      userId: args.userId,
      paymentMethod: "mpesa",
      mpesaRequestId: args.checkoutRequestId,
      merchantRequestId: args.merchantRequestId,
    });
  },
});

// Update donation status
export const updateDonationStatus = internalMutation({
  args: {
    checkoutRequestId: v.string(),
    status: v.union(v.literal("pending"), v.literal("completed"), v.literal("failed")),
    mpesaReceiptNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const donation = await ctx.db
      .query("donations")
      .withIndex("by_checkout_request", (q) =>
        q.eq("mpesaRequestId", args.checkoutRequestId)
      )
      .first();

    if (!donation) throw new Error("Donation not found");

    await ctx.db.patch(donation._id, {
      status: args.status,
      mpesaReceiptNumber: args.mpesaReceiptNumber,
    });

    return donation._id;
  },
});
