const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log("Navigating to URL...");
  await page.goto('https://framer.com/projects/Prolific-copy--rDrmvjuo1V5KYzuvxqgE-8tAag?duplicate=06lMKQB1UziezQpGX4UA&node=pnOCjaKVu&view=preview', { waitUntil: 'domcontentloaded', timeout: 60000 });
  
  // Wait a bit for Framer scripts to initialize
  await page.waitForTimeout(3000);

  // Scroll slowly to trigger animations
  console.log("Scrolling down to trigger animations...");
  for (let i = 0; i < 10; i++) {
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(500);
  }

  // Find elements and their styles
  const analysis = await page.evaluate(() => {
    const results = [];
    
    // Find all elements containing text
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    let node;
    
    while ((node = walker.nextNode())) {
      const text = node.nodeValue.trim();
      
      if (text.includes("Launching Icon Status Now") || text.includes("Discovering Where True Brand Power Lies")) {
        let parent = node.parentElement;
        
        // Find the closest parent with animation or style
        let current = parent;
        let depth = 0;
        let foundStyles = [];
        
        while (current && depth < 5) {
          const style = window.getComputedStyle(current);
          const rawStyle = current.getAttribute('style') || '';
          const classes = current.className || '';
          
          if (rawStyle.includes('transform') || rawStyle.includes('opacity') || classes.includes('framer')) {
             foundStyles.push({
                tag: current.tagName,
                classes: typeof classes === 'string' ? classes : 'SVGAnimatedString',
                rawStyle: rawStyle,
                computedTransform: style.transform,
                computedOpacity: style.opacity
             });
          }
          current = current.parentElement;
          depth++;
        }
        
        results.push({
          text: text,
          stylesFound: foundStyles
        });
      }
    }
    return results;
  });

  console.log(JSON.stringify(analysis, null, 2));

  await browser.close();
})();
