const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

async function run() {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto('https://qtenders.epw.qld.gov.au/qtenders/tender/search/tender-search.do?action=advanced-tender-search-open-tender&orderBy=closeDate&CSRFNONCE=49F003A9DDC190F17DD339DBF0150A39z');

    // Wait for the initial page to load.
    await page.waitForSelector('#MSG');

    const links = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('#MSG'));
      return cards.map((e) => {
        return {
          name: e.innerText,
          link: e.querySelector('a').getAttribute('href')
        };
      });
    });

    const numOfPages = await page.evaluate(() => {
      const pagingLinks = Array.from(document.querySelectorAll('.paging > tbody > tr > td > a'));
      return pagingLinks.length;
    });

    if (numOfPages === 0) {
      console.log('Page 1', links);
      console.log('Only the first page, no more to scrape');
    } else {
      const allLinks = [...links];

      for (let i = 0; i < numOfPages; i++) {
        try {
          await page.waitForSelector(`.paging > tbody > tr > td:nth-child(${i + 2}) > a`);
          await page.click(`.paging > tbody > tr > td:nth-child(${i + 2}) > a`);

          // Add a delay to ensure the page loads completely.
          await page.waitForTimeout(2000);

          const pageLinks = await page.evaluate(() => {
            const cards = Array.from(document.querySelectorAll('#MSG'));
            return cards.map((e) => {
              return {
                name: e.innerText,
                link: e.querySelector('a').getAttribute('href')
              };
            });
          });

          allLinks.push(...pageLinks);
        } catch (error) {
          console.error('Error navigating or scraping:', error);
        }
      }

      console.log('All links:', allLinks);

      const titles = [];
      for (const link of allLinks) {
        await page.goto(link.link);
        await page.waitForSelector('.TITLE');
        const title = await page.evaluate(() => document.querySelector('.TITLE').innerText);
        titles.push(title);
      }

      console.log('Count:', numOfPages);
      console.log('Titles:', titles);
    }

    browser.close();
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

run();
