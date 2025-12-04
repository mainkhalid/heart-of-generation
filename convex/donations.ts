import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

/**
 * Fetch all donations with optional filters.
 */
export const getAllDonations = query({
  args: {
    search: v.optional(v.string()),
    status: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { search, status, startDate, endDate, page = 1, limit = 10 } = args;
    let donations = await ctx.db.query("donations").collect();

    // Filter by search term
    if (search) {
      const s = search.toLowerCase();
      donations = donations.filter(
        (d) =>
          d.donor?.toLowerCase().includes(s) ||
          d.phone?.includes(s) ||
          String(d.amount) === s
      );
    }

    if (status && status !== "all") {
      donations = donations.filter((d) => d.status === status);
    }

    // Filter by date range
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      donations = donations.filter((d) => {
        const created = new Date(d._creationTime);
        return (!start || created >= start) && (!end || created <= end);
      });
    }

    // Sort newest first
    donations.sort((a, b) => b._creationTime - a._creationTime);

    // Pagination
    const startIndex = (page - 1) * limit;
    const paginated = donations.slice(startIndex, startIndex + limit);

    return {
      donations: paginated,
      pagination: {
        total: donations.length,
        page,
        pages: Math.ceil(donations.length / limit),
      },
    };
  },
});

/**
 * Create a new donation and initiate M-Pesa payment
 */
export const createDonation = mutation({
  args: {
    amount: v.number(),
    phone: v.string(),
    donor: v.string(),
    anonymous: v.boolean(),
    campaignId: v.optional(v.id("campaigns")),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { amount, phone, donor, anonymous, campaignId, message } = args;

    // Insert donation
    const donationId = await ctx.db.insert("donations", {
      donor: anonymous ? "Anonymous" : donor,
      phone: phone.replace(/\s/g, ""),
      amount,
      anonymous,
      campaignId,
      message: message || null,
      status: "pending",
      paymentMethod: "mpesa",
      mpesaRequestId: null,
      mpesaReceiptNumber: null,
      mpesaTransactionDate: null,
      completedAt: null,
    });

    // Call Convex internal M-Pesa action
    const mpesaResponse = await ctx.runAction(internal.mpesa.initiateSTKPush, {
      phone,
      amount,
      reference: String(donationId),
      description: `Donation${campaignId ? ` to campaign ${campaignId}` : ""}`,
    });

    // Update donation with M-Pesa request ID
    if (mpesaResponse?.CheckoutRequestID) {
      await ctx.db.patch(donationId, {
        mpesaRequestId: mpesaResponse.CheckoutRequestID,
      });
    }

    return {
      success: true,
      donationId,
      checkoutRequestId: mpesaResponse?.CheckoutRequestID || null,
    };
  },
});

/**
 * M-Pesa callback (webhook)
 */
export const mpesaCallback = mutation({
  args: { body: v.any() },
  handler: async (ctx, args) => {
    const callback = args.body?.Body?.stkCallback;
    if (!callback) return { success: false, message: "Invalid body" };

    const checkoutId = callback.CheckoutRequestID;

    // Query donation by mpesaRequestId
    const donation = await ctx.db
      .query("donations")
      .withIndex("by_checkout_request", (q) => q.eq("mpesaRequestId", checkoutId))
      .unique();

    if (!donation) return { success: false, message: "Donation not found" };

    if (!callback.CallbackMetadata) {
      await ctx.db.patch(donation._id, {
        status: "failed",
      });
      return { success: true };
    }

    const meta = callback.CallbackMetadata.Item;
    const receipt = meta.find((i) => i.Name === "MpesaReceiptNumber")?.Value;
    const amount = meta.find((i) => i.Name === "Amount")?.Value;
    const date = meta.find((i) => i.Name === "TransactionDate")?.Value;

    await ctx.db.patch(donation._id, {
      status: "completed",
      mpesaReceiptNumber: receipt,
      mpesaTransactionDate: date,
      amount,
      completedAt: Date.now(),
    });

    return { success: true };
  },
});
