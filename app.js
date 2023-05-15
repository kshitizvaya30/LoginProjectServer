import express from "express";
import bodyParser from "body-parser";
import {
  getUserDetails,
  getUserIdByEmail,
  signupUser,
  updateUser,
  getItemsByUserId,
  addItem,
  updateItem,
  deleteItem,
  createItems,
  deleteItemsByUserId,
  getItemCountByUserId,
} from "./database.js";

import { encrypt, decrypt, comparePasswords } from "./encryption.js";
import cors from "cors";
const app = express();
app.use(
  cors({
    origin: "*",
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// deleteItemsByUserId(38);
// createItems(38,150);

app.post("/api/signIn", async (req, res) => {
  const { loginId, password } = req.body;
  const rows = await getUserDetails(loginId);

  if (rows.length !== 0) {
    const storedPassword = rows[0].password;
    const encryptPass = decrypt(storedPassword);
    // console.log("encryptPass", encryptPass);
    if (password === encryptPass) {
      // console.log("password matched");
      res.status(200).send(rows);
    } else {
      res.status(401).send("Invalid credentials");
    }
  } else {
    res.status(401).send("Invalid credentials");
  }
});

app.post("/api/signUp", async (req, res) => {
  const { name, email, phone_number, password } = req.body;
  const encryptPass = encrypt(password);
  const success = await signupUser(name, email, phone_number, encryptPass);

  if (succes === "User Signed Up") {
    const id = await getUserIdByEmail(email);
    // console.log(encryptPass);
    res.status(200).send({ id: id });
  } else if(success === "User already exists"){
    res.status(409).send("User Already Exist");
  } else {
    res.status(500).send("Internal Server Error");
  }
});

app.put("/api/updateUserData", async (req, res) => {
  const user = req.body;
  const result = await updateUser(user.id, user);
  if (result) {
    res.status(200).send({ id: id });
  } else {
    res.status(409).send("User Already Exist");
  }
});

app.get("/api/items/:itemId", async (req, res) => {
  const itemId = req.params.itemId;
  const { page, pageSize } = req.query;

  const items = await getItemsByUserId(itemId, page, pageSize);
  const count = await getItemCountByUserId(itemId);
  if (!items) {
    return res.status(404).json({ error: "Item not found" });
  }
  res.status(200).send({ totalCount: count, items: items });
});

app.post("/api/items", (req, res) => {
  const newItem = req.body;
  const result = addItem(newItem);
  if (result) {
    res.status(201).json({ message: "Item added successfully" });
  } else {
    res.status(400).json({ message: "Item added successfully" });
  }
});

app.put("/api/items", (req, res) => {
  const newItem = req.body;
  const result = updateItem(newItem);
  if (result) {
    res.status(201).json({ message: "Item added successfully" });
  } else {
    res.status(400).json({ message: "Item added successfully" });
  }
});

app.delete("/api/items/:itemId/:userId", async (req, res) => {
  const itemId = req.params.itemId;
  const userId = req.params.userId;

  try {
    await deleteItem(itemId, userId);
    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//Server Settings
app.use((err, req, res, next) => {
  res.status(500).send("!Something Broke");
});

app.listen(8080, () => {
  console.log("Server is Listening on Port 8080");
});
