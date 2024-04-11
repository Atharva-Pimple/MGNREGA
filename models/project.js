const mongoose=require('mongoose');
const Joi=require('joi');


const projectSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    altitude:{
        type:Number,
        required:true
    },
    latitude:{
        type:Number,
        required:true
    },
    description:{
        type:String
    }
});

const Project= mongoose.model('Project',projectSchema);

function validateProject(proj){
    const schema=Joi.object({
        name:Joi.String().required(),
        altitude:Joi.number().required(),
        latitude:Joi.number().required(),
        description: Joi.string()
    });

    return schema.validate(proj);
}

exports.projectSchema=projectSchema;
exports.Project=Project;
exports.valiadte=validateProject;
