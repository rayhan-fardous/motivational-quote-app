const quoteTextElement = document.getElementById("quote-text");
const quoteAuthorElement = document.getElementById("quote-author");
const newQuoteButton = document.getElementById("new-quote-btn");
const loader = document.getElementById("loader");
const copyQuoteButton = document.getElementById("copy-quote-btn");
const favoriteQuoteButton = document.getElementById("favorite-quote-btn");

const viewFavoritesButton = document.getElementById("view-favorites-btn");
const closeFavoritesButton = document.getElementById("close-favorites-btn");
const favoritesSection = document.getElementById("favorites-section");
const favoritesListElement = document.getElementById("favorites-list");

const apiUrl = "https://api.realinspire.live/v1/quotes/random";

// Store the current quote and author globally or make them accessible
let currentQuoteContent = "";
let currentQuoteAuthor = "";
let favorites = []; // Array to hold favorite quotes

// Show loader and disable button
function showLoading() {
  loader.style.display = "block";
  quoteTextElement.style.display = "none";
  quoteAuthorElement.style.display = "none";
  newQuoteButton.disabled = true;
  newQuoteButton.style.opacity = "0.7";
  if (copyQuoteButton) {
    // Check if button exists
    copyQuoteButton.disabled = true;
    copyQuoteButton.style.opacity = "0.7";
  }
  if (favoriteQuoteButton) {
    favoriteQuoteButton.disabled = true;
    favoriteQuoteButton.style.opacity = "0.7";
  }
}

// Hide loader and enable button
function hideLoading() {
  loader.style.display = "none";
  quoteTextElement.style.display = "block";
  quoteAuthorElement.style.display = "block";
  newQuoteButton.disabled = false;
  newQuoteButton.style.opacity = "1";
  if (copyQuoteButton) {
    // Check if button exists
    copyQuoteButton.disabled = false;
    copyQuoteButton.style.opacity = "1";
  }
  if (favoriteQuoteButton) {
    favoriteQuoteButton.disabled = false;
    favoriteQuoteButton.style.opacity = "1";
  }
}

async function getQuote() {
  showLoading();
  // Disable copy button during loading
  copyQuoteButton.disabled = true;
  copyQuoteButton.style.opacity = "0.7";
  favoriteQuoteButton.disabled = true;
  favoriteQuoteButton.style.opacity = "0.7";

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    // The API returns an array of quotes. Let's pick a random one.
    if (data && data.length > 0) {
      const randomIndex = Math.floor(Math.random() * data.length);
      const randomQuote = data[randomIndex];

      currentQuoteContent = randomQuote.content; // Store content
      currentQuoteAuthor = randomQuote.author || "Unknown"; // Store author

      quoteTextElement.textContent = `"${currentQuoteContent}"`;
      quoteAuthorElement.textContent = `- ${currentQuoteAuthor}`;
    } else {
      currentQuoteContent = "Could not fetch a quote. Try again!";
      currentQuoteAuthor = "";
      quoteTextElement.textContent = currentQuoteContent;
      quoteAuthorElement.textContent = currentQuoteAuthor;
    }
  } catch (error) {
    console.error("Error fetching quote:", error);
    currentQuoteContent = "Oops! Something went wrong. Please try again later.";
    currentQuoteAuthor = "";
    quoteTextElement.textContent = currentQuoteContent;
    quoteAuthorElement.textContent = currentQuoteAuthor;
  } finally {
    hideLoading();
    // Re-enable copy button after loading
    copyQuoteButton.disabled = false;
    copyQuoteButton.style.opacity = "1";

    // Update favorite button based on the new quote
    updateFavoriteButtonStatus();
  }
}

// Handle copying the quote
async function copyQuote() {
  if (!currentQuoteContent) return; // Do nothing if no quote is loaded

  const textToCopy = `"${currentQuoteContent}" - ${
    currentQuoteAuthor || "Unknown"
  }`;
  try {
    await navigator.clipboard.writeText(textToCopy);
    // Provide feedback to the user
    const originalButtonText = copyQuoteButton.textContent;
    copyQuoteButton.textContent = "Copied!";
    setTimeout(() => {
      copyQuoteButton.textContent = originalButtonText;
    }, 1500); // Revert text after 1.5 seconds
  } catch (err) {
    console.error("Failed to copy quote: ", err);
    // Optionally, inform the user that copying failed
  }
}

// Load favorites from localStorage
function loadFavorites() {
  const storedFavorites = localStorage.getItem("favoriteQuotes");
  if (storedFavorites) {
    favorites = JSON.parse(storedFavorites);
  }
}

// Save favorites to localStorage
function saveFavorites() {
  localStorage.setItem("favoriteQuotes", JSON.stringify(favorites));
}

// Update the favorite button's appearance
function updateFavoriteButtonStatus() {
  if (!currentQuoteContent) {
    favoriteQuoteButton.disabled = true;
    favoriteQuoteButton.style.opacity = "0.7";
    return;
  }
  favoriteQuoteButton.disabled = false;
  favoriteQuoteButton.style.opacity = "1";

  const isFavorited = favorites.some(
    (fav) =>
      fav.content === currentQuoteContent && fav.author === currentQuoteAuthor
  );
  if (isFavorited) {
    favoriteQuoteButton.textContent = "❤️ Unfavorite";
    favoriteQuoteButton.classList.add("favorited");
  } else {
    favoriteQuoteButton.textContent = "♡ Favorite";
    favoriteQuoteButton.classList.remove("favorited");
  }
}

// Toggle favorite status
function toggleFavorite() {
  if (!currentQuoteContent) return;

  const quote = { content: currentQuoteContent, author: currentQuoteAuthor };
  const existingIndex = favorites.findIndex(
    (fav) => fav.content === quote.content && fav.author === quote.author
  );

  if (existingIndex > -1) {
    // Already a favorite, so remove it
    favorites.splice(existingIndex, 1);
  } else {
    // Not a favorite, so add it
    favorites.push(quote);
  }
  saveFavorites();
  updateFavoriteButtonStatus();

  // If favorites section is visible, refresh it
  if (!favoritesSection.classList.contains("hidden")) {
    displayFavoriteQuotes();
  }
}

// Function to display favorite quotes in the dedicated section
function displayFavoriteQuotes() {
  favoritesListElement.innerHTML = ""; // Clear existing list

  if (favorites.length === 0) {
    favoritesListElement.innerHTML =
      "<li>No favorite quotes yet. Start adding some!</li>";
    return;
  }

  favorites.forEach((quote, index) => {
    const listItem = document.createElement("li");
    listItem.innerHTML = `
      <p class="fav-quote-text">"${quote.content}"</p>
      <p class="fav-quote-author">- ${quote.author || "Unknown"}</p>
      <button class="remove-fav-btn" data-index="${index}">Remove from Favorites</button>
    `;
    favoritesListElement.appendChild(listItem);
  });

  // Add event listeners to the new "Remove from Favorites" buttons
  document
    .querySelectorAll("#favorites-list .remove-fav-btn")
    .forEach((button) => {
      button.addEventListener("click", function () {
        const quoteIndexToRemove = parseInt(this.dataset.index, 10);
        removeQuoteFromFavoritesList(quoteIndexToRemove);
      });
    });
}

// Function to remove a quote directly from the favorites list
function removeQuoteFromFavoritesList(index) {
  if (index >= 0 && index < favorites.length) {
    const removedQuote = favorites[index];
    favorites.splice(index, 1);
    saveFavorites(); // Save the updated favorites array to localStorage
    displayFavoriteQuotes(); // Refresh the displayed list of favorites

    // Also, update the main favorite button if the currently displayed quote was the one removed
    if (
      currentQuoteContent === removedQuote.content &&
      currentQuoteAuthor === removedQuote.author
    ) {
      updateFavoriteButtonStatus();
    }
  }
}

// Function to toggle the visibility of the favorites section
function toggleFavoritesSection() {
  favoritesSection.classList.toggle("hidden");
  if (!favoritesSection.classList.contains("hidden")) {
    displayFavoriteQuotes(); // Refresh the list when showing
    viewFavoritesButton.textContent = "Hide Favorites";
  } else {
    viewFavoritesButton.textContent = "View Favorites";
  }
}

// Event listener for the button
newQuoteButton.addEventListener("click", getQuote);

// Event listener for the copy button
copyQuoteButton.addEventListener("click", copyQuote);

// Event listener for the favorite button
favoriteQuoteButton.addEventListener("click", toggleFavorite);

// Event listeners for the View Favorite buttons
viewFavoritesButton.addEventListener("click", toggleFavoritesSection);
closeFavoritesButton.addEventListener("click", () => {
  favoritesSection.classList.add("hidden");
  viewFavoritesButton.textContent = "View Favorites";
});

// Initial setup
loadFavorites(); // Load favorites when the script starts
getQuote(); // Load the first quote
