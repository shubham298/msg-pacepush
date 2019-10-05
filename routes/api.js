const express = require('express')
const router = express.Router();
var OneSignal = require('onesignal-node');
var client = require('../config.js')
const Add = require('../models/segment')
const Template = require('../models/template')
const temparr = require('../models/temparr')
const Messages = require('../models/message')
const Country = require('../models/country')
let moment = require("moment-timezone");
var schedule = require('node-schedule');
const request = require('request');
router.get('/', (req, res) => res.send('Hello World!'))
//@type     POST
//@route    /api/message
//@desc     just for testing
//@access   PUBLIC
router.post('/message', function (req, res) {
    //it save() and creates req.body
    // we need to create a notification to send      
    var firstNotification = new OneSignal.Notification({
        contents: {
            en: req.body.messages,
            tr: "Test mesajı"
        }
    });
    var segment = ''
    // set target users
    if (req.body.user == 1) {
        segment = 'Active User'
        firstNotification.postBody["excluded_segments"] = ["Banned Users", "Inactive Users"];
        firstNotification.postBody["included_segments"] = ["Active Users"];
    }
    else if (req.body.user == 2) {
        segment = 'Banned User'
        firstNotification.postBody["included_segments"] = ["Banned Users"];
        firstNotification.postBody["excluded_segments"] = ["Active Users", "Inactive Users"];
    }
    else {
        segment = 'Inactive User'
        firstNotification.postBody["included_segments"] = ["Inactive Users"];
        firstNotification.postBody["excluded_segments"] = ["Active Users", "Banned Users"];
    }

    // set notification parameters      
    firstNotification.postBody["data"] = { "abc": "123", "foo": "bar" };
    var myDateString = Date();
    Messages.create({ message: req.body.messages, segment: segment, time: myDateString }).then(function (record) {
        res.send(record);
    })

    client.sendNotification(firstNotification)
        .then(function (response) {
            console.log(response.data, response.httpResponse.statusCode);
        })
        .catch(function (err) {
            console.log('Something went wrong...', err);
        });
})
//@type     POST
//@route    /api/addSegment
//@desc     just for testing
//@access   PUBLIC
router.post('/addSegment', function (req, res, next) {

    Add.findOne({ name: req.body.name }).then(function (record, err) {
        if (err) throw err;

        if (record) {
            for (var i = 0; i < req.body.type.length; i++) {
                record.type.push({
                    field: req.body.type[i].field,
                    key: req.body.type[i].key,
                    relation: req.body.type[i].relation,
                    value: req.body.type[i].value,
                    operator: req.body.type[i].operator
                })
            }
            record.save();
            res.send(record);

        }
        else {
            Add.create(req.body).then(function (add) {
                res.send(add)
            }).catch(next);
        }
    }
    )
        .catch(next);
})
//@type     POST
//@route    /api/messagesegment
//@desc     just for testing
//@access   PUBLIC
router.post('/messagesegment', function (req, res, next) {
    var filterarr = [];
    var fillarr = {};
    var opp = {};


    Add.findOne({ name: req.body.name }).then(function (record, err) {
        if (err) throw err;
        var j = 1;
        for (var i = 0; i < record.type.length; i++) {
            fillarr.field = record.type[i].field;
            if (record.type[i].field == "null") { fillarr.key = record.type[i].key; }
            fillarr.relation = record.type[i].relation;
            fillarr.value = record.type[i].value;
            if (j < record.type.length) {
                opp.operator = record.type[i].operator;
                j++;
            }
            if (j == 1)
                filterarr.push(fillarr);
            else
                filterarr.push(fillarr, opp);
        }


        var myDateString = Date();
        Messages.create({ message: req.body.messages, segment: req.body.name, time: myDateString }).then(function (record) {
            res.send(record);
        })
        var firstNotification = new OneSignal.Notification({
            contents: {
                en: req.body.messages,
                tr: "Test mesajı"
            },
            filters: filterarr

        });

        client.sendNotification(firstNotification)
            .then(function (response) {
                console.log(response.data, response.httpResponse.statusCode);
            })
            .catch(function (err) {
                console.log('Something went wrong...', err);
            });

    }).catch(next);


})

//@type     POST
//@route    /api/location
//@desc     trigger geo-location notification
//@access   PUBLIC
router.post('/location', function (req, res, next) {
    console.log(req.body)
    console.log(req.body.radius)
    var latitude = req.body.lat
    var longitude = req.body.lng
    var msg = req.body.message
    var radius = req.body.radius / 111
    console.log(latitude + radius)
    console.log(latitude - radius)
    console.log(longitude + radius)
    console.log(longitude - radius)
    var data = {
        latitude, longitude, radius, msg
    }
    res.send(data);
    var firstNotification = new OneSignal.Notification({
        contents: {
            en: msg,
            tr: "Test mesajı"
        },
        headings: { "en": "Geo-location notification" },

        chrome_web_icon: "https://s3.amazonaws.com/myamcatimages/company/images/12365.png",


        web_buttons: [
            {
                "id": "like-button", "text": "Like", "icon": "http://i.imgur.com/N8SN8ZS.png", "url": "https://pacewisdom.com"
            },
            {
                "id": "read-more-button", "text": "Read more", "icon": "http://i.imgur.com/    MIxJp1L.png", "url": "https://www.accuweather.com/en/in/india-weather"
            }],
        filters: [
            { "field": "tag", "key": "long", "relation": ">", "value": longitude - radius },
            { "operator": "AND" },
            { "field": "tag", "key": "long", "relation": "<", "value": longitude + radius },
            { "operator": "AND" },
            { "field": "tag", "key": "lat", "relation": ">", "value": latitude - radius },
            { "operator": "AND" },
            { "field": "tag", "key": "lat", "relation": "<", "value": latitude + radius },
            // { field: "location", lat: 13, long: 74, radius: "100000000", }
        ]
    });


    client.sendNotification(firstNotification)
        .then(function (response) {
            console.log(response.data, response.httpResponse.statusCode);
        })
        .catch(function (err) {
            console.log('Something went wrong...', err);
        });
})


//@type     DELETE
//@route    /api/deletesegment
//@desc     delete the segment
//@access   PUBLIC
router.post('/deletesegment', function (req, res, next) {
    Add.findOneAndRemove({ name: req.body.name }).then(function (record, err) {
        if (record)
            res.status(200).send({ record, message: "DELETED THE SEGMENT SUCESSFULLY" });
        else
            res.status(400).send({ message: "NO SUCH SEGMENT FOUND" })
    })

})

//@type     GET
//@route    /api/viewsegment 
//@desc     view all the list of segment
//@access   PUBLIC
router.get('/viewsegment', function (req, res, next) {
    Add.find().then(function (record, err) {
        if (record)
            res.send(record);
        else
            res.send({ message: "NO SUCH SEGMENT FOUND" })
    })

})

//@type     GET
//@route    /api/messagedetails
//@desc     view all the messages sent
//@access   PUBLIC

router.get('/messagedetails', function (req, res, next) {
    Messages.find().then(function (record, err) {
        if (record)
            res.send(record);
        else
            res.send({ message: "NO SUCH SEGMENT FOUND" })
    })
})
//@type     POST
//@route    /api/time
//@desc     just for testing
//@access   PUBLIC
router.post('/time', function (req, res, next) {
    var region = req.body.region
    var rdate = req.body.rdate
    var ccode = req.body.ccode
    var message = req.body.message

    //var frontd = { region, rdate, ccode, message }
    //var test = moment(rdate).format("LT");
    //*************** */time is 0 to 12 am and 12 to 24 pm *****************
    var country = moment.tz(rdate, "YYYY/MM/DD HH:mm", region);
    var india = country.clone().tz("Asia/Kolkata");
    var indiaTime = india.format("LLL")
    var country_time = country.format("YYYY/MM/DD HH:mm");
    var current_india_time = moment().format("YYYY/MM/DD HH:mm")
    var trigger_time = india.format("YYYY/MM/DD HH:mm")

    var date = india.format('l');
    //Time splitting
    var time = india.format('LT')
    //Parsing time array 
    var timearr = time.split(" ")//time array
    if (timearr[1] == "AM") {
        var dn = 0;
    } else {
        dn = 1;
    }
    //Breaking time array
    var exact = timearr[0].split(":")
    var h = parseInt(exact[0], 10)
    var m = parseInt(exact[1], 10)

    //Parsing date array
    var datarr = date.split("/")
    var month = parseInt(datarr[0], 10);
    var day = parseInt(datarr[1], 10);
    var yy = parseInt(datarr[2], 10);

    if (timearr[1] == "PM" && h < 12 && dn == 1) {
        h += 12;
        console.log(h)
    }


    var data = { country, india, indiaTime, current_india_time, country_time, trigger_time, date, timearr, h, m }



    //year ,month,day,hour,minute,second
    var date = new Date(yy, month - 1, day, h, m, dn);

    var j = schedule.scheduleJob(date, function () {

        console.log("triggerd")
        var firstNotification = new OneSignal.Notification({
            contents: {
                en: message,
                tr: "Test mesajı"
            },
            headings: { "en": "Time Based notification" },

            chrome_web_icon: "https://s3.amazonaws.com/myamcatimages/company/images/12365.png",



            web_buttons: [
                {
                    "id": "like-button", "text": "Like", "icon": "http://i.imgur.com/N8SN8ZS.png", "url": "https://pacewisdom.com"
                },
                {
                    "id": "read-more-button", "text": "Read more", "icon": "http://i.imgur.com/    MIxJp1L.png", "url": "https://www.accuweather.com/en/in/india-weather"
                }],
            filters: [
                { field: "country", relation: "=", value: ccode }
            ]

        });

        client.sendNotification(firstNotification)
            .then(function (response) {
                console.log(response.data, response.httpResponse.statusCode);
            })
            .catch(function (err) {
                console.log('Something went wrong...', err);
            });
    });
    console.log(j)
    if (j == null) {
        res.json({ "message": false })
    } else {
        res.send(data)
    }
})

//@type     GET
//@route    /api/countrydetails
//@desc     view all the country to send the messages
//@access   PUBLIC

router.get('/countrydetails', function (req, res, next) {
    Country.find().then(function (record, err) {
        if (record)
            res.send(record);

        else
            res.send({ message: "NO SUCH country FOUND" })
    })
})

//@type     POST
//@route    /api/addCountry
//@desc     route for adding country
//@access   PRIVATE
router.post("/addCountry",
    (req, res) => {
        const newCountry = new Country({
            country: req.body.country,
            isocode: req.body.isocode
        })
        newCountry
            .save()
            .then(question => res.json(question))
            .catch(err => console.log("unable to push question into the database " + err));
    })


//@type     GET
//@route    /api/viewdevices
//@desc     route for get all the devices status
//@access   PRIVATE
router.get("/viewdevices", (req, res1) => {

    console.log(client.app.appId)
    request('https://onesignal.com/api/v1/players?app_id=' + client.app.appId, {
        headers: {
            'Content-type': 'application/json',
            'Authorization': 'Basic ' + client.app.appAuthKey
        },

    }, (err, res, body) => {
        if (err) { return console.log(err); }
        console.log(body);
        res1.send(body)
    });
})


//@type     POST
//@route    /api/card
//@desc     route for creating the first card
//@access   PRIVATE
router.post("/addcard",
    (req, res) => {
        const newCard = {
            cardtitle: req.body.cardtitle,
            enduser: req.body.enduser,
            photo: req.body.photo,
            message: req.body.message,
        };
        const final = {
            name: req.body.name,
            card_array: newCard,
        }

        const newTemp = new Template({
            id: req.body.id,

        })
        newTemp.card.unshift(final);
        // newTemp.card.unshift(newCard)
        newTemp
            .save()
            .then(question => res.json(question))
            .catch(err => console.log("unable to push card into the database " + err));
    })



//@type     POST
//@route    /api/card_details
//@desc     appending the card details by taking id of first card created by /api/card route
//@access   PRIVATE
router.post("/card_details",
    (req, res) => {
        const newCard = {
            cardtitle: req.body.cardtitle,
            enduser: req.body.enduser,
            photo: req.body.photo,
            message: req.body.message,
        };
        var obTemplate = {
            name: req.body.name,
            card_array: newCard,
        };
        Template.findOneAndUpdate(
            { _id: req.body.id },
            { $push: { card: obTemplate } },
            function (error, success) {
                if (error) {
                    console.log(error);
                } else {
                    res.send(success)
                }
            });

    })

//@type     GET
//@route    /api/templatedetail
//@desc     view all the messages sent
//@access   PUBLIC

router.get('/templatedetail', function (req, res, next) {
    Template.find().then(function (record, err) {
        if (record)
            res.send(record);
        else
            res.send({ message: "NO SUCH SEGMENT FOUND" })
    })
})

//@type     POST
//@route    /api/template
//@desc     sending template notification
//@access   PUBLIC
router.post('/template', function (req, res) {
    //it save() and creates req.body
    // we need to create a notification to send 
    if (!req.body.usertype) { res.send("Please Enter user type") }
    if (!req.body.title) { res.send("Please Enter template title") }
    if (!req.body.web_image) { res.send("Please Enter web_image") }
    if (!req.body.tmessage) { res.send("Please  Enter tmessage") }
    var firstNotification = new OneSignal.Notification({
        contents: {
            en: req.body.tmessage,
        },

        headings: { "en": req.body.title },

        chrome_web_icon: "https://s3.amazonaws.com/myamcatimages/company/images/12365.png",

        included_segments: [req.body.usertype],

        chrome_web_image: req.body.web_image,

        web_buttons: [
            {
                "id": "like-button", "text": "Like", "icon": "http://i.imgur.com/N8SN8ZS.png", "url": "https://pacewisdom.com"
            },
            {
                "id": "read-more-button", "text": "Read more", "icon": "http://i.imgur.com/    MIxJp1L.png", "url": "https://www.accuweather.com/en/in/india-weather"
            }]
    });
    // firstNotification.postBody["excluded_segments"] = ["Banned Users"];
    // firstNotification.postBody["included_segments"] = ["Active Users"];
    res.json("successfull ")
    client.sendNotification(firstNotification)
        .then(function (response) {
            console.log(response.data, response.httpResponse.statusCode);

        })
        .catch(function (err) {
            console.log('Something went wrong...', err);
        });

})


module.exports = router;
