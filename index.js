const express = require('express')
const cors = require('cors')
const app = express()
const mongoose = require("mongoose")
const ideaRoute = require("./routes/user.route")
const dotenv = require("dotenv") 
dotenv.config()
const URI = process.env.MONGODB_URI;
const port = process.env.PORT


app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))


mongoose.connect(URI)
.then(()=>{
    console.log("Connected to mongodb");
})
.catch((err)=>{
    console.log("error", err);
    
})






app.use("/", ideaRoute)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
  console.log("Server is runing ");
})