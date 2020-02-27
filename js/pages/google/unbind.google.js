var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': getUserModel(),
        'isConfirm': false,
        'form': {
            'idcard': '',
            'pin': ''
        },
        'language': {},
        'statusbarHeight': 20
    },
    methods: {
        'checkData': function () {
            if (!this.form.pin) {
                toastMsg(this.language.ERROR_1);
            } else if (this.form.pin.length < 6) {
                toastMsg(this.language.ERROR_2);
            } else if (!this.form.idcard) {
                toastMsg(this.language.ERROR_3);
            } else {
                this.doSubmitAjax();
            }
        },
        'doSubmitAjax': function () {
            toastLoading({ 'message': this.language.SUBMIT_TOAST_TEXT });
            ajax({
                url: CONFIG.BASE_URL + 'UnBindGCode',
                data: this.form,
                success: function (result) {
                    closeToastLoading();

                    if (result.Error) {
                        toastMsg(result.Msg);
                        return;
                    }

                    updateUserModel({
                        'IsBindGAuthorize': false
                    }, [{
                        'pageName': 'center.htmlPage',
                        'actionName': '_vue.updateInfo()'
                    }]);

                    gotoNewWindow('unbind.google.successPage', 'unbind.google.success', {
                        'openCallback': function () {
                            closeWindow('none');
                        }
                    });
                }
            });
        },
        'unbindConfirm': function () {
            confirmMsg({
                'title': this.language.DIALOG_TITLE,
                'message': this.language.DIALOG_MESSAGE,
                'confirmButtonText': this.language.DIALOG_CONFIRM_BUTTON,
                'cancelButtonText': this.language.DIALOG_CANCEL_BUTTON,
                'confirmCallback': function () {
                    _vue.isConfirm = true;
                }
            });
        },
        'changeLanguage': function () {
            LSE.install('unbind_google', function (lang) {
                Vue.set(_vue, 'language', lang);
            });
        }
    },
    created: function () {
        if (CONFIG.IS_RUNTIME) {
            this.statusbarHeight = plus.navigator.getStatusbarHeight();
        }

        this.changeLanguage();
    }
});