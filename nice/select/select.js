/**
 * @fileoverview 美化的选择框
 * @author: 剑平（明河）<minghe36@126.com>
 *
 **/
KISSY.add('form/nice/select/select',function(S, DOM,Event,Base,Button) {
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
     */
    function Select(target, config) {
        var self = this;
        self.target = S.get(target);
        self.selectContainer = EMPTY;
        self.data = [];
        self.curSelData = {};
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
                var self = this,target = self.target;
                if(!target){
                    S.log(LOG_PREFIX + '目标选择框不存在！');
                    return false;
                }
                self._getData();
                self._createWrapper();
                self._initButton();
            },
            /**
             * 创建模拟选择框容器
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
             * 生成个选择框按钮
             */
            _initButton : function(){
                var self = this,container = self.selectContainer,button = EMPTY,
                    curSelData = self.curSelData;
                if(!S.isFunction(Button) | S.isEmptyObject(curSelData)) return false;
                //实例化按钮
                button = new Button(container,{text : curSelData.text});
                button.render();
                return button;
            },
            /**
             * 将选择框的选项转换成一个数组数据
             */
            _getData : function(){
                var self = this,target = self.target,options = DOM.children(target),data = [],dataItem = {};
                if(options.length == 0) return false;
                S.each(options,function(option){
                    dataItem = {text : DOM.text(option),value : DOM.val(option)};
                    data.push(dataItem);
                    if(DOM.attr(option,'selected')){
                        self.curSelData = dataItem;
                    }
                });
                return self.data = data;
            }
        });
    return Select;
}, {requires:['dom','event','base','./button']});