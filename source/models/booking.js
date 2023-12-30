const mongoose = require('mongoose')

const bookSchema = new mongoose.Schema({
doctorname:{
    type:String,
    required:[true,"doctor name is needed"]
},
bookingstatus:{
    type:String,
    required:[true,"booking status is needed"]
},
bookingdate:{
    type:String,
    required:[true,"phone number is needed"]
},
doctoremail:{
    type:String,
    required:[true,"doctor email is needed"]
},
patient:{
    type:String,
    required:[true,"user is needed"]
},
patientphoneno:{
    type:String,
    required:[true,"address is needed"]
}
})

const book = new mongoose.model('Book',bookSchema)
module.exports = book