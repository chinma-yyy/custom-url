const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const crypto = require("crypto");
const qrcode = require("qrcode");
const fs = require("fs");
const path = require("path");

const URL = require("./models/urls");

const app = express();

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const router = express.Router();
//Universal
app.get("/", (req, res) => {
  console.log("Hello World");
  res.json({ message: "Success" });
});

//SHorten URL redirect with expiry check
app.get("/:code", (req, res) => {
  code = req.params.code;
  URL.findOne({ code: code }, (err, url) => {
    if (err) {
      console.log(err);
    }
    if (url) {
      url.clicks++;
      url.save();
      if (url.expiry && url.expiry != null) {
        if (url.expiry < Date.now()) {
          return res.status(404).json("URL expired");
        }
      }
      // res.json({ URL: url.original_url });
      return res.redirect(url.original_url);
    } else {
      return res.status(404).json("No URL found");
    }
  });
});

//Get clicks
app.get("/:code/clicks", (req, res) => {
  code = req.params.code;
  URL.findOne({ code: code }, (err, url) => {
    if (err) {
      console.log(err);
    }
    if (url) {
      res.json({ clicks: url.clicks });
    } else {
      return res.status(404).json("No URL found");
    }
  });
});

//Api to create a short url wihout expiry
app.post("/api", (req, res) => {
  const url = req.query.link;
  const newUrl = new URL({
    original_url: url,
    code: req.query.code || crypto.randomBytes(6).toString("hex"),
  });
  console.log(newUrl);
  newUrl.save((err) => {
    if (err) {
      console.log(err.keyValue);
      return res.json({ message: "Code already exists" });
    }
    let shorten = process.env.BASE_URL + "/" + newUrl.code;
    return res.json({ URL: shorten });
  });
});

app.post("/create", (req, res) => {
  console.log(req.body.code);
  //Set expiry date
  const newUrl = new URL({
    original_url: req.body.url,
    code: req.body.code || crypto.randomBytes(6).toString("hex"),
    expiry: req.query.expiry || null,
  });
  console.log("created with expiry");

  newUrl.save((err) => {
    if (err) {
      console.log(err.keyValue);
    }
  });
  let shorten = process.env.BASE_URL + "/" + newUrl.code;
  // const filePath = path.join(__dirname, 'logo.png');
  // console.log(filePath)
  // res.json({ URL: shorten });
  // if (req.query.qr) {
  //     //     //Generate QR code
  //     qrcode.toBuffer(req.body.url, {
  //         color: {
  //             dark: '#000000',  // QR code color
  //             light: '#ffffff'  // Background color
  //         },
  //         width: 400,
  //         margin: 1
  //     }, function (err, buffer) {
  //         if (err) throw err;
  //         res.set('Content-Type', 'image/png');
  //         res.send(buffer);
  //         // console.log(buffer);
  //     });
  // }
  res.json({ URL: shorten });
});
mongoose.set("strictQuery", true);
mongoose.connect(process.env.MONGODB_URL).then(() => {
  app.listen(3000);
  console.log("Server is running on port 3000");
});
