const express = require("express")
const cors = require('cors')
const path =require("path")
const multer = require("multer");
const app = express();

const storage = multer.diskStorage({
  destination:  (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) =>{
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG and PNG files are allowed"), false);
  }
};

const upload = multer({storage, fileFilter});


module.exports = upload;