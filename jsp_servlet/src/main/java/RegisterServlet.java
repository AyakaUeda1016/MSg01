
import java.io.IOException;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import model.MemberLogic;

	@WebServlet("/register")
	public class RegisterServlet extends HttpServlet {
	    private static final long serialVersionUID = 1L;

	    @Override
	    protected void doPost(HttpServletRequest request, HttpServletResponse response)
	            throws ServletException, IOException {

	        request.setCharacterEncoding("UTF-8");

	        // ▼ JSP から送られてきたデータを受け取る
	        String username = request.getParameter("username");
	        String sb = request.getParameter("sb");
	        int userid = 0;
	        MemberLogic logic = new MemberLogic();
	        
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

	        
	        

	        if("register".equals(sb)) {
	        	// ▼ 必須チェック（必要なら拡張） 
	        	if (username == null || username.isEmpty()) {
		            request.setAttribute("errorMessage", "名前が入力されていません");
		            request.getRequestDispatcher("register.jsp").forward(request, response);
		            return;
		        }
	        	// ▼ 本来は DB に保存する（今は仮登録）
		        userid = logic.insertMember(username);
		        

		        // ▼ セッションにユーザー名を保存してホーム画面へ
		        session.setAttribute("USERID", userid);

		        // ▼ ホーム画面へ遷移
		        request.getRequestDispatcher("./home?sb=scenario").forward(request, response);
	        }else if("back".equals(sb)) {
	        	request.getRequestDispatcher("./home?sb=home").forward(request, response);
	        }
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
			
			if(sb.equals("register")) {
				RequestDispatcher rd = request.getRequestDispatcher("./register.jsp");
				rd.forward(request, response);
			}
			
		}
	

	

}
