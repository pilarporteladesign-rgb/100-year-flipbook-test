/*
 * ============================================
 * FLIPBOOK CONFIGURATION
 * ============================================
 */

const CONFIG = {
  totalPages: 8,

  imageDirectory:
    "./assets/pages",

  imagePrefix:
    "page-",

  imageExtension:
    "jpg",

  coverDuration:
    1050,

  pageDuration:
    850,

  closeDuration:
    1050,

  perspective:
    2200,

  easing:
    "cubic-bezier(0.65, 0, 0.35, 1)"
};


/*
 * ============================================
 * DOM REFERENCES
 * ============================================
 */

const stage =
  document.getElementById("book-stage");

const previousButton =
  document.getElementById("previous-button");

const nextButton =
  document.getElementById("next-button");

const pageIndicator =
  document.getElementById("page-indicator");

const bookStatus =
  document.getElementById("book-status");


/*
 * ============================================
 * READING STATES
 * ============================================
 *
 * 0: Front cover
 * 1: Pages 2 and 3
 * 2: Pages 4 and 5
 * 3: Pages 6 and 7
 * 4: Back cover
 */

const STATES = [
  {
    type: "front-cover",
    pages: [1],
    label: "Cover"
  },
  {
    type: "spread",
    pages: [2, 3],
    label: "Pages 2–3"
  },
  {
    type: "spread",
    pages: [4, 5],
    label: "Pages 4–5"
  },
  {
    type: "spread",
    pages: [6, 7],
    label: "Pages 6–7"
  },
  {
    type: "back-cover",
    pages: [8],
    label: "Back cover"
  }
];


/*
 * ============================================
 * APPLICATION STATE
 * ============================================
 */

let currentStateIndex = 0;
let isAnimating = false;

const prefersReducedMotion =
  window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;


/*
 * ============================================
 * IMAGE HELPERS
 * ============================================
 */

function getPageFilename(pageNumber) {
  const paddedNumber =
    String(pageNumber).padStart(2, "0");

  return (
    `${CONFIG.imageDirectory}/` +
    `${CONFIG.imagePrefix}` +
    `${paddedNumber}.` +
    `${CONFIG.imageExtension}`
  );
}


function createPageImage(
  pageNumber,
  alternativeText = ""
) {
  const image =
    document.createElement("img");

  image.src =
    getPageFilename(pageNumber);

  image.alt =
    alternativeText;

  image.width =
    720;

  image.height =
    720;

  image.decoding =
    "async";

  image.draggable =
    false;

  return image;
}


/*
 * ============================================
 * PAGE CREATION
 * ============================================
 */

function createStaticPage(
  pageNumber,
  position
) {
  const page =
    document.createElement("div");

  page.className =
    `book-page book-page--${position}`;

  page.dataset.page =
    String(pageNumber);

  const image =
    createPageImage(
      pageNumber,
      `Page ${pageNumber}`
    );

  page.appendChild(image);

  return page;
}


function createSpine() {
  const spine =
    document.createElement("div");

  spine.className =
    "book-spine";

  spine.setAttribute(
    "aria-hidden",
    "true"
  );

  return spine;
}


/*
 * ============================================
 * RENDERING
 * ============================================
 */

function clearStage() {
  stage.replaceChildren();
  stage.classList.remove("is-open");
}


function renderState(stateIndex) {
  clearStage();

  const state =
    STATES[stateIndex];

  if (!state) {
    return;
  }

  if (state.type === "spread") {
    const leftPage =
      createStaticPage(
        state.pages[0],
        "left"
      );

    const rightPage =
      createStaticPage(
        state.pages[1],
        "right"
      );

    stage.append(
      leftPage,
      rightPage,
      createSpine()
    );

    stage.classList.add("is-open");
  } else {
    const singlePage =
      createStaticPage(
        state.pages[0],
        "single"
      );

    stage.appendChild(singlePage);
  }

  updateInterface();
}


/*
 * ============================================
 * INTERFACE
 * ============================================
 */

function updateInterface() {
  const state =
    STATES[currentStateIndex];

  previousButton.disabled =
    isAnimating ||
    currentStateIndex === 0;

  nextButton.disabled =
    isAnimating ||
    currentStateIndex ===
      STATES.length - 1;

  pageIndicator.textContent =
    state.label;

  if (state.type === "front-cover") {
    bookStatus.textContent =
      "Front cover";
  } else if (state.type === "back-cover") {
    bookStatus.textContent =
      "Back cover";
  } else {
    bookStatus.textContent =
      `Showing pages ${state.pages[0]} and ${state.pages[1]}`;
  }
}


function setAnimating(value) {
  isAnimating = value;
  updateInterface();
}


/*
 * ============================================
 * ANIMATION HELPERS
 * ============================================
 */

function getDuration(duration) {
  return prefersReducedMotion
    ? 1
    : duration;
}


function createTurningPage(
  frontPageNumber,
  backPageNumber
) {
  const turningPage =
    document.createElement("div");

  turningPage.className =
    "turning-page";

  const front =
    document.createElement("div");

  front.className =
    "turning-page__face turning-page__front";

  const back =
    document.createElement("div");

  back.className =
    "turning-page__face turning-page__back";

  front.appendChild(
    createPageImage(
      frontPageNumber,
      `Page ${frontPageNumber}`
    )
  );

  back.appendChild(
    createPageImage(
      backPageNumber,
      `Page ${backPageNumber}`
    )
  );

  turningPage.append(
    front,
    back
  );

  return turningPage;
}


function createCoverTurn(
  frontPageNumber,
  backPageNumber = null
) {
  const cover =
    document.createElement("div");

  cover.className =
    "cover-turn";

  const front =
    document.createElement("div");

  front.className =
    "cover-turn__face cover-turn__front";

  front.appendChild(
    createPageImage(
      frontPageNumber,
      `Page ${frontPageNumber}`
    )
  );

  const back =
    document.createElement("div");

  back.className =
    "cover-turn__face cover-turn__back";

  if (backPageNumber !== null) {
    back.appendChild(
      createPageImage(
        backPageNumber,
        `Page ${backPageNumber}`
      )
    );
  }

  cover.append(
    front,
    back
  );

  return cover;
}


/*
 * ============================================
 * OPEN THE FRONT COVER
 * ============================================
 */

async function openFrontCover() {
  clearStage();

  /*
   * First spread under the opening cover.
   */
  const leftPage =
    createStaticPage(2, "left");

  const rightPage =
    createStaticPage(3, "right");

  const spine =
    createSpine();

  const cover =
    createCoverTurn(1, 2);

  stage.append(
    leftPage,
    rightPage,
    spine,
    cover
  );

  stage.classList.add("is-open");

  const duration =
    getDuration(
      CONFIG.coverDuration
    );

  const coverMovement =
    cover.animate(
      [
        {
          left: "25%",
          transform:
            `perspective(${CONFIG.perspective}px) rotateY(0deg)`
        },
        {
          left: "34%",
          transform:
            `perspective(${CONFIG.perspective}px) rotateY(-25deg)`,
          offset: 0.2
        },
        {
          left: "44%",
          transform:
            `perspective(${CONFIG.perspective}px) rotateY(-75deg)`,
          offset: 0.47
        },
        {
          left: "49%",
          transform:
            `perspective(${CONFIG.perspective}px) rotateY(-115deg)`,
          offset: 0.68
        },
        {
          left: "50%",
          transform:
            `perspective(${CONFIG.perspective}px) rotateY(-180deg)`
        }
      ],
      {
        duration,
        easing:
          CONFIG.easing,
        fill: "forwards"
      }
    );

  await coverMovement.finished;

  currentStateIndex = 1;

  renderState(
    currentStateIndex
  );
}


/*
 * ============================================
 * CLOSE THE FRONT COVER
 * ============================================
 */

async function closeFrontCover() {
  clearStage();

  const leftPage =
    createStaticPage(2, "left");

  const rightPage =
    createStaticPage(3, "right");

  const cover =
    createCoverTurn(1, 2);

  cover.style.left =
    "50%";

  cover.style.transform =
    `perspective(${CONFIG.perspective}px) rotateY(-180deg)`;

  stage.append(
    leftPage,
    rightPage,
    createSpine(),
    cover
  );

  stage.classList.add("is-open");

  const duration =
    getDuration(
      CONFIG.coverDuration
    );

  const animation =
    cover.animate(
      [
        {
          left: "50%",
          transform:
            `perspective(${CONFIG.perspective}px) rotateY(-180deg)`
        },
        {
          left: "49%",
          transform:
            `perspective(${CONFIG.perspective}px) rotateY(-115deg)`,
          offset: 0.32
        },
        {
          left: "44%",
          transform:
            `perspective(${CONFIG.perspective}px) rotateY(-75deg)`,
          offset: 0.53
        },
        {
          left: "34%",
          transform:
            `perspective(${CONFIG.perspective}px) rotateY(-25deg)`,
          offset: 0.8
        },
        {
          left: "25%",
          transform:
            `perspective(${CONFIG.perspective}px) rotateY(0deg)`
        }
      ],
      {
        duration,
        easing:
          CONFIG.easing,
        fill: "forwards"
      }
    );

  await animation.finished;

  currentStateIndex = 0;

  renderState(
    currentStateIndex
  );
}


/*
 * ============================================
 * TURN TO NEXT SPREAD
 * ============================================
 */

async function turnSpreadForward(
  currentState,
  nextState
) {
  clearStage();

  /*
   * Next spread underneath.
   */
  const nextLeft =
    createStaticPage(
      nextState.pages[0],
      "left"
    );

  const nextRight =
    createStaticPage(
      nextState.pages[1],
      "right"
    );

  /*
   * Current left page remains visible
   * until the turning page crosses the spine.
   */
  const currentLeft =
    createStaticPage(
      currentState.pages[0],
      "left"
    );

  const turningPage =
    createTurningPage(
      currentState.pages[1],
      nextState.pages[0]
    );

  stage.append(
    nextLeft,
    nextRight,
    currentLeft,
    createSpine(),
    turningPage
  );

  stage.classList.add("is-open");

  const duration =
    getDuration(
      CONFIG.pageDuration
    );

  const animation =
    turningPage.animate(
      [
        {
          transform:
            `perspective(${CONFIG.perspective}px) rotateY(0deg)`
        },
        {
          transform:
            `perspective(${CONFIG.perspective}px) rotateY(-35deg)`,
          offset: 0.22
        },
        {
          transform:
            `perspective(${CONFIG.perspective}px) rotateY(-90deg)`,
          offset: 0.52
        },
        {
          transform:
            `perspective(${CONFIG.perspective}px) rotateY(-145deg)`,
          offset: 0.8
        },
        {
          transform:
            `perspective(${CONFIG.perspective}px) rotateY(-180deg)`
        }
      ],
      {
        duration,
        easing:
          CONFIG.easing,
        fill: "forwards"
      }
    );

  await animation.finished;
}


/*
 * ============================================
 * TURN TO PREVIOUS SPREAD
 * ============================================
 */

async function turnSpreadBackward(
  currentState,
  previousState
) {
  clearStage();

  /*
   * Previous spread underneath.
   */
  const previousLeft =
    createStaticPage(
      previousState.pages[0],
      "left"
    );

  const previousRight =
    createStaticPage(
      previousState.pages[1],
      "right"
    );

  /*
   * Current right page remains visible.
   */
  const currentRight =
    createStaticPage(
      currentState.pages[1],
      "right"
    );

  const turningPage =
    createTurningPage(
      previousState.pages[1],
      currentState.pages[0]
    );

  turningPage.style.transform =
    `perspective(${CONFIG.perspective}px) rotateY(-180deg)`;

  stage.append(
    previousLeft,
    previousRight,
    currentRight,
    createSpine(),
    turningPage
  );

  stage.classList.add("is-open");

  const duration =
    getDuration(
      CONFIG.pageDuration
    );

  const animation =
    turningPage.animate(
      [
        {
          transform:
            `perspective(${CONFIG.perspective}px) rotateY(-180deg)`
        },
        {
          transform:
            `perspective(${CONFIG.perspective}px) rotateY(-145deg)`,
          offset: 0.2
        },
        {
          transform:
            `perspective(${CONFIG.perspective}px) rotateY(-90deg)`,
          offset: 0.48
        },
        {
          transform:
            `perspective(${CONFIG.perspective}px) rotateY(-35deg)`,
          offset: 0.78
        },
        {
          transform:
            `perspective(${CONFIG.perspective}px) rotateY(0deg)`
        }
      ],
      {
        duration,
        easing:
          CONFIG.easing,
        fill: "forwards"
      }
    );

  await animation.finished;
}


/*
 * ============================================
 * CLOSE TO THE BACK COVER
 * ============================================
 */

async function closeToBackCover() {
  const currentState =
    STATES[currentStateIndex];

  clearStage();

  const currentLeft =
    createStaticPage(
      currentState.pages[0],
      "left"
    );

  const turningPage =
    createTurningPage(
      currentState.pages[1],
      8
    );

  stage.append(
    currentLeft,
    createSpine(),
    turningPage
  );

  stage.classList.add("is-open");

  const duration =
    getDuration(
      CONFIG.closeDuration
    );

  const animation =
    turningPage.animate(
      [
        {
          left: "50%",
          transform:
            `perspective(${CONFIG.perspective}px) rotateY(0deg)`
        },
        {
          left: "48%",
          transform:
            `perspective(${CONFIG.perspective}px) rotateY(-70deg)`,
          offset: 0.4
        },
        {
          left: "36%",
          transform:
            `perspective(${CONFIG.perspective}px) rotateY(-140deg)`,
          offset: 0.76
        },
        {
          left: "25%",
          transform:
            `perspective(${CONFIG.perspective}px) rotateY(-180deg)`
        }
      ],
      {
        duration,
        easing:
          CONFIG.easing,
        fill: "forwards"
      }
    );

  await animation.finished;

  currentStateIndex =
    STATES.length - 1;

  renderState(
    currentStateIndex
  );
}


/*
 * ============================================
 * REOPEN FROM BACK COVER
 * ============================================
 */

async function reopenFromBackCover() {
  clearStage();

  const finalSpread =
    STATES[STATES.length - 2];

  const leftPage =
    createStaticPage(
      finalSpread.pages[0],
      "left"
    );

  const rightPage =
    createStaticPage(
      finalSpread.pages[1],
      "right"
    );

  const cover =
    createCoverTurn(
      8,
      finalSpread.pages[1]
    );

  cover.style.left =
    "25%";

  cover.style.transform =
    `perspective(${CONFIG.perspective}px) rotateY(-180deg)`;

  stage.append(
    leftPage,
    rightPage,
    createSpine(),
    cover
  );

  stage.classList.add("is-open");

  const duration =
    getDuration(
      CONFIG.closeDuration
    );

  const animation =
    cover.animate(
      [
        {
          left: "25%",
          transform:
            `perspective(${CONFIG.perspective}px) rotateY(-180deg)`
        },
        {
          left: "36%",
          transform:
            `perspective(${CONFIG.perspective}px) rotateY(-140deg)`,
          offset: 0.24
        },
        {
          left: "48%",
          transform:
            `perspective(${CONFIG.perspective}px) rotateY(-70deg)`,
          offset: 0.6
        },
        {
          left: "50%",
          transform:
            `perspective(${CONFIG.perspective}px) rotateY(0deg)`
        }
      ],
      {
        duration,
        easing:
          CONFIG.easing,
        fill: "forwards"
      }
    );

  await animation.finished;

  currentStateIndex =
    STATES.length - 2;

  renderState(
    currentStateIndex
  );
}


/*
 * ============================================
 * NAVIGATION
 * ============================================
 */

async function goNext() {
  if (isAnimating) {
    return;
  }

  if (
    currentStateIndex >=
    STATES.length - 1
  ) {
    return;
  }

  setAnimating(true);

  try {
    if (currentStateIndex === 0) {
      await openFrontCover();
      return;
    }

    if (
      currentStateIndex ===
      STATES.length - 2
    ) {
      await closeToBackCover();
      return;
    }

    const currentState =
      STATES[currentStateIndex];

    const nextState =
      STATES[currentStateIndex + 1];

    await turnSpreadForward(
      currentState,
      nextState
    );

    currentStateIndex += 1;

    renderState(
      currentStateIndex
    );
  } catch (error) {
    console.error(
      "The next-page animation failed:",
      error
    );

    renderState(
      currentStateIndex
    );
  } finally {
    setAnimating(false);
  }
}


async function goPrevious() {
  if (isAnimating) {
    return;
  }

  if (currentStateIndex <= 0) {
    return;
  }

  setAnimating(true);

  try {
    if (
      currentStateIndex ===
      STATES.length - 1
    ) {
      await reopenFromBackCover();
      return;
    }

    if (currentStateIndex === 1) {
      await closeFrontCover();
      return;
    }

    const currentState =
      STATES[currentStateIndex];

    const previousState =
      STATES[currentStateIndex - 1];

    await turnSpreadBackward(
      currentState,
      previousState
    );

    currentStateIndex -= 1;

    renderState(
      currentStateIndex
    );
  } catch (error) {
    console.error(
      "The previous-page animation failed:",
      error
    );

    renderState(
      currentStateIndex
    );
  } finally {
    setAnimating(false);
  }
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
      goNext();
    }

    if (event.key === "ArrowLeft") {
      goPrevious();
    }
  }
);


/*
 * ============================================
 * IMAGE PRELOADING
 * ============================================
 */

function preloadImages() {
  for (
    let pageNumber = 1;
    pageNumber <= CONFIG.totalPages;
    pageNumber += 1
  ) {
    const image =
      new Image();

    image.src =
      getPageFilename(pageNumber);
  }
}


/*
 * ============================================
 * INITIALISATION
 * ============================================
 */

preloadImages();
renderState(0);

console.log(
  "Flipbook initialized.",
  {
    totalPages:
      CONFIG.totalPages,

    imageFormat:
      CONFIG.imageExtension,

    pageDimensions:
      "720 × 720",

    readingStates:
      STATES.map(
        (state) => state.pages
      )
  }
);
