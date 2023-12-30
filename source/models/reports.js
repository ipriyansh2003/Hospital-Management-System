const mongoose = require('mongoose')

const reportSchema = new mongoose.Schema({
    reportfilepath:{
        type:String,
        required:[true,"file path needed"]
    },
    name:{
        type:String,
        required:[true,"name needed"]
    },
    email:{
        type:String,
        required:[true,"email needed"]
    }
})

const report = new mongoose.model('Report',reportSchema)
module.exports = report