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
const createUser = document.querySelector(`.createUser`);
createUser.addEventListener("submit", async (e) => {
  const UNAME = createUser.querySelector(`#uName`);
  const EMAIL = createUser.querySelector(`#email`);
  const PHONE = createUser.querySelector(`#phone`);
  const ADDRESS = createUser.querySelector(`#address`);
  e.preventDefault();
  const name = UNAME.value;
  const email = EMAIL.value;
  const phone = PHONE.value;
  const address = ADDRESS.value;
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
const updateUser = document.querySelector(`.updateUser`);
updateUser.addEventListener("submit", async (e) => {
  const UNAME = updateUser.querySelector(`#uName`);
  const EMAIL = updateUser.querySelector(`#email`);
  const PHONE = updateUser.querySelector(`#phone`);
  const ADDRESS = updateUser.querySelector(`#address`);
  e.preventDefault();
  const name = UNAME.value;
  const email = EMAIL.value;
  const phone = PHONE.value;
  const address = ADDRESS.value;
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
  const PNAME = createProduct.querySelector(`#pName`);
  const IMAGE = createProduct.querySelector(`#image`);
  const PRICE = createProduct.querySelector(`#price`);
  const PERLB = createProduct.querySelectorAll(`input[name = 'perLb'] `);
  e.preventDefault();
  const name = PNAME.value;
  const image = IMAGE.value;
  const price = PRICE.value;
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
