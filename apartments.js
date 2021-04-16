// apartments.com listings
console.log(Array.from(document.querySelectorAll('article.placard-option')).map(propertyInfo => {
    const titleElement = propertyInfo.querySelector('span.title');
    if (titleElement == null) {
        console.log(propertyInfo);
    }
    const title = titleElement.textContent;
    const addressElement = propertyInfo.querySelector('div.property-address');
    const address = addressElement.getAttribute('title');
    return title + '\t' + address + '\n'
}).reduce((acc, curr) => acc + curr, ''));
