<%@ include file="common.jsp"%>
<%
	String jsonRule = "{}";
	if (flagDebug) {
		exportRuleBase(request, out);
	} else {
		//TODO: Call service to get rule from rule base.
		throw new RuntimeException("[getRuleBase.jsp] Not implements yet!");
	}
%>