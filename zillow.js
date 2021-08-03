// zillow.com listings
(async () => {
    console.log('Please wait while I click through the pages...')
    let tsv = 'name\taddress\tURL\tprice-range\n';

    let prevFirstListingAddress = undefined;

    let pageNumber = 1;
    for (; ;) {
        // load next page or finish search
        if (document.querySelector(`a[Title="Page ${pageNumber}, current page"]`) !== null) {
            const pageButton = document.querySelector(`a[Title="Page ${pageNumber}"]`)
            const nextButton = document.querySelector('a[Title="Next page"]');
            if (pageButton !== null && !pageButton.hasAttribute('disabled')) {
                pageButton.click();
            } else if (nextButton !== null && !nextButton.hasAttribute('disabled')) {
                nextButton.click();
            } else {
                console.log('Done!');
                break;
            }
        }

        let firstListingAddress = undefined;
        do {
            console.log(`Waiting for page ${pageNumber} to load`);
            await new Promise(r => setTimeout(r, 1000));
            firstListingAddress = document.querySelector('article.list-card address')?.textContent;
        } while (document.querySelector('div.list-loading-message-cover') !== null
            || prevFirstListingAddress === firstListingAddress);
        prevFirstListingAddress = firstListingAddress;

        console.log(`Processing ${pageNumber}`);
        pageNumber++;

        // Zillow only loads address info once you scroll into view of a listing
        const listings = Array.from(document.querySelectorAll('article.list-card'));
        for (let i = 0; i < listings.length; i++) {
            listings[i].scrollIntoView();
            await new Promise(r => setTimeout(r, 50));
        }

        // add listings on page to TSV
        tsv += Array.from(document.querySelectorAll('article.list-card')).map(listing => {
            const addressContent = listing.querySelector('address')?.textContent?.split('|');
            let name = addressContent[0];
            const address = addressContent[addressContent.length - 1];
            if (name === address) {
                name = listing.querySelector('li.list-card-statusText')?.textContent?.replace('- ', '') ?? name;
            }
            const url = listing.querySelector('a.list-card-link').href;
            const priceRange = listing.querySelector('div.list-card-price')?.textContent ?? 'N/A';

            return `${name}\t${address}\t${url}\t${priceRange}\n`
        }).reduce((acc, curr) => acc + curr, '');
    }
    // btoa does not support non-ascii characters: https://stackoverflow.com/q/23223718
    tsv = tsv.replace(/[^\x00-\x7F]/g, "");
    const tsvDataUri = 'data:text/tsv;base64,' + btoa(tsv);
    const link = document.createElement('a');
    link.href = tsvDataUri;
    link.download = 'zillow.tsv';
    link.click();
    console.log('You should now see a pop-up to download a TSV file with the listings from your search');
})().catch(e => {
    console.log(`There was an error while pulling listings: ${e.message} \nThere may be an issue with your browser or Zillow has changed their website. Please create an issue on GitHub.`);
    console.log(e.stack);
});
