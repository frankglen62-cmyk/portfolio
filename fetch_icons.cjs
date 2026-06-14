const https = require('https');
const fs = require('fs');

const getHtml = (url) => new Promise((resolve) => {
  https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' } }, (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => resolve(data));
  }).on('error', () => resolve(''));
});

async function run() {
  const urls = [
    { u: 'https://minea.com/', name: 'minea.png' },
    { u: 'https://winninghunter.com/', name: 'winninghunter.png' },
    { u: 'https://gethookd.ai/', name: 'gethookd.png' },
    { u: 'https://www.facebook.com/business/tools/meta-business-suite', name: 'meta-business-suite.png' },
    { u: 'https://www.facebook.com/ads/library', name: 'meta-ads-library.png' }
  ];
  
  for (const item of urls) {
    const html = await getHtml(item.u);
    const match = html.match(/<link[^>]+rel=["']?(?:icon|shortcut icon|apple-touch-icon)["']?[^>]+href=["']([^"']+)["']/i);
    if (match) {
      console.log(`${item.name} -> ${match[1]}`);
      let iconUrl = match[1];
      if (iconUrl.startsWith('//')) iconUrl = 'https:' + iconUrl;
      else if (iconUrl.startsWith('/')) {
        const urlObj = new URL(item.u);
        iconUrl = urlObj.origin + iconUrl;
      }
      else if (!iconUrl.startsWith('http')) iconUrl = item.u + iconUrl;
      console.log(`Resolved: ${iconUrl}`);
    } else {
      console.log(`${item.name} -> Not found`);
    }
  }
}
run();
