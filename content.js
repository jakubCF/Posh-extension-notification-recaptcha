// Function to handle the Try Again button click
function clickTryAgainButton() {
  // Use the specific attributes to select the button
  const tryAgainButton = document.querySelector('button[data-et-name="try_again"][data-et-on-screen_type="popup"]');

  if (tryAgainButton) {
    // If found, try to click it automatically
    tryAgainButton.click();
    console.log('Try Again button clicked automatically.');
    // Send a confirmation message to the background script (optional)
    try {
        chrome.runtime.sendMessage({
          action: "buttonClicked",
          tabTitle: document.title
        });
    } catch (e) {
        // Catch the "Extension context invalidated" error and proceed silently
        console.error("Error sending 'buttonClicked' message (Service Worker may be terminated):", e.message);
    }
    return true; // Button was found and clicked
  }
  return false; // Button was not found
}

// Function to check for reCAPTCHA iframe and notify
function checkRecaptcha() {
  // 1. First, check for and click the "Try Again" button
  const buttonWasClicked = clickTryAgainButton();

  // 2. If the button was NOT found/clicked, check for the reCAPTCHA iframe
  if (!buttonWasClicked) {
    const recaptchaIframe = document.querySelector('iframe[title^="reCAPTCHA"]');

    if (recaptchaIframe) {
      console.log('reCAPTCHA iframe detected on the page.');
      // If found, notify the user (since the automated "Try Again" failed)
      try {
          chrome.runtime.sendMessage({
            action: "recaptchaFound",
            tabUrl: window.location.href,
            tabTitle: document.title,
            isRecaptcha: true // Signal for reCAPTCHA notification
          });
      } catch (e) {
          // Catch the "Extension context invalidated" error and proceed silently
          console.error("Error sending 'recaptchaFound' message (Service Worker may be terminated):", e.message);
      }
    }
  }
}

// Set up continuous monitoring using MutationObserver and interval
// (Keeping both for reliability against dynamic page changes)

// Initial check when the page loads
checkRecaptcha();

// Set up a MutationObserver to watch for dynamic changes (like the button/iframe appearing later)
const observer = new MutationObserver((mutationsList, observer) => {
    checkRecaptcha();
});

// Configure the observer to watch the entire body for new elements
observer.observe(document.body, { childList: true, subtree: true });

// Fallback: Check every 3 seconds
setInterval(checkRecaptcha, 3000);