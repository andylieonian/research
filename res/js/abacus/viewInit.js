function _VIEW_START_UP_(){
    _VIEW_START_UP_.prototype.pathRoot = parent.pathRoot || "/sbzs";
    _VIEW_START_UP_.prototype.flagLoad = 0;
    /**
     * All scripts for sheet. 表单所需的各类JS脚本.
     */
    _VIEW_START_UP_.prototype.viewLibScripts = [ // Common-Library scripts
    "/res/js/lib/jquery.min.js", // LIB: JQuery
    "/res/js/lib/json3.min.js", // LIB: Json3
    "/res/js/lib/jsonpath.js", // LIB: JsonPath's selector
    "/res/js/lib/message.js",//LIB:message https://github.com/DHTMLX/message
    "/res/js/lib/angular.js", // LIB: Google Angular
    ];
    _VIEW_START_UP_.prototype.viewCustomScripts = [ // Custom's scripts, including view engine.
    "/res/js/abacus/viewEvent.js",
    "/res/js/abacus/viewDirective.js", // Framework: custom's directives
    "/res/js/abacus/viewEngine.js", // Framework: viewEngine
    "/res/js/lib/select2/select2.min.js",
    "/res/js/lib/laydate-v1.1/laydate/laydate.js"
    ];
    if (typeof _VIEW_START_UP_._inited == "undefined") {
        _VIEW_START_UP_.prototype.init = function(){
            if (0 == this.flagLoad) {
                this.loadFirst();
                window.setTimeout('_viewStartUp_.init()', 100);
            } else if (1 == this.flagLoad) {
                if ('undefined' != typeof $ || 'undefined' != typeof angular) {
                    for (var i = 0; i < this.viewCustomScripts.length; i++) {
                        this.loadScript4Sheet(this.viewCustomScripts[i]);
                    }
                    this.flagLoad++;
                    setTimeout("parent.formEngine.hideMaskFrmSheet()", 500);
                } else {
                    window.setTimeout('_viewStartUp_.init()', 100);
                }
            } else {
                console.log("WARN: Invalid load status.");
            }
        }
        _VIEW_START_UP_.prototype.loadFirst = function(){
            // Load Common-Library for the first.
            if (this.flagLoad == 0) {
                for (var i = 0; i < _viewStartUp_.viewLibScripts.length; i++) {
                    this.loadScript4Sheet(this.viewLibScripts[i]);
                }
                this.flagLoad++;
            }
        }
        _VIEW_START_UP_.prototype.appendToHead = function(elem){
            var temp = document.getElementsByTagName("head");
            if (temp && temp.length > 0) {
                temp[0].appendChild(elem);
            } else {
                dhtmlx.message("动态增加CSS失败, 无法获取 HEAD 节点 ", "error", 5000);
            }
        }
        /**
         * 装载表单所需要的样式表.
         * @param urlViewScript 样式表文件的URL
         */
        _VIEW_START_UP_.prototype.loadCss4Sheet = function(urlViewCss){
            var domDocument = document;
            var oCss = document.createElement("link");
            oCss.type = "text/css";
            oCss.rel = "stylesheet";
            oCss.href = this.pathRoot + urlViewCss;
            this.appendToHead(oCss);
        }
        /**
         * 装载表单所需要的脚本文件.
         * @param urlViewScript 脚本文件的URL
         */
        _VIEW_START_UP_.prototype.loadScript4Sheet = function(urlViewScript){
            var domDocument = document;
            var oScript = document.createElement("script");
            oScript.type = "text/javascript";
            oScript.src = this.pathRoot + urlViewScript;
            this.appendToHead(oScript);
        }
        /**
         * Internet Explorer 7 Compatible
         */
        if (typeof document.querySelectorAll !== 'function') {
            document.querySelectorAll = function(selectors){
                var style = document.createElement('style'), elements = [], element;
                document.documentElement.firstChild.appendChild(style);
                document._qsa = [];
                style.styleSheet.cssText = selectors
                    + '{x-qsa:expression(document._qsa && document._qsa.push(this))}';
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
        /*
         * Initialize
         */
        window.setTimeout('_viewStartUp_.init()', 100);
    }
    _VIEW_START_UP_._inited = true;
}
_viewStartUp_ = new _VIEW_START_UP_();