
getToken();
const test = async () => {
  try {
    const headers = new Headers()
    headers.append('Authorization',`Bearer ${getToken()}`)
    const data = await sendReq( '/api/products', {
      headers, method:'GET'
    });
    console.log(data);
    
  } catch (err) {
    console.error(err);
  }
};
test()
async function sendReq(url, options, consoleMsg) {
  try {
    const res = await fetch(url, options);
    if (res.status >= 200 && res.status < 300) {
      const data = await res.json();
      console.log(consoleMsg, data);
      return data;
    } else {
      const body = await res.text();
      console.error("STATUS CODE", res.status, "\nRESPONSE:", body);
    }
  } catch (err) {
    console.error(err);
  }
}
const postHeader = new Headers();
postHeader.append("Content-Type", "application/json");

/*************** USER PATH INTERACTION ****************/
//GET USERS
const getUsers = document.querySelector(".getUsers");
getUsers.addEventListener("click", async (e) => {
  const data = await sendReq("/api/users", { method: "GET" }, "GET USERS");
});

// CREATE NEW USER
createUser.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = $(`.updateUser #uName`).val();
  const email = $(`.updateUser #email`).val();
  const phone = $(`.updateUser #phone`).val();
  const address = $(`.updateUser #address`).val();
  let newUser;
  if (!phone) {
    newUser = { name, email, address };
  } else {
    newUser = { name, email, phone, address };
  }
  sendReq(
    "/api/users",
    {
      method: "POST",
      body: JSON.stringify(newUser),
      headers: postHeader,
    },
    "POST USER "
  );
});
// UPDATE  USER
updateUser.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = $(`.updateUser #uName`).val();
  const email = $(`.updateUser #email`).val();
  const phone = $(`.updateUser #phone`).val();
  const address = $(`.updateUser #address`).val();
  const newUser = { name, email, phone, address };

  sendReq(
    "/api/users",
    {
      method: "PATCH",
      body: JSON.stringify(newUser),
      headers: postHeader,
    },
    "PATCH USER "
  );
});
/*************** END USER PATH INTERACTION ****************/

/***************  PRODUCT PATH INTERACTION ****************/
// GET PRODUCTS
const getProducts = document.querySelector(".getProducts");
getProducts.addEventListener("click", async (e) => {
  const data = await sendReq(
    "/api/products",
    { method: "GET" },
    "GET PRODUCTS"
  );
});

// CREATE NEW PRODUCT
const createProduct = document.querySelector(`.createProduct`);
createProduct.addEventListener("submit", async (e) => {
  const PERLB = createProduct.querySelectorAll(`input[name = 'perLb'] `);
  e.preventDefault();
  const name = $(`.createProduct #pName`).val();
  const image = $(`.createProduct #image`).val();
  const price = $(`.createProduct #price`).val();
  let per_lb;
  for (const opt of PERLB) {
    if (opt.checked) {
      per_lb = opt.value;
      break;
    }
  }
  const newProduct = { name, image, price, per_lb };
  sendReq(
    "/api/products",
    {
      method: "POST",
      body: JSON.stringify(newProduct),
      headers: postHeader,
    },
    "POST PRODUCT "
  );
});
/*************** END  PRODUCT PATH INTERACTION ****************/
