const mongoose = require('mongoose');
const Schema = mongoose.Schema;




const templateSchema = new Schema({
    card: [{
        name: {
            type: String
        },
        card_array: [{
            cardtitle: {
                type: String,
            },
            enduser: {
                type: String,
            },
            photo: {
                type: String,
            },
            message: {
                type: String,
            }
        },]
    },]
})

const temp = mongoose.model('Template', templateSchema);

module.exports = temp;