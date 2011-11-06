/**
 * 文件上传队列列表显示和处理
 * @author: 剑平（明河）<minghe36@126.com>,紫英<daxingplay@gmail.com>
 **/
KISSY.add(function(S,Node,Base) {
    var EMPTY = '',$ = Node.all;
    /**
     * @name Queue
     * @class 文件上传队列
     * @constructor
     * @extends Base
     * @requires Node
     */
    function Queue(target,config){
        var self = this;
        //调用父类构造函数
        Queue.superclass.constructor.call(self,config);
        self.set('target',$(target));
    }
    S.mix(Queue,/**@lends Queue*/ {
            /**
             * 模板
             */
            tpl : {
                DEFAULT:'<li id="files{id}" class="f-l" data-url="{url}" data-name="{name}" data-size="{size}">' +
                            '<div class="f-l sprite file-icon"></div>' +
                            '<div class="f-l">{name}</div>' +
                            '<div class="f-l loading J_Loading"></div>' +
                            '<div class="f-l uploader-controller J_UploaderController"><a href="#deleteFile()" class="g-u J_DeleteFile">删除</a></div>' +
                        '</li>'
            },
            /**
             * 支持的事件
             */
            event : {
                //添加完一个文件后的事件
                ADD_ITEM : 'addItem',
                //添加多个文件后的事件
                ADD_ALL : 'addAll',
                //删除文件后触发
                REMOVE_ITEM : 'removeItem',
                // 队列满时触发
                QUEUE_FULL: 'queueFull'
            },
            //样式
            cls : {
                QUEUE : 'ks-uploader-queue'
            }
    });
    //继承于Base，属性getter和setter委托于Base处理
    S.extend(Queue, Base, /** @lends Queue.prototype*/{
            /**
             * 运行组件
             * @return {Queue}
             */
            render: function(){
                var self = this,$target = self.get('target');
                $target.addClass(Queue.cls.QUEUE);
                return self;
            },
            /**
             * 获取指定索引值的队列中的文件
             * @param index
             */
            getFile : function(index){
                
            }
    },{ATTRS : /** @lends Queue*/{
            /**
             * 模板
             * @type String
             */
            tpl : { value : Queue.tpl.DEFAULT },
            target : {value : EMPTY},
            length : {value : 0}
    }});
    
    return Queue;
},{requires:['node','base']});
