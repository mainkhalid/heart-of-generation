import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc } from "./_generated/dataModel";

/**
 * ❤️ Create a new cause
 */
export const createCause = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    goalAmount: v.number(),
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
    const causeId = await ctx.db.insert("causes", {
      title: args.title,
      description: args.description,
      goalAmount: args.goalAmount,
      currentAmount: 0,
      images: args.images || [],
      createdBy: args.createdBy,
      active: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const cause = await ctx.db.get(causeId);
    return { success: true, data: cause };
  },
});

/**
 * 📋 Get all causes
 */
export const getCauses = query({
  args: {},
  handler: async (ctx) => {
    const causes = await ctx.db
      .query("causes")
      .order("desc")
      .collect();

    return { success: true, count: causes.length, data: causes };
  },
});

/**
 * 🔍 Get active causes only
 */
export const getActiveCauses = query({
  args: {},
  handler: async (ctx) => {
    const causes = await ctx.db
      .query("causes")
      .filter((q) => q.eq(q.field("active"), true))
      .order("desc")
      .collect();

    return { success: true, count: causes.length, data: causes };
  },
});

/**
 * 🔍 Get cause by ID
 */
export const getCause = query({
  args: { id: v.id("causes") },
  handler: async (ctx, args) => {
    const cause = await ctx.db.get(args.id);
    if (!cause) throw new Error("Cause not found");

    return { success: true, data: cause };
  },
});

/**
 * 👤 Get causes created by a specific user
 */
export const getMyCauses = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const causes = await ctx.db
      .query("causes")
      .filter((q) => q.eq(q.field("createdBy"), args.userId))
      .collect();

    return { success: true, count: causes.length, data: causes };
  },
});

/**
 * ✏️ Update a cause
 */
export const updateCause = mutation({
  args: {
    id: v.id("causes"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    goalAmount: v.optional(v.number()),
    currentAmount: v.optional(v.number()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const cause = await ctx.db.get(args.id);
    if (!cause) throw new Error("Cause not found");

    const updates: Partial<Doc<"causes">> = { updatedAt: Date.now() };

    if (args.title) updates.title = args.title;
    if (args.description) updates.description = args.description;
    if (args.goalAmount !== undefined) updates.goalAmount = args.goalAmount;
    if (args.currentAmount !== undefined) updates.currentAmount = args.currentAmount;
    if (args.active !== undefined) updates.active = args.active;

    await ctx.db.patch(args.id, updates);

    const updated = await ctx.db.get(args.id);
    return { success: true, data: updated };
  },
});

/**
 * 🗑️ Delete a cause
 */
export const deleteCause = mutation({
  args: { id: v.id("causes") },
  handler: async (ctx, args) => {
    const cause = await ctx.db.get(args.id);
    if (!cause) throw new Error("Cause not found");

    await ctx.db.delete(args.id);
    return { success: true, message: "Cause deleted successfully" };
  },
});

/**
 * 🖼️ Add images to an existing cause
 */
export const addImagesToCause = mutation({
  args: {
    id: v.id("causes"),
    images: v.array(
      v.object({
        url: v.string(),
        publicId: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const cause = await ctx.db.get(args.id);
    if (!cause) throw new Error("Cause not found");

    const updatedImages = [...(cause.images || []), ...args.images];

    await ctx.db.patch(args.id, {
      images: updatedImages,
      updatedAt: Date.now(),
    });

    return { success: true, data: updatedImages };
  },
});

/**
 * 💰 Update cause donation amount
 */
export const updateCauseAmount = mutation({
  args: {
    id: v.id("causes"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const cause = await ctx.db.get(args.id);
    if (!cause) throw new Error("Cause not found");

    const newAmount = (cause.currentAmount || 0) + args.amount;

    await ctx.db.patch(args.id, {
      currentAmount: newAmount,
      updatedAt: Date.now(),
    });

    const updated = await ctx.db.get(args.id);
    return { success: true, data: updated };
  },
});