/**
 * Created by Administrator on 2016-05-12.
 */
function ngDirectives(gobal, viewApp){
    viewApp
        .constant(
        "ngDatatypeConfig",
        {
            "number" : {
                "formatter" : function(args){
                    var modelValue = args.$modelValue, filter = args.$filter, attrs = args.$attrs, $eval = args.$eval;
                    var precision = 2;
                    if (attrs.ngDatatype) {
                        var reg = /{(-?\d*)}/;
                        var result = reg.exec(attrs.ngDatatype);
                        if (result) {
                            precision = result[1];
                        }
                    }
                    try {
                        return filter("number")(modelValue, precision);
                    } catch (e) {
                        console.log("ERROR[" + e + "],ng-model is " + attrs.ngModel);
                    }
                },
                "parser" : function(args){
                    var precision = 2;
                    var viewValue = args.$viewValue, attrs = args.$attrs;
                    var num = viewValue.replace(/[^0-9.-]/g, '');
                    //TO-DO  默认取14位整数，有待优化，可以定义   支持number{10.2} 整数位数10位,小数位数2位  与 number{2} 小数位数2位
                    var numArr = num.split(".");
                    num = (numArr[0]).substr(0,14) +"."+ numArr[1]
                    var result = parseFloat(num, 10);
                    if (attrs.ngDatatype) {
                        var reg = /{(-?\d*)}/;
                        var resultPrec = reg.exec(attrs.ngDatatype);
                        if (resultPrec) {
                            precision = resultPrec[1];
                        }
                    }
                    result = isNaN(result) ? 0 : result;
                    return parseFloat(result.toFixed(precision));
                },
                "isEmpty" : function(value){
                    return !value.$modelValue;
                },
                "keyDown" : function(args){
                    var event = args.$event, viewValue = args.$viewValue, modelValue = args.$modelValue;

                    if (!(gobal.keyHelper.smallKeyBoard(event) || gobal.keyHelper.numberKeyBpoard(event)
                        || gobal.keyHelper.functionKeyBoard(event)
                        || gobal.keyHelper.currencyKeyBoard(event, viewValue) || gobal.keyHelper.floatKeyBoard(
                            event, viewValue))) {
                        event.stopPropagation();
                        event.preventDefault();
                    }
                }
            },
            "digit" : {
                "formatter" : function(args){
                    return args.$modelValue;
                },
                "parser" : function(args){
                    return args.$viewValue ? args.$viewValue.replace(/[^0-9-]/g, '') : "";
                },
                "isEmpty" : function(value){
                    return !value.$modelValue;
                },
                "keyDown" : function(args){
                    var event = args.$event;

                    if (!(gobal.keyHelper.smallKeyBoard(event) || gobal.keyHelper.numberKeyBpoard(event) || gobal.keyHelper
                            .functionKeyBoard(event))) {
                        event.stopPropagation();
                        event.preventDefault();
                    }
                }
            },
            "strDigit" : {
                "formatter" : function(args){
                    var modelValue = args.$modelValue, filter = args.$filter;
                    return modelValue;
                },
                "parser" : function(args){
                	return args.$viewValue ? args.$viewValue.replace(/[^0-9a-zA-Z]/g, '') : "";
                },
                "isEmpty" : function(value){
                    return !value.$modelValue;
                },
                "keyDown" : function(args){
                    var event = args.$event, viewValue = args.$viewValue;

                    if (!(gobal.keyHelper.smallKeyBoard(event) || gobal.keyHelper.numberKeyBpoard(event)
                        || gobal.keyHelper.functionKeyBoard(event) || gobal.keyHelper.floatKeyBoard(event,
                            viewValue) || gobal.keyHelper.englishKeyBoard(event))) {
                        event.stopPropagation();
                        event.preventDefault();
                    }
                }
            },
            "int" : {
                "formatter" : function(args){
                    var modelValue = args.$modelValue, filter = args.$filter;
                    return filter("number")(modelValue);
                },
                "parser" : function(args){
                    var val = parseInt(args.$viewValue.replace(/[^0-9-]/g, ''), 10);
                    return isNaN(val) ? undefined : val;
                },
                "isEmpty" : function(value){
                    return !value.$modelValue;
                },
                "keyDown" : function(args){
                    var event = args.$event;

                    if (!(gobal.keyHelper.smallKeyBoard(event) || gobal.keyHelper.numberKeyBpoard(event) || gobal.keyHelper
                            .functionKeyBoard(event))) {
                        event.stopPropagation();
                        event.preventDefault();
                    }
                }
            },
            "float" : {
                "formatter" : function(args){
                    var modelValue = args.$modelValue, filter = args.$filter;
                    return filter("number")(modelValue);
                },
                "parser" : function(args){
                    var val = parseFloat(args.$viewValue.replace(/[^0-9.-]/g, '')), ENOB = 3, tempNum = Math.pow(10,
                        ENOB);
                    return isNaN(val) ? undefined : Math.round(val * tempNum) / tempNum;
                },
                "isEmpty" : function(value){
                    return !value.$modelValue;
                },
                "keyDown" : function(args){
                    var event = args.$event, viewValue = args.$viewValue;

                    if (!(gobal.keyHelper.smallKeyBoard(event) || gobal.keyHelper.numberKeyBpoard(event)
                        || gobal.keyHelper.functionKeyBoard(event) || gobal.keyHelper.floatKeyBoard(event,
                            viewValue))) {
                        event.stopPropagation();
                        event.preventDefault();
                    }
                }
            },
            "string" : {
                "formatter" : function(args){
                    var modelValue = args.$modelValue, filter = args.$filter;
                    return modelValue;
                },
                "parser" : function(args){
                    var val = args.$viewValue;
                    return isNaN(val) ? undefined : '';
                },
                "isEmpty" : function(value){
                    return !value.$modelValue;
                },
                "keyDown" : function(args){
                    var event = args.$event, viewValue = args.$viewValue;

                    if (!(gobal.keyHelper.smallKeyBoard(event) || gobal.keyHelper.numberKeyBpoard(event)
                        || gobal.keyHelper.functionKeyBoard(event) || gobal.keyHelper.floatKeyBoard(event,
                            viewValue) || gobal.keyHelper.englishKeyBoard(event))) {
                        event.stopPropagation();
                        event.preventDefault();
                    }
                }
            },
            /**
             * 百分比显示格式化
             */
            "percent" : {
                "formatter" : function(args) {
                    var modelValue = args.$modelValue, filter = args.$filter, attrs = args.$attrs, $eval = args.$eval;
                    var decimals = 3;
                    var suffix = '%';
                    if (attrs.ngDatatype) {
                        var reg = /{(-?\d*)}/;
                        var result = reg.exec(attrs.ngDatatype);
                        if (result) {
                            decimals = parseInt(result[1], 10);
                        }
                    }
                    if(angular.isNumber(modelValue)) {
                        return (Math.round(modelValue * Math.pow(10, decimals + 2))/Math.pow(10, decimals)).toFixed(decimals) + suffix;
                    } else return '';
                },
                "parser" : function(args) {
                    var viewValue = args.$viewValue,filter = args.$filter, attrs = args.$attrs, $eval = args.$eval;
                    var decimals = 3;
                    if (attrs.ngDatatype) {
                        var reg = /{(-?\d*)}/;
                        var result = reg.exec(attrs.ngDatatype);
                        if (result) {
                            decimals = parseInt(result[1], 10);
                        }
                    }
                    var vv = viewValue.replace(/[^0-9.]/g, '');
                    vv = parseFloat(vv, 10);
                    return isNaN(vv) ? undefined : Math.round(vv * Math.pow(10, decimals))/Math.pow(10, decimals + 2);
                },
                "isEmpty" : function(value){
                    return !value.$modelValue;
                },
                "keyDown" : function(args){
                    var event = args.$event, viewValue = args.$viewValue;

                    if (!(gobal.keyHelper.smallKeyBoard(event) || gobal.keyHelper.numberKeyBpoard(event)
                        || gobal.keyHelper.functionKeyBoard(event) || gobal.keyHelper.floatKeyBoard(event,
                            viewValue))) {
                        event.stopPropagation();
                        event.preventDefault();
                    }
                }
            }
        }).directive(
        "ngDatatype",
        [
            "ngDatatypeConfig",
            "$filter",
            "$parse",
            function(ngDatatypeConfig, $filter, $parse){
                return {
                    require : '?^ngModel',
                    link : function(scope, element, attrs, ctrl){
                        var ngDatatype = attrs.ngDatatype;
                        var formatParam;
                        var posTmp = ngDatatype.indexOf("{")
                        if (posTmp > 0) {
                            formatParam = ngDatatype.substr(posTmp + 1, ngDatatype.indexOf("}") - posTmp - 1);
                            ngDatatype = ngDatatype.substr(0, posTmp);
                        }
                        var config = ngDatatypeConfig[ngDatatype] || {};

                        var parseFuction = function(funKey){
                            if (attrs[funKey]) {
                                var func = $parse(attrs[funKey]);
                                return (function(args){
                                    return func(scope, args);
                                });
                            }
                            return config[funKey];
                        };

                        var formatter = parseFuction("formatter");
                        var parser = parseFuction("parser");
                        var isEmpty = parseFuction("isEmpty");
                        var keyDown = parseFuction("keyDown");
                        var getModelValue = function(){
                            return $parse(attrs.ngModel)(scope);
                        };

                        if (keyDown) {
                            element.bind(
                                "blur",
                                function(){
                                    element.val(formatter({ "$modelValue" : getModelValue(), "$filter" : $filter,
                                        "$attrs" : attrs, "$eval" : scope.$eval
                                    }));
                                }).bind(
                                "keydown",
                                function(event){
                                    keyDown({ "$event" : event, "$viewValue" : element.val(),
                                        "$modelValue" : getModelValue(), "$attrs" : attrs, "$eval" : scope.$eval,
                                        "$ngModelCtrl" : ctrl
                                    });
                                });
                        }

                        ctrl.$parsers.push(function(viewValue){
                            return parser({ "$viewValue" : viewValue, "$attrs" : attrs, "$eval" : scope.$eval
                            });
                        });

                        ctrl.$formatters.push(function(value){
                            return formatter({ "$modelValue" : value, "$filter" : $filter, "$attrs" : attrs,
                                "$eval" : scope.$eval
                            });
                        });

                        ctrl.$isEmpty = function(value){
                            return isEmpty({ "$modelValue" : value, "$attrs" : attrs, "$eval" : scope.$eval
                            });
                        };
                    }
                };
            }
        ]).directive("checkBoxToArray", [

            function(){
                return { restrict : "A", require : "ngModel", link : function(scope, element, attrs, ctrl){
                    var value = scope.$eval(attrs.checkBoxToArray);
                    ctrl.$parsers.push(function(viewValue){
                        var modelValue = ctrl.$modelValue ? angular.copy(ctrl.$modelValue) : [];
                        if (viewValue === true && modelValue.indexOf(value) === -1) {
                            modelValue.push(value);
                        }

                        if (viewValue !== true && modelValue.indexOf(value) != -1) {
                            modelValue.splice(modelValue.indexOf(value), 1);
                        }

                        return modelValue.sort();
                    });

                    ctrl.$formatters.push(function(modelValue){
                        return modelValue && modelValue.indexOf(value) != -1;
                    });

                    ctrl.$isEmpty = function($modelValue){
                        return !$modelValue || $modelValue.length === 0;
                    };
                }
                }
            }
        ]);

    var smallKeyBoard = function(event){
        var which = event.which;
        return (which >= 96 && which <= 105);
    };
    
    var englishKeyBoard = function(event){
        var key = event.key;
        return ((key >= "a" && key <= "z") || (key >= "A" && key <= "Z"));
    };

    var numberKeyBpoard = function(event){
    	//var which = event.which;
    	var which = event.keyCode ? event.keyCode : (event.which ? event.which : event.charCode);
        return (which >= 48 && which <= 57 || which == 45 || which == 229 || which == 189 || which == 173) && !event.shiftKey;
    };

    var functionKeyBoard = function(event){
        //var which = event.which;
    	var which = event.keyCode ? event.keyCode : (event.which ? event.which : event.charCode);
        return (which <= 40) || (navigator.platform.indexOf("Mac") > -1 && event.metaKey)
            || (navigator.platform.indexOf("Win") > -1 && event.ctrlKey);
    };

    var currencyKeyBoard = function(event, viewValue){
        //var which = event.which;
    	var which = event.keyCode ? event.keyCode : (event.which ? event.which : event.charCode);
        return (viewValue.toString().indexOf('$') === -1 && which === 52 && event.shiftKey);
    };

    var floatKeyBoard = function(event, viewValue){
        //var which = event.which;
    	var which = event.keyCode ? event.keyCode : (event.which ? event.which : event.charCode);
    	return (which===188) || (which === 190 || which === 110) && viewValue.toString().indexOf('.') === -1;
        // Change for compatible to IE8
        //return [188].indexOf(which) != -1 || (which === 190 || which === 110) && viewValue.toString().indexOf('.') === -1;
    }

    gobal.keyHelper = { smallKeyBoard : smallKeyBoard, numberKeyBpoard : numberKeyBpoard,
        functionKeyBoard : functionKeyBoard, currencyKeyBoard : currencyKeyBoard, floatKeyBoard : floatKeyBoard,englishKeyBoard : englishKeyBoard
    };

    /**
     * 自定义指令ngRepeatInit
     *在angular初始化repeat指令时调用，如为每一个指令下的单元格绑定事件
     */
    viewApp.directive('ngRepeatInit', function () {
        return {
            link: function ($scope, $element, $attr) {
                //console.log(scope.$index)
                //调用绑定事件方法
                $scope.$eval(viewEngine.bindEventsForElements($scope, $element));
                var _skipElem = $element.attr('skip-elem');
                var _defaultValue = $element.attr('default-value');
                var _keyword = $element.attr('ng-repeat-init');
                var obj = _defaultValue
                if(undefined == obj || '' === obj) {
                    obj = jQuery.extend(true, {}, $scope[_keyword][0]);//增行时默认取第一行模型;
                    $.each(obj, function(k,v){
                        if(_skipElem && k == _skipElem) {

                        } else{
                            if(typeof v =='string') {
                                obj[k] = '';
                            } else if(typeof v == 'number') {
                                obj[k] = 0;
                            } else if(typeof v == 'object') {
                                obj[k] = {};
                            }
                        }
                    });
                    // 由于angular双向绑定过程中，会对数据模型加入一些私有变量，如$index等标识，
                    // 所以不能直复制对象操作;
                    obj = JSON.stringify(obj);
                }
                
                //重复行jpath集合
                var _jpaths = [];
                $($($element).children().children()).each(function(index) {
                	var _jpath = $(this).attr('jpath');
                	if(undefined != _jpath) {
                		_jpaths.push(_jpath.replace(/\[\d+\]/g,"[0]"));
                	}
                	
                });
                if(undefined == $scope['_arr_' + _keyword]) {
                	$scope['_arr_' + _keyword] = _jpaths;
                }
                
                $scope.add=function(){
                    $scope[_keyword].splice((this.$index+1),0,JSON.parse(obj.replace(/\\/g,'')));
                    if(undefined != $scope['_arr_' + _keyword]) {
                        _jpaths = $scope['_arr_' + _keyword];
                        for(var i in _jpaths) {
                            parent.formulaEngine.apply(_jpaths[i], this.value);
                        }
                    }
            }
                $scope.del=function(idx){
                    $scope[_keyword].splice(this.$index,1);
                    if(undefined != $scope['_arr_' + _keyword]) {
                    	_jpaths = $scope['_arr_' + _keyword];
                    	for(var i in _jpaths) {
                    		parent.formulaEngine.apply(_jpaths[i], this.value);
                            parent.formulaEngine.deleteIdxVariableNoPass(_jpaths[i].replace(/\[\d+\]/g,"["+ this.$index +"]"));
                            viewEngine.tipsForVerify($element);
                    	}
                    }
                }
                if ($scope.$last == true) {
                    //console.log('ng-repeat执行完毕');
                    $scope.$eval(renderFinish);
                }
            }
        }
    });
    /**
     *自定义指令ngJprefix
     */
    viewApp.directive('ngJprefix', function () {
        return {
            require: '?^viewCtrl',
            link: function ($scope, $element, $attr) {
                var _jprefixs = $element.attr('ng-jprefix');//二选一
                //_jprefixs = $attr(ngJprefix);
                var _brePath = _jprefixs.substr(_jprefixs.lastIndexOf('\.') + 1);
                $scope[_brePath] = jsonPath($scope.formData, _jprefixs)[0];
                $scope["_jprefix_" + _brePath] = _jprefixs;

                viewEngine.bindEventsForElements($scope, $element);
            }
        }
    });

    /**
     * 自定义初始化代码表指令
     */
    viewApp.directive('ngCodetableInit', function(){
        return {
            require: '?^viewCtrl',
            priority: 100,
            scope: true,
            /*            link: function ($scope, $element, $attr) {var _attr = $element.attr("ng-codetable-init");var _xpath = _attr.split(',')[0];var _sattr = _attr.split(',')[1];
             $.when($.getJSON(_xpath)).then(function(response){$scope[_sattr] = response.root;});
             }*/
            compile: function (element, attributes){
                return {
                    pre: function preLink($scope, $element, attributes) {
                        var _attr = $element.attr("ng-codetable-init")
                        var _xpath = _attr.split(',')[0];
                        var _sattr = _attr.split(',')[1];
                        var _data;
                        $.when($.getJSON(_xpath)).then(function(response){
                            $scope[_sattr] = response.root;
                            _data = response.root;
                            viewEngine.formApply($('#viewCtrlId'), _sattr, _data);
                        });
                    },
                    post: function postLink($scope, $element, attributes) {
                    }
                }
            }
        }
    });

    /**
     * 自定义初始化代码表指令
     * 带缓存
     */
    viewApp.directive('ngCodetable', function(){
        return {
            require: '?^viewCtrl',
            priority: 100,
            restrict : "E",
            scope: true,
            compile: function (element, attributes){
                return {
                    pre: function preLink($scope, $element, attributes) {
                        var _url = $element.attr("url");
                        var _model = $element.attr("model");
                        var _node = $element.attr("node");
                        var _name = $element.attr("name");
                        var _dm = $element.attr("dm");
                        var _mc = $element.attr("mc");
                        var _data;
                        if(undefined == parent.formCT[_name]) {//判断是否已缓存
                            if(undefined != _url && "" != _url) {//URL来源
                                $.when($.getJSON(_url)).then(function(response){
                                    _data = response;
                                    if(undefined == _node || "" == _node) {
                                        //parent.formCT[_name] = response;
                                        _data = response;
                                    } else {
                                        //parent.formCT[_name] = response[_node];
                                        _data = response[_node];
                                    }
                                    parent.formEngine.cacheCodeTable(_name, _data);
                                    viewEngine.formApply($('#viewCtrlId'), _name, _data);
                                }).fail(function() {
                                    dhtmlx.message("codetable指令缓存代码表"+_url+"，请检查...", "error", 2000);
                                });
                            } else if(undefined != _model && "" != _model) {//期初数来源
                                //parent.formCT = jsonPath($scope.formData, _model)[0];
                                _data = jsonPath($scope.formData, _model)[0];
                                if(undefined != _dm && "" != _dm) {
                                    var _jsons = {};
                                    $.each(_data, function(k,v) {
                                        _jsons[v[_dm]] = v;
                                    });
                                    _data = _jsons;
                                }

                                parent.formEngine.cacheCodeTable(_name, _data);
                                viewEngine.formApply($('#viewCtrlId'), _name, _data);
                            } else {//codetable指令相关参数缺失
                                dhtmlx.message("codetable指令相关参数缺失，请检查...", "error", 2000);
                            }
                        }
                    },
                    post: function postLink($scope, $element, attributes) {
                    }
                }
            }
        }
    });

    /**
     * 自定义检测渲染完成指令
     * 在ngCtrl所在DOM元素的子元素下使用
     */
    viewApp.directive('ngRenderFinish', ['$timeout',function($timeout) {
        return {
            scope: {
                finished: '=isFinish'
            },
            link: function ($scope, $element, $attr) {
                $timeout(function(){
                    viewEngine.tipsForVerify(document.body);
                },500);
            }
        }
    }]);
    /**
     * 自定义laydate日期控件指令
     * <input type="text" class="laydate-icon" id="sssqQ" ng-laydate="{}" ng-model="formData.sssq.rqQ">
     * id为必传参数
     */
    viewApp.directive('ngLaydate', ['$filter',function($filter) {
        var dateFilter = $filter('date');
        return {
            require: 'ngModel',//控制器是指令标签对应的ngModel
            restrict: "EA",//指令作用范围是element或attribute
            link: function(scope, element, attrs, ctrl) {
/*
                function formatter(value) {
                    return dateFilter(value, 'yyyy-MM-dd'); //format
                }
                function parser(value) {
                    if(ctrl.$viewValue == ""){
                        return ctrl.$modelValue;
                    }else{
                        return ctrl.$viewValue;
                    }
                }
                ctrl.$formatters.push(formatter);  //结尾插入
                ctrl.$parsers.unshift(parser);   //首位插入

                //element.val(ctrl.$viewValue);

                element[0].id= new Date().getTime();

                var unregister = scope.$watch(function(){
                    element.bind("change", function(){
                        scope.$apply(function(){
                            element.val(ctrl.$viewValue);
                            viewEngine.tipsForVerify(element);
                        });
                    });

                    element.bind("click", function(){
                        laydate({
                            elem: '#'+element[0].id, //目标元素。由于laydate.js封装了一个轻量级的选择器引擎，因此elem还允许你传入class、tag但必须按照这种方式 '#id .class'
                            //event: 'focus', //响应事件。如果没有传入event，则按照默认的click
                            isclear: true, //是否显示清空
                            istoday: false, //是否显示今天
                            choose: function(datas){ //选择日期完毕的回调
                                ctrl.$setViewValue(datas);
                                //formApply($('#viewCtrlId'));
                            }
                        });
                    });

                    return ctrl.$modelValue;
                }, initialize);

                function initialize(value){  //下面再说
                    ctrl.$setViewValue(value);
                    unregister();
                }*/

                function formatter(value) {
                    return dateFilter(value, 'yyyy-MM-dd'); //format
                }
                function parser(value) {
                    if(ctrl.$viewValue == undefined){
                        return "";
                    }else{
                        return ctrl.$viewValue;
                    }
                }
                ctrl.$formatters.push(formatter);  //结尾插入
                ctrl.$parsers.unshift(parser);   //首位插入

                element.val(ctrl.$viewValue);
                if(!element[0].id){
                    element[0].id= new Date().getTime();
                }

                element.on({ "click" : function(event){
                    laydate({
                        ctrl:ctrl,//表单引擎特有属性【非必填选项】
                        jpath:$(element).attr("jpath"),//表单引擎特有属性【非必填选项】
                        elem: '#'+element[0].id, //目标元素。由于laydate.js封装了一个轻量级的选择器引擎，因此elem还允许你传入class、tag但必须按照这种方式 '#id .class'
                        //event: 'focus', //响应事件。如果没有传入event，则按照默认的click
                        isclear: true, //是否显示清空
                        istoday: true, //是否显示今天
                        festival: true, //是否显示节日
                        choose: function(datas){ //选择日期完毕的回调
                            ctrl.$setViewValue(datas);
                            var _jpath = $(element).attr("jpath");
                            parent.formulaEngine.apply(_jpath, datas);
                            viewEngine.tipsForVerify(document.body);//el
                        }
                    });
                }
                });

            }
        };
    }]);

	/**
     * 自定义输入地址控件指令
     * <input type="text" select-address p="p" c="c" a="a" d="d" placeholder="请选择所在地" ng-model="xxx" />
     */
    viewApp.directive('selectAddress', function($http, $q, $compile) {
        var cityURL, delay, templateURL;
        delay = $q.defer();
        templateURL = '../../res/js/lib/address/address.html';
        cityURL = '../../res/js/lib/address/city.json';
        $http.get(cityURL).success(function(data) {
          return delay.resolve(data);
        });
        return {
          restrict: 'A',
          scope: {
            p: '=',
            a: '=',
            c: '=',
            d: '=',
            ngModel: '='
          },
          link: function(scope, element, attrs) {
            var popup;
            popup = {
              element: null,
              backdrop: null,
              show: function() {
                return this.element.addClass('active');
              },
              hide: function() {
                this.element.removeClass('active');
                return false;
              },
              resize: function() {
                if (!this.element) {
                  return;
                }
                this.element.css({
                  top: -this.element.height() - 30,
                  'margin-left': -this.element.width() / 2
                });
                return false;
              },
              focus: function() {
                $('[ng-model="d"]').focus();
                return false;
              },
              init: function() {
                element.on('click keydown', function() {
                  popup.show();
                  event.stopPropagation();
                  return false;
                });
                $(window).on('click', (function(_this) {
                  return function() {
                    return _this.hide();
                  };
                })(this));
                this.element.on('click', function() {
                  return event.stopPropagation();
                });
                return setTimeout((function(_this) {
                  return function() {
                    _this.element.show();
                    return _this.resize();
                  };
                })(this), 500);
              }
            };
            return delay.promise.then(function(data) {
              $http.get(templateURL).success(function(template) {
                var $template;
                $template = $compile(template)(scope);
                $('body').append($template);
                popup.element = $($template[2]);
                scope.provinces = data;
                return popup.init();
              });
              scope.aSet = {
                p: function(p) {
                  scope.p = p;
                  scope.c = null;
                  scope.a = null;
                  return scope.d = null;
                },
                c: function(c) {
                  scope.c = c;
                  scope.a = null;
                  return scope.d = null;
                },
                a: function(a) {
                  scope.a = a;
                  scope.d = null;
                  return popup.focus();
                }
              };
              scope.clear = function() {
                scope.p = null;
                scope.c = null;
                scope.a = null;
                return scope.d = null;
              };
              scope.submit = function() {
                return popup.hide();
              };
              scope.$watch('p', function(newV) {
                var v, _i, _len, _results;
                if (newV) {
                  _results = [];
                  for (_i = 0, _len = data.length; _i < _len; _i++) {
                    v = data[_i];
                    if (v.p === newV) {
                      _results.push(scope.cities = v.c);
                    }
                  }
                  return _results;
                } else {
                  return scope.cities = [];
                }
              });
              scope.$watch('c', function(newV) {
                var v, _i, _len, _ref, _results;
                if (newV) {
                  _ref = scope.cities;
                  _results = [];
                  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    v = _ref[_i];
                    if (v.n === newV) {
                      _results.push(scope.dists = v.a);
                    }
                  }
                  return _results;
                } else {
                  return scope.dists = [];
                }
              });
              return scope.$watch(function() {
                scope.ngModel = '';
                if (scope.p) {
                  scope.ngModel += scope.p;
                }
                if (scope.c) {
                  scope.ngModel += " " + scope.c;
                }
                if (scope.a) {
                  scope.ngModel += " " + scope.a;
                }
                if (scope.d) {
                  scope.ngModel += " " + scope.d;
                }
                return popup.resize();
              });
            });
          }
        };
    });

	/**
     * 自定义动态显示输入框全部内容指令
     * <input type="text" ng-show-content="12px" />
     */
    viewApp.directive('ngShowContent', function() {
    	return {
            require: 'ngModel',//控制器是指令标签对应的ngModel
            restrict: "EA",//指令作用范围是element或attribute
            link: function(scope, element, attrs) {
            	
            	element.on({ "mouseover" : function(event){
            		
            		var fontSize = "12px";            		
            		if (element.attr("ng-show-content") != "") {
            			fontSize = element.attr("ng-show-content");
            		}
            		if (this.style.fontSize != "") {
            			fontSize = this.style.fontSize;
            		}
            		
            	    var span = document.getElementById("getPxWidth");  
            	    if (span == null) {  
            	        span = document.createElement("span");  
            	        span.id = "getPxWidth";
            	        document.body.appendChild(span);
            	        span.style.visibility = "hidden";
            	        span.style.whiteSpace = "nowrap";  
            	    }
            	    
            	    span.innerText = this.value;  
            	    span.style.fontSize = fontSize;
            		if (span.offsetWidth > this.offsetWidth) {
            			//this._msgbox_value_ = dhtmlx.message(this.value, "info", -1);
            			element.attr("title", this.value);
            		}
            		
            		
                }, "mouseout" : function(event){
                    if (this._msgbox_value_){
                    	//dhtmlx.message.hide(this._msgbox_value_);
                    }
                }});        	
            }
    	}
    });

    viewApp.filter("lztFilter",[function(){
        return function(input,param) {
            console.log("------------------------------------------------- begin dump of custom parameters");
            console.log("input=",input);
            console.log("param(string)=", param);
            var args = Array.prototype.slice.call(arguments);
            console.log("arguments=", args.length);
        }
    }]);

}//)(this, viewApp);