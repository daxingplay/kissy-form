/**
 * @fileoverview 上传方式类的基类
 * @author: 剑平（明河）<minghe36@126.com>,紫英<daxingplay@gmail.com>
 **/
KISSY.add(function(S,Node,Base) {
    var EMPTY = '',$ = Node.all;
    /**
     * @name UploadType
     * @class iframe方案上传
     * @constructor
     * @extends Base
     * @requires Node
     */
    function UploadType(config){
        var self = this;
        //调用父类构造函数
        UploadType.superclass.constructor.call(self,config);
    }
    //继承于Base，属性getter和setter委托于Base处理
    S.extend(UploadType, Base, /** @lends UploadType.prototype*/{
            /**
             * 上传文件
             */
            upload : function(){

            }
    },{ATTRS : /** @lends UploadType*/{
            /**
             * 服务器端路径
             */
            action : {value : EMPTY},
            /**
             * 传送给服务器端的参数集合（会被转成hidden元素post到服务器端）
             */
            data : {value : {}}
    }});

    return UploadType;
},{requires:['node','base']});