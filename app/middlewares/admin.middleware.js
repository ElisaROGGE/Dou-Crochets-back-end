const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/user.model');
const Role = require('../controllers/role.controller');

const protectAdmin = asyncHandler(
    async(req, res, next) => {
        let token
        if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
            try {
                /* Prendre le jeton de l'en-tête et le diviser en un tableau. Le deuxième élément du
                tableau est le jeton. */
                token = req.headers.authorization.split(" ")[1]
                const decoded = jwt.verify(token, process.env.JWT_SECRET)
                if(decoded.role=='admin'){  
                    next();
                }else{
                    return res.status(401).send("erreur")
                }
            }catch (error){
                console.error(error);
                res.status(401)
                throw new Error("Pas autorisé, token échoué")
            }
        }else if(!token){
            res.status(401)
            throw new Error("Pas autorisé, pas de token")
        }
    }
)

module.exports = protectAdmin;