import { chromium } from "playwright";

const baseUrl = process.env.PLAYWRIGHT_BASE_URL || "https://cantinadochale.vercel.app/";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
try {
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  const card = page.locator("article").first();
  const productName = (await card.locator("h3").innerText()).trim();
  await card.getByRole("button", { name: /Adicionar/ }).click();
  await page.getByRole("button", { name: /Ver pedido/ }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: /Continuar pedido/ }).click();
  await dialog.getByRole("textbox", { name: "Seu nome" }).fill("Teste runtime");
  await dialog.getByRole("textbox", { name: "Endereço de entrega" }).fill("Rua de teste, 1");
  await dialog.getByRole("button", { name: "Pix via WhatsApp" }).click();
  await page.evaluate(() => {
    window.open = ((...args) => {
      window.__capturedWhatsAppUrl = String(args[0] ?? "");
      return null;
    });
  });
  const sendButton = dialog.getByRole("button", { name: /Envio indisponível enquanto fechado|Enviar pedido no WhatsApp/ });
  const disabled = await sendButton.isDisabled();
  const statusText = await dialog.getByText(/A loja está fechada|Você será levado ao WhatsApp/).innerText();
  const storeClosed = statusText.includes("fechada");
  if (!disabled) await sendButton.click();
  const capturedWhatsAppUrl = await page.evaluate(() => window.__capturedWhatsAppUrl ?? "");
  console.log(JSON.stringify({ ok: true, baseUrl, productName, checkoutOpened: true, payment: "pix", storeClosed, sendDisabled: disabled, statusText, capturedWhatsAppUrl }));
  if (storeClosed && (!disabled || capturedWhatsAppUrl)) throw new Error("O envio deveria estar bloqueado enquanto a loja está fechada");
  if (!storeClosed && (disabled || !capturedWhatsAppUrl.includes("api.whatsapp.com"))) throw new Error("O link do WhatsApp não foi capturado enquanto a loja estava aberta");
} finally {
  await browser.close();
}
