import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:3000'
const TEST_EMAIL = `test_${Date.now()}@example.com`
const TEST_USERNAME = `testuser${Date.now()}`
const TEST_PASSWORD = 'TestPass123!'

test.describe('Authentication flows', () => {

  test('unauthenticated user is redirected to /login', async ({ page }) => {
    // Clear cookies to ensure no session
    await page.context().clearCookies()
    await page.goto(`${BASE}/feed`)
    await expect(page).toHaveURL(/\/login/)
    await expect(page.locator('text=Welcome back')).toBeVisible()
  })

  test('unauthenticated user visiting root is redirected to /login', async ({ page }) => {
    await page.context().clearCookies()
    await page.goto(BASE)
    await expect(page).toHaveURL(/\/login/)
  })

  test('login page renders all required fields', async ({ page }) => {
    await page.context().clearCookies()
    await page.goto(`${BASE}/login`)
    await expect(page.locator('input#identifier')).toBeVisible()
    await expect(page.locator('input#password')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
    await expect(page.locator('text=Sign up')).toBeVisible()
  })

  test('register page renders all required fields', async ({ page }) => {
    await page.context().clearCookies()
    await page.goto(`${BASE}/register`)
    await expect(page.locator('input#first_name')).toBeVisible()
    await expect(page.locator('input#last_name')).toBeVisible()
    await expect(page.locator('input#username')).toBeVisible()
    await expect(page.locator('input#email')).toBeVisible()
    await expect(page.locator('input#password')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.context().clearCookies()
    await page.goto(`${BASE}/login`)
    await page.fill('input#identifier', 'wrong@example.com')
    await page.fill('input#password', 'wrongpassword')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Invalid credentials')).toBeVisible({ timeout: 10_000 })
    await expect(page).toHaveURL(/\/login/)
  })

  test('register with short username shows validation error', async ({ page }) => {
    await page.context().clearCookies()
    await page.goto(`${BASE}/register`)
    await page.fill('input#first_name', 'Test')
    await page.fill('input#last_name', 'User')
    await page.fill('input#username', 'ab')   // too short
    await page.fill('input#email', 'test@example.com')
    await page.fill('input#password', 'password123')
    await page.click('button[type="submit"]')
    // Should show validation error from Zod or stay on register
    await expect(page).toHaveURL(/\/register/)
  })

  test('register with valid data, login with email, login with username, and redirect guard', async ({ page }) => {
    await page.context().clearCookies()

    // Register
    await page.goto(`${BASE}/register`)
    await page.fill('input#first_name', 'Test')
    await page.fill('input#last_name', 'User')
    await page.fill('input#username', TEST_USERNAME)
    await page.fill('input#email', TEST_EMAIL)
    await page.fill('input#password', TEST_PASSWORD)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/feed/, { timeout: 15_000 })
    await expect(page.locator('text=SocialConnect')).toBeVisible()

    // Authenticated user visiting /login should be redirected to /feed
    await page.goto(`${BASE}/login`)
    await expect(page).toHaveURL(/\/feed/, { timeout: 5_000 })

    // Logout
    await page.click('button:has-text("Log out")')
    await expect(page).toHaveURL(/\/login/, { timeout: 5_000 })

    // Login with email
    await page.fill('input#identifier', TEST_EMAIL)
    await page.fill('input#password', TEST_PASSWORD)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/feed/, { timeout: 10_000 })

    // Logout
    await page.click('button:has-text("Log out")')
    await expect(page).toHaveURL(/\/login/, { timeout: 5_000 })

    // Login with username
    await page.fill('input#identifier', TEST_USERNAME)
    await page.fill('input#password', TEST_PASSWORD)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/feed/, { timeout: 10_000 })
  })

})
