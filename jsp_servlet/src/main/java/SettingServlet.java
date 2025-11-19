

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/settings")
public class SettingServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");

        String action = request.getParameter("action");

        // ★ 1. マイク/音量設定へ
        if ("mic".equals(action)) {
            request.getRequestDispatcher("mic_settings.jsp")
                   .forward(request, response);
            return;
        }

        // ★ 2. アカウント詳細へ
        if ("account".equals(action)) {
            request.getRequestDispatcher("account_details.jsp")
                   .forward(request, response);
            return;
        }

        // ★ 3. ホーム画面へ戻る
        if ("home".equals(action)) {
            response.sendRedirect("home.jsp");
            return;
        }

        // ★ 4. 初期表示（settings.jsp）
        request.getRequestDispatcher("settings.jsp")
               .forward(request, response);
    }
}
