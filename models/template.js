const mongoose = require('mongoose');
const Schema = mongoose.Schema;




const templateSchema = new Schema({

    card: [{
        card_name: {
            type: String,
        },
        user_type: {
            type: String,
        },
        card_photo: {
            type: String,
        },
        card_message: {
            type: String,
        }
    }],


})

const temp = mongoose.model('Template', templateSchema);

module.exports = temp;