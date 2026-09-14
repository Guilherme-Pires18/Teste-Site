const players = [
  {
    key: "pedro",
    firstName: "Pedro",
    lastName: "Rocha",
    shortName: "Pedro Rocha",
    number: "32",
    position: "ATACANTE",
    category: "ataque",
    image: "assets/images/player-pedro.png",
    tagline: "Movimento, pressão e chegada no último terço."
  },
  {
    key: "breno",
    firstName: "Breno",
    lastName: "Lopes",
    shortName: "Breno Lopes",
    number: "7",
    position: "ATACANTE",
    category: "ataque",
    image: "assets/images/player-breno.png",
    tagline: "Velocidade para atacar espaço e acelerar o jogo."
  },
  {
    key: "lucas",
    firstName: "Lucas",
    lastName: "Ronier",
    shortName: "Lucas Ronier",
    number: "11",
    position: "ATACANTE",
    category: "ataque",
    image: "assets/images/player-lucas.png",
    tagline: "Criatividade e intensidade pelos corredores."
  },
  {
    key: "josue",
    firstName: "Josué",
    lastName: "",
    shortName: "Josué",
    number: "10",
    position: "MEIO-CAMPO",
    category: "meio",
    image: "assets/images/player-josue.png",
    tagline: "Visão de jogo, passe e conexão entre setores."
  },
  {
    key: "ararat",
    firstName: "Alejandro",
    lastName: "Ararat",
    shortName: "Ararat",
    number: "15",
    position: "ATACANTE",
    category: "ataque",
    image: "assets/images/player-ararat.png",
    tagline: "Mobilidade, intensidade e presença no ataque."
  }
];

let currentPlayer = 0;
let activeFilter = "all";
let carouselLocked = false;
let carouselUnlockTimer;

const featuredImage = document.querySelector("#featuredPlayerImage");
const playerVisual = document.querySelector(".player-visual");
const playerCopy = document.querySelector(".player-copy");
const playerNumber = document.querySelector("#playerNumber");
const playerPosition = document.querySelector("#playerPosition");
const playerFirstName = document.querySelector("#playerFirstName");
const playerLastName = document.querySelector("#playerLastName");
const playerTagline = document.querySelector("#playerTagline");
const dotsContainer = document.querySelector(".slider-dots");
const leftPlayers = document.querySelector(".side-left");
const rightPlayers = document.querySelector(".side-right");
const filterButtons = [...document.querySelectorAll(".position-tabs button")];
const playerStage = document.querySelector("[data-player-stage]");

function getAvailableIndexes() {
  return players
    .map((player, index) => ({ player, index }))
    .filter(({ player }) => activeFilter === "all" || player.category === activeFilter)
    .map(({ index }) => index);
}

function getCarouselDirection(targetIndex) {
  const available = getAvailableIndexes();
  const currentPointer = available.indexOf(currentPlayer);
  const targetPointer = available.indexOf(targetIndex);

  if (currentPointer < 0 || targetPointer < 0 || currentPointer === targetPointer) return 1;

  const forwardDistance = (targetPointer - currentPointer + available.length) % available.length;
  const backwardDistance = (currentPointer - targetPointer + available.length) % available.length;

  return forwardDistance <= backwardDistance ? 1 : -1;
}

function getRelativePlayers() {
  const available = getAvailableIndexes();
  const currentPointer = Math.max(0, available.indexOf(currentPlayer));

  const relative = (offset) => {
    const pointer = (currentPointer + offset + available.length) % available.length;
    return available[pointer];
  };

  return {
    left: [relative(-2), relative(-1)],
    right: [relative(1), relative(2)]
  };
}

function createMiniPlayer(playerIndex, distance) {
  const player = players[playerIndex];
  const button = document.createElement("button");
  button.type = "button";
  button.className = `player-mini ${distance === 2 ? "is-far" : "is-near"}`;
  button.setAttribute("aria-label", `Selecionar ${player.shortName}`);
  button.innerHTML = `
    <img src="${player.image}" alt="" />
    <span>${player.shortName}</span>
  `;
  button.addEventListener("click", () => {
    selectPlayer(playerIndex, getCarouselDirection(playerIndex));
  });
  return button;
}

function renderSidePlayers() {
  const available = getAvailableIndexes();
  leftPlayers.innerHTML = "";
  rightPlayers.innerHTML = "";

  if (available.length <= 1) return;

  const relative = getRelativePlayers();
  const uniqueLeft = [...new Set(relative.left)].filter((index) => index !== currentPlayer);
  const uniqueRight = [...new Set(relative.right)].filter(
    (index) => index !== currentPlayer && !uniqueLeft.includes(index)
  );

  uniqueLeft.forEach((index, position) => {
    leftPlayers.appendChild(createMiniPlayer(index, uniqueLeft.length - position));
  });

  uniqueRight.forEach((index, position) => {
    rightPlayers.appendChild(createMiniPlayer(index, position + 1));
  });
}

function buildDots() {
  dotsContainer.innerHTML = "";

  getAvailableIndexes().forEach((playerIndex) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = playerIndex === currentPlayer ? "active" : "";
    dot.setAttribute("aria-label", `Selecionar ${players[playerIndex].shortName}`);
    dot.addEventListener("click", () => {
      selectPlayer(playerIndex, getCarouselDirection(playerIndex));
    });
    dotsContainer.appendChild(dot);
  });
}

function updatePlayerContent(player) {
  featuredImage.src = player.image;
  featuredImage.dataset.player = player.key;
  featuredImage.alt = `${player.shortName}, jogador do Coritiba`;
  playerNumber.textContent = player.number;
  playerPosition.textContent = player.position;
  playerFirstName.textContent = player.firstName;
  playerLastName.textContent = player.lastName;
  playerTagline.textContent = player.tagline;
}

function applyPlayer(player) {
  updatePlayerContent(player);
  renderSidePlayers();
  buildDots();
}

function clearCarouselClasses() {
  featuredImage.classList.remove("carousel-enter-left", "carousel-enter-right");
  playerCopy.classList.remove("carousel-copy-next", "carousel-copy-prev");
  playerNumber.classList.remove("carousel-number-next", "carousel-number-prev");
  leftPlayers.classList.remove("carousel-side-next", "carousel-side-prev");
  rightPlayers.classList.remove("carousel-side-next", "carousel-side-prev");
}

function selectPlayer(index, direction = getCarouselDirection(index)) {
  if (index === currentPlayer || carouselLocked) return;

  carouselLocked = true;
  clearTimeout(carouselUnlockTimer);
  clearCarouselClasses();

  const outgoingImage = featuredImage.cloneNode(true);
  outgoingImage.removeAttribute("id");
  outgoingImage.classList.remove("carousel-enter-left", "carousel-enter-right");
  outgoingImage.classList.add(
    "player-transition-clone",
    direction > 0 ? "carousel-exit-left" : "carousel-exit-right"
  );
  playerVisual.insertBefore(outgoingImage, featuredImage);

  currentPlayer = index;
  updatePlayerContent(players[index]);
  buildDots();

  // Force layout so the new player always enters from the intended side.
  void featuredImage.offsetWidth;

  featuredImage.classList.add(direction > 0 ? "carousel-enter-right" : "carousel-enter-left");
  playerCopy.classList.add(direction > 0 ? "carousel-copy-next" : "carousel-copy-prev");
  playerNumber.classList.add(direction > 0 ? "carousel-number-next" : "carousel-number-prev");

  renderSidePlayers();
  leftPlayers.classList.add(direction > 0 ? "carousel-side-next" : "carousel-side-prev");
  rightPlayers.classList.add(direction > 0 ? "carousel-side-next" : "carousel-side-prev");

  window.setTimeout(() => {
    outgoingImage.remove();
    clearCarouselClasses();
  }, 680);

  carouselUnlockTimer = window.setTimeout(() => {
    carouselLocked = false;
  }, 590);
}

function movePlayer(direction) {
  if (carouselLocked) return;

  const available = getAvailableIndexes();
  let pointer = available.indexOf(currentPlayer);
  if (pointer < 0) pointer = 0;
  pointer = (pointer + direction + available.length) % available.length;
  selectPlayer(available[pointer], direction);
}

document.querySelector(".stage-arrow-left").addEventListener("click", () => movePlayer(-1));
document.querySelector(".stage-arrow-right").addEventListener("click", () => movePlayer(1));

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    activeFilter = button.dataset.filter;

    const available = getAvailableIndexes();
    if (!available.includes(currentPlayer)) currentPlayer = available[0];
    clearCarouselClasses();
    applyPlayer(players[currentPlayer]);
  });
});

applyPlayer(players[currentPlayer]);

// Keyboard controls in the hero.
playerStage.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    movePlayer(-1);
  }
  if (event.key === "ArrowRight") {
    event.preventDefault();
    movePlayer(1);
  }
});

// Reveal on scroll.
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.13, rootMargin: "0px 0px -5% 0px" }
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

// Product card tilt: only for precise pointers.
if (window.matchMedia("(pointer: fine)").matches) {
  document.querySelectorAll("[data-tilt]").forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(1000px) rotateX(${y * -2.4}deg) rotateY(${x * 3.2}deg) translateY(-5px)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
}

// Mobile navigation.
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  document.body.classList.toggle("menu-open", isOpen);
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
  });
});

// Sticky navigation, scroll progress and hero parallax.
const navShell = document.querySelector(".nav-shell");
const scrollBar = document.querySelector(".scroll-progress span");
const orbitA = document.querySelector(".orbit-a");
const orbitB = document.querySelector(".orbit-b");
const heroWord = document.querySelector(".hero-word");

function handleScroll() {
  const scrollY = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? scrollY / maxScroll : 0;

  navShell.classList.toggle("is-scrolled", scrollY > 24);
  scrollBar.style.width = `${progress * 100}%`;

  if (window.matchMedia("(prefers-reduced-motion: no-preference)").matches) {
    const y = Math.min(scrollY, 700);
    orbitA.style.transform = `translate(-50%, calc(-50% + ${y * 0.025}px))`;
    orbitB.style.transform = `translate(-50%, calc(-50% - ${y * 0.018}px))`;
    heroWord.style.transform = `translate(-50%, calc(-50% + ${y * 0.02}px))`;
  }
}

window.addEventListener("scroll", handleScroll, { passive: true });
handleScroll();

// Gentle pointer parallax on the featured player and campaign product.
if (window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)").matches) {
  playerStage.addEventListener("mousemove", (event) => {
    const rect = playerStage.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    playerVisual.style.setProperty("--player-parallax-x", `${x * 9}px`);
    playerVisual.style.setProperty("--player-parallax-y", `${y * 5}px`);
  });

  playerStage.addEventListener("mouseleave", () => {
    playerVisual.style.setProperty("--player-parallax-x", "0px");
    playerVisual.style.setProperty("--player-parallax-y", "0px");
  });

  const parallaxCard = document.querySelector("[data-parallax-card]");
  if (parallaxCard) {
    parallaxCard.addEventListener("mousemove", (event) => {
      const rect = parallaxCard.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      parallaxCard.style.transform = `translate3d(${x * 8}px, ${y * 8}px, 0)`;
    });

    parallaxCard.addEventListener("mouseleave", () => {
      parallaxCard.style.transform = "";
    });
  }
}
