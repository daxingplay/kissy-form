/**
 * @fileoverview 消息提示类
 * @author: 剑平（明河）<minghe36@126.com>
 **/
KISSY.add(function(S, DOM, Event, Anim, Base) {
    var EMPTY = '',
        //控制台
        console = console || S,LOG_PREFIX = '[tip]:',
        data = {TIP : 'data-tip'};

    /**
     * 消息提示类
     * @class Tip
     * @constructor
     * @param {String} target 目标
     * @param {Object} config 配置对象
     */
    function Tip(target, config) {
        var self = this;
        /**
         * 提示层目标
         * @type {HTMLElement}
         */
        self.target = S.get(target);
        /**
         * 提示层的内容
         * @type {String}
         */
        self.msg = EMPTY;
        /**
         * 提示层
         * @type {HTMLElement}
         */
        self.tip = EMPTY;
        //超类初始化
        Tip.superclass.constructor.call(self, target, config);
    }

    //继承于KISSY.Base
    S.extend(Tip, Base);
    S.mix(Tip, {
            //模板
            tpl : {
                DEFAULT : '<div class="ks-auth-tip {cls}">{msg}</div>'
            },
            //事件
            event : { RENDER : 'render',CREATE : 'create',SHOW : 'show',HIDE : 'hide'}
        });
    /**
     * 设置参数
     */
    Tip.ATTRS = {
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
         * 消息层模板
         * @type String
         */
        tpl : {
            value : Tip.tpl.DEFAULT
        },
        /**
         * 消息类型对应的样式
         * @type String
         */
        cls : {
            value : {
                //错误
                error : 'ks-auth-error',
                //警告
                warn : 'ks-auth-warn',
                //成功
                success : 'ks-auth-success',
                //提示
                cue : 'ks-auth-cue',
                none : 'ks-auth-none'
            }
        },
        /**
         * 容器
         * @type String
         */
        container : {
            value : EMPTY
        },
        /**
         * 提示层宽度
         * @type String | Number
         */
        width : {
            value : 'auto',
            setter : function(v){
                this._setTipWidth(v);
                return v;
            }
        },
        /**
         * 提示层最大宽度
         * @type Number
         */
        maxWidth : {
            value : EMPTY
        }
    };
    /**
     * 方法
     */
    S.augment(Tip, {
            /**
             * 运行
             */
            render : function() {
                var self = this,target = self.target;
                if (target == null) {
                    console.log(LOG_PREFIX + '目标表单域不存在！');
                    return false;
                }
                self.fire(Tip.event.RENDER);
            },
            /**
             * 显示消息
             * @param {String} style 样式
             * @param {String} msg 消息
             * @return {Tip} Tip的实例
             */
            show : function(style, msg) {
                var self = this,elTip = self.tip;
                if(S.isString(style) && S.isString(msg)){
                    if(elTip != EMPTY){
                        DOM.remove(elTip);
                        elTip = EMPTY;
                    }
                    if (elTip == EMPTY || self.msg != msg) elTip = self._create(style, msg);
                }
                DOM.show(elTip);
                self.fire(Tip.event.SHOW);
                return self;
            },
            /**
             * 隐藏消息
             * @return {Tip} Tip的实例
             */
            hide : function() {
                var self = this,target = self.target,elTip = self.tip;
                if (!S.isObject(target)) return false;
                DOM.hide(elTip);
                self.fire(Tip.event.HIDE);
                return self;
            },
            /**
             * 创建提示层
             * @param {String} style 样式
             * @param {String} msg 消息
             * @return {HTMLElement} 消息层
             */
            _create : function(style, msg) {
                var self = this,target = self.target,dataTip = data.TIP,width = self.get('width'),
                    tpl = self.get('tpl'),cls = self.get('cls')[style],container = self.get('container'),
                    tipHtml = EMPTY,tip;
                if (!S.isString(tpl)) return false;
                tipHtml = S.substitute(tpl, {'cls' : cls,'msg' : msg});
                tip = DOM.create(tipHtml);
                self.msg = msg;
                if (container != EMPTY) {
                    DOM.html(container, EMPTY);
                    DOM.append(tip, container);
                } else {
                    DOM.append(tip, DOM.parent(target));
                }
                DOM.data(target, dataTip, tip);
                self._setTipWidth(width);
                self.tip = tip;
                console.log(LOG_PREFIX + '消息层已创建！');
                self.fire(Tip.event.CREATE);
                return tip;
            },
            /**
             * 设置提示层宽度
             * @param {Number} width 宽度
             * @return {Number} 宽度
             */
            _setTipWidth : function(width) {
                var self = this,target = self.target,dataTip = data.TIP,tip = DOM.data(target, dataTip),
                    len,maxWidth = self.get('maxWidth');
                if (!tip || !width) return false;
                if (width == 'auto') {
                    len = DOM.text(tip).length;
                    width = len * 12 + 10;
                    //不得超过最大允许宽度
                    if(S.isNumber(maxWidth) && width > maxWidth) width = maxWidth;
                }
                DOM.width(tip, width);
                console.log(LOG_PREFIX + '消息层的宽度为' + width);
                return width;
            }
        });

    return Tip;
}, {requires:['dom','event','anim','base']});
