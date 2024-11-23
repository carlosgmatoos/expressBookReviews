const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req, res, next) {
    // Obtener el token del encabezado Authorization
    const token = req.headers['authorization'];
    
    if (!token) {
        // Si no se proporciona un token, responder con un error 403
        return res.status(403).json({ message: "No token provided" });
    }

    // Verificar y decodificar el token
    jwt.verify(token, "fingerprint_customer", (err, decoded) => {
        if (err) {
            // Si el token no es válido, responder con un error 403
            return res.status(403).json({ message: "Failed to authenticate token" });
        }
        
        // Almacenar los datos decodificados en la solicitud para uso futuro
        req.user = decoded;
        next(); // Continuar al siguiente middleware o controlador
    });
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
