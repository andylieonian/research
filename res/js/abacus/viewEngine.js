// var viewApp;
var viewEngine;
function ViewEngine(){
    /**
     * Constant. 常量定义.
     */
    ViewEngine.prototype.VIEW_APP_NAME = "viewApp";
    ViewEngine.prototype.VIEW_CTRL_ID = "viewCtrlId";
    ViewEngine.prototype.SCOPE = '';
    this.viewApp; // 保存 angular.module(strViewApp, []);
    if (typeof ViewEngine.prototype._inited == "undefined") {
        var viewEngine = this;
        ViewEngine.prototype.prepareEnvironment = function(viewApp, strViewApp){
            //引入外部指令
            ngDirectives(document, viewApp);
            //定义Control
            viewApp.run(function($rootScope, $http, $location){});
            viewApp.controller('viewCtrl', function($rootScope, $scope, $http, $location,
                asyncService){
                //debugger;
                $scope.formData = parent.formData;
                $scope.CT = parent.formCT;
                ViewEngine.SCOPE = $scope;
                /*
                 * $scope.count = 0; $scope.$watch("opts", function ($document) { $scope.count++; }, true);
                 */
            });
            viewApp.factory('asyncService', [ '$http', function($http){
                /*
                 * var doRequest = function(url) { return $http({ method: 'POST',//'JSONP' url: url }); }; return {
                 * opts: function(url) { return doRequest(url);} };
                 */
                return { verify : function(el){
                    return viewEngine.tipsForVerify(el);
                } };
            } ]);
            // 执行模块装载
            this.manuaANgInit(angular, strViewApp);
        }
        ViewEngine.prototype.initialize = function(strViewApp){
            if ("undefined" == typeof angular || "undefined" == typeof ngDirectives) {
                console.log("Waiting angular and directive...");
                setTimeout("viewEngine.initialize('" + strViewApp + "')", 500);
            } else {
                if (!parent.flagDataLoaded) {
                    console.log("Waiting form data loading...");
                    setTimeout("viewEngine.initialize('" + strViewApp + "')", 500);
                } else {
                    viewApp = angular.module(strViewApp, []);
                    var ua = navigator.userAgent;
                    if (ua && ua.indexOf("MSIE 7") >= 0) {
                        // Completely disable SCE to support IE7.
                        viewApp.config(function($sceProvider){
                            console.log("启动IE7兼容性支持：" + ua);
                            $sceProvider.enabled(false);
                        });
                    }
                    this.prepareEnvironment(viewApp, strViewApp);
                }
            }
        }
        /**
         * 手工加载angular 页面加载完成后,再加载模块 以确保angular加载时数据模型以及dom已经完整存在
         */
        ViewEngine.prototype.manuaANgInit = function(angular, strViewApp){
            angular.bootstrap(document.body, [ strViewApp ]);
        }
        ViewEngine.prototype.bindEventsForElements = function(scope, el){
            $(el).find("input").each(
                function(i){
                    if ($(this).attr("ng-model")) {
                        var _nm = $(this).attr("ng-model");
                        var _ngRepeatInit = $(el).attr('ng-repeat-init');
                        //带下标的ng-model需要去掉下标部分--存的时候没有存下标
                        var _nmFirstNode = _nm.substr(0, _nm.indexOf("\."));
                        var _nmLowerHalfPath = _nm;
                        var _nfFirstNodeNoIdx = _nmFirstNode;
                        //为了兼容不配置到下标节点，增加判断条件为以‘.’分割的第一个节点为依据，后面的不处理，如bqjxsemxbGrid.bqjxsemxbGridlbVO[0].fs
                        if (_nmFirstNode.indexOf('\[') > 0) {
                            _nfFirstNodeNoIdx = _nmFirstNode.split('[')[0];
                        }
                        _nmLowerHalfPath = _nmLowerHalfPath.replace(_nfFirstNodeNoIdx, '');
                        var _jprefix = scope['_jprefix_' + _nfFirstNodeNoIdx];
                        if (_ngRepeatInit) {
                            _jprefix = scope['_jprefix_' + _ngRepeatInit];
                            _nmLowerHalfPath = _nm.substr(_nm.indexOf("\.") + 1);
                            $(this).attr("jpath",
                                _jprefix + "[" + scope.$index + "]." + _nmLowerHalfPath);
                        } else {
                            $(this).attr("jpath", _jprefix + _nmLowerHalfPath);
                        }
                        //注册事件
                        $(this).on({ "change" : function(event){
                            if($(this).attr('type') == "radio") {return;}
                            var _jpath = $(this).attr("jpath");
                            // 1、尝试disable该单元格的结果公式--需求更改，去掉失效
/*                            var formulaId = parent.formulaEngine.getFormulaIdByAssignment(_jpath);
                            if (formulaId) {
                                // 准备右上角三角提示（绿色）
                                var spanRedDelta = $(this).parent().find("span.rtDelta");
                                if ($(this).parent().find("span.rtDelta").length <= 0) {
                                    $(this).parent().prepend($("<span class='rtDelta'></span>"));
                                    spanRedDelta = $(this).parent().find("span.rtDelta");
                                }
                               //TODO: 如果纳税人暂存表单后冲田或者导入外部数据，还无法自动暂停缓存公式。
                                if (this.value === "") {
                                    if (parent.formulaEngine.enableFormulaById(formulaId)) {
                                        // 祛除样式（红色三角形）
                                        $(this).parent().removeClass("manual")
                                        spanRedDelta.hide();
                                    }
                                } else {
                                    if (parent.formulaEngine.disableFormulaById(formulaId)) {
                                        // 设置样式（红色三角形）
                                        $(this).parent().addClass("manual")
                                        spanRedDelta.show();
                                    }
                                }
                            }*/
                            // 2、执行关联公式计算
                            parent.formulaEngine.apply(_jpath, this.value);
                            // 3、刷新校验结果和控制结果
                            //modify by lizhengtao 20160616 发现光校验$scope 下的$element还不够，
                            //比如下面单元格填写值涉及到上面单元格改变，此时需要连上面单元格一起校验
                            viewEngine.tipsForVerify(document.body);//el 
                            // 4、刷新angular视图
                            viewEngine.formApply($('#viewCtrlId'));
                        }, "focus" : function(event){
                            if ($(this).parent().hasClass("manual")){
                                if (this._msgbox_manual_) {
                                        return;
                                }
                                this._msgbox_manual_ = dhtmlx.message("\u3000\u3000您已手动修改过本格数据，本格自动计算已停用。如您需要恢复本格的自动计算，请清空（删除）本格数据。", "" +
                                		"info", 10000);
                            }
                        }, "blur" : function(event){
                            if (this._msgbox_manual_) {
                                dhtmlx.message.hide(this._msgbox_manual_);
                                this._msgbox_manual_ = undefined;
                            }
                        }, "dblclick" : function(event){
                            if (true == parent.flagFormDebuging) {
                                if ("undefined" != typeof parent.formDebuging) {
                                    parent.formDebuging.dblclickInputUI(this, event);
                                }
                            }
                        }, "click" : function(event){
                            if (true == parent.flagFormDebuging) {
                                if ("undefined" != typeof parent.formDebuging) {
                                    if (event.ctrlKey) {
                                        parent.formDebuging.ctrlClickInputUI(this, event);
                                    }
                                }
                            }
                            if($(this).attr('type') == "radio") {
                                var _jpath = $(this).attr("jpath");
                                // 1、尝试disable该单元格的结果公式
                                // 2、执行关联公式计算
                                parent.formulaEngine.apply(_jpath, this.value);
                                // 3、刷新校验结果和控制结果
                                //modify by lizhengtao 20160616 发现光校验$scope 下的$element还不够，
                                //比如下面单元格填写值涉及到上面单元格改变，此时需要连上面单元格一起校验
                                viewEngine.tipsForVerify(document.body);//el
                                // 4、刷新angular视图
                                viewEngine.formApply($('#viewCtrlId'));
                            }
                        }, "mouseover" : function(event){
                            if (this.title) {
                                if (this._msgbox_title_) {
                                    var ti = new Date().getTime();
                                    if (ti - this._msgbox_title_time_ > 500) {
                                        dhtmlx.message.hide(this._msgbox_title_);
                                        this._msgbox_title_ = undefined;
                                    } else {
                                        return;
                                    }
                                }
                                this._msgbox_title_ = dhtmlx.message(this.title, "error", -1);
                                this._msgbox_title_time_ = new Date().getTime();
                            }
                        }, "mouseout" : function(event){
                            if (this._msgbox_title_) {
                                dhtmlx.message.hide(this._msgbox_title_);
                                this._msgbox_title_ = undefined;
                                this._msgbox_title_time_ = undefined;
                            }
                        } });
                    }
                });
            $(el).find("select").each(
                function(i){
                    if ($(this).attr("ng-model")) {
                        var _nm = $(this).attr("ng-model");
                        var _ngRepeatInit = $(el).attr('ng-repeat-init');
                        //带下标的ng-model需要去掉下标部分--存的时候没有存下标
                        var _nmFirstNode = _nm.substr(0, _nm.indexOf("\."));
                        var _nmLowerHalfPath = _nm;
                        var _nfFirstNodeNoIdx = _nmFirstNode;
                        //为了兼容不配置到下标节点，增加判断条件为以‘.’分割的第一个节点为依据，后面的不处理，如bqjxsemxbGrid.bqjxsemxbGridlbVO[0].fs
                        if (_nmFirstNode.indexOf('\[') > 0) {
                            _nfFirstNodeNoIdx = _nmFirstNode.split('[')[0];
                        }
                        _nmLowerHalfPath = _nmLowerHalfPath.replace(_nfFirstNodeNoIdx, '');
                        var _jprefix = scope['_jprefix_' + _nfFirstNodeNoIdx];
                        if (_ngRepeatInit) {
                            _jprefix = scope['_jprefix_' + _ngRepeatInit];
                            _nmLowerHalfPath = _nm.substr(_nm.indexOf("\.") + 1);
                            $(this).attr("jpath",
                                _jprefix + "[" + scope.$index + "]." + _nmLowerHalfPath);
                        } else {
                            $(this).attr("jpath", _jprefix + _nmLowerHalfPath);
                        }
                        //注册事件
                        $(this).on({ "change" : function(event){
                            var _jpath = $(this).attr("jpath");
                            // 2、执行关联公式计算
                            parent.formulaEngine.apply(_jpath, this.value);
                            // 3、刷新校验结果和控制结果
                            viewEngine.tipsForVerify(document.body);
                            // 4、刷新angular视图
                            viewEngine.formApply($('#viewCtrlId'));
                        }, "dblclick" : function(event){
                            if (true == parent.flagFormDebuging) {
                                if ("undefined" != typeof parent.formDebuging) {
                                    parent.formDebuging.dblclickInputUI(this, event);
                                }
                            }
                        }, "click" : function(event){
                            if (true == parent.flagFormDebuging) {
                                if ("undefined" != typeof parent.formDebuging) {
                                    if (event.ctrlKey) {
                                        parent.formDebuging.ctrlClickInputUI(this, event);
                                    }
                                }
                            }
                        }, "mouseover" : function(event){
                            if (this.title) {
                                if (this._msgbox_title_) {
                                    var ti = new Date().getTime();
                                    if (ti - this._msgbox_time_ > 500) {
                                        dhtmlx.message.hide(this._msgbox_title_);
                                        this._msgbox_title_ = undefined;
                                    } else {
                                        return;
                                    }
                                }
                                this._msgbox_title_ = dhtmlx.message(this.title, "error", -1);
                                this._msgbox_time_ = new Date().getTime();
                            }
                        }, "mouseout" : function(event){
                            if (this._msgbox_title_) {
                                dhtmlx.message.hide(this._msgbox_title_);
                                this._msgbox_title_ = undefined;
                                this._msgbox_time_ = undefined;
                            }
                        }
                      });
                    }
                });
        }
        /**
         * 检查校验不通过单元格，并提示
         * @param el
         */
        ViewEngine.prototype.tipsForVerify = function(el){
            var idxVariable2NoPass = parent.formulaEngine.idxVariable2NoPass;
            var idxVariable2Control = parent.formulaEngine.idxVariable2Control;
            var viewEngine = this;
            $(el).find("input").each(function(i){
                if ($(this).attr("ng-model")) {
                    var _obj = $(this);
                    var _nm = $(this).attr("ng-model");
                    var _jpath = $(this).attr("jpath");
                    // Adding tips according to not passed verify. 
                    var var2NoPass = idxVariable2NoPass[_jpath];
                    var _tips = '';
                    if (undefined == var2NoPass) {
                        _obj.removeAttr('title');
                        _obj.removeClass("yellow");
                        _obj.parent().removeClass("relative");
                    } else {
                        $.each(var2NoPass, function(id, FormulaObject){
                            _tips += FormulaObject.tips + '<br/>';
                        });
                        _obj.attr('title', parent.formulaEngine.textSubstitution(_tips));
                        //layer.tips(_tips, _obj);
                        _obj.addClass("yellow");
                        _obj.parent().addClass("relative");
                    }
                    // Update UI according to calculate result of control's rule.
                    var controls = idxVariable2Control[_jpath];
                    if (controls) {
                        viewEngine.updateUIControl(this, controls);
                    }
                }
            });
            $(el).find("select").each(function(i){
                if ($(this).attr("ng-model")) {
                    var _obj = $(this);
                    var _nm = $(this).attr("ng-model");
                    var _jpath = $(this).attr("jpath");
                    // Adding tips according to not passed verify. 
                    var var2NoPass = idxVariable2NoPass[_jpath];
                    var _tips = '';
                    if (undefined == var2NoPass) {
                        _obj.removeAttr('title');
                        _obj.removeClass("yellow");
                        _obj.parent().removeClass("relative");
                    } else {
                        $.each(var2NoPass, function(id, FormulaObject){
                            _tips += FormulaObject.tips + '\n';
                        });
                        _obj.attr('title', parent.formulaEngine.textSubstitution(_tips));
                        //layer.tips(_tips, _obj);
                        _obj.addClass("yellow");
                        _obj.parent().addClass("relative");
                    }
                    // Update UI according to calculate result of control's rule.
                    var controls = idxVariable2Control[_jpath];
                    if (controls) {
                        viewEngine.updateUIControl(this, controls);
                    }
                }
            });
        }
        ViewEngine.prototype.updateUIControl = function(domElem, controls){
            var jqElem = $(domElem);
            for ( var ctl in controls) {
                var flag = controls[ctl];
                if (ctl === "readonly") {
                    if (flag) {
                        if (typeof domElem["$OLD_RW$"] == "undefined") {
                            domElem["$OLD_RW$"] = jqElem.attr("readonly") || false;
                        }
                        jqElem.attr("readonly", "readonly");
                    } else {
                        if (!domElem["$OLD_RW$"]) {
                            jqElem.removeAttr("readonly");
                        }
                    }
                } else if (ctl === "readwrite") {
                    if (flag) {
                        if (typeof domElem["$OLD_RW$"] == "undefined") {
                            domElem["$OLD_RW$"] = jqElem.attr("readonly") || false;
                        }
                        jqElem.removeAttr("readonly");
                    } else {
                        if (domElem["$OLD_RW$"]) {
                            jqElem.attr("readonly", "readonly");
                        }
                    }
                } else if(ctl === "disabled") {
                    if (flag) {
                        if (typeof domElem["$OLD_RW$"] == "undefined") {
                            domElem["$OLD_RW$"] = jqElem.attr("disabled") || false;
                        }
                        jqElem.attr("disabled", "disabled");
                    } else {
                        if (!domElem["$OLD_RW$"]) {
                            jqElem.removeAttr("disabled");
                        }
                    }
                } else {
                    var tmp = ctl.split("=");
                    if (tmp.length > 1) {
                        if (flag) {
                            if (typeof domElem["$OLD_CSS$" + tmp[0]] == "undefined") {
                                domElem["$OLD_CSS$" + tmp[0]] = jqElem.css(tmp[0]) || false;
                            }
                            jqElem.css(tmp[0], tmp[1]);
                        } else {
                            var oldcss = domElem["$OLD_CSS$" + tmp[0]];
                            if (oldcss) {
                                jqElem.css(tmp[0], oldcss);
                            } else {
                                jqElem.css(tmp[0], "");
                            }
                        }
                    }
                }
            }
        }
        /**
         * 刷新angular模型 外部修改angular模型后，刷新angular视图 el:element要刷新的document元素 _attr:更新的scope属性 _data:更新的属性值 在没有scope的情况下使用
         * exp:$scope.apply()旨在angular框架之外传播模型变化
         */
        ViewEngine.prototype.formApply = function(_el, _attr, _datas){
            var scope = angular.element(_el).scope();
            if (null != _attr && null != _datas) {
                scope[_attr] = _datas;
            }
            scope.$apply();
        }
        // For not to do initialization twice.
        ViewEngine._inited = true;
    }
}
/**
 * repeatFinish指令处理函数
 */
function renderFinish(){}
// 初始化ViewEngine
$(function(){
    viewEngine = new ViewEngine();
    viewEngine.initialize('viewApp');
    //IE、Mozilla浏览器下
    //新增动态行数据模型后，需要向父框架formData更新（“不能执行已释放的Script代码”，
    //由于子页面数据生命周期终结而父框架访问到已释放对象所致）
    if ($.browser.msie || $.browser.mozilla) {
        $(window).on('unload',function() {
            parent.formEngine.cloneFormData(ViewEngine.SCOPE, ViewEngine.SCOPE.formData);
        });
    }
});