# 移动端-时间选择多功能插件

### 1、介绍
移动端-时间选择多功能插件；支持 单选，多选，时间范围，指定时间选择，不可选时间
<!-- github 地址: [blog.gitee.com](https://blog.gitee.com)  -->



### 2、使用说明

>引入： `<script src="./dateMultiFunc.js"></script>`

使用:
```js
let dateMulti = new dateMultiFunc({
    defaultYears: "",
    minTime: "",
    maxTime: 0,
    appointOn: ["2022.7.3", "2022.7.10"],
    isShow: true,
    type: 1,
    cancelFunc: () => {
        // 取消
        console.log("取消")
    },
    confirmFunc: (res) => {
        // 确认
        console.log(res)
    }
});
```


### 3、参数说明

参数名 | 参数作用 | 参数类型|默认值 | 描述
:------ | :------|:------:|:------:|:------:
type | 类型 | Number        |0 | 0:单选  1:多选  2:时间范围
position | 弹出位置 | String        |bottom | bottom, center, top
radius   | 圆角     | Number \| Array |   0   | 同css的border-radius
color | 全局文字颜色     | color |   #333333   | 颜色值
background | 内容的背景颜色     | color |   #ffffff   | 颜色值
opacity | 遮罩的透明度     | Number |   0.7   | 0-1
selectBg | 选中时间的背景颜色     | color |   #409EFE   | 颜色值
selectColor | 选中时间的文字颜色     | color |   #ffffff   | 颜色值
selectRadius | 选中时间的圆角     | Number |   100   |  0 - 100，百分比
tranBg | 过渡背景颜色    | color |   #A0CFFF   |  颜色值，type为2有效，选择的开始和结束时间之间的元素的背景颜色
tranColor | 过渡文字颜色     | color |   #333333   |  颜色值，type为2有效，选择的开始和结束时间之间的元素的文字颜色
title | 标题     | String |   选择时间   |  
isCancel | 是否不显示取消按钮     | Boolean |   false   | true,false
cancelText | 取消按钮文案     | String |   取消   | 
confirmText | 确认按钮文案     | String |   确认   | 
backFormat | 返回时间格式     | String |   .   |  返回时间的拼接字符
isShow | 是否初始化完成就自动显示     | Boolean |   false  | true,false
||||  优先级: (指定日期  >  指定不可选日期)(type=2无效) > 最大最小时间  >  默认时间
||||    指定日期如果不在最大最小时间范围中，最大最小时间会自动设置成 指定日期中的最大最小时间
||||    最大最小时间范围 没 包含 默认时间，默认时间会自动设置成最小时间
appointTime | 指定可选日期     | Array |   []  | type 0  1 有效，字符串数组 和 json数组(可带上文本)  列:["2022.7.1","2020.7.3"]  [{date:"2022.7.1",text:"111"},{date:"2022.7.2",text:"222"}]
appointOn | 指定不可选日期     | Array |   []  | 同上
minTime | 可选最小时间     | Number \| String |  ""  |  Number：表示年数，默认时间的多少年前。<br/>String：不写天数，表示当月1号
maxTime | 可选最大时间     | Number \| String |  ""  |  同上
defaultYears | 默认打开显示的年月     | String \| Date |  ""  |  时间字符串 或 时间
|||| 事件参数
cancelFunc | 取消回调     | function |  () => { }  |  cancelFunc: () => {console.log("取消")}
confirmFunc | 确认回调     | function |  (res) => { }  |  confirmFunc: (res) => {console.log("确认")}<br/> res 为 数组；type为2是返回的是 statrTime 和 endTime 的 json




### 4、可用方法

1. 显示方法 ： `show()`
2. 销毁方法 ： `destroy()`

列子
```js
 let dateMulti = new dateMultiFunc();
 dateMulti.show();
 dateMulti.destroy();
```



