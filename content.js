const PROCESSED_POSTS = new WeakSet();
const HASH_CACHE = new Map();

// Helper to hash string
async function hashText(text) {
  const msgUint8 = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Function to find the post text
function getPostText(postEl) {
  const textContainer = postEl.querySelector(".update-components-text");
  if (textContainer) {
    return textContainer.innerText.trim();
  }
  return "";
}

// Is it an ad/job/poll?
function isInvalidPost(postEl, text) {
  if (text.length < 150) return true;

  const innerHtml = postEl.innerHTML.toLowerCase();

  // Exclude ads, jobs, polls
  if (innerHtml.includes("promoted")) return true;
  if (innerHtml.includes("update-components-poll")) return true;
  if (innerHtml.includes("update-components-job")) return true;

  // Or check for specific span text
  const subdesc = postEl.querySelector(
    ".update-components-actor__sub-description",
  );
  if (subdesc && subdesc.innerText.toLowerCase().includes("promoted"))
    return true;

  return false;
}

// Render Summary Box
function renderSummary(postEl, summaryText, button) {
  let existingBox = postEl.querySelector(".meme-summary-box");
  if (existingBox) {
    const textNode = existingBox.querySelector(".meme-summary-text");
    if (textNode) {
      textNode.textContent = summaryText;
      return;
    }
  }

  let target = postEl.querySelector(
    ".feed-shared-update-v2__description-wrapper",
  );
  if (!target) {
    target = postEl.querySelector(".update-components-text");
  }

  const box = document.createElement("div");
  box.className = "meme-summary-box";

  const label = document.createElement("div");
  label.className = "meme-summary-label";
  label.style.fontWeight = "600";
  label.style.color = "inherit";
  label.textContent = "AI-generated summary";

  const text = document.createElement("p");
  text.className = "meme-summary-text";
  text.textContent = summaryText;

  box.appendChild(label);
  box.appendChild(text);

  if (target && target.parentNode) {
    // Insert the summary box right before the description wrapper or text container
    target.parentNode.insertBefore(box, target);
  } else {
    // Absolute fallback: insert right after the header if found
    const actorHeader = postEl.querySelector(".feed-shared-actor");
    if (actorHeader && actorHeader.nextSibling) {
      actorHeader.parentNode.insertBefore(box, actorHeader.nextSibling);
    } else {
      postEl.insertBefore(box, postEl.firstChild);
    }
  }
}

// Handle the click
async function onSummarizeClick(event, postEl, text, button) {
  event.preventDefault();
  event.stopPropagation();

  const isRetry = button.textContent === "Summarize again";

  if (button.disabled) return;
  button.disabled = true;
  button.textContent = "Summarizing...";

  const hash = await hashText(text);

  // Helper to expand the post if truncated
  const expandPost = () => {
    // LinkedIn has multiple class names for "see more", checking common ones
    const seeMoreButton = postEl.querySelector(
      '.see-more-text__button, .update-components-text__see-more, button[aria-label="see more"], button.js-update-components-text-see-more',
    );
    if (seeMoreButton) {
      seeMoreButton.click();
    }
  };

  if (!isRetry && HASH_CACHE.has(hash)) {
    const cached = HASH_CACHE.get(hash);
    if (cached === "NO_SUMMARY") {
      button.textContent = "No Summary Needed";
      return;
    }
    renderSummary(postEl, cached, button);
    expandPost();
    button.textContent = "Summarize again";
    button.disabled = false;
    return;
  }

  try {
    const response = await chrome.runtime.sendMessage({
      action: "summarize",
      text: text,
      source: "linkedin",
    });

    if (response && response.summary) {
      if (response.summary.includes("No summary needed.")) {
        button.textContent = "No Summary Needed";
        // Optionally cache this state so we don't try again
        HASH_CACHE.set(hash, "NO_SUMMARY");
      } else {
        HASH_CACHE.set(hash, response.summary);
        renderSummary(postEl, response.summary, button);
        expandPost();
        button.textContent = "Summarize again";
        button.disabled = false;
      }
    } else {
      // Silent failure
      button.textContent = isRetry ? "Summarize again" : "Summarize";
      button.disabled = false;
    }
  } catch (err) {
    // Silent failure
    button.textContent = isRetry ? "Summarize again" : "Summarize";
    button.disabled = false;
  }
}

// Process single post
function processPost(postEl) {
  if (PROCESSED_POSTS.has(postEl)) return;
  PROCESSED_POSTS.add(postEl);

  const text = getPostText(postEl);
  if (isInvalidPost(postEl, text)) return;

  const controlMenu = postEl.querySelector(".feed-shared-control-menu");
  if (!controlMenu) return;

  // Ensure button container exists for alignment
  controlMenu.style.display = "flex";
  controlMenu.style.alignItems = "center";

  const button = document.createElement("button");
  button.className = "meme-summary-btn";
  button.textContent = "Summarize";

  button.addEventListener("click", (e) =>
    onSummarizeClick(e, postEl, text, button),
  );

  // Insert before the 3-dots menu
  controlMenu.parentNode.insertBefore(button, controlMenu);
}

// --- Facebook Logic ---
function renderFbSummary(container, summaryText) {
  let existingBox = container.querySelector(".meme-summary-box");
  if (existingBox) {
    const textNode = existingBox.querySelector(".meme-summary-text");
    if (textNode) {
      textNode.textContent = summaryText;
      return;
    }
  }

  const box = document.createElement("div");
  box.className = "meme-summary-box";
  box.style.margin = "16px";

  const label = document.createElement("div");
  label.className = "meme-summary-label";
  label.style.fontWeight = "600";
  label.style.color = "inherit";
  label.textContent = "AI-generated profile summary";

  const text = document.createElement("p");
  text.className = "meme-summary-text";
  text.textContent = summaryText;

  box.appendChild(label);
  box.appendChild(text);

  // Insert at top of container
  container.insertBefore(box, container.firstChild);
}

function processFacebook() {
  const path = window.location.pathname;
  const isHome =
    path === "/" ||
    path === "/home.php" ||
    path.startsWith("/watch") ||
    path.startsWith("/groups") ||
    path.startsWith("/marketplace");

  const existingBtn = document.querySelector(".fb-meme-summary-btn");
  if (isHome) {
    if (existingBtn) existingBtn.remove();
    return;
  }

  const mainRole = document.querySelector('[role="main"]');
  if (!mainRole) return;

  if (existingBtn) {
    if (mainRole.contains(existingBtn)) return;
    existingBtn.remove();
  }

  const buttonContainer = document.createElement("div");
  buttonContainer.className = "fb-meme-summary-btn";
  buttonContainer.style.padding = "16px";
  buttonContainer.style.display = "flex";
  buttonContainer.style.justifyContent = "center";
  buttonContainer.style.width = "100%";

  const button = document.createElement("button");
  button.className = "meme-summary-btn";
  button.textContent = "Summarize Profile";

  button.addEventListener("click", async (e) => {
    e.preventDefault();
    if (button.disabled) return;

    const isRetry = button.textContent === "Summarize again";
    button.disabled = true;
    button.textContent = "Summarizing Profile...";

    // Scrape a reasonable chunk of text from the main profile container
    const profileText = mainRole.innerText.slice(0, 8000);

    try {
      const response = await chrome.runtime.sendMessage({
        action: "summarize",
        text: profileText,
        source: "facebook",
      });

      if (response && response.summary) {
        renderFbSummary(mainRole, response.summary);
        button.textContent = "Summarize again";
        button.disabled = false;
      } else {
        button.textContent = isRetry ? "Summarize again" : "Summarize Profile";
        button.disabled = false;
      }
    } catch (err) {
      button.textContent = isRetry ? "Summarize again" : "Summarize Profile";
      button.disabled = false;
    }
  });

  buttonContainer.appendChild(button);
  mainRole.insertBefore(buttonContainer, mainRole.firstChild);
}

// Observer for dynamic loading
const observer = new MutationObserver((mutations) => {
  if (window.location.hostname.includes("facebook.com")) {
    processFacebook();
  } else {
    const posts = document.querySelectorAll(".feed-shared-update-v2");
    posts.forEach(processPost);
  }
});

observer.observe(document.body, { childList: true, subtree: true });

// Initial pass
setTimeout(() => {
  if (window.location.hostname.includes("facebook.com")) {
    processFacebook();
  } else {
    const posts = document.querySelectorAll(".feed-shared-update-v2");
    posts.forEach(processPost);
  }
}, 2000);
