const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

async function run(){
    //creating a instance of the browser{
    const browser = await puppeteer.launch({headless: false});
    //creatin a instance of the page
    const page =await browser.newPage();

    await page.goto('https://qtenders.epw.qld.gov.au/qtenders/tender/search/tender-search.do?action=advanced-tender-search-open-tender&orderBy=closeDate&CSRFNONCE=49F003A9DDC190F17DD339DBF0150A39z');

    //scraping the first page
    await page.waitForSelector('body');
    await page.screenshot({path: 'home.png', fullPage:true});
    await page.waitForSelector('#MSG');

    let links = await page.evaluate(()=>Array.from(document.querySelectorAll('#MSG'),(e)=>{
    const card = {
        // name:e.innerHTML.replace(/<[^>]*/g, '').replace(/\n+/g,'\n').replace(/\t+/g,'\t'),
        name: e.innerText, 
        link:e.href
     }

     return card;

    }))

    //links in page 1
    const pageOne = links.length;
    

    // counting the numOfPages
    const numOfPages = await page.evaluate(()=>{
        const pageLinks = Array.from(document.querySelectorAll('.paging > tbody > tr > td > a'),(e)=>e);
        return pageLinks.length;
    });
    // let count = 0;
    // for(each of numOfPages){
    //     count++;
    // }

    // if(numOfPages == 0){
    //     // console.log('page 1',links);
    //     // console.log('only the first page no more to scarpe');
    // }else{
        
    //     //scraping the other pages
    //     for(let i = 0 ; i<numOfPages; i++){

    //         try{

    //             //traverse to the page
    //             await page.waitForSelector(`.paging > tbody > tr > td:nth-child(${i+2}) > a`);
    //             await page.click(`.paging > tbody > tr > td:nth-child(${i+2}) > a` );
    
        
        
    //             // scrape the data and cocat the new array to the links arrray
    //             const array2 = await page.evaluate(()=>Array.from(document.querySelectorAll('#MSG'),(e)=>({name:e.innerText,link:e.href})));
    //             links = links.concat(array2);
    //             console.log(`num of links in page ${i+2} : ${array2.length}`);


    //         }catch(error){
    //             console.error('Error navigating or scraping inside links:', error);
    //         }
    
    
    //     }

    //     // console.log('all links : ',links);

    // }


    // scraping inside each link in links
    // let titles = [];
    // for(const each of links){

    //     const newPage = await browser.newPage();
    //     await newPage.goto(each.link);
    //     await page.waitForSelector('[summary]');

    //     // const details = await page.evaluate(()=>document.querySelector('[summary]'));
    //     const details = await page.$('[summary]');
    //         console.log('element with atrribute summary found');
    //     if(details){

    //     }else{
    //         console.log('attribute with summary not found');
    //     }

        

        

    //     // await page.waitForTimeout(5000);
    //     // await page.screenshot({path:'1st tender.png', fullPage:true});
    //     // titles.push(title);
    //     newPage.close();
    // }
   
    const newPage = await browser.newPage();
    await newPage.goto(links[0].link);
    await page.waitForSelector('[summary]');

    const summary = await page.$('[summary]');
    console.log(summary);

    
    // console.log(links);
    console.log('num of links in page 1 :', pageOne);
    console.log('number of pages except page1 :',numOfPages);
    console.log('total num of links at the end : ',links.length);

    // console.log(titles);
    browser.close();



}

run();