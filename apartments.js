// apartments.com listings
(async () => {
    console.log('Please wait while I click through the pages...')
    let tsv = 'name\taddress\tURL\tprice-range\n';

    let pageNumber = 1;
    for (;;) {
        // load next page or finish search
        const pages = new Map()
        Array.from(document.querySelectorAll('ol > li > a')).filter(elem => elem.hasAttribute('data-page')).forEach(elem => {
            pages.set(Number(elem.getAttribute('data-page')), elem);
        });
        const nextButton = document.querySelector('a.next ');
        if (pages.get(pageNumber)) {
            pages.get(pageNumber).click();
        } else if (nextButton) {
            nextButton.click()
        } else {
            console.log('Done!');
            break;
        }

        do {
            console.log(`Waiting for page ${pageNumber} to load`);
            await new Promise(r => setTimeout(r, 1000));
        } while (window.getComputedStyle(document.querySelector('div#placardLoadingOverlay')).display !== 'none');

        console.log(`Processing ${pageNumber}`);
        pageNumber++;

        // add listings on page to TSV
        tsv += Array.from(document.querySelectorAll('article.placard-option')).map(propertyInfo => {
            const titleElement = propertyInfo.querySelector('span.title');
            const name = titleElement.textContent;
            const addressElement = propertyInfo.querySelector('div.property-address');
            const address = addressElement.getAttribute('title');
            const url = propertyInfo.querySelector('a.property-link').href;
            let priceRange = propertyInfo.querySelector('div.price-range');
            // some listings do not show prices
            if (priceRange == null) {
                priceRange = 'N/A';
            } else {
                priceRange = priceRange.textContent;
            }
            return `${name}\t${address}\t${url}\t${priceRange}\n`
        }).reduce((acc, curr) => acc + curr, '');
    }
    // btoa does not support non-ascii characters: https://stackoverflow.com/q/23223718
    tsv = tsv.replace(/[^\x00-\x7F]/g, "");
    const tsvDataUri = 'data:text/tsv;base64,' + btoa(tsv);
    const link = document.createElement('a');
    link.href = tsvDataUri;
    link.download = 'apartments.tsv';
    link.click();
    console.log('You should now see a pop-up to download a TSV file with the listings from your search');
})().catch(e => {
    console.log(`There was an error while pulling listings: ${e.message} \nThere may be an issue with your browser or Apartments.com has changed their website. Please create an issue on GitHub.`);
    console.log(e.stack);
});
