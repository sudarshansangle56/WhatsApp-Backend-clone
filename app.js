const express= require ("express");

const app= express();

app.set("view engin", "ejs");

mongoose.connect("mongodb://localhost:27017/whatapp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
    .then(() => {
      console.log("Connected successfully");
    })
    .catch((err) => {
      console.log("Connection error", err);
    });



app.get("/", (req,res)=>{

    res.send("hey");
})

app.listen("5000");