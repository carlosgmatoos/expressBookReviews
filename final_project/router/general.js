const express = require('express');
let books = require("./booksdb.js"); // Importar los libros desde booksdb.js
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Obtener la lista de libros usando Promesas
public_users.get('/', function (req, res) {
    // Simular una operación asíncrona devolviendo una Promesa
    new Promise((resolve, reject) => {
        if (books) {
            resolve(books); // Resolver la Promesa con la lista de libros
        } else {
            reject("Books not found"); // Rechazar la Promesa si no hay libros
        }
    })
    .then(data => {
        res.status(200).json(data); // Enviar la lista de libros como respuesta
    })
    .catch(err => {
        res.status(500).json({ message: err }); // Manejar errores si la Promesa falla
    });
});

// Obtener detalles del libro basado en ISBN usando Promesas
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn; // Obtener el ISBN de los parámetros de la solicitud

    // Simular una operación asíncrona con Promesas
    new Promise((resolve, reject) => {
        const book = books[isbn]; // Buscar el libro en la base de datos
        if (book) {
            resolve(book); // Resolver la Promesa si se encuentra el libro
        } else {
            reject("Book not found"); // Rechazar la Promesa si no se encuentra
        }
    })
    .then(book => {
        res.status(200).json(book); // Enviar los detalles del libro como respuesta
    })
    .catch(err => {
        res.status(404).json({ message: err }); // Manejar errores si la Promesa falla
    });
});

// Obtener detalles del libro basado en el autor usando async/await
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author; // Obtener el nombre del autor de los parámetros de la solicitud

    try {
        const booksByAuthor = await new Promise((resolve, reject) => {
            const foundBooks = Object.values(books).filter(
                book => book.author.toLowerCase() === author.toLowerCase()
            );

            if (foundBooks.length > 0) {
                resolve(foundBooks); // Resolver la Promesa si se encuentran libros
            } else {
                reject("No books found by this author"); // Rechazar la Promesa si no se encuentran libros
            }
        });

        // Enviar los libros como respuesta
        res.status(200).json(booksByAuthor);
    } catch (error) {
        // Manejar errores si la Promesa falla
        res.status(404).json({ message: error });
    }
});

// Obtener detalles del libro basado en el título usando async/await
public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title; // Obtener el título de los parámetros de la solicitud

    try {
        const booksByTitle = await new Promise((resolve, reject) => {
            const foundBooks = Object.values(books).filter(
                book => book.title.toLowerCase().includes(title.toLowerCase())
            );

            if (foundBooks.length > 0) {
                resolve(foundBooks); // Resolver la Promesa si se encuentran libros
            } else {
                reject("No books found with this title"); // Rechazar la Promesa si no se encuentran libros
            }
        });

        // Enviar los libros como respuesta
        res.status(200).json(booksByTitle);
    } catch (error) {
        // Manejar errores si la Promesa falla
        res.status(404).json({ message: error });
    }
});

// Obtener reseñas de un libro basado en ISBN
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    if (books[isbn]) {
        res.status(200).json(books[isbn].reviews);
    } else {
        res.status(404).json({ message: "Book not found or no reviews available" });
    }
});

module.exports.general = public_users;
