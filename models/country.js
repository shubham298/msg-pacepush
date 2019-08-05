const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const messageSchema = new Schema({
    country: String,
})

const message = mongoose.model('country', messageSchema);

module.exports = message;