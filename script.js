/*
 * ============================================
 * TURN.JS FLIPBOOK CONFIGURATION
 * ============================================
 */

const CONFIG = {
  totalPages: 8,

  /*
   * Native dimensions of the complete
   * two-page book.
   */
  nativeBookWidth: 1440,
  nativeBookHeight: 720,

  /*
   * Turn.js uses one duration for its
   * page-turn animation.
   *
   * 850ms gives the page enough time to
   * show the curl without feeling slow.
   */
  turnDuration: 850,

  resizeDebounce: 100
};


/*
 * ============================================
 * DOM REFERENCES
 * ============================================
 */

const bookFrame =
  document.getElementById(
    "book-frame"
  );

const bookPositioner =
  document.getElementById(
    "book-positioner"
  );

const flipbookElement =
  document.getElementById(
    "flipbook"
  );

const flipbookExperience =
  document.querySelector(
    ".flipbook-experience"
  );

const previousButton =
  document.getElementById(
    "previous-button"
  );

const nextButton =
  document.getElementById(
    "next-button"
  );

const pageIndicator =
  document.getElementById(
    "page-indicator"
  );

const bookStatus =
  document.getElementById(
    "book-status"
  );


/*
 * ============================================
 * STATE
 * ============================================
 */

let isTurning = false;
let resizeTimer = null;

const reducedMotion =
  window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;


/*
 * ============================================
 * INITIAL CHECKS
 * ============================================
 */

function verifyDependencies() {
  if (
    typeof window.jQuery ===
    "undefined"
  ) {
    throw new Error(
      "Flipbook error: jQuery did not load."
    );
  }

  if (
    typeof window.jQuery.fn.turn ===
    "undefined"
  ) {
    throw new Error(
      "Flipbook error: Turn.js did not load."
    );
  }
}


/*
 * ============================================
 * RESPONSIVE SIZING
 * ============================================
 */

function getResponsiveBookSize() {
  const availableWidth =
    bookFrame.clientWidth;

  const width =
    Math.max(
      1,
      Math.round(availableWidth)
    );

  const height =
    Math.max(
      1,
      Math.round(width / 2)
    );

  return {
    width,
    height
  };
}


function resizeFlipbook() {
  const size =
    getResponsiveBookSize();

  window.jQuery(
    flipbookElement
  ).turn(
    "size",
    size.width,
    size.height
  );
}


/*
 * ============================================
 * VIEW HELPERS
 * ============================================
 */

function getCurrentPage() {
  return window.jQuery(
    flipbookElement
  ).turn("page");
}


function getCurrentView() {
  return window.jQuery(
    flipbookElement
  ).turn("view");
}


function getVisiblePages() {
  return getCurrentView()
    .filter((pageNumber) => {
      return (
        Number.isFinite(pageNumber) &&
        pageNumber > 0
      );
    });
}


/*
 * ============================================
 * BOOK POSITIONING
 * ============================================
 */

function updateBookPosition() {
  const page =
    getCurrentPage();

  bookFrame.classList.remove(
    "is-front-cover",
    "is-open",
    "is-back-cover"
  );

  if (page <= 1) {
    bookFrame.classList.add(
      "is-front-cover"
    );

    return;
  }

  if (
    page >=
    CONFIG.totalPages
  ) {
    bookFrame.classList.add(
      "is-back-cover"
    );

    return;
  }

  bookFrame.classList.add(
    "is-open"
  );
}


/*
 * ============================================
 * ACCESSIBLE STATUS
 * ============================================
 */

function getInterfaceLabel() {
  const currentPage =
    getCurrentPage();

  const visiblePages =
    getVisiblePages();

  if (currentPage <= 1) {
    return {
      indicator: "Cover",
      status: "Front cover"
    };
  }

  if (
    currentPage >=
    CONFIG.totalPages
  ) {
    return {
      indicator: "Back cover",
      status: "Back cover"
    };
  }

  if (visiblePages.length >= 2) {
    const leftPage =
      visiblePages[0];

    const rightPage =
      visiblePages[1];

    return {
      indicator:
        `Pages ${leftPage}–${rightPage}`,

      status:
        `Showing pages ${leftPage} and ${rightPage}`
    };
  }

  const pageNumber =
    visiblePages[0] ||
    currentPage;

  return {
    indicator:
      `Page ${pageNumber}`,

    status:
      `Showing page ${pageNumber}`
  };
}


/*
 * ============================================
 * CONTROLS
 * ============================================
 */

function updateControls() {
  const currentPage =
    getCurrentPage();

  const label =
    getInterfaceLabel();

  previousButton.disabled =
    isTurning ||
    currentPage <= 1;

  nextButton.disabled =
    isTurning ||
    currentPage >=
      CONFIG.totalPages;

  pageIndicator.textContent =
    label.indicator;

  bookStatus.textContent =
    label.status;
}


/*
 * ============================================
 * NAVIGATION
 * ============================================
 */

function goNext() {
  if (isTurning) {
    return;
  }

  const currentPage =
    getCurrentPage();

  if (
    currentPage >=
    CONFIG.totalPages
  ) {
    return;
  }

  window.jQuery(
    flipbookElement
  ).turn("next");
}


function goPrevious() {
  if (isTurning) {
    return;
  }

  const currentPage =
    getCurrentPage();

  if (currentPage <= 1) {
    return;
  }

  window.jQuery(
    flipbookElement
  ).turn("previous");
}


/*
 * ============================================
 * TURN.JS INITIALISATION
 * ============================================
 */

function initialiseFlipbook() {
  verifyDependencies();

  const size =
    getResponsiveBookSize();

  flipbookExperience.classList.add(
    "is-loading"
  );

  window.jQuery(
    flipbookElement
  ).turn({
    width:
      size.width,

    height:
      size.height,

    display:
      "double",

    page:
      1,

    duration:
      reducedMotion
        ? 1
        : CONFIG.turnDuration,

    gradients:
      true,

    acceleration:
      true,

    elevation:
      70,

    when: {
      start: function () {
        isTurning = true;

        updateControls();
      },

      turning: function (
        event,
        page
      ) {
        /*
         * Begin moving the overall book
         * as the cover opens or closes.
         */
        bookFrame.classList.remove(
          "is-front-cover",
          "is-open",
          "is-back-cover"
        );

        if (page <= 1) {
          bookFrame.classList.add(
            "is-front-cover"
          );
        } else if (
          page >=
          CONFIG.totalPages
        ) {
          bookFrame.classList.add(
            "is-back-cover"
          );
        } else {
          bookFrame.classList.add(
            "is-open"
          );
        }
      },

      turned: function () {
        isTurning = false;

        updateBookPosition();
        updateControls();
      },

      end: function () {
        isTurning = false;

        updateBookPosition();
        updateControls();
      }
    }
  });

  updateBookPosition();
  updateControls();

  flipbookExperience.classList.remove(
    "is-loading"
  );

  flipbookExperience.classList.add(
    "is-ready"
  );

  console.log(
    "Turn.js flipbook initialized.",
    {
      totalPages:
        CONFIG.totalPages,

      pageDimensions:
        "720 × 720",

      openBookDimensions:
        "1440 × 720",

      turnDuration:
        CONFIG.turnDuration
    }
  );
}


/*
 * ============================================
 * EVENTS
 * ============================================
 */

nextButton.addEventListener(
  "click",
  goNext
);

previousButton.addEventListener(
  "click",
  goPrevious
);


window.addEventListener(
  "keydown",
  (event) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goNext();
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goPrevious();
    }
  }
);


window.addEventListener(
  "resize",
  () => {
    window.clearTimeout(
      resizeTimer
    );

    resizeTimer =
      window.setTimeout(
        resizeFlipbook,
        CONFIG.resizeDebounce
      );
  }
);


/*
 * Prevent images from being dragged.
 */

document.addEventListener(
  "dragstart",
  (event) => {
    if (
      event.target instanceof
      HTMLImageElement
    ) {
      event.preventDefault();
    }
  }
);


/*
 * ============================================
 * START
 * ============================================
 */

window.addEventListener(
  "load",
  () => {
    try {
      initialiseFlipbook();
    } catch (error) {
      console.error(error);

      bookStatus.textContent =
        "The flipbook could not load.";
    }
  }
);
