/*
 * ============================================
 * FLIPBOOK CONFIGURATION
 * ============================================
 */

const CONFIG = {
  totalPages: 8,

  /*
   * Original physical page size.
   */
  pageWidth: 720,
  pageHeight: 720,

  /*
   * Complete open book:
   * 1440 × 720
   */
  bookWidth: 1440,
  bookHeight: 720,

  /*
   * Page-turn duration.
   *
   * Previous version: 900ms
   * Updated: 700ms
   */
  duration: 700,

  /*
   * Page elevation while turning.
   */
  elevation: 70,

  /*
   * Delay before resizing after
   * the browser changes size.
   */
  resizeDelay: 120
};


/*
 * ============================================
 * APPLICATION STATE
 * ============================================
 */

let isTurning = false;

let resizeTimer = null;

let isInitialised = false;


/*
 * ============================================
 * DOM REFERENCES
 * ============================================
 */

const bookArea =
  document.querySelector(
    ".book-area"
  );


const bookWrapper =
  document.getElementById(
    "book-wrapper"
  );


const flipbook =
  document.getElementById(
    "flipbook"
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


const status =
  document.getElementById(
    "status"
  );


/*
 * ============================================
 * CHECK REQUIRED ELEMENTS
 * ============================================
 */

function checkMarkup() {

  const missingElements = [];


  if (!bookArea) {
    missingElements.push(
      ".book-area"
    );
  }


  if (!bookWrapper) {
    missingElements.push(
      "#book-wrapper"
    );
  }


  if (!flipbook) {
    missingElements.push(
      "#flipbook"
    );
  }


  if (!previousButton) {
    missingElements.push(
      "#previous-button"
    );
  }


  if (!nextButton) {
    missingElements.push(
      "#next-button"
    );
  }


  if (
    missingElements.length > 0
  ) {

    throw new Error(
      "Flipbook markup error. Missing: " +
      missingElements.join(", ")
    );

  }

}


/*
 * ============================================
 * CHECK LIBRARIES
 * ============================================
 */

function checkDependencies() {

  if (
    typeof window.jQuery ===
    "undefined"
  ) {

    throw new Error(
      "Flipbook: jQuery did not load."
    );

  }


  if (
    typeof window.jQuery.fn.turn ===
    "undefined"
  ) {

    throw new Error(
      "Flipbook: Turn.js did not load."
    );

  }

}


/*
 * ============================================
 * RESPONSIVE BOOK SIZE
 * ============================================
 */

function getBookSize() {

  /*
   * CSS determines the width of .book-area.
   *
   * JavaScript simply reads that value so
   * Turn.js always matches the CSS layout.
   */

  const width =
    Math.max(
      1,
      Math.round(
        bookArea.getBoundingClientRect().width
      )
    );


  /*
   * Open book must always remain exactly 2:1.
   */
  const height =
    Math.max(
      1,
      Math.round(
        width / 2
      )
    );


  return {
    width,
    height
  };

}


/*
 * ============================================
 * CURRENT PAGE
 * ============================================
 */

function getCurrentPage() {

  if (!isInitialised) {
    return 1;
  }


  const page =
    window.jQuery(
      flipbook
    ).turn(
      "page"
    );


  return Number(page) || 1;

}


/*
 * ============================================
 * CURRENT VISIBLE PAGES
 * ============================================
 */

function getCurrentView() {

  if (!isInitialised) {
    return [1];
  }


  const view =
    window.jQuery(
      flipbook
    ).turn(
      "view"
    );


  if (
    !Array.isArray(view)
  ) {
    return [];
  }


  return view.filter(
    (pageNumber) => {

      return (
        Number.isFinite(
          pageNumber
        ) &&
        pageNumber > 0
      );

    }
  );

}


/*
 * ============================================
 * POSITION THE BOOK
 * ============================================
 */

function updateBookPosition() {

  const currentPage =
    getCurrentPage();


  bookWrapper.classList.remove(
    "cover-position",
    "spread-position",
    "back-position"
  );


  /*
   * FRONT COVER
   *
   * Turn.js places Page 1 on one half
   * of the double-page canvas.
   *
   * CSS centers the individual cover.
   */

  if (
    currentPage <= 1
  ) {

    bookWrapper.classList.add(
      "cover-position"
    );

    return;

  }


  /*
   * BACK COVER
   */

  if (
    currentPage >=
    CONFIG.totalPages
  ) {

    bookWrapper.classList.add(
      "back-position"
    );

    return;

  }


  /*
   * INTERIOR SPREADS
   */

  bookWrapper.classList.add(
    "spread-position"
  );

}


/*
 * ============================================
 * PAGE LABELS
 * ============================================
 */

function getPageLabel() {

  const currentPage =
    getCurrentPage();


  const view =
    getCurrentView();


  /*
   * FRONT COVER
   */

  if (
    currentPage <= 1
  ) {

    return {
      visual:
        "Cover",

      accessible:
        "Front cover"
    };

  }


  /*
   * BACK COVER
   */

  if (
    currentPage >=
    CONFIG.totalPages
  ) {

    return {
      visual:
        "Back cover",

      accessible:
        "Back cover"
    };

  }


  /*
   * TWO-PAGE SPREAD
   */

  if (
    view.length >= 2
  ) {

    const leftPage =
      view[0];


    const rightPage =
      view[1];


    return {
      visual:
        `Pages ${leftPage}–${rightPage}`,

      accessible:
        `Showing pages ${leftPage} and ${rightPage}`
    };

  }


  /*
   * FALLBACK
   */

  const visiblePage =
    view[0] ||
    currentPage;


  return {
    visual:
      `Page ${visiblePage}`,

    accessible:
      `Showing page ${visiblePage}`
  };

}


/*
 * ============================================
 * UPDATE INTERFACE
 * ============================================
 */

function updateInterface() {

  const currentPage =
    getCurrentPage();


  /*
   * Disable Previous on cover.
   */

  previousButton.disabled =
    isTurning ||
    currentPage <= 1;


  /*
   * Disable Next on back cover.
   */

  nextButton.disabled =
    isTurning ||
    currentPage >=
      CONFIG.totalPages;


  const label =
    getPageLabel();


  /*
   * Page indicator is optional.
   *
   * It can remain visually hidden in CSS
   * without affecting functionality.
   */

  if (pageIndicator) {

    pageIndicator.textContent =
      label.visual;

  }


  /*
   * Accessible status is also optional.
   */

  if (status) {

    status.textContent =
      label.accessible;

  }

}


/*
 * ============================================
 * PREPARE POSITION WHILE TURNING
 * ============================================
 */

function prepareBookPosition(
  targetPage
) {

  bookWrapper.classList.remove(
    "cover-position",
    "spread-position",
    "back-position"
  );


  /*
   * Moving toward Page 1.
   */

  if (
    targetPage <= 1
  ) {

    bookWrapper.classList.add(
      "cover-position"
    );

    return;

  }


  /*
   * Moving toward final page.
   */

  if (
    targetPage >=
    CONFIG.totalPages
  ) {

    bookWrapper.classList.add(
      "back-position"
    );

    return;

  }


  /*
   * Moving toward an interior spread.
   */

  bookWrapper.classList.add(
    "spread-position"
  );

}


/*
 * ============================================
 * NEXT
 * ============================================
 */

function goNext() {

  if (
    !isInitialised ||
    isTurning
  ) {
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
    flipbook
  ).turn(
    "next"
  );

}


/*
 * ============================================
 * PREVIOUS
 * ============================================
 */

function goPrevious() {

  if (
    !isInitialised ||
    isTurning
  ) {
    return;
  }


  const currentPage =
    getCurrentPage();


  if (
    currentPage <= 1
  ) {
    return;
  }


  window.jQuery(
    flipbook
  ).turn(
    "previous"
  );

}


/*
 * ============================================
 * RESIZE
 * ============================================
 */

function resizeBook() {

  if (!isInitialised) {
    return;
  }


  const size =
    getBookSize();


  window.jQuery(
    flipbook
  ).turn(
    "size",
    size.width,
    size.height
  );


  /*
   * Reapply the correct cover/spread
   * position after resizing.
   */

  updateBookPosition();

}


/*
 * ============================================
 * INITIALISE TURN.JS
 * ============================================
 */

function initialiseBook() {

  checkMarkup();

  checkDependencies();


  const size =
    getBookSize();


  window.jQuery(
    flipbook
  ).turn({

    /*
     * Responsive dimensions calculated
     * from .book-area.
     */

    width:
      size.width,


    height:
      size.height,


    /*
     * Two-page book.
     */

    display:
      "double",


    /*
     * Begin on Page 1.
     */

    page:
      1,


    /*
     * UPDATED:
     *
     * Page turn is now 700ms.
     */

    duration:
      CONFIG.duration,


    /*
     * Enable natural Turn.js shading.
     */

    gradients:
      true,


    /*
     * Enable acceleration.
     */

    acceleration:
      true,


    /*
     * Physical page elevation.
     */

    elevation:
      CONFIG.elevation,


    /*
     * ======================================
     * TURN.JS EVENTS
     * ======================================
     */

    when: {


      /*
       * Page starts moving.
       */

      start: function () {

        isTurning = true;


        updateInterface();

      },


      /*
       * Turn.js identifies target page.
       *
       * Start moving the complete book
       * toward:
       *
       * centered cover
       * full spread
       * centered back cover
       */

      turning:
        function (
          event,
          page
        ) {

          prepareBookPosition(
            Number(page)
          );

        },


      /*
       * Destination reached.
       */

      turned:
        function () {

          isTurning = false;


          updateBookPosition();


          updateInterface();

        },


      /*
       * Animation finished.
       */

      end:
        function () {

          isTurning = false;


          updateBookPosition();


          updateInterface();

        }

    }

  });


  /*
   * Turn.js now exists.
   */

  isInitialised = true;


  /*
   * Initial front-cover state.
   */

  updateBookPosition();


  updateInterface();


  console.log(
    "Turn.js flipbook initialized.",
    {
      totalPages:
        CONFIG.totalPages,

      physicalPage:
        `${CONFIG.pageWidth} × ${CONFIG.pageHeight}`,

      openBook:
        `${CONFIG.bookWidth} × ${CONFIG.bookHeight}`,

      duration:
        `${CONFIG.duration}ms`
    }
  );

}


/*
 * ============================================
 * BUTTON EVENTS
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


/*
 * ============================================
 * KEYBOARD NAVIGATION
 * ============================================
 */

window.addEventListener(
  "keydown",
  (event) => {

    /*
     * RIGHT ARROW
     */

    if (
      event.key ===
      "ArrowRight"
    ) {

      event.preventDefault();


      goNext();

    }


    /*
     * LEFT ARROW
     */

    if (
      event.key ===
      "ArrowLeft"
    ) {

      event.preventDefault();


      goPrevious();

    }

  }
);


/*
 * ============================================
 * RESPONSIVE RESIZING
 * ============================================
 */

window.addEventListener(
  "resize",
  () => {

    window.clearTimeout(
      resizeTimer
    );


    resizeTimer =
      window.setTimeout(
        () => {

          resizeBook();

        },
        CONFIG.resizeDelay
      );

  }
);


/*
 * ============================================
 * PREVENT IMAGE DRAGGING
 * ============================================
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
 * INITIALISE
 * ============================================
 */

window.addEventListener(
  "load",
  () => {

    try {

      initialiseBook();

    } catch (error) {

      console.error(
        "Flipbook initialization failed:",
        error
      );


      if (status) {

        status.textContent =
          "The flipbook could not load.";

      }

    }

  }
);
