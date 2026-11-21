// icons/icon.svg 를 Playwright(chromium)로 렌더링해 PNG 192/512 를 만든다.
// 사용: node tools/gen-icons.js
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const root = path.join(__dirname, '..');
  const svg = fs.readFileSync(path.join(root, 'icons/icon.svg'), 'utf8');
  const browser = await chromium.launch();
  for (const size of [192, 512]) {
    const page = await browser.newPage({ viewport: { width: size, height: size } });
    await page.setContent(`<body style="margin:0">${svg.replace('width="512" height="512"', `width="${size}" height="${size}"`)}</body>`);
    await page.screenshot({ path: path.join(root, `icons/icon-${size}.png`) });
    await page.close();
  }
  await browser.close();
  console.log('아이콘 생성 완료');
})();
