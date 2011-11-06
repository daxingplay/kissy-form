/**
 * @fileoverview 异步文件上传组件
 * @author: 剑平（明河）<minghe36@126.com>,紫英<daxingplay@gmail.com>
 **/
KISSY.add(function(S, Base, Node,UrlsInput,IframeType,AjaxType) {
    var EMPTY = '',$ = Node.all,LOG_PREFIX = '[uploader]:';
    /**
     * @name Uploader
     * @class 异步文件上传组件，目前是使用ajax+iframe的方案，日后会加入flash方案
     * @constructor
     * @extends Base
     * @requires Node,IframeUploader,AjaxUploader
     */
    function Uploader(config){
        var self = this;
        //调用父类构造函数
        Uploader.superclass.constructor.call(self,config);
        
    }
    S.mix(Uploader,/** @lends Uploader*/{
            /**
             * 上传方式
             */
            type : {AUTO : 'auto',IFRAME : 'iframe',AJAX : 'ajax'},
            /**
             * 事件
             */
            event : {}
    });
    //继承于Base，属性getter和setter委托于Base处理
    S.extend(Uploader, Base, /** @lends Uploader.prototype*/{
            /**
             * 运行
             * @return {Uploader}
             */
            render : function(){
                var self = this,serverConfig = self.get('serverConfig'),
                    UploadType = self.getUploadType(),uploadType;
                if(!UploadType) return false;
                self._renderQueue();
                self._renderButton();
                self._renderUrlsInput();
                uploadType = new UploadType(serverConfig);
                self.set('uploadType',uploadType );
                //self.fire(Uploader.event.RENDER);
                return self;
            },
            /**
             * 上传文件
             * @param {Number} fileIndex 文件索引值
             */
            upload : function(fileIndex){
                if(!fileIndex) return false;
                var self = this,uploadType = self.get('uploadType'),
                    queue = self.get('queue'), oFile = queue.getFile(fileIndex);
                uploadType.upload();
            },
            /**
             * 是否支持ajax方案上传
             * @return {Boolean}
             */
            isSupportAjax : function(){
                return S.isObject(FormData);
            },
            /**
             * 获取上传方式类（iframe方案或ajax方案）
             * @return {IframeWay|AjaxWay}
             */
            getUploadType : function(){
                var self = this,type = self.get('type'),types = Uploader.type,
                isSupportAjax = self.isSupportAjax(),UploadType;
                switch(type){
                    case types.AUTO :
                        UploadType = isSupportAjax && AjaxType || IframeType;
                    break;
                    case types.IFRAME :
                        UploadType = IframeType;
                    break;
                    case types.AJAX :
                        UploadType = AjaxType;
                    break;
                    default :
                    S.log(LOG_PREFIX + 'type参数不合法，只允许配置值为'+types.AUTO + ',' + types.IFRAME + ',' + types.AJAX);
                    return false;
                }
                return UploadType;
            },
            /**
             * 运行Button上传按钮组件
             * @return {Button}
             */
            _renderButton : function(){
                var self = this,button = self.get('button');
                if (!S.isObject(button)) {
                    S.log(LOG_PREFIX + 'button参数不合法！');
                    return false;
                }
                //监听按钮改变事件
                button.on('change', self._select,self);
                //运行按钮实例
                button.render();
                return button;
            },
            /**
             * 选择完文件后
             */
            _select : function(ev){
                var self = this,autoUpload = self.get('autoUpload');
                self._appendToQueue(ev);
                autoUpload && self.upload();
            },
            /**
             * 运行Queue队列组件
             * @return {Queue} 队列实例
             */
            _renderQueue : function() {
                var self = this,queue = self.get('queue'),button = self.get('button');
                if (!S.isObject(queue)) {
                    S.log(LOG_PREFIX + 'queue参数不合法');
                    return false;
                }
                queue.render();
                return queue;
            },
            /**
             * 将文件添加到队列
             */
            _appendToQueue : function(fileObj){
                var self = this,queue = self.get('queue');
                queue.add();
            },
            /**
             * 向上传按钮容器内增加用于存储文件路径的input
             */
            _renderUrlsInput : function(){
                var self = this,button = self.get('button'),inputWrapper = button.target,
                    name  = self.get('urlsInputName'),
                    urlsInput = new UrlsInput(inputWrapper,{name : name});
                urlsInput.render();
                return urlsInput;
            }

    },{ATTRS : /** @lends Uploader*/{
            /**
             * Button按钮的实例
             */
            button : {value : {}},
            /**
             * Queue队列的实例
             */
            queue : {value : {}},
            /**
             * 采用的上传方案，auto：根据浏览器自动选择，iframe：采用iframe方案，ajax：采用ajax方案
             */
            type : {value : Uploader.type.AUTO},
            /**
             * 服务器端配置
             */
            serverConfig : {value : {action : EMPTY,data : {},dataType : 'json'}},
            /**
             * 是否允许上传文件
             */
            isAllowUpload : {value : true},
            /**
             * 是否自动上传
             */
            autoUpload : {value : true},
            /**
             * 存储文件路径的隐藏域的name名
             */
            urlsInputName : {value : EMPTY},
            uploadType : {value : {}}
    }});
    return Uploader;
},{requires:['base','node','./urlsInput','./type/iframe','./type/ajax']});