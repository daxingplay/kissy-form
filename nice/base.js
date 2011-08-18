/**
 * @fileoverview 表单元素美化基础
 * @author: 剑平（明河）<minghe36@126.com>
 *
 **/
KISSY.add('nice/base', function(S) {
    /**
     * 触发目标事件
     * @param {String} target 事件目标
     * @param {String} type 事件类型
     */
    KISSY.Event.trigger = function(target,type){
        var listeners = Event.__getListeners(target,type),
            len = listeners.length,fn,that;
        if(len == 0) return false;

        S.each(listeners,function(listener){
            fn = listener.fn;
            that = listener.scope;
            if(S.isFunction(fn)){
                fn.call(listener.scope,{'target':target});
            }
        });
    };
});