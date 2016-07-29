/**
 * Created by Administrator on 2016-05-20.
 */
function RegEvent() {
    if(typeof RegEvent.prototype._inited == "undefined") {
        var regEvent = this;
        RegEvent.prototype.initialize = function() {

            /**提交表单,保存json对象到服务端**/
            $("#btnSave").on("click", function () {
/*                var drowMap = {};
                $("body").mask("校验数据中，请稍候...");
                var tip = regEvent.verifyAll();
                if(!tip){
                    Message.errorInfo({
                        title : "错误", message : "表格存在填写错误的数据，请检查"
                    });
                	//dhtmlx.message("表格存在填写错误的数据，请检查", "error", 2000);
                    $("body").unmask();
                    return ;
                }*/
                $("body").mask("正在保存数据，请稍候...");
                $.ajax({
                    type : "POST",
                    url : "saveData.do?djxh="+$("#djxh").val()+"&sbywbm="+$("#sbywbm").val()+"&bz="+$("#bzz").attr("value"),
                    dataType:"json",
                    contentType:"application/json",
                    data:JSON.stringify(formData),
                    success:function(data){
                        if (data.flag) {
/*                            Message.succeedInfo({title : "提示", message : "保存成功。",
                                handler : function() {

                                }
                        	
                            });*/
                        	dhtmlx.message("保存成功。", "info", 2000);
                        } else {
/*                            Message.errorInfo({
                                title : "错误", message : data.message
                            });*/
                        	dhtmlx.message(data.message, "error", 2000);
                        }
                        $("body").unmask();
                    },
                    error:function(){
                        $("body").unmask();
/*                        Message.errorInfo({
                            title : "错误", message : "保存失败，请稍侯再试。"
                        });*/
                        dhtmlx.message("保存失败，请稍侯再试。", "error", 2000);
                    }
                });
            });
            /** 绑定申报按钮动作 **/
            $("#btnVeclare").on("click", function () {

                $("body").mask("校验数据中，请稍候...");
                // 校验所有数据
                var tip = regEvent.verifyAll();
                if(!tip){
/*                    Message.errorInfo({
                        title : "错误", message : "表格存在填写错误的数据，请检查"
                    });*/
                	//dhtmlx.message("表格存在填写错误的数据，请检查。", "error", 2000);
                    $("body").unmask();
                    return ;
                }

                var sbywbm = $("#sbywbm").val();
                if (sbywbm === "YBNSRZZS1") {
                    $("body").mask("正在提交申报，请稍候...");
                    //增值税一般纳税人申报，调用接口申报
                    $.ajax({
                        type : "POST",
                        url : "submitSb.do?djxh="+$("#djxh").val()+"&sbywbm="+$("#sbywbm").val(),
                        dataType:"json",
                        contentType:"application/json",
                        data:JSON.stringify(formData),
                        success:function(data){
                            regEvent.refreshOpener();
                            $("body").unmask();
                            if (data.flag == true) {
/*                                Message.succeedInfo({title : "提示", message : "申报成功。",
                                    handler : function() {
                                        window.opener=null;
                                        window.open('','_self');
                                        window.close();
                                    }
                                });*/
                            	dhtmlx.message("申报成功。", "info", 2000);
                            } else if (data.code == "ycsbd") {
                                var html = "<tr class='tit'>";
                                html += "<td width='50%'>申报内容 </td>";
                                html += "<td width='8%'>抄报认证结果 </td>";
                                html += "<td width='8%'>申报金额</td>";
                                html += "</tr>";
                                //var msg = "";
                                var ycsbd = data.ywsj.sBWbcsHqbdxxJgVO.sBWbcsHqbdxxJgNrGrid.sBWbcsHqbdxxJgNrGridlb;
                                for (var i=0;i<ycsbd.length;i++) {
                                    var item = ycsbd[i];
                                    if (i%2 == 0) {
                                        html += "<tr class='bgsty1'>";
                                    } else {
                                        html += "<tr class='bgsty2'>";
                                    }
                                    html += "<td>"+item.sbnr+"</td>";
                                    html += "<td align='right'>"+item.wbje+"</td>";
                                    html += "<td align='right'>"+item.sbje+"</td>";
                                    //msg += "申报内容:" + item.sbnr + ",抄报认证结果:" + item.wbje + "申报金额:" + item.sbje + "  ";
                                }
                                $("#ycsbdTbody").html(html);
                                var options = {};
                                options["animation"] = "fade";
                                $('#return_info').reveal(options);
                            } else {
                                $("body").unmask();
/*                                Message.errorInfo({
                                    title : "错误", message : data.message
                                });*/
                                dhtmlx.message(data.message, "error", 2000);
                            }
                        },
                        error:function(){
                            regEvent.refreshOpener();
                            $("body").unmask();
/*                            Message.errorInfo({
                                title : "错误", message : "申报失败，请稍侯再试。"
                            });*/
                            dhtmlx.message("申报失败，请稍侯再试。", "error", 2000);
                        }
                    });
                } else {
                    //其他税费种申报，通过PDF申报
                    $.ajax({
                        type : "POST",
                        url : "ywsb.do",
                        dataType:"json",
                        data: {"djxh": $("#djxh").val(), "sbywbm": $("#sbywbm").val(),"dzbdbmList":$("#dzbdbmList").val(), "jsonData":encodeURI(JSON.stringify(formData))},
                        success:function(data){
                            if (data.flag == "ok") {
                                if (data.openPdf == "1") {
                                    var url = "openPdf.do?targetName=" + data.targetName
                                        + "&djxh=" + $("#djxh").val()
                                        + "&sbywbm=" + $("#sbywbm").val()
                                        + "&nsqj=" + $("#nsqj").val()
                                        + "&sssqQ=" + $("#sssqQ").val()
                                        + "&sssqZ=" + $("#sssqZ").val()
                                        + "&zfssb=" + $("#zfssb").val()
                                        + "&zfsuuid=" + $("#zfsuuid").val();
                                    //window.open(url);
                                    window.location.href = url;
                                }
                            } else {
/*                                Message.errorInfo({
                                    title : "错误", message : data.errMsg
                                });*/
                            	dhtmlx.message( data.errMsg, "error", 2000);
                            }
                        },
                        error:function(){
/*                            Message.errorInfo({
                                title : "错误", message : "请求失败，请稍侯再试。"
                            });*/
                        	dhtmlx.message("请求失败，请稍侯再试。", "error", 2000);
                        }
                    });
                }

            });
            /**
             * 校验按钮注册
             */
            $("#btnVerify").on("click", function () {
                var Variable = regEvent.verifyAll();
                if(Variable == true) {
/*                    Message.succeedInfo({title : "提示", message : "校验通过，可申报。",
                        handler : function() {}
                    });*/
                	//dhtmlx.message("校验通过，可申报。", "info", 2000);
                } else {
/*                    Message.errorInfo({
                        title : "错误", message : "校验失败，请检查。",
                        handler : function() {}
                    });*/
                	//dhtmlx.message("校验失败，请检查。", "error", 2000);
                }

            });
            /**
             * 打印按钮
             */
            $("#btnPrint").on("click", function () {
                window.frames["frmSheet"].window.focus();
                window.frames["frmSheet"].window.print();
            });
            /**
             * 关闭按钮注册
             */
            $("#btnClose").on("click", function () {
                Message.confirmInfo({title:"提示",message:"确定关闭？",handler:function(tp){
                    if(tp=="ok"){
                        window.opener=null;
                        window.open('','_self');
                        window.close();
                    }
                }});
            });
        }
        /**
         * 校验所有
         */
        RegEvent.prototype.verifyAll = function() {
            var _variable = true;
            var index = 0;
            var _arr = [];
            var _tips = "";
            $.each(formulaEngine.idxVariable2NoPass, function(jpath, idxVariable2NoPass) {
                console.log("-------------" + jpath);
                $.each(idxVariable2NoPass, function(id,FormulaObject) {
                    //TODO 后续对校验不通过附表做提示，单元格的在切换附表时会自行检查
                    //console.log("-----------id----" + id);
                    //console.log("-----------tips----" + FormulaObject.tips);
                    if($.inArray(id,_arr) == -1) {
                        if(index < 3) {
                            _tips += FormulaObject.tips+"<br/>";
                            _arr.push(id);
                            index++;
                        }
                    }
                });
                _variable = false;
            });
            if(!_variable) {
                dhtmlx.message(_tips, "error", 20000);
            }
            return _variable;
        }
        /**
         * 申报后刷新父窗口
         */
        RegEvent.prototype.refreshOpener = function() {
            if (window.opener != undefined && typeof(eval(window.opener.cx))=="function") {
                window.opener.cx();
            }
        }
    }
}

$(function() {
    var regEvent = new RegEvent();
    regEvent.initialize();
});