
var express = require('express');

var router = express.Router();

var User = require('../models/User');

//统一返回格式
var responseData;

router.use(function (req,res,next) {
    responseData = {
        code:0,
        message:''
    };

    next();
});

/**
 * 用户注册
 *
 *  注册逻辑
 *
 *  1.用户名不能为空
 *  2.密码不能为空
 *  3.2次密码必须一致
 *
 *  1.用户是否已经被注册
 *      数据库查询
 * */

router.post('/user/register',function(req,res,next){
    var username = req.body.username;
    var password = req.body.password;
    var repassword = req.body.repassword;

    //用户名不能为空
    if(username == ''){
        responseData.code = 1;
        responseData.message = '用户名不能为空';
        res.json(responseData);
        return;
    }

    //密码不能为空
    if(password == ''){
        responseData.code = 2;
        responseData.message = '密码不能为空';
        res.json(responseData);
        return;
    }

    //两次密码是否一致
    if(password != repassword){
        responseData.code = 3;
        responseData.message = '两次密码不一致';
        res.json(responseData);
        return;
    }

    //用户名是否已经被注册了，如果数据库中已存在了和我要注册的用户名同名的数据，表示用户名已经被注册了
    User.findOne({
        username:username
    }).then(function (userInfo) {
        if(userInfo){
            //表示数据库中有该记录
            responseData.code = 4;
            responseData.message = '该用户已被注册了';
            res.json(responseData);
            return;
        };

        //保存用户信息到数据库
        var user = new User({
            username:username,
            password:password
        });

        return user.save();
        // responseData.userInfo = {};
    }).then(function (newUserInfo) {
        // console.log(newUserInfo,req.body);
        responseData.message = '注册成功';
        req.cookies.set('userInfo',JSON.stringify({
            _id : newUserInfo._id,
            username : newUserInfo.username
        }));
        res.json(responseData);
    });
});

router.post('/user/login',function(req,res,next){
    var username = req.body.username;
    var password = req.body.password;

    if( username == '' || password == ''){
        responseData.code = 1;
        responseData.message = '用户名或者密码不能为空';
        res.json(responseData);
        return;
    }

    User.findOne({
        username:username,
        password:password
    }).then(function (userInfo) {
        if( !userInfo ){
            responseData.code = 2;
            responseData.message = '用户名或者密码错误';
            res.json(responseData);
            return
        }

        responseData.code = 0;
        responseData.message = '登录成功';
        responseData.userInfo = {
            _id : userInfo._id,
            username : userInfo.username
        };
        req.cookies.set('userInfo',JSON.stringify({
            _id : userInfo._id,
            username : userInfo.username
        }));
        res.json(responseData);
        return;
    });
});

router.get('/user/logout',function (req,res) {
    req.cookies.set('userInfo',null);
    responseData.message = '退出成功';
    res.json(responseData);
});

module.exports = router;