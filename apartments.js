// Apartments.com listings
(async () => {
  const website = window.location.href;
  const isApartments = website.includes("apartments.com");
  const isZillow = website.includes("zillow.com");
  const isRent = website.includes("rent.com");

  if (!(isApartments || isZillow || isRent)) {
    console.error(
      `The website "${website}" is not supported. Please open an issue on GitHub.`
    );
  }

  function onPage(pageNumber) {
    if (isApartments) {
      return (
        document
          .querySelector(`a[data-page="${pageNumber}]`)
          ?.classList.includes("active") ?? false
      );
    } else if (isZillow) {
      return (
        document.querySelector(
          `a[Title="Page ${pageNumber}, current page"]`
        ) !== null
      );
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
      if (button.hasAttribute("disabled")) {
        return null;
      } else {
        return button;
      }
    }
    return null;
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
    }
  }

  function getPageHash() {
    if (isApartments) {
      return document.querySelector("article.placard-option span.title")
        ?.textContent;
    } else if (isZillow) {
      return document.querySelector("article.list-card address")?.textContent;
    }
  }

  async function getListings() {
    if (isApartments) {
      return Array.from(
        document.querySelectorAll("article.placard-option")
      ).map((propertyInfo) => {
        const titleElement = propertyInfo.querySelector("span.title");
        const name = titleElement.textContent;
        const addressElement = propertyInfo.querySelector(
          "div.property-address"
        );

        let address = addressElement.getAttribute("title");
        // Some listings have part of the address in the title
        const regex =
          /^(?<city>[A-Z][a-z]+), (?<state>[A-Z]{2}) (?<zipcode>\d{5}(?:-\d{4})?)$/;
        if (regex.test(address)) {
          address = name + " " + address;
        }
        const url = propertyInfo.querySelector("a.property-link").href;
        // some listings do not show prices
        let priceRange =
          propertyInfo.querySelector("div.price-range")?.textContent ?? "N/A";

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
      console.log(`Waiting for page ${pageNumber} to load`);
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
          `${name}\t${address}\t${url}\t${priceRange}\n`
      )
      .reduce((acc, curr) => acc + curr, "");
  }
  // btoa does not support non-ascii characters: https://stackoverflow.com/q/23223718
  tsv = tsv.replace(/[^\x00-\x7F]/g, "");
  const tsvDataUri = "data:text/tsv;base64," + btoa(tsv);
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
