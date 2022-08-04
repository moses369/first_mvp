// const console.log = (obj, line = "") => console.log(obj, line);

async function sendReq(url, options) {
  try {
    const res = await fetch(url, options);
    if (res.status >= 200 && res.status < 300) {
      let data;
      if (res.status !== 204) {
        data = await res.json();
      } else {
        data = await res.text();
      }
      console.log("RES STATUS", res.status, "~ line 11");

      return data;
    } else {
      const body = await res.text();
      console.error("STATUS CODE", res.status, "\nRESPONSE:", body);
    }
  } catch (err) {
    console.error(err);
  }
}
let user_id;

/*************** APP WIDE VARS/HELPER FUNCTIONS ***************/
const inCartClass = "fa-check";
const outCartClass = "fa-plus";

const $siteContainer = $(".site.container");
const $resultContainer = $(".resultContainer");

const $favContainer = $(".favContainer");
const $favorites = $(".favorites");

const $cartContainer = $(".cartContainer");
const $cartCount = $(".cartCount");
const $cart = $(".cart");
const $cartTotal = $(".cartTotal");

const cart_items = "cart_items";
const fav_products = "fav_products";

/***************  LOGIN  ***************/
function login() {
  $siteContainer.hide();

  $(`.loginForm`)
    .unbind("submit")
    .bind("submit", async (e) => {
      e.preventDefault();
      const name = $(`.login input[name='user']`).val();
      const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      };
      user_id = (await sendReq("/api/users", options)).id;
      console.log({ user_id });
      await onLogin();
      $(`.login input[name='user']`).val("");
    });
}
login();
async function onLogin() {
  const { data } = await sendReq("/api/products?filter.term=fruits");
  await appendResults(data, "fruits");
  $(".login").hide();
  $siteContainer.show();
  cartNotif();
  $favContainer.hide();
  $cartContainer.hide();
  const options = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id }),
  };
  await sendReq("/api/lists", options);
  await checkCart("", "onload");
  await checkLists();
}
/*************** END LOGIN  ***************/

//// OPEN/CLOSE DIVS
function toggleDivs(useCase) {
  if ($cartContainer.is(":visible") || $favContainer.is(":visible")) {
    $resultContainer.hide();
  } else {
    $resultContainer.show();
  }
  switch (useCase) {
    case "fav":
      if ($resultContainer.is(":visible") || $favContainer.is(":visible")) {
        $cartContainer.hide();
      } else {
        $cartContainer.show();
      }
      break;
    case "cart":
      if ($resultContainer.is(":visible") || $cartContainer.is(":visible")) {
        $favContainer.hide();
      } else {
        $favContainer.show();
      }
      break;
  }
}
$(`.title span`)
  .unbind("click")
  .bind("click", (e) => {
    $cartContainer.hide();
    $favContainer.hide();
    $resultContainer.show();
  });
///// END OPEN?CLOSE DIV
///// PATCH CART PRICE
async function patchCartprice(newTotal, newQty, productObj) {
  const { product_id } = productObj;
  const options = {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      qty: newQty,
      usedFor: cart_items,
      user_id,
      total_price: newTotal,
    }),
  };
  const update = await sendReq(`/api/products/table/${product_id}`, options);
  console.log(update, "` line 94");
}
///// END PATCH CART PRICE

///// LIVE UPDDATE PRICE
async function livePriceUpdate(e, inCart = false) {
  if (e.target.id === "qty") {
    const product = e.target.closest(".product");
    const { product_id, price } = product.dataset;
    const $input = $(
      `.product[data-product_id = ${product_id}] input[name='qty']`
    );

    $input.unbind("input").bind("input", async (e) => {
      console.log("changed");

      const qty = e.target.value;
      const total = price * qty;
      $(`.product[data-product_id = ${product_id}] .price`)
        .text(`$${total.toFixed(2)}`)
        .attr("qty", qty);

      if (
        $(`.product[data-product_id=${product_id}] .addToCart i`).hasClass(
          inCartClass
        )
      )
        await patchCartprice(total, qty, product.dataset);

      if (inCart) {
        product.dataset.qty = qty;
        product.dataset.total_price = total;

        await patchCartprice(total, qty, product.dataset);

        let totalPrice = await getCartTotal();
        totalPrice = totalPrice ? totalPrice : 0;
        $cartTotal.text(`$${totalPrice}`).attr("data-total_price", totalPrice);
      }
      console.log({ total, qty, product });
    });
  }
}
////// END LIVE UPDDATE PRICE
//// GET TOTAL CART PRICE
async function getCartTotal() {
  const total_price = await sendReq("/api/cart/total", {
    headers: { user_id },
  });
  return total_price;
}
//// END GET TOTAL CART PRICE

////CART NOTIFACTION
function cartNotif() {
  parseInt($cartCount.text()) !== 0 ? $cartCount.show() : $cartCount.hide();
}
//// END END CART NOTIFICATION
////  CHECK CART
async function checkCart(productId, useCase, mapOfIds) {
  switch (useCase) {
    case "btn":
      let inCart = outCartClass;
      if (
        $(`.cart`).find(`.product[data-product_id='${productId}'`).length ||
        mapOfIds.has(productId)
      )
        inCart = inCartClass;
      return inCart;
    case "onload":
      const count = await sendReq("/api/cart/count", {
        headers: { user_id },
      });
      $(".cartCount").text(count);
      cartNotif();

      return count;
    case "list":
      if ($(".cartCount").is(":visible")) {
        const items = await sendReq("api/cart/item", {
          headers: { user_id },
        });
        return items;
      }
  }
}
//// END CHECK CART
////  GET ITEMS FROM A TABLE MATCHIG ID
async function getItems(usedFor) {
  const res = await sendReq("/api/products/table", {
    headers: { user_id, usedFor },
  });
  const products = new Map();
  for (let item of res) {
    const { product_id, id } = item;
    products.set(product_id, item);
  }

  return products;
}
////  END GET ITEMS FROM A TABLE MATCHIG ID
////  CHECK FAV
function checkFav(productId, mapOfIds) {
  const fav = mapOfIds.has(productId);
  const fav_id = fav ? mapOfIds.get(productId).id : 0;
  const favObj = { fav, fav_id };

  return favObj;
}
//// END CHECK FAV

//// APPEND TO CART
function appendCart(
  product_id,
  name,
  image,
  price,
  size,
  refrigerate,
  cart_item_id,
  fav,
  fav_id,
  qty,
  item
) {
  let temp = "";
  if (refrigerate !== "null") temp = parseSpace(true, refrigerate);
  let total_price = price * qty;
  const star = fav ? "solid" : "regular";

  $cart.append(`
  <div class="product inCart" 
  data-product_id=${product_id} 
  data-name=${parseSpace(false, name)} 
  data-image=${image} 
  data-price=${price}
  data-size=${parseSpace(false, size)}
  data-refrigerate=${parseSpace(false, refrigerate)}
  data-cart_item_id=${cart_item_id}
  data-fav=${fav}
  data-fav_id=${fav_id}
  data-qty = ${qty}
  data-item = ${parseSpace(false, item)}
  data-total_price=${total_price}>
    <div class="row">
      <i class="fa-${star} fa-star hover" ></i>
      <img class="image" src="${image}" alt="">
    </div>
    <div class="column">
      <h2 class="description">${parseSpace(true, name)}</h2>
      <p class='info'>  ${parseSpace(true, size)} <br><span> ${temp}</span> </p>
    </div>
    <div class="row">
      <p class="price">$${total_price.toFixed(2)} </p>  
      <form action="" class='cartQty'>
        <label for="qty">Qty</label>
        <input class="cartQty" type="number" name="qty" id="qty" min="1" value="${qty}">
      </form>
      <button class="btn rm fromCart">X</button>
    </div>
  </div>
`);
}
//// END APPEND TO CART
//// APPEND TO RESULTS
async function appendResults(data, item) {
  const favMap = await getItems(fav_products);
  const cartMap = await getItems(cart_items);
  for (let product of data) {
    const { images, description, productId, items, temperature } = product;

    if (!images[0].sizes[3]) continue;
    let pImage;
    for (let img of images) {
      const { perspective, sizes } = img;
      if (perspective === "front") pImage = sizes[3].url;
    }

    let refrigerate = "";
    if (temperature.indicator === "Refrigerated")
      refrigerate = "Keep Refrigerated";

    const inCart = await checkCart(productId, "btn", cartMap);
    const { fav_id, fav } = checkFav(productId, favMap);
    const star = fav ? "solid" : "regular";

    const qty = inCart === inCartClass ? cartMap.get(productId).qty : 1;

    $(".productResults").append(`
    <div class="product store" 
      data-product_id=${productId} 
      data-name=${parseSpace(false, description)} 
      data-image=${pImage} 
      data-price=${items[0].price.regular}
      data-size=${parseSpace(false, items[0].size)}
      data-refrigerate= ${parseSpace(false, refrigerate)}
      data-fav='${fav}'
      data-fav_id=${fav_id}
      data-item = ${parseSpace(false, item)}>
        <i class="fa-${star} fa-star hover"></i>
       <div class="imgWrapper"> <img class="image" src="${pImage}" alt=""></div>
  
          <h3 class="description">${description}</h3>
          <div class='content'>
            <div class='left'>
              <p class="price">$${(items[0].price.regular * qty).toFixed(
                2
              )} </p>
              <p class='info'> ${
                items[0].size
              } <br><span>${refrigerate}</span></p>
            </div>
            <div class='right'>
              <form action="" class="addToCart" >
                <div class='qty'>
                  <label for="qty">Qty</label>
                  <input class="addToCart" type="number" name="qty" id="qty" min="1" value="${qty}">
                </div>
                <button class="addToCart hover" type="submit"><i class="fa-solid ${inCart} addToCart"></i></button>
              </form>
            </div>
          </div>
       
      </div>
    `);
  }
}
////END  APPEND TO RESULTS

//// APPEND/CHECK ITEM TO LISTS
function appendLists(newItem, inCart) {
  $(`.itemList`).append(
    `
    <div class="item"> 
      <a href="#" data-url='/api/products?filter.term=${newItem}' data-item='${parseSpace(
      false,
      newItem
    )}' class='itemLink'>${newItem}</a>
      <button data-trash= 'true'><i class="fa-solid fa-trash" data-trash='true'></i></button>
    </div>  
  `
  );
  if (inCart)
    $(`.item a[data-item=${parseSpace(false, newItem)}]`).css({
      "text-decoration": "line-through",
    });
}
async function checkLists() {
  const options = { headers: { user_id } };
  const { items } = await sendReq("api/lists", options);
  if (items) {
    const list = items.split(",");
    const cartItems = [];
    const cartRes = await checkCart(0, "list");
    if (cartRes) {
      cartRes.forEach((obj) => {
        for (const item in obj) {
          cartItems.push(obj[item]);
        }
      });
    }
    for (const item of list) {
      let inCart = false;
      if (cartItems.indexOf(item) !== -1) inCart = true;
      if (item) appendLists(item, inCart);
    }
  }
}
////END APPEND/CHECK LISTS
//// PARSE STRING BEFORE/AFTER POST
function parseSpace(addSpaces, string) {
  if (string === "") return "null";
  const req = string.split(" ").join("_");
  const res = string.split("_").join(" ");
  return addSpaces ? res : req;
}
////END PARSE STRING BEFORE/AFTER POST
//// UPDATE LIST TABLE
async function updateLists(item, method) {
  const sendObj = {
    user_id,
    items: `${(item += ",")}`,
    method,
  };
  const options = {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sendObj),
  };
  await sendReq("/api/lists", options);
}
////END UPDATE LIST TABLE
/*************** END APP WIDE VARS/HELPER FUNCTIONS  ***************/

/*************** ADD ITEMS TO SHOPPING LIST ***************/
$(".addToList").on("submit", async (e) => {
  e.preventDefault();
  const newItem = $(`.addToList input[name='product']`).val().toLowerCase();
  appendLists(newItem);
  await updateLists(newItem, "update");
  $(`.addToList input[name='product']`).val("");
});
/*************** END ADD ITEMS TO SHOPPING LIST ***************/
/*************** SHOPPLING LIST ITEM INTERACTION ***************/
$(".shoppingList .itemList").on("click", async (e) => {
  const trash = e.target.dataset.trash;
  const url = e.target.dataset.url;

  //  RETRIEVE ITEM
  if (url) {
    const item = url.substring(url.indexOf("=") + 1);
    const { data } = await sendReq(url);

    $(".productResults").empty();
    if (data) {
      $(`.resultContainer  h2`)
        .text(`Items Matching: ${item}`)
        .css({ "text-transform": "capitalize" });
      await appendResults(data, item);
    }
    console.log({ url, data }, ` line 413`);
    $cartContainer.hide();
    $favContainer.hide();

    $resultContainer.show();
    // END RETRIEVE ITEM
    // RM ITEM FROM SHOPPING LIST
  } else if (trash) {
    const item = e.target.closest(".item").innerText.toLowerCase();

    let cartCount = parseInt($cartCount.text());

    const options = {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item, user_id }),
    };
    const deleted = await sendReq(`/api/cart/item`, options);
    const deletedIds = new Map();
    deleted.forEach((i) => {
      const { product_id, total_price } = i;
      console.log({ product_id, total_price }, "line 422");
      deletedIds.set(product_id, total_price);
    });
    deletedIds.forEach((price, deletedId) => {
      $(
        `.productResults .product[data-product_id=${deletedId}] .addToCart button[type='submit'] i`
      )
        .removeClass(inCartClass)
        .addClass(outCartClass);

      let total = $cartTotal.attr("data-total_price");
      $cartTotal.attr("data-total_price", `${(total -= price)}`);
      $cartTotal.text(`$${total.toFixed(2)}`);

      $(`.cart .product[data-product_id=${deletedId}] `).remove();
    });

    $cartCount.text(cartCount - deleted.length);
    await updateLists(item, "delete");
    cartNotif();
    e.target.closest(".item").remove();
  }
  // END RM ITEM FROM SHOPPING LIST
});
/*************** END SHOPPLING LIST ITEM INTERACTION ***************/

/*************** SET FAVORITE ***************/
const setFav = async (e, inContainer) => {
  if (e.target.classList.contains("fa-star")) {
    const product = e.target.closest(".product");
    let { fav } = product.dataset;

    product.dataset.fav = fav !== "true" ? "true" : "false";
    if (product.dataset.fav === "true") {
      e.target.classList.replace("fa-regular", "fa-solid");
      const { cart_item_id, qty, total_price, fav, fav_id, ...favProd } =
        product.dataset;
      const addKeys = {
        order_count: 0,
        user_id,
      };
      const sentObj = { ...favProd, ...addKeys };

      sentObj.item = parseSpace(true, sentObj.item);
      sentObj.refrigerate = parseSpace(true, sentObj.refrigerate);

      const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sentObj),
      };

      const res = await sendReq("/api/favorites", options);
      console.log(res, "line 475");

      product.dataset.fav_id = res.id;
    } else {
      e.target.classList.replace("fa-solid", "fa-regular");

      const options = {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usedFor: fav_products }),
      };
      const { fav_id } = product.dataset;
      const data = await sendReq(`/api/products/${fav_id}`, options);
      if (inContainer) {
        product.remove();
      }
    }
  }
};
/*************** END SET FAVORITE ***************/
/*************** ADD TO CART ***************/

const addItem = async (e) => {
  e.preventDefault();
  const product = e.target.closest(".product");
  console.log(product.dataset, " line 500");

  const { product_id, name, image, price, size, refrigerate, item } =
    product.dataset;

  const qty = $(
    `.product[data-product_id = '${product_id}'] .addToCart input[name='qty'] `
  ).val();

  if (!$cart.find(`.product[data-product_id='${product_id}'`).length) {
    const { fav, fav_id, ...cartItem } = product.dataset;
    const addKeys = {
      order_count: 1,
      user_id,
      qty,
      total_price: price * qty,
    };

    const sentItem = { ...cartItem, ...addKeys };

    sentItem.item = parseSpace(true, sentItem.item);
    sentItem.refrigerate = parseSpace(true, sentItem.refrigerate);

    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sentItem),
    };
    const res = await sendReq("api/cart/item", options);
    const cart_item_id = res[0].id;

    appendCart(
      product_id,
      name,
      image,
      price,
      size,
      refrigerate,
      cart_item_id,
      fav,
      fav_id,
      qty,
      item
    );

    $(
      `.product[data-product_id = '${product_id}'] .addToCart button[type='submit'] i`
    )
      .addClass(inCartClass)
      .removeClass(outCartClass);
    $(`.itemList .itemLink[data-item='${item}']`).css({
      "text-decoration": "line-through",
    });
    let cartCount = parseInt($cartCount.text());
    cartCount++;
    $cartCount.text(cartCount);
    cartNotif();
  }
};
$(`.productResults`).on("click", async (e) => {
  await setFav(e);
  await livePriceUpdate(e);
  if (e.target.classList.contains("addToCart")) {
    $(`.addToCart`)
      .unbind("submit")
      .bind("submit", async (e) => await addItem(e));
  }
  /*************** END ADD TO CART ***************/
});
/*************** UPDATE CART ***************/
$cart.on("click", async (e) => {
  await setFav(e);

  await livePriceUpdate(e, true);

  // RM FROM CART
  if (e.target.classList.contains("rm", "fromCart")) {
    const { product_id, item, cart_item_id, total_price, price } =
      e.target.closest(".product").dataset;
    e.target.closest(".product").remove();
    $(
      `.productResults .product[data-product_id = '${product_id}'] .addToCart button[type='submit'] i`
    )
      .addClass(outCartClass)
      .removeClass(inCartClass);

    if (!$(`.cart`).find(`.product[data-item='${item}`).length)
      $(`.itemList .itemLink[data-item='${item}']`).css({
        "text-decoration": "none",
      });

    let cartCount = parseInt($cartCount.text());
    cartCount--;
    $cartCount.text(cartCount);
    cartNotif();

    let total = $cartTotal.attr("data-total_price");
    $cartTotal.attr("data-total_price", `${(total -= total_price)}`);
    $cartTotal.text(`$${total.toFixed(2)}`);

    const options = {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usedFor: cart_items }),
    };

    await sendReq(`/api/products/${cart_item_id}`, options);
  }
  // END RM FROM CART
});
/*************** END UPDATE CART ***************/
/***************  GET FAVORITES ***************/
$(`.favBtn`).on("click", async (e) => {
  $favContainer.toggle();
  toggleDivs("fav");
  $favorites.empty();
  if ($favContainer.is(":visible")) {
    const options = {
      method: "GET",
      headers: { user_id },
    };
    const res = await sendReq("/api/favorites", options);
    console.log(res, " line 622");

    for (const product of res) {
      const {
        product_id,
        name,
        image,
        price,
        size,
        refrigerate,
        item,
        fav_id,
      } = product;

      if (!$favorites.find(`.product[data-product_id='${product_id}'`).length) {
        const cartMap = await getItems(cart_items);

        const inCart = await checkCart(product_id, "btn", cartMap);

        let temp = "";
        if (refrigerate !== "null") temp = refrigerate;

        const qty = inCart === inCartClass ? cartMap.get(product_id).qty : 1;

        $favorites.append(`
          <div class='product store'
          data-product_id=${product_id} 
          data-name=${parseSpace(false, name)} 
          data-image=${image} 
          data-price=${price}
          data-size=${parseSpace(false, size)}
          data-refrigerate=${parseSpace(false, refrigerate)}
          data-fav='true'
          data-fav_id=${fav_id}
          data-qty=${qty}
          data-item = ${parseSpace(false, item)}>
            <i class="fa-solid fa-star hover"></i>
            <div class="imgWrapper"> <img class="image" src="${image}" alt=""> </div>
        
              <h3 class="description">${parseSpace(true, name)}</h3>
              <div class="content">
                <div class="left">
                  <p class="price">$${(price * qty).toFixed(2)} </p>
                  <p class='info'> Size: ${parseSpace(
                    true,
                    size
                  )} <br>${temp}</p>
                </div>
                <div class="right">
                  <form action="" class="addToCart" >
                    <div class='qty'>
                    <label for="qty">Qty</label>
                      <input class="addToCart" type="number" name="qty" id="qty" min="1" value="${qty}">
                    </div>
                    <button class="addToCart hover" type="submit"><i class="fa-solid ${inCart} addToCart"></i></button>
                    </form>
                </div>
              </div>
            
          </div>
        `);
      }
    }
  }
});
$favorites.on("click", async (e) => {
  await setFav(e, true);
  await livePriceUpdate(e);

  if (e.target.classList.contains("addToCart")) {
    $(`.addToCart`)
      .unbind("submit")
      .bind("submit", async (e) => await addItem(e));
  }
});

/*************** END GET FAVORITES ***************/
/*************** GET CART ***************/
$(".cartBtn").on("click", async (e) => {
  $cartContainer.toggle();
  toggleDivs("cart");
  $cart.empty();
  if ($cartContainer.is(":visible")) {
    let totalPrice = await getCartTotal();
    totalPrice = totalPrice ? totalPrice : 0;
    $cartTotal.text(`$${totalPrice}`).attr("data-total_price", totalPrice);

    const options = {
      method: "GET",
      headers: { user_id },
    };
    const res = await sendReq("/api/cart", options);

    for (const product of res) {
      const favMap = await getItems(fav_products);
      const favObj = checkFav(product.product_id, favMap);
      const cartItem = { ...product, ...favObj };
      const {
        product_id,
        name,
        image,
        price,
        size,
        refrigerate,
        item,
        fav_id,
        cart_item_id,
        fav,
        qty,
      } = cartItem;

      if (!$cart.find(`.product[data-product_id='${product_id}'`).length) {
        appendCart(
          product_id,
          name,
          image,
          price,
          size,
          refrigerate,
          cart_item_id,
          fav,
          fav_id,
          qty,
          item
        );
      }
    }
  }
});
/*************** END GET CART ***************/
// TO DO ADD CHECKOUT BUTN FOR CART, ADD TOTAL PRICE INDICATOR OF CART WITH DATASET OF CART PRICE AND THEN STYLING
