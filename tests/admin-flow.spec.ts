import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Force headed mode so the user can watch the browser execute the actions
test.use({ headless: false });

const DUMMY_IMAGE_PATH = path.join(__dirname, 'temp-test-image.png');

test.describe('SANJI GAMING Admin E2E Flow', () => {
  // Create a dummy 1x1 transparent PNG image before tests run
  test.beforeAll(async () => {
    const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const buffer = Buffer.from(pngBase64, 'base64');
    fs.mkdirSync(path.dirname(DUMMY_IMAGE_PATH), { recursive: true });
    fs.writeFileSync(DUMMY_IMAGE_PATH, buffer);
  });

  // Delete the dummy image after tests complete
  test.afterAll(async () => {
    if (fs.existsSync(DUMMY_IMAGE_PATH)) {
      fs.unlinkSync(DUMMY_IMAGE_PATH);
    }
  });

  test('Login, Create Sale Post, and Create Recovery Post', async ({ page }) => {
    // ----------------------------------------------------
    // 1. ADMIN LOGIN
    // ----------------------------------------------------
    console.log('🔑 Navigating to Login Page...');
    await page.goto('http://localhost:5173/admin/login');

    // Fill in credentials
    await page.locator('input[type="email"]').fill('admin123@gmail.com');
    await page.locator('input[type="password"]').fill('admin123');

    // Submit form and wait for navigation/dashboard indicators
    console.log('🔐 Logging in...');
    await page.locator('button[type="submit"]').click();
    
    // Wait for the URL to contain '/admin/dashboard'
    await expect(page).toHaveURL(/.*\/admin\/dashboard/);
    console.log('✅ Successfully reached Admin Dashboard.');

    // ----------------------------------------------------
    // 2. CREATE ACCOUNT SALE POST
    // ----------------------------------------------------
    console.log('🏷️ Creating a new Sale Listing...');
    await page.getByRole('button', { name: 'Create New Post' }).click();
    await expect(page).toHaveURL(/.*\/admin\/posts\/new/);

    // Fill basic details
    await page.locator('input[placeholder*="Legendary S1"]').fill('Playwright Test CoD Mobile Account');
    await page.locator('textarea[placeholder*="Describe the account"]').fill('This is an automated test account created by Playwright with premium stats, S1 skins, and legendary ranks.');

    // Fill Sale details
    await page.locator('input[type="number"]').fill('15000');

    // Select "Activision" Platform
    await page.getByRole('button', { name: 'Activision', exact: true }).click();

    // Select "Full Access" Access Type
    await page.getByRole('button', { name: 'Full Access', exact: true }).click();

    // Upload dummy image directly via setInputFiles
    console.log('📤 Uploading listing image...');
    await page.locator('input[type="file"]').setInputFiles(DUMMY_IMAGE_PATH);

    // Wait for file preview to show up
    await page.waitForSelector('img[alt^="Preview"]');

    // Submit post
    console.log('💾 Submitting Sale Listing...');
    await page.getByRole('button', { name: 'Create Post' }).click();

    // Verify redirect and success message
    await expect(page).toHaveURL(/.*\/admin\/dashboard/);
    console.log('✅ Sale Listing created successfully!');

    // ----------------------------------------------------
    // 3. CREATE RECOVERY POST
    // ----------------------------------------------------
    console.log('🔒 Creating a new Recovery listing...');
    await page.getByRole('button', { name: 'Create New Post' }).click();
    await expect(page).toHaveURL(/.*\/admin\/posts\/new/);

    // Toggle post type to Recovery
    console.log('🔄 Toggling Post Type to Account Recovery...');
    await page.getByRole('button', { name: 'Account Recovery' }).click();

    // Fill basic details for Recovery
    await page.locator('input[placeholder*="Legendary S1"]').fill('Playwright Test Recovery Success Story');
    await page.locator('textarea[placeholder*="Describe the account"]').fill('Successfully recovered client Call of Duty Mobile account after Facebook link was hijacked. Restored original email verification.');

    // Fill recovery specific fields
    await page.locator('input[placeholder="Client\'s name"]').fill('John Doe');
    await page.locator('input[placeholder*="facebook.com"]').fill('https://facebook.com/johndoe.test');

    // Upload dummy image directly via setInputFiles
    console.log('📤 Uploading recovery showcase image...');
    await page.locator('input[type="file"]').setInputFiles(DUMMY_IMAGE_PATH);

    // Wait for preview
    await page.waitForSelector('img[alt^="Preview"]');

    // Submit post
    console.log('💾 Submitting Recovery Listing...');
    await page.getByRole('button', { name: 'Create Post' }).click();

    // Verify redirect
    await expect(page).toHaveURL(/.*\/admin\/dashboard/);
    console.log('✅ Recovery Listing created successfully!');
  });
});
