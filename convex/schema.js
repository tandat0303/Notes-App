import { defineSchema, defineTable } from "convex/server";
import { v } from 'convex/values';

export default defineSchema ({
    notes: defineTable({
        title: v.string(),
        content: v.string(),
        tags: v.array(v.string()),
        isArchived: v.boolean(),
        userId: v.string(),
        createdAt: v.number(),
        updatedAt: v.number(),
    }).index("by_user", ["userId"])
        .index("by_user_archived", ["userId", "isArchived"])
        .searchIndex("search_notes", {
            searchField: "content",
            filterFields: ["userId", "isArchived"]
        }),
    
    userPreferences: defineTable({
        userId: v.string(),
        colorTheme: v.string(),
        fontTheme: v.string(),
    }).index("by_user", ["userId"]),
});