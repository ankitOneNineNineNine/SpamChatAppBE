const jwt = require('jsonwebtoken');

const authenticate = (req,res,next) =>{
    const token = req.headers['Authorization'];
    console.log(token);
    
}
module.exports = authenticate