let express = require('express')
let app = express()
let path = require('path')
const hbs = require('hbs')
const multer = require('multer')
const fs = require('fs')
const port = 9000
require('./db/database.js')
require('dotenv').config()
const auth =require('../middleware/auth.js')

const registerManager = require('./models/register.js')
const reportManager=require('./models/reports.js')
const doctorManager = require('./models/doctor.js')
const bookingManager = require('./models/booking.js')

const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const cookieParser=require('cookie-parser')

const dirname=path.resolve(__dirname)
const templatepath = path.join(dirname,"../templates/views")
const partialpath=path.join(dirname,"../templates/partials")

const storage = multer.diskStorage({
    destination:function (req,file,cb){
       return cb(null,'./uploads')
    },
    filename:function (req,file,cb){
        return cb(null,`${Date.now()}-${file.originalname}`)
     },
})
const upload = multer({storage:storage})


app.set('view engine','hbs')
app.set('views',templatepath)
hbs.registerPartials(partialpath)

app.use(express.static('./uploads'))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended:false}))

app.get("/",auth, async(req,res)=>{
    if(req.user.isAdmin){
        res.render('admin.hbs',{
            email:req.user.email
        })
    }
    else{
        const user = req.user
        const userphoneno = user.phone
        const booking = await bookingManager.find({patientphoneno:userphoneno})
        console.log(booking.length)
        let bookingstatus = ``
        for(let i = 0 ; i< booking.length;i++){
        if(booking.length === 0 ){
            bookingstatus += ' You have No booking '
        }
        
        else{
            const status = `${booking[i].bookingstatus}`
            console.log(status)
            if(status === 'Approve'){
               bookingstatus += ' Your Booking Has Been Approved ,'
            }
            else if(status === 'Reject'){
                 bookingstatus += ' Your Booking Has Been Rejected, '
            }
            else if(status === 'Pending'){
               bookingstatus += ' Your Booking request is pending currently ,'
            }
        }
    }
        res.render("index.hbs",{
            email:req.user.email,
            bookingstatus : bookingstatus
        })
    }
   
})

app.get('/admin',auth,(req,res)=>{
    if(req.user.isAdmin){
        res.render('admin.hbs',{
            email:req.user.email
        })
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
                res.render("admin.hbs")
           }
           else{
                
                res.redirect('/')
           }
        }
        else{
            res.clearCookie('jwt')
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
app.get("/reports",auth,(req,res)=>{
    if(req.user.isAdmin){
        res.render('adminreport.hbs',{
            email:req.user.email
        })
    }
    else{
        res.render('reports.hbs',{
            email:req.user.email
        })
    }
    
})

app.post('/upload',upload.single('profileimage'),async(req,res)=>{
    
    const token = req.cookies.jwt
    const verifyuser = jwt.verify(token,process.env.SECRET_KEY)
     
    const user = await registerManager.findOne({_id:verifyuser._id})
    const name = `${user.firstname} ${user.lastname}`
    const email = user.email
    const reports = new reportManager({
        reportfilepath:req.file.filename,
        name:name,
        email:email,
    })
    const registerreports = await reports.save()
    res.redirect('/reports')
})

app.get('/admin/report',auth,(req,res)=>{
   if(req.user.isAdmin){
    res.render('userreport')
   }
    else{
    res.send("not a admin")
    }
})

app.get('/reportapi/:id',auth,async(req,res)=>{
    const id=req.params.id
    const user = await registerManager.find({_id:id})
    const report = await reportManager.find({email:user[0].email}) 
     
    res.json(report)
})

app.post('/delete/:id',async(req,res)=>{
    const id = req.params.id
    const file = await reportManager.findOne({_id:id})
    const deletereport = await reportManager.deleteOne({_id:id})
    
    const filename = file.reportfilepath
    fs.unlink(`C:/Users/my/Desktop/Nodejs/website/hospital(project-4)/uploads/${filename}`, (err) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log('File deleted successfully');
      }
      )
    res.render('userreport')
})

app.get('/userreportapi',async (req,res)=>{
       const data = await registerManager.find({isAdmin:0})
       res.json(data)
})

app.get('/userreport',auth,(req,res)=>{
    if (req.user.isAdmin) {
        res.render('userreport.hbs')
    }
    else{
        res.send("you are admin")
    }  
})

app.get('/userreport/:id',auth,async(req,res)=>{
   const id = req.params.id
    res.render('adminreport.hbs',{
        id:id
    })

})
app.get('/admin/doctor',auth,(req,res)=>{
    res.render('admindoctor.hbs')
})

app.get('/adddoctor',auth,(req,res)=>{
    res.render('adddoctor.hbs')
})

app.get('/doctorapi',async(req,res)=>{
    const data = await doctorManager.find()
    res.json(data)
})

app.post('/adddoctor',async(req,res)=>{
     try {
        const doctorregister = new doctorManager({
            firstname:req.body.firstname,
            lastname:req.body.lastname,
            email:req.body.email,
            address:req.body.address,
            phone:req.body.phone,
            gender:req.body.gender,
            specialization:req.body.specialization,
            experience:req.body.experience,
            feesperconsultation:req.body.feesperconsultation,
            description:req.body.description
        })
        const registered = await doctorregister.save()
        res.redirect('/admin/doctor')
       
     } catch (error) {
         console.log(error)
         res.send(error)
     }
})

app.post('/delete-doctor/:id',async(req,res)=>{
    const id = req.params.id
    const deletedoctor = await doctorManager.deleteOne({_id:id})
    res.redirect('/admin/doctor')
})

app.get('/doctorapi/:id',async(req,res)=>{
    const id = req.params.id
    const doctor = await doctorManager.find({_id:id})
    res.json(doctor)
})


app.get('/booking/:id',auth,async(req,res)=>{
     
    const id = req.params.id
    const doctor = await doctorManager.find({_id:id})
     
    console.log(doctor[0]._id)
    res.render('booking.hbs',{
        id1:doctor[0]._id,
    })

})

app.post('/booking/:id',auth,async(req,res)=>{
    const id = req.params.id
    const doctor = await doctorManager.find({_id:id})
    const user = req.user
   
    const doctorname = `${doctor[0].firstname} ${doctor[0].lastname}`
    const username = `${user.firstname} ${user.lastname}`
    const bookingregister = new bookingManager({
        doctorname: doctorname,
        doctoremail:doctor[0].email,
        patient:username,
        patientphoneno:user.phone,
        bookingdate:req.body.bookingdate,
        bookingstatus:'Pending'
    })
    const registered = await bookingregister.save()
    res.redirect('/')
})

app.post('/delete-booking/:id',async(req,res)=>{
    const id = req.params.id
    const deletebooking = await bookingManager.deleteOne({_id:id})
    res.redirect('/admin')
})

app.post('/approve-booking/:id',async(req,res)=>{
    const id = req.params.id 
    const updatebooking = await bookingManager.updateOne({_id:id},{$set:{bookingstatus:"Approve"}})
    res.redirect('/admin')
})
app.post('/reject-booking/:id',async(req,res)=>{
    const id = req.params.id 
    const updatebooking = await bookingManager.updateOne({_id:id},{$set:{bookingstatus:"Reject"}})
    res.redirect('/admin')
})

app.get('/bookingapi',async(req,res)=>{
    const data = await bookingManager.find()
    res.json(data)
})


app.listen(port,()=>{
    console.log("server running")
})