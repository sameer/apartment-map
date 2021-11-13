// Apartments.com listings
(async () => {
  const website = window.location.href;
  const isApartments = website.includes("apartments.com");
  const isZillow = website.includes("zillow.com");
  const isForRent = website.includes("forrent.com");
  const isRent =
    website.includes("rent.com") || website.includes("apartmentguide.com");

  if (!(isApartments || isZillow || isForRent || isRent)) {
    console.error(
      `The website "${website}" is not supported. Please open an issue on GitHub.`
    );
  }

  function onPage(pageNumber) {
    if (isApartments) {
      const pageLink = document.querySelector(`a[data-page="${pageNumber}"]`);
      if (pageLink) {
        return pageLink.classList?.contains("active") ?? false;
      } else {
        // No pagination
        return pageNumber === 1;
      }
    } else if (isZillow) {
      return (
        document.querySelector(
          `a[Title="Page ${pageNumber}, current page"]`
        ) !== null
      );
    } else if (isForRent) {
      return (
        document.querySelector('a[aria-current="true"]')?.textContent ===
        `page ${pageNumber} `
      );
    } else if (isRent) {
      // Doesn't have page buttons
      return pageNumber === 1;
    }
  }

  function getButtonForPage(pageNumber) {
    if (isApartments) {
      return (
        document.querySelector(`a[data-page="${pageNumber}"]`) ??
        document.querySelector("a.next ")
      );
    } else if (isZillow) {
      const button =
        document.querySelector(`a[Title="Page ${pageNumber}"]`) ??
        document.querySelector('a[Title="Next page"]');
      if (button?.hasAttribute("disabled")) {
        return null;
      } else {
        return button;
      }
    } else if (isForRent) {
      const button =
        Array.from(document.querySelectorAll('a[aria-current="false"]')).find(
          (pageButton) => pageButton?.textContent === `page ${pageNumber} `
        ) ?? document.querySelector('a[aria-label="next page"]');
      if (
        button.hasAttribute("aria-disabled") &&
        button.getAttribute("aria-disabled") === "true"
      ) {
        return null;
      } else {
        return button;
      }
    } else if (isRent) {
      return document.querySelector('a[data-tid="pagination-next"]');
    }
  }

  function isLoading() {
    if (isApartments) {
      return (
        window.getComputedStyle(
          document.querySelector("div#placardLoadingOverlay")
        ).display !== "none"
      );
    } else if (isZillow) {
      return document.querySelector("div.list-loading-message-cover") !== null;
    } else if (isForRent) {
      return document.querySelector("div.loading-container") !== null;
    } else if (isRent) {
      return (
        document
          .querySelector('div[data-tid="property-count"]')
          ?.textContent?.includes("Loading Properties") ?? false
      );
    }
  }

  function getPageHash() {
    if (isApartments) {
      return document.querySelector(
        "li.mortar-wrapper article.placard span.title"
      )?.textContent;
    } else if (isZillow) {
      return document.querySelector("article.list-card address")?.textContent;
    } else if (isForRent) {
      return document.querySelector(
        "article.listing-card h2.property-title > a"
      )?.textContent;
    } else if (isRent) {
      return document.querySelector(
        'div.listing-card a[data-tid="property-title"]'
      )?.textContent;
    }
  }

  async function getListings() {
    if (isApartments) {
      return Array.from(
        document.querySelectorAll("li.mortar-wrapper article.placard")
      ).map((propertyInfo) => {
        const titleElement =
          propertyInfo.querySelector("span.title") ??
          propertyInfo.querySelector("div.property-title");
        if (titleElement == null) {
          console.log(propertyInfo);
        }
        const name = titleElement.textContent;
        const addressElements = Array.from(
          propertyInfo.querySelectorAll(".property-address")
        );

        let address = addressElements
          .map((x) => x.getAttribute("title"))
          .join(" ");
        // Some listings have part of the address in the title
        const regex =
          /^(?<city>[A-Z][a-z]+), (?<state>[A-Z]{2}) (?<zipcode>\d{5}(?:-\d{4})?)$/;
        if (regex.test(address)) {
          address = name + " " + address;
        }
        const url = propertyInfo.querySelector("a.property-link").href;
        // some listings do not show prices
        let priceRange =
          (
            propertyInfo.querySelector(".property-pricing") ??
            propertyInfo.querySelector(".property-rents") ??
            propertyInfo.querySelector(".price-range")
          )?.textContent ?? "N/A";

        return {
          name,
          address,
          url,
          priceRange,
        };
      });
    } else if (isZillow) {
      // Zillow only loads address info once you scroll into view of a listing
      do {
        const listings = Array.from(
          document.querySelectorAll("article.list-card")
        );
        for (let i = 0; i < listings.length; i++) {
          listings[i].scrollIntoView();
          await new Promise((r) => setTimeout(r, 50));
        }
      } while (
        Array.from(document.querySelectorAll("article.list-card"))
          .map((listing) => listing.querySelector("address"))
          .some((address) => address === null)
      );
      return Array.from(document.querySelectorAll("article.list-card")).map(
        (listing) => {
          const addressContent = listing
            .querySelector("address")
            ?.textContent?.split("|");
          let name = addressContent[0];
          const address = addressContent[addressContent.length - 1];
          if (name === address) {
            name =
              listing
                .querySelector("li.list-card-statusText")
                ?.textContent?.replace("- ", "") ?? name;
          }
          const url = listing.querySelector("a.list-card-link").href;
          const priceRange =
            listing.querySelector("div.list-card-price")?.textContent ?? "N/A";

          return {
            name,
            address,
            url,
            priceRange,
          };
        }
      );
    } else if (isForRent) {
      const titleSelector = "h2.property-title > a";
      return Array.from(document.querySelectorAll("article.listing-card")).map(
        (listing) => ({
          name: listing.querySelector(titleSelector)?.textContent,
          address: listing.querySelector("address")?.textContent,
          url: listing.querySelector(titleSelector)?.href,
          priceRange:
            listing
              .querySelector("p.copy-row span.border-left")
              ?.textContent?.replace("–", "-") ?? "N/A",
        })
      );
    } else if (isRent) {
      const titleSelector = 'a[data-tid="property-title"]';
      return Array.from(document.querySelectorAll("div.listing-card")).map(
        (listing) => ({
          name: listing.querySelector(titleSelector)?.textContent,
          address:
            listing.querySelector('a[data-tid="listing-info-address"]')
              ?.textContent ??
            (listing.querySelector(titleSelector)?.textContent ?? "") +
              (listing.querySelector('a[data-id="listing-info-address"]') ??
                ""),
          url: listing.querySelector(titleSelector)?.href,
          priceRange:
            listing
              .querySelector('span[data-tid="price"]')
              ?.textContent?.replace("–", "-") ?? "N/A",
        })
      );
    }
  }

  console.log("Please wait while I click through the pages...");
  let tsv = "name\taddress\tURL\tprice-range\n";

  let prevPageHash = undefined;

  let pageNumber = 1;
  for (;;) {
    // load next page or finish search

    if (!onPage(pageNumber)) {
      const button = getButtonForPage(pageNumber);
      if (button !== null) {
        button.click();
      } else {
        console.log("Done!");
        break;
      }
    }

    let pageHash = undefined;
    do {
      console.log(
        `Waiting for page ${pageNumber} to load (debug info: ${isLoading()} | ${prevPageHash} === ${pageHash})`
      );
      await new Promise((r) => setTimeout(r, 1000));
      pageHash = getPageHash();
    } while (isLoading() || prevPageHash === pageHash);
    prevPageHash = pageHash;

    console.log(`Processing ${pageNumber}`);
    pageNumber++;

    // add listings on page to TSV
    tsv += (await getListings())
      .map(
        ({ name, address, url, priceRange }) =>
          `${name.trim()}\t${address.trim()}\t${url.trim()}\t${priceRange.trim()}\n`
      )
      .reduce((acc, curr) => acc + curr, "");
  }
  const tsvDataUri = "data:text/tsv;base64," + btoa(unescape(encodeURIComponent(tsv)));
  const link = document.createElement("a");
  link.href = tsvDataUri;
  link.download = "apartments.tsv";
  link.click();
  console.log(
    "You should now see a pop-up to download a TSV file with the listings from your search"
  );
})().catch((e) => {
  console.log(
    `There was an error while pulling listings: ${e.message} \nThere may be an issue with your browser or this site has changed. Please create an issue on GitHub.`
  );
  console.log(e.stack);
});
