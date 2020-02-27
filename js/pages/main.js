var pageScript = {
    'data': {
        'downloader': null,
        'isChecking': false,
        'language': {
            'TEXT_1': '',
            'TEXT_2': '',
            'TEXT_3': '',
            'TEXT_4': '',
            'CHECK_WARNING': '',
            'CHECK_DIALOG_TITLE': '',
            'CHECK_DIALOG_BUTTON_1': '',
            'DOWNLOAD_WAITING': '',
            'DOWNLOAD_COMPLETE_TEXT': '',
            'DOWNLOAD_ERROR_TEXT': '',
            'DOWNLOAD_ERROR_TITLE': '',
            'DOWNLOAD_NOTFOUND_TEXT': '',
            'DOWNLOAD_NOTFOUND_TITLE': ''
        }
    },
    'currentIndex': 0,
    'runtimeMainActivity': null,
    'systemName': systemName(),
    'installLanguage': function (callback) {
        LSE.install('main', function (lang) {
            for (var key in lang) {
                var el = document.getElementById(key);
                if (el === null) {
                    pageScript.data.language[key] = lang[key];
                } else {
                    el.innerText = lang[key];
                }
            }

            if (typeof (callback) === 'function') {
                callback();
            }
        });
    },
    'ready': function () {
        if (systemName() !== 'ios') {
            pageScript.runtimeMainActivity = plus.android.runtimeMainActivity();
        }
       
        pageScript.installLanguage();

        var isSafeArea = CONFIG.IPHONE.isIPhoneX || CONFIG.IPHONE.isIPhoneXR || CONFIG.IPHONE.isIPhoneXSMax;
        if (isSafeArea) {
            document.getElementById('app').className = 'safe';
            document.getElementById('bottom-menus-items').style.paddingBottom = '20px';
        }

        //获取当前页面所属的Webview窗口对象
        var self = plus.webview.currentWebview();
        for (var i = CONFIG.SUB_PAGES.length - 1; i >= 0; i--) {
            //创建webview子页
            var sub = plus.webview.create(
                CONFIG.SUB_PAGES[i].pageName, //子页url
                CONFIG.SUB_PAGES[i].pageName + 'Page', {
                    top: '0px', //设置距离顶部的距离
                    bottom: isSafeArea ? '75px' : '55px', //设置距离底部的距离
                    zindex: 1,
                    scrollIndicator: 'none',
                    scalable: false,
                    kernel: 'WKWebview'
                }
            );

            if (i !== 0) {
                sub.setVisible(false);
            }

            //将webview对象填充到窗口
            self.append(sub);
        }

        pageScript.checkUpgrade();
    },
    'reloadLanguage': function () {
        pageScript.installLanguage(function () {
            for (var i = 0; i < CONFIG.SUB_PAGES.length; i++) {
                var wb = plus.webview.getWebviewById(CONFIG.SUB_PAGES[i].pageName + 'Page');
                wb.evalJS('_vue.changeLanguage(true)');
            }
        });
    },
    'createMaskWindow': function () {
        var webView = plus.webview.currentWebview();
        webView.setStyle({ mask: 'rgba(0,0,0,0.7)' });

        var screenSize = {
            'height': plus.screen.resolutionHeight,
            'width': plus.screen.resolutionWidth
        };

        var hotScreenSize = {
            'width': screenSize.width * .9,
            'height': screenSize.height * .7
        };

        var hotScreen = plus.webview.create(
            'subPages/hot.screen.html',
            'hot.screenPage', {
                'top': (screenSize.height - hotScreenSize.height) / 2 + 20,
                'left': (screenSize.width - hotScreenSize.width) / 2,
                'zindex': 10,
                'width': hotScreenSize.width,
                'height': hotScreenSize.height,
                'scrollIndicator': 'none',
                'scalable': false,
                'kernel': 'WKWebview',
                'background': "transparent"
            }
        );

        hotScreen.addEventListener('loaded', function () {
            hotScreen.show('zoom-fade-out');
        });
		
        hotScreen.onclose = function () {
            var userModel = getUserModel();
            if (!userModel.IsNewIDEncrypt) {
                pageScript.openValidateIdentity();
            }
        };
    },
    'openValidateIdentity': function () {
        var validateIdentity = plus.webview.create(
            'subPages/validate.identity.html',
            'validate.identityPage', {
                'scrollIndicator': 'none',
                'scalable': false,
                'kernel': 'WKWebview',
                'popGesture':'none'
            }
        );
        validateIdentity.show('pop-in');
    },
    'closeMaskWindow': function () {
        var webView = plus.webview.currentWebview();
        webView.setStyle({ mask: 'none' });
    },
    'switchPage': function (pageIndex, e, elementId) {
        if (pageScript.currentIndex === pageIndex) return;

        var ul = document.getElementById('bottom-menus-items');
        for (var i = 0; i < ul.childNodes.length; i++) {
            if (ul.childNodes[i].nodeName === 'LI') {
                pageScript.removeClass(ul.childNodes[i], 'active');
            }
        }

        var lastIndex = pageScript.currentIndex;
        var lastWebViewID = CONFIG.SUB_PAGES[lastIndex].pageName + 'Page';
        var nextWebviewID = CONFIG.SUB_PAGES[pageIndex].pageName + 'Page';

        var el = typeof elementId === 'undefined' ? e : document.getElementById(elementId);
        pageScript.addClass(el, 'active');

        if (CONFIG.SUB_PAGES[pageIndex].isFirstLoad) {
            CONFIG.SUB_PAGES[pageIndex].isFirstLoad = false;
            plus.webview.getWebviewById(nextWebviewID).evalJS(CONFIG.SUB_PAGES[pageIndex].loadActionName);
        }

        plus.webview.show(nextWebviewID);
        pageScript.currentIndex = pageIndex;
        plus.webview.hide(lastWebViewID, 'none');
    },
    'addClass': function (ele, cls) {
        if (!ele.className.toString().match(new RegExp("(\\s|^)" + cls + "(\\s|$)")))
            ele.className += " " + cls;
    },
    'removeClass': function (ele, cls) {
        if (ele.className.toString().match(new RegExp("(\\s|^)" + cls + "(\\s|$)"))) {
            var reg = new RegExp("(\\s|^)" + cls + "(\\s|$)");
            ele.className = ele.className.toString().replace(reg, " ");
        }
    },
    'popKeyboard': function () {
        if (this.systemName === 'ios') {
            var webView = plus.webview.currentWebview().nativeInstanceObject();
            webView.plusCallMethod({
                "setKeyboardDisplayRequiresUserAction": false
            });
        } else {
            var Context = plus.android.importClass("android.content.Context");
            var InputMethodManager = plus.android.importClass("android.view.inputmethod.InputMethodManager");
            var imm = this.runtimeMainActivity.getSystemService(Context.INPUT_METHOD_SERVICE);
            imm.toggleSoftInput(0, InputMethodManager.SHOW_FORCED);
        }
    },
    'hiddenApp': function () {
        if (this.systemName !== 'ios') {
            this.runtimeMainActivity.moveTaskToBack(false);
        }
    },
    'setClipBoard': function (text) {
        if (this.systemName === 'ios') {
            var UIPasteboard = plus.ios.importClass("UIPasteboard");
            var generalPasteboard = UIPasteboard.generalPasteboard();
            generalPasteboard.setValueforPasteboardType(text, "public.utf8-plain-text");
        } else {
            var Context = plus.android.importClass("android.content.Context");
            var clip = this.runtimeMainActivity.getSystemService(Context.CLIPBOARD_SERVICE);
            plus.android.invoke(clip, "setText", text);
        }
    },
    'getClipBoard': function (page, methodName) {
        var text = '';
        if (this.systemName === 'ios') {
            var UIPasteboard = plus.ios.importClass("UIPasteboard");
            var generalPasteboard = UIPasteboard.generalPasteboard();
            text = generalPasteboard.valueForPasteboardType("public.utf8-plain-text");
        } else {
            var Context = plus.android.importClass("android.content.Context");
            var clip = this.runtimeMainActivity.getSystemService(Context.CLIPBOARD_SERVICE);
            text = plus.android.invoke(clip, "getText");
        }

        var wb = plus.webview.getWebviewById(page);
        if (wb === null) return;

        if (!text || text === 'undefined') {
            wb.evalJS(methodName + '("")');
        } else {
            wb.evalJS(methodName + '("' + text + '")');
        }
    },
    'switchMask': function (isShow) {
        var el = document.getElementById('mask');
        if (isShow) {
            this.switchPage(0, document.getElementById('m1'));
            el.style.display = 'block';
        } else {
            el.style.display = 'none';
        }
    },
    'setMask': function (isShow) {
        var el = document.getElementById('mask');
        if (isShow) {
            el.style.display = 'block';
        } else {
            el.style.display = 'none';
        }
    },
    'checkUpgrade': function (isOnlyCheck) {
        if (pageScript.data.isChecking) return;


        if (isOnlyCheck !== true) {
            var isAutoUpgrade = getItem(CONFIG.AUTO_UPGRADE_KEY);
            if (isAutoUpgrade === 'false') return;
        }

        pageScript.data.isChecking = true;
        ajax({
            url: CONFIG.BASE_URL + 'CheckVersion',
            data: {
                'ver': CONFIG.VERSION
            },
            success: function (result) {
                pageScript.data.isChecking = false;

                if (result.Error) return;

                var wb = plus.webview.getWebviewById('set.upPage');
                if (result.RequireInstal) {
                    wb.evalJS('_vue.checkCallback()');
                    plus.nativeUI.confirm(pageScript.data.language.CHECK_WARNING, function (e) {
                        if (e.index === 1) return;

                        var url = systemName() === 'ios' ? 'http://gjh.93j4.zj-dige.cn/ZohLf4' : 'http://static.ace-accel.com/ace.apk';
                        plus.runtime.openURL(url);
                    }, {
                            'title': pageScript.data.language.CHECK_DIALOG_TITLE,
                            'buttons': [pageScript.data.language.CHECK_DIALOG_BUTTON_1, pageScript.data.language.CHECK_DIALOG_BUTTON_2]
                        });
                    return;
                }

                if (result.IsUpgrade) {
                    if (typeof isOnlyCheck === 'boolean') {
                        wb.evalJS('_vue.checkCallback(true, "' + result.BaseUrl + '", "' + result.Version + '")');
                    } else {
                        pageScript.downloadWGT(result.BaseUrl, result.Version);
                    }
                } else {
                    if (typeof isOnlyCheck === 'boolean') {
                        wb.evalJS('_vue.checkCallback(false, "' + result.BaseUrl + '", "' + result.Version + '")');
                    }
                }
            }
        });
    },
    'downloadWGT': function (baseUrl, ver) {
        plus.nativeUI.showWaiting(pageScript.data.language.DOWNLOAD_WAITING, {
            'back': 'none'
        });

        var wgtUrl = baseUrl + 'upgrade/' + ver + '.wgt';
        pageScript.data.downloader = plus.downloader.createDownload(wgtUrl, {
            'filename': "_doc/" + ver + ".wgt",
            'timeout': 60000
        }, function (d, status) {
            if (status !== 200) {
                plus.nativeUI.closeWaiting();
                return;
            }

            plus.runtime.install(d.filename, {}, function () {
                plus.nativeUI.closeWaiting();
                plus.nativeUI.alert(pageScript.data.language.DOWNLOAD_COMPLETE_TEXT, function () {
                    plus.runtime.restart();
                }, pageScript.data.language.DOWNLOAD_COMPLETE_TITLE);
            }, function (e) {
                plus.nativeUI.closeWaiting();
                plus.nativeUI.alert(e.message + '\r\n' + pageScript.data.language.DOWNLOAD_ERROR_TEXT, null, pageScript.data.language.DOWNLOAD_ERROR_TITLE);
            });
        });

        pageScript.data.downloader.addEventListener("statechanged", pageScript.onStateChanged);
        pageScript.data.downloader.start();
    },
    'onStateChanged': function (download, status) {
        if (download.state === 2 && status === 404) {
            download.abort();
            plus.nativeUI.closeWaiting();
            plus.nativeUI.alert(pageScript.data.language.DOWNLOAD_NOTFOUND_TEXT, null, pageScript.data.language.DOWNLOAD_NOTFOUND_TITLE);
        }
    }
};

document.addEventListener('DOMContentLoaded', pageScript.ready);
document.addEventListener("resume", pageScript.checkUpgrade);