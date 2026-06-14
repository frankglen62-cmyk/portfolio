const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://framer.com/projects/Prolific-copy--rDrmvjuo1V5KYzuvxqgE-8tAag?duplicate=06lMKQB1UziezQpGX4UA&node=pnOCjaKVu&view=preview', { waitUntil: 'networkidle2' });
    
    // Evaluate in the context of the page
    const content = await page.evaluate(() => {
      let results = [];
      
      // Find elements containing the specific text
      const allElements = document.querySelectorAll('*');
      for (const el of allElements) {
        if (el.children.length === 0 && el.textContent) {
          if (el.textContent.includes('Launching Icon') || el.textContent.includes('Discovering Where True')) {
             let parent = el.parentElement;
             let styles = '';
             let classes = '';
             if (parent) {
                styles = parent.getAttribute('style') || '';
                classes = parent.className || '';
             }
             results.push({
               text: el.textContent,
               tag: el.tagName,
               parentClasses: classes,
               parentStyles: styles,
               grandparentClasses: parent?.parentElement?.className || '',
               framerProps: parent?.getAttribute('data-framer-component-type') || parent?.getAttribute('data-framer-name') || ''
             });
          }
        }
      }
      return results;
    });
    
    console.log(JSON.stringify(content, null, 2));
    await browser.close();
  } catch (error) {
    console.error('Error:', error);
  }
})();
