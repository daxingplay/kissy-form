/**
 * @fileoverview 单选框美化
 * @author: 剑平<minghe36@126.com>
 *
 **/
KISSY.add(function(S, DOM, Base, Event) {
    var EMPTY = '', data = {TARGET : 'data-target'},
        //控制台
        console = console || S,LOG_PREFIX = '[nice-radio]:';

    /**
     * @name Radio
     * @class 单选框美化
     * @constructor
     * @param {String} target 目标
     * @param {Object} config 配置对象
     */
    function Radio(target, config) {
        var self = this;
        /**
         * 单选框目标
         * @type Array
         */
        self.target = S.query(target);
        self.radios = [];
        //超类初始化
        Radio.superclass.constructor.call(self, config);
    }

    //继承于KISSY.Base
    S.extend(Radio, Base);
    /**
     * 设置参数
     */
    Radio.ATTRS = {
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
         * 单选框模板
         * @type String
         */
        tpl : {
            value : '<span class="g-u ks-radio" tabindex="0" data-label="{label}" aria-label="{label}，按下enter选中该项" rel="{name}"></span>'
        }
    };
    S.mix(Radio, {
            /**
             * 样式
             */
            cls : {CHECKED : 'ks-radio-checked',DISABLED : 'ks-radio-disabled'},
            data : {DISABLED : 'data-disabled',TARGET : 'data-target',LABEL : 'data-label'}
        });
    /**
     * 方法
     */
    S.augment(Radio, {
            /**
             * 运行
             */
            render : function() {
                var self = this,target = self.target;
                if (target.length == 0) {
                    console.log(LOG_PREFIX + '单选框容器不存在！');
                    return false;
                }
                DOM.hide(target);
                Event.on(target, 'change', self._changeHandler, self);
                self._createRadio();
                S.each(target, function(input) {
                    if (DOM.attr(input, 'checked')) {
                        if (Event.trigger) Event.trigger(DOM.data(input, data.TARGET), 'click');
                    }
                });
            },
            /**
             * 选中指定索引值（元素）的单选框
             * @param {HTMLElement | Number} target 目标元素
             */
            checked : function(target) {
                var self = this,radios = self.target;
                //如果参数传入的是单选框的索引值，那么从this.target元素数组中取元素
                if (S.isNumber(target)) {
                    target = radios[target];
                }
                var input = DOM.data(target, Radio.data.TARGET),checkedCls = Radio.cls.CHECKED;
                //如果单选框为禁用状态，直接退出
                if (DOM.data(target, Radio.data.DISABLED))return false;
                DOM.removeClass(self.radios, checkedCls);
                //添加选中样式
                DOM.addClass(target, checkedCls);
                DOM.attr(input, 'checked', true);
                //触发单选框的事件
                Event.fire(input, 'change');
                Event.fire(input, 'click');
            },
            /**
             * 创建美化的图片单选框来代替系统原生单选框
             */
            _createRadio : function() {
                var self = this,target = self.target,radioTpl = self.get('tpl'),
                    name,disabled,html,radio,label;
                S.each(target, function(item) {
                    name = DOM.attr(item, 'name');
                    disabled = DOM.attr(item, 'disabled');
                    //单选框的label
                    label = self._getLabel(item);
                    html = S.substitute(radioTpl, {name : name,label : label});
                    radio = DOM.create(html);
                    //将图片单选框插入到单选框前面
                    DOM.insertBefore(radio, item);
                    //监听图片单选框的单机事件
                    Event.on(radio, 'click', self._radioClickHandler, self);
                    Event.on(radio, 'keyup', self._radioKeyupHandler, self);
                    DOM.data(radio, data.TARGET, item);
                    DOM.data(item, data.TARGET, radio);
                    self.radios.push(radio);
                    if (disabled) self.setDisabled(radio);
                })
            },
            /**
             * 获取单选框的label
             * @param {HTMLElement} radio 单选框元素
             */
            _getLabel : function(radio) {
                if (!radio) return false;
                var dataNameLabel = Radio.data.LABEL,label = EMPTY,elLabel;
                label = DOM.attr(radio, dataNameLabel);
                if (!label) {
                    elLabel = DOM.next(radio, 'label') || DOM.prev(radio, 'label');
                    if (elLabel) {
                        label = DOM.text(elLabel);
                    }
                }
                return label;
            },
            /**
             * 单击美化后单选框后事件监听器
             */
            _radioClickHandler : function(ev) {
                var self = this,target = ev.target;
                self.checked(target);
                target.focus();
            },
            /**
             * 监听模拟单选框的键盘按起事件
             * @param ev
             */
            _radioKeyupHandler : function(ev) {
                var self = this,target = ev.target,keyCode = ev.keyCode;
                //按下enter键
                if (keyCode == 13) {
                    self.checked(target);
                }
            },
            /**
             * 设置单选框不可用
             * @param {HTMLElement} radio 模拟单选框元素
             */
            setDisabled : function(radio) {
                var self = this,disabledCls = Radio.cls.DISABLED,data = Radio.data,
                    radioTarget = DOM.data(radio, data.TARGET);
                if (!radio) return false;
                DOM.addClass(radio, disabledCls);
                DOM.data(radio, data.DISABLED, true);
                if (!DOM.attr(radioTarget, 'disabled')) DOM.attr(radioTarget, 'disabled', true);
            }
        });
    return Radio;
}, {requires:['dom','base','event']});