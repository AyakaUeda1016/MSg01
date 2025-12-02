

import java.io.IOException;
import java.util.List;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import model.FeedbackLogic;

/**
 * Servlet implementation class SimulationServlet
 */
@WebServlet("/simulation")
public class SimulationServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public SimulationServlet() {
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
		FeedbackLogic logic = new FeedbackLogic();
		int userid = 0;
		int scenarioid = 0;
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
		
		if(session.getAttribute("USERID")!=null) {
			userid = (Integer)session.getAttribute("USERID");
		}
		
		if(session.getAttribute("SCENARIOID")!=null) {
			scenarioid = (Integer)session.getAttribute("SCENARIOID");
		}
		
		List<String> result = logic.receiveResultforResult(userid, scenarioid);
		
		request.setAttribute("RESULT", result);
		RequestDispatcher rd = request.getRequestDispatcher("./result.jsp");
		rd.forward(request, response);
		
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		doGet(request, response);
	}

}
