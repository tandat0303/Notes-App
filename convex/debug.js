import { query } from "./_generated/server";

export const authDebug = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    return {
      identity,
      tokenIdentifier: ctx.auth.getTokenIdentifier?.() ?? null,
    };
  },
});
