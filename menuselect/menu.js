/**
 * @fileoverview 菜单列表（起到类似下拉框的下拉列表的作用）
 * @author: 剑平（明河）<minghe36@126.com>
 *
 **/
KISSY.add(function(S, Node,List) {
    var $ = Node.all;
    function Menu(container,config){
        //超类初始化
        Menu.superclass.constructor.call(self,container,config);
    }
    //继承于List
    S.extend(Menu, List);
    S.augment(Menu,{
        show : function(){

        },
        hide : function(){
            
        }
    });
    return Menu;
},{requires:['node','./list/list']});