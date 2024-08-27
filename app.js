const express= require ("express");

const app= express();

app.set("view engin", "ejs");

app.get("/", (req,res)=>{

    res.send("hey");
})

app.listen("5000");