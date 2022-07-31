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
// ADD ITEMS TO SHOPPING LIST
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

// RETRIEVE ITEMS FROM SHOPPING LIST SELECTION
$(".shoppingList .itemList").on("click", async (e) => {
  const trash = e.target.dataset.trash;
  const url = e.target.dataset.url;

  if (url) {
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
          refrigerate = "Refrigerate";
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
          data-fav="false">
            <i class="fa-regular fa-star" data-fav='true'></i>
            <img class="image" src="${pImage}" alt="">
            <h3 class="categories">${categories.join(", ")}</h3>
            <h2 class="description">${description}</h2>
            <p class="price">Price: ${items[0].price.regular} per ${
          items[0].soldBy
        }</p>
            <p class='info'> Size: ${items[0].size} <br>${refrigerate}</p>
          </div>
        `);
      }
    }
    console.log(url, data);
  } else if (trash) {
    e.target.parentElement.remove();
  }
});

// SET FAVORITES
$(`.productResults`).on("click", async (e) => {
  if (e.target.classList.contains("fa-star")) {
    const product = e.target.parentElement;
    let { fav } = product.dataset;

    product.dataset.fav = fav !== "true" ? "true" : "false";

    if (product.dataset.fav === "true") {
      const { fav, fav_id, ...favProd } = product.dataset;
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
});

// ADD TO CART