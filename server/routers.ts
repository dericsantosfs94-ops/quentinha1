import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { createCategory, createProduct, deleteCategory, deleteProduct, listAdminMenu, listMenu, setRestaurantStatus, updateCategory, updateProduct } from "./db";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito ao administrador." });
  return next();
});

const categoryInput = z.object({ name: z.string().min(2).max(120), slug: z.string().min(2).max(120), icon: z.string().min(2).max(40) });
const productInput = z.object({ categoryId: z.number().int().positive(), name: z.string().min(2).max(160), description: z.string().min(2), price: z.string().regex(/^\d+(\.\d{1,2})?$/), imageUrl: z.string().url().nullable().optional() });

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  menu: router({
    public: publicProcedure.query(() => listMenu()),
    admin: adminProcedure.query(() => listAdminMenu()),
    categories: router({
      create: adminProcedure.input(categoryInput).mutation(({ input }) => createCategory(input)),
      update: adminProcedure.input(categoryInput.extend({ id: z.number().int().positive(), active: z.boolean() })).mutation(({ input }) => updateCategory(input)),
      remove: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => deleteCategory(input.id)),
    }),
    products: router({
      create: adminProcedure.input(productInput).mutation(({ input }) => createProduct(input)),
      update: adminProcedure.input(productInput.extend({ id: z.number().int().positive(), available: z.boolean() })).mutation(({ input }) => updateProduct(input)),
      remove: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => deleteProduct(input.id)),
    }),
    status: adminProcedure.input(z.object({ isOpen: z.boolean() })).mutation(({ input }) => setRestaurantStatus(input.isOpen)),
  }),
});

export type AppRouter = typeof appRouter;
