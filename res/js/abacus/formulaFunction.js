/**
 * Absolute value.<BR>
 * 取绝对值.
 * @param number Number: Number for absoluting. 数字：需要求绝对值的数值.
 * @returns Number: Value of absolute. 传入参的绝对值（非负数）
 */
function ABS(number){
    if (!isNaN(number)) {
        return (number > 0) ? (number) : (-number);
    }
}
/**
 * Minimum value.<BR>
 * 求多个数值的最小值.
 * @param Multiple. Numbers, array of number or multiple array. 多个数值或数组.  
 * @returns Number: Minimum value. 最小值
 */
function MIN(){
    var ps;
    if (arguments.length <= 0) {
        return null;
    } else if (arguments.length == 1) {
        ps = arguments[0];
    } else {
        ps = arguments;
    }
    if (ps.length) {
        var min = ps[0];
        for (var i = 0; i < ps.length; i++) {
            if (ps[i] instanceof Array) {
                var tmp = MAX(ps[i]);
                min = (min < tmp) ? (min) : (tmp);
            } else {
                min = (min < ps[i]) ? (min) : (ps[i]);
            }
        }
        return min;
    } else if (!isNaN(ps)) {
        return ps;
    }
}
function MAX(){
    var ps;
    if (arguments.length <= 0) {
        return null;
    } else if (arguments.length == 1) {
        ps = arguments[0];
    } else {
        ps = arguments;
    }
    if (ps.length) {
        var max = ps[0];
        for (var i = 0; i < ps.length; i++) {
            if (ps[i] instanceof Array) {
                var tmp = MAX(ps[i]);
                max = (max > tmp) ? (max) : (tmp);
            } else {
                max = (max > ps[i]) ? (max) : (ps[i]);
            }
        }
        return max;
    } else if (!isNaN(ps)) {
        return ps;
    }
}
function SUM(){
    var ps;
    if (arguments.length <= 0) {
        return null;
    } else if (arguments.length == 1) {
        ps = arguments[0];
    } else {
        ps = arguments;
    }
    if (ps.length) {
        var ret = 0;
        for (var i = 0; i < ps.length; i++) {
            if (ps[i] instanceof Array) {
                ret += SUM(ps[i]);
            } else {
                ret += ps[i];
            }
        }
        return ret;
    } else if (!isNaN(ps)) {
        return ps;
    }
}

/**
 *matching:匹配区
 *conditions:条件区
 *sum:聚合区
 *
 *<pre>
 *SUMIF('$..dkqdGridlbVO[*].fpzlDm',[condition1,condition2...],'$..dkqdGridlbVO[*].yfje').条件聚合
 *</pre>
 */
function SUMIF() {
    var matching,con,ps;
    if(arguments.length >0 && arguments.length <= 2) {
        return SUM(arguments[arguments.length-1]);
    } else if(arguments.length == 3) {
        matching = arguments[0];
        con = arguments[1];
        ps = arguments[2];
    } else {
        return null;
    }

    if (matching.length) {
        var ret = 0;
        for (var i = 0; i < matching.length; i++) {
            //if(con.length)
            if(con.indexOf(matching[i]) != -1) {
                if (matching[i] instanceof Array) {
                    ret += SUM(ps[i]);
                } else {
                    ret += ps[i];
                }
            }
        }
        return ret;
    } else if (!isNaN(ps)) {
        return ps;
    }
}
/**
 * Rounding the fractional part.<BR>
 * 将数字的小数部分进行四舍五入, 缺省保留两位精度.
 * @param number Number: Number for rounding. 数字：需要做四舍五入的数值.
 * @param precision Number: Precision. 数字：精度，默认为2.
 * @returns Number: Rounding result.
 */
function ROUND(number, precision){
    if (isNaN(number)) {
        return 0;
    }
    if (number == Infinity || number == -Infinity) {
        return 0;
    }
    /* 默认精度为2位 */
    if (precision == undefined) precision = 2;
    var t = 1;
    for (; precision > 0; t *= 10, precision--);
    for (; precision < 0; t /= 10, precision++);
    return Math.round(number * t) / t;
}
/**
 * Truncate the fractional part.<BR>
 * 将数字的小数部分截去, 返回整数.
 * @param number Number: Number for truncate. 数字：需要做截断的数值.
 * @param precision Number: Precision. 数字：精度，默认为0.
 * @returns Number: Truncated result.
 */
function TRUNC(number, precision){
    //TODO: 啥都还没写.
   throw "No implement yet!" 
}

function IF(condition, retYes, retNo){
    return (condition) ? retYes : retNo;
}
/**
 * Return value from multiple selections according to selection-expression.<BR>
 * 比较表达式和搜索字，如果匹配，返回结果；如果不匹配，返回default值；如果未定义default值，则返回空值.
 * @param Multi-parameters: expression, search_1, result_1, search_2, result_2, ..., result_default <BR>
 *            不定参数：表达式, 索引1, 取值1, 索引2, 取值2, ..., 缺省结果
 * 
 * <pre>
 *   DECODE (expression, search_1, result_1)
 *   DECODE (expression, search_1, result_1, search_2, result_2)
 *   DECODE (expression, search_1, result_1, search_2, result_2, ...., search_n, result_n)
 *   DECODE (expression, search_1, result_1, default)
 *   DECODE (expression, search_1, result_1, search_2, result_2, default)
 *   DECODE (expression, search_1, result_1, search_2, result_2, ...., search_n, result_n, default)
 * </pre>
 * 
 * @returns Result if matched, otherwise return default or null. 返回匹配结果值, 如无法匹配则返回default或null.
 */
function DECODE(){
    if (arguments.length <= 2) {
        return null;
    }
    //TODO: 啥都还没写.
    throw "No implement yet!" 
}
/**
 *codeTable:代码表
 *path:索引
 *node:获取值
 *
 *<pre>
 *CT('ysxmCT',$..ygzsffxcsmxbGridlbVO[#].ysxmdmjmc,'zsl').在应税项代码表中，根据应税项目代码获取征收率
 *</pre>
 */
function CT(codeTable, key, node) {
    return formCT[codeTable][key][node];
}

/**
 * 获取字符串的长度
 * 
 */
function len(stringVar){
	// TO-DO  需要考虑中文
	return stringVar.length;
}