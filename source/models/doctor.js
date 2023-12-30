const mongoose = require('mongoose')

const doctorSchema = new mongoose.Schema({
firstname:{
    type:String,
    required:[true,"first name is needed"]
},
lastname:{
    type:String,
    required:[true,"last name is needed"]
},
phone:{
    type:String,
    required:[true,"phone number is needed"]
},
email:{
    type:String,
    required:[true,"email is needed"]
},
gender:{
    type:String,
    required:[true,"gender is needed"]
},
address:{
    type:String,
    required:[true,"address is needed"]
},
specialization:{
    type:String,
    required:[true,"specialization is needed"]
},
experience:{
    type:Number,
    required:[true,"experience is needed"]
},
feesperconsultation:{
    type:Number,
    required:[true,"fees is needed"]
},
description:{
    type:String
}
})

const doctor = new mongoose.model('doctor',doctorSchema)
module.exports = doctor