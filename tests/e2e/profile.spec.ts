import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:3000'

test.describe('Profile flows', () => {

  test.use({ storageState: 'tests/e2e/.auth-state.json' })

  test('profile page loads for /profile/me', async ({ page }) => {
    await page.goto(`${BASE}/profile/me`)
    await expect(page).toHaveURL(/\/profile\//, { timeout: 10_000 })
    // Stats section uses spans with exact text
    // Target the stat spans (not the "Posts" h2 heading below)
    await expect(page.locator('span.text-slate-500').filter({ hasText: /^Posts$/ }).first()).toBeVisible()
    await expect(page.locator('span.text-slate-500').filter({ hasText: /^Followers$/ })).toBeVisible()
    await expect(page.locator('span.text-slate-500').filter({ hasText: /^Following$/ })).toBeVisible()
    await expect(page.locator('text=Edit profile')).toBeVisible()
  })

  test('edit profile page loads with form fields', async ({ page }) => {
    await page.goto(`${BASE}/profile/edit`)
    await expect(page.locator('text=Edit Profile')).toBeVisible()
    await expect(page.locator('textarea[placeholder*="Tell people"]')).toBeVisible()
    await expect(page.locator('input[placeholder*="yourwebsite"]')).toBeVisible()
    await expect(page.locator('input[placeholder*="City"]')).toBeVisible()
    await expect(page.locator('button:has-text("Save changes")')).toBeVisible()
  })

  test('bio character counter shows correctly', async ({ page }) => {
    await page.goto(`${BASE}/profile/edit`)
    const textarea = page.locator('textarea[placeholder*="Tell people"]')
    await textarea.fill('Hello bio')
    await expect(page.locator('text=9/160')).toBeVisible()
  })

  test('discover users page loads', async ({ page }) => {
    await page.goto(`${BASE}/users`)
    await expect(page.locator('text=Discover People')).toBeVisible()
    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible()
  })

  test('own profile does not show follow button', async ({ page }) => {
    await page.goto(`${BASE}/profile/me`)
    await expect(page).toHaveURL(/\/profile\//, { timeout: 10_000 })
    await expect(page.locator('button:has-text("Follow")')).not.toBeVisible()
    await expect(page.locator('text=Edit profile')).toBeVisible()
  })

})
