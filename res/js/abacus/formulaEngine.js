var _TEST_TIMES_ = 1; // TODO: WARNING, For performance testing
/**
 * Formula value-object. <BR>
 * 值对象：公式对象, 具体公式字段及取值信息参与内部注释.
 */
function FormulaObject(){
    this.strFormula; // Original formula. 原始公式字符串.
    this.id; // Formula ID from rule base. 规则库中所保存的公式ID.
    this.type; // Formula type. 规则类型（01计算公式；02校验公式；03控制公式；10初始公式；11初始并计算公式；12初始校验公式: 21提交时计算赋值公式）.
    this.desc; // Description from requirement. 本公式的需求说明.
    this.target; // Target effected by formula. 公式所影响的目标对象（主要用于控制公式：03）.
    this.tips; // User tips for verify. 用户提示信息，主要用于校验公式.
    this.strAssignment; // Original assignment's part, left of equal mark. 公式赋值部分，等号左边.
    this.strAssResolved; // Resolved assignment's part, full-path json. 解析后赋值部分（全JSON路径）.
    this.strExpression; // Original expression's part, right of equal mark. 公式计算部分，等号右边.
    this.strExpResolved; // Resolved expression's part, full-path json. 解析后计算部分（全JSON路径）.
    this.lstVariables = []; // All variables in formula. 公式中的所有变量列表.
    this.lstTargetResolved = []; // All target in resolved. 公式所涉及控制目标的解析.
    this.lstDynamicParams = []; // All dynamic parameter's name. 含动态参数公式的参数名（均以#开头）.
    this.flagAggregation = false; // Flag of aggregation, formula has [*]. 标志：聚合，公式中含有[*]数组下标.
    this.flagDynamicParam = false; // Flag of dynamic, formula has [#]. 标志：动态变量，公式中含有[#]下标.
    this.flagCompiled = false; // Flag of complied. 标志：已编译，公式是否成功编译.
    this.lastError = null; // Last error of Exception. 记录最后一次的错误信息（编译过程）.
    this.lastVerify = null; // Last verify result. 记录最后一次的校验结果.
    this.lastControl = null;
    this.flagDisable = false; // Flag of desable, runtime. 失效标志, 运行时状态, 一般用于用户手工修改后让公式不再可用.
}
/**
 * Formula Engine. Maintain all formula in sheet. <BR>
 * 公式引擎, 维护当前表单中所有公式及运算.<BR>
 * 公式引擎主要需要关注以下几个方法（均标注了PUBLIC）：
 * @see loadFormulas(formulas) 从JSON数组中装载公式组（字符串形式）.
 * @see initialize(newBasename) 初始化公式引擎，需要先准备好公式.
 * @see apply(jpath, newValue) 执行数据模型更新（针对特定JPath）, 将指定关联计算公式及校验公式.
 * @see testFormula(cfgFormula) 测试公式，主要用于调试或编辑过程.
 * @see updateFormula(objFormula, cfgFormula) 用于编辑过程中对原公式进行替换.
 * @see appendFormula(cfgFormula) 增加公式.
 * @see deleteFormula(objFormula) 删除公式.
 * @see getFormulaById(id) 根据公式ID获取公式对象.
 * @see getFormulaByAssignment(strAssign) 根据赋值部分获取公式对象.
 * @demo
 * 
 * <pre>
 * var myData = { // 根对象
 *     a : 1, b : 2, c : { // 对象嵌对象
 *         x : 10, y : 20 
 *     }, d : [ // 对象嵌数组（也可继续重复嵌套）
 *         1, 2, 3
 *     ]
 * }; // 定义数据模型
 * var myRuls = [ // 定义公式模型，本身应是个数组
 *     {  'id' : 0, 
 *        'type' : '11', 
 *        'desc' : '执行运算，并将结果写进新的节点中', 
 *        'formula' : '$.temp.result=$..x + $.c.y + $.b * SUM($.d[*])',
 *        'tips' : '如果为校验公式，则此处是需要提示给最终用户的信息'
 *     }
 * ];
 * 
 * formulaEngine = new FormulaEngine(); // 1、创建公式对象
 * formulaEngine.loadFormulas(formulas); // 2、装载公式数据
 * formulaEngine.initialize('myData'); // 3、根据命名数据对象进行引擎初始化
 * 
 * formulaEngine.apply('name.path.of.json', 22); // 一般在事件中进行调用：某个节点值更新，计算所有关联公式
 * 
 * formulaEngine.testFormula('$.result=$.c.x+$..y'); // 一般在编辑公式后需要验证时时进行调用
 * formulaEngine.updateFormula(oldFormulaObject, {'type':'01','formula':'$.result=SUM($..x, $..d[*])'});
 * formulaEngine.appendFormula({'type':'01','formula':'$.result=SUM($..x, $..d[*])'});
 * </pre>
 */
function FormulaEngine(){
    this.lstAllFormulas; // All loaded formulas. 数组, 所有载入的公式，含计算、初始化、校验.
    this.lstCalculateFormulas; // Calculate formulas about '01' or '11'. 数组, 计算公式.
    this.lstInitialFormulas; // Initial formulas about '10' or '11'. 数组, 初始化公式.
    this.lstVerifyFormulas; // Verify formulas about '02','13'. 数组, 校验公式.
    this.lstControlFormulas; // Control formulas about '03','13'. 数组, 控制公式.
    this.lstCalculate2SubmitFormulas;// Calculate formulas about '21'. 数组, 提交前赋值、计算公式.
    this.idxVariable2NoPass; // Recorder variable of not passed verifies.
    this.idxVariable2Control; // Index for variable referenced by control-formula. 索引，记录变量所影响的控制公式。
    this.idxAssign2Formulas; // Use for duplicate assignment detection. 索引, 用于检查重复公式, 关键字为赋值部分.
    this.idxId2Formulas; // Index of formula by formulaId. 索引, 主键索引, 公式ID.
    this.failedFormulas; // Loaded or compile failed formulas. 数组，解析失败的公式.
    this.idxVariable2Formula;// Index for variable referenced by formula. 索引, 反向变量索引用于处理公式级联.
    this.basename; // The base data-object used for calculation. 对象名称（字符串）, 记录公式计算所依赖JSON对象.
    this.jp = new FSjpath();
    // Define function.
    if (typeof FormulaEngine._inited == "undefined") {
        FormulaEngine.prototype.regBasket = /\[(\d+)\]/g;
        FormulaEngine.prototype.regAssignMark = /[^!=><]=[^=><]/;
        /**
         * PUBLIC: Load formulas from JSON, as array. <BR>
         * 外部方法：从JSON数组中装载公式组（字符串形式）.
         * @param formulas JSON-Object: Formulas array from rule-base. JSON对象：从规则库导出的公式数组.
         */
        FormulaEngine.prototype.loadFormulas = function(formulas){
            var _ms_ = new Date().getTime();
            // Check parameter
            if (formulas) {
                if (!formulas instanceof Array) {
                    throw "Parameter formulas is not a array!";
                }
                if (formulas.length <= 0) {
                    throw "Parameter formulas is empty!";
                }
            } else {
                throw "Parameter formulas illegal: " + formulas
            }
            // Do clean up the instance formulas information.
            this.doClean();
            // Load formula
            for (var i = 0; i < formulas.length; i++) {
                var objFormula = this.createFormulaObject(formulas[i]);
                this.add2List(objFormula); // Append to all those various list.
            }
            // Check time.
            _ms_ = new Date().getTime() - _ms_;
            console.log("FormulaEngine: Formulas [" + this.lstAllFormulas.length
                + "] loaded, spend " + _ms_ + "ms.");
        };
        /**
         * PUBLIC: Initialize after formulas loaded. <BR>
         * 外部方法：初始化公式引擎，需要先准备好公式.
         * @param newBasename String The base data-object used for calculation. 对象名称（字符串）, 记录公式计算所依赖JSON对象.
         * @returns none.
         */
        FormulaEngine.prototype.initialize = function(newBasename){
            var flagDoInitial = true;
            if (this.basename && newBasename === true) {
                flagDoInitial = false;
            } else {
                if (!newBasename && !(newBasename instanceof String)) {
                    throw "Initialize parameter illegal, needs String.";
                }
                try {
                    if (!eval(newBasename)) {
                        throw "Initialize parameter's object not founded";
                    }
                } catch (ex) {
                    throw "Initialize basename's object illegal [" + newBasename + "]: " + ex;
                }
                this.basename = newBasename;
            }
            // Init the FSjpath
            this.jp.initialize(eval(this.basename));
            // Initial:
            this.procVerifyFormulas = []; // Temporary variable for processing: involved verify-formulas.
            this.procContorlFormulas = [];
            this.procVariableInStack = {}; // Temporary variable for processing: variable in calling-stack.
            // Do compile, calculate and verify            
            formulaEngine.compileAll();
            if (flagDoInitial) {
                formulaEngine.applyInitialFormulas();
            }
            // Destroy:
            this.procVerifyFormulas = null;
            this.procVariableInStack = null;
        }
        /**
         * PUBLIC: Update formula with specify expression.<BR>
         * 外部方法：更新公式, 用指定的公式字符串来更新公式对象, 引擎将进行重编译和重索引.
         * @param cfgFormula ConfigObject: New formula configuration. 新公式配置信息.
         */
        FormulaEngine.prototype.appendFormula = function(cfgFormula){
            var newFormula = this.createFormulaObject(cfgFormula);
            var tmp = this.add2List(newFormula);
            if (tmp) {
                this.doClean(true);
                this.initialize(true);
            } else {}
        }
        /**
         * PUBLIC: Update formula with specify expression.<BR>
         * 外部方法：更新公式, 用指定的公式字符串来更新公式对象, 引擎将进行重编译和重索引.
         * @param objFormula FormulaObject: Original formula object. 原公式对象（将被替换）.
         * @param cfgFormula ConfigObject: New formula configuration. 新公式配置信息.
         */
        FormulaEngine.prototype.updateFormula = function(objFormula, cfgFormula){
            var temp = { "id" : cfgFormula.id || objFormula.id,
                "type" : cfgFormula.type || objFormula.type, "desc" : cfgFormula.desc,
                "formula" : cfgFormula.formula, "target" : cfgFormula.target,
                "tips" : cfgFormula.tips };
            this.createFormulaObject(temp, objFormula);
            this.doClean(true);
            this.initialize(true);
        }
        /**
         * PUBLIC: Update formula with specify expression.<BR>
         * 外部方法：更新公式, 用指定的公式字符串来更新公式对象, 引擎将进行重编译和重索引.
         * @param objFormula FormulaObject: Original formula object. 原公式对象（将被替换）.
         * @return boolean.
         */
        FormulaEngine.prototype.deleteFormula = function(objFormula){
            if (objFormula) {
                if (this.getFormulaById(objFormula.id)) {
                    this.delete4List(objFormula);
                    this.doClean(true);
                    this.initialize(true);
                } else {
                    dhtmlx.message("公式引擎中找不到指定要删除的公式。", "error", 5000);
                }
            } else {
                dhtmlx.message("指定要删除公式对象为空。", "error", 5000);
            }
            return false;
        }
        /**
         * PUBLIC: Test formula for debuging. <BR>
         * 外部方法：测试公式，主要用于调试或编辑过程.
         * @param cfgFormula ConfigObject: New formula configuration. 新公式配置信息.
         * @returns Result after execution. 公式执行结果.
         * @see FormulaEngine.prototype.createFormulaObject()
         */
        FormulaEngine.prototype.testFormula = function(cfgFormula){
			this.jp.initialize(eval(this.basename));
            var objFormula = this.createFormulaObject(cfgFormula);
            if (this.resolveFormula(objFormula)) {
                var strAssResolved = objFormula.strAssResolved;
                var strExpResolved = objFormula.strExpResolved;
                var ret;
                if (objFormula.flagDynamicParam) {
                    // TODO: Currently only support one dynamic parameter.
                    if (strAssResolved) {
                        strAssResolved = strAssResolved.replace(/\[#\]/g, "[0]");
                    }
                    strExpResolved = strExpResolved.replace(/\[#\]/g, "[0]");
                } else if (objFormula.flagAggregation) {
                    var tmp = this.resolveExpressionFull(objFormula.strExpression);
                    strExpResolved = tmp.resolved;
                } else {
                    // Simple formula calculate
                }
                ret = this.execute(strAssResolved, strExpResolved);
                return ret;
            }
            throw objFormula.lastError;
        }
        /**
         * PUBLIC: Replace macro-expression for text. 外部方法：对字符串进行计算表达式宏替换操作.
         * 
         * <pre>
         * textSubstitution("你好：{{$..zzssyyybnsr_zb.sbbhead.nsrmc}}")
         *      => 你好：方欣科技有限公司
         * textSubstitution("本月数（当前值:{{$..zbGridlbVO[0].asysljsxse}}）必须小于累计数（当前值:{{$..zbGridlbVO[1].asysljsxse}}）") 
         *      => 本月数（当前值:888）必须小于累计数（当前值:123）
         * </pre>
         * 
         * @param text String: Text with macro-expression. 字符串：包含表达式宏的文本串.
         */
        FormulaEngine.prototype.textSubstitution = function(text){
            if ("string" !== typeof text || text.length <= 0) {
                return;
            }
            var regExpress = /\{\{([^}]*)\}\}/g;
            var ret = "";
            var lastPos = 0;
            do {
                // Searching
                var result = regExpress.exec(text);
                // console.log(result);
                if (null == result) {
                    ret += text.substr(lastPos, text.length - lastPos);
                    break;
                }
                ret += text.substr(lastPos, result.index - lastPos);
                // Calculation
                var cal = this.testFormula({ "type" : 02, "formula" : result[1] });
                // Replacement
                ret += cal;
                lastPos = regExpress.lastIndex;
            } while (regExpress.lastIndex < text.length);
            return ret;
        }
        /**
         * PUBLIC: Get formula object by formula's id. <BR>
         * 外部方法：根据ID查询公式对象.
         * @param formulaId String: Formula's id. 公式的ID（唯一标识符）.
         * @returns FormulaObject: Return undefined if not founded. 公式对象.
         */
        FormulaEngine.prototype.getFormulaById = function(formulaId){
            return this.idxId2Formulas[formulaId];
        }
        /**
         * PUBLIC: Get formula object by formula's assignment. <BR>
         * 外部方法：根据赋值部分查询公式对象.
         * @param strAssign String: Formula's assignment part. 公式的赋值部分（等号左侧的对象）.
         * @returns FormulaObject: Return undefined if not founded. 公式对象.
         */
        FormulaEngine.prototype.getFormulaByAssignment = function(strAssign, flagIncludeDynamic){
            if (strAssign.substr(0, 2) !== "$.") {
                strAssign = "$." + strAssign;
            }
            var objFormula = undefined;
            if (flagIncludeDynamic) {
                var dynAssign = (/\[\d+\]/.exec(strAssign)) ? // Check array index.
                strAssign.replace(/\[\d+\]/g, "[#]") // Genarate dynamic array index.
                : null; // No needs.
                objFormula = this.idxAssign2Formulas[strAssign]
                    || this.idxAssign2Formulas[dynAssign] || undefined;
            } else {
                objFormula = this.idxAssign2Formulas[strAssign];
            }
            return objFormula;
        }
        FormulaEngine.prototype.getFormulaIdByAssignment = function(strAssign, flagIncludeDynamic){
            var objFormula = this.getFormulaByAssignment(strAssign, flagIncludeDynamic);
            return (objFormula) ? objFormula.id : undefined;
        }
        /**
         * PUBLIC: Get formula object by formula's assignment. <BR>
         * 外部方法：临时性禁用公式（当次有效），主要用于纳税人手工修改单元格值.
         * @param strAssign String: Formula's assignment part. 公式的赋值部分（等号左侧的对象）.
         * @returns Boolean. true, 更改状态成功；false, 更改状态失败。
         */
        FormulaEngine.prototype.disableFormulaById = function(formulaId){
            //TODO: 如果纳税人暂存表单后冲田或者导入外部数据，还无法自动暂停缓存公式。
            //TODO: 还不支持动态参数公式
            var objFormula = this.idxId2Formulas[formulaId];
            if (objFormula && !objFormula.flagDisable) {
                objFormula.flagDisable = true;
                return true;
            }
            return false;
        }
        /**
         * PUBLIC: Get formula object by formula's assignment. <BR>
         * 外部方法：临时性禁用公式（当次有效），主要用于纳税人手工修改单元格值.
         * @param strAssign String: Formula's assignment part. 公式的赋值部分（等号左侧的对象）.
         * @returns Boolean. true, 更改状态成功；false, 更改状态失败。
         */
        FormulaEngine.prototype.enableFormulaById = function(formulaId){
            //TODO: 还不支持动态参数公式
            var objFormula = this.idxId2Formulas[formulaId];
            if (objFormula && objFormula.flagDisable) {
                objFormula.flagDisable = false;
                this.calculationPlanningOfList([ objFormula ], undefined, true);
                return true;
            }
            return false;
        }

        /**
         * PUBLIC: delete idxVariable object by jpath. <BR>
         * 外部方法：删除校验不通过记录(主要作用于用户删除存在校验不通过的动态行时，以及其他情况).
         * @param jpath.
         */
        FormulaEngine.prototype.deleteIdxVariableNoPass = function(jpath){
            var idxVariable2NoPassFull = this.idxVariable2NoPass;
            var idx = (/\[\d+\]/.exec(jpath))[0];
            var var2NoPass = this.idxVariable2NoPass[jpath];
            $.each(var2NoPass, function(id, FormulaObject){
                $.each(FormulaObject.lstVariables, function(id, lstVariable){
                    lstVariable = lstVariable.replace(/\[\#\]/g, idx);
                    if(idxVariable2NoPassFull[lstVariable]) {
                        delete idxVariable2NoPassFull[lstVariable];
                    }
                });
            });
            this.idxVariable2NoPass = idxVariable2NoPassFull;
        }

        FormulaEngine.prototype.getFormulasByVariables = function(jpaths){
            var rets = [], tmps = [];
            for (var i = 0; i < jpaths.length; i++) {
                tmps = tmps.concat(this.getFormulasByVariable(jpaths[i]));
            }
            // TODO: Low performance distinct
            for (var i = 0; i < tmps.length; i++) {
                var k = 0;
                if (this.rightSubstr(tmps[i].type, 1) === "1") {
                    for (; k < rets.length; k++) {
                        if (this.rightSubstr(rets[k].type, 1) !== "1") {
                            continue;
                        } else if (tmps[i] === rets[k]) {
                            break;
                        }
                    }
                } else {
                    k = rets.length + 1;
                }
                if (k >= rets.length) {
                    rets.push(tmps[i]);
                }
            }
            return rets;
        }
        /**
         * PUBLIC: Get formula object by formula's variable. <BR>
         * 外部方法：根据公式所包含变量（JSON's jpath）查询公式对象.
         * @param strAssign String: Formula's variable. 公式所包含变量（JSON's jpath）.
         * @returns FormulaObjects: Return undefined if not founded. 公式对象.
         */
        FormulaEngine.prototype.getFormulasByVariable = function(jpath){
            var rets = [];
            if (jpath.substr(0, 2) === "$.") {
                jpath = jpath.substr(2);
            }
            var dynJpath = (/\[\d+\]/.exec(jpath)) ? // Check array index.
            jpath.replace(/\[\d+\]/g, "[#]") // Genarate dynamic array index.
            : null; // No needs.
            if (this.idxVariable2Formula[jpath]) {
                rets = rets.concat(this.idxVariable2Formula[jpath]);
            }
            if (dynJpath && this.idxVariable2Formula[dynJpath]) {
                rets = rets.concat(this.idxVariable2Formula[dynJpath]);
            }
            var objFormula = this.getFormulaByAssignment(jpath, true);
            if (objFormula) {
                rets.push(objFormula);
            }
            return rets;
        }
        /**
         * PRIVATE: Clean all those various list and index.
         * @param flagDoNotClear boolean. True: clear all list and index; Flase: clear index and remain list.
         */
        FormulaEngine.prototype.doClean = function(flagDoNotClear){
            if (!flagDoNotClear) {
                this.lstAllFormulas = []; // All loaded formulas
                this.lstCalculateFormulas = []; // Calculate formulas about '01' or'11'
                this.lstInitialFormulas = []; // Initial formulas about '10' or '11'
                this.lstVerifyFormulas = []; // Verify formulas about '02'
                this.lstControlFormulas = [];
                this.lstCalculate2SubmitFormulas = [];// Calculate formulas about '21'
                this.idxId2Formulas = {};
                this.pointStart10 = 0;
                this.pointStart11 = 0;
            }
            this.idxVariable2NoPass = {};
            this.idxVariable2Control = {};
            this.idxAssign2Formulas = {};
            this.failedFormulas = [];
            this.idxVariable2Formula = {};
        }
        /**
         * PRIVATE: Append formula to all those various list, according to type. <BR>
         * 内部方法：将公式对象按照公式类型增加到各分类公式列表中, 便于后续索引使用.
         * @param objFormula FormulaObject. 公示对象.
         * @returns boolean, 公式类型是否能识别.
         */
        FormulaEngine.prototype.add2List = function(objFormula){
            switch (objFormula.type) {
                case '01': // Calculate formulas
                    this.lstCalculateFormulas.push(objFormula);
                    break;
                case '02': // Verify formulas
                case '12': // Verify & Initial formulas
                    this.lstVerifyFormulas.push(objFormula);
                    break;
                case '11': // Calculate & Initial formulas
                    this.lstCalculateFormulas.push(objFormula);
                    this.lstInitialFormulas.push(objFormula);
                    break;
                case '10': // Initial formulas
                    this.lstInitialFormulas.push(objFormula);
                    break;
                case '03':
                case '13':
                    this.lstControlFormulas.push(objFormula);
                    break;
                 case '21':
                    this.lstCalculate2SubmitFormulas.push(objFormula);
                    break;
                default:
                    console.log("FormulaEngine: Formula type not supported[" + objFormula.type + "]: "
                        + objFormula.strFormula);
                    return false;
            }
            if (objFormula.type === "10") {
                this.lstAllFormulas.splice(this.pointStart10++, 0, objFormula);
                this.pointStart11++;
            } else if (objFormula.type === "11") {
                this.lstAllFormulas.splice(this.pointStart11++, 0, objFormula);
            } else {
                this.lstAllFormulas.push(objFormula);
            }
            if (this.idxId2Formulas[objFormula.id]) {
                var err = "WARN: formulaId duplicated [" + objFormula.id + "], original: "
                    + this.idxId2Formulas[objFormula.id].strFormula + ", newer: "
                    + objFormula.strFormula;
                console.log(err);
                objFormula.lastError = err;
                objFormula.flagCompiled = false;
                return false;
            } else {
                this.idxId2Formulas[objFormula.id] = objFormula;
                return true;
            }
        }
        FormulaEngine.prototype.delete4List = function(objFormula){
            var pos;
            // Calculate formulas
            pos = $.inArray(objFormula, this.lstCalculateFmulas);
            if (pos >= 0) {
                this.lstCalculateFormulas.splice(pos, 1);
            }
            // Verify formulas
            pos = $.inArray(objFormula, this.lstVerifyFormulas);
            if (pos >= 0) {
                this.lstVerifyFormulas.splice(pos, 1);
            }
            // Initial formulas
            pos = $.inArray(objFormula, this.lstInitialFormulas);
            if (pos >= 0) {
                this.lstInitialFormulas.splice(pos, 1);
            }
            // Control formulas
            pos = $.inArray(objFormula, this.lstControlFormulas);
            if (pos >= 0) {
                this.lstControlFormulas.splice(pos, 1);
            }
            // Calculate2Submit formulas
            pos = $.inArray(objFormula,this.lstCalculate2SubmitFormulas);
            if(pos >= 0) {
                this.lstCalculate2SubmitFormulas.splice(pos,1);
            }
            // All list
            pos = $.inArray(objFormula, this.lstAllFormulas);
            if (pos >= 0) {
                this.lstAllFormulas.splice(pos, 1);
            }
            // Index of formulaId
            delete this.idxId2Formulas[objFormula.id];
            return true;
        }
        /**
         * PRIVATE: Apply all initial formulas, including calculate formula and verify formula.<BR>
         * 内部方法：执行所有初始化公式，包括计算公式和校验公式.
         */
        FormulaEngine.prototype.applyInitialFormulas = function(){
            // First: execute initial calculate formula. 先执行初始化计算公式.
            this.calculationPlanningOfList(this.lstInitialFormulas, undefined, true);
            // Second: execute initial control formula. 再执行初始化控制公式.
            var controls = this.lstControlFormulas;
            for (var i = 0; i < controls.length; i++) {
                var objFormula = controls[i];
                if ("1" == objFormula.type.substr(0, 1)) { // Checking initial sign.
                    objFormula.lastControl = this.execNoCaculateFormula(objFormula);
                    this.effectingControl(objFormula.lastControl, objFormula.lstTargetResolved);
                }
            }
            // Thrid: execute initial verify formula. 再执行初始化校验公式.
            var verifies = this.lstVerifyFormulas;
            for (var i = 0; i < verifies.length; i++) {
                if ("1" == verifies[i].type.substr(0, 1)) { // Checking initial sign.
                    //this.execNoCaculateFormula(verifies[i]);执行校验表达式没起到实际作用
                    this.procVerifyFormulas.push(verifies[i]);
                }
            }
            this.applyAssociatedFormulaVerify(null);
            this.procVerifyFormulas = [];
        }
        /**
         * PUBLIC: Apply JSON-data changed, will execute all relative formulas. <BR>
         * 外部方法：执行数据模型更新（针对特定JPath）, 将指定关联计算公式及校验公式.
         * @param jpath JPath of JSON-data, must be full-path. 数据模型的全路径JPath.
         * @param newValue, 更新的值.
         */
        FormulaEngine.prototype.apply = function(jpath, newValue){
            console.log("FormulaEngine.apply: " + jpath + " => " + newValue);
            var _ms_ = new Date().getTime();
            for (var _t_ = 0; _t_ < _TEST_TIMES_; _t_++) {
                // Initial:
                this.procVerifyFormulas = []; // Temporary variable for processing: involved verify-formulas.
                this.procContorlFormulas = []; // Temporary variable for processing: involved control-formulas.
                this.procVariableInStack = {}; // Temporary variable for processing: variable in calling-stack.
                var regBasket = this.regBasket;
                regBasket.lastIndex = 0;
                var tmpResult = regBasket.exec(jpath);
                var dynamicParams;
                if (tmpResult) {
                    // TODO: Currently only support one dynamic parameter.
                    dynamicParams = [ tmpResult[1] ];
                }
                // First: execute associated calculate.
                //this.formulaCalculate(jpath, dynamicParams);
                this.calculationPlanningOfJPath(jpath, dynamicParams);
                // Second: execute associated verify-formula.
                this.applyAssociatedFormulaVerify(dynamicParams);
                // Third: execute associated control-formula.
                this.applyAssociatedFormulaControl(dynamicParams);
                // Destroy:
                this.procVerifyFormulas = [];
                this.procContorlFormulas = [];
                this.procVariableInStack = {};
            }
            _ms_ = new Date().getTime() - _ms_;
            console.log("Calculate " + _TEST_TIMES_ + " in " + _ms_ + "ms, per: "
                + (_ms_ / _TEST_TIMES_));
        }

        /**
         * PUBLIC: Execute Calculate Formulas before submission. <BR>
         * 外部方法：提交前执行计算赋值公式.
         * @param .
         * @warning 目前只做了赋值操作，并未触发联动计算.
         */
        FormulaEngine.prototype.Calculate2SubmitFormulas = function() {
            //this.calculationPlanningOfList(this.lstCalculate2SubmitFormulas, undefined, false);
            for(var i = 0; i < this.lstCalculate2SubmitFormulas.length; i++) {
                this.execNoCaculateFormula(this.lstCalculate2SubmitFormulas[i]);
            }
        }

        /**
         * PRIVATE: Execute associated control formulas. Needs processing variable "this.procContorlFormulas". <BR>
         * 内部方法：执行所有关联校验公式, 依赖过程变量"this.procContorlFormulas", 结果会更新变量"this.idxVariable2Control".
         * 
         * <pre>
         * this.idxVariable2Control = { 
         *     jpath_1 : { 
         *         "readonly": true
         *     }, jpath_2 : { 
         *         "readwrite": true, 
         *         "bg-color=#FFDDDD": true, 
         *         "font-color=#008888": true 
         *     }
         * }
         * </pre>
         * 
         * @param dynamicParams Array: Dynamic parameters' value. 数组：动态参数值.
         * @warning Currently only support one dynamic parameter. 目前仅支持一个动态参数值.
         */
        FormulaEngine.prototype.applyAssociatedFormulaControl = function(dynamicParams){
            var controls = this.procContorlFormulas;
            if (controls) {
                for (var c = 0; c < controls.length; c++) {
                    var objFormula = controls[c];
                    objFormula.lastControl = this.execNoCaculateFormula(objFormula, dynamicParams);
                    this.effectingControl(objFormula.lastControl, objFormula.lstTargetResolved,
                        dynamicParams);
                }
            }
        }
        FormulaEngine.prototype.effectingControl = function(pass, targets, dynamicParams){
            for (var i = 0; i < targets.length; i++) {
                var target = targets[i];
                var name = target.variable;
                var control = target.control;
                if (name && control) {
                    if (dynamicParams) {
                        name = name.replace(/\[#\]/g, "[" + dynamicParams[0] + "]");
                    }
                    if (!this.idxVariable2Control[name]) {
                        this.idxVariable2Control[name] = {};
                    }
                    this.idxVariable2Control[name][control] = pass;
                }
            }
        }
        /**
         * PRIVATE: Execute associated verify formulas. Needs processing variable "this.procVerifyFormulas". <BR>
         * 内部方法：执行所有关联校验公式, 依赖过程变量"this.procVerifyFormulas", 结果会更新变量"this.idxVariable2NoPass".
         * 
         * <pre>
         * this.idxVariable2NoPass = { 
         *     jpath_1 : { 
         *         formulaId_1 : FormulaObject_1
         *     }, jpath_2 : { 
         *         formulaId_2 : FormulaObject_2, formulaId_3 : FormulaObject_3
         *     }
         * }
         * </pre>
         * 
         * @param dynamicParams Array: Dynamic parameters' value. 数组：动态参数值.
         * @warning Currently only support one dynamic parameter. 目前仅支持一个动态参数值.
         */
        FormulaEngine.prototype.applyAssociatedFormulaVerify = function(dynamicParams){
            var verifies = this.procVerifyFormulas;
            if (verifies) {
                for (var v = 0; v < verifies.length; v++) {
                    var objFormula = verifies[v];
                    var vars = [];
                    //判断是否添加了target属性，有则取target属性
                    if(objFormula.lstTargetResolved && objFormula.lstTargetResolved.length > 0){
                    	for(var i=0;i<objFormula.lstTargetResolved.length;i++){
                    		vars.push(objFormula.lstTargetResolved[i].variable)
                    	}
                    	
                    }else{
                    	//检验公式，默认提示公式中所有涉及的单元格（变量）
                    	vars = objFormula.lstVariables
                    }
                    var pass = this.execNoCaculateFormula(objFormula, dynamicParams);
                    objFormula.lastVerify = pass;
                    for (var i = 0; i < vars.length; i++) {
                        var name = vars[i];
                        if (dynamicParams) {
                            name = name.replace(/\[#\]/g, "[" + dynamicParams[0] + "]");
                        }
                        if (pass) {
                            // Check relative variable and remove it.
                            if (this.idxVariable2NoPass[name]) {
                                delete this.idxVariable2NoPass[name][objFormula.id];
                                if (!this.hasProperty(this.idxVariable2NoPass[name])) {
                                    delete this.idxVariable2NoPass[name];
                                }
                            }
                        } else {
                            // Record relative variable of not passed.
                            if (!this.idxVariable2NoPass[name]) {
                                this.idxVariable2NoPass[name] = {};
                            }
                            this.idxVariable2NoPass[name][objFormula.id] = objFormula;
                        }
                    }
                }
            }
        }
        /**
         * PRIVATE: Execute verify or control formula. <BR>
         * 内部方法：执行校验公式.
         * @param objFormula Formula: Verify or control formula object. 公式对象：校验公式.
         * @param dynamicParams Array: Dynamic parameters' value. 数组：动态参数值.
         * @returns Formula result, should be true or false. 校验结果, 应为布尔值.
         * @warning Currently only support one dynamic parameter. 目前仅支持一个动态参数值.
         */
        FormulaEngine.prototype.execNoCaculateFormula = function(objFormula, dynamicParams){
            if (objFormula.flagCompiled) {
                var ret;
                var strExpResolved = objFormula.strExpResolved
                if (objFormula.flagDynamicParam) {
                    // TODO: Currently only support one dynamic parameter.
                    strExpResolved = strExpResolved.replace(/\[#\]/g, "[" + dynamicParams[0] + "]");
                    ret = this.execute(null, strExpResolved);
                } else {
                    // Simple formula calculate
                    ret = this.execute(null, strExpResolved);
                }
                //console.log("Verify " + ret + "<= " + objFormula.strFormula + " " + objFormula.desc);
                return ret;
            }
        }
        /**
         * PRIVATE: Searching and execute calculate formulas referenced by JPath. Needs variable-to-formula reference
         * "this.idxVariable2Formula".<BR>
         * 内部方法：依赖反向索引"this.idxVariable2Formula"查找并执行与JPath有关的计算公式, 并记录受影响的校验公式.
         * @param jpath String: JsonPath. 字符串：路径表达式.
         * @param dynamicParams Array: Dynamic parameters' value. 数组：动态参数值.
         * @warning Currently only support one dynamic parameter. 目前仅支持一个动态参数值.
         */
        FormulaEngine.prototype.calculationPlanningOfJPath = function(nodepath, dynamicParams,
            flagInitial){
            var lstFormulaAndParams = this.getInvolvedFormulas(nodepath, dynamicParams);
            return this.calculationPlanning(lstFormulaAndParams, dynamicParams, flagInitial);
        }
        /**
         * @param lstFormulas 待处理公式队列：[FormulaObj, FormulaObj, ...]
         */
        FormulaEngine.prototype.calculationPlanningOfList = function(lstFormulas, dynamicParams,
            flagInitial){
            var lst = [];
            this.addingFormulaList(lst, lstFormulas, dynamicParams);
            this.calculationPlanning(lst, dynamicParams, flagInitial);
        }
        /**
         * @param lstFormulaAndParams 待处理公式队列：[[FormulaObj, params], [FormulaObj, params], ...]
         */
        FormulaEngine.prototype.calculationPlanning = function(lstFormulaAndParams, dynamicParams,
            flagInitial){
            //1、基于所有关联公式；
            var queue = lstFormulaAndParams; //待处理公式队列：[[FormulaObj, params], [FormulaObj, params], ...]
            var idxPlan = {} //已索引公式：{formulaId1:{obj:FormulaObj, ref:0, params:[]}, formulaId2:{}}
            var lstResult = [];//排序后公式列表；
            //2、对公式进行依次扫描，并将级联公式一并获取，同步进行引用计数；
            while (queue.length > 0) {
                var objFormulaAndParams = queue.shift();
                var objFormula = objFormulaAndParams[0];
                var formulaParams = objFormulaAndParams[1];
                if (!idxPlan[objFormula.id]) {
                    idxPlan[objFormula.id] = { "obj" : objFormula, "ref" : 1,
                        "params" : formulaParams };
                }
                if (objFormula.flagCompiled) {
                    var strNodepath = objFormula.strAssResolved
                    if (strNodepath) {
                        strNodepath = strNodepath.substr(2);
                        // 获取与当前赋值部分存在引用关系的公式
                        var lstRefFormulaAndParams = this.getInvolvedFormulas(strNodepath,
                            formulaParams);
                        // 对所引用公式进行引用值（ref）的增加运算
                        for (var i = 0; i < lstRefFormulaAndParams.length; i++) {
                            var objRef = lstRefFormulaAndParams[i][0];
                            if (objRef) {
                                if (!idxPlan[objRef.id]) {
                                    idxPlan[objRef.id] = { "obj" : objRef, "ref" : 1,
                                        "params" : lstRefFormulaAndParams[i][1] };
                                } else if (!lstRefFormulaAndParams[i][1]) { // 如果被引用公式需要做全下标计算（即下标参数为空）
                                    // 新关联引用出来的公式，存在非动态行公式需要全覆盖计算的情况，典型情况是：
                                    // =>  动态行的分配比例  = 动态行的金额  / 合计金额
                                    // 上述情况会因为合金金额发生变动而执行全覆盖计算，那么此时动态行的行标是有害的，需要被剔除。
                                    idxPlan[objRef.id].params = null;
                                }
                                // 注意到是引用了变量的公式才需要增加引用值（ref）
                                idxPlan[objRef.id].ref += idxPlan[objFormula.id].ref;
                            }
                        }
                        queue = queue.concat(lstRefFormulaAndParams);
                    }
                }
            }
            //3、根据引用计数进行升序排列；
            for ( var id in idxPlan) {
                lstResult.push(idxPlan[id]);
            }
            lstResult.sort(function(a, b){
                return a.ref - b.ref; // 降序排列
            });
            //4、按顺序进行公式计算
            return this.calculateAccordingPlan(lstResult, flagInitial);
        }
        /**
         * PRIVATE: Execute calculate formula cascaded.<BR>
         * 内部方法：执行公式，并作级联触发.
         * @param lstObjFormulas Array: Formula objects. 数组：公式对象. [{obj:FormulaObj, ref:0, params:[]}, {obj:FormulaObj,
         *            ref:0, params:null}, ...]
         * @param dynamicParams Array: Dynamic parameters' value. 数组：动态参数值.
         * @param flagInitial Boolean: Is initial calculate. 布尔：是否为初始化.
         * @returns Calculate successful, boolean. 计算是否成功, 布尔值.
         * @warning Currently only support one dynamic parameter. 目前仅支持一个动态参数值.
         */
        FormulaEngine.prototype.calculateAccordingPlan = function(lstPlanFormulas, flagInitial){
            var ret = true;
            for (var i = 0; i < lstPlanFormulas.length; i++) {
                var objFormulaPlan = lstPlanFormulas[i];
                var objFormula = objFormulaPlan.obj;
                if (objFormula.strAssResolved) {
                    this.procVariableInStack[objFormula.strAssResolved] = objFormula;
                }
                if (objFormula.flagCompiled) {
                    var strAssResolved = (objFormula.strAssResolved && objFormula.flagDynamicParam) ? this
                        .resolveExpression(objFormula.strAssignment).resolved
                        : objFormula.strAssResolved;
                    var strExpResolved = objFormula.strExpResolved;
                    switch (this.rightSubstr(objFormula.type, 1)) {
                    case "0": // 初始化公式
                        if (!flagInitial) {
                            // 非初始化情况，直接忽视
                            break;
                        }
                        if (objFormula.flagDynamicParam) {
                            // 初始化公式包含动态下标参数，需要按动态变量进行下标遍历
                            this.calculateDynamicTraversing(strAssResolved, strExpResolved,
                                objFormula);
                            break;
                        }
                        case "1": // 计算公式,需要排除提交环节公式
                        if("2" == (objFormula.type).substr(0,1)) break;
                        try {
                            if (objFormula.flagDynamicParam) { // 该公式存在动态下标参数，需要特殊处理
                                if (objFormulaPlan.params) {
                                    // 已经提供了动态参数，可直接执行
                                    this.execute(strAssResolved, strExpResolved,
                                        objFormulaPlan.params);
                                } else if (objFormula.strAssignment
                                    && objFormula.strAssignment.indexOf("[#]") > 0) {
                                    // 未提供动态参数，但是需要执行，只能进行遍历
                                    this.calculateDynamicTraversing(strAssResolved, strExpResolved,
                                        objFormula);
                                } else {
                                    // 其它情况则不能支持，很可能公式配置错误
                                    console
                                        .log("Calculate dynamic-param formula failed, param-value not founded: "
                                            + objFormula.strFormula);
                                    ret = false;
                                }
                            } else if (objFormula.flagAggregation) { // 该公式存在聚合操作要求
                                // 重新解析表达式（因为很可能自编译后增加了动态行，所以需要重新计算）
                                var tmp = this.resolveExpressionFull(objFormula.strExpression);
                                strExpResolved = tmp.resolved;
                                this.execute(strAssResolved, strExpResolved);
                            } else {
                                // Simple formula calculate
                                this.execute(strAssResolved, strExpResolved);
                            }
                        } catch (ex) {
                            console.log("ERROR[" + ex + "] while eval: " + strAssResolved + "="
                                + strExpResolved);
                            ret = false;
                        }
                        break;
                    case "2": // Founded verify-formula. 校验公式，记录下来后续执行。
                        this.procVerifyFormulas.push(objFormula);
                        break;
                    case "3": // Founded control-formula. 控制公式，记录下来后续执行。
                        this.procContorlFormulas.push(objFormula);
                        break;
                    default:
                        console.log("WARNING: Formula type not supported: ");
                    }
                }
            }
            return ret;
        }
        /**
         * 对动态下标的公式进行遍历计算，类似 $.vos[#].a = $.vos[#].b + $.others[1].s 时，枚举计算所有的 $.vos[#].b
         */
        FormulaEngine.prototype.calculateDynamicTraversing = function(strAssResolved,
            strExpResolved, objFormula){
            // 1、寻找公式中带动态参数的第一个变量
            var vars = objFormula.lstVariables;
            var dynamic = null;
            for (var v = 0; v < vars.length; v++) {
                if (vars[v].indexOf("[#]") > 0) {
                    dynamic = vars[v];
                    break;
                }
            }
            if (!dynamic) {
                console
                    .log("Calculate dynamic initial-formula failed, dynamic-param not founded in expression part: "
                        + objFormula.strFormula);
                return false;
            }
            // 2、计算动态参数变量的总数，以便进行遍历计算
            var objBase = eval(this.basename);
            dynamic = dynamic.replace(/\[#\]/g, "[*]");
            var tmp = jsonPath(objBase, dynamic);
            if (!tmp) {
                console
                    .log("Calculate dynamic initial-formula failed, jpath in expression part select failed: "
                        + dynamic + " @ " + objFormula.strFormula);
                return false;
            }
            // 3、执行遍历循环计算
            for (var k = 0; k < tmp.length; k++) {
                this.execute(strAssResolved, strExpResolved, [ k ]);
            }
            return true;
        }
        /**
         * 根据nodepath来搜索所有引用了该变量的公式，包括动态公式和聚合公式
         */
        FormulaEngine.prototype.getInvolvedFormulas = function(nodepath, dynamicParams){
            var regBasket = this.regBasket;
            var lstFormulas = [];
            // 1、Simple formula matching. 简单引用匹配（也即变量直接写在公式中）
            if (this.idxVariable2Formula[nodepath]) {
                // 这种情况下说明变量即便是动态行，其动态参数值也不适用于被引用公式，类似于：
                // $.others[1].s 变动引发公式： $.vos[#].a = $.vos[#].b + $.others[1].s
                this.addingFormulaList(lstFormulas, this.idxVariable2Formula[nodepath], null);
            }
            // 2、Trying dynamic formula. 尝试匹配动态参数公式，类似于：
            // $.vos[#].b 变动引发公式： $.vos[#].a = $.vos[#].b + 100
            var tmp = nodepath;
            if (dynamicParams) {
                // TODO: Currently only support one dynamic parameter.
                regBasket.lastIndex = 0;
                tmp = tmp.replace(regBasket, "[#]");
                if (this.idxVariable2Formula[tmp]) {
                    this.addingFormulaList(lstFormulas, this.idxVariable2Formula[tmp],
                        dynamicParams);
                }
            }
            // 3、Trying aggregation formula. 尝试匹配聚合参数公式，类似于：
            // $.vos[#].b 变动引发公式： $.some.thing.hj = SUM($.vos[*].b)
            if (tmp.indexOf("[#]") > 0) {
                regBasket.lastIndex = 0;
                tmp = tmp.replace(/\[#\]/g, "[*]");
                if (this.idxVariable2Formula[tmp]) {
                    this.addingFormulaList(lstFormulas, this.idxVariable2Formula[tmp], null);
                }
            }
            // 4、Exclude self. 消除自运算导致的循环引用，类似于： 
            // $.vos[0].a = SUM($.vos[*].a) - $.vos[0].a
            var jpath = "$." + nodepath;
            for (var i = 0; i < lstFormulas.length; i++) {
                if (jpath === lstFormulas[i].strAssResolved) {
                    lstFormulas.splice(i, 1);
                    i--;
                }
            }
            return lstFormulas;
        }
        FormulaEngine.prototype.addingFormulaList = function(lstBase, lstAdding, dynamicParams){
            for (var idx = 0; idx < lstAdding.length; idx++) {
                var objFormula = lstAdding[idx];
                if (!objFormula.flagDisable) {
                    lstBase.push([ objFormula, dynamicParams ]);
                }
            }
        }
        /**
         * PRIVATE: Execute formula in string, formula must be completely solved.<BR>
         * 内部方法：执行字符串，公式内容必须已完整解析且处理了动态变量.
         * @param strAssResolved String: Assignment part. 字符串：赋值部分（等号左侧）.
         * @param strExpResolved String: Expression part. 字符串：表达式部分（等号右侧）.
         * @returns Result after execution. 公式执行结果.
         */
        FormulaEngine.prototype.execute = function(strAssResolved, strExpResolved, dynamicParams){
            if (dynamicParams) {
                // TODO: Currently only support one dynamic parameter.
                if (strAssResolved) {
                    strAssResolved = strAssResolved.replace(/\[#\]/g, "[" + dynamicParams[0] + "]");
                    if (jsonPath(eval(this.basename), strAssResolved) === false) {
                        this.jpathNodeCreate(strAssResolved);
                    }
                }
                strExpResolved = strExpResolved.replace(/\[#\]/g, "[" + dynamicParams[0] + "]");
            }
            var strEval = strExpResolved;
            if (strAssResolved) {
                strEval = strAssResolved + "=" + strEval;
            }
            strEval = strEval.replace(/[$]/g, this.basename);
            //console.log("Executing: " + strEval);
            return eval(strEval);
        }
        /**
         * PRIVATE: Create formula object from string, did not compile. <BR>
         * 内部方法：根据公式字符串来创建公式对象，尚未进行公式编译（预处理）。
         * @param jsonFormula JSON-Object: Formula information from rule-base. JSON对象：从规则库导出的单条公式信息.
         * 
         * <pre>
         * jsonFormula = { 
         *     'id' : 0, // Formula ID from rule base. 规则库中所保存的公式ID.
         *     'type' : '00', // Formula type. 规则类型（01计算公式；02校验公式；10初始公式；11初始并计算公式；12初始校验公式）.
         *     'desc' : '', // Description from requirement. 本公式的需求说明.
         *     'formula' : '', // Original formula in string. 原始公式字符串.
         *     'tips' : ''// User tips for verify. 用户提示信息，主要用于校验公式.
         * }
         * </pre>
         * 
         * @returns FormulaObject.
         */
        FormulaEngine.prototype.createFormulaObject = function(jsonFormula, oldFormula){
            var objFormula = new FormulaObject();
            if (oldFormula) {
                objFormula = oldFormula;
                objFormula.lastError = undefined;
            }
            objFormula.strFormula = jsonFormula.formula;
            objFormula.id = jsonFormula.id;
            objFormula.type = jsonFormula.type;
            objFormula.desc = jsonFormula.desc;
            objFormula.tips = jsonFormula.tips;
            objFormula.target = jsonFormula.target;
            objFormula.flagAggregation = false;
            objFormula.flagDynamicParam = false;
            objFormula.flagCompiled = false;
            objFormula.lastError = null;
            objFormula.lastVerify = null;
            objFormula.lastControl = null;
            if (!objFormula.id) {
                objFormula.id = Math.random(); // Auto generate id for empty-id.
            }
            // Search equal mark to split the assignment's part.
            var strFormula = objFormula.strFormula;
            var posEqual = this.searchAssignMark(strFormula);
            if (objFormula.type == "01" || objFormula.type == "11" || objFormula.type == "10") {
                // Formula type: '01' calculate; '02' verify; '11' calculate & initialize; '10' initialize.
                if (posEqual <= 0 || strFormula.indexOf("=") != posEqual) {
                    if (posEqual > 0) {
                        console
                            .log("Formula assignment part too complex: " + objFormula.strFormula);
                    }
                    posEqual = -1;
                }
            }
            if (posEqual <= 0) {
                objFormula.strAssignment = null;
                objFormula.strExpression = strFormula;
            } else {
                if (objFormula.type == 2) {
                    console.log(objFormula.type + " ==> " + objFormula.strFormula);
                }
                objFormula.strAssignment = strFormula.substr(0, posEqual).trim();
                objFormula.strExpression = strFormula.substr(posEqual + 1).trim();
            }
            return objFormula;
        }
        /**
         * PRIVATE: Compile formula base on the JSON-Data.<BR>
         * 内部方法：基于JSON对象模型来进行公式编译（预处理）。
         */
        FormulaEngine.prototype.compileAll = function(){
            var _ms_ = new Date().getTime();
            if (this.lstAllFormulas.length < 1) {
                throw "Formula list is empty!";
            }
            if (typeof this.basename == "undefined" || this.basename == null) {
                throw "Did not setting JSON-Data basename."
            }
            // Resolve all shorted-jpath to full-jpath.
            // 将所有公式中的所有缩略路解析为全路径.
            for (var i = 0; i < this.lstAllFormulas.length; i++) {
                var objFormula = this.lstAllFormulas[i];
                // Resolve shorted-jpath
                if (this.resolveFormula(objFormula)) {
                    // Recognize variable of assignment's part.
                    if (objFormula.strAssResolved) {
                        this.recognizeAssignmentVariable(objFormula)
                    }
                    // Recognize all variable in formula.
                    this.recognizeExpressionVariable(objFormula);
                    //
                    objFormula.flagCompiled = (objFormula.lastError) ? false : true;
                } else {
                    this.failedFormulas.push(objFormula);
                }
            }
            // Index all variable.
            // 建立索引：公式引擎所有的公式中的变量
            for (var i = 0; i < this.lstAllFormulas.length; i++) {
                var objFormula = this.lstAllFormulas[i];
                // Duplicate assignment detection
                if ("1" == this.rightSubstr(objFormula.type, 1) && objFormula.strAssResolved) {
                    if (this.idxAssign2Formulas[objFormula.strAssResolved]) {
                        console.log("WARNING! Duplicate assignment detected of ["
                            + objFormula.strAssResolved + "]:\n--Exist: "
                            + this.idxAssign2Formulas[objFormula.strAssResolved].strFormula
                            + "\n--Newer: " + objFormula.strFormula);
                    } else {
                        this.idxAssign2Formulas[objFormula.strAssResolved] = objFormula;
                    }
                }
                // Build up the cascade reference
                if (objFormula.flagCompiled) {
                    for (var t = 0; t < objFormula.lstVariables.length; t++) {
                        var strVar = objFormula.lstVariables[t];
                        if (!this.idxVariable2Formula[strVar]) {
                            this.idxVariable2Formula[strVar] = [];
                        }
                        this.idxVariable2Formula[strVar].push(objFormula);
                    }
                }
            }
            // Decompose targets of control-formula.
            // 解析控制公式中的目标项.
            for (var i = 0; i < this.lstControlFormulas.length; i++) {
                var objFormula = this.lstControlFormulas[i];
                if (objFormula.flagCompiled) {
                	this.decomposeFormulaTargets(objFormula);
                }
            }
            
            // 解析检验公式中的目标项.
            for (var i = 0; i < this.lstVerifyFormulas.length; i++) {
                var objFormula = this.lstVerifyFormulas[i];
                if (objFormula.flagCompiled) {
                	this.decomposeFormulaTargets(objFormula);
                }
            }
            // Index all control-variable's target
            // 建立索引：控制公式的变量
            _ms_ = new Date().getTime() - _ms_;
            console.log("FormulaEngine: Formulas [" + this.lstAllFormulas.length + "] compiled, ["
                + this.failedFormulas.length + "] failed, spend " + _ms_ + "ms.");
        }
        FormulaEngine.prototype.decomposeFormulaTargets = function(objFormula){
            if ("3" == this.rightSubstr(objFormula.type, 1) || "2" == this.rightSubstr(objFormula.type, 1)) {
                var strTar = objFormula.target;
                if (strTar) {
                    var tars = strTar.split(";"); // Multi-target split by ';'
                    for (var i = 0; i < tars.length; i++) {
                        var tar = tars[i].trim();
                        if (tar.length > 0) {
                            var pair = tar.split(":");
                            var tarResolved = { "jpath" : pair[0], "control" : pair[1] };
                            var tmp = this.resolveExpression(pair[0]);
                            if (tmp && tmp.resolved) {
                                tarResolved.variable = tmp.resolved.substr(2);
                            } else {
                                console.log("WARN: Decompose formula targets failed: " + pair[0]);
                                objFormula.flagCompiled = false;
                            }
                            objFormula.lstTargetResolved.push(tarResolved);
                        }
                    }
                } else {
                    console.log("WARNING: Control formula's target is empty: "
                        + objFormula.strFormula);
                }
            }
        }
        FormulaEngine.prototype.recognizeAssignmentVariable = function(objFormula){
            var strAssResolved = objFormula.strAssResolved;
            var regJpath = /([$]([.\w]+|\[[.*\w#()]*\])+)/g;
            var regDynamic = /\[(#[A-Za-z]{0,1})\]/g;
            var tmpResult = regJpath.exec(strAssResolved);
            if (null == tmpResult) {
                throw "Assignment recognize failed: " + objFormula.strAssResolved + " in "
                    + objFormula;
            }
            if (regJpath.lastIndex >= strAssResolved.length) {
                if (regJpath.exec(strAssResolved) != null) {
                    throw "Assignment too complex: " + objFormula.strAssResolved + " in "
                        + objFormula;
                }
            }
            do {
                tmpResult = regDynamic.exec(strAssResolved);
                if (null == tmpResult) {
                    break;
                }
                objFormula.lstDynamicParams.push(tmpResult[1]);
            } while (regDynamic.lastIndex < strAssResolved.length);
            if (objFormula.lstDynamicParams.length > 0) {
                objFormula.flagDynamicParam = true;
            }
        }
        FormulaEngine.prototype.recognizeExpressionVariable = function(objFormula){
            var strExpResolved = objFormula.strExpResolved;
            var regJpath = /([$]([.\w]+|\[[.*\w#()]*\])+)/g;
            var tmpResult;
            do {
                tmpResult = regJpath.exec(strExpResolved);
                // console.log(strExpResolved + " :> " + tmpResult);
                if (null == tmpResult) {
                    break;
                }
                var strVariable = tmpResult[0].substr(2);
                if (strVariable.indexOf("[]") > 0) {
                    throw "Illegal empty basket: " + tmpResult[0] + " in " + strExpResolved;
                }
                if (strVariable.indexOf("[#]") > 0) {
                    objFormula.flagDynamicParam = true;
                }
                var flagAdd = false;
                if (objFormula.flagAggregation) {
                    // TODO: Should do some merge to reduce the number of variable.
                    strVariable = strVariable.replace(this.regBasket, "[*]");
                    if (strVariable.indexOf("[*]") >= 0) {
                        var t = 0
                        for (; t < objFormula.lstVariables.length; t++) {
                            if (objFormula.lstVariables[t] == strVariable) {
                                break;
                            }
                        }
                        if (t >= objFormula.lstVariables.length) {
                            flagAdd = true;
                        }
                    }else{
                    	//针对 a = b + SUM();需要将b也存入 lstVariables 中
                    	flagAdd = true;
                    }
                } else {
                    flagAdd = true;
                }
                if (flagAdd) {
                    objFormula.lstVariables.push(strVariable);
                }
            } while (regJpath.lastIndex < strExpResolved.length);
        }
        FormulaEngine.prototype.jpathNodeCreate = function(strJpath){
            if (strJpath.substr(0, 2) !== "$.") {
                console.log("JPath illegal while trying jpathNodeCreate, should start with '$.' :"
                    + strJpath);
                return;
            }
            var objBase = eval(this.basename);
            var pos = strJpath.lastIndexOf(".");
            var posShorted = strJpath.lastIndexOf("..");
            posShorted = (posShorted < 0) ? (0) : (posShorted + 1);
            while (pos > posShorted) {
                var partial = strJpath.substr(0, pos);
                var obj = (partial === "$") ? [ objBase ] : jsonPath(objBase, partial);
                if (obj !== false) {
                    if (obj.length === 1) {
                        obj = obj[0];
                        if ("object" === typeof obj) {
                            var flag = this.createSubPath(obj, strJpath.substr(pos + 1));
                            if (flag) {
                                obj = jsonPath(objBase, strJpath, { resultType : "PATH" });
                                if (obj && obj.length === 1) {
                                    return obj[0].replace(/\[\'/g, ".").replace(/\'\]/g, "");
                                }
                            }
                            console.log("Failed while trying createSubPath: " + flag + ", "
                                + obj.length);
                        } else {
                            console.log("Failed while trying jpathNodeCreate, found parent '"
                                + partial + "' is not object: " + typeof obj);
                            return;
                        }
                    } else {
                        console.log("Failed while trying jpathNodeCreate, found parent '" + partial
                            + "' return multi-result: " + obj.length);
                        return;
                    }
                }
                pos = strJpath.lastIndexOf(".", pos - 1);
            }
        }
        FormulaEngine.prototype.createSubPath = function(objBase, subPath){
            try {
                var nodes = subPath.split(".");
                var base = objBase;
                var i = 0;
                do {
                    var name = nodes[i];
                    var pos = name.indexOf("[");
                    var sub = null;
                    if (pos > 0) {
                        // TODO: Can't support more than one [], like [1][2]
                        // or ['a']['b']
                        sub = name.substr(pos + 1, name.indexOf("]") - pos - 1);
                        name = name.substr(0, pos);
                    }
                    if (name.length == 0) {
                        return false;
                    }
                    if (typeof base[name] == "undefined" || base[name] == null) {
                        if (sub) {
                            base[name] = [];
                        } else {
                            base[name] = {};
                        }
                    }
                    if (typeof base != "object") {
                        console.log("Failed while trying create subpath [" + subPath + "]: "
                            + nodes[i - 1] + "is not a object.");
                    }
                    base = base[name];
                    if (sub) {
                        base[sub] = {};
                        base = base[sub];
                    }
                } while (++i < nodes.length);
                return true;
            } catch (ex) {
                // Create node failed.
                console.log("Failed while trying create subpath [" + subPath + "]: " + ex);
                return false;
            }
        }
        /**
         * 对公式中所包含的各jpath进行解析，主要是将其从短路径形式解析为全路径形式。
         */
        FormulaEngine.prototype.resolveFormula = function(objFormula){
            var tmp;
            // Resolve expression part, right of equal-mark
            try {
                tmp = this.resolveExpression(objFormula.strExpression);
                objFormula.strExpResolved = tmp.resolved;
                objFormula.flagAggregation = tmp.flagAggregation;
                objFormula.flagDynamicParam = tmp.flagDynamicParam;
            } catch (ex) {
                objFormula.lastError = ex;
                console.log(ex.toString());
                return false;
            }
            // Resolve assignment part, left of equal-mark
            try {
                if (objFormula.strAssignment) {
                    tmp = this.resolveExpression(objFormula.strAssignment);
                    objFormula.strAssResolved = tmp.resolved;
                }
            } catch (ex) {
                // Try create assignment node
                var strAss = objFormula.strAssignment;
                if (strAss.indexOf("[#]") > 0) {
                    strAss = strAss.replace(/\[#\]/g, "[0]");
                }
                var fullpath = this.jpathNodeCreate(strAss);
                if (fullpath) {
                    objFormula.strAssResolved = fullpath;
                } else {
                    // Create node failed.
                    console.log("Failed while trying create assignment's json-node  [" + strAss
                        + "]: " + ex);
                    objFormula.lastError = ex;
                    return false;
                }
            }
            return true;
        }
        /**
         * 对字符串表达式中所包含的各jpath进行解析，主要是将其从短路径形式解析为全路径形式。
         */
        FormulaEngine.prototype.resolveExpression = function(strExp){
            var lastPos = 0;
            var strFast = "";
            var flagAggregation = false;
            var regFastJpath = /([$]([.\w]+|\[([*#]|[\d]+)\])+)/g;
            do {
                var fastResult = regFastJpath.exec(strExp);
                // console.log(result);
                if (null == fastResult) {
                    strFast += strExp.substr(lastPos, strExp.length - lastPos);
                    break;
                }
                strFast += strExp.substr(lastPos, fastResult.index - lastPos);
                var fastJpaths = this.jp.paths(fastResult[0]);
                if (!fastJpaths) {
                    throw "Resolve expression failed: JsonPath [" + fastResult[0] + "] in ["
                        + strExp + "] select empty, can't resolve the full-path."
                } else if (fastJpaths.length > 1) {
                    //confusingDetecte
                    this.confusingDetecte(fastResult[0], strExp);
                }
                for (var i = 0; i < fastJpaths.length; i++) {
                    fastJpaths[i] = fastJpaths[i].replace(/\[([a-zA-Z_][\w]*)\]/g, ".$1");
                }
                if (fastJpaths.length > 1) {
                    strFast += "[" + fastJpaths + "]";
                } else {
                    strFast += fastJpaths[0];
                }
                lastPos = regFastJpath.lastIndex;
            } while (regFastJpath.lastIndex < strExp.length);
            if (strExp.indexOf("[*]") >= 0) {
                flagAggregation = true;
            }
            //return { 'resolved' : strRet, 'flagAggregation' : flagAggregation, 'flagDynamicParam' : (strExp.indexOf("[#]") > 0) };
            return { 'resolved' : strFast, 'flagAggregation' : flagAggregation,
                'flagDynamicParam' : (strExp.indexOf("[#]") > 0) };
        }
        /**
         * 对字符串表达式中所包含的各jpath进行解析，主要是将其从短路径形式解析为全路径形式。
         */
        FormulaEngine.prototype.resolveExpressionFull = function(strExp){
            var lastPos = 0;
            var strRet = "";
            var flagAggregation = false;
            var regJpath = /([$]([.\w]+|\[([*]|[\d]+)\])+)/g;
            do {
                var result = regJpath.exec(strExp);
                // console.log(result);
                if (null == result) {
                    strRet += strExp.substr(lastPos, strExp.length - lastPos);
                    break;
                }
                strRet += strExp.substr(lastPos, result.index - lastPos);
                var arrJpaths = jsonPath(eval(this.basename), result[0], { resultType : "PATH" });
                if (!arrJpaths) {
                    throw "Resolve expression failed: JsonPath [" + result[0] + "] in [" + strExp
                        + "] select empty, can't resolve the full-path."
                } else if (arrJpaths.length > 1) {
                    //confusingDetecte
                    this.confusingDetecte(result[0], strExp);
                }
                for (var i = 0; i < arrJpaths.length; i++) {
                    arrJpaths[i] = arrJpaths[i].replace(/\[\'/g, ".").replace(/\'\]/g, "");
                }
                if (arrJpaths.length > 1) {
                    strRet += "[" + arrJpaths + "]";
                } else {
                    strRet += arrJpaths[0];
                }
                lastPos = regJpath.lastIndex;
            } while (regJpath.lastIndex < strExp.length);
            if (strExp.indexOf("[*]") >= 0) {
                flagAggregation = true;
            }
            return { 'resolved' : strRet, 'flagAggregation' : flagAggregation,
                'flagDynamicParam' : (strExp.indexOf("[#]") > 0) };
        }
        FormulaEngine.prototype.confusingDetecte = function(jpath, strExp){
            var regArray = /\[[#$\d]*\]/g;
            var posMulti = jpath.indexOf("..");
            if (posMulti >= 0) {
                posMulti += 2;
                var posDot = jpath.indexOf(".", posMulti);
                var posBracket = jpath.indexOf("[", posMulti);
                if (posDot <= 0) {
                    posMulti = posBracket;
                } else if (posBracket <= 0) {
                    posMulti = posDot;
                } else {
                    posMulti = this.min(posDot, posBracket);
                }
                if (posMulti > 0) {
                    var preJpath = jpath.substr(0, posMulti)
                    var arrJpaths = jsonPath(eval(this.basename), preJpath, { resultType : "PATH" });
                    if (arrJpaths.length > 1) {
                        var base = arrJpaths[0];
                        for (var i = 1; i < arrJpaths.length; i++) {
                            if (base != arrJpaths[i]) {
                                console.log("WARN JsonPath confusing detected: JsonPath [" + jpath
                                    + "] in [" + strExp + "] has multi paths");
                                for (var k = 0; k < arrJpaths.length; k++) {
                                    console.log("--" + k + ": "
                                        + arrJpaths[k].replace(/\[\'/g, ".").replace(/\'\]/g, ""));
                                }
                                throw "JsonPath confusing detected! JsonPath [" + jpath + "] in ["
                                    + strExp + "] has multi paths, can't resolve the full-path.";
                            }
                        }
                    }
                }
            }
        }
        /**
         * 
         */
        FormulaEngine.prototype.setValue = function(varName, newValue){
            var str = this.basename + "." + varName + "=" + newValue;
            eval(str);
        };
        FormulaEngine.prototype.min = function(){
            if (arguments.length > 0) {
                var ps = arguments;
                if (ps.length > 0) {
                    var min = ps[0];
                    for (var i = 1; i < ps.length; i++) {
                        min = (min < ps[i]) ? (min) : (ps[i]);
                    }
                    return min;
                }
            }
        };
        FormulaEngine.prototype.hasProperty = ((Object.getOwnPropertyNames && Object
            .getOwnPropertyNames(FormulaEngine).length) ? function(obj){
            return Object.getOwnPropertyNames(obj).length > 0;
        } : function(obj){
            for ( var i in obj)
                if (obj.hasOwnProperty(i)) {
                    return true;
                }
            return false;
        });
        FormulaEngine.prototype.countProperty = ((Object.getOwnPropertyNames && Object
            .getOwnPropertyNames(FormulaEngine).length) ? function(obj){
            return Object.getOwnPropertyNames(obj).length;
        } : function(obj){
            var count = 0;
            for ( var i in obj)
                if (obj.hasOwnProperty(i)) {
                    count++;
                }
            return count;
        });
        FormulaEngine.prototype.rightSubstr = function(str, num){
            if (str) {
                var pos = str.length - num;
                if (pos < 0) {
                    pos = 0;
                }
                return str.substr(pos);
            }
        }
        FormulaEngine.prototype.searchAssignMark = function(exp){
            var posEqual = exp.search(this.regAssignMark);
            if (posEqual > 0 && exp.charAt(posEqual) !== "=") posEqual++;
            return posEqual;
        }
        // For not to do initialization twice.
        FormulaEngine._inited = true;
    }
    /**
     * Internet Explorer 8 Compatible
     */
    if (typeof String.prototype.trim !== 'function') {
        String.prototype.trim = function(){
            return this.replace(/^\s+|\s+$/g, '');
        };
    }
    if (typeof Array.prototype.indexOf !== 'function') {
        Array.prototype.indexOf = function(obj, start){
            for (var i = (start || 0), j = this.length; i < j; i++) {
                if (this[i] === obj) {
                    return i;
                }
            }
            return -1;
        }
    }
}