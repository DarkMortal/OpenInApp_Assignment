require('dotenv').config();
const jwt = require('jsonwebtoken');
const {DataModels} = require('../database/database');

function Authenticate(req,res,next){
    let authHeader = req.headers.authorization;
    if(!authHeader){
        res.status(403).send("No auth token provided");
        return;
    }
    let token = authHeader.split(" ")[1];

    if(token && token !== 'j:null'){
        jwt.verify(token.trim(), process.env.ACCESS_TOKEN_SECRET,(err, user)=>{
            if(err) return res.status(403).send("Invalid auth token provided");
            DataModels.user.findOne({
                where: {
                    id: user.id
                }, attributes: ['id', 'phone_number', 'priority']
            }).then(user => {
                if(user){ req.user = user.dataValues; next(); }
                else res.status(403).send("Unauthorized access");
            })
        })
    }else res.status(403).send("Unauthorized access");
}

module.exports.Authenticate = Authenticate;