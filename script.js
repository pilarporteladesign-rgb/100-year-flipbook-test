/*
 * ============================================
 * CONFIGURATION
 * ============================================
 */

const CONFIG = {
  totalPages: 8,

  /*
   * Each original page is 720 × 720.
   *
   * Open book:
   * 1440 × 720.
   */
  pageWidth: 720,
  pageHeight: 720,

  /*
   * Turn.js animation duration.
   */
  duration: 900,

  /*
   * Slightly exaggerates page elevation
   * during the turn.
   */
  elevation: 70,

  resizeDelay: 120
};


/*
 * ============================================
 * STATE
 * ============================================
 */

let isTurning = false;
let resizeTimer = null;


/*
 * ============================================
 * DOM
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
 * DEPENDENCY CHECK
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
 * SIZE
 * ============================================
 */

function getBookSize() {

  const width =
    Math.max(
      1,
      Math.round(
        bookArea.clientWidth
      )
    );


  /*
   * Open-book ratio is exactly 2:1.
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

  return window.jQuery(
    flipbook
  ).turn(
    "page"
  );

}


/*
 * ============================================
 * CURRENT VIEW
 * ============================================
 */

function getCurrentView() {

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
    (page) =>
      Number.isFinite(page) &&
      page > 0
  );

}


/*
 * ============================================
 * VISUAL BOOK POSITION
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


  bookArea.classList.remove(
    "is-open"
  );


  /*
   * PAGE 1
   *
   * Center cover.
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
   * PAGE 8
   *
   * Center back cover.
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
   * INTERIOR
   *
   * Full two-page spread.
   */
  bookWrapper.classList.add(
    "spread-position"
  );


  bookArea.classList.add(
    "is-open"
  );

}


/*
 * ============================================
 * INDICATOR
 * ============================================
 */

function updateIndicator() {

  const currentPage =
    getCurrentPage();


  const view =
    getCurrentView();


  if (
    currentPage <= 1
  ) {

    pageIndicator.textContent =
      "Cover";


    status.textContent =
      "Front cover";


    return;

  }


  if (
    currentPage >=
    CONFIG.totalPages
  ) {

    pageIndicator.textContent =
      "Back cover";


    status.textContent =
      "Back cover";


    return;

  }


  if (
    view.length >= 2
  ) {

    const first =
      view[0];


    const second =
      view[1];


    pageIndicator.textContent =
      `Pages ${first}–${second}`;


    status.textContent =
      `Showing pages ${first} and ${second}`;


    return;

  }


  const visiblePage =
    view[0] ||
    currentPage;


  pageIndicator.textContent =
    `Page ${visiblePage}`;


  status.textContent =
    `Showing page ${visiblePage}`;

}


/*
 * ============================================
 * CONTROLS
 * ============================================
 */

function updateControls() {

  const currentPage =
    getCurrentPage();


  previousButton.disabled =
    isTurning ||
    currentPage <= 1;


  nextButton.disabled =
    isTurning ||
    currentPage >=
      CONFIG.totalPages;


  updateIndicator();

}


/*
 * ============================================
 * NAVIGATION
 * ============================================
 */

function goNext() {

  if (
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


function goPrevious() {

  if (
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

  /*
   * Do nothing until Turn.js exists.
   */
  if (
    typeof window.jQuery ===
      "undefined" ||
    typeof window.jQuery.fn.turn ===
      "undefined"
  ) {
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

}


/*
 * ============================================
 * INITIALISE TURN.JS
 * ============================================
 */

function initialiseBook() {

  checkDependencies();


  const size =
    getBookSize();


  window.jQuery(
    flipbook
  ).turn({

    width:
      size.width,


    height:
      size.height,


    /*
     * Always use two-page book mode.
     */
    display:
      "double",


    /*
     * Begin on front cover.
     */
    page:
      1,


    /*
     * Smooth animation.
     */
    duration:
      CONFIG.duration,


    /*
     * Turn.js-generated page shading.
     */
    gradients:
      true,


    /*
     * GPU acceleration where available.
     */
    acceleration:
      true,


    /*
     * Depth given to the page while
     * it is turning.
     */
    elevation:
      CONFIG.elevation,


    /*
     * EVENT HANDLERS
     */
    when: {

      /*
       * Turn begins.
       */
      start: function () {

        isTurning = true;

        updateControls();

      },


      /*
       * Called once Turn.js knows which
       * page it is moving toward.
       */
      turning:
        function (
          event,
          page
        ) {

          bookWrapper.classList.remove(
            "cover-position",
            "spread-position",
            "back-position"
          );


          /*
           * Moving toward front cover.
           */
          if (
            page <= 1
          ) {

            bookWrapper.classList.add(
              "cover-position"
            );


            bookArea.classList.remove(
              "is-open"
            );


            return;

          }


          /*
           * Moving toward back cover.
           */
          if (
            page >=
            CONFIG.totalPages
          ) {

            bookWrapper.classList.add(
              "back-position"
            );


            bookArea.classList.remove(
              "is-open"
            );


            return;

          }


          /*
           * Interior spread.
           */
          bookWrapper.classList.add(
            "spread-position"
          );


          bookArea.classList.add(
            "is-open"
          );

        },


      /*
       * Turn successfully completed.
       */
      turned: function () {

        isTurning = false;


        updateBookPosition();


        updateControls();

      },


      /*
       * Turn animation completely ends.
       */
      end: function () {

        isTurning = false;


        updateBookPosition();


        updateControls();

      }

    }

  });


  /*
   * Apply initial visual state.
   */
  updateBookPosition();


  updateControls();


  console.log(
    "Turn.js flipbook initialized.",
    {
      totalPages:
        CONFIG.totalPages,

      pageSize:
        "720 × 720",

      openBookRatio:
        "2:1",

      duration:
        CONFIG.duration
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
 * KEYBOARD
 * ============================================
 */

window.addEventListener(
  "keydown",
  (event) => {

    if (
      event.key ===
      "ArrowRight"
    ) {

      event.preventDefault();

      goNext();

    }


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
 * RESPONSIVE RESIZE
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
        resizeBook,
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
 * INITIALISATION
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


      status.textContent =
        "The flipbook could not load.";

    }

  }
);
