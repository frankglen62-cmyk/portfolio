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
  await download('https://www.gethookd.ai/images/logo.svg', 'public/icons/tools/gethookd.svg');
  await download('https://framerusercontent.com/images/L6399US4Ex6UpXeAF14DovZGnjA.png?width=513&height=119', 'public/icons/tools/winninghunter.png');

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  try {
    await page.goto('https://minea.com/', { waitUntil: 'networkidle2' });
    const mineaSvg = await page.evaluate(() => {
      // Find an svg that has 'minea' in its class, id, or near an aria-label
      const svgs = Array.from(document.querySelectorAll('svg'));
      for(let s of svgs) {
         if(s.innerHTML.includes('minea') || (s.parentElement && s.parentElement.innerHTML.toLowerCase().includes('minea'))) {
            if(s.clientWidth > 50 && s.clientHeight > 10) return s.outerHTML;
         }
      }
      return svgs.length > 0 ? svgs[0].outerHTML : null; // Usually the first SVG is the logo
    });
    console.log('Minea SVG found:', mineaSvg ? mineaSvg.slice(0, 100) : null);
    if(mineaSvg && mineaSvg.startsWith('<svg')) {
      fs.writeFileSync('public/icons/tools/minea.svg', mineaSvg);
    }
  } catch(e) { console.log('Error Minea', e); }

  await browser.close();
}

run();
