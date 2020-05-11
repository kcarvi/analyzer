let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let wordSchema = new Schema({
  word:  String,
  description: String
});

module.exports = mongoose.model('Word', wordSchema);
