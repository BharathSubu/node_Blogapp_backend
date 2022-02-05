const express = require("express")
const mongoose = require("mongoose")
const app = express()
const port = process.env.PORT || 3000

//Creating a connection
//mongo cloud
//mongoose.connect("mongodb+srv://bharathsubu:12345%40asd@cluster0.ndhcf.mongodb.net/Blog_App?retryWrites=true&w=majority" ,
//mogo Local
mongoose.connect("mongodb://localhost:27017/myapp?readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false" ,
{ 
    useNewUrlParser: true,
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
app.use("/uploads",express.static("uploads"));
const userRouter = require("./routes/user");
app.use("/user",userRouter);
const profileRoute = require("./routes/profile");
app.use("/profile", profileRoute);
//middleware
data = {
    msg: "Welcome on Bharath Blog App development YouTube video series",
    info: "This is a root endpoint",
    Working: "Documentations of other endpoints will be release soon :)",
    request:
      "Hey if you did'nt subscribed myy YouTube channle please subscribe it",
  };
app.route("/").get((req,res)=> res.json(data));

app.listen(port , ()=>console.log("Your server is connected in the port" , port ));


