import { build } from "esbuild";

await build({
  entryPoints: ["server/app.ts"],
  outfile: "api/trpc/app.mjs",
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node22",
  packages: "external",
  sourcemap: false,
  logLevel: "info",
});
