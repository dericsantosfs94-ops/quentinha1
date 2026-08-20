import { describe, expect, it } from "vitest";

describe("Supabase service key configuration", () => {
  it("can read a lightweight catalog endpoint without mutating data", async () => {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error("SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY ausentes");

    const response = await fetch(`${url}/rest/v1/menu_categories?select=id&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });

    expect(response.ok).toBe(true);
    expect(response.headers.get("content-type")).toContain("application/json");
  });
});
