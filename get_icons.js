const https = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function run() {
  console.log("THREADS:");
  console.log(await get('https://cdn.jsdelivr.net/npm/simple-icons@10.0.0/icons/threads.svg'));
  console.log("SOUNDCLOUD:");
  console.log(await get('https://cdn.jsdelivr.net/npm/simple-icons@10.0.0/icons/soundcloud.svg'));
  console.log("APPLE MUSIC:");
  console.log(await get('https://cdn.jsdelivr.net/npm/simple-icons@10.0.0/icons/applemusic.svg'));
}

run();
