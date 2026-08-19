import { beforeEach, describe, expect, it, vi } from "vitest";

const getUser = vi.hoisted(() => vi.fn());
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({ auth: { getUser } }),
}));

import { authenticateSupabaseAdmin } from "./supabaseAuth";

describe("Supabase admin authentication", () => {
  beforeEach(() => getUser.mockReset());

  it("rejects requests without a bearer token", async () => {
    await expect(authenticateSupabaseAdmin(null)).resolves.toBeNull();
    expect(getUser).not.toHaveBeenCalled();
  });

  it("rejects a valid Supabase user with a different email", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "u-1", email: "other@example.com" } }, error: null });
    await expect(authenticateSupabaseAdmin("token")).resolves.toBeNull();
  });

  it("maps the configured Supabase admin email to the admin role", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "u-2", email: "admimsupabase@proton.me" } }, error: null });
    await expect(authenticateSupabaseAdmin("token")).resolves.toMatchObject({
      email: "admimsupabase@proton.me",
      role: "admin",
      openId: "supabase:u-2",
    });
  });
});
