

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/growth_record")
public class GrowthRecordServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");

        // ★ どのボタンが押されたか判定
        String action = request.getParameter("action");

        // 🔹 1. 記録詳細画面へ遷移
        if ("details".equals(action)) {
            // 記録IDを取得（任意）
            String recordId = request.getParameter("recordId");

            // JSP に渡す
            request.setAttribute("recordId", recordId);

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
        
        // 3 recordlist画面へ遷移

        // 🔹 4. 初期表示（成長記録画面）
        request.getRequestDispatcher("growth_record.jsp").forward(request, response);
    }
}

