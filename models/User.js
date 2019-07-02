var mongoose = require('mongoose');
var userSchema = require('../schemas/users');

module.exports = mongoose.model('user',userSchema);