$(function(){
    var $loginBox = $('#loginBox');
    var $registerBox = $('#registerBox');

    function PreventDefault(e){
        if (e && e.preventDefault) {
            e.preventDefault();
        } else {
            e.returnValue = false;//这个e是元素本身，正确写法是window
        }
    }

    //注册ajax
    function registerAjax() {
        $.ajax({
            type:'post',
            url:'api/user/register',
            data:{
                username:$registerBox.find('[name="username"]').val(),
                password:$registerBox.find('[name="password"]').val(),
                repassword:$registerBox.find('[name="repassword"]').val()
            },
            dataType:'json',
            success:function (result) {
                console.log(result);
                if(!result.code){
                    // alert(result.message);
                    // $loginBox.show();
                    // $registerBox.hide();
                    // $('.colWarning').html('');
                    window.location.reload();
                    return;
                }
                $('.colWarning').html(result.message);
            }
        })
    }
    
    function loginOut() {
        $.ajax({
            url:'api/user/logout',
            success:function (result) {
                if(!result.code){
                    window.location.reload()          //刷新当前页面
                    // window.location.href="/";      //在同当前窗口中打开窗口
                }
            }
        })
    }



    function login() {
        $.ajax({
            type: 'post',
            url: 'api/user/login',
            data:{
                username: $loginBox.find('[name="username"]').val(),
                password: $loginBox.find('[name="password"]').val()
            },
            dataType: 'json',
            success:function (result) {
                // $loginBox.find('')

                if(!result.code){
                    window.location.reload();
                    return;
                }
                $('.colWarning').html(result.message);
            }
        })
    }

    function keyEnter(){
        if($loginBox.css('display') !== 'none'){
            login();
            return;
        }
        if($registerBox.css('display') !== 'none'){
            registerAjax();
            return;
        }
    }
    //切换到注册面板
    $loginBox.find('a.colMint').on('click',function(){
        $registerBox.show();
        $loginBox.hide();
    });

    //切换到登录面板
    $registerBox.find('a.colMint').on('click',function(){
        $loginBox.show();
        $registerBox.hide();
    });

    $registerBox.find('button').on('click',function () {
        registerAjax();
    });

    //登录ajax
    $loginBox.find('button').on('click',function () {
        login();
    });

    $('#logout').on('click',function () {
        loginOut();
    });

    document.addEventListener('keydown', function(e){
        e = e || window.event;
        var ctrlKey = e.ctrlKey || e.metaKey;

        if(ctrlKey && e.key === 'f'){
            PreventDefault(e);
        }
        if (e.keyCode === 13){
            keyEnter();
        }

        return false;
    })
});