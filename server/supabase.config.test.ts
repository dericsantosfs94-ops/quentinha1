import { describe, expect, it } from "vitest";

describe("Supabase configuration", () => {
  it("accepts the configured URL and anon key", async () => {
    const url = process.env.SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY;
    expect(url).toMatch(/^https:\/\/[^/]+\.supabase\.co\/?$/);
    expect(anonKey).toMatch(/^(eyJ|sb_publishable_)/);

    const response = await fetch(`${url!.replace(/\/$/, "")}/auth/v1/settings`, {
      headers: { apikey: anonKey!, Authorization: `Bearer ${anonKey!}` },
    });

    expect(response.ok).toBe(true);
  }, 15000);
});
