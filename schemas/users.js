
var mongoose = require('mongoose');

module.exports = new mongoose.Schema({
    //用户名，密码
    username:String,
    password:String,
    isAdmin:{
        type:Boolean,
        default:false
    }
});