/**
 * Created by Administrator on 2016-05-07.
 */
// 定义全局变量
var formData;
var formCT = {}; //Code-tables
var flagDataLoaded = false;
var flagExecuteInitial = true;//execute initialize formula flag
var formulaEngine;
var formulaCalculates;
var formEngine;
// 低版本IE兼容性处理：控制台日志记录器。
if (!window.console) {
    console = { log : function(){} };
}
/**
 * 表单引擎，负责管理整个表单框架的表单列表管理、数据访问管理、规则库管理等。
 */
function FormEngine(){
    /**
     * Constant. 常量定义.
     */
    FormEngine.prototype.URL_GET_SHEET_LIST = "abacus/getSheetList.jsp";
    FormEngine.prototype.URL_GET_RULE_BASE = "abacus/getRuleBase.jsp";
    FormEngine.prototype.URL_GET_FORM_DATA = "abacus/getFormData.jsp";
    /**
     * All CSS for sheet. 表单所需要的样式表.
     */
    FormEngine.prototype.viewCss = [ "/res/css/abacus/table.css",
    "/res/css/message/message_solid.css"];
    this.lstSheets = [];
    // Declare function
    if (typeof FormEngine._inited == "undefined") {
        /**
         * PUBLIC: FormEngine initialization, should be called after create. PUBLIC: 表单引擎初始化，应在对象创建后即进行调用.
         */
        FormEngine.prototype.initialize = function(){
            var _start_ = new Date().getTime();
            if(true == flagFormDebuging) {
                dhtmlx.message("表单引擎启动...", "info", 2000);
            }
            /**
             * 装载左侧表单数据列表。
             */
            this.loadSheetList(this.URL_GET_SHEET_LIST, jsonParams);
            /**
             * 表单引擎初始化 异步请求data跟rule后初始化视图及绑定事件
             */
            $.when($.getJSON(this.URL_GET_FORM_DATA, jsonParams),
                $.getJSON(this.URL_GET_RULE_BASE, jsonParams)).then(function(datas, rules){
                formData = datas[0];
                if("undefined" !== typeof formData.code && "000" !== formData.code) {
                    dhtmlx.message(formData.msg, "error", 2000);
                } else {
                    if("undefined" !== typeof formData.body) {
                        if("undefined" !== typeof flagExecuteInitial) {
                            flagExecuteInitial = formData.execute;
                        }
                        formData = formData.body;
                    }
                    if ("string" === typeof formData) {
                        formData = jQuery.parseJSON(formData);
                    }
                }
                formulaCalculates = rules[0];
                var _ms_ = new Date().getTime() - _start_;
                if(true == flagFormDebuging) {
                    dhtmlx.message("数据模型装载完毕 , " + _ms_ + "ms", "info", 2000);
                }
            }).then(function(){
                var _start_formula_ = new Date().getTime();
                // Init formula engine.
                formulaEngine = new FormulaEngine();
                //初始定制公式暂无公式
                if(formulaCalculates.length > 0){ 
                	formulaEngine.loadFormulas(formulaCalculates);
                	formulaEngine.initialize("formData");
            	}
                var _ms_ = new Date().getTime() - _start_formula_;
                if(true == flagFormDebuging) {
                    dhtmlx.message("公式引擎初始化完毕 , " + _ms_ + "ms", "info", 2000);
                }
            }).done(function(){
                flagDataLoaded = true;
                var _ms_ = new Date().getTime() - _start_;
                if(true == flagFormDebuging) {
                    dhtmlx.message("表单引擎初始化完毕 , " + _ms_ + "ms", "info", 2000);
                }
            });
            /**
             * 注册IFrame事件，监听并动态注入JS脚本文件。
             */
            this.listenFrameSheet();
        };
        /**
         * 监听表单装载成功的事件，即IFrame的#frmSheet的onLoad()事件，然后动态注入所需资源. 依赖[IFRAME id="frmSheet" name="frmSheet"]
         */
        FormEngine.prototype.listenFrameSheet = function(){
            $("#frmSheet")
                .load(
                    function(event){
                        // 蒙层
                        var html = "<div id=\"maskFrmSheet\" style=\"position: absolute; width: 100%; height: 100%; top: 0px; background-color: #EEEEEE; z-index: 999; opacity: 0.75;overflow: hidden; \"></div>"
                            + "<div id=\"marqueeFrmSheet\" style=\"position: absolute; width: 100%; height: 100%; top: 45%; color: black; z-index: 9999; opacity: 1; overflow: hidden; text-align: center;font-family: '宋体'; font-size: 16px;\"><b>正在加载表单...</b></div></td>";
                        var frame = document.getElementById("frmSheet");
                        var domDocument = frame.contentWindow.document.body;
                        $(domDocument).append(html);
                        $(domDocument).css({ "overflow" : "hidden" });
                        // 动态注入<script>和<link>
                        if (formEngine) {
                            var delay = 50;
                            // 注入CSS，也即<link>标签
                            for (var i = 0; i < formEngine.viewCss.length; i++) {
                                formEngine.loadCss4Sheet(formEngine.viewCss[i]);
                            }
                            formEngine.loadScript4Sheet("/res/js/abacus/viewInit.js");
                        } else {
                            console.log("Object formEngine not ready.");
                        }
                    });
        }
        FormEngine.prototype.appendToHead = function(domDocument, elem){
            var temp = domDocument.getElementsByTagName("head");
            if (temp && temp.length > 0) {
                temp[0].appendChild(elem);
            } else {
                dhtmlx.message("动态增加头部信息节点失败, 无法获取 HEAD 节点 ", "error", 5000);
            }
        }
        /**
         * 装载表单所需要的样式表.
         * @param urlViewScript 样式表文件的URL
         */
        FormEngine.prototype.loadCss4Sheet = function(urlViewCss){
            var frame = document.getElementById("frmSheet");
            var domDocument = frame.contentWindow.document;
            var oCss = document.createElement("link");
            oCss.type = "text/css";
            oCss.rel = "stylesheet";
            oCss.href = pathRoot + urlViewCss;
            this.appendToHead(domDocument, oCss);
        }
        /**
         * 装载表单所需要的脚本文件.
         * @param urlViewScript 脚本文件的URL
         */
        FormEngine.prototype.loadScript4Sheet = function(urlViewScript){
            var frame = document.getElementById("frmSheet");
            var domDocument = frame.contentWindow.document;
            var oScript = document.createElement("script");
            oScript.type = "text/javascript";
            oScript.src = pathRoot + urlViewScript;
            this.appendToHead(domDocument, oScript);
        }
        /**
         * 装载表单列表信息.
         */
        FormEngine.prototype.loadSheetList = function(urlFormList, jsonParams){
            var _start_ = new Date().getTime();
            var formEngine = this;
            $.when($.getJSON(urlFormList, jsonParams)).then(
                function(data, status, xhr){
                    if (status == "success") {
                        formEngine.lstSheets = data;
                        formEngine.showSheetList();
                        var _ms_ = new Date().getTime() - _start_;
                        if(true == flagFormDebuging) {
                            dhtmlx.message("主附表清单加载完毕, " + _ms_ + "ms", "info", 2000);
                        }
                    } else {
                        if(true == flagFormDebuging) {
                            dhtmlx.message("主附表清单加载失败.", "error", 5000);
                        }
                        console.log("FormlistLoader: Error while loading: " + xhr.status + ": "
                            + xhr.statusText);
                    }
                }).then(function(){
                // Load first sheet. 自动装载第一张表.
                if (formEngine.lstSheets.length > 0) {
                    var jqFrmSheet = $("#frmSheet");
                    if (jqFrmSheet.length) {
                        jqFrmSheet.attr("src", formEngine.lstSheets[0].url);
                    }
                }
            }).fail(
                function(xhr, msg, err){
                    var status = (xhr.status == "200") ? msg : xhr.status;
                    console.log("Loading sheet list fail with [" + status + "]\n----"
                        + xhr.responseText);
                    if(true == flagFormDebuging) {
                        dhtmlx.message("加载表清单失败 [" + status + "] " + err, "error", 5000);
                    }
                });
        }
        /**
         * 显示表单列表信息在界面左侧，依赖[DIV id="divSheetlist"]
         */
        FormEngine.prototype.showSheetList = function(){
            var sheets = this.lstSheets;
            var divSheetlist = $("#divSheetlist");
            if (divSheetlist.length) {
                var html = "";
                for ( var i in sheets) {
                    var sheet = sheets[i];
                    html += "<li><a target=\"frmSheet\" href=\"" + sheet.url + "\">" + sheet.name
                        + "</a></li>";
                }
                divSheetlist.html(html);
                divSheetlist.find("li:not(.active)").first().addClass("current_selected_BD");
            }
        }
        FormEngine.prototype.hideMaskFrmSheet = function(sheets){
            var frame = document.getElementById("frmSheet");
            var domDocument = frame.contentWindow.document.body;
            $(domDocument).find("#maskFrmSheet").hide();
            $(domDocument).find("#marqueeFrmSheet").hide();
            $(domDocument).css({ "overflow" : "scroll" });
        }
        FormEngine.prototype.cacheCodeTable = function(key, value) {
            formCT[key] =jQuery.extend(true, {}, value);
        }
        FormEngine.prototype.cloneFormData = function(scope, newData) {
            formData = jQuery.extend(true, {}, newData);
            scope.$apply();
        }
        // For not to do initialization twice.
        FormEngine._inited = true;
    }
}
$(function(){
    formEngine = new FormEngine();
    formEngine.initialize();
});
