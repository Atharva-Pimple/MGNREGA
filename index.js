const config=require('config');
const Joi=require('joi');
const express=require('express');
const app=express();
const mongoose=require('mongoose');

const bdo=require('./routes/bdos')

if(!config.get('jwtPrivateKey')){
    console.error("Fatal error: jwtPrivate key not found");
    process.exit(1);
}

mongoose.connect('mongodb://127.0.0.1/mgnrega')
    .then(()=>console.log("connected Mongodb"))
    .catch(err=>console.error('could not connect mongodb...',err));


app.use(express.json());
app.use('/api/bdo',bdo);


const port=process.env.PORT || 3000;
app.listen(port,()=>console.log(`Listning on port ${port}...`));