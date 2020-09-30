/* ++++++++++ VARIABLES ++++++++++ */
const body = document.querySelector("body");
const drinksElement = document.getElementById("drinks");
const favoriteContainer = document.getElementById("fav-drinks");

const searchTerm = document.getElementById("search-term");
const btnSearch = document.getElementById("btn-search");
const btnRandomize = document.getElementById("btn-randomize");
const btnClearSearch = document.querySelector(".btn-clear-search");

const drinkPopup = document.getElementById("drink-popup");
const popup = document.querySelector(".popup");
const btnClosePopup = document.getElementById("btn-close-popup");
const drinkInfoElement = document.getElementById("drink-info");

/* ++++++++++ ONLOAD ++++++++++ */
// Hide URL bar...
if (!window.location.hash && window.addEventListener) {
  window.addEventListener("load", function () {
    setTimeout(function () {
      window.scrollTo(0, 0);
    }, 0);
  });
  window.addEventListener("orientationchange", function () {
    setTimeout(function () {
      window.scrollTo(0, 0);
    }, 0);
  });
  window.addEventListener("touchstart", function () {
    setTimeout(function () {
      window.scrollTo(0, 0);
    }, 0);
  });
}

// Get random drink...
getRandomDrink();

// Display favorite drink(s)...
favoriteDrinksDisplay();

/* ++++++++++ FUNCTIONS ++++++++++ */
// Fetch random drink from API
async function getRandomDrink() {
  const response = await fetch(
    `https://www.thecocktaildb.com/api/json/v1/1/random.php`
  );
  const drinkData = await response.json();
  const randomDrink = drinkData.drinks[0];

  addDrink(randomDrink, true);
}

// Fetch drink from API by id
async function getDrinkById(id) {
  const response = await fetch(
    `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${id}`
  );

  const drinkData = await response.json();
  const drink = drinkData.drinks[0];

  return drink;
}

// Fetch drinks from API based on a specific search term
async function getDrinksBySearch(term) {
  try {
    const response = await fetch(
      `https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${term}`
    );

    const drinkData = await response.json();

    const drinks = drinkData.drinks;

    return drinks;
  } catch {
    showErrorMessage();
  }
}

// Inject drink info into user interface
function addDrink(drinkData, random = false) {
  const drink = document.createElement("div");
  drink.classList.add("drink");
  drink.innerHTML = `
	<div class="drink-header">
		${
      random
        ? `<span class="random">
		Random Cocktail
	</span>`
        : ""
    }
		<img src="${drinkData.strDrinkThumb}" alt="${drinkData.strDrink}"
			class="drink-img">
	</div>
	<div class="drink-body">
		<h4 class="drink-name">${drinkData.strDrink}</h4>
		<button class="btn-favorite"><i class="far fa-heart"></i></button>
	</div>`;

  // Add event listener to favorite button
  drink.querySelector(".btn-favorite").addEventListener("click", () => {
    const btnFavorite = drink.querySelector(".fa-heart");
    const drinksIDs = getDrinksFromLocalStorage();

    // Check if favorite button has already been clicked
    if (btnFavorite.className === "far fa-heart" && drinksIDs.length < 4) {
      addDrinkToLocalStorage(drinkData.idDrink);
      btnFavorite.className = "fas fa-heart";
    } else if (
      btnFavorite.className === "fas fa-heart" &&
      drinksIDs.length <= 4
    ) {
      removeDrinkFromLocalStorage(drinkData.idDrink);
      btnFavorite.className = "far fa-heart";
    } else {
      btnFavorite.className = "far fa-heart";
      preventDefault();
    }

    // Fetch favorite drinks
    fetchFavoriteDrinks();

    // Add instruction to my favorite drinks display
    const drinkIds = getDrinksFromLocalStorage();
    if (drinkIds.length === 0) {
      addInstruction();
    }
  });

  // Add event listener to drink image
  const drinkImg = drink.querySelector("img");

  drinkImg.addEventListener("click", () => {
    // Show instructions and ingredients
    showDrinkInfo(drinkData);
  });

  // Add event listener to drink name
  const drinkName = drink.querySelector(".drink-name");
  drinkName.addEventListener("click", () => {
    // Show instructions and ingredients
    showDrinkInfo(drinkData);
  });

  drinksElement.appendChild(drink);
}

// Add a favorited drink to local storage
function addDrinkToLocalStorage(drinkId) {
  const drinkIds = getDrinksFromLocalStorage();

  localStorage.setItem("drinkIds", JSON.stringify([...drinkIds, drinkId]));
}

// Remove a favorited drink from storage
function removeDrinkFromLocalStorage(drinkId) {
  const drinkIds = getDrinksFromLocalStorage();

  localStorage.setItem(
    "drinkIds",
    JSON.stringify(
      drinkIds.filter((id) => {
        return id !== drinkId;
      })
    )
  );
}

// Get favorite drinks from local storage
function getDrinksFromLocalStorage() {
  const drinkIds = JSON.parse(localStorage.getItem("drinkIds"));

  return drinkIds === null ? [] : drinkIds;
}

// Fetch favorite drinks
async function fetchFavoriteDrinks() {
  // Clean up favorite drinks list
  favoriteContainer.innerHTML = "";

  const drinkIds = getDrinksFromLocalStorage();

  for (let i = 0; i < drinkIds.length; i++) {
    const drinkId = drinkIds[i];

    drink = await getDrinkById(drinkId);

    addDrinkToFavorites(drink);
  }
}

// Display a drink under 'my favorite drinks'
function addDrinkToFavorites(drinkData) {
  const favoriteDrink = document.createElement("li");

  favoriteDrink.innerHTML = `
	<img src="${drinkData.strDrinkThumb}" alt="${drinkData.strDrink}"><span>${drinkData.strDrink}</span>
	<button class="btn-clear"><i class="fas fa-times-circle"></i></button>`;

  const btnClear = favoriteDrink.querySelector(".btn-clear");

  // Add event listener to favorite button
  btnClear.addEventListener("click", (e) => {
    removeDrinkFromLocalStorage(drinkData.idDrink);

    // Check if currently displayed random drink is favorited
    const drink = document.querySelector(".drink");
    const drinkName = drink.querySelector("h4").textContent;
    const btnFavorite = drink.querySelector(".fa-heart");
    const favoritedDrink = e.target.parentElement.parentElement;
    const favoritedDrinkName = favoritedDrink.querySelector("span").textContent;

    if (
      btnFavorite.className === "fas fa-heart" &&
      drinkName === favoritedDrinkName
    ) {
      btnFavorite.className = "far fa-heart";
    } else if (getDrinksFromLocalStorage() === []) {
      btnFavorite.className = "far fa-heart";
    }

    // Fetch favorite drinks
    fetchFavoriteDrinks();

    // Add instruction to my favorite drinks display
    const drinkIds = getDrinksFromLocalStorage();
    if (drinkIds.length === 0) {
      addInstruction();
    }
  });

  // Add event listener to the favorite drink image
  const favoriteDrinkImg = favoriteDrink.querySelector("img");

  favoriteDrinkImg.addEventListener("click", () => {
    // Show instructions and ingredients
    showDrinkInfo(drinkData);
  });

  favoriteContainer.appendChild(favoriteDrink);
}

// Display either favorite drinks or instruction if there are no favorited drinks
function favoriteDrinksDisplay() {
  const drinkIds = getDrinksFromLocalStorage();

  if (drinkIds.length === 0) {
    addInstruction();
  } else {
    fetchFavoriteDrinks();
  }
}

// Display instruction under 'my favorite drinks'
function addInstruction() {
  const instruction = document.createElement("li");

  instruction.innerHTML = `<span>tap <i class="far fa-heart"></i></span>`;
  instruction.classList.add("instruction");

  favoriteContainer.appendChild(instruction);
  // Add style to instruction
}

// Show mix instructions and ingredients
function showDrinkInfo(drinkData) {
  // toggle scroll on body
  toggleScrollOnBody();
  // Clean up html
  drinkInfoElement.innerHTML = "";
  // Update drink info
  const drinkEl = document.createElement("div");

  // Get ingredients and measurements
  const ingredients = [];

  for (let i = 1; i <= 20; i++) {
    if (drinkData["strIngredient" + i]) {
      ingredients.push(
        `${drinkData["strIngredient" + i]} - ${drinkData["strMeasure" + i]}`
      );
    } else {
      break;
    }
  }

  // Get mixing instructions
  const instructions = drinkData.strInstructions
    .split("\n")
    .filter((i) => i.trim() !== "");

  // Inject ingredients and mixing instructions into user interface
  drinkEl.innerHTML = `
	<h1>${drinkData.strDrink}</h1>
	<img src="${drinkData.strDrinkThumb}" alt="${
    drinkData.strDrink
  }" class="mix-img">
	<h3>Ingredients</h3>
	<ul class="mix-ingredients">
	${ingredients.map((ingredient) => `<li>${ingredient}</li>`).join("")}
	</ul>
	<h3>Instructions</h3>    
	<ul class="mix-instructions">
	${instructions.map((instruct) => `<li>${instruct}</li>`).join("")}
	</ul>`;

  // Add mix info to popup display
  drinkInfoElement.appendChild(drinkEl);

  // Show the popup
  drinkPopup.classList.remove("hidden");
}

// Toggle scrolling on body
function toggleScrollOnBody() {
  body.classList.toggle("scroll");
  body.classList.toggle("noscroll");
}

// Get drinks using search input
async function searchForDrinks() {
  // Clean up search results
  drinksElement.innerHTML = "";

  const search = searchTerm.value;

  const drinks = await getDrinksBySearch(search);

  if (drinks) {
    // Clean up HTML
    drinksElement.innerHTML = "";
    // Inject drinks to user interface
    drinks.forEach((drink) => {
      // get full cocktail details, then inject drink into user interface
      getDrinkById(drink.idDrink).then(addDrink);
      drinksElement.classList.remove("no-results-for-search");
    });
  } /*else {
    // displace search results message
    drinksElement.innerHTML = `
	<img class="no-results-for-search-img" src="./img/sad_face.png">
	<p>No search results for "${search}", try searching for a different drink or ingredient.</p>
	`;
    drinksElement.classList.add("no-results-for-search");

    // center search results message
    drinksElement.style.justifyContent = "center";
  }*/
}

// Show error message
function showErrorMessage() {
  // displace search results message
  drinksElement.innerHTML = `
    <img class="no-results-for-search-img" src="./img/sad_face.png">
    <p>No search results for <span class="search-word">"${searchTerm.value}"</span>, try searching for a different drink or ingredient.</p>
    `;
  drinksElement.classList.add("no-results-for-search");

  // center search results message
  drinksElement.style.justifyContent = "center";
}

// Show clear search button
function showClearSearchBtn() {
  btnClearSearch.classList.add("show-btn-clear-search");
}

// Hide clear search button
function hideClearSearchBtn() {
  if (btnClearSearch.classList.contains("show-btn-clear-search")) {
    btnClearSearch.classList.remove("show-btn-clear-search");
  }
}

/* ++++++++++ EVENT LISTENERS ++++++++++ */
// Add event listener to the search button
btnSearch.addEventListener("click", () => {
  // Hide clear search button
  hideClearSearchBtn();
  // Search for drinks
  searchForDrinks();
});

// Add event listener to search input to show search clear button whenever there's text in the search field
searchTerm.addEventListener("focusin", () => {
  if (searchTerm.value.length > 0) {
    showClearSearchBtn();
  }
});

// Add event lister to search input for submitting with enter and showing clear search term button
searchTerm.addEventListener("keyup", (event) => {
  if (event.keyCode === 13) {
    // hide keyboard
    searchTerm.blur();
    // hide clear search button
    hideClearSearchBtn();
    // Search for drinks
    searchForDrinks();
  } else {
    // Show clear search button
    showClearSearchBtn();
  }

  if (searchTerm.value.length === 0) {
    // Hide clear search button
    hideClearSearchBtn();
  }
});

// Add event listener to the clear search button
btnClearSearch.addEventListener("click", () => {
  // Clear search field
  searchTerm.value = "";
  // Hide clear search button
  hideClearSearchBtn();
});

// Add event listener to the popup close button
btnClosePopup.addEventListener("click", () => {
  // toggle scroll on body
  toggleScrollOnBody();
  // hide instructions and ingredients
  drinkPopup.classList.add("hidden");
  // Clean up HTML
  drinkInfoElement.innerHTML = "";
  // Reset scroll position
  drinkInfoElement.scrollTop = 0;
});

// Add event listener to the randomize button
btnRandomize.addEventListener("click", () => {
  // Clean up html
  drinksElement.classList.remove("no-results-for-search");
  drinksElement.innerHTML = "";
  drinkInfoElement.innerHTML = "";

  // Get random drink
  getRandomDrink();
  // Hide clear search button
  hideClearSearchBtn();
});
