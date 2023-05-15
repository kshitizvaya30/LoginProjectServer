import mysql from "mysql2";
import dotenv from "dotenv";
import casual from "casual";
dotenv.config();

const pool = mysql
  .createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  })
  .promise();

//Testing Functions
export async function createItems(userId, count) {
  for (let i = 0; i < count; i++) {
    const item = {
      item_name: casual.title,
      selling_price: casual.integer(100, 10000),
      item_quantity: casual.integer(1, 1000),
      item_category: casual.random_element([
        "Electronics",
        "Clothing",
        "Books",
        "Home Decor",
      ]),
      item_image: casual.random_element([
        "image1.jpg",
        "image2.jpg",
        "image3.jpg",
      ]),
      item_available_from: casual.date("YYYY-MM-DD"),
      user_id: userId,
    };

    try {
      await pool.query("INSERT INTO Item SET ?", item);
      console.log("Item inserted:", item);
    } catch (error) {
      console.error("Error inserting item:", error);
    }
  }
}
export async function deleteItemsByUserId(userId) {
  try {
    await pool.query("DELETE FROM Item WHERE user_id = ?", [userId]);
    console.log("Items deleted for user with id:", userId);
  } catch (error) {
    console.error("Error deleting items:", error);
  }
}

//Working Functions
//Sign In fucntion
export async function getUserDetails(loginId) {
  let phoneNo = parseInt(loginId);
  if (!isNaN(phoneNo)) {
    // console.log("Login Through Phone Number");
    const [rows] = await pool.query(
      `SELECT * FROM user WHERE phone_number = ${phoneNo}`
    );
    return rows;
  }
  //   console.log("Login Through Email");
  const [rows] = await pool.query(
    `SELECT * FROM user WHERE email = '${loginId}'`
  );
  return rows;
}

//Sign Up Function
export async function signupUser(name, email, phone_number, encryptPass) {
  try {
    const [existingUsers] = await pool.query(
      `SELECT * FROM user WHERE email = '${email}' OR phone_number = ${phone_number}`
    );

    if (existingUsers.length > 0) {
      return "User already exists"; // User already exists
    }

    await pool.query(
      `INSERT INTO user (name, email, phone_number, password) VALUES ('${name}', '${email}', ${phone_number}, '${encryptPass}')`
    );

    return "User Signed Up"; // User successfully signed up
  } catch (error) {
    console.log(error);
    return "Error"; // Error occurred during signup
  }
}

export async function getUserIdByEmail(email) {
  try {
    const [result] = await pool.query(
      `SELECT id FROM user WHERE email = '${email}'`
    );
    return result[0].id;
  } catch (error) {
    console.log(error);
    return null; // Error occurred
  }
}

//Updates user Data
export async function updateUser(userId, updatedData) {
  try {
    const keys = Object.keys(updatedData);
    const values = Object.values(updatedData);

    const placeholders = keys.map((key) => `${key} = ?`).join(", ");

    const query = `UPDATE user SET ${placeholders} WHERE id = ?`;

    const params = [...values, userId];

    const result = await pool.query(query, params);

    // Check the affected row count to determine if the update was successful
    if (result.rowCount === 1) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

export async function getItemsByUserId(userId, page, pageSize) {
  try {
    const offset = (page - 1) * pageSize;
    const query = "SELECT * FROM Item WHERE user_id = ? LIMIT ? OFFSET ?";
    const [rows] = await pool.query(query, [
      userId,
      Number(pageSize),
      Number(offset),
    ]);
    return rows;
  } catch (error) {
    console.error("Error retrieving items:", error);
    throw error;
  }
}

export async function getItemCountByUserId(userId) {
  try {
    const query = "SELECT COUNT(*) as count FROM Item WHERE user_id = ?";
    const [rows] = await pool.query(query, [userId]);
    return rows[0].count;
  } catch (error) {
    console.error("Error retrieving item count:", error);
    throw error;
  }
}

export async function addItem(item) {
  const { name, price, category, availability, quantity, userId } = item;

  const query = `INSERT INTO Item (user_id, item_name, selling_price, item_quantity, item_category, item_available_from)
                     VALUES (?, ?, ?, ?, ?, ?)`;

  const values = [userId, name, price, quantity, category, availability];

  try {
    const [result] = await pool.query(query, values);
    console.log("Item added successfully");
    return true;
  } catch (error) {
    console.error("Error inserting item:", error);
    throw error;
  }
}

export async function updateItem(item) {
  const { id, name, price, category, availability, quantity, userId } = item;

  const query = `UPDATE Item SET item_name = ?, selling_price = ?, item_quantity = ?, item_category = ?, item_available_from = ?
                   WHERE id = ? AND user_id = ?`;

  const values = [name, price, quantity, category, availability, id, userId];

  try {
    const [result] = await pool.query(query, values);
    if (result.affectedRows === 0) {
      console.log("Item not found or does not belong to the user");
    } else {
      console.log("Item updated successfully");
    }
  } catch (error) {
    console.error("Error updating item:", error);
    throw error;
  }
}

export async function deleteItem(itemId, userId) {
  const query = `DELETE FROM Item WHERE id = ? AND user_id = ?`;

  try {
    const [result] = await pool.query(query, [itemId, userId]);
    if (result.affectedRows === 0) {
      console.log("Item not found or does not belong to the user");
    } else {
      console.log("Item deleted successfully");
    }
  } catch (error) {
    console.error("Error deleting item:", error);
    throw error;
  }
}
