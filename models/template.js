const mongoose = require('mongoose');
const Schema = mongoose.Schema;




const addSchema = new Schema({
    tempname: {
        type: String
    },
    user_array: {
        type: [String],
    },
    tdata: {
        title: {
            type: String,
        },
        usertype: {
            type: String,
        },
        web_image: {
            type: String,
        },
        tmessage: {
            type: String,
        }
    }
})

const temp = mongoose.model('Template', addSchema);

module.exports = temp;