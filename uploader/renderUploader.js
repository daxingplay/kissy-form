/**
 * @fileoverview 运行文件上传组件
 * @author: 剑平（明河）<minghe36@126.com>
 *
 **/
KISSY.add(function(S,DOM,Uploader,Button,Queue,Auth) {
    /**
     * 解析组件在页面中data-config成为组件的配置
     * @param {String} hook 组件钩子
     * @param {String} dataConfigName 配置名
     * @return {Object}
     */
    S.parseComConfig = function(hook,dataConfigName){
        var config = {},sConfig,DATA_CONFIG = dataConfigName || 'data-config';
        sConfig = DOM.attr(hook,DATA_CONFIG);
        try{
           config = JSON.parse(sConfig);
        }catch(err){
            S.log('请检查'+DATA_CONFIG+'的格式是否符合规范');
        }
        return config;
    };

    /**
     * @name RenderUploader
     * @class 运行文件上传组件
     * @constructor
     * @param {String | HTMLElement} target 目标元素
     * @param {String | HTMLElement} queueTarget 文件队列目标元素
     * @param {Object} config 配置
     */
    function RenderUploader(target,queueTarget,config){
        var self = this;
        self.target = S.get(target);
        self.queueTarget = S.get(queueTarget);
        self.config = config || S.parseComConfig(target);
        self.uploader = {};
        self._init();
    }
    S.augment(RenderUploader,{
            /**
             * 初始化
             */
            _init : function(){
                var self = this, button = self._initButton(),queue = self._initQueue(),uploader;
                //配置参数增加上传按钮实例和上传队列实例
                S.mix(self.config, {button : button,queue : queue});
                //实例化上传组件
                uploader = new Uploader(self.config);
                uploader.render();
                self.uploader = uploader;
            },
            /**
             * 初始化模拟的上传按钮
             * @return {UploadButton}
             */
            _initButton : function(){
                var self = this,buttonConfig = {};
                //配置下文件路径隐藏域的name名
                if (self.config.urlsInputName) buttonConfig.urlsInputName = self.config.urlsInputName;
                //实例化上传按钮
                return new Button(self.target, buttonConfig);
            },
            /**
             * 初始化上传文件队列
             * @return {Queue}
             */
            _initQueue : function(){
                var self = this;
                //上传队列实例化
                return new Queue(self.queueTarget);
            },
            /**
             * 初始化上传凭证验证
             * @param {AjaxUploader} ajaxUploader AjaxUploader的实例
             */
            _initAuth : function(ajaxUploader){
                var tip = new Tip(btn, {autoRender:true,container : DOM.next(DOM.parent(hook.BUTTON), hook.TIP_CONTAINER)});
                return new Auth({ajaxUploader : ajaxUploader,tip : tip});
            }
        });
    return RenderUploader;
}, {requires:['dom','./uploader','./button','./queue','./auth']});