Vue.use(vant.Lazyload, {
    'loading': '../../img/default_avatar.jpg',
    'error': '../../img/default_avatar.jpg'
});

var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': getUserModel(),
        'statusbarHeight': 20,
        'isLoading': true,
        'isPasswordInput': false,
        'isShowTip': true,
        'isShowComplaint': false,
        'reason': '',
        'isShowProof': false,
        'proofImage': null,
        'proofImageEntry': null,
        'pageModel': {
            'Id': queryString('rId'),
            'FlowNumber': '',
            'CreateTime': '',
            'EPAmount': 0,
            'EPToRMBRate': 0,
            'TotalRMB': 0,
            'Status': 0
        },
        'form': {
            'password': ''
        },
        'language': {
            'TITLE_TEXT': '',
            'LOADING_TEXT': '',
            'TIP_TEXT': '',
            'TIP_BUTTON': '',
            'EP_TITLE_TEXT': '',
            'EP_STATE_1': '',
            'EP_STATE_2': '',
            'EP_STATE_3': '',
            'PRICE_TITLE_TEXT': '',
            'PRICE_ITEM_1': '',
            'PRICE_ITEM_2': '',
            'COMPLETE_TEXT': '',
            'RULE_ITEM_1': '',
            'RULE_ITEM_2': '',
            'RULE_ITEM_H': '',
            'RULE_ITEM_M': '',
            'RULE_TITLE_TEXT': '',
            'RULE_LINE_1': '',
            'RULE_LINE_2': '',
            'RULE_LINE_3': '',
            'DIALOG_TITLE_TEXT': '',
            'INPUT_PLACEHOLDER': '',
            'BUTTON_1': '',
            'ERROR_1': '',
            'ERROR_2': '',
            'TOAST_TEXT': '',
            'COMPLAINT_PLACEHOLDER': '',
            'COMPLAINT_BUTTON_1': '',
            'COMPLAINT_BUTTON_2': '',
            'ERROR_3': '',
            'SUBMIT_TOAST_TEXT': '',
            'SUBMIT_COMPLETE_TEXT': '',
            'SUBMIT_SUCCESS': '',
            'PROOF_TITLE': '',
            'PROOF_TEXT': '',
            'PROOF_PLACEHOLDER': '',
            'PROOF_BUTTON_1': '',
            'PROOF_BUTTON_2': '',
            'ERROR_4': '',
            'ERROR_5': '',
            'PROOF_TOAST_TEXT': '',
            'PROOF_ERROR_1': '',
            'PROOF_SUCCESS': '',
            'CANCEL_TITLE': '',
            'CANCEL_MESSAGE': '',
            'CANCEL_TOAST_TEXT': '',
            'CANCEL_SUCCESS': '',
            'RECEIVE_TITLE': '',
            'RECEIVE_MESSAGE': '',
            'RECEIVE_TOAST_TEXT': '',
            'RECEIVE_SUCCESS': '',
            'ACTION_BUTTON_1': '',
            'ACTION_BUTTON_2': '',
            'ACTION_BUTTON_3': '',
            'ACTION_BUTTON_4': ''
        }
    },
    methods: {
        'received': function (item) {
            confirmMsg({
                'title': this.language.RECEIVE_TITLE,
                'message': this.language.RECEIVE_MESSAGE,
                'confirmCallback': function () {
                    toastLoading({ 'message': _vue.language.RECEIVE_TOAST_TEXT });

                    ajax({
                        url: CONFIG.BASE_URL + 'ConfirmReceive',
                        data: {
                            'sId': this.pageModel.Id
                        },
                        success: function (result) {
                            if (result.Error) {
                                closeToastLoading();
                                toastMsg(result.Msg);
                            } else {
                                _vue.updateInfo(function () {
                                    closeToastLoading();

                                    _vue.loadPageData();
                                    _vue.$toast.success(_vue.language.RECEIVE_SUCCESS);
                                });
                            }
                        }
                    });
                }
            });
        },
        'cancelSell': function () {
            confirmMsg({
                'title': this.language.CANCEL_TITLE,
                'message': this.language.CANCEL_MESSAGE,
                'confirmCallback': function () {
                    toastLoading({ 'message': _vue.language.CANCEL_TOAST_TEXT });

                    ajax({
                        url: CONFIG.BASE_URL + 'CancelSell',
                        data: {
                            'sId': this.pageModel.Id
                        },
                        success: function (result) {
                            if (result.Error) {
                                closeToastLoading();
                                toastMsg(result.Msg);
                            } else {
                                _vue.updateInfo(function () {
                                    toastMsg(_vue.language.CANCEL_SUCCESS);
                                    closeWindow();
                                });
                            }
                        }
                    })
                }
            })
        },
        'selectPictrue': function () {
            plus.gallery.pick(function (captureFile) {
                plus.io.resolveLocalFileSystemURL(captureFile, function (entry) {
                    _vue.proofImage = entry.toLocalURL();
                    _vue.proofImageEntry = entry;
                });
            });
        },
        'submitProof': function () {
            if (this.proofImage == null) {
                toastMsg(this.language.ERROR_4);
            } else if (!this.reason) {
                toastMsg(this.language.ERROR_5);
            } else {
                this.doSubmitProofAjax();
            }
        },
        'doSubmitProofAjax': function () {
            toastLoading({ 'message': this.language.PROOF_TOAST_TEXT });
            var _reason = this.reason;
            this.isShowProof = false;

            setTimeout(function () {
                _vue.proofImageEntry.file(function (file) {
                    if (file.size > (5 * (1024 * 1024))) {
                        closeToastLoading();
                        toastMsg(_vue.language.PROOF_ERROR_1);
                        return;
                    }

                    var reader = new plus.io.FileReader();
                    reader.onloadend = function (e) {
                        _vue.loadFileComplete(_reason, e);
                    };
                    reader.readAsDataURL(file);
                });
            }, 500);
        },
        'loadFileComplete': function (reason, e) {
            var base64 = e.target.result.toString().replace('data:image/jpeg;base64,', '');
            var encode = encodeURIComponent(base64);

            ajax({
                url: CONFIG.BASE_URL + 'UploadReceiveRecord',
                data: {
                    'base64AvatarImage': encode,
                    'sId': this.pageModel.Id,
                    'remark': encodeURIComponent(reason)
                },
                timeout: 120000,
                success: function (result) {
                    closeToastLoading();

                    if (result.Error) {
                        toastMsg(result.Msg);
                    } else {
                        _vue.$toast.success(_vue.language.PROOF_SUCCESS);
                    }
                }
            });
        },
        'proof': function () {
            this.isShowProof = true;
            this.proofImageEntry = null;
        },
        'failed': function () {
            if (!this.reason) {
                toastMsg(this.language.ERROR_3);
            } else {
                this.isShowComplaint = false;
                this.doSubmitFaile();
            }
        },
        'doSubmitFaile': function () {
            toastLoading({ 'message': this.language.SUBMIT_TOAST_TEXT });

            ajax({
                url: CONFIG.BASE_URL + 'TransferFailed',
                data: {
                    'sId': this.pageModel.Id,
                    'remark': encodeURIComponent(this.reason)
                },
                success: function (result) {
                    _vue.reason = '';
                    closeToastLoading();

                    if (result.Error) {
                        toastMsg(result.Msg);
                        return;
                    }

                    _vue.pageModel.Status = 16;
                    _vue.$toast.success({ 'message': _vue.language.SUBMIT_COMPLETE_TEXT });
                }
            });
        },
        'complaint': function () {
            this.isShowComplaint = true;
        },
        'disTouch': function (e) {
            e.stopPropagation();
            e.preventDefault();
        },
        'closeTip': function () {
            setItem(CONFIG.TIP_PAY_TYPE_KEY, 'false');
            this.isShowTip = false;
        },
        'checkPassword': function (action, done) {
            if (action == 'confirm') {
                if (!this.form.password) {
                    done(false);
                    toastMsg(this.language.ERROR_1);
                } else if (this.form.password.length < 6) {
                    done(false);
                    toastMsg(this.language.ERROR_2);
                } else {
                    var pwd = this.form.password;
                    this.form.password = '';
                    done();

                    this.doSubmitAjax(pwd);
                }
            } else {
                done();
            }
        },
        'doBuyConfirm': function () {
            this.isPasswordInput = true;
            setTimeout(function () {
                _vue.$refs['passwordBox'].focus();
            }, 50);
        },
        'doSubmitAjax': function (pwd) {
            toastLoading({ 'message': this.language.TOAST_TEXT });

            ajax({
                url: CONFIG.BASE_URL + 'BuyEP',
                data: {
                    'sId': this.pageModel.Id,
                    'password': pwd
                },
                success: function (result) {
                    if (result.Error) {
                        closeToastLoading();
                        toastMsg(result.Msg);
                    } else {
                        gotoNewWindow('buy.ep.successPage', '../success/buy.ep.success', {
                            param: 'fn=' + _vue.pageModel.FlowNumber + '&am=' + _vue.pageModel.EPAmount,
                            openCallback: function () {
                                closeWindow('none');
                            }
                        });
                    }
                }
            });
        },
        'updateInfo': function (callback) {
            ajax({
                url: CONFIG.BASE_URL + 'GetSpecificData',
                success: function (result) {
                    if (result.Error) {
                        toastMsg(result.Msg);
                        return;
                    }

                    updateUserModel(result.Data, [{
                        'pageName': 'home.htmlPage',
                        'actionName': '_vue.updateAmount()'
                    }, {
                        'pageName': 'center.htmlPage',
                        'actionName': '_vue.updateInfo()'
                    }]);

                    callback();
                }
            });
        },
        'loadPageData': function () {
            ajax({
                url: CONFIG.BASE_URL + 'EPSellDetail',
                data: {
                    'sId': this.pageModel.Id
                },
                success: function (result) {
                    if (result.Error) {
                        toastMsg(result.Msg);
                        return;
                    }

                    _vue.pageModel = Object.assign(_vue.pageModel, result.Detail);
                    _vue.isLoading = false;
                }
            });
        },
        'backButton': function () {
            if (this.isShowTip) {
                this.isShowTip = false;
            } else {
                closeWindow();
            }
        },
        'changeLanguage': function () {
            LSE.install('detail', function (lang) {
                Object.assign(_vue.language, lang);
            });
        }
    },
    watch: {
        'isShowProof': function (val) {
            if (!val) {
                this.proofImage = null;
                this.reason = '';
            }
        }
    },
    created: function () {
        if (CONFIG.IS_RUNTIME) {
            this.statusbarHeight = plus.navigator.getStatusbarHeight();
        }

        this.changeLanguage();

        var isShow = getItem(CONFIG.TIP_PAY_TYPE_KEY);
        this.isShowTip = (isShow == null || isShow != 'false');
    },
    mounted: function () {
        window.backButton = this.backButton;
        this.loadPageData();
    }
});