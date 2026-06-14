const https = require('https');
const fs = require('fs');

function download(url, dest) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        let loc = res.headers.location;
        if (!loc.startsWith('http')) loc = 'https://unavatar.io' + loc;
        return resolve(download(loc, dest));
      }
      if (res.statusCode !== 200) return resolve();
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', () => resolve());
  });
}

async function run() {
  await download('https://unavatar.io/twitter/minea_app', 'public/icons/tools/minea.png');
  await download('https://unavatar.io/twitter/gethookdai', 'public/icons/tools/gethookd.png');
  await download('https://unavatar.io/twitter/winninghunter', 'public/icons/tools/winninghunter.png');
  await download('https://unavatar.io/twitter/meta', 'public/icons/tools/meta-business-suite.png');
  await download('https://unavatar.io/twitter/meta', 'public/icons/tools/meta-ads-library.png');
  console.log('Downloaded all!');
}

run();
