const jwt = require('jsonwebtoken')
const registerManager = require('../source/models/register')

const auth = (req,res,next)=>{
    try {
     const token = req.cookies.jwt
     if(token){
       jwt.verify(token,process.env.SECRET_KEY,async(err,decodetoken)=>{
           if(err){
              res.redirect('/login')
           }
           else{
            const user = await registerManager.findOne({_id:decodetoken._id})
            req.user = user
            next()
           }
       })
     }
     else{
        res.redirect('/login')
     }

    } catch (error) {
        console.log(error)
        res.send(error)
    }
}

module.exports = auth