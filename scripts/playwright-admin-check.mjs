import { chromium } from "playwright";

const baseURL = process.env.E2E_BASE_URL || "http://127.0.0.1:3000";
const email = process.env.E2E_ADMIN_EMAIL;
const password = process.env.E2E_ADMIN_PASSWORD;
if (!email || !password) throw new Error("Defina E2E_ADMIN_EMAIL e E2E_ADMIN_PASSWORD para executar o teste admin.");

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();
const testName = `TESTE PLAYWRIGHT ${Date.now()}`;
const testDescription = "Item temporário criado pelo teste automatizado e removido ao final.";
let originalStatus;

try {
  await page.goto(`${baseURL}/admin`, { waitUntil: "networkidle" });
  if (await page.getByLabel("E-mail").count()) {
    await page.getByLabel("E-mail").fill(email);
    await page.getByLabel("Senha").fill(password);
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.getByRole("heading", { name: "Painel da Cantina" }).waitFor();
  }

  const statusHeading = page.locator("text=STATUS DO RESTAURANTE").locator("..").getByRole("heading");
  originalStatus = (await statusHeading.textContent())?.trim();
  await page.getByRole("button", { name: "Alternar status" }).click();
  await page.waitForLoadState("networkidle");
  const toggledStatus = (await statusHeading.textContent())?.trim();
  if (toggledStatus === originalStatus) throw new Error("O status da loja não mudou após o clique.");
  await page.getByRole("button", { name: "Alternar status" }).click();
  await page.waitForLoadState("networkidle");
  if ((await statusHeading.textContent())?.trim() !== originalStatus) throw new Error("O status da loja não foi restaurado.");

  await page.getByRole("button", { name: "Novo item" }).click();
  await page.getByPlaceholder("Nome do prato").fill(testName);
  const category = page.locator("select").filter({ has: page.locator("option") }).first();
  await category.selectOption({ index: 1 });
  await page.getByPlaceholder("Descrição").fill(testDescription);
  await page.getByPlaceholder(/Preço/).fill("19.90");
  await page.getByLabel("Enviar foto").locator("input[type=file]").setInputFiles({ name: "admin-test.png", mimeType: "image/png", buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=", "base64") });
  await page.getByRole("button", { name: "Salvar item" }).click();
  await page.getByText(testName).waitFor();

  await page.getByText(testName).getByRole("button", { name: "Editar" }).click();
  await page.getByPlaceholder("Descrição").fill(`${testDescription} editado`);
  await page.getByRole("button", { name: "Salvar item" }).click();
  await page.getByText(testName).waitFor();

  await page.getByText(testName).getByRole("button", { name: `Remover ${testName}` }).click();
  await page.waitForLoadState("networkidle");
  if (await page.getByText(testName).count()) throw new Error("O item temporário não foi removido.");

  console.log(JSON.stringify({ ok: true, baseURL, status: "alternado e restaurado", item: "criado, editado, foto enviada e removido" }));
} finally {
  await browser.close();
}
