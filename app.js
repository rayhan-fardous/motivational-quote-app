const quoteTextElement = document.getElementById("quote-text");
const quoteAuthorElement = document.getElementById("quote-author");
const newQuoteButton = document.getElementById("new-quote-btn");
const loader = document.getElementById("loader");
const copyQuoteButton = document.getElementById("copy-quote-btn");

const apiUrl = "https://api.realinspire.live/v1/quotes/random";

// Store the current quote and author globally or make them accessible
let currentQuoteContent = "";
let currentQuoteAuthor = "";

// Function to show loader and disable button
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
}

// Function to hide loader and enable button
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
}

// Function to handle copying the quote
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

async function getQuote() {
  showLoading();
  // Disable copy button during loading
  copyQuoteButton.disabled = true;
  copyQuoteButton.style.opacity = "0.7";
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
  }
}

// Event listener for the copy button
copyQuoteButton.addEventListener("click", copyQuote);

// Event listener for the button
newQuoteButton.addEventListener("click", getQuote);

// Load a quote when the page first loads
getQuote();
