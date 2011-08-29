/**
 * @fileoverview 美化的选择框
 * @author: 剑平（明河）<minghe36@126.com>
 *
 **/
KISSY.add('form/nice/select/select',function(S, DOM,Event,Base,Button,List) {
    var EMPTY = '', LOG_PREFIX = '[nice-select]:';
    /**
     * @name Select
     * @class 美化的选择框
     * @constructor
     * @param {String} target 目标
     * @param {Object} config 配置对象
     * @property {HTMLElement} target 目标选择框元素
     * @property {HTMLElement} selectContainer 模拟选择框容器
     * @property {Array} data 从选择框提取的数据集合
     * @property {Object} curSelData 当前选择框的数据
     * @property {Object} button 选择框按钮实例
     * @property {Object} list 数据列表实例
     */
    function Select(target, config) {
        var self = this;
        self.target = S.get(target);
        self.selectContainer = EMPTY;
        self.data = [];
        self.curSelData = {};
        self.button = EMPTY;
        self.list = EMPTY;
        //超类初始化
        Select.superclass.constructor.call(self, config);
    }

    //继承于KISSY.Base
    S.extend(Select, Base);
    //静态属性和方法
    S.mix(Select,/**@lends Select*/{
        tpl : {
            DEFAULT: '<div class="ks-select" tabindex="0" aria-label="点击tab进入选项选择，点击esc退出选择">' +
                        
                     '</div>'
        }
    });
    //组件参数
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
         * 模拟选择框容器模板
         * @type String
         */
        tpl : {
            value : Select.tpl.DEFAULT
        },
        /**
         * 设置模拟选择框的宽度
         */
        width : {
            value : 'auto',
            setter : function(v){
                self._setWidth(v);
                return v;
            }
        }
    };
    //组件方法
    S.augment(Select,
        /**@lends Select.prototype */
        {
            /**
             * 运行
             */
            render : function() {
                var self = this,target = self.target,width,button;
                if(!target){
                    S.log(LOG_PREFIX + '目标选择框不存在！');
                    return false;
                }
                DOM.hide(target);
                self._getData();
                self._createWrapper();
                self._initButton();
                width = self.get('width');
                self._setWidth(width);
                button = self.button;
                //监听按钮的单击事件
                button.on(Button.event.CLICK,self._btnClickHanlder,self);
            },
            /**
             * 显示下列列表
             */
            show : function(){
                var self = this,elList,button = self.button;
                if(self.list == EMPTY){
                    self._initList();
                    self._setWidth(self.get('width'));
                }
                elList = self.list.list;
                DOM.show(elList);
                //设置按钮的点击样式
                button.setClickCls();
            },
            /**
             * 隐藏下拉列表
             */
            hide : function(){
                var self = this,elList = self.list.list,button = self.button;
                DOM.hide(elList);
                //设置按钮的点击样式
                button.setClickCls();
            },
            /**
             * 创建模拟选择框容器
             * @return {HTMLElement} 选择框容器
             */
            _createWrapper : function(){
                var self = this,target = self.target,tpl = self.get('tpl'),selectContainer;
                if(!S.isString(tpl)){
                    S.log(LOG_PREFIX + '容器模板不合法！');
                    return false;
                }
                selectContainer = DOM.create(tpl);
                DOM.insertAfter(selectContainer,target);
                return self.selectContainer = selectContainer;
            },
            /**
             * 生成选择框按钮
             * @return {Button} Button的实例
             */
            _initButton : function(){
                var self = this,container = self.selectContainer,button = EMPTY,
                    curSelData = self.curSelData;
                if(!S.isFunction(Button) | S.isEmptyObject(curSelData)) return false;
                //实例化按钮
                button = new Button(container,{text : curSelData.text});
                button.render();
                return self.button = button;
            },
            /**
             * 生成数据列表
             * @return {List} List的实例
             */
            _initList : function(){
                var self = this,selectContainer = self.selectContainer,list,
                    data = self.data;
                if(!S.isFunction(List)) return false;
                //实例化List，data（列表数据）参数必不可少
                list = new List(selectContainer,{data : data});
                list.render();
                return self.list = list;
            },
            /**
             * 将选择框的选项转换成一个数组数据
             * @return {Array} 用于模拟选择框的数据
             */
            _getData : function(){
                var self = this,target = self.target,options = DOM.children(target),data = [],dataItem = {};
                if(options.length == 0) return false;
                //遍历选择框的option标签
                S.each(options,function(option){
                    dataItem = {text : DOM.text(option),value : DOM.val(option)};
                    data.push(dataItem);
                    if(DOM.attr(option,'selected')){
                        self.curSelData = dataItem;
                    }
                });
                return self.data = data;
            },
            /**
             * 设置模拟选择框的宽度
             * @param {Number | String} width 宽度，值为‘auto’时自动获取原生选择框的宽度
             * @return {Number} 宽度
             */
            _setWidth : function(width){
                var self = this,target = self.target,container = self.selectContainer,
                    button = self.button,list = self.list;
                //自动设置宽度，拷贝一份选择框的节点，获取隐藏的选择框的宽度
                if(width == 'auto'){
                    var targetClone = target.cloneNode(true);
                    DOM.css(targetClone,{position:'absolute',top:'-3000px',display:'block'});
                    DOM.append(targetClone,'body');
                    width = DOM.width(targetClone);
                    DOM.remove(targetClone);
                }
                //设置模拟选择框容器的宽度
                DOM.width(container,width);
                //设置选择框按钮部分的宽度
                if(button != EMPTY){
                    button.set('style',{width : width});
                }
                //设置下拉列表的宽度
                if(list != EMPTY){
                    list.set('style',{width : width});
                }
                return width;
            },
            /**
             * 按钮点击后触发的事件监听器
             */
            _btnClickHanlder : function(ev){
                var self = this,list = self.list,elList = list.list;
                if(list == EMPTY){
                    self.show();
                    return false;
                }
                //如果列表显示则隐藏之，否则显示之
                self[DOM.css(elList,'display') == 'none' && 'show' || 'hide']();
            }
        });
    return Select;
}, {requires:['dom','event','base','./button','../list/list']});