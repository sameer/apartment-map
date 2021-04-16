# apartments-map

Export apartments from apartments.com to import them into Google My Maps.

## Why?

So you can consider multiple factors beyond commute and  work is. Maybe you want to consider crime, air pollution, or even noise levels.

## Demo

I pulled apartments in Culver city along with the Metro stations:

![Screenshot of Google My Maps](screenshot.png)

## Instructions

1. Do your search on apartments.com
1. Create a file called `apartments.tsv`. In that file, put `name	address` as the first line.
1. Right click on the page and hit "Inspect Element". In Chrome, this is just "Inspect".
    * Beware that this can change the size of the map and the results may change.
1. Go to the tab that says "Console".
1. Copy and paste apartments.js into the console. This will give you the first 25 listings on the page in TSV format.
1. Copy and paste that into your `apartments.tsv`.
1. Scroll down to the bottom of the listings and click the next page button.
1. Repeat steps page by page until you have all the listings.
1. Upload to Google My Maps.