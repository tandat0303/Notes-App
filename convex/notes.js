import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getNotes = query({
  args: {
    userId: v.string(),
    isArchived: v.optional(v.boolean()),
    tagFilter: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("notes");

    if (args.isArchived !== undefined) {
      query = query.withIndex("by_user_archived", (q) =>
        q.eq("userId", args.userId).eq("isArchived", args.isArchived),
      );
    } else {
      query = query.withIndex("by_user", (q) => q.eq("userId", args.userId));
    }

    let notes = await query.order("desc").collect();

    if (args.tagFilter) {
      notes = notes.filter((note) =>
        note.tags.some((tag) =>
          tag.toLowerCase().includes(args.tagFilter.toLowerCase()),
        ),
      );
    }

    return notes;
  },
});

export const searchNotes = query({
  args: {
    userId: v.string(),
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.searchTerm.trim()) {
      return await ctx.db
        .query("notes")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .order("desc")
        .collect();
    }

    const searchResults = await ctx.db
      .query("notes")
      .withSearchIndex("search_notes", (q) =>
        q
          .search("content", args.searchTerm)
          .eq("userId", args.userId)
          .eq("isArchived", false),
      )
      .collect();

    const allNotes = await ctx.db
      .query("notes")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const titleAndTagResults = allNotes.filter((note) => {
      const titleMatch = note.title
        .toLowerCase()
        .includes(args.searchTerm.toLowerCase());
      const tagMatch = note.tags.some((tag) =>
        tag.toLowerCase().includes(args.searchTerm.toLowerCase()),
      );

      return (titleMatch || tagMatch) && !note.isArchived;
    });

    const combinedResults = [...searchResults];
    titleAndTagResults.forEach((note) => {
      if (!combinedResults.find((existing) => existing._id === note._id)) {
        combinedResults.push(note);
      }
    });

    return combinedResults.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

export const getUserTags = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const notes = await ctx.db
      .query("notes")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const tagSet = new Set();
    notes.forEach((note) => {
      note.tags.forEach((tag) => tagSet.add(tag));
    });

    return Array.from(tagSet).sort();
  },
});

export const createNote = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    tags: v.array(v.string()),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("notes", {
      title: args.title,
      content: args.content,
      tags: args.tags,
      isArchived: false,
      userId: args.userId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateNote = mutation({
  args: {
    id: v.id("notes"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const toggleArchiveNote = mutation({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    const note = await ctx.db.get(args.id);
    if (!note) throw new Error("Note not found");

    return await ctx.db.patch(args.id, {
      isArchived: !note.isArchived,
      updatedAt: Date.now(),
    });
  },
});

export const deleteNote = mutation({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

export const getSharedNote = query({
  args: {
    noteId: v.id("notes"),
  },
  handler: async (ctx, args) => {
    try {
      const note = await ctx.db.get(args.noteId);

      if (!note) {
        return null;
      }

      // if (!note.isShared) {
      //   return null;
      // }

      let authorName = "Anonymous";
      if (note.userId) {
        const user = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("clerkId"), note.userId))
          .first();
        
        if (user && user.name) {
          authorName = user.name;
        }
      }

      return {
        _id: note._id,
        title: note.title,
        content: note.content,
        tags: note.tags || [],
        updatedAt: note.updatedAt,
        createdAt: note.createdAt,
        authorName: authorName,
      };
    } catch (error) {
      console.error("Error fetching shared note:", error);
      return null;
    }
  },
});

//Optional
export const toggleShareNote = mutation({
  args: {
    id: v.id("notes"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const note = await ctx.db.get(args.id);
    
    if (!note) {
      throw new Error("Note not found");
    }

    // Verify ownership
    if (note.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    // Toggle isShared field
    await ctx.db.patch(args.id, {
      isShared: !note.isShared,
      sharedAt: note.isShared ? undefined : Date.now(),
    });

    return !note.isShared;
  },
});

// Optional: Function to generate shareable link
export const generateShareLink = mutation({
  args: {
    id: v.id("notes"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const note = await ctx.db.get(args.id);
    
    if (!note) {
      throw new Error("Note not found");
    }

    // Verify ownership
    if (note.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    // Mark note as shared
    await ctx.db.patch(args.id, {
      isShared: true,
      sharedAt: Date.now(),
    });

    return {
      shareUrl: `/shared/${args.id}`,
      noteId: args.id,
    };
  },
});
