const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const messageSchema = new Schema({
    message: String,
    segment: String,
    time: String
    
})

const message = mongoose.model('message', messageSchema);

module.exports = message;