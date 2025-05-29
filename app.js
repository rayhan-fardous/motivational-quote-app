const quoteTextElement = document.getElementById("quote-text");
const quoteAuthorElement = document.getElementById("quote-author");
const newQuoteButton = document.getElementById("new-quote-btn");
const loader = document.getElementById("loader");

const apiUrl = "https://api.realinspire.live/v1/quotes/random";

// Function to show loader and disable button
function showLoading() {
  loader.style.display = "block";
  quoteTextElement.style.display = "none";
  quoteAuthorElement.style.display = "none";
  newQuoteButton.disabled = true;
  newQuoteButton.style.opacity = "0.7";
}

// Function to hide loader and enable button
function hideLoading() {
  loader.style.display = "none";
  quoteTextElement.style.display = "block";
  quoteAuthorElement.style.display = "block";
  newQuoteButton.disabled = false;
  newQuoteButton.style.opacity = "1";
}

async function getQuote() {
  showLoading();
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

      quoteTextElement.textContent = `"${randomQuote.content}"`;
      quoteAuthorElement.textContent = `- ${randomQuote.author || "Unknown"}`;
    } else {
      quoteTextElement.textContent = "Could not fetch a quote. Try again!";
      quoteAuthorElement.textContent = "";
    }
  } catch (error) {
    console.error("Error fetching quote:", error);
    quoteTextElement.textContent =
      "Oops! Something went wrong. Please try again later.";
    quoteAuthorElement.textContent = "";
  } finally {
    hideLoading();
  }
}

// Event listener for the button
newQuoteButton.addEventListener("click", getQuote);

// Load a quote when the page first loads
getQuote();
