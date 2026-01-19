import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createUserRecord = mutation({
    args: {
        name: v.string(),
        username: v.string(),
        email: v.string(),
        avatar: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");
        
        const clerkId = identity.subject;

        const now = Date.now();

        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
            .first();

        if (existingUser) {
            await ctx.db.patch(existingUser._id, {
                email: args.email,
                name: args.name,
                username: args.username,
                avatar: args.avatar,
                updatedAt: now,
                lastLoggedIn: now,
            });

            return existingUser._id;
        }

        return await ctx.db.insert("users", {
            clerkId,
            email: args.email,
            name: args.name,
            username: args.username,
            avatar: args.avatar,
            role: "user",
            lastLoggedIn: now,
            createdAt: now,
            updatedAt: now,
        })
    }
})

export const getCurrentUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", q => q.eq("clerkId", identity.subject))
      .first();
  },
});

//Test get token
export const whoami = query({
  handler: async (ctx) => {
    return await ctx.auth.getUserIdentity();
  },
});