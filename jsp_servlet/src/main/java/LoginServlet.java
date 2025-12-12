

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

@WebServlet("/login")
public class LoginServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");

        String strid = request.getParameter("id");
        String password = request.getParameter("password");

        // ▼ 仮の認証ロジック（必要に応じて DB などに変更）
        if (strid == null || password == null) {
            response.sendRedirect("login.jsp");
            return;
        }
        
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
        
        
        // 例：ID=test、PW=1234 の場合ログイン成功
        if ("1".equals(strid) && "pass".equals(password)) {
        	int id = Integer.parseInt(strid);
            session.setAttribute("USERID", id);

            // ★ ログイン成功 → home.jsp へ遷移
            request.getRequestDispatcher("home.jsp").forward(request, response);
        } else {

            // ★ ログイン失敗 → register.jsp へ遷移（あなたの要望通り）
            request.setAttribute("loginError", "ログインできません");
            request.getRequestDispatcher("login.jsp").forward(request, response);
        }
    }
}
