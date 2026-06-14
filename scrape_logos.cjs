const puppeteer = require('puppeteer');
const fs = require('fs');
const https = require('https');

function download(url, dest) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', resolve);
  });
}

async function run() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  try {
    await page.goto('https://minea.com/', { waitUntil: 'networkidle2' });
    const mineaLogo = await page.evaluate(() => {
      const img = document.querySelector('img[src*="logo"], img[alt*="logo" i]');
      return img ? img.src : null;
    });
    console.log('Minea:', mineaLogo);
    if(mineaLogo) await download(mineaLogo, 'public/icons/tools/minea.png'); // Minea might use svg or png
  } catch(e) { console.log('Error Minea', e); }

  try {
    await page.goto('https://gethookd.ai/', { waitUntil: 'networkidle2' });
    const gethookdLogo = await page.evaluate(() => {
      const img = document.querySelector('img[src*="logo"], img[alt*="logo" i]');
      return img ? img.src : null;
    });
    console.log('Gethookd:', gethookdLogo);
    if(gethookdLogo) await download(gethookdLogo, 'public/icons/tools/gethookd.png');
  } catch(e) { console.log('Error Gethookd', e); }

  try {
    await page.goto('https://winninghunter.com/', { waitUntil: 'networkidle2' });
    const winningLogo = await page.evaluate(() => {
      const img = document.querySelector('img[src*="logo"], img[alt*="logo" i], nav img');
      return img ? img.src : null;
    });
    console.log('Winning Hunter:', winningLogo);
    if(winningLogo) await download(winningLogo, 'public/icons/tools/winninghunter.png');
  } catch(e) { console.log('Error Winning Hunter', e); }

  await browser.close();
}

run();
