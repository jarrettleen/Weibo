
var express = require('express');

var router = express.Router();

var User = require('../models/User');
var Category = require('../models/Category');
var Content = require('../models/Content');

router.use(function (req,res,next) {
   if(!req.userInfo.isAdmin){
       res.send('对不起只有管理员才能登陆后台管理系统！');
       return;
   }
   next();
});

/**
 * 首页
 * **/

router.get('/',function(req,res,next){
    res.render('admin/index',{
        userInfo : req.userInfo
    });
});

/**
 * 用户管理
 *
 * limit(Number);限制获取的数据条数
 *
 * skip();忽略数据的条数
 * **/

router.get('/user',function (req,res) {

    var page = Number(req.query.page || 1);
    var limit = 10;
    var pages = 0;

    User.count().then(function (count) {

        //计算总页数
        pages = Math.ceil(count / limit);
        //取值不能超过pages
        page = Math.min( page,pages );
        //取值不能小于1
        page = Math.max( page,1 );

        var skip = (page - 1) * limit;


        User.find().limit(limit).skip(skip).then(function (users) {
            res.render('admin/user_index',{
                userInfo:req.userInfo,
                users:users,

                count,
                page,
                pages,
                limit
            })
        });
    });

});

/**
 * 分类首页
 * **/

router.get('/category',function (req,res,next) {
    var page = Number(req.query.page || 1);
    var limit = 10;
    var pages = 0;

    Category.count().then(function (count) {

        //计算总页数
        pages = Math.ceil(count / limit);
        //取值不能超过pages
        page = Math.min( page,pages );
        //取值不能小于1
        page = Math.max( page,1 );

        var skip = (page - 1) * limit;

        /**
         * sort
         * 1代表升序
         * -1代表降序
         * **/

        Category.find().sort({_id:-1}).limit(limit).skip(skip).then(function (categories) {
            res.render('admin/category_index',{
                userInfo:req.userInfo,
                categories:categories,

                count,
                page,
                pages,
                limit
            })
        });
    });
});


/**
 * 分类添加
 * **/
router.get('/category/add',function (req,res,next) {
    res.render('admin/category_add',{
        userInfo:req.userInfo
    })
});

/**
 * 分类的保存
 * **/

router.post('/category/add',function (req,res,next) {

    var name = req.body.name || '';
    if(name == ''){
        res.render('admin/error',{
            userInfo:req.userInfo,
            massage:'名称不能为空'
        });
        return;
    }

    //数据库中是否存在同名分类名称

    Category.findOne({
        name
    }).then(function (rs) {
        if( rs ){
            //数据库中已经存在该分类
            res.render('admin/error',{
                userInfo:req.userInfo,
                massage:'已存在该分类'
            });
            return Promise.reject();
        } else {
            //数据库不存在该分类，可以保存
            return new Category ({
                name
            }).save();
        }
    }).then(function (newCategory) {
        res.render('admin/success',{
            userInfo:req.userInfo,
            massage:'保存成功',
            url:'/admin/category'
        })
    })

});

/**
 * 分类修改
 * **/

router.get('/category/edit', function(req, res) {

    //获取要修改的分类的信息,并且用表单的形式展现
    var id = req.query.id || '';
    Category.findOne({
        _id: id
    }).then(function (category) {
        if(!category){
            res.render('admin/error',{
                userInfo:req.userInfo,
                massage:'分类信息不存在'
            });
            return Promise.reject();
        } else {
            res.render('admin/category_edit',{
                userInfo:req.userInfo,
                category:category
            })
        }
    })

});

/**
 * 分类修改保存
 * **/

router.post('/category/edit',function (req,res) {

    var id = req.query.id || '';

    var name = req.body.name || '';

    Category.findOne({
        _id: id
    }).then(function (category) {
        if(!category){
            res.render('admin/error',{
                userInfo:req.userInfo,
                massage:'分类信息不存在'
            });
            return Promise.reject();
        } else {
            if( name == category.name ){
                res.render('admin/success',{
                    userInfo:req.userInfo,
                    massage:'修改成功',
                    url:'/admin/category'
                });
                return Promise.reject();
            } else {
                return Category.findOne({
                    _id: {$ne: id},
                    name:name
                });
            }
        }
    }).then(function (sameCategory) {
        if(sameCategory){
            res.render('admin/success',{
                userInfo:req.userInfo,
                massage:'数据库中已存在同名分类'
            });
            return Promise.reject();
        } else {
            console.log(id,name);
            Category.update({
                _id : id
            },{
                name : name
            }).then(function () {
                res.render('admin/success',{
                    userInfo:req.userInfo,
                    massage:'修改成功',
                    url:'/admin/category'
                });
            });
        }
    })
});

/**
 * 分类删除
 * **/

router.get('/category/delete',function (req,res) {

    var id = req.query.id || '';
    Category.remove({
        _id : id
    }).then(function () {
        res.render('admin/success',{
            userInfo:req.userInfo,
            massage:'删除成功',
            url:'/admin/category'
        });
    });
});


/**
 * 内容首页
 * **/

router.get('/content',function (req,res) {

    var page = Number(req.query.page || 1);
    var limit = 10;
    var pages = 0;
    Content.count().then(function (count) {

        //计算总页数
        pages = Math.ceil(count / limit);
        //取值不能超过pages
        page = Math.min( page,pages );
        //取值不能小于1
        page = Math.max( page,1 );

        var skip = (page - 1) * limit;

        /**
         * sort
         * 1代表升序
         * -1代表降序
         * **/

        Content.find().sort({_id:-1}).limit(limit).skip(skip).populate(['category', 'user']).then(function (contents) {
            res.render('admin/content_index',{
                userInfo:req.userInfo,
                contents:contents,

                count,
                page,
                pages,
                limit
            })
        });
    });

});


/**
 * 内容添加页面
 * **/

router.get('/content/add',function (req,res) {

    Category.find().sort({_id:-1}).then(function (categories) {
        res.render('admin/content_add',{
            userInfo:req.userInfo,
            categories:categories
        });
    });

});


/**
 * 内容保存
 * **/
router.post('/content/add',function (req,res) {

    if( req.body.category == '' ){
        res.render('admin/error',{
            userInfo:req.userInfo,
            massage:'内容分类不能为空'
        });
        return;
    }

    if( req.body.title == '' ){
        res.render('admin/error',{
            userInfo:req.userInfo,
            massage:'内容标题不能为空'
        });
        return;
    }

    //保存数据到数据库
    new Content({
        category: req.body.category,
        title:req.body.title,
        user:req.userInfo._id.toString(),
        description:req.body.description,
        content:req.body.content
    }).save().then(function () {
        res.render('admin/success',{
            userInfo:req.userInfo,
            massage:'内容保存成功',
            url:'/admin/content'
        });
    })

});

/**
 * 修改内容
 * **/

router.get('/content/edit',function (req,res) {

    var id = req.query.id || '';

    Content.findOne({
        _id: id
    }).populate('category').then(function (content) {
        if(!content){
            res.render('admin/error',{
                userInfo:req.userInfo,
                massage:'指定内容不存在'
            });
            return Promise.reject();
        } else {
            Category.find().then(function (categories) {
                res.render('admin/content_edit',{
                    userInfo:req.userInfo,
                    content:content,
                    categories:categories
                })
            });
        }
    });


});

/**
 * 保存修改内容
 * **/

router.post('/content/edit',function (req,res) {

    var id = req.query.id || '';

    if( req.body.category == '' ){
        res.render('admin/error',{
            userInfo:req.userInfo,
            massage:'内容分类不能为空'
        });
        return;
    }

    if( req.body.title == '' ){
        res.render('admin/error',{
            userInfo:req.userInfo,
            massage:'内容标题不能为空'
        });
        return;
    }

    Content.update({
        _id:id
    },{
        category: req.body.category,
        title:req.body.title,
        description:req.body.description,
        content:req.body.content
    }).then(function () {
        res.render('admin/success',{
            userInfo:req.userInfo,
            massage:'修改成功',
            url:'/admin/content/edit?id=' + id
        })
    })

});

/**
 * 内容删除
 * **/

router.get('/content/delete',function (req,res) {

    var id = req.query.id || '';

    Content.remove({
        _id : id
    }).then(function () {
        res.render('admin/success',{
            userInfo:req.userInfo,
            massage:'删除成功',
            url:'/admin/content'
        });
    });

});



module.exports = router;