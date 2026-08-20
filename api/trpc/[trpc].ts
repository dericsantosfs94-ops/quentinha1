import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createApiApp } from "../../server/app.ts";

const app = createApiApp();

export default function handler(req: VercelRequest, res: VercelResponse) {
  return app(req, res);
}
