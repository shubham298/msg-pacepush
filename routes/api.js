const express = require('express')
const router = express.Router();
var OneSignal = require('onesignal-node');
var myClient = require('../config.js')
const Add = require('../models/segment')

router.get('/', (req, res) => res.send('Hello World!'))
//@type     POST
//@route    /api/message
//@desc     just for testing
//@access   PUBLIC
router.post('/message', function (req, res) {
    //it save() and creates req.body
    res.send(req.body);
    // we need to create a notification to send      
    var firstNotification = new OneSignal.Notification({
        contents: {
            en: req.body.messages,
            tr: "Test mesajı"
        }
    });

    // set target users
    if (req.body.user == 1) {
        firstNotification.postBody["excluded_segments"] = ["Banned Users"];
        firstNotification.postBody["included_segments"] = ["Active Users"];
    }
    else {
        firstNotification.postBody["included_segments"] = ["Banned Users"];
        firstNotification.postBody["excluded_segments"] = ["Active Users"];
    }


    // set notification parameters      
    firstNotification.postBody["data"] = { "abc": "123", "foo": "bar" };


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

        res.send(record);
        console.log(filterarr)

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
//@desc     just for testing
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
        filters: [

            { "field": "tag", "key": "long", "relation": ">", "value": longitude - radius },
            { "operator": "AND" },
            { "field": "tag", "key": "long", "relation": "<", "value": longitude + radius },
            { "operator": "AND" },
            { "field": "tag", "key": "lat", "relation": ">", "value": latitude - radius },
            { "operator": "AND" },
            { "field": "tag", "key": "lat", "relation": "<", "value": latitude + radius }
        ]
        // { "operator": "OR" },
        // { "field": "tag", "key": "long", "relation": "<", "value": 100 },
        //{ "field": "tag", "key": "lat", "relation": ">", "value": latitude },
        // { "operator": "OR" },
        // { "field": "tag", "key": "lat", "relation": "<", "value": 100 },
        // // { "operator": "OR" },
        //     { "field": "tag", "key": "banned", "relation": "!=", "value": "true" },
        // { "operator": "OR" }, { "field": "tag", "key": "is_admin", "relation": "=", "value": "true" },
        // { field: "location", lat: 13, long: 74, radius: "1000000", }
        //{ field: "session_count", "relation":">","value":1 }
        // { "field": "tag", "key": "radius", "relation": "=", "value": "100000" },


    });


    myClient.sendNotification(firstNotification)
        .then(function (response) {
            console.log(response.data, response.httpResponse.statusCode);
        })
        .catch(function (err) {
            console.log('Something went wrong...', err);
        });
})

module.exports = router;