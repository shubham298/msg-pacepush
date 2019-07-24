const express = require('express')
var OneSignal = require('onesignal-node');
var bodyparser = require('body-parser')
const mongoose = require('mongoose');
const port = process.env.PORT || 8000;
const app = express()
const routes = require('./routes/api')
const db = "mongodb+srv://shubham:78784512@clusterpush-w5itz.mongodb.net/test?retryWrites=true&w=majority"
//Database connection
mongoose
    .connect(db)
    .then(() => console.log("Mongodb connected succesfully"))
    .catch(err => console.log(err));
//Middleware for bodyparser
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
//CORS CODE
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use('/api', routes);
app.get('/', (req, res) => res.send('Hello World!'))
app.listen(port, () => {
    console.log("App is running on port " + port);
});