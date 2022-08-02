"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// 时间 选择 插件  ,不支持 ie
; (function (win, undefined) {
    var _this = null;
    // 方法主体，不暴露
    var dateMultiFunc = function dateMultiFunc(options) {
        _this = this;
        // 参数
        this.options = _extends({
            type: 0, //类型， 0：单选  1：多选  2：时间范围
            position: "bottom", //位置,默认底部 值：center top bottom
            radius: 0, //圆角  数字 或 数组  [0,0,0,0] 同 css border-radius
            color: "#333333", //全局文字颜色
            background: "#ffffff", //内容背景颜色
            opacity: 0.7, //遮罩的透明度
            selectBg: "#409EFE", //选中的背景颜色
            selectColor: "#ffffff", //选中文字颜色
            selectRadius: 100, //(百分比)选中的开始结束时间 圆角样式
            tranBg: "#A0CFFF", //过渡背景颜色，type 2有效
            tranColor: "#333333", //过渡文字颜色，type 2有效
            title: "选择时间", //标题
            isCancel: true, //是否显示取消按钮
            cancelText: "取消", //取消按钮文案
            cancelFunc: function cancelFunc() { }, //取消回调
            confirmText: "确认", //确认按钮文案
            confirmFunc: function confirmFunc() { }, //确认回调
            backFormat: ".", //返回格式(默认 . 分割)
            isShow: false, //是否立即显示

            // 优先级: (指定日期  >  指定不可选日期)(时间范围类型无效) > 最大最小时间  >  默认时间
            appointTime: [], //指定日期可选, type 0  1 有效， 字符串数组 和 json数组  列:["2022.7.1","2020.7.3"]  {date:"2022.7.1"},{date:"2022.7.2"}  [{date:"2022.7.1",text:"111"},{date:"2022.7.2",text:"222"}]
            appointOn: [], //指定不可选日期,同上
            // 数字：表示 默认时间的 前后多少年（1表示默认时间的上一年为可选时间范围）
            // 0 表示  当前默认时间,如果不写，表示为默认时间的前后100年 
            // 最小时间 必须 比 最大时间 小 ,如果 默认打开时间 没在 区间中，默认时间设置成最小时间
            minTime: "", // 可选最小时间（同默认时间格式）（可数字或时间字符串）
            maxTime: "", // 可选最大时间（同默认时间格式）可数字或时间字符串）
            defaultYears: ""
        }, options);

        // 内部参数
        this.currYears = {}; //当前显示的年月
        this.appointTimeArr = []; //指定日期可选
        this.appointOnArr = []; //指定不可选日期可选
        this.minTimeJson = {}; // minTime 转换好的时间
        this.maxTimeJson = {}; // maxTime 装换好的时间
        this.dateMultiEles = {}; //事件插件 元素对象 合集

        this.selectTimes = []; //选择的时间数组  列:[[2022,7,5],[2022,7,4]] //年月日
        this.selectObj = []; //选中的对象 数组  列: [obj,obj]
        this.selectPeriod = []; // 范围区间的过渡对象 合集

        // 初始化
        this.init();
    };
    // 原型方法
    dateMultiFunc.prototype = {
        // 初始化
        init: function init() {
            // 转换 可选时间
            this.transformOptionaTime();

            // 创建
            this.create();
        },

        // 创建
        create: function create() {
            // 创建对象
            var date_multi_popup = document.createElement("div");
            date_multi_popup.className = "date_multi_popup";
            // 背景
            var date_multi_bg = document.createElement("div");
            date_multi_bg.className = "date_multi_bg";
            date_multi_popup.appendChild(date_multi_bg);

            // 内容盒子
            var date_multi_inner = document.createElement("div");
            date_multi_inner.className = "date_multi_inner";
            // 顶部按钮区
            var date_multi_title = document.createElement("div");
            date_multi_title.className = "date_multi_title";
            // 判断是否需要取消按钮
            var cancel_btn = "";
            if (this.options.isCancel) {
                cancel_btn = document.createElement("span");
                cancel_btn.innerHTML = this.options.cancelText;
                date_multi_title.appendChild(cancel_btn);
            }
            // 标题
            var tp = document.createElement("p");
            tp.innerHTML = this.options.title;
            date_multi_title.appendChild(tp);
            // 确认按钮
            var confirm_btn = document.createElement("span");
            confirm_btn.innerHTML = this.options.confirmText;
            date_multi_title.appendChild(confirm_btn);
            // 塞入标题区
            date_multi_inner.appendChild(date_multi_title);

            // 时间 选择 标题
            var date_multi_time = document.createElement("div");
            date_multi_time.className = "date_multi_title date_multi_time";
            // 时间选择 年月标题
            var time_tit = document.createElement("p");
            // 获取时间，并保存
            var time = this.getYearsDay(this.options.defaultYears, true);
            time_tit.innerHTML = time.year + "年" + time.month + "日";
            // 塞入 时间 和 按钮
            var prev_month = document.createElement("span"); //上月
            var next_month = document.createElement("span"); //下月
            date_multi_time.appendChild(prev_month);
            date_multi_time.appendChild(time_tit);
            date_multi_time.appendChild(next_month);
            // 塞入时间标题
            date_multi_inner.appendChild(date_multi_time);

            // 内容
            var date_multi_con = document.createElement("div");
            date_multi_con.className = "date_multi_con";
            // 塞入周期
            date_multi_con.appendChild(this.createDateWeek());
            // 塞入内容
            date_multi_inner.appendChild(date_multi_con);
            date_multi_popup.appendChild(date_multi_inner);
            document.body.appendChild(date_multi_popup);

            //保存 元素对象
            var dateMultiEles = {
                date_multi_popup: date_multi_popup, //盒子
                date_multi_bg: date_multi_bg, //背景
                cancel_btn: cancel_btn, //取消按钮
                date_multi_title: date_multi_title, //标题
                confirm_btn: confirm_btn, //确认按钮
                time_tit: time_tit, //时间标题(年月)
                prev_month: prev_month, //上月按钮
                next_month: next_month, //下月按钮
                date_multi_con: date_multi_con //内容
                // date_list,//日期列表

                // 合并
            }; this.dateMultiEles = _extends(this.dateMultiEles, dateMultiEles);

            // 生成 css
            this.createdCss();
            // 是否显示
            if (this.options.isShow) {
                this.show();
            }

            // 初始化 事件
            this.initEvent();
        },

        // 显示
        show: function show() {
            var _this2 = this;

            if (this.dateMultiEles.date_list) {
                this.dateMultiEles.date_list.remove(); //删除
            }
            // 塞入 时间列表
            this.createDateList();

            setTimeout(function () {
                _this2.options.isShow = true;
                if (_this2.dateMultiEles['date_multi_popup']) {
                    _this2.dateMultiEles['date_multi_popup'].classList.add("date_multi_show");
                    document.body.style.overflow = "hidden";
                }
            }, 0);
        },

        // 关闭
        close: function close() {
            this.options.isShow = false;
            if (this.dateMultiEles['date_multi_popup']) {
                this.dateMultiEles['date_multi_popup'].classList.remove("date_multi_show");
            }
            document.body.style.overflow = "visible";
            // 清楚 多余赋值
            this.clear();
        },

        // 清除
        clear: function clear() {
            this.selectTimes = []; //选择的时间数组  列:[[2022,7,5],[2022,7,4]] //年月日
            this.selectObj = []; //选中的对象 数组  列: [obj,obj]
            this.selectPeriod = []; // 范围区间的过渡对象 合集
        },

        // 销毁
        destroy: function destroy() {
            try {
                // 删除 html
                this.dateMultiEles.date_multi_popup.remove();
                // 并且删除css
                var date_multi_func_css = document.getElementById("date_multi_func_css");
                date_multi_func_css.remove();

                // 移除事件
                this.removeEvent();

                dateFuncObj = null;
            } catch (err) { }
        },

        // 修改 css 选中圆角
        modifyCssRadius: function modifyCssRadius() {
            // 判断 当前圆角是否大于10
            if (this.options.selectRadius > 10) {
                this.options.selectRadius = 10;
            }
        },

        // 生成 css 样式
        createdCss: function createdCss() {
            var css = "\n                :root {\n                    --date_multi_func-selectBg: " + this.options.selectBg + ";\n                    --date_multi_func-selectColor: " + this.options.selectColor + ";\n                    --date_multi_func-tranBg: " + this.options.tranBg + ";\n                    --date_multi_func-tranColor: " + this.options.tranColor + ";\n                    --date_multi_func-selectRadius:" + this.options.selectRadius + "%;\n                    --date_multi_func-color:" + this.options.color + ";\n                    --date_multi_func-background:" + this.options.background + ";\n                    --date_multi_func-opacity:" + this.options.opacity + ";\n                }\n                .date_multi_popup,.date_multi_popup *{\n                    margin: 0;\n                    padding: 0;\n                }\n                .date_multi_popup{\n                    position: fixed;\n                    z-index: 2000;\n                    width: 100%;\n                    height: 100%;\n                    font-size: 13px;\n                    top: 0;\n                    left: 0;\n                    display: flex;\n                    flex-direction: column;\n                    justify-content: flex-end;\n                    align-items: center;\n                    transition: all 0.2s;\n                    opacity: 0;\n                    visibility: hidden;\n                    color: " + this.options.color + ";\n                    color: var(--date_multi_func-color);\n                }\n                .date_multi_show{\n                    opacity: 1;\n                    visibility: visible;\n                }\n                .date_multi_popup .date_multi_bg{\n                    position: absolute;\n                    z-index: 1;\n                    top: 0;\n                    left: 0;\n                    width: 100%;\n                    height: 100%;\n                    background: #000;\n                    opacity: " + this.options.opacity + ";\n                    opacity: var(--date_multi_func-opacity);\n                }\n                .date_multi_popup .date_multi_inner{\n                    position: relative;\n                    z-index: 5;\n                    width: 100%;\n                    min-height: 20%;\n                    padding-top: 6px;\n                    box-shadow: 0px 0px 3px -1px #999;\n                    transition: all 0.3s 0.2s;\n                    transform: translateY(100%);\n                    opacity: 0;\n                    background-color: " + this.options.background + ";\n                    background-color: var(--date_multi_func-background);\n                }\n                .date_multi_show .date_multi_inner{\n                    transform: translateY(0);\n                    opacity: 1;\n                }\n                .date_multi_popup .date_multi_title{\n                    width: 100%;\n                    position: relative;\n                    line-height: 2.4;\n                }\n                .date_multi_popup .date_multi_title p{\n                    font-size: 16px;\n                    text-align: center;\n                }\n                .date_multi_popup .date_multi_title span{\n                    height: 100%;\n                    position: absolute;\n                    font-size: 14px;\n                    left: 0;\n                    top: 0;\n                    padding: 0 20px;\n                }\n                .date_multi_popup .date_multi_title span:last-child{\n                    left: auto;\n                    right: 0;\n                }\n                .date_multi_popup .date_multi_time{\n                    line-height: 2.4;\n                }\n                .date_multi_popup .date_multi_time p{\n                    font-weight: bold;\n                }\n                .date_multi_popup .date_multi_time span{\n                    padding: 0 15%;\n                }\n                .date_multi_popup .date_multi_time span::after{\n                    position: absolute;\n                    content: \"\";\n                    display: block;\n                    width: 0;\n                    height: 0;\n                    border-left: 6px solid transparent;\n                    border-top: 4px solid transparent;\n                    border-bottom: 4px solid transparent;\n                    left: 50%;\n                    margin-left: -4px;\n                    top: 50%;\n                    margin-top: -6px;\n                    border-right: 6px solid " + this.options.color + ";\n                    border-right: 6px solid var(--date_multi_func-color);\n                }\n                .date_multi_popup .date_multi_time span:last-child::after{\n                    border-right: 6px solid transparent;\n                    border-left: 6px solid " + this.options.color + ";\n                    border-left: 6px solid var(--date_multi_func-color);\n                }\n                \n                .date_multi_popup .date_multi_con{\n                    width: 100%;\n                    padding: 0 10px 15px 10px;\n                    box-sizing: border-box;\n                }\n                /* \u661F\u671F */\n                .date_multi_popup .date_week{\n                    width: 100%;\n                    overflow: hidden;\n                    margin-bottom: 8px;\n                    margin-top: 5px;\n                    pointer-events: none;\n                    display: flex;\n                }\n                .date_multi_popup .date_week span{\n                    width: 14.28%;\n                    text-align: center;\n                    font-size: 13px;\n                    line-height: 2.1;\n                }\n                /* \u65E5\u671F */\n                .date_multi_popup .date_list{\n                    width: 100%;\n                    height:calc(2.8em * 6);\n                    overflow: hidden;\n                    font-size: 14px;\n                    display: flex;\n                    flex-wrap: wrap;\n                    align-content:flex-start;\n                }\n                .date_multi_popup .date_list div{\n                    display: block;\n                    width: 14.28%;\n                    overflow: hidden;\n                    text-align: center;\n                    line-height: 2.8em;\n                    height: 2.8em;\n                    position: relative;\n                    z-index: 2;\n                    transition: all 0.1s;\n                }\n                .date_multi_popup .date_list p{\n                    display: block;\n                    width: 100%;\n                    overflow: hidden;\n                    text-align: center;\n                    line-height: 2.8em;\n                    height: 2.8em;\n                    position: relative;\n                    z-index: 2;\n                }\n                /* \u6587\u672C */\n                .date_multi_popup .date_list div span{\n                    position: absolute;\n                    bottom: 1px;\n                    left: 0;\n                    width: 100%;\n                    text-align: center;\n                    font-size: 12px;\n                    line-height: 1;\n                    z-index: 3;\n                    transform: scale(0.7);\n                }\n                /* \u4E0D\u53EF\u9009\u6837\u5F0F */\n                .date_multi_popup .date_list div.on_select{\n                    opacity: 0.3;\n                    pointer-events: none;\n                }\n                \n                /* \u9009\u4E2D\u6837\u5F0F */\n                /* \u7B2C\u4E00\u4E2A\u548C\u6700\u540E\u4E00\u4E2A \u5706\u6837\u5F0F*/\n                .date_multi_popup .date_list .select_firstlast p:before{\n                    position: absolute;\n                    content: \"\";\n                    width: 70%;\n                    height: 0;\n                    padding-top: 70%;\n                    top: 50%;\n                    transform: translateY(-50%);\n                    left: 15%;\n                    z-index: -1;\n                    border-radius: " + this.options.selectRadius + ";\n                    background-color: " + this.options.selectBg + ";\n                    border-radius: var(--date_multi_func-selectRadius);\n                    background-color: var(--date_multi_func-selectBg);\n                }\n                .date_multi_popup .date_list .select_firstlast{\n                    color: " + this.options.selectColor + ";\n                    color: var(--date_multi_func-selectColor);\n                }\n                /* \u8303\u56F4\u95F4\u6837\u5F0F */\n                .date_multi_popup .date_list .select_period{\n                    color: " + this.options.tranColor + ";\n                    color: var(--date_multi_func-tranColor);\n                }\n                .date_multi_popup .date_list .select_period p::after,\n                .date_multi_popup .date_list .select_firstlast p::after\n                {\n                    position: absolute;\n                    content: \"\";\n                    width: 100%;\n                    height: 0;\n                    padding-top: 70%;\n                    top: 50%;\n                    transform: translateY(-50%);\n                    left: 0;\n                    z-index: -2;\n                    background-color: " + this.options.tranBg + ";\n                    background-color: var(--date_multi_func-tranBg);\n                }\n                .date_multi_popup .date_list .select_firstlast p::after{\n                    width: 50%;\n                    opacity: 0;\n                }\n                /* \u95ED\u5408\u6837\u5F0F */\n                .date_multi_popup .date_list .select_first p::after,\n                .date_multi_popup .date_list .select_last p::after{\n                    opacity: 1;\n                }\n                .date_multi_popup .date_list .select_first p::after{\n                    right:0;\n                    left:auto;\n                }\n            ";

            // 设置 参数样式
            var optionsCss = "\n                /* \u5706\u89D2 \u6570\u7EC4\u5C31\u7528\u6570\u7EC4\u5706\u89D2  \u4E0D\u662F\u6570\u7EC4\u5C31\u7528 \u4E0A\u9762\u5706\u89D2*/\n                .date_multi_popup .date_multi_inner{\n                    border-radius:" + (this.options.radius.length ? this.options.radius.join("px ") + "px" : this.options.radius + "px") + ";\n                }\n                /* \u4F4D\u7F6E*/\n                .date_multi_popup{\n                    " + (this.options.position == "top" ? "justify-content: flex-start" : this.options.position == "center" ? "justify-content: center" : '') + "\n                }\n                .date_multi_popup .date_multi_inner{\n                    transform: translateY(" + (this.options.position == "top" ? "-100%" : this.options.position == "center" ? '50%' : '100%') + ");\n                }\n                .date_multi_show .date_multi_inner{\n                    transform: translateY(0);\n                }\n            ";

            css = css + optionsCss;

            var style = document.createElement('style');
            style.type = 'text/css';
            style.id = "date_multi_func_css";
            if (style.styleSheet) {
                style.styleSheet.cssText = css;
            } else {
                style.appendChild(document.createTextNode(css));
            }
            document.head.appendChild(style);
        },

        // 转换 最大最小时间 和 指定日期
        transformOptionaTime: function transformOptionaTime() {
            // 默认时间
            var defaultYears = this.getYearsDay(this.options.defaultYears);
            // 获取 最小时间 和 最大时间
            var minTimeJson = this.options.minTime;
            var maxTimeJson = this.options.maxTime;

            // 判断最小时间
            minTimeJson = this.getMaxMinTime(minTimeJson, 0);
            maxTimeJson = this.getMaxMinTime(maxTimeJson, 1);

            // 判断 最大时间 是否比 最小时间 小
            if (maxTimeJson.timestamp < minTimeJson.timestamp) {
                throw "最大时间应该比最小时间大！";
            }
            // 判断 默认时间 是否 在 最大最小区间中,不在区间中，默认时间就是最小时间
            if (defaultYears.timestamp > maxTimeJson.timestamp || defaultYears.timestamp < minTimeJson.timestamp) {
                // 不在区间中,默认时间设置成 最小时间
                this.options.defaultYears = minTimeJson.timestamp;
            }

            // 转换 指定日期  和 不可选日期
            // 如果 指定时间 比 最小最大时间 大或小，最大最小时间就是 指定时间
            try {
                // 时间范围，不考虑 指定日期
                if (this.options.type != 2) {
                    var isModifyCss = false; //是否修改css，如果有文本，那么选中样式得圆角就必须低于10
                    if (this.options.appointTime.length) {
                        var list = [];
                        // 组装数据
                        var _iteratorNormalCompletion = true;
                        var _didIteratorError = false;
                        var _iteratorError = undefined;

                        try {
                            for (var _iterator = this.options.appointTime[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                var item = _step.value;

                                var appjson = {};
                                if (item.date) {
                                    appjson = this.getYearsDay(item.date);
                                } else {
                                    appjson = this.getYearsDay(item);
                                }

                                if (item.text) {
                                    appjson['text'] = item.text;
                                    isModifyCss = true;
                                } else {
                                    appjson['text'] = "";
                                }
                                list.push(appjson);
                            }
                            // 排序
                        } catch (err) {
                            _didIteratorError = true;
                            _iteratorError = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion && _iterator.return) {
                                    _iterator.return();
                                }
                            } finally {
                                if (_didIteratorError) {
                                    throw _iteratorError;
                                }
                            }
                        }

                        list.sort(function (a, b) {
                            return a.timestamp - b.timestamp;
                        });
                        this.appointTimeArr = list;

                        // 判断 数组 第一个和最后一个，是否在 最大时间和最小时间 中
                        if (list.length) {
                            var min = list[0];
                            var max = "";
                            // 如果没有2个以上的数组时间，最后个时间就时第一个时间
                            list.length >= 2 ? max = list[list.length - 1] : max = min;

                            // 判断 如果 第一个的时间 比 最小时间 小，那么 最小时间就设置成 第一个时间
                            if (min.timestamp < minTimeJson.timestamp) {
                                minTimeJson = min;
                                // 并且，默认时间也改成最小时间
                                this.options.defaultYears = min.year + "/" + min.month + "/" + min.today;
                            }
                            // 判断 最后个时间 是否 小于 最大时间
                            if (max.timestamp > maxTimeJson.timestamp) {
                                maxTimeJson = max;
                            }
                        }
                    } else if (this.options.appointOn.length) {
                        // 不可选日期，只有 appointTime 没有才有效
                        var _list = [];
                        // 组装数据
                        var _iteratorNormalCompletion2 = true;
                        var _didIteratorError2 = false;
                        var _iteratorError2 = undefined;

                        try {
                            for (var _iterator2 = this.options.appointOn[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                var _item = _step2.value;

                                var nojson = {};
                                if (_item.date) {
                                    nojson = this.getYearsDay(_item.date);
                                } else {
                                    nojson = this.getYearsDay(_item);
                                }

                                if (_item.text) {
                                    nojson['text'] = _item.text;
                                    isModifyCss = true;
                                } else {
                                    nojson['text'] = "";
                                }
                                _list.push(nojson);
                            }
                            // 排序
                        } catch (err) {
                            _didIteratorError2 = true;
                            _iteratorError2 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                    _iterator2.return();
                                }
                            } finally {
                                if (_didIteratorError2) {
                                    throw _iteratorError2;
                                }
                            }
                        }

                        _list.sort(function (a, b) {
                            return a.timestamp - b.timestamp;
                        });
                        this.appointOnArr = _list;
                    }
                    // 判断是否需要修改 css
                    if (isModifyCss) {
                        this.modifyCssRadius();
                    }
                }
            } catch (err) { }
            // 保存
            this.minTimeJson = minTimeJson;
            this.maxTimeJson = maxTimeJson;
        },

        // 获取 最大最小时间  type  0: 最小时间   1: 最大时间
        getMaxMinTime: function getMaxMinTime(time, type) {
            // 默认时间
            var defaultYears = this.getYearsDay(this.options.defaultYears);
            try {
                switch (typeof time === "undefined" ? "undefined" : _typeof(time)) {
                    case "string":
                        //字符串
                        // 判断是否为 空
                        if (time === "") {
                            // 默认时间 前后 100年
                            if (type) {
                                // 最大时间
                                defaultYears.year = defaultYears.year + 100;
                            } else {
                                // 最小时间
                                defaultYears.year = defaultYears.year - 100;
                            }
                            time = this.getYearsDay(defaultYears.year + "/" + defaultYears.month + "/" + defaultYears.today);
                        } else {
                            // 字符串时间
                            time = this.getYearsDay(time); //转换时间
                        }
                        break;
                    case "number":
                        //数字
                        // 判断是否是整数
                        if (time % 1 === 0) {
                            time = Math.abs(time); //绝对值
                            // 判断 加减
                            if (type) {
                                // 最大时间，加
                                defaultYears.year = defaultYears.year + time;
                            } else {
                                // 最小时间，减
                                defaultYears.year = defaultYears.year - time;
                            }
                            time = this.getYearsDay(defaultYears.year + "/" + defaultYears.month + "/" + defaultYears.today);
                        } else {
                            // 不是整数
                            throw "数字必须是整数！";
                        }
                        break;
                    default:
                        throw "时间格式不正确！";
                }
            } catch (err) {
                throw err;
            }

            return time;
        },

        // 获取 年 月 日 天数 1号位置  isSave:是否保存成 当前时间
        getYearsDay: function getYearsDay(time, isSave) {
            // 默认当前月
            var showTiem = new Date();

            // 判断是否 传了 时间
            if (time) {
                try {
                    // 把横线转成/线（ios 横线 会 NaN）
                    // 判断是否是字符串
                    if (typeof time == 'string') {
                        time = time.replace(/\-/g, "/");
                        time = time.replace(/\./g, "/");
                    }
                    time = new Date(time);
                    if (time == "Invalid Date") {
                        // 无效时间
                        throw err;
                    } else {
                        showTiem = time;
                    }
                } catch (err) {
                    throw "时间格式错误";
                }
            }

            var year = showTiem.getFullYear(); //获取完整的年份
            var month = showTiem.getMonth() + 1; //获取当前月份(0-11,0代表1月),+1,1月就是1
            var today = showTiem.getDate(); //获取当前日(1-31)
            var currweek = showTiem.getDay(); //获取当前星期X(0-6,0代表星期天)
            var timestamp = new Date(year + "." + month + "." + today).getTime(); //当前时间戳(凌晨时间00:00)

            // 0 代表 前一天
            var days = new Date(year, month, 0).getDate(); //天数 这里 month :代表下一个月,下一个月的前一天
            var oneweek = new Date(year, month - 1, 1).getDay(); //当前月1号星期(用于前面站位)

            // 判断是否保存当前时间
            if (isSave) {
                this.currYears = { year: year, month: month, today: today, currweek: currweek, days: days, oneweek: oneweek, timestamp: timestamp };
            }
            return { year: year, month: month, today: today, currweek: currweek, days: days, oneweek: oneweek, timestamp: timestamp };
        },

        // 生成 周期 元素
        createDateWeek: function createDateWeek() {
            var date_week = document.createElement("div");
            date_week.className = "date_week";
            for (var i = 1; i <= 7; i++) {
                var p = document.createElement("span");
                var inner = "周日";
                switch (i) {
                    case 1:
                        //周日
                        inner = "周日";
                        break;
                    case 2:
                        //周一
                        inner = "周一";
                        break;
                    case 3:
                        //周二
                        inner = "周二";
                        break;
                    case 4:
                        //周三
                        inner = "周三";
                        break;
                    case 5:
                        //周四
                        inner = "周四";
                        break;
                    case 6:
                        //周五
                        inner = "周五";
                        break;
                    case 7:
                        //周六
                        inner = "周六";
                        break;
                }
                p.innerHTML = inner;
                date_week.appendChild(p);
            }
            return date_week;
        },

        // 生成 时间列表
        createDateList: function createDateList() {
            var _this3 = this;

            var date_list = document.createElement("div");
            date_list.className = "date_list";

            // 当前 时间
            var _currYears = this.currYears,
                year = _currYears.year,
                month = _currYears.month,
                days = _currYears.days,
                oneweek = _currYears.oneweek;

            // 设置 是否可以继续点击上月下月

            var minTimeJson = this.minTimeJson;
            var maxTimeJson = this.maxTimeJson;
            // 判断当前时间是否在 最小时间 月
            if (year == minTimeJson.year && month == minTimeJson.month) {
                // 前面的时间不可选了
                this.dateMultiEles.prev_month.style.display = "none";
            } else {
                this.dateMultiEles.prev_month.style.display = "block";
            }
            if (year == maxTimeJson.year && month == maxTimeJson.month) {
                // 后面的时间不可选了
                this.dateMultiEles.next_month.style.display = "none";
            } else {
                this.dateMultiEles.next_month.style.display = "block";
            }

            // 获取 不可选和可选日期
            var arrList = this.getNoSelectDate();
            // 获取不可选日期
            var onSelects = arrList.onSelects;
            // 获取可选日期（只有指定日期才有）
            var apppintDate = arrList.apppintDate;

            // 循环次数 = 当前天数 + 1号星期(前面空白站位)
            var num = days + oneweek;
            for (var i = 0; i < num; i++) {
                var div = document.createElement("div");
                var p = document.createElement("p");
                // 在1号位置 开始塞入日期
                if (i >= oneweek) {
                    (function () {
                        var today = i - oneweek + 1;
                        p.innerHTML = today;
                        // 判断 当前日期，是否是不可选日期
                        var isFind = onSelects.filter(function (item) {
                            return item == today || item.today == today;
                        })[0];
                        if (isFind) {
                            // 不可选，添加类
                            div.classList.add("on_select");
                        } else {
                            // 可选
                            // 设置 开始选中 结束选中样式
                            _this3.setFirstEndStyle(div, i);
                            // 监听点击事件
                            div.onclick = function () {
                                _this.dateClick(this);
                            };
                            // 获取 当前日期 是否是 指定日期
                            isFind = apppintDate.filter(function (item) {
                                return item == today || item.today == today;
                            })[0];
                        }
                        // 判断 是否需要添加文本
                        if (isFind && isFind.text) {
                            var span = document.createElement("span");
                            span.innerHTML = isFind.text;
                            div.appendChild(span);
                        }
                    })();
                }
                // 添加索引
                div.setAttribute("index", i);
                div.appendChild(p);
                date_list.appendChild(div);
            }
            // 塞入
            this.dateMultiEles.date_multi_con.appendChild(date_list);
            this.dateMultiEles['date_list'] = date_list; //保存
            // 设置选择过渡样式
            this.setSectionStyle();
        },

        // 获取 不可选日期
        getNoSelectDate: function getNoSelectDate() {
            // 当前 时间
            var _currYears2 = this.currYears,
                year = _currYears2.year,
                month = _currYears2.month,
                days = _currYears2.days;
            // 不可选日期

            var onSelects = [];
            // 可选日期(只有指定日期才有返回)
            var apppintDate = [];
            // 判断是否有 指定日期 // 如果是 指定日期，那么 最小最大时间都不需要判断
            if (this.options.type != 2 && this.appointTimeArr.length) {
                // 获取 当前月 的 可选时间
                apppintDate = this.appointTimeArr.filter(function (item) {
                    return item.year == year && item.month == month;
                });

                // 循环天数，判断 当前日期 是否 不是 可选日期

                var _loop = function _loop(i) {
                    var isFind = apppintDate.some(function (item) {
                        return item.today == i;
                    });
                    // 找不到，才加入 不可选日期
                    if (!isFind) onSelects.push(i);
                };

                for (var i = 1; i <= days; i++) {
                    _loop(i);
                }
            } else {
                // 最大最小区间
                var minTimeJson = this.minTimeJson;
                var maxTimeJson = this.maxTimeJson;

                // 先判断 不可选日期
                if (this.options.type != 2 && this.appointOnArr.length) {
                    // 获取 当前月 的 不可选时间
                    var list = this.appointOnArr.filter(function (item) {
                        return item.year == year && item.month == month;
                    });
                    onSelects.push.apply(onSelects, _toConsumableArray(list));
                }

                // 在判断
                // 当前月 在 最小月份上
                if (year == minTimeJson.year && month == minTimeJson.month) {
                    var _loop2 = function _loop2(i) {
                        // 判断 当前日期 是否已经在不可选中了
                        if (!onSelects.some(function (item) {
                            return item.today == i;
                        })) {
                            // 没找到，才塞入
                            onSelects.push(i);
                        }
                    };

                    // 循环最小日期，最小日期 之前的 日期都不可选
                    for (var i = 1; i < minTimeJson.today; i++) {
                        _loop2(i);
                    }
                }
                // 当前月 在 最大月份上
                if (year == maxTimeJson.year && month == maxTimeJson.month) {
                    var _loop3 = function _loop3(i) {
                        // 判断 当前日期 是否已经在不可选中了
                        if (!onSelects.some(function (item) {
                            return item.today == i;
                        })) {
                            // 没找到，才塞入
                            onSelects.push(i);
                        }
                    };

                    // 最大日期 之后的 日期都不可选
                    for (var i = maxTimeJson.today + 1; i <= days; i++) {
                        _loop3(i);
                    }
                }
            }

            return { onSelects: onSelects, apppintDate: apppintDate };
        },


        // 初始化事件
        initEvent: function initEvent() {
            // 背景点击事件
            this.dateMultiEles.date_multi_bg.addEventListener("click", this.cancelFunc, false);
            // 取消按钮点击事件
            this.dateMultiEles.cancel_btn.addEventListener("click", this.cancelFunc, false);
            // 确认按钮点击事件
            this.dateMultiEles.confirm_btn.addEventListener("click", this.confirmFunc, false);

            // 上一月按钮点击
            this.dateMultiEles.prev_month.addEventListener("click", this.prevMonthClick, false);
            // 下一月按钮点击
            this.dateMultiEles.next_month.addEventListener("click", this.nextMonthClick, false);
        },

        // 移除事件
        removeEvent: function removeEvent() {
            // 背景点击事件
            this.dateMultiEles.date_multi_bg.removeEventListener("click", this.cancelFunc, false);
            // 取消按钮点击事件
            this.dateMultiEles.cancel_btn.removeEventListener("click", this.cancelFunc, false);
            // 确认按钮点击事件
            this.dateMultiEles.confirm_btn.removeEventListener("click", this.confirmFunc, false);

            // 上一月按钮点击
            this.dateMultiEles.prev_month.removeEventListener("click", this.prevMonthClick, false);
            // 下一月按钮点击
            this.dateMultiEles.next_month.removeEventListener("click", this.nextMonthClick, false);
        },

        // 取消事件
        cancelFunc: function cancelFunc() {
            _this.close();
            // 通知取消
            _this.options.cancelFunc();
        },

        // 确认按钮点击事件
        confirmFunc: function confirmFunc() {
            // 判断是否选择了日期
            if (!_this.selectTimes.length) return;

            // 返回的 数组数据
            var res = _this.selectTimes; //返回数据


            // 时间区间，返回 开始和结束 json
            if (_this.options.type == 2) {
                if (!_this.selectTimes[1]) {
                    // 没有结束时间，把开始赋值给结束
                    _this.selectTimes[1] = _this.selectTimes[0];
                }
                res = {
                    statrTime: _this.selectTimes[0],
                    endTime: _this.selectTimes[1]
                };
            }

            // 回调
            _this.options.confirmFunc(res);
            // 关闭
            _this.close();
        },

        // 上个月点击
        prevMonthClick: function prevMonthClick() {
            _this.prevNextMonthFunc();
        },

        // 下一月点击
        nextMonthClick: function nextMonthClick() {
            _this.prevNextMonthFunc(true);
        },

        // 上一月 下一月 点击 type:false 上一月
        prevNextMonthFunc: function prevNextMonthFunc(type) {
            // 当前年月
            var _this$currYears = _this.currYears,
                year = _this$currYears.year,
                month = _this$currYears.month,
                today = _this$currYears.today;

            // 判断是上一月还是下一月

            if (type) {
                // 下月
                month++;
                if (month > 12) {
                    month = 1;
                    year++;
                };
            } else {
                // 上月
                month--;
                if (month <= 0) {
                    month = 12;
                    year--;
                };
            }

            // 保存时间
            _this.getYearsDay(year + "/" + month + "/" + today, true);
            // 重新生成 列表
            _this.dateMultiEles.date_list.remove(); //删除
            _this.createDateList();
            // 修改标题
            _this.dateMultiEles.time_tit.innerHTML = year + "年" + month + "日";
        },

        // 日期 点击事件
        dateClick: function dateClick(e) {
            var p = e.getElementsByTagName("p")[0];
            var text = e.getElementsByTagName("span")[0] ? e.getElementsByTagName("span")[0].innerText : "";

            //当前年月
            var _currYears3 = this.currYears,
                year = _currYears3.year,
                month = _currYears3.month;

            var day = Number(p.innerText);
            var timeJson = {
                year: year, //年
                month: month, //月
                day: day, //日
                time: year + this.options.backFormat + month + this.options.backFormat + day, //时间字符串
                timestamp: new Date(year + "." + month + "." + day).getTime(), //时间戳
                text: text //文本

                // 给当前添加类
            }; e.classList.add("select_firstlast");

            // 单选
            if (this.options.type == 0) {
                // 清空选中
                this.selectTimes = [];
                // 判断是否选择了，选了，就删除类
                if (this.selectObj.length) this.selectObj[0].classList.remove("select_firstlast");
                // 保存
                this.selectObj = [e];
                // 保存时间
                this.selectTimes = [timeJson];
                return;
            }

            // 多选
            if (this.options.type == 1) {
                // 判断 数组中 是否 已经选了，选过了，就取消选中
                var index = this.selectTimes.findIndex(function (v) {
                    return v.timestamp == timeJson.timestamp;
                });
                if (index >= 0) {
                    // 取消
                    this.selectObj[index].classList.remove("select_firstlast");
                    // 删除数组对应数据
                    this.selectObj.splice(index, 1);
                    this.selectTimes.splice(index, 1);
                } else {
                    // 保存
                    this.selectObj.push(e);
                    // 保存时间
                    this.selectTimes.push(timeJson);
                }
                return;
            }

            // 判断是否是 时间区间
            if (this.options.type == 2) {
                // 判断是否 2次以上了，以上了就重新开始选开始和结束
                if (this.selectTimes.length >= 2) {
                    this.selectTimes = [];
                    for (var i = 0; i < this.selectObj.length; i++) {
                        this.selectObj[i].classList.remove("select_firstlast");
                    }
                    this.selectObj = [];
                    // 清空 选中过渡
                    this.cleanSelectPeriod();
                }

                // 判断 是否是第一次点击
                if (!this.selectTimes.length) {
                    this.selectTimes = [timeJson];
                    // 保存
                    this.selectObj = [e];
                    return;
                }

                // 第二次
                this.selectObj.push(e);
                this.selectTimes.push(timeJson);

                // 判断 开始和结束 是否取反(结束时间比开始时间小)
                this.isTimeReverse();
            }
        },


        // 时间区间**************************************
        // 判断 时间是否选反，选反了就自动回正
        isTimeReverse: function isTimeReverse() {
            // 判断 开始时间 是否比 结束时间 大
            // 需要取反
            if (this.selectTimes[0].timestamp > this.selectTimes[1].timestamp) {
                // 取反时间
                var item = this.selectTimes[0];
                this.selectTimes[0] = this.selectTimes[1];
                this.selectTimes[1] = item;

                // 取反 元素对象
                item = this.selectObj[0];
                this.selectObj[0] = this.selectObj[1];
                this.selectObj[1] = item;
            }
            // 设置选中区间的过渡样式
            this.setSectionStyle();
        },

        // 重新设置 开始选中 结束选中样式
        setFirstEndStyle: function setFirstEndStyle(div, i) {
            if (!(this.selectTimes.length >= 2) || !this.selectObj.length) return;
            // 判断 当前年月 是否是 选择元素的年月,并且索引对应
            //当前年月
            var _currYears4 = this.currYears,
                year = _currYears4.year,
                month = _currYears4.month;

            var index = "";
            if (year == this.selectTimes[0].year && month == this.selectTimes[0].month) {
                // 开始
                index = Number(this.selectObj[0].getAttribute("index"));
                if (i == index) {
                    div.classList.add("select_firstlast");
                    // 重新 赋值
                    this.selectObj[0] = div;
                }
            }
            if (year == this.selectTimes[1].year && month == this.selectTimes[1].month) {
                // 结束
                index = Number(this.selectObj[1].getAttribute("index"));
                if (i == index) {
                    div.classList.add("select_firstlast");
                    // 重新 赋值
                    this.selectObj[1] = div;
                }
            }
        },

        // 设置选中区间的过渡样式
        setSectionStyle: function setSectionStyle() {
            this.selectPeriod = []; //清空

            // 判断是否 选中了时间
            if (!(this.selectTimes.length >= 2)) return;

            // 判断 开始 和 结束 是否是一个时间
            if (this.selectTimes[0].timestamp == this.selectTimes[1].timestamp) return;

            var firstIndex = -1; //开始索引
            var lastIndex = -1; //结束索引
            var _currYears5 = this.currYears,
                year = _currYears5.year,
                month = _currYears5.month,
                days = _currYears5.days,
                oneweek = _currYears5.oneweek; //当前年月日

            // 判断 当前年月 是否是 选择元素的年月

            if (year == this.selectTimes[0].year && month == this.selectTimes[0].month) {
                // 开始选中在当前年月，设置开始索引
                firstIndex = Number(this.selectObj[0].getAttribute("index"));
            }

            if (year == this.selectTimes[1].year && month == this.selectTimes[1].month) {
                // 结束选中在当前年月，设置结束索引
                lastIndex = Number(this.selectObj[1].getAttribute("index"));
            }

            var forIndex = 0; //循环次数
            var objele = ""; //元素

            // 开始 和 结束 在当前月
            if (firstIndex >= 0 && lastIndex >= 0) {
                // 在同 年月，就循环两者之间的次数 - 1
                forIndex = lastIndex - firstIndex - 1;
                objele = this.selectObj[0].nextSibling; //第一个的下一个
            }
            // 开始 在当前月
            if (firstIndex >= 0 && lastIndex < 0) {
                // 就循环 开始 到月份最后(天数 + 第一天的位置 = 总数量)
                forIndex = days + oneweek - firstIndex - 1;
                objele = this.selectObj[0].nextSibling; //第一个的下一个
            }
            // 结束 在当前月
            if (firstIndex < 0 && lastIndex >= 0) {
                // 就循环 第一天位置 到 结束位置
                forIndex = lastIndex - oneweek;
                objele = this.dateMultiEles.date_list.children[oneweek]; //1号位置
            }
            // 当前月份 在 开始和结束 中
            if (firstIndex == -1 && lastIndex == -1) {
                // 判断 当前年月 是否 选择的区间中
                if (year >= this.selectTimes[0].year && year <= this.selectTimes[1].year && month >= this.selectTimes[0].month && month <= this.selectTimes[1].month) {
                    // 在区间中，就当前月1号 到 当前月最后天
                    forIndex = days;
                    // 开始位置，就是 oneweek（1号位置索引）
                    objele = this.dateMultiEles.date_list.children[oneweek];
                }
            }

            for (var i = 0; i < forIndex; i++) {
                // 从开始 一直循环 往下，添加类
                objele.className = "select_period";
                // 保存对象
                this.selectPeriod.push(objele);
                objele = objele.nextSibling;
            }

            // 给 开始 和 结束 添加 闭合类
            this.selectObj[0].classList.add("select_first");
            this.selectObj[1].classList.add("select_last");
        },

        // 清楚 选中过渡
        cleanSelectPeriod: function cleanSelectPeriod() {
            // 判断 是否为空
            if (this.selectPeriod.length) {
                // 清除样式
                for (var i = 0; i < this.selectPeriod.length; i++) {
                    this.selectPeriod[i].className = "";
                }
                // 清空
                this.selectPeriod = [];
            }
        }
    };

    // 暴露的方法
    // 关键代码（单列模型）
    var dateFuncObj = null;

    var dateMulti = function dateMulti(options) {
        // 没参数
        if (typeof options == "undefined") {
            options = {};
        }
        // 参数格式错误
        if ((typeof options === "undefined" ? "undefined" : _typeof(options)) != "object") {
            throw "参数格式错误！";
        }
        if (dateFuncObj) {
            // 已创建，销毁
            dateFuncObj.destroy();
        }
        // 创建
        dateFuncObj = new dateMultiFunc(options);
    };

    // 打开方法
    dateMulti.prototype.show = function () {
        if (dateFuncObj) {
            dateFuncObj.show();
        } else {
            throw "请先创建！";
        }
    };
    // 销毁方法
    dateMulti.prototype.destroy = function () {
        if (dateFuncObj) {
            dateFuncObj.destroy();
        }
    };

    // 抛出
    win.dateMultiFunc = dateMulti;
})(window);