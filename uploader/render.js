/**
 * @fileoverview 运行文件上传组件
 * @author: 剑平（明河）<minghe36@126.com>,紫英<daxingplay@gmail.com>
 **/
KISSY.add(function(S, Base, Node,Uploader,Button,Queue) {
    var EMPTY = '',$ = Node.all,LOG_PREFIX = '[uploaderRender]:';
    /**
     * 解析组件在页面中data-config成为组件的配置
     * @param {String} hook 组件钩子
     * @param {String} dataConfigName 配置名
     * @return {Object}
     */
    function parseConfig(hook, dataConfigName) {
        var config = {},sConfig,DATA_CONFIG = dataConfigName || 'data-config';
        sConfig = $(hook).attr(DATA_CONFIG);
        if(!S.isString(sConfig)) return {};
        try {
            config = JSON.parse(sConfig);
        } catch(err) {
            S.log(LOG_PREFIX + '请检查'+hook+'上' + DATA_CONFIG + '属性内的json格式是否符合规范！');
        }
        return config;
    }
    /**
     * @name RenderUploader
     * @class 运行文件上传组件
     * @constructor
     * @param {String | HTMLElement} buttonTarget 上传按钮目标元素
     * @param {String | HTMLElement} queueTarget 文件队列目标元素
     * @param {Object} config 配置
     */
    function RenderUploader(buttonTarget, queueTarget, config) {
        var self = this;
        config = config || parseConfig(buttonTarget);
        //超类初始化
        RenderUploader.superclass.constructor.call(self, config);
        self.set('buttonTarget',buttonTarget);
        self.set('queueTarget',queueTarget);
        self.set('uploaderConfig',config);
        self._init();
    }

    S.extend(RenderUploader, Base, {
            /**
             * 初始化组件
             */
            _init : function() {
                var self = this,uploaderConfig = self.get('uploaderConfig'),
                    button = self._initButton(),
                    queue = self._initQueue();
                self.set('button',button);
                self.set('queue',queue);
                //配置增加按钮实例和队列实例
                S.mix(uploaderConfig, {button : button,queue : queue});
                var uploader = new Uploader(uploaderConfig);
                uploader.render();
                uploader.upload();
            },
            /**
             * 初始化模拟的上传按钮
             * @return {Button}
             */
            _initButton : function(){
                var self = this,target = self.get('buttonTarget');
                //实例化上传按钮
                return new Button(target);
            },
            /**
             * 初始化上传文件队列
             * @return {Queue}
             */
            _initQueue : function(){
                var self = this,target = self.get('queueTarget');
                return new Queue(target);
            }
        }, {
            ATTRS : {
                /**
                 * 按钮目标元素
                 */
                buttonTarget : {value : EMPTY},
                /**
                 * 队列目标元素
                 */
                queueTarget : {value : EMPTY},
                /**
                 * 上传组件配置
                 */
                uploaderConfig : {},
                /**
                 * Button（上传按钮）的实例
                 */
                button : {value : EMPTY},
                /**
                 * Queue（上传队列）的实例
                 */
                queue : {value : EMPTY}
            }
        });
    return RenderUploader;
}, {requires:['base','node','./base','./button/base','./queue/base']});