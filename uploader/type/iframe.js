/**
 * @fileoverview iframe方案上传
 * @author: 剑平（明河）<minghe36@126.com>,紫英<daxingplay@gmail.com>
 **/
KISSY.add(function(S,Node,Base) {
    var EMPTY = '',$ = Node.all,LOG_PREFIX = '[uploader-iframeType]:',ID_PREFIX = 'ks-uploader-iframe-';
    /**
     * @name IframeType
     * @class iframe方案上传
     * @constructor
     * @extends Base
     * @requires Node
     */
    function IframeType(config){
        var self = this;
        //调用父类构造函数
        IframeType.superclass.constructor.call(self,config);
    }
    S.mix(IframeType,/**@lends IframeType*/ {
        /**
         * 会用到的html模板
         */
        tpl : {
            IFRAME : '<iframe src="javascript:false;" name="{id}" id="{id}" border="no" width="1" height="1" style="display: none;" />',
            FORM : '<form method="post" enctype="multipart/form-data" action="{action}" target="{target}">{hiddenInputs}</form>',
            HIDDEN_INPUT : '<input type="hidden" name="{name}" value="{value}" />'
        }
    });
    //继承于Base，属性getter和setter委托于Base处理
    S.extend(IframeType, Base, /** @lends IframeType.prototype*/{
            /**
             * 运行
             */
            render : function(){

            },
            /**
             * 上传文件
             * @param {HTMLElement} fileInput 文件input
             */
            upload : function(fileInput){
                var self = this,$input = $(fileInput);
                if(!$input.length) return false;
                self._create();
                self._appendFileInput($input);

            },
            /**
             * 将参数数据转换成hidden元素
             * @param {Object} data 对象数据
             * @return {String} hiddenInputHtml hidden元素html片段
             */
            dataToHidden : function(data){
                if(!S.isObject(data) || S.isEmptyObject(data)){
                    S.log(LOG_PREFIX + 'data参数不是对象或者为空！');
                    return false;
                }
                var self = this,hiddenInputHtml = EMPTY,
                    //hidden元素模板
                    tpl = self.get('tpl'),hiddenTpl = tpl.HIDDEN_INPUT;
                if (!S.isString(hiddenTpl)) return false;
                for (var k in data) {
                    hiddenInputHtml += S.substitute(hiddenTpl, {'name' : k,'value' : data[k]});
                }
                return hiddenInputHtml;
            },
            /**
             * 创建一个空的iframe，用于文件上传表单提交后返回服务器端数据
             * @return {NodeList}
             */
            _createIframe : function(){
                var self = this,
                    //iframe的id
                    id = self.get('id'),
                    //iframe模板
                    tpl = self.get('tpl'),iframeTpl = tpl.IFRAME,
                    iframe;
                if (!S.isString(iframeTpl)){
                    S.log(LOG_PREFIX + 'iframe的模板不合法！');
                    return false;
                }
                if (!S.isString(id)){
                    S.log(LOG_PREFIX + 'id必须存在且为字符串类型！');
                    return false;
                }
                //创建处理上传的iframe
                iframe = S.substitute(tpl.IFRAME, { 'id' : id });
                return $(iframe);
            },
            /**
             * 创建文件上传表单
             * @return {NodeList}
             */
            _createForm : function(){
                var self = this,
                    //iframe的id
                    id = self.get('id'),
                    //form模板
                    tpl = self.get('tpl'),formTpl = tpl.FORM,
                    //想要传送给服务器端的数据
                    data = self.get('data'),
                    //服务器端处理文件上传的路径
                    action = self.get('action'),
                    hiddens,form = EMPTY;
                if (!S.isString(formTpl)){
                    S.log(LOG_PREFIX + 'form模板不合法！');
                    return false;
                }
                if (!S.isObject(data)){
                    S.log(LOG_PREFIX + 'data参数不合法！');
                    return false;
                }
                if (!S.isString(action)){
                    S.log(LOG_PREFIX + 'action参数不合法！');
                    return false;
                }
                hiddens = self.dataToHidden(data);
                if(hiddens == EMPTY) return false;
                form = S.substitute(formTpl, {'action' : action,'target' : id,'hiddenInputs' : hiddens});
                return $(form);
            },
            /**
             * 创建iframe和form
             */
            _create : function(){
                var self = this,
                    iframe = self._createIframe(),
                    form = self._createForm();
                $('body').append(iframe);
                $('body').append(form);
                self.set('iframe',iframe);
                self.set('form',form);
            },
            /**
             * 将文件域加入到表单
             * @param {NodeList} input 文件域
             * @param {NodeList} 添加文件域后的表单
             */
            _appendFileInput : function(input){
                //克隆文件域
                var self = this,$inputClone = input.clone(),
                    form = self.get('form');
                $(form).append($inputClone);
                self.set('form',form);
                return form;
            }

    },{ATTRS : /** @lends IframeType*/{
            /**
             * iframe方案会用到的html模板，一般不需要修改
             */
            tpl : {value : IframeType.tpl},
            /**
             * 创建的iframeid
             */
            id : {value : ID_PREFIX + S.guid()},
            /**
             * 服务器端路径
             */
            action : {value : EMPTY},
            /**
             * 传送给服务器端的参数集合（会被转成hidden元素post到服务器端）
             */
            data : {value : {}},
            iframe : {value : {}},
            form : {value : {}}
    }});
    
    return IframeType;
},{requires:['node','base']});