const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Complaint = Schema({
  username: String,
  vechileNo: String,
  report: String,
  coverImage: {
    type: String,
    default: "",
  },
  status : {
      type:String,
      default:"False"
  }
});

module.exports = mongoose.model("Complaint", Complaint);
