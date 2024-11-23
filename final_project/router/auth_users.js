const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Función para validar si un nombre de usuario es válido
const isValid = (username) => { 
  return users.some(user => user.username === username); 
}

// Función para autenticar al usuario con nombre de usuario y contraseña
const authenticatedUser = (username, password) => { 
  const user = users.find(user => user.username === username);
  return user && user.password === password;
}

// Simulando que el usuario 'Carlos' está registrado
users.push({ username: "carlos", password: "contrasena123" });

// Middleware para verificar el token JWT
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Obtener el token del header Authorization

  if (!token) {
    return res.status(403).json({ message: "No token provided" }); // Si no hay token
  }

  // Verificar el token
  jwt.verify(token, 'your_secret_key', (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token" }); // Si el token no es válido o ha expirado
    }
    req.username = decoded.username; // Guardar el username decodificado del token
    next(); // Continuar con la ejecución de la ruta
  });
};

// Ruta para el inicio de sesión de usuarios
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Verificar si el nombre de usuario y la contraseña fueron proporcionados
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  // Verificar si el nombre de usuario existe y si la contraseña es correcta
  const user = users.find(user => user.username === username);
  if (!user || user.password !== password) {
    return res.status(401).json({ message: "Invalid username or password." });
  }

  // Crear un JWT para el usuario autenticado
  const token = jwt.sign({ username }, "your_secret_key", { expiresIn: "1h" });

  // Retornar el token como respuesta
  return res.status(200).json({
    message: "Login successful!",
    token: token // Devolver el token generado
  });
});

// Ruta para agregar o modificar una reseña
regd_users.put("/auth/review/:isbn", verifyToken, (req, res) => {
    const { isbn } = req.params; // Obtener el ISBN del libro de los parámetros de la URL
    const { review } = req.body; // Obtener la reseña del cuerpo de la solicitud
    
    // Verificar si la reseña fue proporcionada
    if (!review) {
      return res.status(400).json({ message: "Review is required." });
    }

    // Obtener el nombre de usuario del token (ya está verificado en el middleware)
    const username = req.username;

    // Si no existe una propiedad 'reviews' en el libro, crearla
    if (!books[isbn].reviews) {
      books[isbn].reviews = {};
    }
  
    // Si el usuario ya ha publicado una reseña sobre este libro, actualizarla
    if (books[isbn].reviews[username]) {
      books[isbn].reviews[username] = review;
    } else {
      // Si el usuario nunca ha reseñado este libro, agregar la reseña
      books[isbn].reviews[username] = review;
    }
  
    // Devolver la reseña actualizada
    return res.status(200).json({
      message: `Review for ISBN ${isbn} has been successfully added/updated.`,
      reviews: books[isbn].reviews
    });
});

// Ruta para eliminar una reseña
regd_users.delete("/auth/review/:isbn", verifyToken, (req, res) => {
    const { isbn } = req.params; // Obtener el ISBN del libro de los parámetros de la URL
    
    // Verificar si el libro tiene reseñas
    if (!books[isbn] || !books[isbn].reviews) {
      return res.status(404).json({ message: "No reviews found for this book." });
    }

    const username = req.username;

    // Verificar si el usuario ya ha publicado una reseña sobre este libro
    if (!books[isbn].reviews[username]) {
      return res.status(403).json({ message: "You cannot delete a review you did not write." });
    }

    // Eliminar la reseña del libro
    delete books[isbn].reviews[username];

    // Devolver un mensaje confirmando que la reseña fue eliminada
    return res.status(200).json({
      message: `Review for ISBN ${isbn} has been successfully deleted.`,
      reviews: books[isbn].reviews
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
