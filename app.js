const express=require('express');
const bodyParser=require('body-parser');
const mongoose=require('mongoose');
const cors=require('cors');

const app=express();

app.get('/',(req,res)=>{
    console.log("Hello World");
});

app.listen(3000,()=>{
    console.log("Server started on port 3000");
});
