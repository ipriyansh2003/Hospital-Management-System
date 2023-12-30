require('dotenv').config()
let express = require('express')
let app = express()
let path = require('path')
const hbs = require('hbs')
const multer = require('multer')
const port = 9000
require('./db/database.js')
const auth =require('../middleware/auth.js')
const registerManager = require('./models/register.js')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const cookieParser=require('cookie-parser')

const dirname=path.resolve(__dirname)
const templatepath = path.join(dirname,"../templates/views")
const partialpath=path.join(dirname,"../templates/partials")


app.set('view engine','hbs')
app.set('views',templatepath)
hbs.registerPartials(partialpath)


app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended:false}))

app.get("/",auth,(req,res)=>{
    res.render("index.hbs")
})

app.get('/admin',auth,(req,res)=>{
    if(req.user.isAdmin){
        res.render('admin.hbs')
    }
    else{
        res.send("you are not admin")
    }
})


app.get('/register',async(req,res)=>{
    
    const token=req.cookies.jwt
    if(token){
        res.send("you are already loggined")
    }
    else{
        res.clearCookie('jwt')
        res.render('register.hbs')
    }
})

app.post('/register',async(req,res)=>{
try {
    const password = req.body.password
    const cpassword = req.body.confirmpassword

    if(password===cpassword){
       
        const register = new registerManager({
            firstname:req.body.firstname,
            lastname:req.body.lastname,
            email:req.body.email,
            age:req.body.age,
            phone:req.body.phone,
            gender:req.body.gender,
            password:password,
            confirmpassword:cpassword,
            isAdmin:0
        })
      

        const registered = await register.save()
        res.redirect('/login')
    }
    else{
        res.send("password not matched")
    }

} catch (error) {
    console.log(error)
    res.send(error)
}
})

app.get('/registerapi',async(req,res)=>{
    const data = await registerManager.find()
    res.json(data)
})

app.get('/login',async(req,res)=>{
    
    const token=req.cookies.jwt
    if(token){
        res.send("you are already loggined")
    }
    else{
        res.clearCookie('jwt')
        res.render('login.hbs')
    }
})


app.post('/login',async(req,res)=>{
    try {
        const email = req.body.email
        const password = req.body.password
        const useremail= await registerManager.findOne({email:email})
        const isMatch = await bcrypt.compare(password,useremail.password)

        const token=await useremail.generateAuthToken()
        res.cookie('jwt',token)

        if(isMatch){
           if(useremail.isAdmin){
                res.redirect('/admin')
           }
           else{
                res.redirect('/')
           }
        }
        else{
            res.send("invalid email or password")
        } 

    } catch (error) {
        res.send(error)
    }
})
app.get('/logout',(req,res)=>{
    try {
        res.clearCookie('jwt')
        res.redirect('/login')
    } catch (error) {
        console.log(error)
        res.send(error)
    }
})
app.get("/reports",(req,res)=>{
    res.render('reports.hbs')
})

app.listen(port,()=>{
    console.log("server running")
})