const SUPABASE_URL = "https://tojdxzcxpqyeaaqoysuy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhbGciOiJIUzI1NiIsInJlZiI6InRvamR4emN4cHF5ZWFhcW95c3V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4NTI2ODAsImV4cCI6MjEwNjQyODY4MH0.oK287ZVt1qergcbYHdVxuqn7mNVaKGiP6Kx_ANoWA6A";
const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
let products = [];
// =========================
// LOAD AND DISPLAY PRODUCTS
// =========================
function renderProducts(list) {
  const container = document.getElementById("product-list");
  if (!container) return;
  container.innerHTML = "";
  if (!list || list.length === 0) {
    container.innerHTML = "<p>No products match your search.</p>";
    return;
  }
  list.forEach(prod => {
    const stock = Number(prod.stock) || 0;
    const stockLabel =
      stock === 0 ? "Out of Stock" :
      stock <= 5 ? "Low Stock" :
      "In Stock";
    container.innerHTML += `
      <div class="product">
        <h3>${prod.name}</h3>
        <p>AED ${Number(prod.price).toLocaleString()}</p>
        <p class="stock">${stockLabel}</p>
        <button
          ${stock === 0 ? "disabled" : ""}
          onclick="addToCart(${JSON.stringify(prod).replace(/"/g, "&quot;")})">
          Add to Cart
        </button>
        <br>
        <a href="product-detail.html?id=${prod.product_id}">
          View details
        </a>
      </div>
    `;
  });
}
async function loadProducts() {
  const container = document.getElementById("product-list");
  if (!container) return;
  container.innerHTML = "<p>Loading products...</p>";
  const { data, error } = await supabaseClient
    .from("product")
    .select("*, category(category_name)")
    .order("name");
  if (error) {
    console.error("Product loading error:", error);
    container.innerHTML =
      `<p>Could not load products: ${error.message}</p>`;
    return;
  }
  products = data || [];
  renderProducts(products);
}
loadProducts();
// =========================
// SEARCH PRODUCTS
// =========================
document.getElementById("search-box")?.addEventListener("input", event => {
  const term = event.target.value.toLowerCase();
  const filtered = products.filter(product =>
    product.name.toLowerCase().includes(term)
  );
  renderProducts(filtered);
});
// =========================
// FILTER BY CATEGORY
// =========================
document.querySelectorAll(".category-btn").forEach(button => {
  button.addEventListener("click", () => {
    const category = button.dataset.category;
    if (category === "All") {
      renderProducts(products);
      return;
    }
    const filtered = products.filter(product =>
      product.category?.category_name === category
    );
    renderProducts(filtered);
  });
});
// =========================
// SORT PRODUCTS
// =========================
document.getElementById("sort-select")?.addEventListener("change", event => {
  const sorted = [...products];
  if (event.target.value === "low-high") {
    sorted.sort((a, b) => Number(a.price) - Number(b.price));
  } else if (event.target.value === "high-low") {
    sorted.sort((a, b) => Number(b.price) - Number(a.price));
  }
  renderProducts(sorted);
});
// =========================
// SHOPPING CART
// =========================
function getCart() {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}
function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}
function addToCart(product) {
  const cart = getCart();
  const existing = cart.find(item =>
    item.product_id === product.product_id
  );
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      ...product,
      quantity: 1
    });
  }
  saveCart(cart);
  alert(`${product.name} added to cart!`);
}
function removeFromCart(productId) {
  const cart = getCart().filter(item =>
    item.product_id !== productId
  );
  saveCart(cart);
  renderCart();
}
function updateQuantity(productId, quantity) {
  quantity = Number(quantity);
  if (quantity <= 0) {
    removeFromCart(productId);
    return;
  }
  const cart = getCart().map(item =>
    item.product_id === productId
      ? { ...item, quantity: quantity }
      : item
  );
  saveCart(cart);
  renderCart();
}
function renderCart() {
  const container = document.getElementById("cart-items");
  const subtotalElement = document.getElementById("subtotal");
  if (!container) return;
  const cart = getCart();
  if (cart.length === 0) {
    container.innerHTML = "<p>Your cart is empty.</p>";
    if (subtotalElement) {
      subtotalElement.textContent = "0.00";
    }
    return;
  }
  let subtotal = 0;
  container.innerHTML = cart.map(item => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 1;
    subtotal += price * quantity;
    return `
      <div class="cart-item">
        <span>${item.name}</span>
        <input
          type="number"
          min="1"
          value="${quantity}"
          onchange="updateQuantity(${item.product_id}, this.value)"
        >
        <span>AED ${(price * quantity).toFixed(2)}</span>
        <button onclick="removeFromCart(${item.product_id})">
          Remove
        </button>
      </div>
    `;
  }).join("");
  if (subtotalElement) {
    subtotalElement.textContent = subtotal.toFixed(2);
  }
}
renderCart();
// =========================
// REGISTER
// =========================
document.getElementById("register-form")?.addEventListener("submit", async event => {
  event.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const { error } = await supabaseClient.auth.signUp({
    email,
    password
  });
  if (error) {
    alert(error.message);
    return;
  }
  alert("Account created. Check your email if confirmation is required.");
  window.location.href = "login.html";
});
// =========================
// LOGIN
// =========================
document.getElementById("login-form")?.addEventListener("submit", async event => {
  event.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });
  if (error) {
    alert(error.message);
    return;
  }
  window.location.href = "index.html";
});
// =========================
// NAVIGATION AUTH STATUS
// =========================
async function updateNavForAuth() {
  const navSlot = document.getElementById("auth-nav-slot");
  if (!navSlot) return;
  const { data, error } = await supabaseClient.auth.getUser();
  if (error) {
    console.error("Authentication error:", error);
  }
  const user = data?.user;
  if (user) {
    navSlot.innerHTML = `
      <span>Hi, ${user.email}</span>
      <a href="#" onclick="logout(); return false;">Log out</a>
    `;
  } else {
    navSlot.innerHTML = `
      <a href="login.html">Login</a>
      <a href="register.html">Register</a>
    `;
  }
}
async function logout() {
  const { error } = await supabaseClient.auth.signOut();
  if (error) {
    alert(error.message);
    return;
  }
  window.location.href = "index.html";
}
updateNavForAuth();
// =========================
// REQUIRE LOGIN
// =========================
async function requireLogin() {
  const { data, error } = await supabaseClient.auth.getUser();
  if (error || !data.user) {
    window.location.href = "login.html";
    return null;
  }
  return data.user;
}