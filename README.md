产品--特性列表 

【处理中Bug】

√ HLJGSDZTGC-8888：用中间变量节点处理码表这个做法不合适，转为通用函数处理（）

√ HLJGSDZTGC-8888：码表函数存在Bug：属性值应可忽略；另外健壮性存在缺陷：没有检测码表是否存在，因为码表需要预定义（）

√ GDSDZSWJ-1342 动态行的表由于第一行不能删除，导致部分列选择内容后无法删除或清空

√ GDSDZSWJ-1355 在IE8环境下，双击申报表的任意单元格，单元格内容显示异常

GDSDZSWJ-1422 鼠标指针移到删除按钮上时，和移到增加按钮上时不一样

√ GDSDZSWJ-8888 类型为11的初始化计算公式没有做关联执行 


【标识说明】

△ 未实现。

▲ 已实现，仍需优化。

◆ 已实现。

★ 高优先级特性。




【待开发特性】

◎输入框类型（）
◎格式化处理（）
1、▲日期选择控件与格式化
2、△电话号码
3、△邮件地址
◎数据项类型与语义检查（）
1、△★自定义格式检查，也即合规性校验（初步考虑依托ng-pattern="/PATTERN/"）
2、△必录输入项提醒
3、△录入项长度限制

◎开发编辑器支持（）
1、△高亮所编辑公式在当前表单中所引用单元格



【开发中特性】

◎ 码表缓存管理（）
1、△期初数来源
2、△查询服务来源

◎ 动态校验（）
1、△错误信息提示支持计算表达式
2、△错误信息提示可反映在左侧表清单

◎动态公式计算（）
1、▲公式中包含自身计算（面临自增问题，慎用）
　　$.temp.a = $.temp.a + 10;
　　$.temp.sum = SUM($.grid[*].je) - $.grid[0].je 
　　主要用于解决：grid[0].je = SUM(grid[*].je) - grid[0].je 这种第0行是合计行的特殊情况。



【提交特性】

◎输入框类型（）
1、◆SELECT控件的options选择项优化
◎ 码表缓存管理（）
1、▲将码表数据项缓存至公共数据模型，便于表单视图进行使用
2、▲码表文件来源
3、▲码表函数操作
　　CT(码表名称, 编码值)：CT("zspm", $..gridVO[#].zspmDm)
　　CT(码表名称, 编码值, 属性)：CT("zspm", $..gridVO[#].zspmDm, "sl")

◎开发编辑器支持（）
1、▲开发模式下，按住Ctrl并点击控件，可定位该表单控件的关联公式，SVN-8679

◎angular集成laydate.js日期控件

GDSDZSWJ-1927

<input  type="text" class="laydate-icon topInput" id="sbrq1" ng-laydate="{}" ng-model="sbbhead.sbrq1" readonly>

【特性完整列表】


•输入框支持类型
1.◆INPUT（，SVN：xxx）
<input type="text" ng-model="JSON数据模型"/>
2.▲SELECT（，SVN：xxx）
<select ng-model="JSON数据模型" ng-options="下拉选项生成表达式"/> 


•输入项支持类型
1.◆数值（带千分位格式化和精度，四舍五入）
缺省两位小数：<input type="text" ng-datatype="number" />
可定义小数位数：<input type="text" ng-datatype="number{4}" />
可定义整数精度：<input type="text" ng-datatype="number{-2}" />
注意1：输入项精度控制在显示层面均有效。如“123456789.123456789”在“number{4}”显示效果为：123,456,789.1235
注意2：输入项精度控制在录入层面：数据保存至数据模型时产生影响，但数据模型如来源于计算等，则其内容不会因精度控制而自动修改！
2.◆数字（仅允许输入数字，/[0-9]*/，不进行任何格式化，如邮政编码、发票代码等）
<input type="text" ng-datatype="digit" />
3.▲文本（字符串，如：纳税人识别号、名称、地址等）


4.△日期（日期选择控件）
 
5.△电话号码
6.△邮件地址


•格式化处理（）
1.◆数值控制与精度处理（，SVN：xxx）
<input type="text" ng-datatype="number{4}" ng-model="zbGridlbVO[0].asysljsxse">
2.△日期选择控件与格式化


•特殊输入转换处理（）
1.◆码值转换：数据模型为编码，但显示时要求显示名称，一般用于Input标签
将征收品目代码转换为名称：<input ng-value="CT.zspm[sbbVo.zspmdm]"  />，需要预先定义码表指令

2.△下拉列表选取更新关联数据项（如选减免性质时，把减免征类型，幅度，额度等带到数据模型）


•码表缓存管理（）
1.▲将码表数据项缓存至公共数据模型，便于表单视图进行使用
2.△期初数来源
3.▲码表文件来源
4.△查询服务来源


•动态行/重复行处理（）
1.▲增减行处理（目前增减行的按钮方式比较原始，未经美化设计）

2.▲增减行默认值设置（定制效果不理想，目前是表单视图上在定义数据模型）
3.△默认带出N行（空行便于用户进行填写）


•动态公式计算（）
1.数据模型访问（公式计算目前均基于数据模型进行计算，模型选取采用JsonPath表达式）
◆全路径访问（4401010123456789）：$.zzsybsbSbbdxxVO.zzssyyybnsr_zb.sbbhead.nsrsbh
◆缩略路径访问（14419150000）：$..zgswskfjDm
2.普通运算
◆四则运算（任意嵌套四则运算）：$.temp.a=($..zbGridlbVO[0].a / ($..zbGridlbVO[0].b - $..zbGridlbVO[0].c)) * $..zbGridlbVO[0].d
◆函数调用（任意嵌套函数调用）：$.temp.a=MAX($..zbGridlbVO[0].a, $..zbGridlbVO[*].b, [$..zbGridlbVO[0].c, $..zbGridlbVO[1].d])
◆聚合运算（用[*]表示数组全元素）：$.temp.sum=SUM($..zbGridlbVO[*].xxse)
△公式中包含自身计算（慎用）：$.temp.a = $.temp.a + 10;
3.函数支持
◆取绝对值（ABS）：ABS(number)，求绝对值
◆四舍五入（ROUND）：ROUND(number, precision)，按精度进行四舍五入
△截断（TRUNC）：TRUNC(number, precision)，按精度直接进行截断
△条件判断（IF）：IF(condition, retYes, retNo)，根据条件是否成立选择返回第二个值还是第三个值
△多分支（DECODE）：DECODE (expression, search_1, result_1,..., default)，规则类似Oracle的decode函数
◆求和函数（SUM）：不定参数个数求和，也可直接传入数组。
◆最小值（MIN）：不定参数个数求最小值，也可直接传入多个数组。
◆最大值（MAX）：不定参数个数求最小值，也可直接传入多个数组。
 
4.重复行（数据模型）的数组下标为指定值
◆直接获取：$.temp.edit.value=$..zbGridlbVO[0].asysljsxse
5.重复行（数据模型）的数组下标为动态参数
◆直接获取：$.temp.currentedit.value=$..zbGridlbVO[#].asysljsxse
◆直接获取并赋值到对应数组：$.temp.edit[#]=$..zbGridlbVO[#].asysljsxse
◆获取所编辑动态行行号：$.temp.index=[#]


6.△重复表重复行（多级重复行）
△直接获取：$.temp.currentedit.value=$.tableGridVO[#A].zbGridlbVO[#B].asysljsxse
△直接获取并赋值到对应表：$.temp.table[#A].value=$.tableGridVO[#A].zbGridlbVO[#B].asysljsxse
△直接获取并赋值到对应数组：$.temp.table[#A].vos[#B].value=$.tableGridVO[#A].zbGridlbVO[#B].asysljsxse
△获取所编辑动态行行号：$.temp.indextable=[#A]

7.▲自动创建赋值节点（公式等号左侧）
8.关联公式自动级联计算
◆关联公式自动关联（级联）计算
▲关联（级联）计算进行规划以减少重复计算提升性能，SVN-9086
9.初始化计算公式
◆针对类型为“10”和“11”的公式进行初始化计算（公式装载完毕后启动）
10.公式合规性检测
◆JPath无效检测
◆缩略JPath存在分支重复检测（如："$..hj" 选择出多个路径分支：root.a.b.hj、root.b.a.hj、root.x.y.z.hj）
△多条公式之间因为计算引用关系导致无限循环的检测


•动态逻辑校验（）
1.▲错误信息提示

2.△错误信息提示支持计算表达式
3.△错误信息提示可反映在左侧表清单


•动态表单控制（）
1.▲输入控件只读控制
2.▲输入控件读写控制
3.▲输入控件样式变更


•公共工具能力（）
1.◆JsonPath选择器，标准版：JSONPath 0.8.0 - XPath for JSON
2.▲JsonPath选择器，高速版：Foresee JPath，对数据模型进行索引管理，提升公式编译速度，SVN-9098


•开发本地化支持（）
1.◆本地表单：/form/业务代码/*.html
2.◆本地规则库：/form/业务代码/rule.json
3.◆本地数据模型：/form/业务代码/data.json


•开发编辑器支持（）
1.数据模型监视器
◆显示完整数据模型
◆按JPath进行数据过滤 
2.公式查看器
◆公式列表
◆公式内容查看及错误提示
△公式分类过滤
△公式检索
3.公式编辑器
▲表单JPath选取（双击表单控件即可获取所绑定数据模型的完整JPath）
◆针对所自动选取的JPath可进行智能缩略处理（如："$.zzsybsbSbbdxxVO.zzssyyybnsr_zb.zbGrid.zbGridlbVO[1].yshwxse ==> $..zbGridlbVO[1].yshwxse），SVN-8318
◆公式编辑与测试
◆公式更新，SVN-7473
◆公式新增，SVN-8050
◆公式删除，SVN-8068
◆公式保存到本地文件，SVN-7866
△公式关联表单高亮反显
4.表单页面
▲定位表单控件的关联公式过滤表单控件的关联公式（计算、校验、控制），SVN-8679
△高亮所编辑公式在当前表单中所引用单元格


【模型：公式规则库】



 


公式规则库







1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
 

[

  {

    "id": 123456789, // 公式编号，不能重复

    "type": "01", // 01计算公式；02校验公式；03控制公式；10初始执行公式；11初始执行且自动计算公式；12初始校验公式

    "desc": "附表3：5=4+3", // 本公式的需求说明

    "formula": "$.temp.result=$..x + $.c.y + $.b * SUM($.d[*])", // 公式表达式

    "target": "", // 控制目标，格式“JsonPath1:控制项1; JsonPath2:控制项2;...”，控制项包括：readonly / readwrite / CSS，CSS格式为“css-attribute=css-value”

    "tips": "本栏次无需填写，自动计算=4+3" // 如果为校验公式，则此处是需要提示给最终用户的信息

  },{

    "id": 0,

    "type": "03",

    "desc": "测试控制：【主表】控制规则, 如果第一行第一列大于10000, 就设置第一行第二列readonly，且变色",

    "formula": "SUM($..zbGridlbVO[0].asysljsxse)>100",

    "target": "$.zzsybsbSbbdxxVO.zzssyyybnsr_zb.zbGrid.zbGridlbVO[1].asysljsxse:readonly; $.zzsybsbSbbdxxVO.zzssyyybnsr_zb.zbGrid.zbGridlbVO[1].asysljsxse:background-color=#FFEEEE; $..zbGridlbVO[1].asysljsxse:font-weight=bold;",

    "tips": ""

  }, ...

] 





【重复行分组显示】
 使用ng-if指令，按照分类特性，比如下面这段是按照fpzldm(发票种类代码)分来显示，在ng-repeat的时候满足fpzldm=='公路运输'时才加载到当前重复区域


动态行分组显示


<tr ng-repeat="p in dkqdGridlbVO track by $index" ng-repeat-init="dkqdGridlbVO" default-value='{"fpzlDm":"公路运输","fphm":"","kprq":"","ysdwMc":"","ysdwNsrsbh":"","ysdwZgdfswjmc":"","ysdwZgdfswjDm":"","yfje":0,"jsdkYfje":0,"jsdkdjxse":0}' ng-if="p.fpzlDm=='公路运输'"> 

<td align="center" class="title01" ng-bind="$index+1" width="4%"></td>

<td class="edit right" style="display:none"><input type="text" ng-model="p.fpzlDm"> </td> 

<td class="edit right" width="9%"><input type="text" ng-model="p.fphm" ng-datatype="digit"> </td> 

<td class="edit left" width="7%"><input type="text" class="laydate-icon topInput" ng-laydate="{}" ng-model ="p.kprq" readonly style="width: 99%; padding-right: 0; padding-left: 0; height: 100%;"></td>

<td class="edit right" width="12%"><input type="text" ng-model="p.ysdwMc"> </td> 

<td class="edit right" width="9%"><input type="text" ng-model="p.ysdwNsrsbh"> </td> 

<td class="edit right" width="9%"><input type="text" ng-model="p.ysdwZgdfswjmc"> </td> 

<td class="edit right" width="9%"><input type="text" ng-model="p.ysdwZgdfswjDm"> </td> 

<td class="edit right" width="9%"><input type="text" ng-datatype="number" ng-model="p.yfje"></td> 

<td class="edit right" width="9%"><input type="text" ng-datatype="number" ng-model="p.jsdkYfje"></td> 

<td class="edit right" width="9%"><input type="text" ng-datatype="number" ng-model="p.jsdkdjxse"></td> 

<td align="center" width="8%"><div class="sbtnbox"><a class="sbtn sbtn01" ng-href="#" ng-click="add()">增加</a>&nbsp;&nbsp;&nbsp;<a class="sbtn sbtn03" ng-if="$index!=0" ng-href="#" ng-click="del($index)">删除</a></div></td></tr> 

 





【angular兼容IE8（IE7）】


angular兼容IE8（IE7）


//1、angular版本

@license AngularJS v1.2.29

//2、兼容脚本

var ua = navigator.userAgent;                     

if (ua && ua.indexOf("MSIE 7") >= 0) {                         

// Completely disable SCE to support IE7.                         

viewApp.config(function($sceProvider){                             

console.log("启动IE7兼容性支持：" + ua);                             

$sceProvider.enabled(false);                         

});                     

}

 

/**  * Internet Explorer 7 Compatible  */

if (typeof document.querySelectorAll !== 'function') {  

document.querySelectorAll = function(selectors){   

var style = document.createElement('style'), elements = [], element;   

document.documentElement.firstChild.appendChild(style);   

document._qsa = [];   

style.styleSheet.cssText = selectors + '{x-qsa:expression(document._qsa && document._qsa.push(this))}';   

window.scrollBy(0, 0);   

style.parentNode.removeChild(style);   

while (document._qsa.length) {    

element = document._qsa.shift();    

element.style.removeAttribute('x-qsa');    

elements.push(element);   

}   

document._qsa = null;   

return elements;  

}; 

} 

if (typeof document.querySelector !== 'function') {  

document.querySelector = function(selectors){   

var elements = document.querySelectorAll(selectors);   

return (elements.length) ? elements[0] : null;  

}; 

}

//3、在页头加

<!doctype html> <html id="ng-app"  xmlns:ng="http://angularjs.org"> 
