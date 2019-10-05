const mongoose = require('mongoose');
const Schema = mongoose.Schema;




const temparrSchema = new Schema({
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
})

const temp = mongoose.model('temparr', temparrSchema);

module.exports = temp;