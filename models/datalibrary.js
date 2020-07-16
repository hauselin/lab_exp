var mongoose = require('mongoose');

var dataLibrarySchema = new mongoose.Schema({}, { strict: false });
module.exports = mongoose.model('DataLibrary', dataLibrarySchema);
