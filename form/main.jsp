<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@page import="java.util.Enumeration"%>
<%@page import="java.util.HashMap"%>
<%@page import="java.util.Arrays"%>
<%!private static String request2json(HttpServletRequest request) {
		HashMap map = new HashMap();
		StringBuffer sb = new StringBuffer(1024);
		Enumeration paramNames = request.getParameterNames();
		while (paramNames.hasMoreElements()) {
			String paramName = (String) paramNames.nextElement();
			String[] paramValues = request.getParameterValues(paramName);
			sb.append(paramName).append(":");
			if (paramValues.length == 1) {
				sb.append("\"").append(paramValues[0]).append("\"");
			} else {
				sb.append("[").append(Arrays.toString(paramValues)).append("]");
			}
			sb.append(",");
		}
		if (sb.length() > 1) {
			sb.deleteCharAt(sb.length() - 1);
		}
		return sb.toString();
	}%>
<%
	String cp = request.getContextPath();
	String res = cp + "/res";
	session.setAttribute("$FLAG$DEBUG$", Boolean.TRUE);
	boolean flagDebug = true;
	int debugRightWidth = 0;
	int debugBottomHeight = 0;
	if (flagDebug) {
		debugRightWidth = 25;
		debugBottomHeight = 25;
	}
	String jsonParams = request2json(request);
%>
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta http-equiv="X-UA-Compatible" content="IE=EmulateIE11">
<title>涉税事项办理</title>
<link rel="stylesheet" type="text/css" href="<%=res%>/css/abacus/main.css">
<link rel="stylesheet" type="text/css" href="<%=res%>/css/message/message_solid.css">
<script>
    var jsonParams = {<%=jsonParams%>};
    var pathRoot = "<%=cp%>";
    var pathRes = "<%=res%>";
</script>
</head>
<body class="USER">
	<div class="TopHead">
		<div class="LeftPadding">
			<table width="100%" height="60" border="0" cellspacing="0" cellpadding="0">
				<tr>
					<td><div class="HeadTitle">
							<span class="spangs">国税</span> <span class="spanbm">变更税务登记表</span>
						</div></td>
					<td class="areaHeadBtn" align="right">
						<li><a id="btnSave" class="btn btn06" href="javascript:void(0);">保 存</a></li>
						<li><a id="btnVerify" class="btn btn06" href="javascript:void(0);">校 验</a></li>
						<li><a id="btnVeclare" class="btn btn06" href="javascript:void(0);">申 报</a></li>
						<li><a id="btnEdit" class="btn btn06" href="javascript:void(0);">修 改</a></li>
						<li><a id="btnPrint" class="btn btn06" href="javascript:void(0);">打 印</a></li>
						<li><a id="btnExport" class="btn btn06" href="javascript:void(0);">导出报盘</a></li>
						<li><a id="btnDelete" class="btn btn06" href="javascript:void(0);">删除</a></li>
						<li><a id="btnClose" class="btn btn06" href="javascript:void(0);">关 闭</a></li>
						<li><a id="btnChangeMode" class="btn btn06 " href="javascript:void(0);">开发者</a></li>
					</td>
				</tr>
			</table>
		</div>
	</div>
	<div class="TableMain">
		<table width="100%" border="0" cellspacing="0" class="all_table" cellpadding="0">
			<tr>
				<td class="biao_leftmenu" valign="top">
					<div class="MenuNormal">
						<table border="0" cellspacing="0" cellpadding="0">
							<tr>
								<td><div class="SheetMenu">
										<h3>
											报表列表
											<div class="btnfixed">
												<span></span>
											</div>
										</h3>
										<ul id="divSheetlist">
											<li class="active"><a href="#">正在加载表单...</a></li>
										</ul>
									</div></td>
								<td class="close_btn close_btn1"><span><</span></td>
							</tr>
						</table>
					</div>
				</td>
				<td valign="top" width="100%"><iframe id="frmSheet" name="frmSheet" height="100%" width="100%"></iframe></td>
			</tr>
		</table>
	</div>
	<div class='RightEdit' id='divRight'>
		<div class='boxStyle'>
			<h1>
				表单数据模型&nbsp;&nbsp;<font id="lblJpathSelected"></font>
			</h1>
			<input id="inpJpathSelector" type="text" onchange="formDebuging.setDatamodelFilter(this.value)" />
			<div id="divDebugDataView">
				<iframe id="frmDebugDataView" height="100%"></iframe>
			</div>
		</div>
	</div>
	<div class='FootEdit' id='divFootEdit'>
		<h1>
			已装载规则库&nbsp;&nbsp;&nbsp;&nbsp;<input id="txtFormulaSearch" type="text"
				onchange="formDebuging.setFormulaSearch(this.value)" /> <input type="button" value="清空"
				onclick="formDebuging.clickFormulaListClear()" /> ID:&nbsp;<input id="lblFormulaId"
				type="text" readonly="readonly" /> Type:&nbsp;<input id="lblFormulaType" type="text" readonly="readonly" />
			Desc:&nbsp;<input id="lblFormulaDesc" type="text" readonly="readonly"
				onclick="if (this.title) {alert('【错误信息】\n'+this.title);}" />
		</h1>
		<div id="divFormulaList"></div>
		<div id="divFormulaEditor">
			<h1>
				编辑区&nbsp;&nbsp;&nbsp;&nbsp;ID:&nbsp;<input id="txtFormulaId" type="text" />&nbsp;&nbsp;Type:&nbsp;<input
					id="txtFormulaType" type="text" />
			</h1>
			Desc:&nbsp;<input id="txtFormulaDesc" type="text" /><br> Tips:&nbsp;&nbsp;<input id="txtFormulaTips"
				type="text" />
			<textarea id="txtFormulaEditor"></textarea>
			<textarea id="txtFormulaTargetEditor"></textarea>
			<p>
				<input id="btnClearFormula" type="button" value="清空" onclick="formDebuging.clickClearFormula(this, event)" />
				&nbsp;<input id="btnCheckFormula" type="button" value="检查" onclick="formDebuging.clickCheckFormula(this, event)" />
				&nbsp;<input id="btnUpdateFormula" type="button" value="更新" onclick="formDebuging.clickUpdateFormula(this, event)" />
				&nbsp;<input id="btnAppendFormula" type="button" value="新增" onclick="formDebuging.clickAppendFormula(this, event)" />&nbsp;<input
					id="btnEmpty" type="button" value="　　" onclick="" />&nbsp;<input id="btnDeleteFormula" type="button" value="删除"
					onclick="formDebuging.clickDeleteFormula(this, event)" />&nbsp;&nbsp;<input id="btnSave2File" type="button"
					value="保存文件" onclick="formDebuging.clickSave2File(this, event)" style="float: right;" />
			</p>
		</div>
	</div>
	<div class='line' id='line'></div>
	<div class='linefoot' id='linefoot'></div>
	<script src="<%=res%>/js/lib/jquery.min.js"></script>
	<script src="<%=res%>/js/lib/json3.min.js"></script>
	<script src="<%=res%>/js/lib/jsonpath.js"></script>
	<script src="<%=res%>/js/lib/mask.js"></script>
	<script src="<%=res%>/js/abacus/fsjpath.js"></script>
	<script src="<%=res%>/js/abacus/formEngine.js"></script>
	<script src="<%=res%>/js/abacus/formulaFunction.js"></script>
	<script src="<%=res%>/js/abacus/formulaEngine.js"></script>
	<input type="hidden" id="contextPath" value="${pageContext.request.contextPath}"/>
	<script>
	$(function(){
		$("#divSheetlist").find("li:not(.active)").live("click",function(){
			$(this).siblings("li").removeClass("current_selected_BD");
			$(this).addClass("current_selected_BD");
		});
		if(false == flagFormDebuging) {
			$("#btnChangeMode").css("display","none");
		}
	});
	window.console = window.console || {
	    log: $.noop,
	    debug: $.noop,
	    info: $.noop,
	    warn: $.noop,
	    exception: $.noop,
	    assert: $.noop,
	    dir: $.noop,
	    dirxml: $.noop,
	    trace: $.noop,
	    group: $.noop,
	    groupCollapsed: $.noop,
	    groupEnd: $.noop,
	    profile: $.noop,
	    profileEnd: $.noop,
	    count: $.noop,
	    clear: $.noop,
	    time: $.noop,
	    timeEnd: $.noop,
	    timeStamp: $.noop,
	    table: $.noop,
	    error: $.noop
	};
	window.contextPath = $("#contextPath").val();
	window.onload = function(){
		var sbywbm = $("#sbywbm").val();
		if(sbywbm != 'undefined' && sbywbm == 'YBNSRZZS'){
			$("#btnSave").show();
			$("#btnReset").show();
		}
	};
	</script>
	<script src="<%=res%>/js/abacus/viewEvent.js"></script>
	<script src="<%=res%>/js/lib/message.js"></script>
	<%
		if (flagDebug) {
	%>
	<!-- http://dhtmlx.github.io/message/  &  https://github.com/DHTMLX/message -->
	<script src="<%=res%>/js/lib/message.js"></script>
	<script src="<%=res%>/js/abacus/formDebuging.js"></script>
	<%
		}
	%>
</body>
</html>
