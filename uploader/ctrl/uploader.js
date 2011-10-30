/**
 * @fileoverview ajax文件上传组件
 * @author: 剑平（明河）<minghe36@126.com>
 **/
KISSY.add(function(S, DOM, Base, Event, JSON) {
    var EMPTY = '',
        //控制台
        console = console || S,LOG_PREFIX = '[ajaxUploader]:';
    /**
     * @name AjaxUploader
     * @class 异步文件上传组件
     * @version 1.0
     * @constructor
     * @augments KISSY.Base
     * @requires Auth Button Queue
     * @param {Object} config 配置对象
     * @property {HTMLElement} form 指向组件生成的表单元素
     * @description
     * 利用iframe来实现的文件的异步上传，每当上传一个文件，组件会预先生成一个form和iframe，文件上传
     * 验证，请看{@link Auth}
     * @see <a href="">demo1</a>
     * @example
     * var uploadButton = new UploadButton(hook.BUTTON,buttonConfig),
     * queue = new Queue(hook.QUEUE,queueConfig),
     * ajaxUploadConfig = {button : uploadButton,queue : queue};
     * ajaxUploader = new AjaxUpload(ajaxUploadConfig);
     * ajaxUploader.render();
     */
    function AjaxUploader(config) {
        var self = this;
        self.form = EMPTY;
        //超类初始化
        AjaxUploader.superclass.constructor.call(self, config);
    }

    //继承于KISSY.Base
    S.extend(AjaxUploader, Base);
    S.mix(AjaxUploader,/**@lends AjaxUploader*/ {
            /**
             * 支持的模板
             */
            tpl : {
                'default' : {
                    IFRAME : '<iframe src="javascript:false;" name="{id}" id="{id}" />',
                    FORM : '<form method="post" enctype="multipart/form-data" action="{action}" target="{target}">{hiddenInput}</form>',
                    HIDDEN_INPUT : '<input type="hidden" name="{name}" value="{value}" />'
                }
            },
            /**
             * @description
             * <p>组件支持的事件</p>
             * <ul><li>RENDER : 运行后触发</li>
             * <li>UPLOAD_START : 开始上传后触发</li>
             * <li>UPLOAD_COMPLETE : 上传完成后触发</li>
             * <li>UPLOAD_SUCCESS ： 上传成功后触发</li>
             * <li>UPLOAD_ERROR : 上传失败后触发</li></ul>
             */
            event :{
                //运行
                RENDER : 'render',
                //开始上传
                UPLOAD_START : 'uploadStart',
                //上传完成（在上传成功或上传失败后都会触发）
                UPLOAD_COMPLETE :'uploadComplete',
                //上传成功
                UPLOAD_SUCCESS : 'uploadSuccess',
                //上传失败
                UPLOAD_ERROR : 'uploadError'
            },
            /**
             * 生成iframe的id起始
             */
            ID : 0,
            /**
             * 获取自动递增的id（主要用于iframe）
             * @return {String}
             */
            getIframeId : function() {
                AjaxUploader.ID++;
                return 'ajax-uploader-iframe-' + AjaxUploader.ID;
            }
        });
    /**
     * @description
     * <p>组件默认参数（该属性寄生于KISSY.Base，让配置项拥有getter和setter方法）</p>
     * <ul>
     *     <li>button:文件上传按钮实例</li>
     *     <li>queue:文件上传后队列实例</li>
     *     <li>action:上传表单提交后服务器端接受数据的路径</li>
     *     <li>inputName:文件上传域名称</li>
     *     <li>multiple:是否开启多选</li>
     *     <li>data:向服务器发送的参数</li>
     *     <li>autoUpload:选择完文件后自动上传文件</li>
     *     <li>dataType:服务器返回的数据类型，默认是json格式，目前只预制json的处理</li>
     *     <li>tpl:模板</li>
     * </ul>
     */
    AjaxUploader.ATTRS = {
        /**
         * 文件上传按钮实例
         * @type Object
         */
        button : {
            value : EMPTY
        },
        /**
         * 文件上传后队列实例
         * @type Object
         */
        queue : {
            value : EMPTY
        },
        /**
         * 上传表单提交后服务器端接受数据的路径
         * @type String
         */
        action : {
            value : 'testData.html'
        },
        /**
         * 文件上传域名称
         * @type String
         */
        inputName : {
            value : 'image'
        },
        /**
         * 是否开启多选
         * @type Boolean
         */
        multiple : {
            value : false
        },
        /**
         * 向服务器发送的参数
         * @type Object
         */
        data : {
            value : {}
        },
        /**
         * 选择完文件后自动上传文件
         * @type Boolean
         */
        autoUpload : {
            value : true
        },
        /**
         * 服务器返回的数据类型，默认是json格式，目前只预制json的处理
         * @type String
         */
        dataType : {
            value : 'json'
        },
        /**
         * 模板
         * @type Object
         */
        tpl : {
            value : AjaxUploader.tpl['default']
        },
        /**
         * 是否允许上传
         * @type Boolean
         */
        isAllowUpload : {
            value : true
        }
    };
    /**
     * 方法
     */
    S.augment(AjaxUploader,
        /**@lends AjaxUploader.prototype */
        {
            /**
             * 运行
             * @return {Object} AjaxUploader的实例
             */
            render : function() {
                var self = this,button,queue,auth;
                button = self._initButton();
                queue = self._initQueue();
                //缺少Button或Queue实例直接退出
                if (!button || !queue) return false;
                self.fire(AjaxUploader.event.RENDER);
                return self;
            },
            /**
             * 开始上传
             * @since v1.0.1
             * @param {String} fileName 文件名
             * @return {Object} AjaxUploader的实例
             */
            upload : function(fileName) {
                var self = this,iframe = self._createIframe(),
                    form = self._createForm(iframe),
                    button = self.get('button'),inputName = self.get('inputName');
                if (!button.fileInput) return false;
                //文件上传前触发的事件
                self.fire(AjaxUploader.event.UPLOAD_START, {'fileName' : fileName});
                //是否取消上传
                if(!self.get('isAllowUpload')){
                    console.log(LOG_PREFIX + 'isAllowUpload为false，阻止文件上传！');
                    return false;
                }
                self._queueAdd({'name':fileName});
                DOM.append(button.inputContainer, form);
                //设置输入框的name值
                button.set('name', inputName);
                //提交表单
                form.submit();
                //文件名
                fileName = fileName || DOM.val(button.fileInput);
                //获取服务器端返回的数据
                self._getResponse(iframe, fileName);
                self._removeForm();
                button.resetInput();
                return self;
            },
            /**
             * 初始化按钮实例
             * @return {Object} 按钮实例
             */
            _initButton : function() {
                var self = this,button = self.get('button'),autoUpload = self.get('autoUpload');
                if (!S.isObject(button)) {
                    console.log(LOG_PREFIX + '缺少Button实例！');
                    return false;
                }
                //运行按钮实例
                button.render();
                //监听按钮改变事件
                button.on('change', function(ev) {
                    autoUpload && self.upload(ev.fileName);
                });
                return button;
            },
            /**
             * 初始化队列
             * @return {Object} 队列实例
             */
            _initQueue : function() {
                var self = this,queue = self.get('queue'),button = self.get('button'),
                    urlsInput = button.urlsInput,urls,index;
                if (!S.isObject(queue)) {
                    console.log(LOG_PREFIX + '缺少Queue实例！');
                    return false;
                }
                queue.render();
                //删除队列中文件后触发
                queue.on('removeItem',function(ev){
                    urls = DOM.val(urlsInput).split(',');
                    if(!urls.length) return false;
                    urls = S.filter(urls,function(url,i){
                        return ev.index != i;
                    });
                    DOM.val(urlsInput,urls.join(','));
                });
                return queue;
            },
            /**
             * 创建一个空的iframe，用于文件上传表单提交后返回服务器端数据
             * @return {HTMLElement}
             */
            _createIframe : function() {
                var self = this,id = AjaxUploader.getIframeId(),tpl = self.get('tpl'),iframe;
                if (!S.isObject(tpl) || !tpl.IFRAME) return false;
                //创建处理上传的iframe
                iframe = S.substitute(tpl.IFRAME, {'id' : id});
                iframe = DOM.create(iframe);
                DOM.hide(iframe);
                DOM.append(iframe, "body");
                return iframe;
            },
            /**
             * 创建文件上传表单
             * @param {HTMLElement} iframe iframe元素
             * @return {HTMLElement}
             */
            _createForm : function(iframe) {
                var self = this, tpl = self.get('tpl'),action = self.get('action'),form,
                    data = self.get('data'),hiddenInputHtml = EMPTY;
                if (!S.isObject(tpl) || !tpl.FORM || !tpl.HIDDEN_INPUT) return false;
                if (!S.isEmptyObject(data)) {
                    for (var k in data) {
                        hiddenInputHtml += S.substitute(tpl.HIDDEN_INPUT, {'name' : k,'value' : data[k]});
                    }
                }
                form = S.substitute(tpl.FORM, {'action' : action,'target' : DOM.attr(iframe, 'name'),'hiddenInput' : hiddenInputHtml});
                form = DOM.create(form);
                DOM.append(form, "body");
                return self.form = form;
            },
            /**
             * 移除表单元素
             */
            _removeForm : function() {
                var self = this,form = self.form;
                if (form == null) return false;
                DOM.remove(form);
                self.form = EMPTY;
            },
            /**
             * 获取服务器端返回的数据
             * @param {HTMLElement} iframe iframe元素
             * @param {String} fileName 文件名
             */
            _getResponse : function(iframe, fileName) {
                var self = this,doc,response,dataType = self.get('dataType');
                Event.on(iframe, 'load', function() {
                    doc = iframe.contentDocument || window.frames[iframe.id].document;
                    // 修正Opera 9.26,10.00下bug（Opera在DOM没准备完毕前会多次触发load事件）
                    //if (doc.readyState && doc.readyState != 'complete')  return false;
                    //修正Opera 9.64下的bug（当body.innerHTML的值变成false时，事件会触发二次）
                    //if (doc.body && doc.body.innerHTML == "false")  return false;
                    //结果集为xml文档
                    if (doc.XMLDocument) {
                        response = doc.XMLDocument;
                    } else if (doc.body) {
                        //结果集为html片段
                        response = doc.body.innerHTML;
                        //结果集希望是json数据类型
                        if (dataType && dataType.toLowerCase() == 'json') {
                            response = response && JSON.parse(response) || {};
                        }
                    } else {
                        // response is a xml document
                        response = doc;
                    }
                    self._processResponse(response);
                    self.fire(AjaxUploader.event.UPLOAD_COMPLETE, {'data' : response,'fileName' : fileName});
                    // 修正IE页面最小内容填充的bug，导致
                    iframe.src = "javascript:'<html></html>';";
                    DOM.remove(iframe);
                    return false;
                })
            },
            /**
             * 向队列添加文件
             * @param {String} file
             */
            _queueAdd : function(file) {
                var self = this,queue = self.get('queue');
                queue.add(file);
            },
            /**
             * 处理服务器端返回的数据
             * @param {Object} response 结果集
             */
            _processResponse : function(response) {
                var self = this,dataType = self.get('dataType'),fileData,success,
                    queue = self.get('queue'),files = queue.files,
                    button = self.get('button'),urlsInput = button.urlsInput,division = button.get('urlDivision'),urls = [];
                //TODO:目前只支持json
                if (dataType == 'json') {
                    success = response.success;
                    //隐藏loading图标
                    queue.cancelLoading(queue.files.length - 1);
                    //成功上传
                    if (success) {
                        fileData = response.result;
                        //显示文件控制区域，比如删除等
                        queue.showFileController(queue.files.length - 1);
                        //遍历文件缓存，将文件路径补充上
                        S.each(files, function(file, i) {
                            if (file.name == fileData.name) {
                                queue.files[i].url = fileData.url;
                            }
                        });
                        //向文件路径数组添加文件url
                        S.each(queue.files, function(file) {
                            if (file.url) urls.push(file.url);
                        });
                        DOM.val(urlsInput, urls.join(division));
                        self.fire(AjaxUploader.event.UPLOAD_SUCCESS, {'data' : response,'urls' : urls});
                    } else {
                        //上传失败移除文件
                        var lastFileName = queue.files[queue.files.length - 1].name;
                        queue.remove(lastFileName);
                        self.fire(AjaxUploader.event.UPLOAD_ERROR, {'data' : response,'msg' : response.msg});
                    }
                }
            }
        });
    return AjaxUploader;
}, {requires:['dom','base','event','json']});