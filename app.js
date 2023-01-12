const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const crypto = require('crypto');
const qrcode = require('qrcode');
const fs = require('fs');
const path = require('path');

const URL = require('./models/urls');

const app = express();

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const router = express.Router();

app.get('/', (req, res) => {
    console.log("Hello World");
    res.json({ message: "Success" });
});

app.get('/:code', (req, res) => {
    code = req.params.code;
    URL.findOne({ code: code }, (err, url) => {
        if (err) {
            console.log(err);
        }
        if (url) {
            url.clicks++;
            url.save();
            if(url.expiry){
                if(url.expiry<Date.now()){
                    return res.status(404).json('URL expired');
                }
            }
            // res.json({ URL: url.original_url });
            return res.redirect(url.original_url);
        }
        else {
            return res.status(404).json('No URL found');
        }
    });
});

app.get('/:code/clicks',(req,res)=>{
    code = req.params.code;
    URL.findOne({ code: code }, (err, url) => {
        if (err) {
            console.log(err);
        }
        if (url) {
            res.json({clicks:url.clicks});
        }
        else {
            return res.status(404).json('No URL found');
        }
    });
})

app.post('/api', (req, res) => {
    const url = req.query.link;
    console.log(url);
    console.log(req.query.code);
    if (!req.query.code) {
        const newUrl = new URL({
            original_url: url,
            code: crypto.randomBytes(6).toString('hex')
        });
        newUrl.save((err) => {
            if (err) {
                console.log(err);
            }
            let shorten = process.env.BASE_URL + '/' + newUrl.code;
            return res.json({ URL: shorten });
        });
    }
    else {
        const newUrl = new URL({
            original_url: url,
            code: req.query.code
        });
        newUrl.save((err) => {
            if (err) {
                console.log(err);
            }
            let shorten = process.env.BASE_URL + '/' + newUrl.code;
            return res.json({ URL: shorten });
        });
    }
    
});

app.post('/create', (req, res) => {
    const filePath = path.join(__dirname, 'logo.png');
    console.log(filePath);
    // if (req.query.qr) {
    //     //Generate QR code
    //     qrcode.toFile('qrCode.png', req.body.url, {
    //         color: {
    //             dark: '#000000',  // QR code color
    //             light: '#ffffff' // Background color
    //         },
    //         logo: 'C://Users//CHINMAY//Onedrive//Desktop//custom url//logo.png',  // path to your logo file
    //         width: 400,
    //         margin: 1
    //     }, function (err) {
    //         if (err) throw err
    //         console.log('done')
    //     })
    // }
    if (req.query.expiry) {
        //Set expiry date
        const newUrl = new URL({
            original_url: req.body.url,
            code: crypto.randomBytes(6).toString('hex'),
            expiry: req.body.expiry
        });
        console.log("created with expiry");
        newUrl.save((err) => {
            if (err) {
                console.log(err);
            }
        });
        let shorten = process.env.BASE_URL + '/' + newUrl.code;
        return res.json({ URL: shorten });
    }
    else {
        const newUrl = new URL({
            original_url: req.body.url,
            code: crypto.randomBytes(6).toString('hex')
        });
    }

});
mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGODB_URL).then(() => {
    app.listen(3000);
    console.log("Server is running on port 3000");
});
