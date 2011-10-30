/**
 * @fileoverview 文件上传按钮
 * @author: 剑平（明河）<minghe36@126.com>
 **/
KISSY.add(function(S, DOM, Base, Event) {
    var EMPTY = '',FILE = 'file',ID = 'id',
        //控制台
        console = console || S,LOG_PREFIX = '[ajaxUploader-button]:';

    /**
     * 文件上传按钮
     * @class Button
     * @constructor
     * @param {String} target 目标元素
     * @param {Object} config 配置对象
     */
    function Button(target, config) {
        var self = this;
        /**
         * 目标容器
         * @type HTMLElement
         */
        self.target = S.get(target);
        /**
         * 对应的表单上传域
         * @type HTMLElement
         */
        self.fileInput = EMPTY;
        /**
         * 文件路径隐藏域
         * @type HTMLElement
         */
        self.urlsInput = EMPTY;
        /**
         * 表单上传域的容器
         * @type HTMLElement
         */
        self.inputContainer = EMPTY;
        //超类初始化
        Button.superclass.constructor.call(self, config);
    }

    //继承于KISSY.Base
    S.extend(Button, Base);
    S.mix(Button, {
            //模板
            tpl : {
                DEFAULT:'<div class="ks-ajax-uploader-input-container"><input type="file" name="{name}" hidefoucs="true" class="ks-ajax-uploader-input" /></div>',
                URLS_INPUT : '<input type="hidden" value="" name="{name}" class="J_UploaderUrlsInput">'
            },
            //支持的事件
            event : { RENDER : 'render', CHANGE : 'change',MOUSEOVER : 'mouseover',MOUSEOUT : 'MOUSEOUT',FOCUS : 'focus',BLUR : 'blur' },
            /**
             * 获取文件名称（从表单域的值中提取）
             * @param {String} path 文件路径
             * @return {String}
             */
            getFileName : function(path) {
                return path.replace(/.*(\/|\\)/, "");
            },
            /**
             * 获取文件扩展名
             * @param fileName
             * @return {String}
             */
            getExt : function(fileName) {
                return -1 !== fileName.indexOf('.') && fileName.replace(/.*[.]/, '') || '';
            }
        });
    /**
     * 参数
     */
    Button.ATTRS = {
        /**
         * 隐藏的表单上传域的模板
         * @type String
         */
        tpl : {
            value : Button.tpl.DEFAULT
        },
        /**
         * 隐藏的文件路径隐藏域模板
         * @type String
         */
        urlsInputTpl : {
            value : Button.tpl.URLS_INPUT
        },
        /**
         * 隐藏的表单上传域的name值
         * @type String
         */
        name : {
            value : 'fileInput',
            setter : function(v) {
                if (this.fileInput) {
                    DOM.attr(this.fileInput, 'name', v);
                }
                return v;
            }
        },
        /**
         * 用于放文件路径的隐藏域的name名
         * @type String
         */
        urlsInputName : {
            value : 'attachments'
        },
        /**
         * 多个文件时使用的分隔符
         * @type String
         */
        urlDivision : {
            value : ','
        },
        /**
         * 是否开启多选支持
         * @type Boolean
         */
        multiple : {
            value : false
        },
        /**
         * 是否可用,false为可用
         * @type Boolean
         */
        disabled : {
            value : false,
            setter : function(v) {
                var self = this,target = self.target,cls = self.get('cls').disabled,fileInput = self.fileInput;
                if (v) {
                    DOM.addClass(target, cls);
                    DOM.hide(fileInput);
                } else {
                    DOM.removeClass(target, cls);
                    DOM.show(fileInput);
                }
                return v;
            }
        },
        /**
         * 样式
         * @type Object
         */
        cls : {
            value : {
                hover : 'uploader-button-hover',
                focus : 'uploader-button-focus',
                disabled : 'uploader-button-disabled'
            }
        }
    };
    /**
     * 方法
     */
    S.augment(Button, {
            /**
             * 运行
             * @return {Object} Button的实例
             */
            render : function() {
                var self = this,target = self.target;
                if (target == null) {
                    console.log(LOG_PREFIX + '请检查目标元素是否存在！');
                    return false;
                }
                self._createInput();
                self._createUrlsInput();
                DOM.css(target, 'position', 'relative');
                self.fire(Button.event.RENDER);
                return self;
            },
            /**
             * 显示按钮
             */
            show : function(){
                var self = this,target = self.target,input = self.fileInput;
                DOM.show(target);
                DOM.show(input);
            },
            /**
             * 隐藏按钮
             */
            hide : function(){
                var self = this,target = self.target,input = self.fileInput;
                DOM.hide(target);
                DOM.hide(input);
            },
            /**
             * 重置按钮
             * @return {Object} Button的实例
             */
            resetInput : function() {
                var self = this,inputContainer = self.inputContainer;
                //移除表单上传域容器
                DOM.remove(inputContainer);
                self.inputContainer = EMPTY;
                self.fileInput = EMPTY;
                //重新创建表单上传域
                self._createInput();
                return self;
            },
            /**
             * 创建隐藏的表单上传域
             * @return {HTMLElement} 文件上传域容器
             */
            _createInput : function() {
                var self = this,name = self.get('name'),tpl = self.get('tpl'),multiple = self.get('multiple'),
                    html,inputContainer,fileInput;
                if (!S.isString(name) || !S.isString(tpl)) return false;
                html = S.substitute(tpl, {name : name});
                inputContainer = DOM.create(html);
                //向body添加表单文件上传域
                DOM.append(inputContainer, self.target);
                fileInput = DOM.children(inputContainer, 'input')[0];
                //开启多选上传
                multiple && DOM.attr('multiple', 'multiple');
                //上传框的值改变后触发
                Event.on(fileInput, 'change', self._changeHandler, self);
                //鼠标滑过/移开上传框时触发
                Event.on(fileInput, 'mouseover mouseout', self._hoverHandler, self);
                //上传框获取焦点、失去焦点时触发
                Event.on(fileInput, 'focus blur', self._focusBlurHandler, self);
                //DOM.hide(fileInput);
                self.fileInput = fileInput;
                self.inputContainer = inputContainer;
                self.resetContainerCss();
                return inputContainer;
            },
            /**
             * 重置下按钮对应的隐藏表单域容器的尺寸和偏移
             * @return {Object} Button的实例
             */
            resetContainerCss : function() {
                var self = this,container = self.inputContainer,target = self.target,
                    css = {'width':DOM.width(target),'height':DOM.height(target)};
                DOM.css(container, css);
                return self;
            },
            /**
             * 创建一个隐藏域，用于放上传文件的url路径
             * @return {HTMLElement}
             */
            _createUrlsInput : function() {
                var self = this,target = self.target,tpl = self.get('urlsInputTpl'),name = self.get('urlsInputName'),input;
                if (!S.isString(tpl) || !S.isString(name)) return false;
                input = DOM.create(tpl, {'name':name});
                DOM.insertAfter(input, target);
                return self.urlsInput = input;
            },
            /**
             * 文件上传域的值改变时触发
             * @param {Object} ev 事件对象
             */
            _changeHandler : function(ev) {
                var self = this,fileInput = self.fileInput,value = DOM.val(fileInput),fileName;
                if (value == EMPTY) return false;
                //文件名称
                fileName = Button.getFileName(value);
                self.fire(Button.event.CHANGE, {fileName : fileName});
            },
            /**
             * 鼠标滑过/移开按钮
             * @param {Object} ev 事件对象
             */
            _hoverHandler : function(ev) {
                var self = this,target = self.target,cls = self.get('cls'),fileInput = self.fileInput;
                if (!S.isObject(cls) || !cls.hover) return false;
                if (ev.type == 'mouseover') {
                    DOM.addClass(target, cls.hover);
                    self.fire(Button.event.MOUSEOVER);
                }
                else if (ev.type == 'mouseout') {
                    DOM.removeClass(target, cls.hover);
                    //if(fileInput != EMPTY && DOM.css(fileInput,'display') == 'block') DOM.css(fileInput,'display','none');
                    self.fire(Button.event.MOUSEOUT);
                }

            },
            /**
             * 获取/失去焦点
             * @param {Object} ev 事件对象
             */
            _focusBlurHandler : function(ev) {
                var self = this,target = self.target,cls = self.get('cls');
                if (!S.isObject(cls) || !cls.focus) return false;
                if (ev.type == 'focus') {
                    DOM.addClass(target, cls.focus);
                    self.fire(Button.event.FOCUS);
                }
                else if (ev.type == 'blur') {
                    DOM.removeClass(target, cls.hover);
                    DOM.removeClass(target, cls.focus);
                    self.fire(Button.event.BLUR);
                }
            }
        });
    return Button;
}, {requires:['dom','base','event']});