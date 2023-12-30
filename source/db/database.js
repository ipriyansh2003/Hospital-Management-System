const mongoose = require('mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/mydoctor',{
    useNewUrlParser:true,
    useUnifiedTopology:true,
}).then(()=>{
    console.log("connection succesful")
}).catch((err)=>{
    console.log(err)
})