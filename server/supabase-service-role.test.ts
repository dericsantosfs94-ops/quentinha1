import { describe, expect, it } from "vitest";

describe("Supabase service role configuration", () => {
  it("can read the restaurant settings endpoint with the configured secret", async () => {
    const url = process.env.SUPABASE_URL;
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
    expect(url, "SUPABASE_URL must be configured").toBeTruthy();
    expect(serviceRole, "SUPABASE_SERVICE_ROLE_KEY must be configured").toBeTruthy();

    const response = await fetch(`${url}/rest/v1/restaurant_settings?select=id&limit=1`, {
      headers: {
        apikey: serviceRole!,
        Authorization: `Bearer ${serviceRole!}`,
      },
    });

    expect(response.status, await response.text()).toBe(200);
  }, 15_000);
});
