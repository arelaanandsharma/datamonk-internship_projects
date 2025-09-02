CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE
);


INSERT INTO users (name, email) VALUES ('Anand Sharma', 'anand@example.com');
INSERT INTO users (name, email) VALUES ('Test User', 'test@example.com');
