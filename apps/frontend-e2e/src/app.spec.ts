import { test, expect, type Page } from '@playwright/test';

const buildUser = () => {
  const stamp = Date.now();
  return {
    name: `E2E User ${stamp}`,
    email: `e2e_${stamp}@zampastore.test`,
    password: 'Demo123!',
  };
};

const registerViaUi = async (page: Page) => {
  const user = buildUser();
  await page.goto('/registrazione');
  await page.locator('#username').fill(user.name);
  await page.locator('#email').fill(user.email);
  await page.locator('#password').fill(user.password);
  await page.locator('#confirmPassword').fill(user.password);
  await page.getByRole('button', { name: 'Crea account' }).click();
  await page.waitForURL('**/');
  return user;
};

test.beforeEach(async ({ page }) => {
  await page.context().clearCookies();
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
});

test('checkout flow: register → add to cart → confirmation', async ({
  page,
}) => {
  await registerViaUi(page);

  await page.goto('/prodotti');
  await page.waitForResponse((response) =>
    response.url().includes('/api/products') && response.ok(),
  );
  const productCard = page.locator('app-product-card').first();
  await expect(productCard).toBeVisible();
  const firstAdd = productCard.getByRole('button', { name: 'Aggiungi' });
  await expect(firstAdd).toBeVisible();
  await firstAdd.click();

  await page.goto('/carrello');
  await expect(
    page.getByRole('button', { name: 'Vai al checkout' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Vai al checkout' }).click();

  await page.locator('#firstName').fill('Maria');
  await page.locator('#lastName').fill('Rossi');
  await page.locator('#address').fill('Via Roma 10');
  await page.locator('#city').fill('Torino');
  await page.locator('#postalCode').fill('10100');
  await page.locator('#country').fill('Italia');

  await page.route('**/api/payments/checkout-session', async (route) => {
    const headers = {
      ...route.request().headers(),
      'x-e2e-test': 'true',
    };
    await route.continue({ headers });
  });

  await page.getByRole('button', { name: 'Paga con Stripe (test)' }).click();
  await page.waitForURL('**/ordine-confermato**');
  await expect(
    page.getByRole('heading', { name: 'Ordine confermato' }),
  ).toBeVisible();

  await page.getByRole('button', { name: 'I miei ordini' }).click();
  await page.waitForURL('**/ordini');
  await expect(page.getByRole('columnheader', { name: 'Stato' })).toBeVisible();
  await expect(page.getByText('Pagato')).toBeVisible();
});

test('ordini richiede autenticazione', async ({ page }) => {
  await page.goto('/ordini');
  await page.waitForURL('**/login**');
  await expect(page.locator('.auth-card')).toBeVisible();
  await expect(page.locator('form.auth-form #email')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Accedi' })).toBeVisible();
});
