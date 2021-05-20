# apartment-map

Import apartments from apartments.com to Google My Maps.

## Why?

So you can consider multiple factors beyond your commute. Maybe you want to look at crime, bus routes, or even noise levels.

## Demo

I pulled apartments in Culver city and displayed them alongside Metro stations:

![Screenshot of Google My Maps](screenshot.png)

Each location has the price range and a link back to the original listing: ![Screenshot of Google My Maps showing listing details](https://user-images.githubusercontent.com/11097096/118912172-5ce5e280-b8f5-11eb-8c85-3b13b3416b71.png)

If you want to make your map even more detailed, you can add car or public transit durations with `directions.py`: ![Screenshot of Google My Maps showing listing details with distance and bus fare](https://user-images.githubusercontent.com/11097096/118912388-bbab5c00-b8f5-11eb-8917-15928f0d1387.png)


## Instructions

1. Do your search on apartments.com. Make sure you are on page 1 of the results.
1. Right click on the page and hit "Inspect Element". In Chrome, this is just "Inspect".
    * Beware that this changes the size of the map and the results may change.
1. Go to the tab that says "Console".
1. Copy and paste apartments.js into the console. When it's done, the page will offer to save an `apartments.tsv` file. Download that.
1. Upload it to Google My Maps.
1. Pick address for the positioning column.
1. Pick name for the marker name column.
