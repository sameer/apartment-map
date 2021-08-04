# apartment-map

Import your apartment search to Google My Maps.

## Why?

Apartment listing sites provide basic search filters to help narrow down listings. However, there is no way to consider custom factors outside what the site allows. Maybe you want to look at bus routes, crime, or even noise levels.

## Demo

I pulled apartments in the Los Angeles area and displayed them alongside Metro stations:

![Screenshot of Google My Maps](screenshot.png)

Each location has the price range and a link back to the original listing: ![Screenshot of Google My Maps showing listing details](https://user-images.githubusercontent.com/11097096/118912172-5ce5e280-b8f5-11eb-8c85-3b13b3416b71.png)

If you want to add accurate commute estimates, use `directions.py` to modify your `apartments.tsv` file: ![Screenshot of Google My Maps showing listing details with distance and bus fare](https://user-images.githubusercontent.com/11097096/118912388-bbab5c00-b8f5-11eb-8917-15928f0d1387.png)

## Supported Sites

- [x] [Apartments.com](https://www.apartments.com)
- [x] [Zillow](https://www.zillow.com)
- [x] [rent.com](https://www.rent.com) & [Apartmentguide](https://www.apartmentguide.com/)
- [x] [ForRent.com](https://www.forrent.com/)

## Instructions

1. Do your search on a supported website.
1. Right click on the page and hit "Inspect Element". In Chrome, this is just "Inspect".
    * Beware that this changes the size of the map and the results may change.
    * For best results, make sure you are on the first page of results.
1. Go to the tab that says "Console".
1. Copy and paste [apartments.js](https://raw.githubusercontent.com/sameer/apartment-map/main/apartments.js) into the console. When it's done, the page will offer to save a TSV file. Download that.
    * You may receive a warning about only pasting code you trust. Bypass that. If you have any concerns, feel free to read the code 🙂
1. Upload it to [Google My Maps](https://www.google.com/maps/about/mymaps/)
   1. If you don't have a map yet, create one 
   1. Click `Add layer`
   1. On the new layer, click `Import`
   1. Select your TSV file
   1. Pick address for the positioning column.
   1. Pick name for the marker name column.

### Bonus

If you want accurate distance estimates using Google Maps:

1. Get credentials for the [Google Distance Matrix API](https://developers.google.com/maps/documentation/distance-matrix/start)
1. Open `directions.py` and customize relevant variables
1. Run `directions.py` with `apartments.tsv` in the same folder
1. Use `apartments-with-distance.tsv` in lieu of `apartments.tsv` when following steps to add to Google My Maps.
