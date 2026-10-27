// Rasterize the original Figma radar mark for Expo's PNG launcher/splash slots.
const { chromium } = require('@playwright/test');
const fs = require('node:fs/promises');
const path = require('node:path');
(async () => {
  const root = path.resolve(__dirname, '..');
  const mark = (await fs.readFile(path.join(root, 'assets/figma/9a0ad.svg'))).toString('base64');
  const target = path.join(root, 'assets/brand'); await fs.mkdir(target, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1024, height: 1024 }, deviceScaleFactor: 1 });
  for (const [name, background, scale] of [['icon','#E6B800',28.44], ['foreground','transparent',22], ['splash','#E6B800',28.44]]) {
    await page.setContent(`<html><body style="margin:0;background:transparent"><div style="width:1024px;height:1024px;background:${background};display:flex;align-items:center;justify-content:center;${name === 'splash' ? 'border-radius:300px;' : ''}"><img width="22" height="22" src="data:image/svg+xml;base64,${mark}" style="transform:scale(${scale})" /></div></body></html>`);
    await page.locator('img').evaluate(i => i.decode());
    await page.screenshot({ path: path.join(target, `${name}.png`), omitBackground: true });
  }
  await browser.close();
})();
