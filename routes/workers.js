require('dotenv').config();
const auth=require('../middleware/auth');
const Joi=require('joi');
const client = require('twilio')(process.env.accountSid,process.env.twilioToken);
const {uploadLabeledImages,getdescriptorsFromDB}= require('../faceFunc');
const bcrypt=require('bcrypt');
const {Worker, validate}=require('../models/worker');
const express=require('express');
const router=express()

router.get('/all',async(req,res)=>{
    try {
        const workers = await Worker.find().select('_id name mobileNumber address'); 
        res.json({ success: true, data: workers }); 
      } catch (error) {
        res.status(500).json({ success: false, message: error.message });
      }
});

router.post('/signup',async(req,res)=>{ 
    const {error}=validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    let worker=await Worker.findOne({email: req.body.email});
    if(worker) return res.status(400).send("Already registered");

    const username = generateUsername();
    const password = generatePassword();
    const mobileNumber=req.body.mobileNumber;

    const File1=req.files.File1.tempFilePath;
    const File2=req.files.File2.tempFilePath;
    const File3=req.files.File3.tempFilePath;

    let descriptions= await uploadLabeledImages([File1,File2,File3]);
    if(!descriptions){
        res.json({message:"Something went wrong"});
    }

    worker=new Worker({
        name:req.body.name,
        username:username,
        w_id:req.body.w_id,
        mobileNumber:mobileNumber,
        password:password,
        aadharNo:req.body.aadharNo,
        birth_date:req.body.birth_date,
        address:req.body.address,
        descriptions:descriptions
    });
    const salt=await bcrypt.genSalt(10);
    worker.password=await bcrypt.hash(worker.password,salt);
    // await worker.save();

    worker.save()
        .catch((err) => console.error(err.message))
        .then(()=>{
            client.messages
                .create({
                    body: `
                    Thank You For Registration,
                    Welcome to Shramik,
                    Your Credentials Are:Your username: ${username}, Password: ${password}`,
                    from: '+12298006799',
                    to: mobileNumber
                })
                .then(message => {
                    console.log(message.sid);
                    res.status(200).json({ message: 'Username and Password sent to mobile number' });
                })
                .catch(err => {
                    console.error(err);
                    res.status(500).json({ message: 'Failed to send SMS' });
                });
        });

});

router.post("/check-face",auth,async (req,res)=>{
    const File1=req.files.File1.tempFilePath;
    let result=await getdescriptorsFromDB(File1,req.user._id);

    
    res.json({result});
});

router.post('/signin',async(req,res)=>{
    const {error}=validateLog(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const worker=await Worker.findOne({username: req.body.username});
    if(!worker) return res.status(400).send("Invalid credentials");

    const validPass=await bcrypt.compare(req.body.password, worker.password);
    if(!validPass) return res.status(400).send("Invalid credentials");

    const token=worker.genAuthToken();

    res.header('auth-token',token).send(true);

});

function validateLog(worker){
    const schema=Joi.object({
        username:Joi.string().max(255).required(),
        password:Joi.string().max(100).required()
    });

    return schema.validate(worker)
}

function generateUsername() {
    const numbers = '0123456789';
    
    let username = 'User';
    // Append random numbers of length 4
    for (let i = 0; i < 4; i++) {
        username += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    return username;
}

function generatePassword() {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';

    let password = '';
    
    for (let i = 0; i < 4; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    password += '@';
    
    for (let i = 0; i < 3; i++) {
        password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    return password;
}


module.exports=router;