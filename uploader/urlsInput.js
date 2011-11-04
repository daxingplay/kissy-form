/**
 * @fileoverview 存储文件路径信息的隐藏域
 * @author: 剑平（明河）<minghe36@126.com>,紫英<daxingplay@gmail.com>
 **/
KISSY.add(function(S,Node,Base) {
    var EMPTY = '',$ = Node.all,LOG_PREFIX = '[uploader-urlsInput]:';
    function UrlsInput(container,config){
        var self = this;
        //调用父类构造函数
        UrlsInput.superclass.constructor.call(self,config);
        self.set('container',$(container));
    }
    S.mix(UrlsInput,/**@lends UrlsInput*/ {
        TPL : '<input type="hidden" id="{name}" name="{name}" value="{value}" />'
    });
    //继承于Base，属性getter和setter委托于Base处理
    S.extend(UrlsInput, Base, /** @lends UrlsInput.prototype*/{
            /**
             * 运行
             */
            render : function(){
                var self = this,container = self.get('container');
                if(!S.isObject(container)){
                    S.log(LOG_PREFIX + 'container参数不合法！');
                    return false;
                }
                self._create();
            },
            /**
             * 创建隐藏域
             */
            _create : function(){
                var self = this,container = self.get('container'),
                    tpl = self.get('tpl'),
                    name = self.get('name'), urls = self.get('urls'),
                    input;
                if(!S.isString(tpl) || !S.isString('name')) return false;
                input = $(S.substitute(tpl,{name : name,value : urls}));
                container.append(input);
                self.set('input',input);
                return input;
            }

    },{ATTRS : /** @lends UrlsInput*/{
            name : {value : EMPTY},
            /**
             * 文件路径
             */
            urls : {
                value : EMPTY,
                setter : function(v){

                }
            },
            /**
             * input模板
             */
            tpl : {value : UrlsInput.TPL},
            /**
             * 文件路径隐藏input
             */
            input : {value : EMPTY},
            /**
             * 隐藏域容器
             */
            container : {value : EMPTY}
    }});

    return UrlsInput;
},{requires:['node','base']});