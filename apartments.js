// apartments.com listings
(async () => {
    console.log('Please wait while I click through the pages...')
    let tsv = 'name\taddress\tURL\tPrice Range\n';
    let nextButton = document.querySelector('a.next ');
    for(;;) {
        tsv += Array.from(document.querySelectorAll('article.placard-option')).map(propertyInfo => {
            const titleElement = propertyInfo.querySelector('span.title');
            const title = titleElement.textContent;
            const addressElement = propertyInfo.querySelector('div.property-address');
            const address = addressElement.getAttribute('title');
            const url = propertyInfo.querySelector('a.property-link').href;
            let priceRange = propertyInfo.querySelector('div.price-range');
            if (priceRange == null) {
                priceRange = 'N/A';
            } else {
                priceRange = priceRange.textContent;
            }
            return title + '\t' + address + '\t' + url + '\t' + priceRange + '\n'
        }).reduce((acc, curr) => acc + curr, '');
        if (nextButton != null) {
            const prevTitle = document.querySelector('span.title').textContent;
            nextButton.click();
            do {
                await new Promise(r => setTimeout(r, 500));
            } while (prevTitle === document.querySelector('span.title').textContent);
            if (nextButton == document.querySelector('a.next ')) {
                console.log('could not click');
                break;
            }
            nextButton = document.querySelector('a.next ');
        } else {
            break;
        }
    }
    const tsvDataUri = 'data:text/tsv;base64,' + btoa(tsv);
    const link = document.createElement('a');
    link.href = tsvDataUri;
    link.download = 'apartments.tsv';
    link.click();
})();
