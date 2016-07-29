<%@ include file="common.jsp"%>
<%
	String jsonSheetList = "{}";
	if (flagDebug) {
		jsonSheetList = getSheetList(request);
	} else {
		//TODO: Call service to get sheetlist
		throw new RuntimeException("[getSheetList.jsp] Not implements yet!");
	}
	//Thread.sleep(1000); // For loading tested.
	out.println(jsonSheetList);
%>