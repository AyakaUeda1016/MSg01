package com.kaiwanavi.servlet;

import java.io.IOException;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

	@WebServlet("/register")
	public class RegisterServlet extends HttpServlet {
	    private static final long serialVersionUID = 1L;

	    @Override
	    protected void doPost(HttpServletRequest request, HttpServletResponse response)
	            throws ServletException, IOException {

	        request.setCharacterEncoding("UTF-8");

	        // ▼ JSP から送られてきたデータを受け取る
	        String username = request.getParameter("username");
	        String id = request.getParameter("id");
	        String birthdate = request.getParameter("birthdate");
	        String gender = request.getParameter("gender");
	        String password = request.getParameter("password");

	        // ▼ 必須チェック（必要なら拡張） 
	        if (username == null || username.isEmpty() ||
	            id == null || id.isEmpty() ||
	            password == null || password.isEmpty()) {

	            request.setAttribute("errorMessage", "入力されていない項目があります。");
	            request.getRequestDispatcher("register.jsp").forward(request, response);
	            return;
	        }

	        // ▼ 本来は DB に保存する（今は仮登録）
	        // TODO: DB 保存処理を入れる（必要なら書きます）

	        // ▼ セッションにユーザー名を保存してホーム画面へ
	        request.getSession().setAttribute("id", id);

	        // ▼ ホーム画面へ遷移
	        request.getRequestDispatcher("home.jsp").forward(request, response);
	    }
	

	

}
