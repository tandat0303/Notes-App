import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Hash password using Web Crypto API
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Hash with salt (more secure)
async function hashPasswordWithSalt(password, salt = null) {
  if (!salt) {
    const saltBuffer = crypto.getRandomValues(new Uint8Array(16));
    salt = Array.from(saltBuffer).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', passwordData);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return { hash: hashHex, salt };
}

// Set lock on note
export const setNoteLock = mutation({
  args: {
    id: v.id("notes"),
    password: v.string(),
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

    if (note.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    const passwordHash = await hashPassword(args.password);

    await ctx.db.patch(args.id, {
      isLocked: true,
      passwordHash: passwordHash,
      lockedAt: Date.now(),
    });

    return { success: true };
  },
});

// Unlock note (verify password)
export const unlockNote = mutation({
  args: {
    id: v.id("notes"),
    password: v.string(),
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

    if (note.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    if (!note.isLocked || !note.passwordHash) {
      throw new Error("Note is not locked");
    }

    const passwordHash = await hashPassword(args.password);
    
    if (passwordHash !== note.passwordHash) {
      throw new Error("Incorrect password");
    }

    await ctx.db.patch(args.id, {
      isLocked: false,
      passwordHash: undefined,
      lockedAt: undefined,
    });

    return { success: true };
  },
});

export const unlockSharedNote = mutation({
  args: {
    id: v.id("notes"),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const note = await ctx.db.get(args.id);
    
    if (!note) {
      throw new Error("Note not found");
    }

    if (!note.isShared) {
      throw new Error("This note is not shared");
    }

    if (note.isArchived) {
      throw new Error("This note is archived");
    }

    if (!note.isLocked || !note.passwordHash) {
      throw new Error("Note is not locked");
    }

    const passwordData = await hashPassword(args.password);
    
    if (passwordData !== note.passwordHash) {
      throw new Error("Incorrect password");
    }

    return { 
      success: true,
      content: note.content,
      title: note.title,
      tags: note.tags || [],
    };
  },
});

// Check if note is locked
export const checkNoteLock = query({
  args: {
    id: v.id("notes"),
  },
  handler: async (ctx, args) => {
    const note = await ctx.db.get(args.id);
    if (!note) {
      return null;
    }

    return {
      isLocked: note.isLocked || false,
      lockedAt: note.lockedAt,
    };
  },
});

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

export const getNoteById = query({
  args: {
    id: v.id("notes"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
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
      isLocked: false,
      isShared: false,
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

export const updateSharedNote = mutation({
  args: {
    id: v.id("notes"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      sharedAt: Date.now(),
    });

    const analytics = await ctx.db
      .query("shareAnalytics")
      .withIndex("by_note", (q) => q.eq("noteId", args.id))
      .first();

    if (!analytics) {
      const note = await ctx.db.get(args.id);
      if (note) {
        await ctx.db.insert("shareAnalytics", {
          noteId: args.id,
          userId: note.userId,
          viewCount: 0,
          viewers: [],
        });
      }
    }

    return { success: true };
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const note = await ctx.db.get(args.id);
    if (note && note.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    const analytics = await ctx.db
      .query("shareAnalytics")
      .withIndex("by_note", (q) => q.eq("noteId", args.id))
      .first();

    if (analytics) {
      await ctx.db.delete(analytics._id);
    }

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

      if (!note.isShared) {
        return null;
      }

      if (note.isArchived) {
        return null;
      }

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
        content: note.isLocked ? null : note.content,
        tags: note.tags || [],
        isShared: note.isShared,
        isLocked: note.isLocked || false,
        lockedAt: note.lockedAt,
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

export const trackNoteView = mutation({
  args: {
    noteId: v.id("notes"),
    userAgent: v.optional(v.string()),
    referrer: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const note = await ctx.db.get(args.noteId);
    
    if (!note || !note.isShared || note.isArchived) {
      throw new Error("Note not available");
    }

    // Tìm analytics record cho note này
    const analytics = await ctx.db
      .query("shareAnalytics")
      .withIndex("by_note", (q) => q.eq("noteId", args.noteId))
      .first();

    const viewData = {
      viewedAt: Date.now(),
      userAgent: args.userAgent,
      referrer: args.referrer,
    };

    if (analytics) {
      const updatedViewers = [...(analytics.viewers || []), viewData];
      
      await ctx.db.patch(analytics._id, {
        viewCount: analytics.viewCount + 1,
        lastViewedAt: Date.now(),
        viewers: updatedViewers,
      });
    } else {
      await ctx.db.insert("shareAnalytics", {
        noteId: args.noteId,
        userId: note.userId,
        viewCount: 1,
        lastViewedAt: Date.now(),
        viewers: [viewData],
      });
    }

    return { success: true };
  },
});

export const getNoteAnalytics = query({
  args: {
    noteId: v.id("notes"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const note = await ctx.db.get(args.noteId);
    if (!note) {
      throw new Error("Note not found");
    }

    // Verify ownership
    if (note.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    const analytics = await ctx.db
      .query("shareAnalytics")
      .withIndex("by_note", (q) => q.eq("noteId", args.noteId))
      .first();

    if (!analytics) {
      return {
        noteId: args.noteId,
        viewCount: 0,
        lastViewedAt: null,
        viewers: [],
      };
    }

    return {
      noteId: analytics.noteId,
      viewCount: analytics.viewCount,
      lastViewedAt: analytics.lastViewedAt,
      viewers: analytics.viewers || [],
      uniqueReferrers: [...new Set((analytics.viewers || []).map(v => v.referrer).filter(Boolean))],
      viewsByDay: groupViewsByDay(analytics.viewers || []),
    };
  },
});

export const getUserAnalyticsSummary = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.subject !== args.userId) {
      throw new Error("Not authorized");
    }

    const allAnalytics = await ctx.db
      .query("shareAnalytics")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();

    const totalViews = allAnalytics.reduce((sum, a) => sum + a.viewCount, 0);
    const totalSharedNotes = allAnalytics.length;

    const mostViewedNote = allAnalytics.reduce((max, a) => 
      a.viewCount > (max?.viewCount || 0) ? a : max, 
      null
    );

    return {
      totalViews,
      totalSharedNotes,
      mostViewedNoteId: mostViewedNote?.noteId,
      mostViewedCount: mostViewedNote?.viewCount || 0,
      recentViews: allAnalytics
        .filter(a => a.lastViewedAt)
        .sort((a, b) => b.lastViewedAt - a.lastViewedAt)
        .slice(0, 10),
    };
  },
});

export const deleteNoteAnalytics = mutation({
  args: {
    noteId: v.id("notes"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const note = await ctx.db.get(args.noteId);
    if (note && note.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    const analytics = await ctx.db
      .query("shareAnalytics")
      .withIndex("by_note", (q) => q.eq("noteId", args.noteId))
      .first();

    if (analytics) {
      await ctx.db.delete(analytics._id);
    }

    return { success: true };
  },
});

function groupViewsByDay(viewers) {
  const grouped = {};
  
  viewers.forEach(viewer => {
    const date = new Date(viewer.viewedAt);
    const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
    
    if (!grouped[dateKey]) {
      grouped[dateKey] = 0;
    }
    grouped[dateKey]++;
  });

  return Object.entries(grouped)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
