// server/app.ts
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";
var OAUTH_STATE_COOKIE = "__Host-oauth_state";
var decodeOAuthState = (state) => {
  let decoded;
  try {
    decoded = atob(state);
  } catch {
    return { redirectUri: "" };
  }
  try {
    const parsed = JSON.parse(decoded);
    if (parsed && typeof parsed.redirectUri === "string") return parsed;
  } catch {
  }
  return { redirectUri: decoded };
};

// server/_core/oauth.ts
import { parse as parseCookieHeader2 } from "cookie";

// server/db.ts
import { createClient } from "@supabase/supabase-js";

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  supabaseUrl: process.env.SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? "",
  supabaseAdminEmail: process.env.SUPABASE_ADMIN_EMAIL ?? "admimsupabase@proton.me"
};

// server/db.ts
var supabaseUrl = /^https?:\/\//.test(ENV.supabaseUrl) ? ENV.supabaseUrl : "https://invalid.supabase.co";
var supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ENV.supabaseAnonKey || "invalid-key";
var supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});
function fail(error, operation) {
  throw new Error(`[Supabase] ${operation}: ${error?.message ?? "opera\xE7\xE3o n\xE3o conclu\xEDda"}`);
}
function category(row) {
  return { id: row.id, name: row.name, slug: row.slug, icon: row.icon ?? "utensils", sortOrder: row.sort_order ?? 0, active: row.active ?? true, createdAt: row.created_at };
}
function option(row) {
  return { id: row.id, productId: row.product_id, name: row.name, description: row.description ?? null, priceDelta: String(row.price_delta ?? "0.00"), available: row.available ?? true, sortOrder: row.sort_order ?? 0, createdAt: row.created_at, updatedAt: row.updated_at };
}
function product(row, options) {
  return { id: row.id, categoryId: row.category_id, name: row.name, description: row.description, price: String(row.price), imageUrl: row.image_url ?? null, available: row.available ?? true, featuredOfDay: row.featured_of_day ?? false, sortOrder: row.sort_order ?? 0, createdAt: row.created_at, updatedAt: row.updated_at, options: options.filter((item) => item.productId === row.id) };
}
async function loadMenu(includeUnavailable) {
  if (!ENV.supabaseUrl || !ENV.supabaseAnonKey) return { categories: [], products: [], isOpen: true };
  let categoriesQuery = supabase.from("menu_categories").select("*").order("sort_order").order("name");
  let productsQuery = supabase.from("menu_products").select("*").order("sort_order").order("name");
  let optionsQuery = supabase.from("menu_product_options").select("*").order("sort_order").order("name");
  if (!includeUnavailable) {
    categoriesQuery = categoriesQuery.eq("active", true);
    productsQuery = productsQuery.eq("available", true);
    optionsQuery = optionsQuery.eq("available", true);
  }
  const [categoriesResult, productsResult, optionsResult, settingsResult] = await Promise.all([
    categoriesQuery,
    productsQuery,
    optionsQuery,
    supabase.from("restaurant_settings").select("is_open").limit(1)
  ]);
  if (categoriesResult.error) fail(categoriesResult.error, "carregar categorias");
  if (productsResult.error) fail(productsResult.error, "carregar produtos");
  if (optionsResult.error) fail(optionsResult.error, "carregar op\xE7\xF5es");
  if (settingsResult.error) fail(settingsResult.error, "carregar status");
  const options = (optionsResult.data ?? []).map(option);
  return { categories: (categoriesResult.data ?? []).map(category), products: (productsResult.data ?? []).map((row) => product(row, options)), isOpen: settingsResult.data?.[0]?.is_open ?? true };
}
var listMenu = () => loadMenu(false);
var listAdminMenu = () => loadMenu(true);
async function upsertUser(_user) {
}
async function getUserByOpenId(_openId) {
  return void 0;
}
async function createCategory(input) {
  const { error } = await supabase.from("menu_categories").insert({ name: input.name, slug: input.slug, icon: input.icon });
  if (error) fail(error, "criar categoria");
  return listAdminMenu();
}
async function updateCategory(input) {
  const { error } = await supabase.from("menu_categories").update({ name: input.name, slug: input.slug, icon: input.icon, active: input.active }).eq("id", input.id);
  if (error) fail(error, "atualizar categoria");
  return listAdminMenu();
}
async function deleteCategory(id) {
  const { error } = await supabase.from("menu_categories").delete().eq("id", id);
  if (error) fail(error, "remover categoria");
  return listAdminMenu();
}
async function createProduct(input) {
  const { error } = await supabase.from("menu_products").insert({ category_id: input.categoryId, name: input.name, description: input.description, price: input.price, image_url: input.imageUrl ?? null, featured_of_day: input.featuredOfDay });
  if (error) fail(error, "criar produto");
  return listAdminMenu();
}
async function updateProduct(input) {
  const { error } = await supabase.from("menu_products").update({ category_id: input.categoryId, name: input.name, description: input.description, price: input.price, image_url: input.imageUrl ?? null, available: input.available, featured_of_day: input.featuredOfDay }).eq("id", input.id);
  if (error) fail(error, "atualizar produto");
  return listAdminMenu();
}
async function createProductOption(input) {
  const { error } = await supabase.from("menu_product_options").insert({ product_id: input.productId, name: input.name, description: input.description ?? null, price_delta: input.priceDelta, available: input.available });
  if (error) fail(error, "criar op\xE7\xE3o");
  return listAdminMenu();
}
async function updateProductOption(input) {
  const { error } = await supabase.from("menu_product_options").update({ product_id: input.productId, name: input.name, description: input.description ?? null, price_delta: input.priceDelta, available: input.available }).eq("id", input.id);
  if (error) fail(error, "atualizar op\xE7\xE3o");
  return listAdminMenu();
}
async function reorderProductOption(input) {
  const { data: current, error: currentError } = await supabase.from("menu_product_options").select("*").eq("id", input.id).maybeSingle();
  if (currentError) fail(currentError, "buscar op\xE7\xE3o");
  if (!current) return listAdminMenu();
  const { data: siblings, error: siblingsError } = await supabase.from("menu_product_options").select("*").eq("product_id", current.product_id).order("sort_order").order("id");
  if (siblingsError) fail(siblingsError, "buscar op\xE7\xF5es");
  const index = (siblings ?? []).findIndex((item) => item.id === current.id);
  const target = (siblings ?? [])[input.direction === "up" ? index - 1 : index + 1];
  if (target) {
    const first = await supabase.from("menu_product_options").update({ sort_order: target.sort_order }).eq("id", current.id);
    if (first.error) fail(first.error, "reordenar op\xE7\xE3o atual");
    const second = await supabase.from("menu_product_options").update({ sort_order: current.sort_order }).eq("id", target.id);
    if (second.error) fail(second.error, "reordenar op\xE7\xE3o alvo");
  }
  return listAdminMenu();
}
async function deleteProductOption(id) {
  const { error } = await supabase.from("menu_product_options").delete().eq("id", id);
  if (error) fail(error, "remover op\xE7\xE3o");
  return listAdminMenu();
}
async function deleteProduct(id) {
  const { error } = await supabase.from("menu_products").delete().eq("id", id);
  if (error) fail(error, "remover produto");
  return listAdminMenu();
}
async function setRestaurantStatus(isOpen) {
  const { data: current, error: currentError } = await supabase.from("restaurant_settings").select("id").limit(1).maybeSingle();
  if (currentError) fail(currentError, "buscar status");
  const result = current ? await supabase.from("restaurant_settings").update({ is_open: isOpen }).eq("id", current.id) : await supabase.from("restaurant_settings").insert({ is_open: isOpen });
  if (result.error) fail(result.error, "atualizar status");
  return listAdminMenu();
}

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    return decodeOAuthState(state).redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    let sessionToken = cookies.get(COOKIE_NAME);
    if (!sessionToken) {
      const authHeader = req.headers.authorization;
      if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
        sessionToken = authHeader.slice(7);
      }
    }
    const session = await this.verifySession(sessionToken);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    if (session.openId.startsWith(CRON_OPEN_ID_PREFIX)) {
      const userInfo = await this.getUserInfoWithJwt(sessionToken ?? "");
      const taskUid = userInfo.taskUid ?? null;
      if (!taskUid) {
        throw ForbiddenError("Cron session missing task_uid");
      }
      return buildCronUser(userInfo);
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionToken ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var CRON_OPEN_ID_PREFIX = "cron_";
function buildCronUser(userInfo) {
  const now = /* @__PURE__ */ new Date();
  return {
    id: -1,
    openId: userInfo.openId,
    name: userInfo.name || "Manus Scheduled Task",
    email: null,
    loginMethod: null,
    role: "user",
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
    taskUid: userInfo.taskUid ?? void 0,
    isCron: true
  };
}
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app) {
  app.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    const { nonce } = decodeOAuthState(state);
    const expectedNonce = parseCookieHeader2(req.headers.cookie ?? "")[OAUTH_STATE_COOKIE];
    if (!nonce || nonce !== expectedNonce) {
      res.status(403).json({ error: "invalid oauth state" });
      return;
    }
    res.clearCookie(OAUTH_STATE_COOKIE, { path: "/", secure: true, sameSite: "none" });
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/_core/storageProxy.ts
function registerStorageProxy(app) {
  app.get("/manus-storage/*", async (req, res) => {
    const key = req.params[0];
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }
    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      res.status(500).send("Storage proxy not configured");
      return;
    }
    try {
      const forgeUrl = new URL(
        "v1/storage/presign/get",
        ENV.forgeApiUrl.replace(/\/+$/, "") + "/"
      );
      forgeUrl.searchParams.set("path", key);
      const forgeResp = await fetch(forgeUrl, {
        headers: { Authorization: `Bearer ${ENV.forgeApiKey}` }
      });
      if (!forgeResp.ok) {
        const body = await forgeResp.text().catch(() => "");
        console.error(`[StorageProxy] forge error: ${forgeResp.status} ${body}`);
        res.status(502).send("Storage backend error");
        return;
      }
      const { url } = await forgeResp.json();
      if (!url) {
        res.status(502).send("Empty signed URL from backend");
        return;
      }
      res.set("Cache-Control", "no-store");
      res.redirect(307, url);
    } catch (err) {
      console.error("[StorageProxy] failed:", err);
      res.status(502).send("Storage proxy error");
    }
  });
}

// server/routers.ts
import { TRPCError as TRPCError3 } from "@trpc/server";
import { z as z2 } from "zod";

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/storage.ts
import { createClient as createClient2 } from "@supabase/supabase-js";
var supabase2 = createClient2(
  ENV.supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || ENV.supabaseAnonKey,
  { auth: { persistSession: false, autoRefreshToken: false } }
);
function normalizeKey(relKey) {
  return relKey.replace(/^\/+/, "");
}
function publicUrl(key) {
  return `${ENV.supabaseUrl.replace(/\/+$/, "")}/storage/v1/object/public/menu-products/${encodeURIComponent(key).replace(/%2F/g, "/")}`;
}
async function storagePut(relKey, data, contentType = "application/octet-stream") {
  const key = normalizeKey(relKey);
  const { error } = await supabase2.storage.from("menu-products").upload(key, data, { contentType, upsert: true });
  if (error) throw new Error(`[Supabase Storage] upload: ${error.message}`);
  return { key, url: publicUrl(key) };
}

// server/routers.ts
var adminProcedure2 = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError3({ code: "FORBIDDEN", message: "Acesso restrito ao administrador." });
  return next();
});
var categoryInput = z2.object({ name: z2.string().min(2).max(120), slug: z2.string().min(2).max(120), icon: z2.string().min(2).max(40) });
var productInput = z2.object({ categoryId: z2.number().int().positive(), name: z2.string().min(2).max(160), description: z2.string().min(2), price: z2.string().regex(/^\d+(\.\d{1,2})?$/), imageUrl: z2.string().url().nullable().optional(), featuredOfDay: z2.boolean().default(false) });
var optionInput = z2.object({ productId: z2.number().int().positive(), name: z2.string().min(2).max(160), description: z2.string().max(500).nullable().optional(), priceDelta: z2.string().regex(/^\d+(\.\d{1,2})?$/), available: z2.boolean().default(true) });
var appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    })
  }),
  menu: router({
    public: publicProcedure.query(() => listMenu()),
    admin: adminProcedure2.query(() => listAdminMenu()),
    categories: router({
      create: adminProcedure2.input(categoryInput).mutation(({ input }) => createCategory(input)),
      update: adminProcedure2.input(categoryInput.extend({ id: z2.number().int().positive(), active: z2.boolean() })).mutation(({ input }) => updateCategory(input)),
      remove: adminProcedure2.input(z2.object({ id: z2.number().int().positive() })).mutation(({ input }) => deleteCategory(input.id))
    }),
    products: router({
      create: adminProcedure2.input(productInput).mutation(({ input }) => createProduct(input)),
      update: adminProcedure2.input(productInput.extend({ id: z2.number().int().positive(), available: z2.boolean() })).mutation(({ input }) => updateProduct(input)),
      remove: adminProcedure2.input(z2.object({ id: z2.number().int().positive() })).mutation(({ input }) => deleteProduct(input.id)),
      options: router({
        create: adminProcedure2.input(optionInput).mutation(({ input }) => createProductOption(input)),
        update: adminProcedure2.input(optionInput.extend({ id: z2.number().int().positive() })).mutation(({ input }) => updateProductOption(input)),
        reorder: adminProcedure2.input(z2.object({ id: z2.number().int().positive(), direction: z2.enum(["up", "down"]) })).mutation(({ input }) => reorderProductOption(input)),
        remove: adminProcedure2.input(z2.object({ id: z2.number().int().positive() })).mutation(({ input }) => deleteProductOption(input.id))
      }),
      uploadImage: adminProcedure2.input(z2.object({ dataUrl: z2.string().regex(/^data:image\/(png|jpeg|jpg|webp);base64,/), fileName: z2.string().min(1).max(160) })).mutation(async ({ input }) => {
        const [meta, payload] = input.dataUrl.split(",", 2);
        const contentType = meta.match(/^data:(.*);base64$/)?.[1] ?? "image/jpeg";
        const buffer = Buffer.from(payload, "base64");
        if (buffer.length > 8 * 1024 * 1024) throw new TRPCError3({ code: "BAD_REQUEST", message: "A imagem deve ter no m\xE1ximo 8 MB." });
        return storagePut(`menu-products/${input.fileName}`, buffer, contentType);
      })
    }),
    status: adminProcedure2.input(z2.object({ isOpen: z2.boolean() })).mutation(({ input }) => setRestaurantStatus(input.isOpen))
  })
});

// server/supabaseAuth.ts
import { createClient as createClient3 } from "@supabase/supabase-js";
var supabaseAuth = createClient3(ENV.supabaseUrl, ENV.supabaseAnonKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});
async function authenticateSupabaseAdmin(accessToken) {
  if (!accessToken || !ENV.supabaseUrl || !ENV.supabaseAnonKey) return null;
  const { data, error } = await supabaseAuth.auth.getUser(accessToken);
  if (error || !data.user?.email) return null;
  if (data.user.email.toLowerCase() !== ENV.supabaseAdminEmail.toLowerCase()) return null;
  const now = /* @__PURE__ */ new Date();
  return {
    id: -2,
    openId: `supabase:${data.user.id}`,
    name: data.user.user_metadata?.full_name || data.user.email,
    email: data.user.email,
    loginMethod: "email",
    role: "admin",
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now
  };
}

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  const authorization = opts.req.headers.authorization;
  const bearerToken = typeof authorization === "string" && authorization.startsWith("Bearer ") ? authorization.slice(7) : null;
  user = await authenticateSupabaseAdmin(bearerToken);
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/app.ts
function createApiApp() {
  const app = express();
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  return app;
}
var app_default = createApiApp;
export {
  createApiApp,
  app_default as default
};
