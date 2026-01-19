import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  notes: defineTable({
    title: v.string(),
    content: v.string(),
    tags: v.array(v.string()),
    isArchived: v.boolean(),
    userId: v.string(),
    isShared: v.optional(v.boolean()),
    sharedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_archived", ["userId", "isArchived"])
    .searchIndex("search_notes", {
      searchField: "content",
      filterFields: ["userId", "isArchived"],
    })
    .index("by_shared", ["isShared"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["userId", "isArchived"],
    }),

  userPreferences: defineTable({
    userId: v.string(),
    colorTheme: v.string(),
    fontTheme: v.string(),
  }).index("by_user", ["userId"]),

  shareAnalytics: defineTable({
    noteId: v.id("notes"),
    userId: v.string(),
    viewCount: v.number(),
    lastViewedAt: v.optional(v.number()),
    viewers: v.optional(v.array(v.object({
      viewedAt: v.number(),
      userAgent: v.optional(v.string()),
      referrer: v.optional(v.string()),
    }))),
  }).index("by_note", ["noteId"]),

  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    username: v.string(),
    email: v.string(),
    avatar: v.optional(v.string()),

    role: v.optional(v.string()),
    lastLoggedIn: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
  .index("by_clerkId", ["clerkId"])
  .index("by_email", ["email"]),
});
