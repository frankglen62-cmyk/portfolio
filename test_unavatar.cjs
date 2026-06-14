const https = require('https');

function check(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      resolve(res.statusCode + ' ' + (res.headers.location || ''));
    }).on('error', () => resolve('error'));
  });
}

async function run() {
  console.log('Minea:', await check('https://unavatar.io/twitter/minea'));
  console.log('Minea (app):', await check('https://unavatar.io/twitter/minea_app'));
  console.log('Gethookd:', await check('https://unavatar.io/twitter/gethookdai'));
  console.log('WinningHunter:', await check('https://unavatar.io/twitter/winninghunter'));
  console.log('Pipiads:', await check('https://unavatar.io/twitter/pipiads'));
  console.log('Meta:', await check('https://unavatar.io/twitter/meta'));
}
run();
