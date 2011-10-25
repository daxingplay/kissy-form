/**
 * @fileoverview 文件上传验证
 * @author: 剑平（明河）<minghe36@126.com>
 **/
KISSY.add(function(S, DOM, Event) {
    var EMPTY = '',
        //控制台
        console = console || S,LOG_PREFIX = '[ajaxUploader-auth]:';
    /**
     * @name Auth
     * @class 文件上传验证
     * @constructor
     * @param {Object} config 配置对象
     */
    function Auth(config) {
        var self = this;
        /**
         * 检验是否通过
         * @type {Boolean}
         */
        self.pass = true;
        /**
         * 配置
         * @type Object
         */
        self.config = S.merge(Auth.defaultConfig, config);
        self._init();
    }
    /**
     * 参数
     */
    Auth.defaultConfig = {
        /**
         * 上传组件实例
         * @type Object
         */
        ajaxUploader : EMPTY,
        /**
         * 提示信息实例
         * @type Object
         */
        tip :EMPTY,
        /**
         * 允许的最大上传数
         * @type Number
         */
        max : 3,
        /**
         * 当上传的文件达到最大允许数时是否禁用上传按钮
         * @type Boolean
         */
        maxDisabled : true,
        /**
         * 是否自动隐藏提示信息（出现错误或警告时）
         * @type Boolean
         */
        autoHideTip : true,
        /**
         * 隐藏提示延迟时间（依赖于autoHideTip参数）
         * @type Number
         */
        hideTipDelay : 5000,
        /**
         * 允许上传的文件格式
         * @type Array
         */
        allowExts : ['jpg','jpeg','png','gif','bmp','JPG','JPEG','PNG','GIF','BMP'],
        /**
         * 是否必须上传个文件
         * @type Boolean
         */
        require : false,
        /**
         * 语言配置
         * @type Object
         */
        lang : {
            //最大
            max : ['cue','每次最多上传3张图片，提交凭证后，你可以再次上传凭证！'],
            //后缀
            ext : ['error','不支持该格式的文件上传！'],
            //存在性
            exist : ['error','该文件已经存在！'],
            //上传失败
            error : ['error','上传文件失败，请重新上传！'],
            //至少上传一个文件
            require : ['error','必须至少上传一个文件！']
        }
    };
    /**
     * 方法
     */
    S.augment(Auth, S.EventTarget, {
            /**
             * 初始化
             */
            _init : function() {
                var self = this,config = self.config,ajaxUploader = config.ajaxUploader,
                    tip = config.tip,queue = ajaxUploader.get('queue'),isPass;
                if (ajaxUploader == EMPTY) {
                    console.log(LOG_PREFIX + 'ajaxUploader不可以为空！');
                    return false;
                }
                if (tip == EMPTY) {
                    console.log(LOG_PREFIX + 'tip不可以为空！');
                    return false;
                }
                //监听文件开始上传事件
                ajaxUploader.on('uploadStart', function(ev) {
                    //隐藏错误提示
                    tip.hide();
                    isPass = self.testAllowExt(ev.fileName) && self.testExist(ev.fileName);
                    ajaxUploader.set('isAllowUpload', isPass);
                });
                //监听文件上传成功事件
                ajaxUploader.on('uploadSuccess', function(ev) {
                    self.testMax(ev.urls);
                });
                //监听文件上传失败事件
                ajaxUploader.on('uploadError', function(ev) {
                    self._showError(ev.msg);
                });
                //监听队列删除文件事件
                queue.on('removeItem', function() {
                    self.testMax(queue.files);
                });
            },
            /**
             * 测试是否是允许的文件上传类型
             * @return {Boolean} 是否通过
             */
            testAllowExt : function(fileName) {
                var self = this,config = self.config,exts = config.allowExts,reg,
                    isAllow = false,tip = config.tip,lang = config.lang.ext;
                if (!S.isString(fileName)) {
                    console.log(LOG_PREFIX + '文件名不合法！');
                    return false;
                }
                if (!S.isArray(exts) || exts.length == 0) {
                    console.log(LOG_PREFIX + '文件类型必须是一个非空数组！');
                    return false;
                }
                S.each(exts, function(ext) {
                    reg = new RegExp(ext);
                    if (reg.test(fileName)) {
                        isAllow = true;
                        return true;
                    }
                });
                if (!isAllow) {
                    tip.show(lang[0], lang[1]);
                }
                return isAllow;
            },
            /**
             * 测试是否超过了最大允许上传数
             * @param {Array} urls 文件路径数组
             * @return {Boolean} 是否通过
             */
            testMax : function(urls) {
                var self = this,config = self.config,pass = false,
                    max = config.max,maxDisabled = config.maxDisabled,
                    ajaxUploader = config.ajaxUploader,btn = ajaxUploader.get('button'),
                    len,tip = config.tip,lang = config.lang.max;
                if (!S.isArray(urls)) {
                    console.log(LOG_PREFIX + '文件路径urls必须是一个数组！');
                    return false;
                }
                len = urls.length;
                if (len > max) {
                    pass = false;
                }
                //当达到最大允许数时可以选择是否禁用上传按钮
                else if (len == max) {
                    //让上传按钮不可用
                    if (maxDisabled) btn.set('disabled', true);
                    console.log(LOG_PREFIX + lang[1]);
                    //显示消息
                    tip.show(lang[0], lang[1]);
                    btn.hide();
                    //self._autoHideTip();
                } else {
                    if (maxDisabled) btn.set('disabled', false);
                    tip.hide();
                    console.log(LOG_PREFIX + 'max测试通过！');
                    pass = true;
                    btn.show();
                }
                return pass;
            },
            /**
             * 验证文件是否已经存在
             * @param {String} fileName 文件名
             * @return {Boolean} pass 是否通过
             */
            testExist : function(fileName){
                var self = this,config = self.config,pass = true,
                    ajaxUploader = config.ajaxUploader,queue = ajaxUploader.get('queue'),
                    //队列中的文件
                    files = queue.files,lang = config.lang.exist,tip = config.tip;
                //不存在文件直接返回true
                if(files.length == 0) return true;
                S.each(files,function(file){
                    if(fileName == file.name){
                        //显示消息
                        tip.show(lang[0], lang[1]);
                        self._autoHideTip();
                        pass = false;
                    }
                });
                pass && console.log(LOG_PREFIX + 'exist测试通过！');
                return pass;
            },
            /**
             * 必须至少上传1个文件
             * @return {Boolean} pass 是否通过
             */
            testRequire : function(){
                var self = this,config = self.config,pass = true,
                    ajaxUploader = config.ajaxUploader,queue = ajaxUploader.get('queue'),
                    //队列中的文件
                    files = queue.files,lang = config.lang.require,tip = config.tip;
                if(!files.length){
                    //显示消息
                    tip.show(lang[0], lang[1]);
                    self._autoHideTip();
                    pass = false;
                }
                pass && console.log(LOG_PREFIX + 'require测试通过！');
                return pass;
            },
            _autoHideTip : function(){
                var self = this,config = self.config,tip = config.tip,
                    autoHideTip = config.autoHideTip,delay = config.hideTipDelay;
                if(autoHideTip && S.isNumber(delay)){
                    S.later(function(){
                        tip.hide();
                    },delay);
                }

            },
            /**
             * 显示从服务器返回的上传失败信息
             * @param {String} msg 消息
             */
            _showError : function(msg){
                var self = this,type = 'error',config = self.config,tip = config.tip,lang = config.lang.error;
                if(!S.isString(msg)){
                    type = lang[0];
                    msg = lang[1];

                }
                tip.show(type,msg);
                self._autoHideTip();
            }
        });
    return Auth;
}, {requires:['dom','event']});