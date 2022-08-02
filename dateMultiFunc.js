
// 时间 选择 插件
; (function (win, undefined) {
    let _this = null;
    class dateMultiFunc {
        // options 参数 {}
        constructor(options) {
            _this = this;
            this.options = {
                type: 0,//类型， 0：单选  1：多选  2：时间范围
                position: "bottom",//位置,默认底部 值：center top bottom
                radius: 0,//圆角  数字 或 数组  [0,0,0,0] 同 css border-radius
                color: "#333333",//全局文字颜色
                background: "#ffffff",//内容背景颜色
                opacity: 0.7,//遮罩的透明度
                selectBg: "#409EFE",//选中的背景颜色
                selectColor: "#ffffff",//选中文字颜色
                selectRadius: 100,//(百分比)选中的开始结束时间 圆角样式
                tranBg: "#A0CFFF",//过渡背景颜色，type 2有效
                tranColor: "#333333",//过渡文字颜色，type 2有效
                title: "选择时间",//标题
                isCancel: true,//是否显示取消按钮
                cancelText: "取消",//取消按钮文案
                cancelFunc: () => { },//取消回调
                confirmText: "确认",//确认按钮文案
                confirmFunc: () => { },//确认回调
                backFormat: ".",//返回格式(默认 . 分割)
                isShow: false,//是否立即显示

                // 优先级: (指定日期  >  指定不可选日期)(时间范围类型无效) > 最大最小时间  >  默认时间
                appointTime: [],//指定日期可选, type 0  1 有效， 字符串数组 和 json数组  列:["2022.7.1","2020.7.3"]  {date:"2022.7.1"},{date:"2022.7.2"}  [{date:"2022.7.1",text:"111"},{date:"2022.7.2",text:"222"}]
                appointOn: [],//指定不可选日期,同上
                // 数字：表示 默认时间的 前后多少年（1表示默认时间的上一年为可选时间范围）
                // 0 表示  当前默认时间,如果不写，表示为默认时间的前后100年 
                // 最小时间 必须 比 最大时间 小 ,如果 默认打开时间 没在 区间中，默认时间设置成最小时间
                minTime: "",// 可选最小时间（同默认时间格式）（可数字或时间字符串）
                maxTime: "",// 可选最大时间（同默认时间格式）可数字或时间字符串）
                defaultYears: "",//默认打开显示的年月(正常时间)  2022.07  2022-7-25  2022/7/2 10:00 或者 Date 时间

                ...options
            }

            this.currYears = {};//当前显示的年月
            this.appointTimeArr = [];//指定日期可选
            this.appointOnArr = [];//指定不可选日期可选
            this.minTimeJson = {};// minTime 转换好的时间
            this.maxTimeJson = {};// maxTime 装换好的时间
            this.dateMultiEles = {};//事件插件 元素对象 合集

            this.selectTimes = [];//选择的时间数组  列:[[2022,7,5],[2022,7,4]] //年月日
            this.selectObj = [];//选中的对象 数组  列: [obj,obj]
            this.selectPeriod = [];// 范围区间的过渡对象 合集

            // 初始化
            this.init();
        }
        // 初始化
        init() {
            // 转换 可选时间
            this.transformOptionaTime();

            // 创建
            this.create();
        }
        // 创建
        create() {
            // 创建对象
            let date_multi_popup = document.createElement("div");
            date_multi_popup.className = "date_multi_popup";
            // 背景
            let date_multi_bg = document.createElement("div");
            date_multi_bg.className = "date_multi_bg";
            date_multi_popup.append(date_multi_bg);

            // 内容盒子
            let date_multi_inner = document.createElement("div");
            date_multi_inner.className = "date_multi_inner";
            // 顶部按钮区
            let date_multi_title = document.createElement("div");
            date_multi_title.className = "date_multi_title";
            // 判断是否需要取消按钮
            let cancel_btn = "";
            if (this.options.isCancel) {
                cancel_btn = document.createElement("span")
                cancel_btn.innerHTML = this.options.cancelText;
                date_multi_title.append(cancel_btn);
            }
            // 标题
            let tp = document.createElement("p");
            tp.innerHTML = this.options.title;
            date_multi_title.append(tp);
            // 确认按钮
            let confirm_btn = document.createElement("span")
            confirm_btn.innerHTML = this.options.confirmText;
            date_multi_title.append(confirm_btn);
            // 塞入标题区
            date_multi_inner.append(date_multi_title);

            // 时间 选择 标题
            let date_multi_time = document.createElement("div");
            date_multi_time.className = "date_multi_title date_multi_time";
            // 时间选择 年月标题
            let time_tit = document.createElement("p");
            // 获取时间，并保存
            let time = this.getYearsDay(this.options.defaultYears, true);
            time_tit.innerHTML = time.year + "年" + time.month + "日"
            // 塞入 时间 和 按钮
            let prev_month = document.createElement("span");//上月
            let next_month = document.createElement("span");//下月
            date_multi_time.append(prev_month, time_tit, next_month);
            // 塞入时间标题
            date_multi_inner.append(date_multi_time);

            // 内容
            let date_multi_con = document.createElement("div");
            date_multi_con.className = "date_multi_con";
            // 塞入周期
            date_multi_con.append(this.createDateWeek())
            // 塞入内容
            date_multi_inner.append(date_multi_con);
            date_multi_popup.append(date_multi_inner);
            document.body.append(date_multi_popup);

            //保存 元素对象
            let dateMultiEles = {
                date_multi_popup,//盒子
                date_multi_bg,//背景
                cancel_btn,//取消按钮
                date_multi_title,//标题
                confirm_btn,//确认按钮
                time_tit,//时间标题(年月)
                prev_month,//上月按钮
                next_month,//下月按钮
                date_multi_con,//内容
                // date_list,//日期列表
            }
            // 合并
            this.dateMultiEles = {
                ...this.dateMultiEles,
                ...dateMultiEles
            }
            // 生成 css
            this.createdCss();
            // 是否显示
            if (this.options.isShow) {
                this.show();
            }

            // 初始化 事件
            this.initEvent();
        }
        // 显示
        show() {
            if (this.dateMultiEles.date_list) {
                this.dateMultiEles.date_list.remove();//删除
            }
            // 塞入 时间列表
            this.createDateList();

            setTimeout(() => {
                this.options.isShow = true;
                if (this.dateMultiEles['date_multi_popup']) {
                    this.dateMultiEles['date_multi_popup'].classList.add("date_multi_show");
                    document.body.style.overflow = "hidden"
                }
            }, 0)
        }
        // 关闭
        close() {
            this.options.isShow = false;
            if (this.dateMultiEles['date_multi_popup']) {
                this.dateMultiEles['date_multi_popup'].classList.remove("date_multi_show");
            }
            document.body.style.overflow = "visible";
            // 清楚 多余赋值
            this.clear();
        }
        // 清除
        clear() {
            this.selectTimes = [];//选择的时间数组  列:[[2022,7,5],[2022,7,4]] //年月日
            this.selectObj = [];//选中的对象 数组  列: [obj,obj]
            this.selectPeriod = [];// 范围区间的过渡对象 合集
        }
        // 销毁
        destroy() {
            try {
                // 删除 html
                this.dateMultiEles.date_multi_popup.remove();
                // 并且删除css
                let date_multi_func_css = document.getElementById("date_multi_func_css");
                date_multi_func_css.remove();

                // 移除事件
                this.removeEvent();

                dateFuncObj = null;
            } catch (err) { }
        }
        // 修改 css 选中圆角
        modifyCssRadius() {
            // 判断 当前圆角是否大于10
            if (this.options.selectRadius > 10) {
                this.options.selectRadius = 10;
            }
        }
        // 生成 css 样式
        createdCss() {
            let css = `
                :root {
                    --date_multi_func-selectBg: ${this.options.selectBg};
                    --date_multi_func-selectColor: ${this.options.selectColor};
                    --date_multi_func-tranBg: ${this.options.tranBg};
                    --date_multi_func-tranColor: ${this.options.tranColor};
                    --date_multi_func-selectRadius:${this.options.selectRadius}%;
                    --date_multi_func-color:${this.options.color};
                    --date_multi_func-background:${this.options.background};
                    --date_multi_func-opacity:rgba(0, 0, 0, ${this.options.opacity});
                }
                .date_multi_popup,.date_multi_popup *{
                    margin: 0;
                    padding: 0;
                }
                .date_multi_popup{
                    position: fixed;
                    z-index: 2000;
                    width: 100%;
                    height: 100%;
                    background: var(--date_multi_func-opacity);
                    font-size: 13px;
                    color: var(--date_multi_func-color);
                    top: 0;
                    left: 0;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-end;
                    align-items: center;
                    transition: all 0.2s;
                    opacity: 0;
                    visibility: hidden;
                }
                .date_multi_show{
                    opacity: 1;
                    visibility: visible;
                }
                .date_multi_popup .date_multi_bg{
                    position: absolute;
                    z-index: 1;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                }
                .date_multi_popup .date_multi_inner{
                    position: relative;
                    z-index: 5;
                    width: 100%;
                    background-color: var(--date_multi_func-background);
                    min-height: 20%;
                    padding-top: 6px;
                    box-shadow: 0px 0px 3px -1px #999;
                    transition: all 0.3s 0.2s;
                    transform: translateY(100%);
                    opacity: 0;
                }
                .date_multi_show .date_multi_inner{
                    transform: translateY(0);
                    opacity: 1;
                }
                .date_multi_popup .date_multi_title{
                    width: 100%;
                    position: relative;
                    line-height: 2.4;
                }
                .date_multi_popup .date_multi_title p{
                    font-size: 16px;
                    text-align: center;
                }
                .date_multi_popup .date_multi_title span{
                    height: 100%;
                    position: absolute;
                    font-size: 14px;
                    left: 0;
                    top: 0;
                    padding: 0 20px;
                }
                .date_multi_popup .date_multi_title span:last-child{
                    left: auto;
                    right: 0;
                }
                .date_multi_popup .date_multi_time{
                    line-height: 2.4;
                }
                .date_multi_popup .date_multi_time p{
                    font-weight: bold;
                }
                .date_multi_popup .date_multi_time span{
                    padding: 0 15%;
                }
                .date_multi_popup .date_multi_time span::after{
                    position: absolute;
                    content: "";
                    display: block;
                    width: 0;
                    height: 0;
                    border-left: 6px solid transparent;
                    border-right: 6px solid var(--date_multi_func-color);
                    border-top: 4px solid transparent;
                    border-bottom: 4px solid transparent;
                    left: 50%;
                    margin-left: -4px;
                    top: 50%;
                    margin-top: -6px;
                }
                .date_multi_popup .date_multi_time span:last-child::after{
                    border-left: 6px solid var(--date_multi_func-color);
                    border-right: 6px solid transparent;
                }
                
                .date_multi_popup .date_multi_con{
                    width: 100%;
                    padding: 0 10px 15px 10px;
                    box-sizing: border-box;
                }
                /* 星期 */
                .date_multi_popup .date_week{
                    width: 100%;
                    overflow: hidden;
                    margin-bottom: 8px;
                    margin-top: 5px;
                    pointer-events: none;
                    display: flex;
                }
                .date_multi_popup .date_week span{
                    width: 14.28%;
                    text-align: center;
                    font-size: 13px;
                    line-height: 2.1;
                }
                /* 日期 */
                .date_multi_popup .date_list{
                    width: 100%;
                    height:calc(2.8em * 6);
                    overflow: hidden;
                    font-size: 14px;
                    display: flex;
                    flex-wrap: wrap;
                    align-content:flex-start;
                }
                .date_multi_popup .date_list div{
                    display: block;
                    width: 14.28%;
                    overflow: hidden;
                    text-align: center;
                    line-height: 2.8em;
                    height: 2.8em;
                    position: relative;
                    z-index: 2;
                    transition: all 0.1s;
                }
                .date_multi_popup .date_list p{
                    display: block;
                    width: 100%;
                    overflow: hidden;
                    text-align: center;
                    line-height: 2.8em;
                    height: 2.8em;
                    position: relative;
                    z-index: 2;
                }
                /* 文本 */
                .date_multi_popup .date_list div span{
                    position: absolute;
                    bottom: 1px;
                    left: 0;
                    width: 100%;
                    text-align: center;
                    font-size: 12px;
                    line-height: 1;
                    z-index: 3;
                    transform: scale(0.7);
                }
                /* 不可选样式 */
                .date_multi_popup .date_list div.on_select{
                    opacity: 0.3;
                    pointer-events: none;
                }
                
                /* 选中样式 */
                /* 第一个和最后一个 圆样式*/
                .date_multi_popup .date_list .select_firstlast p:before{
                    position: absolute;
                    content: "";
                    width: 70%;
                    height: 0;
                    padding-top: 70%;
                    top: 50%;
                    transform: translateY(-50%);
                    left: 15%;
                    z-index: -1;
                    border-radius: var(--date_multi_func-selectRadius);
                    background-color: var(--date_multi_func-selectBg);
                }
                .date_multi_popup .date_list .select_firstlast{
                    color: var(--date_multi_func-selectColor);
                }
                /* 范围间样式 */
                .date_multi_popup .date_list .select_period{
                    color: var(--date_multi_func-tranColor);
                }
                .date_multi_popup .date_list .select_period p::after,
                .date_multi_popup .date_list .select_firstlast p::after
                {
                    position: absolute;
                    content: "";
                    width: 100%;
                    height: 0;
                    padding-top: 70%;
                    top: 50%;
                    transform: translateY(-50%);
                    left: 0;
                    z-index: -2;
                    background-color: var(--date_multi_func-tranBg);
                }
                .date_multi_popup .date_list .select_firstlast p::after{
                    width: 50%;
                    opacity: 0;
                }
                /* 闭合样式 */
                .date_multi_popup .date_list .select_first p::after,
                .date_multi_popup .date_list .select_last p::after{
                    opacity: 1;
                }
                .date_multi_popup .date_list .select_first p::after{
                    right:0;
                    left:auto;
                }
            `

            // 设置 参数样式
            let optionsCss = `
                /* 圆角 数组就用数组圆角  不是数组就用 上面圆角*/
                .date_multi_popup .date_multi_inner{
                    border-radius:${this.options.radius.length ? `${this.options.radius.join("px ")}px` : `${this.options.radius}px`};
                }
                /* 位置*/
                .date_multi_popup{
                    ${this.options.position == "top" ? `justify-content: flex-start` :
                    this.options.position == "center" ? `justify-content: center` : ''}
                }
                .date_multi_popup .date_multi_inner{
                    transform: translateY(${this.options.position == "top" ? `-100%` : this.options.position == "center" ? '50%' : '100%'});
                }
                .date_multi_show .date_multi_inner{
                    transform: translateY(0);
                }
            `

            css = css + optionsCss;


            let style = document.createElement('style');
            style.type = 'text/css';
            style.id = "date_multi_func_css";
            if (style.styleSheet) {
                style.styleSheet.cssText = css;
            } else {
                style.appendChild(document.createTextNode(css));
            }
            document.head.appendChild(style);
        }
        // 转换 最大最小时间 和 指定日期
        transformOptionaTime() {
            // 默认时间
            let defaultYears = this.getYearsDay(this.options.defaultYears);
            // 获取 最小时间 和 最大时间
            let minTimeJson = this.options.minTime;
            let maxTimeJson = this.options.maxTime;


            // 判断最小时间
            minTimeJson = this.getMaxMinTime(minTimeJson, 0);
            maxTimeJson = this.getMaxMinTime(maxTimeJson, 1);

            // 判断 最大时间 是否比 最小时间 小
            if (maxTimeJson.timestamp < minTimeJson.timestamp) {
                throw "最大时间应该比最小时间大！"
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
                    let isModifyCss = false;//是否修改css，如果有文本，那么选中样式得圆角就必须低于10
                    if (this.options.appointTime.length) {
                        let list = [];
                        // 组装数据
                        for (const item of this.options.appointTime) {
                            let appjson = {}
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
                        list.sort((a, b) => {
                            return a.timestamp - b.timestamp;
                        })
                        this.appointTimeArr = list;

                        // 判断 数组 第一个和最后一个，是否在 最大时间和最小时间 中
                        if (list.length) {
                            let min = list[0];
                            let max = "";
                            // 如果没有2个以上的数组时间，最后个时间就时第一个时间
                            list.length >= 2 ? max = list[list.length - 1] : max = min;

                            // 判断 如果 第一个的时间 比 最小时间 小，那么 最小时间就设置成 第一个时间
                            if (min.timestamp < minTimeJson.timestamp) {
                                minTimeJson = min;
                                // 并且，默认时间也改成最小时间
                                this.options.defaultYears = min.year + "." + min.month + "." + min.today
                            }
                            // 判断 最后个时间 是否 小于 最大时间
                            if (max.timestamp > maxTimeJson.timestamp) {
                                maxTimeJson = max;
                            }
                        }
                    } else if (this.options.appointOn.length) {
                        // 不可选日期，只有 appointTime 没有才有效
                        let list = [];
                        // 组装数据
                        for (const item of this.options.appointOn) {
                            let nojson = {}
                            if (item.date) {
                                nojson = this.getYearsDay(item.date);
                            } else {
                                nojson = this.getYearsDay(item);
                            }

                            if (item.text) {
                                nojson['text'] = item.text;
                                isModifyCss = true;
                            } else {
                                nojson['text'] = "";
                            }
                            list.push(nojson);
                        }
                        // 排序
                        list.sort((a, b) => {
                            return a.timestamp - b.timestamp;
                        })
                        this.appointOnArr = list;
                    }
                    // 判断是否需要修改 css
                    if (isModifyCss) {
                        this.modifyCssRadius()
                    }
                }
            } catch (err) { }
            // 保存
            this.minTimeJson = minTimeJson;
            this.maxTimeJson = maxTimeJson;
        }
        // 获取 最大最小时间  type  0: 最小时间   1: 最大时间
        getMaxMinTime(time, type) {
            // 默认时间
            let defaultYears = this.getYearsDay(this.options.defaultYears);
            try {
                switch (typeof time) {
                    case "string"://字符串
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
                            time = this.getYearsDay(`${defaultYears.year}.${defaultYears.month}.${defaultYears.today}`);
                        } else {
                            // 字符串时间
                            time = this.getYearsDay(time);//转换时间
                        }
                        break;
                    case "number"://数字
                        // 判断是否是整数
                        if (time % 1 === 0) {
                            time = Math.abs(time);//绝对值
                            // 判断 加减
                            if (type) {
                                // 最大时间，加
                                defaultYears.year = defaultYears.year + time;
                            } else {
                                // 最小时间，减
                                defaultYears.year = defaultYears.year - time;
                            }
                            time = this.getYearsDay(`${defaultYears.year}.${defaultYears.month}.${defaultYears.today}`);
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
        }
        // 获取 年 月 日 天数 1号位置  isSave:是否保存成 当前时间
        getYearsDay(time, isSave) {
            // 默认当前月
            let showTiem = new Date();

            // 判断是否 传了 时间
            if (time) {
                try {
                    // 把横线转成/线（ios 横线 会 NaN）
                    // 判断是否是字符串
                    if (typeof time == 'string') {
                        time = time.replace(/\-/g, "/");
                    }
                    time = new Date(time);
                    if (time == "Invalid Date") {
                        // 无效时间
                        throw err;
                    } else {
                        showTiem = time
                    }
                } catch (err) {
                    throw "时间格式错误"
                }
            }

            let year = showTiem.getFullYear(); //获取完整的年份
            let month = showTiem.getMonth() + 1; //获取当前月份(0-11,0代表1月),+1,1月就是1
            let today = showTiem.getDate(); //获取当前日(1-31)
            let currweek = showTiem.getDay(); //获取当前星期X(0-6,0代表星期天)
            let timestamp = new Date(`${year}.${month}.${today}`).getTime();//当前时间戳(凌晨时间00:00)

            // 0 代表 前一天
            let days = new Date(year, month, 0).getDate();//天数 这里 month :代表下一个月,下一个月的前一天
            let oneweek = new Date(year, month - 1, 1).getDay();//当前月1号星期(用于前面站位)

            // 判断是否保存当前时间
            if (isSave) {
                this.currYears = { year, month, today, currweek, days, oneweek, timestamp };
            }
            return { year, month, today, currweek, days, oneweek, timestamp }
        }
        // 生成 周期 元素
        createDateWeek() {
            let date_week = document.createElement("div");
            date_week.className = "date_week";
            for (let i = 1; i <= 7; i++) {
                let p = document.createElement("span");
                let inner = "周日"
                switch (i) {
                    case 1://周日
                        inner = "周日"
                        break;
                    case 2://周一
                        inner = "周一"
                        break;
                    case 3://周二
                        inner = "周二"
                        break;
                    case 4://周三
                        inner = "周三"
                        break;
                    case 5://周四
                        inner = "周四"
                        break;
                    case 6://周五
                        inner = "周五"
                        break;
                    case 7://周六
                        inner = "周六"
                        break;
                }
                p.innerHTML = inner;
                date_week.append(p)
            }
            return date_week;
        }
        // 生成 时间列表
        createDateList() {
            let date_list = document.createElement("div");
            date_list.className = "date_list";

            // 当前 时间
            let { year, month, days, oneweek } = this.currYears;

            // 设置 是否可以继续点击上月下月
            let minTimeJson = this.minTimeJson;
            let maxTimeJson = this.maxTimeJson;
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
            let arrList = this.getNoSelectDate();
            // 获取不可选日期
            let onSelects = arrList.onSelects;
            // 获取可选日期（只有指定日期才有）
            let apppintDate = arrList.apppintDate;


            // 循环次数 = 当前天数 + 1号星期(前面空白站位)
            let num = days + oneweek;
            for (let i = 0; i < num; i++) {
                let div = document.createElement("div");
                let p = document.createElement("p");
                // 在1号位置 开始塞入日期
                if (i >= oneweek) {
                    let today = i - oneweek + 1;
                    p.innerHTML = today;
                    // 判断 当前日期，是否是不可选日期
                    let isFind = onSelects.find(item => (item == today || item.today == today));
                    if (isFind) {
                        // 不可选，添加类
                        div.classList.add("on_select");
                    } else {
                        // 可选
                        // 设置 开始选中 结束选中样式
                        this.setFirstEndStyle(div, i);
                        // 监听点击事件
                        div.onclick = function () {
                            _this.dateClick(this)
                        }
                        // 获取 当前日期 是否是 指定日期
                        isFind = apppintDate.find(item => (item == today || item.today == today))
                    }
                    // 判断 是否需要添加文本
                    if (isFind && isFind.text) {
                        let span = document.createElement("span");
                        span.innerHTML = isFind.text;
                        div.append(span)
                    }
                }
                // 添加索引
                div.setAttribute("index", i);
                div.append(p);
                date_list.append(div);
            }
            // 塞入
            this.dateMultiEles.date_multi_con.append(date_list);
            this.dateMultiEles['date_list'] = date_list;//保存
            // 设置选择过渡样式
            this.setSectionStyle();
        }
        // 获取 不可选日期
        getNoSelectDate() {
            // 当前 时间
            let { year, month, days } = this.currYears;
            // 不可选日期
            let onSelects = [];
            // 可选日期(只有指定日期才有返回)
            let apppintDate = []
            // 判断是否有 指定日期 // 如果是 指定日期，那么 最小最大时间都不需要判断
            if (this.options.type != 2 && this.appointTimeArr.length) {
                // 获取 当前月 的 可选时间
                apppintDate = this.appointTimeArr.filter(item => item.year == year && item.month == month);

                // 循环天数，判断 当前日期 是否 不是 可选日期
                for (let i = 1; i <= days; i++) {
                    let isFind = apppintDate.find(item => item.today == i);
                    // 找不到，才加入 不可选日期
                    if (!isFind) onSelects.push(i);
                }
            } else {
                // 最大最小区间
                let minTimeJson = this.minTimeJson;
                let maxTimeJson = this.maxTimeJson;

                // 先判断 不可选日期
                if (this.options.type != 2 && this.appointOnArr.length) {
                    // 获取 当前月 的 不可选时间
                    let list = this.appointOnArr.filter(item => item.year == year && item.month == month);
                    onSelects.push(...list);
                }

                // 在判断
                // 当前月 在 最小月份上
                if (year == minTimeJson.year && month == minTimeJson.month) {
                    // 循环最小日期，最小日期 之前的 日期都不可选
                    for (let i = 1; i < minTimeJson.today; i++) {
                        // 判断 当前日期 是否已经在不可选中了
                        if (!onSelects.find(item => (item.today == i))) {
                            // 没找到，才塞入
                            onSelects.push(i);
                        }
                    }
                }
                // 当前月 在 最大月份上
                if (year == maxTimeJson.year && month == maxTimeJson.month) {
                    // 最大日期 之后的 日期都不可选
                    for (let i = maxTimeJson.today + 1; i <= days; i++) {
                        // 判断 当前日期 是否已经在不可选中了
                        if (!onSelects.find(item => (item.today == i))) {
                            // 没找到，才塞入
                            onSelects.push(i);
                        }
                    }
                }
            }

            return { onSelects, apppintDate };
        }


        // 初始化事件
        initEvent() {
            // 背景点击事件
            this.dateMultiEles.date_multi_bg.addEventListener("click", this.cancelFunc, false)
            // 取消按钮点击事件
            this.dateMultiEles.cancel_btn.addEventListener("click", this.cancelFunc, false)
            // 确认按钮点击事件
            this.dateMultiEles.confirm_btn.addEventListener("click", this.confirmFunc, false)

            // 上一月按钮点击
            this.dateMultiEles.prev_month.addEventListener("click", this.prevMonthClick, false)
            // 下一月按钮点击
            this.dateMultiEles.next_month.addEventListener("click", this.nextMonthClick, false)
        }
        // 移除事件
        removeEvent() {
            // 背景点击事件
            this.dateMultiEles.date_multi_bg.removeEventListener("click", this.cancelFunc, false)
            // 取消按钮点击事件
            this.dateMultiEles.cancel_btn.removeEventListener("click", this.cancelFunc, false)
            // 确认按钮点击事件
            this.dateMultiEles.confirm_btn.removeEventListener("click", this.confirmFunc, false)

            // 上一月按钮点击
            this.dateMultiEles.prev_month.removeEventListener("click", this.prevMonthClick, false)
            // 下一月按钮点击
            this.dateMultiEles.next_month.removeEventListener("click", this.nextMonthClick, false)
        }
        // 取消事件
        cancelFunc() {
            _this.close();
            // 通知取消
            _this.options.cancelFunc();
        }
        // 确认按钮点击事件
        confirmFunc() {
            // 判断是否选择了日期
            if (!_this.selectTimes.length) return;

            // 返回的 数组数据
            let res = _this.selectTimes;//返回数据


            // 时间区间，返回 开始和结束 json
            if (_this.options.type == 2) {
                if (!_this.selectTimes[1]) {
                    // 没有结束时间，把开始赋值给结束
                    _this.selectTimes[1] = _this.selectTimes[0];
                }
                res = {
                    statrTime: _this.selectTimes[0],
                    endTime: _this.selectTimes[1],
                }
            }

            // 回调
            _this.options.confirmFunc(res);
            // 关闭
            _this.close();
        }
        // 上个月点击
        prevMonthClick() {
            _this.prevNextMonthFunc();
        }
        // 下一月点击
        nextMonthClick() {
            _this.prevNextMonthFunc(true);
        }
        // 上一月 下一月 点击 type:false 上一月
        prevNextMonthFunc(type) {
            // 当前年月
            let { year, month } = _this.currYears;

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
            _this.getYearsDay(`${year}.${month}`, true);
            // 重新生成 列表
            _this.dateMultiEles.date_list.remove();//删除
            _this.createDateList();
            // 修改标题
            _this.dateMultiEles.time_tit.innerHTML = year + "年" + month + "日";
        }
        // 日期 点击事件
        dateClick(e) {
            let p = e.getElementsByTagName("p")[0];
            let text = e.getElementsByTagName("span")[0] ? e.getElementsByTagName("span")[0].innerText : "";

            //当前年月
            let { year, month } = this.currYears;
            let day = Number(p.innerText);
            let timeJson = {
                year: year,//年
                month: month,//月
                day: day,//日
                time: year + this.options.backFormat + month + this.options.backFormat + day,//时间字符串
                timestamp: new Date(`${year}.${month}.${day}`).getTime(),//时间戳
                text: text,//文本
            }
            // 给当前添加类
            e.classList.add("select_firstlast");

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
                let index = this.selectTimes.findIndex((v) => { return v.timestamp == timeJson.timestamp })
                if (index >= 0) {
                    // 取消
                    this.selectObj[index].classList.remove("select_firstlast");
                    // 删除数组对应数据
                    this.selectObj.splice(index, 1)
                    this.selectTimes.splice(index, 1)
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
                    for (let i = 0; i < this.selectObj.length; i++) {
                        this.selectObj[i].classList.remove("select_firstlast");
                    }
                    this.selectObj = [];
                    // 清空 选中过渡
                    this.cleanSelectPeriod();
                }

                // 判断 是否是第一次点击
                if (!this.selectTimes.length) {
                    this.selectTimes = [timeJson]
                    // 保存
                    this.selectObj = [e];
                    return;
                }

                // 第二次
                this.selectObj.push(e);
                this.selectTimes.push(timeJson)

                // 判断 开始和结束 是否取反(结束时间比开始时间小)
                this.isTimeReverse();
            }
        }

        // 时间区间**************************************
        // 判断 时间是否选反，选反了就自动回正
        isTimeReverse() {
            // 判断 开始时间 是否比 结束时间 大
            // 需要取反
            if (this.selectTimes[0].timestamp > this.selectTimes[1].timestamp) {
                // 取反时间
                let item = this.selectTimes[0];
                this.selectTimes[0] = this.selectTimes[1];
                this.selectTimes[1] = item;

                // 取反 元素对象
                item = this.selectObj[0];
                this.selectObj[0] = this.selectObj[1];
                this.selectObj[1] = item;
            }
            // 设置选中区间的过渡样式
            this.setSectionStyle();
        }
        // 重新设置 开始选中 结束选中样式
        setFirstEndStyle(div, i) {
            if (!(this.selectTimes.length >= 2) || !this.selectObj.length) return;
            // 判断 当前年月 是否是 选择元素的年月,并且索引对应
            //当前年月
            let { year, month } = this.currYears;
            let index = "";
            if (year == this.selectTimes[0].year && month == this.selectTimes[0].month) {
                // 开始
                index = Number(this.selectObj[0].getAttribute("index"))
                if (i == index) {
                    div.classList.add("select_firstlast");
                    // 重新 赋值
                    this.selectObj[0] = div;
                }
            }
            if (year == this.selectTimes[1].year && month == this.selectTimes[1].month) {
                // 结束
                index = Number(this.selectObj[1].getAttribute("index"))
                if (i == index) {
                    div.classList.add("select_firstlast");
                    // 重新 赋值
                    this.selectObj[1] = div;
                }
            }
        }
        // 设置选中区间的过渡样式
        setSectionStyle() {
            this.selectPeriod = [];//清空

            // 判断是否 选中了时间
            if (!(this.selectTimes.length >= 2)) return;

            // 判断 开始 和 结束 是否是一个时间
            if (this.selectTimes[0].timestamp == this.selectTimes[1].timestamp) return;

            let firstIndex = -1;//开始索引
            let lastIndex = -1;//结束索引
            let { year, month, days, oneweek } = this.currYears;//当前年月日

            // 判断 当前年月 是否是 选择元素的年月
            if (year == this.selectTimes[0].year && month == this.selectTimes[0].month) {
                // 开始选中在当前年月，设置开始索引
                firstIndex = Number(this.selectObj[0].getAttribute("index"));
            }

            if (year == this.selectTimes[1].year && month == this.selectTimes[1].month) {
                // 结束选中在当前年月，设置结束索引
                lastIndex = Number(this.selectObj[1].getAttribute("index"));
            }


            let forIndex = 0;//循环次数
            let objele = "";//元素

            // 开始 和 结束 在当前月
            if (firstIndex >= 0 && lastIndex >= 0) {
                // 在同 年月，就循环两者之间的次数 - 1
                forIndex = lastIndex - firstIndex - 1;
                objele = this.selectObj[0].nextSibling;//第一个的下一个
            }
            // 开始 在当前月
            if (firstIndex >= 0 && lastIndex < 0) {
                // 就循环 开始 到月份最后(天数 + 第一天的位置 = 总数量)
                forIndex = days + oneweek - firstIndex - 1;
                objele = this.selectObj[0].nextSibling;//第一个的下一个
            }
            // 结束 在当前月
            if (firstIndex < 0 && lastIndex >= 0) {
                // 就循环 第一天位置 到 结束位置
                forIndex = lastIndex - oneweek;
                objele = this.dateMultiEles.date_list.children[oneweek];//1号位置
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

            for (let i = 0; i < forIndex; i++) {
                // 从开始 一直循环 往下，添加类
                objele.className = "select_period";
                // 保存对象
                this.selectPeriod.push(objele);
                objele = objele.nextSibling;
            }

            // 给 开始 和 结束 添加 闭合类
            this.selectObj[0].classList.add("select_first");
            this.selectObj[1].classList.add("select_last");
        }
        // 清楚 选中过渡
        cleanSelectPeriod() {
            // 判断 是否为空
            if (this.selectPeriod.length) {
                // 清除样式
                for (let i = 0; i < this.selectPeriod.length; i++) {
                    this.selectPeriod[i].className = "";
                }
                // 清空
                this.selectPeriod = [];
            }
        }
    };

    // 关键代码（单列模型）
    let dateFuncObj = null;

    let dateMulti = function (options) {
        // 没参数
        if (typeof options == "undefined") {
            options = {};
        }
        // 参数格式错误
        if (typeof options != "object") {
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
}(window))
