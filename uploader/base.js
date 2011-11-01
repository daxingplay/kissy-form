/**
 * @fileoverview 异步文件上传组件
 * @author: 剑平（明河）<minghe36@126.com>,紫英<daxingplay@gmail.com>
 **/
KISSY.add(function(S, Base, Node,IframeWay,AjaxWay) {
    var EMPTY = '',$ = Node.all,LOG_PREFIX = '[uploader]:';
    /**
     * @name Uploader
     * @class 异步文件上传组件
     * @constructor
     * @extends Base
     * @requires Node,IframeUploader,AjaxUploader
     */
    function Uploader(){
        var self = this;
        //调用父类构造函数
        Uploader.superclass.constructor.call(self);
        
    }
    S.mix(Uploader,{
        WAY : {AUTO : 'auto',IFRAME : 'iframe',AJAX : 'ajax'}
    });
    //继承于Base，属性getter和setter委托于Base处理
    S.extend(Uploader, Base, /** @lends Uploader.prototype*/{
            /**
             * 运行
             */
            render : function(){
                var self = this,UploadWay = self.getUploadWay();
                if(!UploadWay) return false;

            },
            /**
             * 上传文件
             */
            upload : function(){

            },
            /**
             * 是否支持ajax方案上传
             * @return {Boolean}
             */
            isSupportAjax : function(){
                return S.isObject(FormData);
            },
            /**
             * 获取上传方式类（iframe方案或ajax方案）
             * @return {IframeWay|AjaxWay}
             */
            getUploadWay : function(){
                var self = this,way = self.get('way'),WAY = Uploader.WAY,
                isSupportAjax = self.isSupportAjax(),UploadWay;
                switch(way){
                    case WAY.AUTO :
                        UploadWay = isSupportAjax && AjaxWay || IframeWay;
                    break;
                    case WAY.IFRAME :
                        UploadWay = IframeWay;
                    break;
                    case WAY.AJAX :
                        UploadWay = AjaxWay;
                    break;
                    default :
                    S.log(LOG_PREFIX + 'way参数不合法，只允许配置值为'+WAY.AUTO + ',' + WAY.IFRAME + ',' + WAY.AJAX);
                    return false;
                }
                return UploadWay;
            }
    },{ATTRS : /** @lends Uploader*/{
            /**
             * 采用的上传方案，auto：根据浏览器自动选择，iframe：采用iframe方案，ajax：采用ajax方案
             */
            way : {value : Uploader.WAY.AUTO}
    }});
    return Uploader;
},{requires:['base','node','./way/iframeWay','./way/ajaxWay']});