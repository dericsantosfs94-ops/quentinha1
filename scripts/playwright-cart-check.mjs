import { chromium } from "playwright";

const baseUrl = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000/";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
try {
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Nosso cardápio" }).waitFor();
  const card = page.locator("article").first();
  const productName = (await card.locator("h3").innerText()).trim();
  await card.getByRole("button", { name: /Adicionar/ }).click();
  await page.getByRole("button", { name: /Ver pedido/ }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByText(productName).waitFor();
  const image = dialog.locator(`img[alt="${productName}"]`);
  const imageState = await image.evaluate((element) => ({ src: element.src, naturalWidth: element.naturalWidth, naturalHeight: element.naturalHeight }));
  if (imageState.naturalWidth <= 0 || imageState.naturalHeight <= 0) throw new Error(`Imagem do carrinho não carregou: ${JSON.stringify(imageState)}`);
  await dialog.getByRole("button", { name: "Aumentar quantidade" }).click();
  await dialog.getByText("2", { exact: true }).waitFor();
  if (!(await dialog.getByText("R$ 50,00", { exact: true }).count())) throw new Error("Subtotal não foi atualizado para R$ 50,00");
  console.log(JSON.stringify({ ok: true, baseUrl, productName, image: imageState, subtotal: "R$ 50,00" }));
} finally {
  await browser.close();
}
