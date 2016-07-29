<%@ include file="common.jsp"%>
<%
	int size = saveFormulas2File(request);
%>
{"retcode":0, "size": <%= size%>}
