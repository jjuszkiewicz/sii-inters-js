let cart = [];
let products = [];

async function fetchProducts() {
  const response = await axios.get("https://dummyjson.com/products");
  return await response.data;
}

function groupCart() {
  const brands = new Set();
  cart.forEach((product) => {
    brands.add(product.brand);
  });

  const brandsArray = Array.from(brands.values());
  const result = brandsArray.map((brand) => {
    const brandObject = {
      brand,
      products: [],
    };
    const filteredProducts = cart.filter((product) => {
      return product.brand === brand;
    });
    brandObject.products = filteredProducts;

    return brandObject;
  });

  return result;
}

function renderCartProduct(products) {
  return products.reduce((productsHtmlElements, product) => {
    productsHtmlElements += `<div>${product.title}, ${product.amount} szt., ${product.price}</div>
  `;
  }, "");
}

function renderCart() {
  const cartContainer = document.getElementById("cart");
  cartContainer.innerHTML = "";

  const groupedCart = groupCart();

  groupedCart.forEach((item) => {
    cartContainer.innerHTML += `<div>${item.brand}</div>`;

    cartContainer.innerHTML += renderCartProduct(item.products);
    const brandTotal = item.products.reduce((total, product) => {
      return total + product.amount * product.price;
    }, 0);
    
    cartContainer.innerHTML += `brand total ${brandTotal} zł`;
    cartContainer.innerHTML += `<hr/>`;
  });
}

function renderTotal() {
  const totalContainer = document.getElementById("total");
  totalContainer.innerHTML = "";
  const total = cart.reduce(
    (total, item) => total + item.price * item.amount,
    0
  );
  totalContainer.innerHTML = `${total} zł`;
}

function updateCart() {
  renderCart();
  renderTotal();
}

function renderProducts(productsData) {
  const productsContainer = document.getElementById("products");
  productsContainer.innerHTML = "";
  productsData.products.forEach((product) => {
    productsContainer.innerHTML += `
      <div class="product">
        <strong>${product.title}</strong>
        <span>${product.price} zł</span>
        <span>(${product.brand})</span>
        <input type="number" class="product__amount-input" value="1" id="amount-${product.id}" />
        <button onclick="addToCart(${product.id})">Add to cart</button>
      </div>
    `;
  });
}

function changeCartProductAmount(amount, productId) {
  cart = cart.map((item) => {
    if (item.id === productId) {
      const newAmount = Math.max(1, item.amount + amount);
      return {
        ...item,
        amount: newAmount,
      };
    }
    return {
      ...item,
    };
  });
  updateCart();
}

function addToCart(productId) {
  const amountInput = document.getElementById(`amount-${productId}`);
  const amount = Number(document.getElementById(`amount-${productId}`).value);

  if (amount > 1000000 || amount < 1) {
    console.info("can't add to cart");
    return;
  }

  amountInput.value = 1;

  if (cart.some((item) => item.id === productId)) {
    console.log("cart: update amount for product", productId, amount);
    changeCartProductAmount(amount, productId);
  } else {
    console.log("cart: add new product", productId, amount);
    const item = products.find((product) => product.id === productId);
    cart.push({
      ...item,
      amount,
    });
  }

  updateCart();
}

(async function () {
  const productsData = await fetchProducts();
  products = productsData.products;
  renderProducts(productsData);
})();
