const mongoose = require('mongoose')
const bcrypt  = require('bcryptjs')
const jwt = require('jsonwebtoken')

const registerSchema = new mongoose.Schema({
    firstname:{
        type:String,
        required:[true,'first name required']
    },
    lastname:{
        type:String,
        required:[true,'last name required']
    },
    email:{
        type:String,
        required:[true,'email required'],
        unique:true
    },
    phone:{
        type:String,
        required:[true,'phone required']
    },
    gender:{
        type:String,
        required:[true,'gender required']
    },
    age:{
        type:Number,
        required:[true,'age required']
    },
    password:{
        type:String,
        required:[true,'password needed']
    },
    confirmpassword:{
        type:String,
        required:[true,'confirm password needed']
    },
    isAdmin:{
        type:Number,
        required:[true,"role is required"]
    }
})

registerSchema.methods.generateAuthToken = async function(){
    try {
        const token = jwt.sign({_id:this._id.toString()},process.env.SECRET_KEY)
         await this.save()
         return token
    } catch (error) {
         console.log(error)
         res.send(error)
    }
}

registerSchema.pre('save',async function(next){
if(this.isModified('password'))
{
    this.password = await bcrypt.hash(this.password,10)
    this.confirmpassword=await bcrypt.hash(this.password,10)
}
next()
})

const Register = new mongoose.model('Register',registerSchema)
module.exports = Register