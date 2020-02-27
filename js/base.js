var _openw = null;
//var BASE_IP = "app.ace-accel.com"; //正式环境
var BASE_IP = "47.92.108.219:8011";//测试环境

var CONFIG = {
    'TIME_OUT': 59,
    'VERSION': 88,
    'BASE_URL': 'http://' + BASE_IP + '/API/',
    'IS_RUNTIME': navigator.userAgent.indexOf("Html5Plus") > -1,
    'TIME_STAMP': new Date().getTime(),
    'USER_MODEL_KEY': 'app_user_model',
    'AUTO_UPGRADE_KEY': 'is_auto_upgread',
    'TIP_SHOW_AGAIN': 'app_tree_show_again',
    'TIP_PAY_TYPE_KEY': 'app_tip_pay_type',
    'FIRST_LOGIN_QUESTION_KEY': 'app_first_login_questions_key',
    'FIRST_LOGIN_TRANS_KEY': 'app_first_login_trans_key',
    'NEW_VERSION_DESC_KEY': 'new_version_desc',
    'LANGUAGE_KEY': 'app_langeuage_key',
    'LOCAL_LOGIN_INFO_KEY': 'app_local_login_info',
    'ACCOUNT_LOCAL_LIST_KEY': 'account_local_list',
    'SUB_PAGES': [{
        'pageName': 'home.html',
        'loadActionName': '',
        'isFirstLoad': false,
        'params': ''
    }, {
        'pageName': 'ace.transction.html',
        'loadActionName': '',
        'isFirstLoad': false,
        'params': ''
    }, {
        'pageName': 'ep.transaction.html',
        'loadActionName': '',
        'isFirstLoad': false,
        'params': ''
    }, {
        'pageName': 'center.html',
        'loadActionName': '',
        'isFirstLoad': false,
        'params': ''
    }],
    'IPHONE': {
        // iPhone X、iPhone XS
        isIPhoneX: /iphone/gi.test(window.navigator.userAgent) && window.devicePixelRatio && window.devicePixelRatio === 3 && window.screen.width === 375 && window.screen.height === 812,
        // iPhone XS Max
        isIPhoneXSMax: /iphone/gi.test(window.navigator.userAgent) && window.devicePixelRatio && window.devicePixelRatio === 3 && window.screen.width === 414 && window.screen.height === 896,
        // iPhone XR
        isIPhoneXR: /iphone/gi.test(window.navigator.userAgent) && window.devicePixelRatio && window.devicePixelRatio === 2 && window.screen.width === 414 && window.screen.height === 896
    },
    'IsSafeArea': function () {
        return CONFIG.IPHONE.isIPhoneX || CONFIG.IPHONE.isIPhoneXSMax || CONFIG.IPHONE.isIPhoneXR;
    },
    'APP_NAME': 'ACE王牌',
    'TOAST_DEFAULT': {
        mask: true,
        message: '加载中...',
        duration: 0,
        forbidClick: true
    },
    'CONFIRM_DEFAULT': {
        title: '确认对话框',
        message: '确认对话框内容',
        confirmButtonText: '確認',
        cancelButtonText: '取消',
        confirmCallback: function () { },
        cancelCallback: function () { }
    },
    'IS_DOING': false
};

var USER_MODEL = {
    'Id': 0,
    'Key': '',
    'MemberNo': '',
    'NickName': '',
    'FlowNumber': '',
    'Credit': 0,
    'AvatarImage': '',
    'RP': 0,
    'EP': 0,
    'ACECount': 0,
    'SP': 0,
    'AP': 0,
    'HonorName': '',
    'IsSon': false,
    'IDType': '',
    'IsSetSecurityQuestion': false,
    'InvestmentLevel': {},
    'IsService': false,
    'CollateralAmount': 0,
    'CurrentStockPrice': 0,
    'WeeklyMoney': 0,
    'WithdrawExchangeRate': 0,
    'IsStrong': false,
    'L': 0,
    'R': 0,
    'F': 0,
    'S': 0,
    'IsNewIDEncrypt': false,
    'IsBindGAuthorize': false,
    'IsFixed': false
};

var LSE = function () {
    var _default_lang = 'cn';

    var _currentLanguage = function () {
        var item = CONFIG.IS_RUNTIME ? plus.storage.getItem(CONFIG.LANGUAGE_KEY) : window.localStorage.getItem(CONFIG.LANGUAGE_KEY);
        if (item === null) {
            window.localStorage.setItem(CONFIG.LANGUAGE_KEY, _default_lang);
            return _default_lang;
        }

        return item;
    };

    var _getLanguageAjax = function (option) {
        option = option || {};
        option.method = "GET";
        option.url = option.url || '';
        option.dataType = "JSON";
        option.async = option.async || true;
        option.timeout = option.timeout || 20000;
        option.success = option.success || function () { };
        option.error = option.error || function (XMLHttpRequest, textStatus, errorThrown) {
            console.log('status:' + XMLHttpRequest.status);
            console.log('XMLHttpRequest：' + JSON.stringify(XMLHttpRequest));
            console.log('readyStatetus:' + XMLHttpRequest.readyState);
            console.log('textStatus:' + textStatus);
            console.log('errorThrown:' + errorThrown);
        };

        if (!XMLHttpRequest) {
            console.log("不支持XMLHttpRequest对象。");
            return;
        }

        var xhr = new XMLHttpRequest();

        if (typeof xhr === 'undefined' || xhr === null) {
            console.log("XMLHttpRequest对象创建失败！");
            return;
        }

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    var json = JSON.parse(xhr.responseText || xhr.response);

                    try {
                        option.success(json);
                    } catch (e) {
                        console.log(e.message);
                    }
                } else {
                    option.error(xhr, xhr.status);
                }
            }
        };

        var params = [];
        for (var key in option.data) {
            if (option.data.hasOwnProperty(key)) {
                params.push(key + '=' + option.data[key]);
            }
        }

        try {
            var postData = params.join('&');
            xhr.open(option.method, option.url, option.async);
            xhr.send(postData);
        } catch (e) {
            console.log(e);
        }
    };

    var _installLanguage = function (pageName, callback) {
        var fileName = CONFIG.IS_RUNTIME ? ('_www/lang/' + _currentLanguage() + '.json') : ('/lang/' + _currentLanguage() + '.json');
        var successCallback = function (data) {
            if (typeof callback === 'function') {
                var lang = data[pageName];
                if (lang !== null) {
                    callback(data[pageName]);
                }
            }
        };

        if (CONFIG.IS_RUNTIME) {
            plus.io.resolveLocalFileSystemURL(fileName, function (entry) {
                _getLanguageAjax({
                    url: systemName() === 'ios' ? entry.toRemoteURL() : entry.toLocalURL(),
                    success: successCallback
                });
            });
        } else {
            _getLanguageAjax({
                url: fileName,
                success: successCallback
            });
        }
    };

    return {
        'currentLanguage': function () {
            return _currentLanguage();
        },
        'switchLanguage': function (lang) {
            if (CONFIG.IS_RUNTIME)
                plus.storage.setItem(CONFIG.LANGUAGE_KEY, lang);
            else
                window.localStorage.setItem(CONFIG.LANGUAGE_KEY, lang);
        },
        'install': function (pageName, language, callback) {
            try {
                _installLanguage(pageName, language, callback);
            } catch (e) {
                console.log('install error:' + e.message);
            }
        }
    };
}();

function removeItem(key) {
    if (CONFIG.IS_RUNTIME) {
        plus.storage.removeItem(key);
    } else {
        window.localStorage.removeItem(key);
    }
}

function getItem(key) {
    if (CONFIG.IS_RUNTIME) {
        return plus.storage.getItem(key);
    } else {
        return window.localStorage.getItem(key);
    }
}

function setItem(k, v) {
    if (CONFIG.IS_RUNTIME) {
        plus.storage.setItem(k, v);
    } else {
        window.localStorage.setItem(k, v);
    }
}

//获取登录用户模型
function getUserModel() {
    var jsonText = getItem(CONFIG.USER_MODEL_KEY);
    if (jsonText === null) {
        return USER_MODEL;
    }

    USER_MODEL = JSON.parse(jsonText);
    return USER_MODEL;
}

//更新用户模型信息
function updateUserModel(model, updatePages) {
    USER_MODEL = Object.assign(USER_MODEL, model);
    setItem(CONFIG.USER_MODEL_KEY, JSON.stringify(USER_MODEL));
    if (updatePages instanceof Array && CONFIG.IS_RUNTIME) {
        for (var i = 0; i < updatePages.length; i++) {
            var wb = plus.webview.getWebviewById(updatePages[i].pageName);
            wb.evalJS(updatePages[i].actionName);
        }
    }
}

function userExit() {
    if (CONFIG.IS_RUNTIME) {
        plus.storage.removeItem(CONFIG.USER_MODEL_KEY);
    } else {
        window.localStorage.removeItem(CONFIG.USER_MODEL_KEY);
    }
}

function ajax(option) {
    option = option || {};
    option.method = option.method || "POST";
    option.url = option.url || '';
    option.dataType = "JSON";
    option.async = option.async || true;
    option.data = option.data || {};
    option.timeout = option.timeout || 20000;
    option.data['key'] = USER_MODEL.Key;
    option.data['v'] = CONFIG.TIME_STAMP;
    option.data['lang'] = LSE.currentLanguage();
    option.success = option.success || function () { };
    option.error = option.error || function (XMLHttpRequest, textStatus, errorThrown) {
        if (typeof _vue !== 'undefined' && typeof _vue.$toast !== 'undefined') {
            _vue.$toast.clear();
        }

        console.log('status:' + XMLHttpRequest.status);
        console.log('XMLHttpRequest：' + JSON.stringify(XMLHttpRequest));
        console.log('readyStatetus:' + XMLHttpRequest.readyState);
        console.log('textStatus:' + textStatus);
        console.log('errorThrown:' + errorThrown);
    };

    if (!XMLHttpRequest) {
        console.log("不支持XMLHttpRequest对象。");
        return;
    }

    var xhr = new XMLHttpRequest();
    xhr.ontimeout = option.ontimeout || function () {
        if (typeof _vue !== 'undefined' && typeof _vue.$toast !== 'undefined') {
            _vue.$toast.clear();
        }

        toastMsg('服務器目前繁忙，請稍後重試該操作！');
    };

    if (typeof xhr === 'undefined' || xhr === null) {
        console.log("XMLHttpRequest对象创建失败！");
        return;
    }

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                try {
                    var json = JSON.parse(xhr.responseText || xhr.response);
                    if (json.IsLogin === false && CONFIG.IS_RUNTIME) {
                        globalToLogin();
                    } else if (json.IsResetPin === true && CONFIG.IS_RUNTIME) {
                        globalToChangePin();
                    } else {
                        option.success(json);
                    }
                } catch (e) {
                    console.log(e.message);
                    option.error(xhr, xhr.status);
                }
            } else {
                option.error(xhr, xhr.status);
            }
        }
    };

    var params = [];
    for (var key in option.data) {
        if (option.data.hasOwnProperty(key)) {
            params.push(key + '=' + option.data[key]);
        }
    }

    try {
        var postData = params.join('&');
        xhr.open(option.method, option.url, option.async);
        if (option.method === 'POST') {
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
        }

        xhr.timeout = option.timeout;
        xhr.send(postData);
    } catch (e) {
        console.log(e);
    }
}

function globalToLogin() {
    if (plus.webview.getWebviewById('loginPage') !== null) return;

    var fileName = "_www/htmls/account/login.html";
    plus.io.resolveLocalFileSystemURL(fileName, function (entry) {
        var page = entry.toLocalURL();
        var pageUrl = page.substring(0, page.lastIndexOf('.'));
        gotoNewWindow('loginPage', pageUrl, {
            ani: 'slide-in-bottom',
            param: 'closeOnly=true&isRelogin=true',
            closeCallback: function () {
                plus.webview.currentWebview().reload();
            }
        });
    });
}

function globalToChangePin() {
    if (plus.webview.getWebviewById('change.trans.passwordPage') !== null) return;

    CONFIG.IS_DOING = false;
    closeDialog();

    var fileName = "_www/htmls/centerPages/profilePages/change.trans.password.html";
    plus.io.resolveLocalFileSystemURL(fileName, function (entry) {
        var page = entry.toLocalURL();
        var pageUrl = page.substring(0, page.lastIndexOf('.'));
        gotoNewWindow('change.trans.passwordPage', pageUrl, {
            ani: 'slide-in-bottom',
            param: 'fp=change'
        });
    });
}

function pageLoaded() {
    window.addEventListener('scroll', function () {
        var clientHeight = 0;
        if (document.body.clientHeight && document.documentElement.clientHeight) {
            clientHeight = document.body.clientHeight < document.documentElement.clientHeight ? document.body.clientHeight : document.documentElement.clientHeight;
        } else {
            clientHeight = document.body.clientHeight > document.documentElement.clientHeight ? document.body.clientHeight : document.documentElement.clientHeight;
        }

        var scrollTop = document.body.scrollTop > document.documentElement.scrollTop ? document.body.scrollTop : document.documentElement.scrollTop;
        var scrollBottom = document.body.scrollHeight - scrollTop;
        if (scrollBottom >= clientHeight && scrollBottom <= clientHeight + 70) {
            if (typeof window.scrollBottom === 'function') window.scrollBottom();
        }
    });

    if (CONFIG.IS_RUNTIME && systemName() === 'ios') {
        var fileName = "_www/js/fast.click.js";
        plus.io.resolveLocalFileSystemURL(fileName, function (entry) {
            var scriptObj = document.createElement("script");
            scriptObj.src = entry.toRemoteURL();
            scriptObj.type = "text/javascript";
            scriptObj.onload = function () {
                FastClick.attach(document.body);
            };

            document.getElementsByTagName("head")[0].appendChild(scriptObj);
        });
    }

    if (CONFIG.IS_RUNTIME) {
        //绑定后退按钮事件（安卓按钮）
        plus.key.addEventListener('backbutton', function () {
            //如果窗体自身实现后退按钮
            if (typeof window.backButton === 'function') {
                window.backButton();
                return;//不再处理其他业务
            }

            if (typeof window.isPageControlBackButton === 'undefined' || window.isPageControlBackButton === false) {
                //首先检测是否有对话框存在
                var modal = getFirstByClass('van-modal');
                if (typeof _vue !== 'undefined' && modal !== null && modal.style.display !== 'none') {
                    var toastObject = getFirstByClass('van-toast');
                    var dialogObject = getFirstByClass('van-dialog');

                    if (toastObject !== null) {
                        _vue.$toast.clear();
                    }

                    if (dialogObject !== null) {
                        _vue.$dialog.close();
                    }

                    return;//关闭后不再处理其他业务
                }

                //检查是否需要退出app
                if (plus.webview.all().length !== CONFIG.SUB_PAGES.length + 1) {
                    closeWindow();
                } else {
                    plus.webview.getWebviewById('mainPage').evalJS('pageScript.hiddenApp()');
                }
            }
        });
    }

    var back = document.getElementById('app-back-button');
    if (back !== null) {
        back.addEventListener('click', closeWindow);
    }
}

function closeDialog() {
    //首先检测是否有对话框存在
    var modal = getFirstByClass('van-modal');
    if (typeof _vue !== 'undefined' && modal !== null && modal.style.display !== 'none') {
        var toastObject = getFirstByClass('van-toast');
        var dialogObject = getFirstByClass('van-dialog');

        if (toastObject !== null) {
            _vue.$toast.clear();
        }

        if (dialogObject !== null) {
            _vue.$dialog.close();
        }
    }
}

/*
*   获取第一个检索到的元素
*/
function getFirstByClass(classname) {
    var oChild = document.getElementsByTagName('*');

    for (var i = 0, len = oChild.length; i < len; i++) {
        if (oChild[i].className.toString().indexOf(classname) >= 0) {
            return oChild[i];
        }
    }
    return null;
}

function gotoNewWindow(id, page, an) {
    if (!CONFIG.IS_RUNTIME) {
        if (typeof an !== 'undefined' && typeof an.param !== 'undefined') {
            window.location = page + '.html?' + an.param;
        } else {
            window.location = page + '.html';
        }
        return;
    }

    newWindow(id, page, {
        ani: typeof an === 'object' && an.ani ? an.ani : 'pop-in',
        openCallback: typeof an === 'object' && an.openCallback ? an.openCallback : null,
        closeCallback: typeof an === 'object' && an.closeCallback ? an.closeCallback : null,
        'param': typeof an === 'object' && typeof an.param !== 'undefined' ? an.param : null,
        'paramObject': typeof an === 'object' && typeof an.paramObject !== 'undefined' ? an.paramObject : null,
        titleNView: typeof an === 'object' && typeof an.titleNView !== 'undefined' ? an.titleNView : null
    });
}

function newWindow(id, page, ext) {
    if (_openw === null) {
        ext = typeof ext !== 'object' ? {} : ext;
        _openw = plus.webview.create(page + (ext.param ? '.html?' + ext.param : '.html'), id, {
            scrollIndicator: 'none',
            scalable: false,
            popGesture: 'close',
            plusrequire: 'ahead',
            titleNView: ext.titleNView
        }, { 'paramObject': ext.paramObject } || {});

        _openw.addEventListener('loaded', function () {
            _openw.show(ext.ani || 'pop-in', 250, function () {
                _openw = null;
                if (typeof ext.openCallback === 'function') {
                    ext.openCallback();
                }
            });
        }, false);

        _openw.addEventListener('close', function () {
            if (typeof ext.closeCallback === 'function') {
                ext.closeCallback();
            }
        });
    }
}

function closeWindow(ani) {
    if (!CONFIG.IS_RUNTIME) {
        window.history.back();
        return;
    }

    var webView = plus.webview.currentWebview();
    webView.close(typeof ani === 'string' ? ani : 'auto');
}

function toastLoading(option) {
    if (typeof _vue === 'undefined') return;

    option = Object.assign(CONFIG.TOAST_DEFAULT, option);
    _vue.$toast.loading({
        mask: option.mask,
        duration: option.duration,
        message: option.message
    });
}

function closeToastLoading() {
    if (typeof _vue === 'undefined') return;

    _vue.$toast.clear();
}

function toastMsg(text) {
    if (!CONFIG.IS_RUNTIME) {
        alert(text);
    } else {
        plus.nativeUI.toast(text);
    }
}

function confirmMsg(option) {
    if (typeof _vue === 'undefined') return;

    option = Object.assign(CONFIG.CONFIRM_DEFAULT, option);
    _vue.$dialog.confirm(option).then(option.confirmCallback).catch(option.cancelCallback);
}

function alertMsg(msg, callback, title) {
    if (!CONFIG.IS_RUNTIME) {
        alert(msg);
    } else {
        plus.nativeUI.alert(msg, callback, title || '');
    }
}

function queryString(name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    var r = window.location.search.substr(1).match(reg);

    if (r !== null) {
        return decodeURIComponent(r[2]);
    }
    return null;
}

function systemName() {
    var ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
        return 'ios';
    } else {
        return 'android';
    }
}

/*
* 参数说明：
* @param：要格式化的数字
* @param：保留几位小数
* @param：小数点符号
* @param：千分位符号
* */
function numberFormat(value, digitNum) {
    if (typeof value === 'undefined' || !value) return value;

    var initV = value;
    var seperator = ',';
    if ((value = ((value = (value * 1).toFixed(4) + "").replace(/^\s*|\s*$|,*/g, ''))).match(/^\d*\.?\d*$/) === null) return initV;

    var _padLeft = function (len, str) {
        var index = str.indexOf('.');
        if (index === -1) return [str, ''];

        if (len <= 0 && index !== -1) return [str.substr(0, index), ''];
        else if (len <= 0) return [str, ''];

        var arr = str.split('.');
        var count = len - arr[1].length;
        if (count < 0) return [arr[0], arr[1].substr(0, len)];

        for (var i = 0; i < count; i++) {
            arr[1] = arr[1] + '0';
        }

        return [arr[0], arr[1]];
    }

    var newValue = _padLeft(digitNum, value);
    var r = [];
    var tl = newValue[0];
    var tr = newValue[1];

    if (seperator !== null && seperator !== '') {
        while (tl.length >= 3) {
            r.push(tl.substring(tl.length - 3));
            tl = tl.substring(0, tl.length - 3);
        }

        if (tl.length > 0) {
            r.push(tl);
        }

        r.reverse();
        r = r.join(seperator);
        return !tr || tr.length === 0 ? r : r + '.' + tr;
    }
    return value;
}

if (!Object.assign) {
    Object.defineProperty(Object, "assign", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (target, firstSource) {
            "use strict";
            if (target === undefined || target === null)
                throw new TypeError("Cannot convert first argument to object");
            var to = Object(target);
            for (var i = 1; i < arguments.length; i++) {
                var nextSource = arguments[i];
                if (nextSource === undefined || nextSource === null) continue;
                var keysArray = Object.keys(Object(nextSource));
                for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
                    var nextKey = keysArray[nextIndex];
                    var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
                    if (desc !== undefined && desc.enumerable) to[nextKey] = nextSource[nextKey];
                }
            }
            return to;
        }
    });
}

//取消浏览器的所有事件，使得active的样式在手机上正常生效
document.addEventListener('touchstart', function () { return false; }, true);
// 禁止选择
//document.oncontextmenu = function () { return false; };

document.addEventListener('DOMContentLoaded', pageLoaded, false);
