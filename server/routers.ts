import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { encodeSessionCookie, SUPABASE_AUTH_COOKIE } from "./_core/context";
import { createSupabaseClient, supabase } from "./supabase";
import { createCategory, createProduct, createProductOption, deleteCategory, deleteProduct, deleteProductOption, listAdminMenu, listMenu, setRestaurantStatus, updateCategory, updateProduct, updateProductOption, reorderProductOption, getUserByOpenId, upsertUser } from "./db";

const categoryInput = z.object({ name: z.string().min(2).max(120), slug: z.string().min(2).max(120), icon: z.string().min(2).max(40) });
const productInput = z.object({ categoryId: z.number().int().positive(), name: z.string().min(2).max(160), description: z.string().min(2), price: z.string().regex(/^\d+(\.\d{1,2})?$/), imageUrl: z.string().url().nullable().optional(), featuredOfDay: z.boolean().default(false) });
const optionInput = z.object({ productId: z.number().int().positive(), name: z.string().min(2).max(160), description: z.string().max(500).nullable().optional(), priceDelta: z.string().regex(/^\d+(\.\d{1,2})?$/), available: z.boolean().default(true) });

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(({ ctx }) => ctx.user),
    login: publicProcedure.input(z.object({ email: z.string().email(), password: z.string().min(6) })).mutation(async ({ input, ctx }) => {
      const { data, error } = await supabase.auth.signInWithPassword(input);
      if (error || !data.user || !data.session) throw new TRPCError({ code: "UNAUTHORIZED", message: "E-mail ou senha inválidos." });
      const authClient = createSupabaseClient(data.session.access_token);
      let user = await getUserByOpenId(data.user.id, authClient);
      if (!user) {
        await upsertUser({ openId: data.user.id, name: data.user.user_metadata?.name ?? data.user.email?.split("@")[0] ?? "Usuário", email: data.user.email ?? input.email, loginMethod: "email" }, authClient);
        user = await getUserByOpenId(data.user.id, authClient);
      } else {
        await upsertUser({ openId: data.user.id, lastSignedIn: new Date() }, authClient);
      }
      if (!user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Perfil do usuário não encontrado." });
      ctx.res.cookie(SUPABASE_AUTH_COOKIE, encodeSessionCookie({ accessToken: data.session.access_token, refreshToken: data.session.refresh_token, expiresAt: data.session.expires_at ?? Math.floor(Date.now() / 1000) + (data.session.expires_in ?? 3600) }), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: (data.session.expires_in ?? 3600) * 1000 });
      return user;
    }),
    logout: publicProcedure.mutation(async ({ ctx }) => {
      if (ctx.accessToken) await ctx.supabase.auth.signOut().catch(() => undefined);
      ctx.res.clearCookie(SUPABASE_AUTH_COOKIE, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" });
      return { success: true } as const;
    }),
  }),
  menu: router({
    public: publicProcedure.query(({ ctx }) => listMenu(ctx.supabase)),
    admin: adminProcedure.query(({ ctx }) => listAdminMenu(ctx.supabase)),
    categories: router({
      create: adminProcedure.input(categoryInput).mutation(({ input, ctx }) => createCategory(input, ctx.supabase)),
      update: adminProcedure.input(categoryInput.extend({ id: z.number().int().positive(), active: z.boolean() })).mutation(({ input, ctx }) => updateCategory(input, ctx.supabase)),
      remove: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input, ctx }) => deleteCategory(input.id, ctx.supabase)),
    }),
    products: router({
      create: adminProcedure.input(productInput).mutation(({ input, ctx }) => createProduct(input, ctx.supabase)),
      update: adminProcedure.input(productInput.extend({ id: z.number().int().positive(), available: z.boolean() })).mutation(({ input, ctx }) => updateProduct(input, ctx.supabase)),
      remove: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input, ctx }) => deleteProduct(input.id, ctx.supabase)),
      options: router({
        create: adminProcedure.input(optionInput).mutation(({ input, ctx }) => createProductOption(input, ctx.supabase)),
        update: adminProcedure.input(optionInput.extend({ id: z.number().int().positive() })).mutation(({ input, ctx }) => updateProductOption(input, ctx.supabase)),
        reorder: adminProcedure.input(z.object({ id: z.number().int().positive(), direction: z.enum(["up", "down"]) })).mutation(({ input, ctx }) => reorderProductOption(input, ctx.supabase)),
        remove: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input, ctx }) => deleteProductOption(input.id, ctx.supabase)),
      }),
      uploadImage: adminProcedure.input(z.object({ dataUrl: z.string().regex(/^data:image\/(png|jpeg|jpg|webp);base64,/), fileName: z.string().min(1).max(160) })).mutation(async ({ input, ctx }) => {
        const [, payload] = input.dataUrl.split(",", 2);
        const mime = input.dataUrl.slice(5, input.dataUrl.indexOf(";"));
        const buffer = Buffer.from(payload, "base64");
        if (buffer.length > 8 * 1024 * 1024) throw new TRPCError({ code: "BAD_REQUEST", message: "A imagem deve ter no máximo 8 MB." });
        const safeName = input.fileName.toLowerCase().replace(/[^a-z0-9._-]+/g, "-");
        const path = `${Date.now()}-${safeName}`;
        const { error } = await ctx.supabase.storage.from("menu-products").upload(path, buffer, { contentType: mime, upsert: false });
        if (error) throw new TRPCError({ code: "BAD_REQUEST", message: `Falha no upload: ${error.message}` });
        const { data } = ctx.supabase.storage.from("menu-products").getPublicUrl(path);
        return { key: path, url: data.publicUrl };
      }),
    }),
    status: adminProcedure.input(z.object({ isOpen: z.boolean() })).mutation(({ input, ctx }) => setRestaurantStatus(input.isOpen, ctx.supabase)),
  }),
});

export type AppRouter = typeof appRouter;
