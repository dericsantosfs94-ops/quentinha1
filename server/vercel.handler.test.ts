import { createServer, type Server } from "node:http";
import { afterEach, describe, expect, it } from "vitest";
import { createApiApp } from "./app";

const runningServers: Server[] = [];

afterEach(async () => {
  await Promise.all(
    runningServers.splice(0).map(
      server =>
        new Promise<void>(resolve => {
          if (!server.listening) return resolve();
          server.close(() => resolve());
        }),
    ),
  );
});

describe("Vercel serverless handler", () => {
  it("responde ao procedimento público sem iniciar um servidor persistente", async () => {
    const app = createApiApp();
    expect(typeof app).toBe("function");

    const server = createServer(app);
    runningServers.push(server);
    await new Promise<void>(resolve => server.listen(0, "127.0.0.1", () => resolve()));

    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Porta de teste indisponível");

    const response = await fetch(`http://127.0.0.1:${address.port}/api/trpc/menu.public`);
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.result?.data?.json).toMatchObject({
      categories: expect.any(Array),
      products: expect.any(Array),
      isOpen: expect.any(Boolean),
    });
  });
});
