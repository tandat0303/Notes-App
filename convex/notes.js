import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getNotes = query({
    args: {
        userId: v.string(),
        isArchived: v.optional(v.boolean()),
        tagFilter: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        let query = 
            ctx.db.query("notes")
                .withIndex("by_user", 
                (q) => q.eq("userId", args.userId));

        if (args.isArchived !== undefined) {
            query = 
            ctx.db.query("notes")
            .withIndex("by_user_archived",
                (q) => q.eq("userId", args.userId)
                        .eq("isArchived", args.isArchived)
            );
        }

        let notes = await query.order("desc").collect;

        if (args.tagFilter){
            notes = notes.filter((note) => note.tags.some(
                                (tag) => tag.toLowerCase().includes(args.tagFilter.toLowerCase())))
        };

        return notes;
    }
})

export const searchNotes = query({
    args: {
        userId: v.string(),
        searchTerm: v.string(),
    },
    handler: async (ctx, args) => {
        if (!args.searchTerm.trim()) {
            return await ctx.db
                .query("notes")
                .withIndex("by_user",
                    (q) => q.eq("userId", args.userId)
                )
                .order("desc")
                .collect();
        }

        const searchResults = await ctx.db
            .query("notes")
            .withSearchIndex("search_notes",
                (q) => q.search("content", args.searchTerm)
                        .eq("userId", args.userId)
                        .eq("isArchived", false)
            )
            .collect();

            const allNotes = await ctx.db
                .query("notes")
                .withIndex("by_user",
                    (q) => q.eq("userId", args.userId)
                )
                .collect();

            const titleAndTagResults = allNotes.filter((note) => {
                const titleMatch = note.title.toLowerCase().includes(args.searchTerm.toLowerCase());
                const tagMatch = note.tags.some((tag) => tag.toLowerCase().includes(args.searchTerm.toLowerCase()));

                return (titleMatch || tagMatch) && !note.isArchived;
            });

            const combinedResults = [...searchResults];
            titleAndTagResults.forEach((note) => {
                if (!combinedResults.find((existing) => existing._id === note._id)) {
                    combinedResults.push(note);
                }
            });

            return combinedResults.sort((a,b) => b.updatedAt - a.updatedAt);
    }
})

export const getUserTags = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const notes = 
            await ctx.db.query("notes")
                        .withIndex("by_user", 
                        (q) => q.eq("userId", args.userId))
                        .collect();

        const tagSet = new Set();
        notes.forEach(note => {
            note.tags.forEach(tag => tagSet.add(tag))
        });

        return Array.from(tagSet).sort();
    }
})

export const createNote = mutation({
    args: {
        title: v.string(),
        content: v.string(),
        tags: v.array(v.string()),
        userId: v.string(),
    },
    handler: async (ctx, args) => {
        const now = new Date();
        return await ctx.db.insert("notes"), {
            title: args.title,
            content: args.content,
            tags: args.tags,
            isArchived: false,
            userId: args.userId,
            createdAt: now,
            updatedAt: now,
        }
    }
})

export const updateNote = mutation({
    args: {
        id: v.id("notes"),
        title: v.optional(v.string()),
        content: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args) => {
        const { id, ...updates} = args;

        return await ctx.db.patch(id, {
            ...updates,
            updatedAt: Date.now(),
        })
    }
});

export const toggleArchiveNote = mutation({
    args: { id: v.id("notes") },
    handler: async (ctx, args) => {
        const note = await ctx.db.get(args.id);
        if (!note) throw new Error("Note not found");

        return await ctx.db.patch(args.id, {
            isArchived: !note.isArchived,
            updatedAt: Date.now(),
        })
    }
});

export const deleteNote = mutation({
    args: { id: v.id("notes") },
    handler: async (ctx, args) => {
        return await ctx.db.delete(args.id);
    }
});
