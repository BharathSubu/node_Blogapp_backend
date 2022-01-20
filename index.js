const express = require("express")
const mongoose = require("mongoose")
const app = express()
const port = process.env.port || 3000

//Creating a connection

mongoose.connect("mongodb+srv://bharathsubu:12345%40asd@cluster0.ndhcf.mongodb.net/Blog_App?retryWrites=true&w=majority" ,

{    useNewUrlParser: true,
    // useCreateIndex: true, depricated
    useUnifiedTopology: true,
})
 
const connection = mongoose.connection;
connection.once("open",()=>{
    console.log("MongoDb connected");
})
//Db connected

//middleware
app.use(express.json()); //decode our json data

const userRouter = require("./routes/user");
app.use("/user",userRouter);
//middleware

app.route("/").get((req,res)=> res.json("Your First rest api"));

app.listen(port , ()=>console.log("Your server is connected in the port" , port));

