
// 时间 选择 插件
class dateMultiFunc{
    // options 参数 {}
    constructor(options){
        this.options = {
            isShow:false,//是否显示
            ...options
        }
        this.dateMultiEle = document.querySelector(".date_multi_popup");//时间插件元素
        this.init();
    }
    // 初始化
    init(){
        
    }
    // 显示
    show(){
        this.options.isShow = true;
        this.dateMultiEle.classList.add("date_multi_show");
    }
}
export default dateMultiFunc;