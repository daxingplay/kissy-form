/**
 * @fileoverview 选择框的模拟触发按钮
 * @author: 剑平（明河）<minghe36@126.com>
 *
 **/
KISSY.add('form/nice/select/button',function(S, DOM,Event, Base){
    var EMPTY = '', LOG_PREFIX = '[nice-select-button]:';
    /**
     * @name Select
     * @class 美化的选择框
     * @constructor
     * @param {String} container 目标容器
     * @param {Object} config 配置对象
     * @property {HTMLElement} container 目标容器元素
     * @property {HTMLElement} button 按钮元素
     */
    function Button(container,config){
        var self = this;
        self.container = container;
        self.button = EMPTY;
        //超类初始化
        Button.superclass.constructor.call(self, config);
    }
    //继承于KISSY.Base
    S.extend(Button, Base);
    //静态属性和方法
    S.mix(Button,/**@lends Button*/{
        tpl : {
            DEFAULT: '<div class="ks-select-button J_NiceSelect">' +
                        '<span class="select-text J_SelectText">{text}</span>' +
                        '<span class="select-icon J_SelectIcon"></span>' +
                     '</div>'
        }
    });
    //组件参数
    Button.ATTRS = {
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
            value : Button.tpl.DEFAULT
        },
        /**
         * 按钮上的文字
         * @type String
         */
        text : {
            value : EMPTY
        },
        /**
         * 按钮样式
         * @type Object | String
         */
        style : {
            value : EMPTY,
            setter : function(v){
                var self = this,button = self.button;
                if(button != EMPTY){
                    DOM.css(button,v);
                }
                return v;
            }
        },
        /**
         * 是否可用
         * @type Boolean
         */
        disabled : {
            value : true
        }
    };
    //组件方法
    S.augment(Button,
        /**@lends Button.prototype */
        {
            /**
             * 运行组件
             */
            render : function(){
                var self = this,container = self.container;
                if(!container){
                    S.log(LOG_PREFIX + '按钮容器不存在！');
                    return false;
                }
                self._create();
            },
            /**
             * 创建选择框按钮
             * @return {HTMLElement} 按钮元素
             */
            _create : function(){
                var self = this,container = self.container,tpl = self.get('tpl'),
                    //按钮上的文字
                    text = self.get('text'),html = EMPTY,button;
                if(!S.isString(tpl) || !S.isString(text)) return false;
                html = S.substitute(tpl,{text : text});
                button = DOM.create(html);
                //将按钮插入容器
                DOM.append(button,container);
                return self.button = button;
            }
        }
    );
    return Button;
},{requires:['dom','event','base']});