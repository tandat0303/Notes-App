import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getUserPreferences = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const preferences = await ctx.db.query("userPreferences")
        .withIndex("by_user", (q) => q.eq('userId', args.userId)).first();

        return preferences || {
            colorTheme: "blue",
            fontTheme: "inter"
        }
    }
});

export const updateUserPreferences = mutation({
    args: {
        userId: v.string(),
        colorTheme: v.optional(v.string()),
        fontTheme: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db.query("userPreferences")
        .withIndex("by_user", (q) => q.eq('userId', args.userId)).first();

        const { userId, ...updates} = args;

        if (existing) {
            return await ctx.db.patch(existing._id, updates);
        } else {
            return await ctx.db.insert("userPreferences", {
                userId,
                colorTheme: args.colorTheme || "blue",
                fontTheme: args.fontTheme || "inter"
            })
        }
    }
})