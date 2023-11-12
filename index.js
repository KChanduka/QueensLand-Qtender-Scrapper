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
    

    // counting the numOfPages
    const numOfPages = await page.evaluate(()=>{
        const pageLinks = Array.from(document.querySelectorAll('.paging > tbody > tr > td > a'),(e)=>e);
        return pageLinks.length;
    });


    // if(numOfPages == 0){
    //     console.log('page 1',links);
    //     console.log('only the first page no more to scarpe');
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


    // intializing an array to include scrape data
    let scrapedData = [];

    // scraping inside each link in links
    
    for(const each of links){

        const newpage = await browser.newPage();
        await newpage.goto(each.link);
        await newpage.waitForSelector('[summary = "help page"]');

        // const details = await page.evaluate(()=>document.querySelector('[summary]'));

        //Extract the title
        const title = await newpage.evaluate(()=>{
            const titleELenment = document.querySelector('[summary = "help page"] > tbody > tr > td:nth-child(2)').querySelector('.TITLE').innerText.replace(/\n+/g,"");
            return titleELenment ? titleELenment : "";
        });

        //Extracting  agency
        const agency = "";
        //Extracting  atmID
        const atmId = "";
        
        //Extracting  category
        await newpage.waitForSelector('[summary = "show tender details"] > tbody')

        const category = await newpage.evaluate(()=>{
            const categoryElement = document.querySelector('[summary = "show tender details"] > tbody > tr:nth-child(2) > td:nth-child(2)').innerText.replace(/\n+/g,"");
            return categoryElement ? categoryElement : "";
        });


        //Extracting location
        const location = ["QLD"];

        //Extracting region
        const region = await newpage.evaluate(()=>{
            const regionElement = document.querySelector('[summary = "show tender details"] > tbody > tr:nth-child(7) > td:nth-child(2)').innerText.split('\n');
    
            //removing the last empty string
            if(regionElement[regionElement.length - 1] === ''){
                regionElement.pop();
            }
            return regionElement.length > 0 ? regionElement:["not specified"];
        });


        //Extracting idNumber
        const idNumber = await newpage.evaluate(()=>{
            const idNumberElement = document.querySelector('[summary = "show tender details"] > tbody > tr:nth-child(3) > td:nth-child(2)').innerText;
            return idNumberElement ? idNumberElement: "";
        });

        //Extracting pulishedDate
      

        if(title){
            
            titles.push({title: title});
            
        }else{
            console.log('attribute not found');
        }

        newpage.close();

        
    }
        

    // console.log(links);
    // console.log('num of links in page 1 :', pageOne);
    // console.log('number of pages except page1 :',numOfPages);
    // console.log('total num of links at the end : ',links.length);

  
    browser.close();



}


run();