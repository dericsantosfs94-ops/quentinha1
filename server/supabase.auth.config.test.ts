import { describe, expect, it } from "vitest";

describe("Supabase Auth configuration", () => {
  it("responds to the public Auth settings endpoint", async () => {
    const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY;
    expect(url).toMatch(/^https:\/\//);
    const adminEmail = process.env.SUPABASE_ADMIN_EMAIL;
    expect(key).toBeTruthy();
    expect(adminEmail).toBe("admimsupabase@proton.me");

    const response = await fetch(`${url}/auth/v1/settings`, {
      headers: { apikey: key as string },
    });
    expect(response.ok).toBe(true);
    const body = (await response.json()) as { external?: Record<string, boolean> };
    expect(body).toHaveProperty("external");
  });
});
