const PRODUCTS = {
  apple: { name: "Apple", emoji: "🍏" },
  banana: { name: "Banana", emoji: "🍌" },
  lemon: { name: "Lemon", emoji: "🍋" },
};

function getBasket() {
  try {
    const basket = localStorage.getItem("basket");
    if (!basket) return [];
    const parsed = JSON.parse(basket);
    // Support both old format (array of strings) and new format (array of objects)
    if (Array.isArray(parsed)) {
      if (parsed.length === 0) return [];
      // Check if it's the old format (array of strings)
      if (typeof parsed[0] === "string") {
        // Convert old format to new format
        const newBasket = [];
        parsed.forEach((product) => {
          const existing = newBasket.find((item) => item.product === product);
          if (existing) {
            existing.quantity++;
          } else {
            newBasket.push({ product, quantity: 1 });
          }
        });
        return newBasket;
      }
      return parsed;
    }
    return [];
  } catch (error) {
    console.warn("Error parsing basket from localStorage:", error);
    return [];
  }
}

function addToBasket(product) {
  const basket = getBasket();
  const existingItem = basket.find((item) => item.product === product);
  if (existingItem) {
    existingItem.quantity++;
  } else {
    basket.push({ product, quantity: 1 });
  }
  localStorage.setItem("basket", JSON.stringify(basket));
}

function clearBasket() {
  localStorage.removeItem("basket");
}

function renderBasket() {
  const basket = getBasket();
  const basketList = document.getElementById("basketList");
  const cartButtonsRow = document.querySelector(".cart-buttons-row");
  if (!basketList) return;
  basketList.innerHTML = "";
  if (basket.length === 0) {
    basketList.innerHTML = "<li>No products in basket.</li>";
    if (cartButtonsRow) cartButtonsRow.style.display = "none";
    return;
  }
  basket.forEach((item) => {
    const product = PRODUCTS[item.product];
    if (product) {
      const li = document.createElement("li");
      const quantityText = item.quantity > 1 ? `${item.quantity}x` : "1x";
      li.innerHTML = `<span class='basket-emoji'>${product.emoji}</span> <span>${quantityText} ${product.name}</span>`;
      basketList.appendChild(li);
    }
  });
  if (cartButtonsRow) cartButtonsRow.style.display = "flex";
}

function renderBasketIndicator() {
  const basket = getBasket();
  let indicator = document.querySelector(".basket-indicator");
  if (!indicator) {
    const basketLink = document.querySelector(".basket-link");
    if (!basketLink) return;
    indicator = document.createElement("span");
    indicator.className = "basket-indicator";
    basketLink.appendChild(indicator);
  }
  const totalItems = basket.reduce((sum, item) => sum + item.quantity, 0);
  if (totalItems > 0) {
    indicator.textContent = totalItems;
    indicator.style.display = "flex";
  } else {
    indicator.style.display = "none";
  }
}

// Call this on page load and after basket changes
if (document.readyState !== "loading") {
  renderBasketIndicator();
} else {
  document.addEventListener("DOMContentLoaded", renderBasketIndicator);
}

// Patch basket functions to update indicator
const origAddToBasket = window.addToBasket;
window.addToBasket = function (product) {
  origAddToBasket(product);
  renderBasketIndicator();
};
const origClearBasket = window.clearBasket;
window.clearBasket = function () {
  origClearBasket();
  renderBasketIndicator();
};
