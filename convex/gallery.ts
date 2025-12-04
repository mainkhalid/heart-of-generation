import { v } from "convex/values";
import { mutation, query } from "./_generated/server";


export const uploadImages = mutation({
  args: {
    images: v.array(
      v.object({
        url: v.string(),
        publicId: v.string(),
      })
    ),
    uploadedBy: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      
      const imageIds = await Promise.all(
        args.images.map((image) =>
          ctx.db.insert("gallery", {
            url: image.url,
            publicId: image.publicId,
            uploadedBy: args.uploadedBy,
            uploadedAt: Date.now(),
          })
        )
      );

      return {
        success: true,
        imageIds,
        message: `${args.images.length} images uploaded successfully`,
      };
    } catch (error) {
      console.error("Error uploading images:", error);
      return {
        success: false,
        error: "Failed to upload images to gallery",
      };
    }
  },
});


export const getGalleryImages = query({
  args: {},
  handler: async (ctx) => {
    const images = await ctx.db.query("gallery").order("desc").collect();
    return images;
  },
});


export const getGalleryImagesPaginated = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const images = await ctx.db
      .query("gallery")
      .order("desc")
      .take(limit);
    return images;
  },
});

// Delete a gallery image
export const deleteGalleryImage = mutation({
  args: {
    imageId: v.id("gallery"),
  },
  handler: async (ctx, args) => {
    try {
      await ctx.db.delete(args.imageId);
      return {
        success: true,
        message: "Image deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting image:", error);
      return {
        success: false,
        error: "Failed to delete image",
      };
    }
  },
});