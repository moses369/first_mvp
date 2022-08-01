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
const $cartCount = $(".cartCount");
const $favorites = $(".favorites");
const $cart = $(".cart");
$favorites.hide();
$cart.hide();

////CART NOTIFACTION
const cartNotif = () =>
  $cartCount.text() !== "0" ? $cartCount.show() : $cartCount.hide();
cartNotif();
//// END END CART NOTIFICATION
////  CHECK CART
const checkCart = async (productId, useCase) => {
  switch (useCase) {
    case "btn":
      let inCart = "ADD TO CART";
      if ($(`.cart`).find(`.product[data-product_id='${productId}'`).length)
        inCart = "ADDED";
      return inCart;
    case "onload":
      const { count } = (
        await sendReq("/api/products/cart/count", { headers: { user_id: 1 } })
      )[0];
      $(".cartCount").text(count);
      cartNotif();
      return count;
  }
};
$(window).on("load", async (e) => await checkCart("", "onload"));
//// END CHECK CART
////  CHECK FAV
const checkFav = async (productId, useCase) => {
  const res = (
    await sendReq(`/api/products/favorites/${productId}`, {
      headers: { user_id: 1 },
    })
  )[0];
  const fav = res ? true : false;
  const fav_id = fav ? res.id : 0;
  const favObj = { fav, fav_id };
  return favObj;
};
//// END CHECK FAV

//// APPEND TO CART
const appendCart = (
  product_id,
  name,
  image,
  price,
  size,
  refrigerate,
  order_id,
  fav,
  fav_id,
  qty,
  item
) => {
  $cart.append(`
  <div class="product inCart" 
  data-product_id=${product_id} 
  data-name=${name} 
  data-image=${image} 
  data-price=${price}
  data-size=${size}
  data-refrigerate=${refrigerate}
  data-order_id=${order_id}
  data-fav=${fav}
  data-fav_id=${fav_id}
  data-qty = ${qty}
  data-item = ${item}>
    <i class="fa-regular fa-star"></i>
    <img class="image" src="${image}" alt="">
    <h2 class="description">${name}</h2>
    <p class='info'> Size: ${size} <br> ${refrigerate} </p>
    <p class="price">$${price * qty} </p>  
    <form action="" class='cartQty'>
      <input class="cartQty" type="number" name="qty" id="qty" min="1" value="${qty}">
      <input class="btn cartQty" type="submit" value="Update Qty">
    </form>
    <button class="btn rm FromCart">X</button>
  </div>
`);
};
//// END APPEND TO CART

/*************** END APP WIDE VARS/HELPER FUNCTIONS  ***************/

/*************** ADD ITEMS TO SHOPPING LIST ***************/
$(".addToList").on("submit", async (e) => {
  e.preventDefault();
  const newItem = $(`.addToList input[name='product']`).val();
  $(`.itemList`).append(
    `
    <div class="item"> 
      <a href="#" data-url='/api/products?filter.term=${newItem}' data-item='${newItem}' class='itemLink'>${newItem}</a>
      <i class="fa-solid fa-trash" data-trash='true'></i>
    </div>  
  `
  );

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

        const inCart = await checkCart(productId, "btn");

        const { fav_id, fav } = await checkFav(productId);

        $(".productResults").append(`
        <div class="product" 
          data-product_id=${productId} 
          data-name=${description} 
          data-image=${pImage} 
          data-price=${items[0].price.regular}
          data-size=${items[0].size}
          data-refrigerate=${refrigerate}
          data-fav='${fav}'
          data-fav_id=${fav_id}
          data-item = ${item}>
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
    $(`.cart .product[data-item=${item}] `).each((i, product) => cartCount--);

    $(
      `.productResults .product[data-item=${item}] .addToCart input[type='submit']`
    ).val("ADD TO CART");
    $(`.cart .product[data-item=${item}] `).remove();
    $cartCount.text(cartCount);
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
      const { fav, fav_id, ...favProd } = product.dataset;
      const addKeys = {
        fav_count: 1,
        order_count: 0,
        user_id: 1,
        useFor: "fav_products",
      };
      const sentObj = { ...favProd, ...addKeys };
      const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sentObj),
      };

      const res = (await sendReq("/api/products", options))[0];
      console.log(res);

      product.dataset.fav_id = res.id;
    } else {
      const options = {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usedFor: "fav_products" }),
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
      fav_count: 0,
      order_count: 1,
      user_id: 1,
      useFor: "cart",
      qty,
    };
    const sentItem = { ...cartItem, ...addKeys };
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sentItem),
    };
    const res = await sendReq("api/products", options);
    const order_id = res[0].id;
    console.log(res, "line 198 add to cart");

    appendCart(
      product_id,
      name,
      image,
      price,
      size,
      refrigerate,
      order_id,
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
    $(`.cartQty`).on("submit", async (e) => {
      e.preventDefault();
      const newQty = $inputQty.val();
      if (oldQty !== newQty) {
        $(`.cart .product[data-product_id = '${product_id}'] .price`).text(
          `${price * newQty}`
        );
        product.dataset.order_count = newQty;
      }
    });
  }
  // END UPDATE QTY
  // RM FROM CART
  if (e.target.classList.contains("rm", "FromCart")) {
    const { product_id, item, order_id } = e.target.parentElement.dataset;
    e.target.parentElement.remove();
    $(
      `.productResults .product[data-product_id = '${product_id}'] .addToCart input[type='submit']`
    ).val("ADD TO CART");
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
      body: JSON.stringify({ usedFor: "cart" }),
    };

    const data = await sendReq(`/api/products/${order_id}`, options);
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
      headers: { user_id: 1 },
    };
    const res = await sendReq("/api/products/favorites", options);
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
        let temp = "";
        if (refrigerate === "Keep") temp = "Keep Refrigerated";
        const inCart = await checkCart(product_id, "btn");
        $favorites.append(`
          <div class='product'
          data-product_id=${product_id} 
          data-name=${name} 
          data-image=${image} 
          data-price=${price}
          data-size=${size}
          data-refrigerate=${refrigerate}
          data-fav='true'
          data-fav_id=${fav_id}
          data-item = ${item}>
            <i class="fa-regular fa-star"></i>
            <img class="image" src="${image}" alt="">
            <h3 class="description">${name}</h3>
            <p class="price">Price: $${price} </p>
            <p class='info'> Size: ${size} <br>${temp}</p>
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
  $cart.toggle();
  if ($cart.is(":visible")) {
    const options = {
      method: "GET",
      headers: { user_id: 1 },
    };
    const res = await sendReq("/api/products/cart", options);

    for (const product of res) {
      const favObj = await checkFav(product.product_id);
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
        order_id,
        fav,
        qty,
      } = cartItem;

      if (!$cart.find(`.product[data-product_id='${product_id}'`).length) {
        let temp = "";
        if (refrigerate === "Keep") temp = "Keep Refrigerated";
        appendCart(
          product_id,
          name,
          image,
          price,
          size,
          temp,
          order_id,
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
