import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("menu admin authorization", () => {
  it("allows an admin to read the catalog contract", async () => {
    const ctx = {
      user: { id: 1, openId: "admin", name: "Admin", email: null, loginMethod: "manus", role: "admin", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
      req: { protocol: "https", headers: {} },
      res: { clearCookie: () => undefined },
    } as unknown as TrpcContext;
    const caller = appRouter.createCaller(ctx);
    const result = await caller.menu.admin();
    expect(result).toEqual(expect.objectContaining({ categories: expect.any(Array), products: expect.any(Array) }));
  });

  it("rejects a regular authenticated user", async () => {
    const ctx = {
      user: { id: 2, openId: "regular", name: "Regular", email: null, loginMethod: "manus", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
      req: { protocol: "https", headers: {} },
      res: { clearCookie: () => undefined },
    } as unknown as TrpcContext;
    const caller = appRouter.createCaller(ctx);
    await expect(caller.menu.admin()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
