async function sendReq(url, options) {
  try {
    const res = await fetch(url, options);
    if (res.status >= 200 && res.status < 300) {
      const data = await res.json();
      return data;
    } else {
      const body = await res.text();
      console.error("STATUS CODE", res.status, "\nRESPONSE:", body);
    }
  } catch (err) {
    console.error(err);
  }
}

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
const shopingList = document.querySelector(".shoppingList .itemList");
shopingList.addEventListener("click", async (e) => {
  const trash = e.target.dataset.trash;
  const url = e.target.dataset.url;
  if (url) {
    const { data } = await sendReq(url);
    $(".productResults").empty();
    if (data) {
      for (let product of data) {
        const { images, description, categories, productId, items, temperature } = product;
        if (!images[0].sizes[3].url) continue;
        let pImage;
        for (let img of images) {
          const { perspective, sizes } = img;
          if (perspective === "front") pImage = sizes[3].url;
        }
        let refrigerate=''
        if(temperature.indicator === 'Refrigerated') refrigerate ='Refrigerate'
        $(".productResults").append(`
        <div class="product" data-url="/api/products/${productId}" data-id="${productId}" data-fav="false">
            <img class="image" src="${pImage}" alt="">
            <h3 class="categories">${categories.join(", ")}</h3>
            <h2 class="description">${description}</h2>
            <p class="price">Price: ${items[0].price.regular} per ${
              items[0].soldBy
            }</p>
            <p class='info'> Weight: ${items[0].size} <br>${refrigerate}</p>
          </div>
        `);
      }
    }
    console.log(url, data);
  } else if (trash) {
    e.target.parentElement.remove();
  }
});
