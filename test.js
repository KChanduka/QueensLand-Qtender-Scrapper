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

    //no.of links in page 1
    const pageOne = links.length;
    console.log('num of links in pageOne : ',pageOne);
    

    // counting the numOfPages
    const numOfPages = await page.evaluate(()=>{
        const pageLinks = Array.from(document.querySelectorAll('.paging > tbody > tr > td > a'),(e)=>e);
        return pageLinks.length;
    });

    //initializing an array to include scraped date
    let scrapedData = [];

    // going inside each link and scraping details
   
    const newpage = await browser.newPage();
    await newpage.goto(links[0].link);
    // await newpage.goto('https://github.com/HGSChandeepa/TeataOne/tree/main/functions/scrapers');
    // await newpage.goto('https://qtenders.epw.qld.gov.au/qtenders/tender/display/tender-details.do?CSRFNONCE=020BC9207D629F628A5F130BF75F16F8&id=50753&action=display-tender-details&returnUrl=%2Ftender%2Fsearch%2Ftender-search.do%3Faction%3Dadvanced-tender-search-open-tender%26amp%3BorderBy%3DcloseDate%26amp%3BCSRFNONCE%3DF8658634930ED61C64BF2DE7657CB106');
    await newpage.waitForSelector('[summary = "show tender details"] > tbody');

//title
      const title = await newpage.evaluate(()=>{
        const titleELenment = document.querySelector('[summary = "help page"] > tbody > tr > td:nth-child(2)').querySelector('.TITLE').innerText.replace(/\n+/g,"");
        return titleELenment ? titleELenment : "";
    });

//agency
    const agency = "";
//atmID
    const atmId = "";


//category
    const category = await newpage.evaluate(()=>{
        const categoryElement = document.querySelector('[summary = "show tender details"] > tbody > tr:nth-child(2) > td:nth-child(2)').innerText.replace(/\n+/g,"");
        return categoryElement ? categoryElement : "";
    });

    // console.log(category);

//location
    const location = ["QLD"];

//region    
    const region = await newpage.evaluate(()=>{
        const regionElement = document.querySelector('[summary = "show tender details"] > tbody > tr:nth-child(7) > td:nth-child(2)').innerText.split('\n');

        //removing the last empty string
        if(regionElement[regionElement.length - 1] === ''){
            regionElement.pop();
        }
        return regionElement.length > 0 ? regionElement:["not specified"];
    });

    // console.log(region);

//idNumber
    const idNumber = await newpage.evaluate(()=>{
        const idNumberElement = document.querySelector('[summary = "show tender details"] > tbody > tr:nth-child(3) > td:nth-child(2)').innerText;
        return idNumberElement ? idNumberElement: "";
    });

    // console.log(idNumber);

//publishedDate
    const publishedDate = await newpage.evaluate(()=>{
        const  inputDateString = document.querySelector('[summary = "show tender details"] > tbody > tr:nth-child(4) > td:nth-child(2)').innerText;
        
        const datePart = inputDateString.match(/\d{1,2} [A-Za-z]+ \d{4}/);
    
        if (datePart) {
          const parts = datePart[0].split(' ');
          const day = parts[0];
          const month = parts[1];
          const year = parts[2];
        
          const outputDateString = `${day} ${month} ${year}`;
          return outputDateString;
        } else {
          return "No date found"
        }
    });

    // console.log(publishedDate);

//closingDate
    const closingDate = await newpage.evaluate(()=>{
        const inputDateString  = document.querySelector('[summary = "show tender details"] > tbody > tr:nth-child(5) > td:nth-child(2)').innerText;

        const datePart = inputDateString.match(/\d{1,2} [A-Za-z]+ \d{4}/);
    
        if (datePart) {
          const parts = datePart[0].split(' ');
          const day = parts[0];
          const month = parts[1];
          const year = parts[2];
        
          const outputDateString = `${day} ${month} ${year}`;
          return outputDateString;
        } else {
          return "No date found"
        }
    });

    // console.log(closingDate);

//updatedDateTime
    const updatedDateTime = "No date found";

//description
    // const description = await newpage.evaluate(()=>{
    //     const descriptionElement = document.querySelector('[summary = "show tender details" > tbody > tr:nth-child(')
    // })

    // console.log(description);
    const description = 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.';

//link
    const link = links[0].link;
    // console.log(link);
    // console.log(links);
    // console.log('num of links in page 1 :', pageOne);
    // console.log('number of pages except page1 :',numOfPages);
    // console.log('total num of links at the end : ',links.length);


    scrapedData.push({
        title,
        agency,
        atmId,
        category,
        location,
        region,
        idNumber,
        publishedDate,
        closingDate,
        description,
        link,
        updatedDateTime,
      });

      console.log(scrapedData);

    
    
    browser.close();



}


run();