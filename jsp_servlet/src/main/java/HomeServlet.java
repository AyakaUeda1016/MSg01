

import java.io.IOException;
import java.util.List;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import model.Scenario;
import model.ScenarioLogic;

/**
 * Servlet implementation class HomeServlet
 */
@WebServlet("/home")
public class HomeServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public HomeServlet() {
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
		System.out.println(sb);
		ScenarioLogic logic = new ScenarioLogic();
		String strid = null;
		int userid = 0;
		
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
		
		if(session.getAttribute("USERID")!= null) {
			userid = (Integer)session.getAttribute("USERID");
		}
		
		if(sb.equals("scenario")) {
			List<Scenario> list = logic.findScenario();
			request.setAttribute("LIST", list);
			RequestDispatcher rd = request.getRequestDispatcher("./scenario.jsp");
			rd.forward(request, response);
		}else if(sb.equals("growth_record")) {
			List<Scenario> list = logic.findAllsimulation(userid);
			request.setAttribute("LIST", list);
			RequestDispatcher rd = request.getRequestDispatcher("./growth_record.jsp");
			rd.forward(request, response);
		}else if(sb.equals("setting")) {
			RequestDispatcher rd = request.getRequestDispatcher("./settings.jsp");
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
