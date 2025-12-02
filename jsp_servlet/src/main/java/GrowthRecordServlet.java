

import java.io.IOException;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import model.FeedbackLogic;
import model.Scenario;
import model.ScenarioLogic;

@WebServlet("/growth_record")
public class GrowthRecordServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");
        ScenarioLogic slogic = new ScenarioLogic();
        FeedbackLogic flogic = new FeedbackLogic();
        
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
        

        // ★ どのボタンが押されたか判定
        String action = request.getParameter("action");

        // 🔹 1. 記録詳細画面へ遷移
        if ("details".equals(action)) {
        	String strscenarioid = request.getParameter("recordId") ;
        	int scenarioid = Integer.parseInt(strscenarioid);
            String finishdate = request.getParameter("finishdate");
            String result = flogic.receiveResultforGrowth(userid, scenarioid, finishdate);
            
            // JSP に渡す
            session.setAttribute("SCENARIOID", scenarioid);
            session.setAttribute("FINISHDATE", finishdate);
            request.setAttribute("RESULT", result);

            // 詳細画面へ
            request.getRequestDispatcher("growth_record_details.jsp")
                   .forward(request, response);
            return;
        }

        // 🔹 2. ホームへ戻る
        if ("home".equals(action)) {
            response.sendRedirect("home.jsp");
            return;
        }
        
        //3. グラフ画面に移動する
        if("list".equals(action)) {
        	//いままでの結果のJSONファイルをとってくる処理を行う
        	response.sendRedirect("record_list.jsp");
            return;
        }

        // 🔹 4.初期表示（成長記録画面）
        List<Scenario> list = slogic.findAllsimulation(userid);
        if(session.getAttribute("SCENARIOID")!=null) {
        	session.removeAttribute("SCENARIOID");
        }
        if(session.getAttribute("FINISHDATE")!=null) {
        	session.removeAttribute("FINISHDATE");
        }
        request.setAttribute("LIST", list);
        request.getRequestDispatcher("growth_record.jsp").forward(request, response);
    }
}

