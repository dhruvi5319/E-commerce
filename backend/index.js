const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const Stripe = require("stripe");

app.use(express.json());
app.use(cors({
  origin:[""],
  methods: ["POST","GET"],
  credentials: true
}));

//MonoDB Connection
mongoose.connect(
  "mongodb+srv://drathod:Scooby120106@cluster0.ltc6x.mongodb.net/e-commerce"
);

//API Creation
app.get("/", (req, res) => {
  res.send("Express App is Running");
});

//Image Storage Engine
const storage = multer.diskStorage({
  destination: "./upload/images",
  filename: (req, file, cb) => {
    return cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({ storage: storage });

app.use("/images", express.static("upload/images"));

//Creating upload endpoint for images
app.post("/upload", upload.single("product"), (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded." });
  }

  res.json({
    success: true,
    image_url: `http://localhost:${port}/images/${req.file.filename}`,
  });
});

//Schema for creating Products
const Product = mongoose.model("Product", {
  id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  new_price: {
    type: Number,
    required: true,
  },
  old_price: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  available: {
    type: Boolean,
    default: true,
  },
});

app.post("/addproduct", async (req, res) => {
  let products = await Product.find({});
  let id;
  if (products.length > 0) {
    let last_product_array = products.slice(-1);
    let last_product = last_product_array[0];
    id = last_product.id + 1;
  } else {
    id = 1;
  }
  const product = new Product({
    id: id,
    name: req.body.name,
    image: req.body.image,
    category: req.body.category,
    new_price: Number(req.body.new_price),
    old_price: Number(req.body.old_price),
  });
  console.log(product);
  await product.save();
  res.json({
    success: true,
    name: req.body.name,
  });
});

//Creating API for deleting products
app.post("/removeproduct", async (req, res) => {
  await Product.findOneAndDelete({ id: req.body.id });
  console.log("Removed");
  res.json({
    success: true,
    name: req.body.name,
  });
});

//Creating API for getting all products
app.get("/allproducts", async (req, res) => {
  let products = await Product.find({});
  console.log("All Products Fetchedd!!");
  res.send(products);
});

//Schema for User Model
const Users = mongoose.model("Users", {
  name: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  cartData: {
    type: Object,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

//Creating Endpoint for registering the user
app.post("/signup", async (req, res) => {
  let check = await Users.findOne({ email: req.body.email });
  if (check) {
    return res
      .status(400)
      .json({ success: false, errors: "existing user found with same email" });
  }
  let cart = {};
  for (let i = 0; i < 300; i++) {
    cart[i] = 0;
  }
  const user = new Users({
    name: req.body.username,
    email: req.body.email,
    password: req.body.password,
    cartData: cart,
  });

  await user.save();

  const data = {
    user: {
      id: user.id,
    },
  };
  const token = jwt.sign(data, "secret_ecom");
  res.json({ success: true, token });
});

//Creating endpoint for user login
app.post("/login", async (req, res) => {
  let user = await Users.findOne({ email: req.body.email });
  if (user) {
    const passCompare = req.body.password === user.password;
    if (passCompare) {
      const data = {
        user: {
          id: user.id,
        },
      };
      const token = jwt.sign(data, "secret_ecom");
      res.json({ success: true, token });
    } else {
      res.json({ success: false, errors: "Wrong Password" });
    }
  } else {
    res.json({ success: false, errors: "Wrong Email Id" });
  }
});

//creating endpoint for new collection data
app.get("/newcollections", async (req, res) => {
  let products = await Product.find({});
  let newcollection = products.slice(1).slice(-8);
  console.log("New Collection Fetched");
  res.send(newcollection);
});

//Creating endpoint for popular in women endpoint
app.get("/popularinwomen", async (req, res) => {
  let products = await Product.find({ category: "women" });
  let popular_in_women = products.slice(0, 4);
  console.log("Popular in women fetched");
  res.send(popular_in_women);
});

//Creating middleware to fetch user
const fetchUser = async (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) {
    res.status(401).send({ errros: "Please authenticate using valid token" });
  } else {
    try {
      const data = jwt.verify(token, "secret_ecom");
      req.user = data.user;
      next();
    } catch (error) {
      res.status(401).send({ errors: "Please authenticate using valid token" });
    }
  }
};

//creating endpoint for adding products in cartdata
app.post("/addtocart", fetchUser, async (req, res) => {
  console.log("Added", req.body.itemId);
  let userData = await Users.findOne({ _id: req.user.id });
  userData.cartData[req.body.itemId] += 1;
  await Users.findOneAndUpdate(
    { _id: req.user.id },
    { cartData: userData.cartData }
  );
  res.json({ success: true, message: "Item added to cart" });
});

//creating endpoint to remove product from cart data
app.post("/removefromcart", fetchUser, async (req, res) => {
  console.log("removed", req.body.itemId);
  let userData = await Users.findOne({ _id: req.user.id });
  if (userData.cartData[req.body.itemId] > 0) {
    userData.cartData[req.body.itemId] -= 1;
  }
  await Users.findOneAndUpdate(
    { _id: req.user.id },
    { cartData: userData.cartData }
  );
  res.json({ success: true, message: "Item removed from cart" });
});

//creating endpoint to get cartdata
app.post("/getcart", fetchUser, async (req, res) => {
  console.log("Get cart");
  let userData = await Users.findOne({ _id: req.user.id });
  res.json(userData.cartData);
});

//Creating endpoint to handle payment with stripe

// Replace this with your Stripe Secret Key
const stripe = Stripe(
  "sk_test_51QPsLNGG1Y34r33iR9Ja9e29XEcPxckAQV5MqzZkKrOrLUhn0ZtgOjNoYu4HORtIUC7Y2BYuVqOIbfApJPAsxRyR00R5zxHSST"
);

app.post("/create-payment-intent", fetchUser, async (req, res) => {
  const { amount } = req.body;

  // Validate the amount
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: "Invalid amount" });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // Amount in cents
      currency: "usd",
      payment_method_types: ["card"],
    });

    res.status(200).send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error creating payment intent:", error.message);
    res.status(500).json({ error: error.message });
  }
});

//Schema for Order details
const Order = mongoose.model("Order", {
  orderId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  items: {
    type: Object, // Adjust based on your cart data structure
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

//Endpoint to save data
app.post("/save-order", async (req, res) => {
  const { orderId, userId, items, totalAmount } = req.body;

  try {
    const newOrder = new Order({
      orderId,
      userId,
      items,
      totalAmount,
    });

    await newOrder.save();

    res.json({ success: true, message: "Order saved successfully." });
  } catch (error) {
    console.error("Error saving order:", error.message);
    res.status(500).send({ error: error.message });
  }
});

//Endpoint to fetch user id
app.get("/get-user-id", (req, res) => {
  const token = req.header("auth-token");
  if (!token) {
    return res.status(401).json({ error: "Auth token missing" });
  }

  try {
    const verified = jwt.verify(token, "your_jwt_secret_key");
    res.json({ userId: verified.user.id });
  } catch (error) {
    res.status(400).json({ error: "Invalid token" });
  }
});

//clear cart endpoint
app.post("/clear-cart", fetchUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // Clear the user's cart
    await Users.findOneAndUpdate({ _id: userId }, { cartData: {} });

    res.json({ success: true, message: "Cart cleared successfully." });
  } catch (error) {
    console.error("Error clearing cart:", error.message);
    res.status(500).send({ error: error.message });
  }
});

//fetch order details endpoint
app.get("/get-order/:orderId", async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).send({ error: "Order not found." });
    }

    res.json(order);
  } catch (error) {
    console.error("Error fetching order:", error.message);
    res.status(500).send({ error: error.message });
  }
});

app.listen(port, (error) => {
  if (!error) {
    console.log(`Server Running on Port ${port}`);
  } else {
    console.log("Error" + error);
  }
});
