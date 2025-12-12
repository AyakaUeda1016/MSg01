

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import model.Scenario;
import model.ScenarioLogic;

/**
 * Servlet implementation class PrepareServlet
 */
@WebServlet("/prepare")
public class PrepareServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public PrepareServlet() {
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
		ScenarioLogic logic = new ScenarioLogic();
		List<Scenario> list = new ArrayList<>();
		
		if("start".equals(sb)) {
			RequestDispatcher rd = request.getRequestDispatcher("./simulation.jsp");
			//シミュレーション画面にsession.getAttribute→simulation.jspに別途<script>を使ってjsファイルにユーザーIDとシナリオIDを渡します
			rd.forward(request, response);
		}else if("back".equals(sb)) {
			list = logic.findScenario();
			request.setAttribute("LIST", list);
			RequestDispatcher rd = request.getRequestDispatcher("./scenario.jsp");
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
