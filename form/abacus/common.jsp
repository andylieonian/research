<%@ page language="java" contentType="text/json; charset=UTF-8" pageEncoding="UTF-8"%>
<%@page import="java.io.*"%>
<%@page import="java.util.*"%>
<%@page import="java.text.SimpleDateFormat"%>
<%!private static final String FORM_PATH = "/form/";
	private static final String PARAM_YWDM = "sbywdm";
	private static final String FILENAME_RULE = "rule.json";
	private static final String FILENAME_DATA = "data.json";
	private static final String FILENAME_TEMP_RULE = "temp_" + FILENAME_RULE;

	private static final Object SYNC_SAVING_RULE_FILE = "Synchronizer for rule-file saving!";

	/**
	 * Common: Get the directory of form's sheets according to parameter YWDM.
	 */
	private static File getSheetsDir(HttpServletRequest request, String ywdm) {
		String pathForm = request.getSession().getServletContext().getRealPath(FORM_PATH);
		File dirForm = new File(pathForm);
		if (!dirForm.exists() || !dirForm.isDirectory()) {
			throw new RuntimeException(
					"Get realpath of /form/ failed! Cann't locate the sheets." + "获取/form/实际路径失败，无法找到表单所在目录。");
		}
		File dirSheets = new File(pathForm + "/" + ywdm);
		if (ywdm == null || ywdm.length() <= 0) {
			throw new RuntimeException("HttpRequest's parameter [" + PARAM_YWDM + "] not founded! "
					+ "缺少HttpRequest参数：业务代码[" + PARAM_YWDM + "]。");
		}
		if (!dirSheets.exists() || !dirSheets.isDirectory()) {
			throw new RuntimeException("Get realpath of /form/" + ywdm + "/ failed! Cann't locate the sheets."
					+ "获取/form/" + ywdm + "/实际路径失败，无法找到表单所在目录。");
		}
		return dirSheets;
	}

	/**
	 * Common: Export specify file into JspWriter.
	 */
	private static void exportFile2Writer(File file, Writer out) {
		if (!file.exists() || !file.isFile()) {
			throw new RuntimeException("Get [" + file.getAbsolutePath() + "] failed, not founded.");
		}
		FileInputStream fis = null;
		try {
			fis = new FileInputStream(file);
			BufferedReader br = new BufferedReader(new InputStreamReader(fis, "UTF-8"));
			String line;
			while ((line = br.readLine()) != null) {
				out.write(line);
			}
			br.close();
		} catch (Exception ex) {
			throw new RuntimeException("Get " + FILENAME_RULE + " failed: " + ex);
		} finally {
			if (fis != null) {
				try {
					fis.close();
				} catch (IOException ioe) {
					// Ignore.
				}
			}
		}
	}

	/**
	 * getFormData.jsp
	 */
	private static void exportFormData(HttpServletRequest request, Writer out) {
		String ywdm = request.getParameter(PARAM_YWDM);
		// Searching the directory contains sheets.
		File dirSheets = getSheetsDir(request, ywdm);
		File fileData = new File(dirSheets, FILENAME_DATA);
		// Export file
		exportFile2Writer(fileData, out);
	}

	/**
	 * getRuleBase.jsp
	 */
	private static void exportRuleBase(HttpServletRequest request, Writer out) {
		String ywdm = request.getParameter(PARAM_YWDM);
		// Searching the directory contains sheets.
		File dirSheets = getSheetsDir(request, ywdm);
		File fileRule = new File(dirSheets, FILENAME_RULE);
		// Export file
		exportFile2Writer(fileRule, out);
	}

	/**
	 * getSheetList.jsp
	 */
	private static String getSheetList(HttpServletRequest request) {
		String ywdm = request.getParameter(PARAM_YWDM);
		// Searching the directory contains sheets.
		File dirSheets = getSheetsDir(request, ywdm);
		File files[] = dirSheets.listFiles(new FilenameFilter() {
			public boolean accept(File f, String name) {
				return name.endsWith(".html");
			}
		});
		// Reading sheet's title.
		TreeMap map = new TreeMap();
		for (int i = 0; i < files.length; i++) {
			String title = getHeadTitle(files[i]);
			String name = files[i].getName();
			String sort = "";
			if (name.indexOf('$') > 0) {
				sort = name.substring(0, name.indexOf('$'));
			}
			if (title == null) {
				name = title;
			} else {
				if (title.indexOf('$') > 0) {
					sort = title.substring(0, title.indexOf('$'));
					title = title.substring(title.indexOf('$') + 1);
				}
			}
			String[] tmp = { name, title };
			sort += name;
			map.put(sort, tmp);
		}

		// Join names to JSON.
		String cp = request.getContextPath() + FORM_PATH + ywdm + "/";
		StringBuffer sb = new StringBuffer(1024);
		sb.append('[');
		Iterator it = map.entrySet().iterator();
		while (it.hasNext()) {
			Map.Entry e = (Map.Entry) it.next();
			String[] pair = (String[]) e.getValue();
			sb.append("{\"name\":\"").append(pair[1]).append("\",");
			sb.append("\"url\":\"").append(cp).append(pair[0]).append("\"}");
			if (it.hasNext()) {
				sb.append(',');

			}
		}
		sb.append(']');
		return sb.toString();
	}

	private static String getHeadTitle(File fileSheet) {
		String TITLE_START = "<title>";
		String TITLE_END = "</title>";
		Reader fr = null;
		try {
			fr = new InputStreamReader(new FileInputStream(fileSheet), "UTF-8");
			BufferedReader reader = new BufferedReader(fr);
			StringBuffer sb = new StringBuffer();
			String line;
			boolean flag = false;
			while (null != (line = reader.readLine())) {
				line = line.toLowerCase();
				if (line.indexOf(TITLE_START) >= 0) {
					flag = true;
				}
				if (flag) {
					sb.append(line.trim());
				}
				if (line.indexOf(TITLE_END) >= 0) {
					break;
				}
				if (sb.length() > 1024 * 128) {
					return null;
				}
			}
			if (flag) {
				int posStart = sb.indexOf(TITLE_START);
				int posEnd = sb.indexOf(TITLE_END);
				String ret = sb.substring(posStart + TITLE_START.length(), posEnd);
				ret = ret.trim();
				return ret;
			}
		} catch (Exception ex) {
			ex.printStackTrace();
		} finally {
			if (fr != null) {
				try {
					fr.close();
				} catch (Exception ex) {
				}
			}
		}
		return null;
	}

	private static void showParameters(HttpServletRequest request) {
		Enumeration pNames = request.getParameterNames();
		while (pNames.hasMoreElements()) {
			String name = (String) pNames.nextElement();
			String value = request.getParameter(name);
			System.out.println(name.substring(0, 20) + " = " + value.substring(0, 20));
		}
	}

	private static int saveFormulas2File(HttpServletRequest request) {
		FileOutputStream osFile = null;
		try {
			synchronized (SYNC_SAVING_RULE_FILE) {
				// 1. Save all post into temp file.
				InputStream isPost = request.getInputStream(); // Notice! Must be first line.
				String ywdm = request.getParameter(PARAM_YWDM); // Notice! Must after getInputStream.
				File dirSheets = getSheetsDir(request, ywdm);
				File fileTempRule = new File(dirSheets, FILENAME_TEMP_RULE);
				fileTempRule.delete();
				osFile = new FileOutputStream(fileTempRule);
				byte[] buffer = new byte[16 * 1024];
				int cnt = 0, t = 0;
				while ((t = isPost.read(buffer)) >= 0) {
					osFile.write(buffer, 0, t);
					cnt += t;
				}
				isPost.close();
				osFile.close();
				// 2. Rename the old rules file for backup.
				File fileRule = new File(dirSheets, FILENAME_RULE);
				if (!fileRule.exists()) {
					throw new RuntimeException("Original rule-file not exist!");
				}
				if (!fileRule.isFile()) {
					throw new RuntimeException("Original rule-file's name isn't a file!");
				}
				File fileBackup = new File(dirSheets, "bak_"
						+ new SimpleDateFormat("yyyyMMdd_HHmm").format(new Date().getTime()) + "_" + FILENAME_RULE);
				fileBackup.delete();
				if (!fileRule.renameTo(fileBackup)) {
					throw new RuntimeException("Rename original rule-file into backup failed!");
				}
				// 3. Rename the temp rules file into rules file.
				if (!fileTempRule.renameTo(new File(dirSheets, FILENAME_RULE))) {
					throw new RuntimeException("Rename temp rule-file into useful failed!");
				}
				// 4. Clean up
				System.out.println("Save formulas done, " + cnt + " bytes writed.");
				return cnt;
			}
		} catch (Exception ex) {
			ex.printStackTrace();
			throw new RuntimeException(ex);
		} finally {
			if (osFile != null) {
				try {
					osFile.close();
				} catch (Exception ex) {
				}
			}
		}
	}%>
<%
	Boolean tmp = (Boolean) session.getAttribute("$FLAG$DEBUG$");
	boolean flagDebug = (tmp != null) ? tmp.booleanValue() : false;
%>