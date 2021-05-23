const router = require("express").Router();
const UserModel = require("../model/user.model");

router.get('/', function(req,res,next){
    res.status(200).json(req.user)
})


module.exports = router;