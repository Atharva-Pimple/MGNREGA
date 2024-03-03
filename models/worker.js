const mongoose=require('mongoose');
const Joi=require('joi');
const passwordcomplexity=require('joi-password-complexity');

const workerSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        maxlength:255
    },
    phoneNo:{
        type:Number,
        required:true,
        minlength:10,
        maxlength:12,
        unique:true
    },
    password:{
        type:String,
        required:true,
        minlength:8,
        maxlength:100
    },
    aadharNo:{
        type:Number,
        required:true,
        minlength:12,
        maxlength:12,
        unique:true
    }
});

const Worker=mongoose.model('Worker',workerSchema);

const complexityOptions={
    min:8,
    max:100,
    numeric:1,
    Symbol:1
}

function validateWorker(worker){
    const schema=Joi.object({
        name:Joi.string().max(255).required(),
        email:Joi.string().max(255).required().email(),
        password:passwordcomplexity(complexityOptions)
    });

    return schema.validate(worker)
}

exports.Worker=Worker;
exports.validate=validateWorker;