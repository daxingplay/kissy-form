/**
 * @fileoverview 美化的选择框
 * @author: 剑平（明河）<minghe36@126.com>
 *
 **/
KISSY.add(function(S, DOM, Base, Event,Anim,List) {
    var EMPTY = '',
        //控制台
        console = console || S,LOG_PREFIX = '[nice-radio]:',
        IFRAME_TPL = '<iframe src="" width="{width}" height="{height}" class="ks-nice-select-iframe"></iframe>';
    /**
     * @name Select
     * @class 美化的选择框
     * @constructor
     * @param {String} target 目标
     * @param {Object} config 配置对象
     */
    function Select(target, config) {
        var self = this;
        /**
         * 选择框目标
         * @type Array
         */
        self.target = S.get(target);
        /**
         * 数据集合
         * @type Array
         */
        self.data = [];
        /**
         * 列表容器
         * @type HTMLElement
         */
        self.listContainer = EMPTY;
        /**
         * 用于修正IE6浮出层bug的iframe元素
         * @type HTMLElement
         */
        self.iframe = EMPTY;
        /**
         * 模拟列表实例
         * @type Object
         */
        self.list = EMPTY;
        /**
         * 选择框
         * @type HTMLElement
         */
        self.select = EMPTY;
        /**
         * 选择框容器
         * @type HTMLElement
         */
        self.selectContainer = EMPTY;
        /**
         * 当前选中的数据
         * @type Object
         */
        self.currentData = {text : EMPTY,value : EMPTY}; 
        //超类初始化
        Select.superclass.constructor.call(self, config);
    }

    //继承于KISSY.Base
    S.extend(Select, Base);
    S.mix(Select,{
       hook : {LIST_CONTAINER : '.J_ListContainer',SELECT : '.J_NiceSelect',TEXT : '.J_SelectText'}
    });
    /**
     * 设置参数
     */
    Select.ATTRS = {
        /**
         * 是否自动运行
         * @type Boolean
         */
        autoRender : {
            value : false,
            setter : function(v) {
                v && this.render();
                return v;
            }
        },
        /**
         * 选择框宽度
         * @type Number
         */
        width : {
            value : 'auto'
        },
        /**
         * 选择框模板
         * @type String
         */
        tpl : {
            value : '<div class="ks-nice-select-container"><div class="ks-nice-select J_NiceSelect"><span class="select-text J_SelectText">{text}</span><span class="select-icon J_SelectIcon"></span></div><div class="list-container J_ListContainer"></div></div>'
        },
        /**
         * 鼠标滑过选择框样式
         * @type String
         */
        hoverCls : {
            value : 'ks-nice-select-hover'
        },
        /**
         * 鼠标单击选择框，列表显示后添加的样式
         * @type String
         */
        clickCls : {
            value : 'ks-nice-select-click'
        }
    };

    /**
     * 方法
     */
    S.augment(Select, {
            /**
             * 运行
             */
            render : function() {
                var self = this,target = self.target,select;
                if(!target){
                    console.log(LOG_PREFIX + '选择框不存在！');
                    return false;
                }
                DOM.hide(target);
                self._create();
                self._setWidth(self.get('width'));
                select = self.select;
                Event.on(select,'mouseover mouseout',self._hoverHandler,self);
                Event.on(select,'click',self._clickHandler,self);
                Event.on('body','click',function(ev){
                    self.hide();
                });
                DOM.data(target,'data-select',self);
            },
            /**
             * 隐藏列表
             */
            hide : function(){
                var self = this,select = self.select,cls = self.get('clickCls'),
                    listContainer = self.listContainer,iframe = self.iframe;
                DOM.hide(listContainer);
                if(iframe != EMPTY) DOM.hide(iframe);
                DOM.removeClass(select,cls);
            },
            /**
             * 显示列表
             */
            show : function(){
                var self = this,listContainer = self.listContainer,select = self.select,
                    iframe = self.iframe, cls = self.get('clickCls');
                DOM.show(listContainer);
                if(iframe != EMPTY) DOM.show(iframe);
                //增加激活样式
                DOM.addClass(select,cls);
            },
            /**
             * 设置宽度
             */
            _setWidth : function(width){
                var self = this,target = self.target,selectContainer = self.selectContainer,listContainer = self.listContainer;
                if(width == 'auto'){
                    var targetClone = target.cloneNode(true);
                    DOM.css(targetClone,{position:'absolute',top:'-3000px',display:'block'});
                    DOM.append(targetClone,'body');
                    width = DOM.width(targetClone);
                    DOM.remove(targetClone);
                }
                if(!S.isNumber(width)) return false;
                DOM.width(selectContainer,width);
                DOM.width(listContainer,width);
            },
            /**
             * 创建模拟选择框
             */
            _create : function(){
                var self = this,target = self.target,tpl = self.get('tpl'),text = EMPTY,html,
                    selectContainer,data;
                if(!S.isString(tpl)) return false;
                S.each(DOM.children(target),function(option){
                   if(DOM.attr(option,'selected')){
                       text = DOM.text(option);
                   }
                });
                data = {text : text,value : DOM.val(target)};
                html = S.substitute(tpl,data);
                selectContainer = DOM.create(html);
                DOM.insertAfter(selectContainer,target);
                self.currentData = S.merge(self.currentData,data);
                self.selectContainer = selectContainer;
                self.select =  DOM.children(selectContainer,Select.hook.SELECT);
                self.list = self._renderList();
                self.iframe = self._createIframe();
            },
            /**
             * 运行模拟列表
             * @return {Object} List实例
             */
            _renderList : function(){
                var self = this,selectContainer = self.selectContainer,list,
                    listContainer = DOM.children(selectContainer,Select.hook.LIST_CONTAINER),
                    data = self._getData(),
                    value = DOM.val(self.target);
                list = new List(listContainer,{data : data});
                list.render();
                list.select(value);
                list.on('click',self._listItemClickHandler,self);
                self.listContainer = listContainer;
                return list;
            },
            /**
             * 将选项转换成数据
             */
            _getData : function(){
                var self = this,target = self.target,options = DOM.children(target),data = [];
                if(options.length == 0) return false;
                S.each(options,function(option){
                    data.push({text : DOM.text(option),value : DOM.val(option)});
                });
                self.data = data;
                return data;
            },
            /**
             * 鼠标滑过事件监听器
             * @param {Object} ev 事件对象
             */
            _hoverHandler : function(ev){
                var self = this,type = ev.type,target = self.select,cls = self.get('hoverCls');
                if(!S.isString(cls)) return false;
                if(type == 'mouseover'){
                    DOM.addClass(target,cls);
                }else if(type == 'mouseout'){
                    DOM.removeClass(target,cls);
                }
            },
            /**
             * 鼠标单击模拟选择框事件监听器
             * @param {Object} ev 事件对象
             */
            _clickHandler : function(ev){
                var self = this,select = self.select,listContainer = self.listContainer;
                if(DOM.css(listContainer,'display') == 'none'){
                    self.show();
                }else{
                    self.hide();
                }

                ev.stopPropagation();

            },
            /**
             * 鼠标点击列表选项
             * @param {Object} ev 事件对象
             */
            _listItemClickHandler : function(ev){
                var self = this,text = ev.text,value = ev.value,select = self.select,
                    textContainer = DOM.children(select,Select.hook.TEXT);
                //选择的值发生改变
                if(self.currentData.value != value){
                    //将列表选中值写入输入框
                    DOM.text(textContainer,text);
                    DOM.val(self.target,value);
                    //触发change事件
                    if(Event.trigger) Event.trigger(self.target,'change');
                }
                //触发原生选择框的click事件
                if(Event.trigger) Event.trigger(self.target,'click');
                //重写
                self.currentData = S.merge(self.currentData,{text : ev.text,value : ev.value});
            },
            /**
             * 用于修正IE6浮出层无法遮住表单元素的bug
             * @return {HTMLElement} iframe元素
             */
            _createIframe: function(){
                var self = this,listContainer = self.listContainer,selectContainer = self.selectContainer,
                    left = DOM.css(listContainer,'left'), width,height,iframeHtml,iframe;
                DOM.css(listContainer,{'display':'block','left' : '-3000px'});
                width = self.get('width'),height = DOM.height(listContainer);
                DOM.css(listContainer,{'display':'none','left' : left});
                iframeHtml = S.substitute(IFRAME_TPL,{width : width,height : height});
                iframe = DOM.create(iframeHtml);
                DOM.append(iframe,selectContainer);
                return iframe;
            }
        });
    return Select;
}, {requires:['dom','base','event','anim','','rf/com/form/nice/list']});