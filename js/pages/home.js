var _vue = new Vue({
    el: '#app',
    data: {
        'currentUser': getUserModel(),
        'isShow': false,
        'updateTime': '',
        'noticeObject': {},
        'isLoading': true,
        'isPullLoading': false,
        'isLoadChart': true,
        'resetConfig': {
            'trans': {
                'isComplete': false
            },
            'questions': {
                'isComplete': false
            }
        },
        'profitData': {
            'CurrentACEPrice': 0.00
        },
        'language': {},
        'statusbarHeight': 20
    },
    methods: {
        'gotoLogin': function () {
            gotoNewWindow('loginPage', 'account/login', {
                openCallback: function () {
                    plus.webview.getWebviewById('mainPage').close('none');
                }
            });
        },
        'gotoQueue': function () {
            gotoNewWindow('purchase.queuePage', 'subPages/purchase.queue');
        },
        'gotoNoticeList': function () {
            gotoNewWindow('notice.listPage', 'subPages/notice.list');
        },
        'gotoQuestions': function () {
            gotoNewWindow('questionsPage', 'centerPages/profilePages/questions', {
                param: 'fp=home'
            });
        },
        'gotoResetPassword': function () {
            gotoNewWindow('change.trans.passwordPage', 'centerPages/profilePages/change.trans.password', {
                param: 'fp=home'
            });
        },
        'gotoNotice': function () {
            gotoNewWindow('notice.detailPage', 'subPages/notice.detail', {
                param: 'nId=' + this.noticeObject.Id
            });
        },
        'gotoLanguage': function () {
            gotoNewWindow('languagePage', 'subPages/language');
        },
        'addResetCount': function (resetName) {
            this.resetConfig[resetName].isComplete = true;
            if (resetName === 'trans') {
                setItem(CONFIG.FIRST_LOGIN_TRANS_KEY, 'true');
            } else {
                setItem(CONFIG.FIRST_LOGIN_QUESTION_KEY, 'true');
            }

            if (this.resetConfig.trans.isComplete && this.resetConfig.questions.isComplete) {
                this.isShow = false;
                plus.webview.getWebviewById('mainPage').evalJS('pageScript.switchMask(false)');
            }
        },
        'onRefresh': function () {
            this.loadPageData(function () {
                if (CONFIG.IS_RUNTIME) {
                    var wb = plus.webview.getWebviewById('center.htmlPage');
                    wb.evalJS('_vue.updateInfo()');
                }
            });
        },
        'loadPageData': function (callback) {
            ajax({
                url: CONFIG.BASE_URL + 'IndexData',
                success: function (result) {
                    if (result.Error) {
                        toastMsg(result.Msg);
                        return;
                    }

                    if (result.IsTerminate) {
                        plus.nativeUI.alert('當前APP版本過低，請前往下載最新版本。點擊“確定”后程序自動終止運行！', function () {
                            plus.runtime.quit();
                        }, '版本過低');
                        return;
                    }

                    try {
                        if (typeof callback === 'function') {
                            callback();
                        }

                        _vue.loadAjaxData(result);
                    } catch (e) {
                        console.error('loadAjaxData error：' + e.message);
                    }
                }
            });
        },
        'loadAjaxData': function (result) {
            var newModel = {
                'ACECount': result.Data.ACECount,
                'TotalACE': result.Data.TotalACE,
                'WeeklyMoney': result.Data.WeeklyMoney,
                'EP': result.Data.EP,
                'RP': result.Data.RP,
                'AP': result.Data.AP,
                'SP': result.Data.SP,
                'HonorName': result.Data.HonorName,
                'Credit': result.Data.Credit,
                'IsService': result.Data.IsService,
                'CurrentStockPrice': result.Data.CurrentStockPrice,
                'TotalBuyMoney': result.Data.RealData.TotalBuyMoney,
                'TotalSellAce': result.Data.RealData.TotalSellAce,
                'WithdrawExchangeRate': result.Data.WithdrawExchangeRate,
                'LevelNumber': result.Data.LevelNumber,
                'MinCommitLevelNumber': result.Data.MinCommitLevelNumber
            };

            updateUserModel(newModel);

            this.profitData = Object.assign(this.profitData, result.Data.ProfitData);
            this.noticeObject = Object.assign(this.noticeObject, result.Data.NoticeList);
            this.calculateProfit();

            var d = new Date();
            var h = this.padLeft(d.getHours());
            var m = this.padLeft(d.getMinutes());
            var s = this.padLeft(d.getSeconds());
            this.updateTime = h + ':' + m + ':' + s;

            if (this.isPullLoading) {
                this.$toast.success({
                    'message': '刷新完成',
                    'duration': 500
                });
            }

            this.isPullLoading = false;
            this.isLoading = false;

            try {
                this.createHightCharts();
            } catch (e) {
                console.error('hightCart error：' + e.message);
            }
        },
        'calculateProfit': function () {
            if (!this.profitData.IsJoin) {
                this.profitData.Percent = 0;
                this.profitData.CurrentACEPrice = '0.00';
                return;
            }

            var aceCount = this.profitData.BuyAmount / this.profitData.BuyACEPrice * (this.profitData.ACEMatchRate / 100);
            var capital = aceCount * this.profitData.BuyACEPrice;

            var percentSum = 0;
            if (this.currentUser.ACECount <= 0) {//已經離場
                percentSum = (this.profitData.TotalSelledAce - capital) / capital * 100;
                if (percentSum<0) {
                    percentSum = 0; 
                }
                this.profitData.Percent = percentSum.toFixed(0);
                this.profitData.CurrentACEPrice = numberFormat(0, 3);
            } else {//未離場
                var currentStock = this.currentUser.ACECount * this.currentUser.CurrentStockPrice;
                percentSum = (this.profitData.TotalSelledAce + currentStock - capital) / capital * 100;
                if (percentSum < 0) {
                    percentSum = 0; 
                }
                this.profitData.Percent = percentSum.toFixed(0);
                this.profitData.CurrentACEPrice = numberFormat(currentStock, 3);
            }
        },
        'createHightCharts': function () {
            this.isLoadChart = true;

            ajax({
                url: CONFIG.BASE_URL + 'StockPriceTrend',
                success: function (result) {
                    if (result.Error) {
                        toastMsg(result.Msg);
                        return;
                    }

                    var chartData = [];
                    for (var i = 0; i < result.Data.length; i++) {
                        chartData.push([result.Data[i].Key, result.Data[i].Value]);
                    }

                    _vue.isLoadChart = false;
                    _vue.$nextTick(function () {
                        _vue.createControl(chartData);
                    });
                }
            });
        },
        'createControl': function (chartData) {
            Highcharts.stockChart('container1', {
                title: { text: '' },
                subtitle: { text: '' },
                credits: { enabled: false },
                legend: { enabled: false },
                rangeSelector: {
                    buttons: [{
                        type: 'month',
                        count: 1,
                        text: '1 Month'
                    }, {
                        type: 'month',
                        count: 3,
                        text: '3 Month'
                    }, {
                        type: 'month',
                        count: 6,
                        text: '6 Month'
                    }, {
                        type: 'year',
                        count: 1,
                        text: '1 Year'
                    }, {
                        type: 'all',
                        text: 'All'
                    }],
                    inputEnabled: false,
                    selected: 0
                },
                xAxis: {
                    type: 'datetime',
                    dateTimeLabelFormats: {
                        day: '%m/%d'
                    }
                },
                series: [{
                    name: this.language.SERIE_NAME,
                    data: chartData,
                    type: 'spline'
                }],
                tooltip: {
                    formatter: function () {
                        var s = '<span>' + Highcharts.dateFormat('%Y/%m/%d', this.x) + '</span><br/><span>' + _vue.language.SERIE_NAME + '：<b>' + this.y + '</b></span>';
                        return s;
                    }
                }
            });
        },
        'updateAmount': function () {
            this.currentUser = getUserModel();
        },
        'padLeft': function (s, len) {
            if (s < 10) return '0' + s.toString();
            return s;
        },
        'reloadData': function () {
            if (plus.webview.getWebviewById('loginPage') === null) {
                this.loadPageData();
            }
        },
        'changeLanguage': function (isReload) {
            LSE.install('home', function (lang) {
                Vue.set(_vue, 'language', lang);

                if (typeof isReload !== 'undefined') {
                    _vue.isLoading = true;
                    _vue.isLoadChart = true;
                    _vue.loadPageData();
                }
            });
        }
    },
    computed: {
        'joinCapital': function () {
            if (!this.profitData.IsJoin)
                return numberFormat(this.profitData.BuyAmount * (this.profitData.ACEMatchRate / 100), 3);

            var aceCount = this.profitData.BuyAmount / this.profitData.BuyACEPrice * (this.profitData.ACEMatchRate / 100);
            return numberFormat(aceCount * this.profitData.BuyACEPrice, 3);
        }
    },
    created: function () {
        if (CONFIG.IS_RUNTIME) {
            this.statusbarHeight = plus.navigator.getStatusbarHeight();
        }
        this.changeLanguage();

        var questionItem = getItem(CONFIG.FIRST_LOGIN_QUESTION_KEY);
        var transItem = getItem(CONFIG.FIRST_LOGIN_TRANS_KEY);
        var wb = null;

        if (!this.currentUser.IsSetSecurityQuestion) {
            if (questionItem === null) {
                setItem(CONFIG.FIRST_LOGIN_QUESTION_KEY, 'false');
            } else if (questionItem === 'true') {
                this.resetConfig.questions.isComplete = true;
            }

            if (transItem === null) {
                setItem(CONFIG.FIRST_LOGIN_TRANS_KEY, 'false');
            } else if (transItem === 'true') {
                this.resetConfig.trans.isComplete = true;
            }

            this.isShow = true;
            if (CONFIG.IS_RUNTIME) {
                wb = plus.webview.getWebviewById('mainPage');
                wb.evalJS('pageScript.switchMask(true)');
            }
        } else {
            if (questionItem === 'true') {
                this.resetConfig.questions.isComplete = true;
            }
            if (transItem === 'true') {
                this.resetConfig.trans.isComplete = true;
            }

            if (questionItem === 'false' || transItem === 'false') {
                this.isShow = true;
                if (CONFIG.IS_RUNTIME) {
                    wb = plus.webview.getWebviewById('mainPage');
                    wb.evalJS('pageScript.switchMask(true)');
                }
            }
        }
    },
    mounted: function () {
		if(!this.currentUser.IsSetSecurityQuestion){
			this.gotoQuestions();
			return;
        }

        if (!this.currentUser.IsStrong && CONFIG.IS_RUNTIME) {
            gotoNewWindow('change.login.passwordPage', 'centerPages/profilePages/change.login.password', {
                'param': 'from=home'
            });
        }

        this.loadPageData();
    }
});

document.addEventListener("resume", _vue.reloadData);