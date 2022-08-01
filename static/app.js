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
      console.log("RES STATUS", res.status);

      return data;
    } else {
      const body = await res.text();
      console.error("STATUS CODE", res.status, "\nRESPONSE:", body);
    }
  } catch (err) {
    console.error(err);
  }
}
/*************** APP WIDE VARS ***************/
const $cartCount = $(".cartCount");
/*************** END APP WIDE VARS ***************/
/***************CART NOTIFACTION ***************/
const cartNotif = () =>
  $cartCount.text() !== '0' ? $cartCount.show() : $cartCount.hide();
cartNotif()
/*************** END END CART NOTIFICATION ***************/
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
        const {
          images,
          description,
          categories,
          productId,
          items,
          temperature,
        } = product;
        if (!images[0].sizes[3].url) continue;
        let pImage;
        for (let img of images) {
          const { perspective, sizes } = img;
          if (perspective === "front") pImage = sizes[3].url;
        }
        let refrigerate = "";
        if (temperature.indicator === "Refrigerated")
          refrigerate = "Keep Refrigerated";
        let inCart = "ADD TO CART";
        if ($(`.cart`).find(`.product[data-product_id='${productId}'`).length)
          inCart = "ADDED";
        $(".productResults").append(`
        <div class="product" 
          data-product_id='${productId}' 
          data-name='${description}' 
          data-categories='${categories.join(", ")}' 
          data-image='${pImage}' 
          data-price='${items[0].price.regular}'
          data-unit='${items[0].soldBy}'
          data-size='${items[0].size}'
          data-refrigerate='${refrigerate}'
          data-fav="false"
          data-item = ${item}>
            <i class="fa-regular fa-star"></i>
            <img class="image" src="${pImage}" alt="">
            <h4 class="categories">${categories.join(", ")}</h4>
            <h3 class="description">${description}</h3>
            <p class="price">Price: $${items[0].price.regular} per ${
          items[0].soldBy
        }</p>
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

    let cartCount = parseInt($cartCount.text())
    $(`.cart .product[data-item=${item}] `).each((i,product) => cartCount--)

    $(
      `.productResults .product[data-item=${item}] .addToCart input[type='submit']`
      ).val("ADD TO CART");
      $(`.cart .product[data-item=${item}] `).remove();
      $cartCount.text(cartCount)
      cartNotif()
      e.target.parentElement.remove();
  }
  // END RM ITEM FROM SHOPPING LIST
});
/*************** END SHOPPLING LIST ITEM INTERACTION ***************/

/*************** SET FAVORITE ***************/
const setFav = async (e) => {
  if (e.target.classList.contains("fa-star")) {
    const product = e.target.parentElement;
    let { fav } = product.dataset;

    product.dataset.fav = fav !== "true" ? "true" : "false";

    if (product.dataset.fav === "true") {
      const { item, fav, fav_id, ...favProd } = product.dataset;
      favProd.fav_count = 1;
      favProd.order_count = 0;
      favProd.user_id = 1;

      const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(favProd),
      };

      const res = (await sendReq("/api/products", options))[0];
      product.dataset.fav_id = res.id;
    } else {
      const options = {
        method: "DELETE",
      };
      const { fav_id } = product.dataset;
      const data = await sendReq(`/api/products/${fav_id}`, options);
      console.log(data);
    }
  }
};
/*************** END SET FAVORITE ***************/

$(`.productResults`).on("click", async (e) => {
  await setFav(e);
  /*************** ADD TO CART ***************/
  if (e.target.classList.contains("addToCart")) {
    $(`.addToCart`).on("submit", async (e) => {
      e.preventDefault();
      const product = e.target.parentElement;
      const {
        product_id,
        name,
        categories,
        image,
        price,
        unit,
        size,
        refrigerate,
        fav,
        item,
      } = product.dataset;

      const qty = $(
        `.product[data-product_id = '${product_id}'] .addToCart input[name='qty'] `
      ).val();

      if (!$(`.cart`).find(`.product[data-product_id='${product_id}'`).length) {
        $(".cart").append(`
          <div class="product inCart" 
          data-product_id='${product_id}' 
          data-name='${name}' 
          data-categories='${categories}' 
          data-image='${image}' 
          data-price='${price}'
          data-unit='${unit}'
          data-size='${size}'
          data-refrigerate='${refrigerate}'
          data-fav="${fav}"
          data-order_count = ${qty}
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
        $(
          `.product[data-product_id = '${product_id}'] .addToCart input[type='submit']`
        ).val("ADDED");
        $(`.itemList .itemLink[data-item='${item}']`).css({
          "text-decoration": "line-through",
        });
        let cartCount = parseInt($cartCount.text())
        cartCount++
        $cartCount.text(cartCount)
        cartNotif()
      }
    });
  }
  /*************** END ADD TO CART ***************/
});
/*************** UPDATE CART ***************/
$(`.cart`).on("click", async (e) => {
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
    const { product_id, item } = e.target.parentElement.dataset;
    e.target.parentElement.remove();
    $(
      `.productResults .product[data-product_id = '${product_id}'] .addToCart input[type='submit']`
    ).val("ADD TO CART");
    $(`.itemList .itemLink[data-item='${item}']`).css({
      "text-decoration": "none",
    });
    let cartCount = parseInt($cartCount.text())
    cartCount--
    $cartCount.text(cartCount)
    cartNotif()
  }
  // END RM FROM CART
});
/*************** END UPDATE CART ***************/
