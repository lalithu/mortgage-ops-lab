import { expect, test } from '@playwright/test';

test('connected golden path, model guardrails, persistence, and reset', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await page.getByRole('button', { name: 'Explore the Demo', exact: true }).click();
  await expect(page.getByText('Maya Chen', { exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Open loan', exact: true }).click();
  const underwriting = page.getByRole('button', { name: 'Advance to Underwriting Review', exact: true });
  await expect(underwriting).toBeDisabled();
  await page.getByRole('button', { name: 'Verify insurance', exact: true }).click();
  await underwriting.click();
  await page.getByRole('button', { name: 'Advance to Approved', exact: true }).click();
  await page.getByRole('button', { name: 'Advance to Funded', exact: true }).click();
  await page.getByRole('button', { name: 'List on Marketplace', exact: true }).click();
  await page.getByRole('button', { name: 'Marketplace', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Meridian Credit', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Accept recommended offer', exact: true }).click();
  await page.reload();
  await page.getByRole('button', { name: 'Origination', exact: true }).click();
  await expect(page.getByText('Sold', { exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: /^AI Review/ }).click();
  await page.getByLabel('Recommendation fixture').selectOption('bid');
  await page.getByRole('button', { name: 'Validate recommendation', exact: true }).click();
  await expect(page.getByText('Quoted price alone ignores explicit fees; the recommended offer does not maximize net proceeds.', { exact: true })).toBeVisible();
  await expect(page.getByText(/Meridian Credit \(o2\) maximizes net proceeds: 48690000 cents/)).toBeVisible();
  await page.getByRole('button', { name: 'Reset Demo', exact: true }).filter({visible:true}).click();
  await page.getByRole('button', { name: 'Origination', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Verify insurance', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Advance to Underwriting Review', exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test('mobile shell is usable without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Reset Demo', exact: true }).filter({visible:true})).toBeVisible();
  await expect(page.getByRole('button', { name: 'Explore the Demo', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await expect(page.getByRole('main')).toBeVisible();
});
