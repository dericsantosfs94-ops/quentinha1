import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { storageDelete, storagePut } from "./storage";
import { clearProductImage, createCategory, createProduct, createProductOption, deleteCategory, deleteProduct, deleteProductOption, listAdminMenu, reorderProductOption, listMenu, setRestaurantStatus, updateCategory, updateProduct, updateProductOption } from "./db";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito ao administrador." });
  return next();
});

const categoryInput = z.object({ name: z.string().min(2).max(120), slug: z.string().min(2).max(120), icon: z.string().min(2).max(40) });
const productInput = z.object({ categoryId: z.number().int().positive(), name: z.string().min(2).max(160), description: z.string().min(2), price: z.string().regex(/^\d+(\.\d{1,2})?$/), imageUrl: z.string().url().nullable().optional(), featuredOfDay: z.boolean().default(false) });
const optionInput = z.object({ productId: z.number().int().positive(), name: z.string().min(2).max(160), description: z.string().max(500).nullable().optional(), priceDelta: z.string().regex(/^\d+(\.\d{1,2})?$/), available: z.boolean().default(true) });

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
      options: router({
        create: adminProcedure.input(optionInput).mutation(({ input }) => createProductOption(input)),
        update: adminProcedure.input(optionInput.extend({ id: z.number().int().positive() })).mutation(({ input }) => updateProductOption(input)),
        reorder: adminProcedure.input(z.object({ id: z.number().int().positive(), direction: z.enum(["up", "down"]) })).mutation(({ input }) => reorderProductOption(input)),
        remove: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => deleteProductOption(input.id)),
      }),
      uploadImage: adminProcedure.input(z.object({ dataUrl: z.string().regex(/^data:image\/(png|jpeg|jpg|webp);base64,/), fileName: z.string().min(1).max(160) })).mutation(async ({ input }) => { const [meta, payload] = input.dataUrl.split(",", 2); const contentType = meta.match(/^data:(.*);base64$/)?.[1] ?? "image/jpeg"; const buffer = Buffer.from(payload, "base64"); if (buffer.length > 8 * 1024 * 1024) throw new TRPCError({ code: "BAD_REQUEST", message: "A imagem deve ter no máximo 8 MB." }); return storagePut(`menu-products/${input.fileName}`, buffer, contentType); }),
      removeImage: adminProcedure.input(z.object({ productId: z.number().int().positive(), imageUrl: z.string().url() })).mutation(async ({ input }) => { const marker = "/storage/v1/object/public/menu-products/"; const markerIndex = input.imageUrl.indexOf(marker); if (markerIndex < 0) throw new TRPCError({ code: "BAD_REQUEST", message: "A foto não pertence ao Storage do cardápio." }); const key = decodeURIComponent(input.imageUrl.slice(markerIndex + marker.length)); await storageDelete(key); return clearProductImage(input.productId); }),
    }),
    status: adminProcedure.input(z.object({ isOpen: z.boolean() })).mutation(({ input }) => setRestaurantStatus(input.isOpen)),
  }),
});

export type AppRouter = typeof appRouter;
