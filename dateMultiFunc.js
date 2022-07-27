
// 时间 选择 插件
; (function (undefined) {
    class dateMultiFunc {
        // options 参数 {}
        constructor(options) {
            this.options = {
                position: "bottom",//位置,默认底部 值：center top bottom
                radius: 0,//圆角  数字 或 数组  [0,0,0,0] 同 css border-radius
                selectBg: "#409EFE",//选中的背景颜色
                selectColor: "#ffffff",//选中文字颜色
                tranBg: "#A0CFFF",//过渡背景颜色
                tranColor: "#333333",//过渡文字颜色
                selectRadius: 100,//(百分比)选中的开始结束时间 圆角样式
                color: "#333333",//全局文字颜色
                background: "#ffffff",//背景颜色
                title: "选择时间",//标题
                isCancel: true,//是否显示取消按钮
                cancelText: "取消",//取消按钮文案
                cancelFunc: () => { },//取消回调
                confirmText: "确认",//确认按钮文案
                confirmFunc: () => { },//确认回调
                backFormat: ".",//返回格式(默认 . 分割)
                defaultYears: "",//默认打开显示的年月(正常时间)  2022.07  2022-7-25  2022/7/2 10:00 或者 Date 时间
                // 数字，表示 默认时间的 前后多少年（1表示默认时间的上一年为可选时间范围）
                // 0 表示  当前默认时间
                // 时间 表示 开始之前结束之后可选，其他不可选
                // 如果不写，表示为默认时间的前后100年
                minTime: "",// 可选开始时间（同默认时间格式）（可数字，可时间或时间字符串）
                maxTime: "",// 可选结束时间（同默认时间格式）可数字，可时间或时间字符串）
                isShow: false,//是否显示
                ...options
            }
            this.optionalStart = {};// minTime 转换好的时间
            this.optionalEnd = {};// maxTime 装换好的时间

            this.currYears = {};//当前显示的年月
            this.startTime = [];//选中的开始时间 年月日 [2022,7,5]
            this.endTime = [];//选中的结束时间 年月日 [2022,7,5]
            this.select_first = "";//选中的开始对象
            this.select_last = "";//选中的结束对象
            this.select_period = [];// 范围区间的过渡对象 合集

            this.dateMultiEles = {};//事件插件 元素对象 合集
            // 初始化
            this.init();
        }
        // 初始化
        init() {
            // 销毁
            this.destroy();
            // 转换 可选时间
            this.transformOptionaTime();
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
            this.startTime = [];//选中的开始时间 年月日 [2022,7,5]
            this.endTime = [];//选中的结束时间 年月日 [2022,7,5]
            this.select_first = "";//选中的开始对象
            this.select_last = "";//选中的结束对象
            this.select_period = [];// 范围区间的过渡对象 合集
        }
        // 销毁
        destroy() {
            this.clear();
            if (this.dateMultiEles.date_multi_popup) {
                this.dateMultiEles.date_multi_popup.remove();
            }
            this.optionalStart = {};// minTime 转换好的时间
            this.optionalEnd = {};// maxTime 装换好的时间

            this.currYears = {};//当前显示的年月

            this.dateMultiEles = {};
        }
        // 生成 css 样式
        createdCss() {
            let css = `
                :root {
                    --selectBg: ${this.options.selectBg};
                    --selectColor: ${this.options.selectColor};
                    --tranBg: ${this.options.tranBg};
                    --tranColor: ${this.options.tranColor};
                    --selectRadius:${this.options.selectRadius}%;
                    --color:${this.options.color};
                    --background:${this.options.background}
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
                    background: rgba(0, 0, 0, 0.7);
                    font-size: 13px;
                    color: var(--color);
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
                    background-color: var(--background);
                    min-height: 20%;
                    padding-top: 6px;
                    transition: all 0.3s 0.2s;
                    transform: translateY(100%);
                }
                .date_multi_show .date_multi_inner{
                    transform: translateY(0);
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
                    border-right: 6px solid var(--color);
                    border-top: 4px solid transparent;
                    border-bottom: 4px solid transparent;
                    left: 50%;
                    margin-left: -4px;
                    top: 50%;
                    margin-top: -6px;
                }
                .date_multi_popup .date_multi_time span:last-child::after{
                    border-left: 6px solid var(--color);
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
                    font-size: 15px;
                    display: flex;
                    flex-wrap: wrap;
                    align-content:flex-start;
                }
                .date_multi_popup .date_list p{
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
                /* 不可选样式 */
                .date_multi_popup .date_list p.on_select{
                    opacity: 0.3;
                    pointer-events: none;
                }
                
                /* 选中样式 */
                /* 第一个和最后一个 圆样式*/
                .date_multi_popup .date_list p.select_firstlast:before{
                    position: absolute;
                    content: "";
                    width: 70%;
                    height: 0;
                    padding-top: 70%;
                    top: 50%;
                    transform: translateY(-50%);
                    left: 15%;
                    z-index: -1;
                    border-radius: var(--selectRadius);
                    background-color: var(--selectBg);
                }
                .date_multi_popup .date_list p.select_firstlast{
                    color: var(--selectColor);
                }
                /* 范围间样式 */
                .date_multi_popup .date_list p.select_period{
                    color: var(--tranColor);
                }
                .date_multi_popup .date_list p.select_period::after,
                .date_multi_popup .date_list p.select_firstlast::after
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
                    background-color: var(--tranBg);
                }
                .date_multi_popup .date_list p.select_firstlast::after{
                    width: 50%;
                    opacity: 0;
                }
                /* 闭合样式 */
                .date_multi_popup .date_list p.select_first::after,
                .date_multi_popup .date_list p.select_last::after{
                    opacity: 1;
                }
                .date_multi_popup .date_list p.select_first::after{
                    right:0;
                    left:auto;
                }
            `

            // 设置 参数样式
            let optionsCss = `
                /* 圆角 数组就用数组圆角  不是数组就用 上面圆角*/
                .date_multi_popup .date_multi_inner{
                    border-radius:${this.options.radius.length ? `${this.options.radius.join("px ")}px` : `${this.options.radius}px ${this.options.radius}px 0 0`};
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
            if (style.styleSheet) {
                style.styleSheet.cssText = css;
            } else {
                style.appendChild(document.createTextNode(css));
            }
            document.head.appendChild(style);
        }
        // 转换 可选时间
        /* 
            数字，表示 默认时间的 前后多少年（1表示默认时间的上一年为可选时间范围）
            0 表示  当前默认时间
            时间 表示 开始之前结束之后可选，其他不可选
            如果不写，表示为默认时间的前后100年
        */
        transformOptionaTime() {
            // 默认时间
            let defaultYears = this.getYearsDay(this.options.defaultYears);
            // 获取 可选开始 和 可选结束 时间
            let optionalStart = this.options.minTime;
            let optionalEnd = this.options.maxTime;


            // 没有 可选开始时间
            try {
                if (optionalStart === "") {
                    // 默认时间 前 100年
                    defaultYears.year = defaultYears.year - 100;
                    optionalStart = defaultYears;
                } else if (Number(optionalStart) === 0) {
                    // 数字 0 ，当前默认时间
                    optionalStart = defaultYears;
                } else if (this.isString(optionalStart)) {
                    // 字符串时间
                    // 判断 是否比 默认时间 小
                    let tiem = this.getYearsDay(optionalStart);
                    if (tiem.timestamp <= defaultYears.timestamp) {
                        optionalStart = tiem
                    } else {
                        // 可选开始时间比默认时间大了
                        throw "minTime 时间 比 默认时间 大了！";
                    }
                } else if (this.isNumber(optionalStart)) {
                    // 整数数字
                    defaultYears.year = defaultYears.year - optionalStart;
                    optionalStart = defaultYears;
                } else {
                    // 有问题
                    throw "minTime 不正确！";
                }
            } catch (err) {
                throw err;
            }



            try {
                defaultYears = this.getYearsDay(this.options.defaultYears);
                // 没有 可选结束时间
                if (optionalEnd === "") {
                    // 默认时间 前 100年
                    defaultYears.year = defaultYears.year + 100;
                    optionalEnd = defaultYears;
                } else if (Number(optionalEnd) === 0) {
                    // 数字 0 ，当前默认时间
                    optionalEnd = defaultYears;
                } else if (this.isString(optionalEnd)) {
                    // 字符串时间
                    // 判断 是否比 默认时间 大
                    let tiem = this.getYearsDay(optionalEnd);
                    if (tiem.timestamp >= defaultYears.timestamp) {
                        optionalEnd = tiem
                    } else {
                        // 可选开始时间比默认时间小了
                        throw "maxTime 时间 比 默认时间 小了！";
                    }
                } else if (this.isNumber(optionalEnd)) {
                    // 整数数字
                    defaultYears.year = defaultYears.year + optionalEnd;
                    optionalEnd = defaultYears;
                } else {
                    // 有问题
                    throw "maxTime 不正确！";
                }
            } catch (err) {
                throw err;
            }


            // 保存
            this.optionalStart = optionalStart;
            this.optionalEnd = optionalEnd;
        }
        // 判断是否是 字符串
        isString(str) {
            return (typeof str == 'string') && str.constructor == String
        }
        // 判断是否是 数字
        isNumber(num) {
            return (typeof num == 'number') && num % 1 === 0
        }
        // 获取 年 月 日 天数 1号位置  isSave:是否保存成 当前时间
        getYearsDay(time, isSave) {
            // 默认当前月
            let showTiem = new Date();

            // 判断是否 传了 时间
            if (time) {
                try {
                    // 把横线转成/线（ios 横线 会 NaN）
                    time = time.replace(/\-/g, "/");
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
            // 可选范围时间
            let optionalStart = this.optionalStart;
            let optionalEnd = this.optionalEnd;
            let today = 0;//几号
            let type = 0;  // 1:表示几号之前   2:表示几号几后 
            // 判断当前时间是否在 可选范围之外
            if (year == optionalStart.year && month == optionalStart.month) {
                // today 之前的时候都不可选
                type = 1;
                today = optionalStart.today;
                // 前面的时间不可选了
                this.dateMultiEles.prev_month.style.display = "none";
            } else {
                this.dateMultiEles.prev_month.style.display = "block";
            }

            if (year == optionalEnd.year && month == optionalEnd.month) {
                // today 之后的时间都不可选
                type = 2;
                today = optionalEnd.today;
                // 后面的时间不可选了
                this.dateMultiEles.next_month.style.display = "none";
            } else {
                this.dateMultiEles.next_month.style.display = "block";
            }


            // 循环次数 = 当前天数 + 1号星期(前面空白站位)
            let num = days + oneweek;
            for (let i = 0; i < num; i++) {
                let p = document.createElement("p");
                // 在1号位置 开始塞入日期
                if (i >= oneweek) {
                    let text = i - oneweek + 1;
                    p.innerHTML = text;
                    // 判断 可选范围是否在当前月
                    if (type == 1 && today > text) {
                        // 可选开始在当前月
                        p.classList.add("on_select")
                    } else if (type == 2 && today < text) {
                        // 可选结束在当前月
                        p.classList.add("on_select")
                    } else {
                        // 可选
                        // 设置 开始选中 结束选中样式
                        this.setFirstEndStyle(p, i);
                        // 添加点击事件
                        p.addEventListener("click", (e) => {
                            this.dateClick(e)
                        }, false)
                    }

                }
                // 添加索引
                p.setAttribute("index", i);
                date_list.append(p);
            }
            // 塞入
            this.dateMultiEles.date_multi_con.append(date_list);
            this.dateMultiEles['date_list'] = date_list;//保存
            // 设置选择过渡样式
            this.setSectionStyle();
        }

        // 初始化事件
        initEvent() {
            // 背景点击事件
            this.dateMultiEles.date_multi_bg.addEventListener("click", () => {
                this.close();
                // 通知取消
                this.options.cancelFunc();
            }, false)
            // 取消按钮点击事件
            this.dateMultiEles.cancel_btn.addEventListener("click", () => {
                this.close();
                // 通知取消
                this.options.cancelFunc();
            }, false)
            // 确认按钮点击事件
            this.dateMultiEles.confirm_btn.addEventListener("click", () => {
                this.confirmFunc();
            }, false)

            // 上一月按钮点击
            this.dateMultiEles.prev_month.addEventListener("click", () => {
                this.prevNextMonthFunc();
            }, false)
            // 下一月按钮点击
            this.dateMultiEles.next_month.addEventListener("click", () => {
                this.prevNextMonthFunc(1);
            }, false)
        }
        // 确认按钮点击事件
        confirmFunc() {
            // 判断是否选择了日期
            if (!this.startTime.length) return;

            // 判断是否有结束时间，没有结束时间，把开始赋值给结束
            if (!this.endTime.length) {
                this.endTime = this.startTime;
            }

            // 回调参数
            let options = {
                startTime: {
                    year: this.startTime[0],//年
                    month: this.startTime[1],//月
                    day: this.startTime[2],//日
                    time: this.startTime.join(this.options.backFormat),//时间字符串
                },
                endTime: {
                    year: this.endTime[0],//年
                    month: this.endTime[1],//月
                    day: this.endTime[2],//日
                    time: this.endTime.join(this.options.backFormat)
                }
            }
            // 回调
            this.options.confirmFunc(options);
            // 关闭
            this.close();
        }
        // 上一月 下一月 点击 type:false 上一月
        prevNextMonthFunc(type) {
            // 当前年月
            let { year, month } = this.currYears;

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
            this.getYearsDay(`${year}.${month}`, true);
            // 重新生成 列表
            this.dateMultiEles.date_list.remove();//删除
            this.createDateList();
            // 修改标题
            this.dateMultiEles.time_tit.innerHTML = year + "年" + month + "日";
        }
        // 日期 点击事件
        dateClick(e) {
            //当前年月
            let { year, month } = this.currYears;
            // 判断 是否是第一次点击
            if (!this.startTime.length) {
                // 给点击元素添加第一次类
                this.select_first = e.target;
                this.select_first.classList.add("select_firstlast");
                let day = Number(e.target.innerText);
                this.startTime = [year, month, day];
                return;
            }

            // 不是第一次，就是结束日期
            if (!this.endTime.length) {
                // 给点击元素添加最后类
                this.select_last = e.target;
                this.select_last.classList.add("select_firstlast");
                let day = Number(e.target.innerText);
                this.endTime = [year, month, day];
                // 判断 开始和结束 是否取反(结束时间比开始时间小)
                this.isTimeReverse();
                return;
            }

            // 已经选择了开始和结束，再次点击，重新选择
            // 清空 选中过渡
            this.cleanSelectPeriod();
            // 移除之前的
            this.select_first.className = "";
            this.select_last.className = "";
            this.endTime = [];

            // 给点击元素添加第一次类
            this.select_first = e.target;
            this.select_first.classList.add("select_firstlast");
            let day = Number(e.target.innerText);
            this.startTime = [year, month, day];
        }
        // 判断 时间是否选反，选反了就自动回正
        isTimeReverse() {
            // 判断 开始年月日 和 结束年月日

            // 需要取反
            if (this.endTime[0] < this.startTime[0] || // 结束年份 小于 开始年份
                (this.endTime[0] == this.startTime[0] && this.endTime[1] < this.startTime[1]) || // 年份相同，结束月份 小于 开始月份
                (this.endTime[0] == this.startTime[0] && this.endTime[1] == this.startTime[1] && this.endTime[2] < this.startTime[2]) // 年月相同，结束日期 小于 开始日期
            ) {
                // 需要取反
                // 时间取反
                let item = this.startTime;
                this.startTime = this.endTime;
                this.endTime = item;

                // 元素取反
                item = this.select_first;
                this.select_first = this.select_last;
                this.select_last = item;
            }

            // 设置选中区间的过渡样式
            this.setSectionStyle();
        }
        // 重新设置 开始选中 结束选中样式
        setFirstEndStyle(p, i) {
            // 判断 当前年月 是否是 选择元素的年月,并且索引对应
            //当前年月
            let { year, month } = this.currYears;
            if (this.startTime.length && year == this.startTime[0] && month == this.startTime[1]) {
                let index = Number(this.select_first.getAttribute("index"))
                if (i == index) {
                    // 开始选中在其中
                    p.classList.add("select_firstlast");
                    this.select_first = p;//重新赋值，因为已经替换了，它已经是过去的对象了
                }
            }

            if (this.endTime.length && year == this.endTime[0] && month == this.endTime[1]) {
                let index = Number(this.select_last.getAttribute("index"))
                if (i == index) {
                    // 结束选中在其中
                    p.classList.add("select_firstlast");
                    this.select_last = p;//重新赋值，因为已经替换了，它已经是过去的对象了
                }
            }
        }
        // 设置选中区间的过渡样式
        setSectionStyle() {
            this.select_period = [];//清空

            // 判断是否 选中了时间
            if (!this.startTime.length || !this.endTime.length) return;

            // 判断 开始 和 结束 是否是一个时间
            if (this.startTime[0] == this.endTime[0] && this.startTime[1] == this.endTime[1] && this.startTime[2] == this.endTime[2]) {
                return;
            }

            let firstIndex = -1;//开始索引
            let lastIndex = -1;//结束索引
            let { year, month, days, oneweek } = this.currYears;

            // 判断 当前年月 是否是 选择元素的年月
            if (year == this.startTime[0] && month == this.startTime[1]) {
                // 开始选中在当前年月，设置开始索引
                firstIndex = Number(this.select_first.getAttribute("index"));
            }

            if (year == this.endTime[0] && month == this.endTime[1]) {
                // 结束选中在当前年月，设置结束索引
                lastIndex = Number(this.select_last.getAttribute("index"));
            }


            let forIndex = 0;//循环次数
            let objele = "";//元素

            // 开始 和 结束 在当前月
            if (firstIndex >= 0 && lastIndex >= 0) {
                // 在同 年月，就循环两者之间的次数 - 1
                forIndex = lastIndex - firstIndex - 1;
                objele = this.select_first.nextSibling;//第一个的下一个
            }
            // 开始 在当前月
            if (firstIndex >= 0 && lastIndex < 0) {
                // 就循环 开始 到月份最后(天数 + 第一天的位置 = 总数量)
                forIndex = days + oneweek - firstIndex - 1;
                objele = this.select_first.nextSibling;//第一个的下一个
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
                if (year >= this.startTime[0] && year <= this.endTime[0] && month >= this.startTime[1] && month <= this.endTime[1]) {
                    // 在区间中，就当前月1号 到 当前月最后天
                    forIndex = days;
                    // 开始位置，就是 oneweek（1号位置索引）
                    objele = this.dateMultiEles.date_list.children[oneweek];
                }
            }

            for (let i = 0; i < forIndex; i++) {
                // 从开始 一直循环 往下，添加类
                objele.className = "select_period";
                // 报错对象
                this.select_period.push(objele);
                objele = objele.nextSibling;
            }

            // 给 开始 和 结束 添加 闭合类
            this.select_first.classList.add("select_first");
            this.select_last.classList.add("select_last");
        }
        // 清楚 选中过渡
        cleanSelectPeriod() {
            // 判断 是否为空
            if (this.select_period.length) {
                // 清除样式
                for (let i = 0; i < this.select_period.length; i++) {
                    this.select_period[i].className = "";
                }
                // 清空
                this.select_period = [];
            }
        }
    }

    // 关键代码（单列模型）
    let dateFuncObj = null;

    let dateMulti = function (options) {
        // 没参数
        if (typeof options == "undefined") {
            options = {};
        }
        // 参数格式错误
        if (typeof options != "object") {
            throw "参数格式错误！"
        }

        if (dateFuncObj) {
            // 已创建，重新初始化
            // 合并
            dateFuncObj.options = {
                ...dateFuncObj.options,
                ...options
            }
            // 初始化
            dateFuncObj.init();
        } else {
            // 没创建
            dateFuncObj = new dateMultiFunc(options)
        }
    }

    // 原型链，增加打开方法
    dateMulti.prototype.show = function () {
        if (dateFuncObj) {
            dateFuncObj.show();
        } else {
            throw "请先创建！"
        }
    }

    // 全局对象
    let _global = (function () { return this || (0, eval)('this'); }());


    // 判断环境
    if (typeof module !== "undefined" && module.exports) {
        module.exports = dateMulti;
    } else if (typeof define === "function" && define.amd) {
        define(function () { return dateMulti; });
    } else {
        // 判断 方法 是否在 全局对象中
        !("dateMulti" in _global) && (_global.dateMulti = dateMulti);
    }
}())
