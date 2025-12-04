import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * 📰 Create a News Post
 */
export const createNews = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    const newsId = await ctx.db.insert("news", {
      title: args.title,
      description: args.description,
      createdBy: args.createdBy,
      createdAt: Date.now(),
      published:true,
      updatedAt: Date.now(),
    });

    const news = await ctx.db.get(newsId);
    return { success: true, data: news };
  },
});

/**
 * 📋 Get all news posts (sorted newest first)
 */
export const getNews = query({
  args: {},
  handler: async (ctx) => {
    const newsList = await ctx.db.query("news").order("desc").collect();
    return { success: true, count: newsList.length, data: newsList };
  },
});

/**
 * 🔍 Get a single news post by ID
 */
export const getNewsById = query({
  args: { id: v.id("news") },
  handler: async (ctx, args) => {
    const news = await ctx.db.get(args.id);
    if (!news) throw new Error("News not found");
    return { success: true, data: news };
  },
});

/**
 * ✏️ Update a news post
 */
export const updateNews = mutation({
  args: {
    id: v.id("news"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const news = await ctx.db.get(args.id);
    if (!news) throw new Error("News not found");

    const updates = {
      updatedAt: Date.now(),
    };

    if (args.title) updates["title"] = args.title;
    if (args.description) updates["description"] = args.description;

    await ctx.db.patch(args.id, updates);

    const updated = await ctx.db.get(args.id);
    return { success: true, data: updated };
  },
});

/**
 * 🗑️ Delete a news post
 */
export const deleteNews = mutation({
  args: { id: v.id("news") },
  handler: async (ctx, args) => {
    const news = await ctx.db.get(args.id);
    if (!news) throw new Error("News not found");

    await ctx.db.delete(args.id);
    return { success: true, message: "News deleted successfully" };
  },
});
