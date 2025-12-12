

import java.io.IOException;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

/**
 * Servlet implementation class SenalioServlet
 */
@WebServlet("/scenario")
public class ScenarioServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public ScenarioServlet() {
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
		String strNo = null;
		int scenarioid = 0;
		if(request.getParameter("scenarioId")!=null) {
			strNo = request.getParameter("scenarioId");
			scenarioid = Integer.parseInt(strNo);
		}
		
		String sb = request.getParameter("sb");
		
		System.out.println(scenarioid);
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
		
		if(sb.equals("decide")) {
			session.setAttribute("SCENARIOID",scenarioid);
			RequestDispatcher rd = request.getRequestDispatcher("./prepare.jsp");
			rd.forward(request, response);
		}else if(sb.equals("home")) {
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
