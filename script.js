/*
 * ============================================
 * CONFIGURATION
 * ============================================
 */

const CONFIG = {
  totalPages: 8,

  pageWidth: 720,
  pageHeight: 720,

  bookWidth: 1440,
  bookHeight: 720,

  /*
   * Page-turn animation.
   */
  duration: 700,

  elevation: 70,

  resizeDelay: 120
};


/* ============================================
   STATE
   ============================================ */

let isTurning = false;

let resizeTimer = null;

let isInitialised = false;


/* ============================================
   DOM
   ============================================ */

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


/* ============================================
   VALIDATION
   ============================================ */

function checkMarkup() {

  const missing = [];


  if (!bookArea) {
    missing.push(
      ".book-area"
    );
  }


  if (!bookWrapper) {
    missing.push(
      "#book-wrapper"
    );
  }


  if (!flipbook) {
    missing.push(
      "#flipbook"
    );
  }


  if (!previousButton) {
    missing.push(
      "#previous-button"
    );
  }


  if (!nextButton) {
    missing.push(
      "#next-button"
    );
  }


  if (missing.length) {

    throw new Error(
      "Flipbook markup error. Missing: " +
      missing.join(", ")
    );

  }

}


/* ============================================
   DEPENDENCIES
   ============================================ */

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


/* ============================================
   RESPONSIVE SIZE
   ============================================ */

function getBookSize() {

  const rect =
    bookArea.getBoundingClientRect();


  const width =
    Math.max(
      1,
      Math.round(
        rect.width
      )
    );


  /*
   * Open book always stays 2:1.
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


/* ============================================
   CURRENT PAGE
   ============================================ */

function getCurrentPage() {

  if (!isInitialised) {
    return 1;
  }


  const currentPage =
    window.jQuery(
      flipbook
    ).turn(
      "page"
    );


  return (
    Number(currentPage) ||
    1
  );

}


/* ============================================
   CURRENT VIEW
   ============================================ */

function getCurrentView() {

  if (!isInitialised) {
    return [1];
  }


  const currentView =
    window.jQuery(
      flipbook
    ).turn(
      "view"
    );


  if (
    !Array.isArray(
      currentView
    )
  ) {

    return [];

  }


  return currentView.filter(
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


/* ============================================
   BOOK POSITION
   ============================================ */

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
   * OPEN BOOK
   */

  bookWrapper.classList.add(
    "spread-position"
  );

}


/* ============================================
   PREPARE TARGET POSITION
   ============================================ */

function prepareBookPosition(
  targetPage
) {

  bookWrapper.classList.remove(
    "cover-position",
    "spread-position",
    "back-position"
  );


  if (
    targetPage <= 1
  ) {

    bookWrapper.classList.add(
      "cover-position"
    );

    return;

  }


  if (
    targetPage >=
    CONFIG.totalPages
  ) {

    bookWrapper.classList.add(
      "back-position"
    );

    return;

  }


  bookWrapper.classList.add(
    "spread-position"
  );

}


/* ============================================
   PAGE LABEL
   ============================================ */

function getPageLabel() {

  const currentPage =
    getCurrentPage();


  const view =
    getCurrentView();


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


  if (
    view.length >= 2
  ) {

    const left =
      view[0];


    const right =
      view[1];


    return {
      visual:
        `Pages ${left}–${right}`,

      accessible:
        `Showing pages ${left} and ${right}`
    };

  }


  const visible =
    view[0] ||
    currentPage;


  return {
    visual:
      `Page ${visible}`,

    accessible:
      `Showing page ${visible}`
  };

}


/* ============================================
   UPDATE INTERFACE
   ============================================ */

function updateInterface() {

  const currentPage =
    getCurrentPage();


  previousButton.disabled =
    isTurning ||
    currentPage <= 1;


  nextButton.disabled =
    isTurning ||
    currentPage >=
      CONFIG.totalPages;


  const label =
    getPageLabel();


  if (pageIndicator) {

    pageIndicator.textContent =
      label.visual;

  }


  if (status) {

    status.textContent =
      label.accessible;

  }

}


/* ============================================
   NEXT
   ============================================ */

function goNext() {

  if (
    !isInitialised ||
    isTurning
  ) {
    return;
  }


  if (
    getCurrentPage() >=
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


/* ============================================
   PREVIOUS
   ============================================ */

function goPrevious() {

  if (
    !isInitialised ||
    isTurning
  ) {
    return;
  }


  if (
    getCurrentPage() <= 1
  ) {
    return;
  }


  window.jQuery(
    flipbook
  ).turn(
    "previous"
  );

}


/* ============================================
   RESIZE
   ============================================ */

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


  updateBookPosition();

}


/* ============================================
   INITIALISE
   ============================================ */

function initialiseBook() {

  checkMarkup();

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

    display:
      "double",

    page:
      1,

    duration:
      CONFIG.duration,

    gradients:
      true,

    acceleration:
      true,

    elevation:
      CONFIG.elevation,

    when: {

      start:
        function () {

          isTurning = true;


          updateInterface();

        },


      turning:
        function (
          event,
          page
        ) {

          prepareBookPosition(
            Number(page)
          );

        },


      turned:
        function () {

          isTurning = false;


          updateBookPosition();


          updateInterface();

        },


      end:
        function () {

          isTurning = false;


          updateBookPosition();


          updateInterface();

        }

    }

  });


  isInitialised = true;


  updateBookPosition();


  updateInterface();


  console.log(
    "Turn.js flipbook initialized.",
    {
      totalPages:
        CONFIG.totalPages,

      pageSize:
        "720 × 720",

      bookRatio:
        "2:1",

      duration:
        "700ms",

      desktop:
        "1152px+",

      tablet:
        "700px–1151px",

      mobile:
        "699px and below"
    }
  );

}


/* ============================================
   EVENTS
   ============================================ */

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


/* ============================================
   RESPONSIVE RESIZE
   ============================================ */

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


/* ============================================
   PREVENT IMAGE DRAGGING
   ============================================ */

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


/* ============================================
   START
   ============================================ */

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
