import { chromium, FullConfig } from '@playwright/test'

const BASE = 'http://localhost:3000'
const SETUP_EMAIL = `setup_${Date.now()}@e2e.test`
const SETUP_USERNAME = `e2euser${Date.now()}`
const SETUP_PASSWORD = 'TestPass123!'

export default async function globalSetup(_config: FullConfig) {
  const browser = await chromium.launch()
  const page = await browser.newPage()

  await page.goto(`${BASE}/register`)
  await page.fill('input#first_name', 'E2E')
  await page.fill('input#last_name', 'User')
  await page.fill('input#username', SETUP_USERNAME)
  await page.fill('input#email', SETUP_EMAIL)
  await page.fill('input#password', SETUP_PASSWORD)
  await page.click('button[type="submit"]')

  // Wait for redirect to /feed
  await page.waitForURL(/\/feed/, { timeout: 20_000 })

  // Save storage state (cookies + localStorage)
  await page.context().storageState({ path: 'tests/e2e/.auth-state.json' })
  await browser.close()

  // Expose credentials for tests that need them
  process.env.E2E_EMAIL = SETUP_EMAIL
  process.env.E2E_USERNAME = SETUP_USERNAME
  process.env.E2E_PASSWORD = SETUP_PASSWORD
}
