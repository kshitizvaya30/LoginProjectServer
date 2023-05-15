# LoginProjectServer

# Install Dependency
Use "npm install" to install all dependencies

# Run Command 
Use "node app.js" to run the server on localhost 8080 port

//Database Tables
-- User Table
CREATE TABLE user (
  id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  phone_number VARCHAR(20) UNIQUE,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10)
);

-- Item Table
CREATE TABLE Item (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  item_name VARCHAR(255),
  selling_price DECIMAL(10, 2),
  item_quantity INT,
  item_category VARCHAR(100),
  item_image VARCHAR(300),
  item_available_from VARCHAR(255),
  FOREIGN KEY (user_id) REFERENCES user(id)
);
