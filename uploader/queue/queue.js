/**
 * @fileoverview 上传队列列表显示和处理
 * @author: 剑平（明河）<minghe36@126.com>
 **/
KISSY.add(function(S,DOM,Base,Event){
    var EMPTY = '',KB = 'KB',MB = 'MB',
        data = {NAME : 'data-name'},
        //控制台
        console = console || S,LOG_PREFIX = '[queue]:';
    /**
    * 上传队列列表显示和处理
    * @class Queue
    * @constructor
    * @param {String} container 容器（必须是ul或ol）
    * @param {Object} config 配置对象
    */
    function Queue(container ,config){
        var self = this;
        /**
         * 目标容器
         * @type HTMLElement
         */
        self.container = S.get(container);
        /**
         * 文件数据缓存
         * @type Array
         */
        self.files = [];
        //超类初始化
        Queue.superclass.constructor.call(self, config);
    }
    //继承于KISSY.Base
    S.extend(Queue, Base);
    S.mix(Queue,{
        //模板
        //TODO:不合并list和item主要考虑item的自由添加
        tpl : {
            DEFAULT:'<li class="clearfix" data-name="{name}" data-url="{url}">' +
                        '<div class="f-l sprite file-icon"></div>' +
                        '<div class="f-l">{name}</div>' +
                        '<div class="f-l loading J_Loading"></div>' +
                        '<div class="f-l uploader-controller J_UploaderController"><a href="#deleteFile()" class="g-u J_DeleteFile">删除</a></div>' +
                    '</li>'
        },
        hook : {
            LOADING : '.J_Loading',
            UPLOADER_CONTROLLER : '.J_UploaderController',
            DELETE_FILE : '.J_DeleteFile'
        },
        //样式
        cls : {
            QUEUE : 'ks-uploader-queue'
        },
        //事件
        event : {
            //添加完一个文件后的事件
            ADD_ITEM : 'addItem',
            //添加多个文件后的事件
            ADD_ALL : 'addAll',
            //删除文件后触发
            REMOVE_ITEM : 'removeItem'
        },
        /**
         * 转换文件大小字节数
         * @param {Number} size 文件大小字节数
         * @return {String} 文件大小
         */
        convertByteSize : function(size){
            var byteSize = Math.round(size / 1024 * 100) * .01,suffix = KB,sizeParts;
            if (byteSize > 1000) {
                byteSize = Math.round(byteSize *.001 * 100) * .01;
                suffix = MB;
            }
            sizeParts = byteSize.toString().split('.');
            if (sizeParts.length > 1) {
                byteSize = sizeParts[0] + '.' + sizeParts[1].substr(0,2);
            } else {
                byteSize = sizeParts[0];
            }
            return byteSize+ suffix;
        }
    });
    /**
     * 设置参数
     */
    Queue.ATTRS = {
        /**
         * 是否自动运行
         * @type Boolean
         */
        autoRender : {
            value : false,
            setter : function(v){
                v && this.render();
                return v;
            }
        },
        /**
         * 模板
         * @type String
         */
        tpl : {
            value : Queue.tpl.DEFAULT
        },
        /**
         * 最大文件允许数
         * @type Number
         */
        max : {
            value : 3
        }
    };
    /**
     * 方法
     */
    S.augment(Queue,{
        /**
         * 运行
         * @return {Queue} Queue的实例
         */
        render : function(){
            var self = this,container = self.container;
            if(container == null){
                console.log(LOG_PREFIX + '容器不可以为空！');
                return false;
            }
            DOM.addClass(container,Queue.cls.QUEUE);
            return self;
        },
        /**
         * 向上传队列添加文件
         * @param {Object | Array} file 文件信息
         * @return {Queue} Queue的实例
         */
        add : function(file){
            var self = this,itemHtml = EMPTY,item,tpl = self.get('tpl'),
                container = self.container,event = Queue.event,size,
                max = self.get('max'),files = self.files,fileController,delEle;
            if(files.length >= max){
                console.log(LOG_PREFIX + '超过最大允许上传数');
                return false;
            }
            //数组，说明是多个文件集合
            if(S.isArray(file) && file.length > 0){
                S.each(file,function(f,i){
                    self.add(f);
                    if(i == file.length - 1) self.fire(event.ADD_ALL,{files : file});
                })
            }
            //向队列追加一个文件数据
            else if(S.isObject(file)){
                //转换文件大小的单位
                size = file.size;
                if(size) file.size = Queue.convertByteSize(size);
                //转换模板
                itemHtml = S.substitute(tpl,file);
                item = DOM.create(itemHtml);
                DOM.append(item,container);
                //删除链接监听click事件
                fileController = DOM.children(item,Queue.hook.UPLOADER_CONTROLLER);
                delEle = DOM.children(fileController,Queue.hook.DELETE_FILE);
                Event.on(delEle,'click',self._delFileHandler,self);
                //将文件数据加入缓存
                self.files.push(file);
                self.fire(event.ADD_ITEM,{file : file});
            }
            return self;
        },
        /**
         * 删除
         * @param {String | Array} name 文件名，当为数组时批量删除
         * @return {Object} 文件队列实例
         */
        remove : function(name){
            var self = this,files = self.files,lis = DOM.children(self.container,'li');
            if(files.length == 0) return false;
            //数组，说明是多个文件集合
            if(S.isArray(name) && name.length > 0){
                S.each(name,function(n,i){
                    self.remove(n);
                })
            }
            else if(S.isString(name)){
                self.removeFileData(name,function(index){
                    lis[index] != null && DOM.remove(lis[index]);
                    self.fire(Queue.event.REMOVE_ITEM,{index : index});
                });
            }
            return self;
        },
        /**
         * 删除文件数据，之所以有了remove方法后，还引入这个方法，主要考虑有只删除数据不删除DOM的需求
         * @param {String} name 文件名
         * @param {Function} callBack 回调函数
         */
        removeFileData : function(name,callBack){
            var self = this,files = self.files;
            S.each(files,function(file,index){
                //存在该文件
                if(file.name == name){
                    self.files.splice(index,1);
                    callBack && callBack.call(this,index);
                    return true;
                }
            })
        },
        /**
         * 隐藏loading gif图标
         * @param {Number} index li的索引
         * @return {HTMLElement}
         */
        cancelLoading : function(index){
            var self = this,li = DOM.children(self.container)[index],loadingIcon;
            if(!li) return false;
            loadingIcon = DOM.children(li,Queue.hook.LOADING);
            DOM.hide(loadingIcon);
            return loadingIcon;
        },
        /**
         * 显示文件控制操作区，比如删除文件等（一般在上传结束后显示）
         * @param {Number} index li的索引
         * @return {HTMLElement}
         */
        showFileController : function(index){
            var self = this,li = DOM.children(self.container)[index],fileController;
            if(!li) return false;
            fileController = DOM.children(li,Queue.hook.UPLOADER_CONTROLLER);
            DOM.show(fileController);
            return fileController;
        },
        /**
         * 删除事件监听器
         * @param {Object} ev 事件对象
         */
        _delFileHandler : function(ev){
            var self = this,target = ev.target,li = DOM.parent(target,'li'),name = DOM.attr(li,data.NAME);
            //TODO:临时修复IE6下报“name”值为空的错误
            try{
                self.remove(name);
            }catch(err){

            }
        }
    });

    return Queue;
},{requires:['dom','base','event']});
