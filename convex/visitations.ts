import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc } from "./_generated/dataModel";

/**
 * 🏠 Create a new visitation
 */
export const createVisitation = mutation({
  args: {
    homeName: v.string(),
    visitDate: v.string(),
    numberOfChildren: v.number(),
    status: v.string(),
    notes: v.optional(v.string()),
    budget: v.object({
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
  },
  handler: async (ctx, args) => {
    const totalBudget =
      args.budget.transportation +
      args.budget.food +
      args.budget.supplies +
      args.budget.gifts +
      args.budget.other;

    const visitationId = await ctx.db.insert("visitations", {
      homeName: args.homeName,
      visitDate: args.visitDate,
      numberOfChildren: args.numberOfChildren,
      status: args.status,
      notes: args.notes || "",
      budget: totalBudget,
      budgetBreakdown: args.budget,
      images: args.images || [],
      createdBy: args.createdBy,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const visitation = await ctx.db.get(visitationId);
    return { success: true, data: visitation };
  },
});

/**
 * 📋 Get all visitations (sorted by visit date)
 */
export const getVisitations = query({
  args: {},
  handler: async (ctx) => {
    const visitations = await ctx.db
      .query("visitations")
      .order("desc")
      .collect();

    const sorted = visitations.sort(
      (a, b) =>
        new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime()
    );

    return { success: true, count: sorted.length, data: sorted };
  },
});

/**
 * 🔍 Get visitation by ID
 */
export const getVisitation = query({
  args: { id: v.id("visitations") },
  handler: async (ctx, args) => {
    const visitation = await ctx.db.get(args.id);
    if (!visitation) throw new Error("Visitation not found");

    return { success: true, data: visitation };
  },
});

/**
 * 👤 Get visitations created by a specific user
 */
export const getMyVisitations = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const visitations = await ctx.db
      .query("visitations")
      .filter((q) => q.eq(q.field("createdBy"), args.userId))
      .collect();

    const sorted = visitations.sort(
      (a, b) =>
        new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime()
    );

    return { success: true, count: sorted.length, data: sorted };
  },
});

/**
 * ✏️ Update a visitation
 */
export const updateVisitation = mutation({
  args: {
    id: v.id("visitations"),
    homeName: v.optional(v.string()),
    visitDate: v.optional(v.string()),
    numberOfChildren: v.optional(v.number()),
    status: v.optional(v.string()),
    notes: v.optional(v.string()),
    budget: v.optional(
      v.object({
        transportation: v.number(),
        food: v.number(),
        supplies: v.number(),
        gifts: v.number(),
        other: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const visitation = await ctx.db.get(args.id);
    if (!visitation) throw new Error("Visitation not found");

    const updates: Partial<Doc<"visitations">> = { updatedAt: Date.now() };

    if (args.homeName) updates.homeName = args.homeName;
    if (args.visitDate) updates.visitDate = args.visitDate;
    if (args.numberOfChildren !== undefined)
      updates.numberOfChildren = args.numberOfChildren;
    if (args.status) updates.status = args.status;
    if (args.notes !== undefined) updates.notes = args.notes;

    if (args.budget) {
      const totalBudget =
        args.budget.transportation +
        args.budget.food +
        args.budget.supplies +
        args.budget.gifts +
        args.budget.other;
      updates.budget = totalBudget;
      updates.budgetBreakdown = args.budget;
    }

    await ctx.db.patch(args.id, updates);

    const updated = await ctx.db.get(args.id);
    return { success: true, data: updated };
  },
});

/**
 * 🗑️ Delete a visitation
 */
export const deleteVisitation = mutation({
  args: { id: v.id("visitations") },
  handler: async (ctx, args) => {
    const visitation = await ctx.db.get(args.id);
    if (!visitation) throw new Error("Visitation not found");

    await ctx.db.delete(args.id);
    return { success: true, message: "Visitation deleted successfully" };
  },
});

/**
 * 🖼️ Add images to an existing visitation
 */
export const addImagesToVisitation = mutation({
  args: {
    id: v.id("visitations"),
    images: v.array(
      v.object({
        url: v.string(),
        publicId: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const visitation = await ctx.db.get(args.id);
    if (!visitation) throw new Error("Visitation not found");

    const updatedImages = [...(visitation.images || []), ...args.images];

    await ctx.db.patch(args.id, {
      images: updatedImages,
      updatedAt: Date.now(),
    });

    return { success: true, data: updatedImages };
  },
});

/**
 * 🖼️ Get images for a visitation
 */
export const getVisitationImages = query({
  args: { id: v.id("visitations") },
  handler: async (ctx, args) => {
    const visitation = await ctx.db.get(args.id);
    if (!visitation) throw new Error("Visitation not found");

    return { success: true, data: visitation.images || [] };
  },
});
