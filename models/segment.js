const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const typeSchema = new Schema({
    field: String,
    key: String,
    relation: String,
    value: String,
    operator: {
        type: String,
        default: "AND"
    }
})

const addSchema = new Schema({
    name: String,
    type: [typeSchema]
})

const add = mongoose.model('add', addSchema);

module.exports = add;