package dao.impl;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

import dao.FeedBackDAO;
import model.Feedback;

public class FeedbackDAOImpl implements FeedBackDAO{
	
	// データベース接続情報
		private static final String DB_NAME = "msg01test";
		private static final String PROPATIES = "?characterEncoding=utf-8";
		private static final String URL = "jdbc:mysql://localhost:3306/" + DB_NAME + PROPATIES;
		private static final String USER = "root";
		private static final String PASSWORD = "";
			
		// データベース接続を取得するヘルパーメソッド
		private Connection getConnection() throws SQLException {
			return DriverManager.getConnection(URL, USER, PASSWORD);
		}

	@Override
	public String findResultforgrowthrecord(Feedback feedback) {
		String resultdata = null;
		String sql = "SELECT result_data FROM feedback WHERE member_id = ? AND scenario_id = ? AND finish_date = ?;";
	    Connection con = null;
	    PreparedStatement prst = null;
	    ResultSet rs = null;
	    try {
	    	con = getConnection();
	        prst = con.prepareStatement(sql);
	        prst.setInt(1, feedback.getUserid());
	        prst.setInt(2, feedback.getScenarioid());
	        prst.setString(3, feedback.getFinishdate());
	        rs = prst.executeQuery();

	        if (rs.next()) {
	        	resultdata = rs.getString("result_data");
	        }
	     } catch (SQLException e) {
	        e.printStackTrace();
	     } finally {
	        try {
	            if (rs != null) rs.close();
	            if (prst != null) prst.close();
	            if (con != null) con.close();
	        } catch (Exception e) {
	            e.printStackTrace();
	        }
	     }
		return resultdata;
	}


	@Override
	public String findConversationlogforgrowthrecord(Feedback feedback) {
		String conversationdata = null;
		String sql = "SELECT conversation_log FROM feedback WHERE member_id = ? AND scenario_id = ? AND finish_date = ?;";
		Connection con = null;
	    PreparedStatement prst = null;
	    ResultSet rs = null;
	    try {
	    	con = getConnection();
	        prst = con.prepareStatement(sql);
	        prst.setInt(1, feedback.getUserid());
	        prst.setInt(2, feedback.getScenarioid());
	        prst.setString(3, feedback.getFinishdate());
	        rs = prst.executeQuery();

	        if (rs.next()) {
	        	conversationdata = rs.getString("conversation_log");
	        }
	    } catch (SQLException e) {
	        e.printStackTrace();
	    } finally {
	        try {
	        	if (rs != null) rs.close();
	            if (prst != null) prst.close();
	            if (con != null) con.close();
	        } catch (Exception e) {
	            e.printStackTrace();
	        }
	     }
		return conversationdata;
	}
		
	@Override
	public String findResult(Feedback feedback) {
		String resultdata = null;
		String sql = "SELECT result_data FROM feedback WHERE member_id = ? AND scenario_id = ? ORDER BY finish_date DESC LIMIT 2;";
		Connection con = null;
		PreparedStatement prst = null;
		ResultSet rs = null;
		try {
			con = getConnection();
			prst = con.prepareStatement(sql);
			prst.setInt(1, feedback.getUserid());
			prst.setInt(2, feedback.getScenarioid());
			rs = prst.executeQuery();
			while(rs.next()) {
				resultdata = rs.getString("result_data");
			}
		}catch(SQLException e) {
			e.printStackTrace();
		}finally {
			try {
				if(rs != null) {
					rs.close();
				}
				if(prst != null) {
					prst.close();
				}
				if(con != null) {
					con.close();
				}
			}catch(Exception e) {
				e.printStackTrace();
			}
		}
		return resultdata;
	}

	@Override
	public String findConversationlog(Feedback feedback) {
		String conversationdata = null;
		String sql = "SELECT conversation_log FROM feedback WHERE member_id = ? AND scenario_id = ? ORDER BY finish_date DESC LIMIT 1;";
		Connection con = null;
		PreparedStatement prst = null;
		ResultSet rs = null;
		try {
			con = getConnection();
			prst = con.prepareStatement(sql);
			prst.setInt(1, feedback.getUserid());
			prst.setInt(2, feedback.getScenarioid());
			rs = prst.executeQuery();
			
			while(rs.next()) {
				conversationdata = rs.getString("conversation_log");
			}
		}catch(SQLException e) {
			e.printStackTrace();
		}finally {
			try {
				if(rs != null) {
					rs.close();
				}
				if(prst != null) {
					prst.close();
				}
				if(con != null) {
					con.close();
				}
			}catch(Exception e) {
				e.printStackTrace();
			}
		}
		return conversationdata;
	}

	@Override
	public List<String> MakeGraphData(Feedback feedback) {
		List<String> graphdata = null;
		// グラフデータに必要なデータをとってきて必要なら生成する。
		return graphdata;
	}

	@Override
	public String MakeRankData(Feedback feedback) {
		// TODO 自動生成されたメソッド・スタブ
		return null;
	}

}
