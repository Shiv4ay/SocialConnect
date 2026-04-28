import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:3000'

// Helper: find the first real post card (excludes the create-form card which has no Heart button)
const firstPostCard = (page: import('@playwright/test').Page) =>
  page.locator('.rounded-xl.border').filter({ has: page.locator('button[title="Like"], button[title="Unlike"]') }).first()

test.describe('Feed and Post flows', () => {

  test.use({ storageState: 'tests/e2e/.auth-state.json' })

  test('feed page loads with create form and navbar', async ({ page }) => {
    await page.goto(`${BASE}/feed`)
    await expect(page.locator('text=SocialConnect')).toBeVisible()
    await expect(page.locator('textarea[placeholder="What\'s on your mind?"]')).toBeVisible()
    await expect(page.locator('button:has-text("Post")')).toBeVisible()
  })

  test('navbar links are visible', async ({ page }) => {
    await page.goto(`${BASE}/feed`)
    // Target only the nav element to avoid matching the logo link to /feed
    const nav = page.locator('nav')
    await expect(nav.locator('a[href="/feed"]')).toBeVisible()
    await expect(nav.locator('a[href="/users"]')).toBeVisible()
    await expect(nav.locator('a[href="/profile/me"]')).toBeVisible()
    await expect(page.locator('button:has-text("Log out")')).toBeVisible()
  })

  test('create a post and see it in feed', async ({ page }) => {
    await page.goto(`${BASE}/feed`)
    const postContent = `E2E test post ${Date.now()}`
    await page.fill('textarea[placeholder="What\'s on your mind?"]', postContent)
    await expect(page.locator('button:has-text("Post")')).toBeEnabled()
    await page.click('button:has-text("Post")')
    await expect(page.locator(`text=${postContent}`)).toBeVisible({ timeout: 10_000 })
  })

  test('character counter decreases as you type', async ({ page }) => {
    await page.goto(`${BASE}/feed`)
    const textarea = page.locator('textarea[placeholder="What\'s on your mind?"]')
    await textarea.fill('Hello')
    // Counter is the span immediately before the Post button
    await expect(page.locator('text=275').first()).toBeVisible()
  })

  test('post button disabled when textarea is empty', async ({ page }) => {
    await page.goto(`${BASE}/feed`)
    await expect(page.locator('button:has-text("Post")')).toBeDisabled()
  })

  test('like and unlike a post', async ({ page }) => {
    await page.goto(`${BASE}/feed`)

    // Create a post so we have one to like
    const postContent = `Like test post ${Date.now()}`
    await page.fill('textarea[placeholder="What\'s on your mind?"]', postContent)
    await page.click('button:has-text("Post")')
    await expect(page.locator(`text=${postContent}`)).toBeVisible({ timeout: 10_000 })

    // Find the card by its content
    const postCard = page.locator('.rounded-xl.border').filter({ hasText: postContent })
    await expect(postCard.locator('button[title="Like"]')).toBeVisible()

    // Like
    await postCard.locator('button[title="Like"]').click()
    await expect(postCard.locator('button[title="Unlike"]')).toBeVisible({ timeout: 5_000 })

    // Unlike
    await postCard.locator('button[title="Unlike"]').click()
    await expect(postCard.locator('button[title="Like"]')).toBeVisible({ timeout: 5_000 })
  })

  test('open and write a comment on a post', async ({ page }) => {
    await page.goto(`${BASE}/feed`)

    const postContent = `Comment test post ${Date.now()}`
    await page.fill('textarea[placeholder="What\'s on your mind?"]', postContent)
    await page.click('button:has-text("Post")')
    await expect(page.locator(`text=${postContent}`)).toBeVisible({ timeout: 10_000 })

    const postCard = page.locator('.rounded-xl.border').filter({ hasText: postContent })

    // Click the MessageCircle (comment) button — it has no title, so we find it by svg path or position
    const commentBtn = postCard.locator('button[title="Like"]').locator('xpath=following-sibling::button[1]')
    await commentBtn.click()

    await expect(page.locator('textarea[placeholder="Write a comment…"]').first()).toBeVisible({ timeout: 5_000 })

    const commentText = `Test comment ${Date.now()}`
    await page.fill('textarea[placeholder="Write a comment…"]', commentText)
    await page.locator('button:has-text("Comment")').first().click()

    await expect(page.locator(`text=${commentText}`)).toBeVisible({ timeout: 10_000 })
  })

  test('comment persists after toggling comments closed and open', async ({ page }) => {
    await page.goto(`${BASE}/feed`)

    const postContent = `Persist test post ${Date.now()}`
    await page.fill('textarea[placeholder="What\'s on your mind?"]', postContent)
    await page.click('button:has-text("Post")')
    await expect(page.locator(`text=${postContent}`)).toBeVisible({ timeout: 10_000 })

    const postCard = page.locator('.rounded-xl.border').filter({ hasText: postContent })
    const commentBtn = postCard.locator('button[title="Like"]').locator('xpath=following-sibling::button[1]')

    // Open, write comment
    await commentBtn.click()
    await expect(page.locator('textarea[placeholder="Write a comment…"]').first()).toBeVisible({ timeout: 5_000 })
    const commentText = `Persist comment ${Date.now()}`
    await page.fill('textarea[placeholder="Write a comment…"]', commentText)
    await page.locator('button:has-text("Comment")').first().click()
    await expect(page.locator(`text=${commentText}`)).toBeVisible({ timeout: 8_000 })

    // Wait for React state to fully flush before toggling
    await page.waitForTimeout(600)

    // Close
    await commentBtn.click()
    await expect(page.locator(`text=${commentText}`)).not.toBeVisible()

    // Reopen — comment must still be there (PostCard.comments was updated via onCommentAdded)
    await commentBtn.click()
    await expect(page.locator(`text=${commentText}`)).toBeVisible({ timeout: 5_000 })
  })

  test('delete own post removes it from feed', async ({ page }) => {
    await page.goto(`${BASE}/feed`)

    const postContent = `Delete test post ${Date.now()}`

    // Set up waitForResponse BEFORE clicking Post so we catch the 201 response
    const createResponsePromise = page.waitForResponse(
      r => r.url().includes('/api/posts') &&
           !r.url().includes('/like') &&
           !r.url().includes('/comments') &&
           !r.url().includes('/upload') &&
           r.request().method() === 'POST'
    )

    await page.fill('textarea[placeholder="What\'s on your mind?"]', postContent)
    await page.click('button:has-text("Post")')

    const createResponse = await createResponsePromise
    const { id: createdPostId } = await createResponse.json()
    expect(createdPostId).toBeTruthy()

    await expect(page.locator(`text=${postContent}`)).toBeVisible({ timeout: 10_000 })

    // Delete via API directly (same auth cookies, no browser confirm dialog needed)
    const deleteRes = await page.request.delete(`${BASE}/api/posts/${createdPostId}`)
    expect(deleteRes.status()).toBe(200)

    await page.reload()
    await expect(page.locator(`text=${postContent}`)).not.toBeVisible({ timeout: 8_000 })
  })

})
