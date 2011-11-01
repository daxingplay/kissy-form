/**
 * @fileoverview iframe方案上传
 * @author: 剑平（明河）<minghe36@126.com>,紫英<daxingplay@gmail.com>
 **/
KISSY.add(function(S,Node,Base) {
    var EMPTY = '',$ = Node.all;
    /**
     * @name IframeWay
     * @class iframe方案上传
     * @constructor
     * @extends Base
     * @requires Node
     */
    function IframeWay(config){
        var self = this;
        //调用父类构造函数
        IframeWay.superclass.constructor.call(self,config);
    }
    S.mix(IframeWay,/**@lends IframeWay*/ {
            
    });
    //继承于Base，属性getter和setter委托于Base处理
    S.extend(IframeWay, Base, /** @lends IframeWay.prototype*/{
        
    },{ATTRS : /** @lends IframeWay*/{

    }});
    
    return IframeWay;
},{requires:['node','base']});