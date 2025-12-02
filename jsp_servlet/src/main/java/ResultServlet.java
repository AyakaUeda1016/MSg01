

import java.io.IOException;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import model.FeedbackLogic;

/**
 * Servlet implementation class ResultServlet
 */
@WebServlet("/result")
public class ResultServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public ResultServlet() {
        super();
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		//response.getWriter().append("Served at: ").append(request.getContextPath());
		request.setCharacterEncoding("UTF-8");
		String sb = request.getParameter("sb");
		String log = null;
		//List<String> loglist = null;
		String returnurl = null;
		String finishdate = null;
		FeedbackLogic logic = new FeedbackLogic();
		ObjectMapper mapper = new ObjectMapper();
		System.out.println(sb);
		
		/**セッションの開始(セッションを使うときは必ず書く)**/
		HttpSession session = request.getSession(false);
		/*
		 * request.getSession(false);
		 * セッションが存在していなければnullを返す
		 * セッションがあるかないか判断するために使用
		 */
		if(null == session) {
			session = request.getSession(true);
			/*
			 * request.getSession(true);
			 * セッションを新しく発行する
			 */
		}
		
		int userid = (Integer)session.getAttribute("USERID");
		int scenarioid = (Integer)session.getAttribute("SCENARIOID");
		
		if(sb.equals("log")) {
			log = logic.receiveConvasationforResult(userid, scenarioid);
			returnurl = "result?sb=result";
			if (log == null || log.isEmpty()) {
			    log = "[]";
			}
			// JSON 文字列を Jackson の JsonNode に変換
			JsonNode rootNode = mapper.readTree(log);

			// conversations 配列だけを取り出して文字列化
			JsonNode conversationsNode = rootNode.get("conversations");
			String conversationsJsonOnlyArray = mapper.writeValueAsString(conversationsNode);

			// JSP に渡す
			request.setAttribute("CONVERSATION", conversationsJsonOnlyArray);
			request.setAttribute("RETURNURL", returnurl);
			RequestDispatcher rd = request.getRequestDispatcher("./log.jsp");
			rd.forward(request, response);
		}else if(sb.equals("log_growth")) {
			finishdate = (String)session.getAttribute("FINISHDATE");
			log = logic.receiveConvasationforGrowth(userid, scenarioid, finishdate);
			returnurl = "growth_record?action=details&recordId=" + scenarioid + "&finishdate=" + finishdate;
			if (log == null || log.isEmpty()) {
			    log = "[]";
			}
			// JSON 文字列を Jackson の JsonNode に変換
			JsonNode rootNode = mapper.readTree(log);

			// conversations 配列だけを取り出して文字列化
			JsonNode conversationsNode = rootNode.get("conversations");
			String conversationsJsonOnlyArray = mapper.writeValueAsString(conversationsNode);

			// JSP に渡す
			request.setAttribute("CONVERSATION", conversationsJsonOnlyArray);
			request.setAttribute("RETURNURL", returnurl);
			RequestDispatcher rd = request.getRequestDispatcher("./log.jsp");
			rd.forward(request, response);
		}else if(sb.equals("result")) {
			log = logic.receiveResultforResult(userid, scenarioid);
			request.setAttribute("RESULT", log);
			RequestDispatcher rd = request.getRequestDispatcher("./result.jsp");
			rd.forward(request, response);
		}else if(sb.equals("home")) {
			session.removeAttribute("SCENARIOID");
			RequestDispatcher rd = request.getRequestDispatcher("./home.jsp");
			rd.forward(request, response);
		}
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		doGet(request, response);
	}

}
