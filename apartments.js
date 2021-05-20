// apartments.com listings
(async () => {
    console.log('Please wait while I click through the pages...')
    let tsv = 'name\taddress\tURL\tprice-range\n';
    let nextButton = document.querySelector('a.next ');
    let pageNumber = 1;
    for(;;) {
        // add listings on page to TSV
        tsv += Array.from(document.querySelectorAll('article.placard-option')).map(propertyInfo => {
            const titleElement = propertyInfo.querySelector('span.title');
            const title = titleElement.textContent;
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
            return title + '\t' + address + '\t' + url + '\t' + priceRange + '\n'
        }).reduce((acc, curr) => acc + curr, '');
        // load next page or finish search
        if (nextButton != null) {
            const prevTitle = document.querySelector('span.title');
            nextButton.click();
            pageNumber++;
            do {
                console.log('Waiting for page ' + pageNumber + ' to load');
                await new Promise(r => setTimeout(r, 1000));
            } while (prevTitle === document.querySelector('span.title'));
            console.log('Processing page ' + pageNumber);
            if (nextButton == document.querySelector('a.next ')) {
                console.log('The next button seems to be the same button after I clicked it.\nEither your browser does not allow programmatic clicks or Apartments.com changed their website.\nPlease create an issue on GitHub.');
                break;
            }
            nextButton = document.querySelector('a.next ');
        } else {
            console.log('Done!');
            break;
        }
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
    console.log('There was an error while pulling listings: ' + e.message + '\nThere may be an issue with your browser or Apartments.com has changed their website. Please create an issue on GitHub.');
    console.log(e.stack);
});
