const https = require('https');

function fetch(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      let d = '';
      res.on('data', c => d+=c);
      res.on('end', () => resolve(d));
    }).on('error', () => resolve(''));
  });
}

async function run() {
  let html = await fetch('https://minea.com');
  console.log('Minea:', html.match(/https:\/\/[^"'\s]+\.svg/ig));
  
  html = await fetch('https://winninghunter.com');
  console.log('WinningHunter:', html.match(/https:\/\/[^"'\s]+\.svg/ig) || html.match(/\/_[^"'\s]+\.svg/ig) || html.match(/<img[^>]+src=["']([^"']+)["']/i));
  
  html = await fetch('https://gethookd.ai');
  console.log('Gethookd:', html.match(/https:\/\/[^"'\s]+\.svg/ig) || html.match(/\/_[^"'\s]+\.svg/ig) || html.match(/<img[^>]+src=["']([^"']+)["']/i));
}

run();
