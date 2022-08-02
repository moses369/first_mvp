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
      console.log("RES STATUS", res.status, "line 11");

      return data;
    } else {
      const body = await res.text();
      console.error("STATUS CODE", res.status, "\nRESPONSE:", body);
    }
  } catch (err) {
    console.error(err);
  }
}
/*************** APP WIDE VARS/HELPER FUNCTIONS ***************/
const user_id = 1;
const $cartCount = $(".cartCount");
const $favorites = $(".favorites");
const $cartContainer = $(".cartContainer");
const $cart = $(".cart");
const $cartTotal = $(".cartTotal");
const cart_items = "cart_items";
const fav_products = "fav_products";
$(window).on("load", async (e) => {
  cartNotif();
  $favorites.hide();
  $cartContainer.hide();
  const options = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id }),
  };
  await sendReq("/api/lists", options);
  await checkCart("", "onload");
  await checkLists();
});
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
      let inCart = "ADD TO CART";
      if (
        $(`.cart`).find(`.product[data-product_id='${productId}'`).length ||
        mapOfIds.has(productId)
      )
        inCart = "ADDED";
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
  const ids = new Map();
  for (let item of res) {
    const { product_id, id } = item;
    ids.set(product_id, id);
  }
  return ids;
}
////  END GET ITEMS FROM A TABLE MATCHIG ID
////  CHECK FAV
function checkFav(productId, mapOfIds) {
  const fav = mapOfIds.has(productId);
  const fav_id = fav ? mapOfIds.get(productId) : 0;
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
  const total_price = price * qty;
  $cart.append(`
  <div class="product inCart" 
  data-product_id=${product_id} 
  data-name=${name} 
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
    <i class="fa-regular fa-star"></i>
    <img class="image" src="${image}" alt="">
    <h2 class="description">${name}</h2>
    <p class='info'> Size: ${parseSpace(true, size)} <br> ${temp} </p>
    <p class="price">$${total_price.toFixed(2)} </p>  
    <form action="" class='cartQty'>
      <input class="cartQty" type="number" name="qty" id="qty" min="1" value="${qty}">
      <input class="btn cartQty" type="submit" value="Update Qty">
    </form>
    <button class="btn rm FromCart">X</button>
  </div>
`);
}
//// END APPEND TO CART
//// APPEND/CHECK ITEM TO LISTS
function appendLists(newItem, inCart) {
  $(`.itemList`).append(
    `
    <div class="item"> 
      <a href="#" data-url='/api/products?filter.term=${newItem}' data-item='${parseSpace(
      false,
      newItem
    )}' class='itemLink'>${newItem}</a>
      <i class="fa-solid fa-trash" data-trash='true'></i>
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
  let additem = item.toLowerCase();
  const sendObj = {
    user_id,
    items: `${(additem += ",")}`,
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
  const newItem = $(`.addToList input[name='product']`).val();
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
    const favMap = await getItems(fav_products);
    const cartMap = await getItems(cart_items);
    $(".productResults").empty();
    if (data) {
      for (let product of data) {
        const { images, description, productId, items, temperature } = product;

        if (!images[0].sizes[3].url) continue;
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
        $(".productResults").append(`
        <div class="product" 
          data-product_id=${productId} 
          data-name=${description} 
          data-image=${pImage} 
          data-price=${items[0].price.regular}
          data-size=${parseSpace(false, items[0].size)}
          data-refrigerate= ${parseSpace(false, refrigerate)}
          data-fav='${fav}'
          data-fav_id=${fav_id}
          data-item = ${parseSpace(false, item)}>
            <i class="fa-regular fa-star"></i>
            <img class="image" src="${pImage}" alt="">
            <h3 class="description">${description}</h3>
            <p class="price">Price: $${items[0].price.regular} </p>
            <p class='info'> Size: ${items[0].size} <br>${refrigerate}</p>
            <form action="" class="addToCart" >
              <label for="qty">Qty</label>
              <input class="addToCart" type="number" name="qty" id="qty" min="1" value="1">
              <input class="addToCart" type="submit" class="btn" value="${inCart}">
            </form>
          </div>
        `);
      }
    }
    console.log(url, data);
    // END RETRIEVE ITEM
    // RM ITEM FROM SHOPPING LIST
  } else if (trash) {
    const item = e.target.parentElement.innerText;

    let cartCount = parseInt($cartCount.text());

    const options = {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item, user_id }),
    };
    const deleted = await sendReq(`/api/cart/item`, options);
    const deletedIds = [];
    deleted.forEach((i) => {
      for (const item in i) {
        if (item === "product_id") deletedIds.push(i[item]);
      }
    });
    for (const deletedId of deletedIds) {
      $(
        `.productResults .product[data-product_id=${deletedId}] .addToCart input[type='submit']`
      ).val("ADD TO CART");
      $(`.cart .product[data-product_id=${deletedId}] `).remove();
    }

    $cartCount.text(cartCount - deleted.length);
    await updateLists(item, "delete");
    cartNotif();
    e.target.parentElement.remove();
  }
  // END RM ITEM FROM SHOPPING LIST
});
/*************** END SHOPPLING LIST ITEM INTERACTION ***************/

/*************** SET FAVORITE ***************/
const setFav = async (e, inContainer) => {
  if (e.target.classList.contains("fa-star")) {
    const product = e.target.parentElement;
    let { fav } = product.dataset;

    product.dataset.fav = fav !== "true" ? "true" : "false";
    if (product.dataset.fav === "true") {
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

      const res = (await sendReq("/api/favorites", options))[0];
      console.log(res);

      product.dataset.fav_id = res.id;
    } else {
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
  const product = e.target.parentElement;
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
      `.product[data-product_id = '${product_id}'] .addToCart input[type='submit']`
    ).val("ADDED");
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
  // UPDATE QTY
  if (e.target.classList.contains("cartQty")) {
    const product = e.target.parentElement.parentElement;
    const { product_id, price } = product.dataset;
    const $inputQty = $(
      `.product[data-product_id = '${product_id}'] .cartQty input[name="qty"]`
    );
    const oldQty = $inputQty.val();
    $(`.cartQty`)
      .unbind("submit")
      .bind("submit", async (e) => {
        e.preventDefault();

        const newQty = parseInt($inputQty.val());

        if (oldQty !== newQty) {
          const newTotal = newQty * price;

          $(`.cart .product[data-product_id = '${product_id}'] .price`).text(
            `$${newTotal.toFixed(2)}`
          );

          product.dataset.total_price = newTotal;
          product.dataset.qty = newQty;

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
          const update = await sendReq(
            `/api/products/table/${product_id}`,
            options
          );
          console.log(update);

          const totalPrice = await getCartTotal();
          $cartTotal
            .text(`$${totalPrice}`)
            .attr("data-total_price", totalPrice);
        }
      });
  }
  // END UPDATE QTY
  // RM FROM CART
  if (e.target.classList.contains("rm", "FromCart")) {
    const { product_id, item, cart_item_id } = e.target.parentElement.dataset;
    e.target.parentElement.remove();
    $(
      `.productResults .product[data-product_id = '${product_id}'] .addToCart input[type='submit']`
    ).val("ADD TO CART");

    if (!$(`.cart`).find(`.product[data-item='${item}`).length)
      $(`.itemList .itemLink[data-item='${item}']`).css({
        "text-decoration": "none",
      });

    let cartCount = parseInt($cartCount.text());
    cartCount--;
    $cartCount.text(cartCount);
    cartNotif();

    const options = {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usedFor: cart_items }),
    };
    console.log(cart_item_id);

    await sendReq(`/api/products/${cart_item_id}`, options);
  }
  // END RM FROM CART
});
/*************** END UPDATE CART ***************/
/***************  GET FAVORITES ***************/
$(`.favBtn`).on("click", async (e) => {
  $favorites.toggle();
  if ($favorites.is(":visible")) {
    const options = {
      method: "GET",
      headers: { user_id },
    };
    const res = await sendReq("/api/favorites", options);
    console.log(res);

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
        $favorites.append(`
          <div class='product'
          data-product_id=${product_id} 
          data-name=${name} 
          data-image=${image} 
          data-price=${price}
          data-size=${parseSpace(false, size)}
          data-refrigerate=${parseSpace(false, refrigerate)}
          data-fav='true'
          data-fav_id=${fav_id}
          data-item = ${parseSpace(false, item)}>
            <i class="fa-regular fa-star"></i>
            <img class="image" src="${image}" alt="">
            <h3 class="description">${name}</h3>
            <p class="price">Price: $${price} </p>
            <p class='info'> Size: ${parseSpace(true, size)} <br>${temp}</p>
            <form action="" class="addToCart" >
              <label for="qty">Qty</label>
              <input class="addToCart" type="number" name="qty" id="qty" min="1" value="1">
              <input class="addToCart" type="submit" class="btn" value="${inCart}">
            </form>
          </div>
        `);
      }
    }
  }
});
$favorites.on("click", async (e) => {
  await setFav(e, true);
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
  if ($cartContainer.is(":visible")) {
    const totalPrice = await getCartTotal();
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
