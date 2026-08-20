import { chromium } from "playwright";

const baseUrl = process.env.PLAYWRIGHT_BASE_URL || "https://cantinadochale.vercel.app/";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
try {
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  const filters = ["Tudo", "Pratos caseiros", "Acompanhamentos", "Bebidas", "Sobremesas"];
  const results = [];
  for (const name of filters) {
    const button = page.getByRole("button", { name, exact: true });
    await button.click();
    const className = await button.getAttribute("class");
    if (!className?.includes("bg-[#8b1e23]")) throw new Error(`Filtro não ficou ativo: ${name}`);
    results.push({ name, active: true, cards: await page.locator("article").count() });
  }
  console.log(JSON.stringify({ ok: true, baseUrl, results }));
} finally {
  await browser.close();
}
