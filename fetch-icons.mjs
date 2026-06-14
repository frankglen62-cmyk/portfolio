import fs from 'fs';
import path from 'path';
import https from 'https';

const tools = [
  { id: 'google-workspace.png', iconify: 'logos:google-icon' },
  { id: 'gmail.png', iconify: 'logos:google-gmail' },
  { id: 'google-calendar.png', iconify: 'logos:google-calendar' },
  { id: 'google-drive.png', iconify: 'logos:google-drive' },
  { id: 'google-sheets.png', iconify: 'logos:google-sheets' },
  { id: 'google-docs.png', iconify: 'logos:google-docs' },
  { id: 'canva.png', iconify: 'devicon:canva' },
  { id: 'trello.png', iconify: 'logos:trello' },
  { id: 'slack.png', iconify: 'logos:slack-icon' },
  { id: 'zoom.png', iconify: 'logos:zoom-icon' },
  { id: 'asana.png', iconify: 'logos:asana-icon' },
  { id: 'notion.png', iconify: 'logos:notion-icon' },
  { id: 'microsoft-office.png', iconify: 'logos:microsoft-icon' },
  { id: 'wordpress.png', iconify: 'logos:wordpress-icon' },
  { id: 'shopify.png', iconify: 'logos:shopify' },
  { id: 'mailchimp.png', iconify: 'logos:mailchimp-icon' },
  { id: 'chatgpt.png', iconify: 'logos:openai-icon' },
  { id: 'capcut.png', iconify: 'simple-icons:capcut' }
];

const socials = [
  { id: 'facebook.png', iconify: 'logos:facebook' },
  { id: 'instagram.png', iconify: 'skill-icons:instagram' },
  { id: 'tiktok.png', iconify: 'logos:tiktok-icon' },
  { id: 'linkedin.png', iconify: 'logos:linkedin-icon' },
  { id: 'pinterest.png', iconify: 'logos:pinterest' },
  { id: 'threads.png', iconify: 'simple-icons:threads' },
  { id: 'youtube.png', iconify: 'logos:youtube-icon' },
  { id: 'x.png', iconify: 'simple-icons:x' }
];

const downloadSvgAsPngFallback = (url, dest) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        resolve(false);
        return;
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        // Just save the raw SVG content but keep the filename .png for now, 
        // browsers can usually render SVG even if the extension is .png, 
        // OR better yet, change the file extensions to .svg in our lists!
        // Wait, since I already modified the code to look for .png, I should save as .png?
        // No, let's just save as .svg and update the React code.
        resolve(data);
      });
    }).on('error', err => {
      resolve(false);
    });
  });
};

const run = async () => {
  for (const tool of tools) {
    console.log(`Fetching ${tool.iconify}...`);
    const svg = await downloadSvgAsPngFallback(`https://api.iconify.design/${tool.iconify.replace(':', '/')}.svg`, null);
    if (svg) {
      fs.writeFileSync(path.join('public', 'icons', 'tools', tool.id.replace('.png', '.svg')), svg);
    }
  }
  for (const social of socials) {
    console.log(`Fetching ${social.iconify}...`);
    const svg = await downloadSvgAsPngFallback(`https://api.iconify.design/${social.iconify.replace(':', '/')}.svg`, null);
    if (svg) {
      fs.writeFileSync(path.join('public', 'icons', 'social', social.id.replace('.png', '.svg')), svg);
    }
  }
};

run().then(() => console.log('Done!'));
