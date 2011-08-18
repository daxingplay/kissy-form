/**
 * @fileoverview 数据列表，根据json数据源产生可选择的模拟列表
 * @author: 剑平（明河）<minghe36@126.com>
 *
 **/
KISSY.add(function(S, DOM, Base, Event, Template) {
    var EMPTY = '',
        //控制台
        console = console || S,LOG_PREFIX = '[nice-list]:';
    /**
     * @name List
     * @class 数据列表，根据json数据源产生可选择的模拟列表
     * @constructor
     * @augments KISSY.Base
     * @description
     * List组件多用于模拟选择框的下拉数据，也可应用于多选框。
     * @param {String} container 容器
     * @param {Object} config 配置对象
     * @property {HTMLElement} container 模拟列表的容器
     * @property {HTMLElement} list 模拟列表元素，一般是ul或ol
     */
    function List(container, config) {
        var self = this;
        /**
         * 列表的容器
         * @type HTMLElement
         */
        self.container = S.get(container);
        /**
         * 列表元素
         * @type HTMLElement
         */
        self.list = EMPTY;
        /**
         * 当前选中的选项索引
         * @type Number
         */
        self.currentIndex = EMPTY;
        //超类初始化
        List.superclass.constructor.call(self, config);
    }

    //继承于KISSY.Base
    S.extend(List, Base);
    S.mix(List, /**@lends List*/ {
            /**
             * 模板
             */
            tpl : {
                DEFAULT : '<ul class="ks-nice-list">' +
                    '{{#each data}}' +
                    '<li data-value="{{_ks_value.value}}">{{_ks_value.text}}</li>' +
                    '{{/each}}' +
                    '</ul>'
            },
            /**
             * 组件用到的样式名称
             */
            cls : {CURRENT : 'ks-nice-current',HOVER : 'ks-nice-hover'},
            /**
             * 支持的事件
             */
            event : {RENDER : 'render',CLICK : 'click'},
            /**
             * 缓存数据key名
             */
            data : {VALUE : 'data-value'}
        });
    /**
     * @description
     * <p>组件默认参数（该属性寄生于KISSY.Base，让配置项拥有getter和setter方法）</p>
     * <ul>
     *     <li>autoRender:是否自动运行</li>
     *     <li>data:数据源</li>
     *     <li>tpl:组件使用的模板</li>
     *     <li>style:设置list的容器样式</li>
     * </ul>
     */
    List.ATTRS = {
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
         * 数据
         * @type Array
         */
        data : {
            value : [],
            setter : function(v) {
                return v;
            }
        },
        /**
         * 模板
         * @type String
         */
        tpl : {
            value : List.tpl.DEFAULT
        },
        /**
         * 设置list容器样式
         * @type Object
         */
        style : {
            value : {},
            setter : function(v) {
                var self = this,list = self.list;
                DOM.css(list, v);
                return v;
            }
        }
    };

    /**
     * 方法
     */
    S.augment(List, 
        /**@lends List.prototype*/
        {
            /**
             * 运行
             */
            render : function() {
                var self = this,container = self.container,style = self.get('style'),list,li;
                if (container.length == 0) {
                    console.log(LOG_PREFIX + '列表容器不存在！');
                    return false;
                }
                list = self._create();
                li = DOM.children(list);
                Event.on(li,'click',self._clickHandler,self);
                Event.on(li,'mouseover mouseout',self._hoverHandler,self);
                self.fire(List.event.RENDER);
            },
            /**
             * 选中数据项
             * @param {String} value 选项的value值
             */
            select : function(value){
                var self = this,currentCls = List.cls.CURRENT,
                    list = self.list,lis = DOM.children(list);
                S.each(lis,function(li,i){
                    if(DOM.attr(li,List.data.VALUE) == value){
                        DOM.removeClass(lis,currentCls);
                        DOM.addClass(li,currentCls);
                        self.currentIndex = i;
                        return true;
                    }
                })
            },
            /**
             * 创建列表
             */
            _create : function() {
                var self = this,container = self.container,data = self.get('data'),tpl = self.get('tpl'),html = EMPTY;
                if (!S.isArray(data) || data.length == 0 || !S.isString(tpl)) return false;
                html = Template(tpl).render({data : data});
                DOM.html(container, html);
                return self.list = DOM.children(container)[0];
            },
            /**
             * 点击列表选项时触发
             */
            _clickHandler : function(ev){
                var self = this,target = ev.target,currentCls = List.cls.CURRENT,
                    list = self.list,lis = DOM.children(list),
                    text = S.trim(DOM.text(target)),value = DOM.attr(target,List.data.VALUE);
                self.select(value);
                self.fire(List.event.CLICK,{text : text,value : value,target : target});
            },
            /**
             * 鼠标滑过事件监听器
             * @param {Object} ev 事件对象
             */
            _hoverHandler : function(ev){
                var self = this,type = ev.type,target = ev.target,cls = List.cls.HOVER;
                if(!S.isString(cls)) return false;
                if(type == 'mouseover'){
                    DOM.addClass(target,cls);
                }else if(type == 'mouseout'){
                    DOM.removeClass(target,cls);
                }
            }
        });
    return List;
}, {requires:['dom','base','event','template']});