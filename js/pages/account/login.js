var _vue = new Vue({
    el: '#app',
    data: {
        'isRemember': true,
        'isDropdownList': false,
        'isLogin': false,
        'form': {
            'account': '',
            'password': ''
        },
        'request': {
            'from': queryString('from'),
            'closeOnly': queryString('closeOnly') 
        },
        'statusbarHeight': 20,
        'localList': [],
        'language': {}
    },
    methods: {
        'removeAccount': function (item) {
            var removeItem = item;

            confirmMsg({
                'title': this.language.CONFIRM_TITLE,
                'message': this.language.CONFIRM_TEXT,
                'confirmButtonText': this.language.CONFIRM_BUTTON,
                'cancelButtonText': this.language.CANCEL_BUTTON,
                'confirmCallback': function () {
                    var rememberList = getItem(CONFIG.ACCOUNT_LOCAL_LIST_KEY);
                    var arr = JSON.parse(rememberList).reverse();
                    for (var i = 0; i < arr.length; i++) {
                        if (arr[i].account === removeItem.account) {
                            arr.splice(i, 1);
                            _vue.localList.splice(i, 1);

                            setItem(CONFIG.ACCOUNT_LOCAL_LIST_KEY, JSON.stringify(arr));
                            if (arr.length === 0) {
                                _vue.isDropdownList = false;
                            }
                            return;
                        }
                    }
                }
            });
        },
        'hideDropdownlist': function () {
            this.isDropdownList = false;
        },
        'choiceList': function (item) {
            this.form.account = item.account;
            this.form.password = item.password;
        },
        'checkInput': function () {
            if (!this.form.account) {
                toastMsg(this.language.ERROR_1);
            } else if (!this.form.password) {
                toastMsg(this.language.ERROR_2);
            } else if (this.form.password.length < 6) {
                toastMsg(this.language.ERROR_3);
            } else {
                this.isLogin = true;
                this.doLoginAjax();
            }
        },
        'doLoginAjax': function () {
            ajax({
                url: CONFIG.BASE_URL + 'Login',
                data: this.form,
                success: function (result) {
                    if (result.Error) {
                        _vue.isLogin = false;
                        closeToastLoading();
                        toastMsg(result.Msg);
                    } else {
                        _vue.logedCallback(result);
                    }
                }
            });
        },
        'logedCallback': function (result) {

            result.UserData['Key'] = result.Key;
            updateUserModel(result.UserData);

            if (_vue.request.closeOnly) {
                closeWindow();
                return;
            }
 
            if (this.isRemember) {
                var rememberList = getItem(CONFIG.ACCOUNT_LOCAL_LIST_KEY);
                var item = [{
                    'account': this.form.account,
                    'password': this.form.password
                }];

                try {
                    if (rememberList === null || !rememberList) {
                        setItem(CONFIG.ACCOUNT_LOCAL_LIST_KEY, JSON.stringify(item));
                    } else {
                        var list = JSON.parse(rememberList);
                        var isExists = this.getLocalAccount(list, this.form.account);
                        if (!isExists) {
                            list.push(item[0]);
                            setItem(CONFIG.ACCOUNT_LOCAL_LIST_KEY, JSON.stringify(list));
                        }
                    }
                } catch(e) {
                    setItem(CONFIG.ACCOUNT_LOCAL_LIST_KEY, JSON.stringify(item));
                }
            }

            if (CONFIG.IS_RUNTIME) {
                gotoNewWindow('mainPage', '../main', {
                    'openCallback': function () {
                        try {
                            plus.webview.getWebviewById('mainPage').evalJS('pageScript.createMaskWindow()');
                        } finally {
                            closeWindow('none');
                        }
                    }
                });
            } else {
                _vue.isLogin = false;
                closeToastLoading();
                toastMsg('登录成功');
            }
        },
        'switchLanguage': function () {
            gotoNewWindow('languagePage', '../subPages/language', {
                'param': 'from=login',
                closeCallback: function () {
                    _vue.changeLanguage();
                }
            });
        },
        'getLocalAccount': function (list, account) {
            for (var i = 0; i < list.length; i++) {
                if (list[i].account === account) return true;
            }

            return false;
        },
        'changeLanguage': function () {
            LSE.install('login', function (lang) {
                Vue.set(_vue, 'language', lang);
            });
        }
    },
    computed: {
        'publicVersion': function () {
            return 'v' + numberFormat(CONFIG.VERSION / 10, 1);
        },
        'screenHeight': function () {
            if (CONFIG.IS_RUNTIME && CONFIG.SYSTEM_NAME !== 'ios') {
                return plus.display.resolutionHeight;
            } else {
                return document.body.clientHeight;
            }
        }
    },
    created: function () {
        this.changeLanguage();

        if (this.request.closeOnly) {
            window.backButton = function () { };
        }

        if (CONFIG.IS_RUNTIME) {
            this.statusbarHeight = plus.navigator.getStatusbarHeight();
        }

        var rememberList = getItem(CONFIG.ACCOUNT_LOCAL_LIST_KEY);
        if (rememberList) {
            try {
                var list = JSON.parse(rememberList);
                if (!(list instanceof Array)) {
                    setItem(CONFIG.ACCOUNT_LOCAL_LIST_KEY, '[]');
                } else {
                    this.localList = list.reverse();
                }
            } catch(e){
                setItem(CONFIG.ACCOUNT_LOCAL_LIST_KEY, '[]');
            }
        }
    },
    mounted: function () {
        if (CONFIG.IS_RUNTIME) {
            plus.navigator.setStatusBarStyle('dark');
        }
    }
});