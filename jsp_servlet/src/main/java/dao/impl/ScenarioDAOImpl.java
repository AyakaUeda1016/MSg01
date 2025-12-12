package dao.impl;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import dao.ScenarioDAO;
import model.Scenario;

public class ScenarioDAOImpl implements ScenarioDAO{
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
	public List<Scenario> findAllScenario(){
		List<Scenario> list = new ArrayList<>();
		String sql = "SELECT id, title, description, imagelink FROM scenario;";
		Connection con = null;
		PreparedStatement ps = null;
		ResultSet rs = null;
		try {
			con = getConnection();
			ps = con.prepareStatement(sql);
			rs = ps.executeQuery();
		   
			while (rs.next()) {
				Scenario s = new Scenario();
				s.setScenarioid(rs.getInt("id"));
				s.setTitle(rs.getString("title"));
				s.setDescription(rs.getString("description"));
				s.setImagelink(rs.getString("imagelink"));
				list.add(s);
			}
		} catch (SQLException e) {
			 System.err.println(e.getMessage());
		} finally {
			 try {
				 	if (rs != null) {
				 		rs.close();
				 	}
				 	if (ps != null) {
				 		ps.close();
				 	}
				 	if (con != null) {
				 		con.close();
				 	}
			 } catch (Exception e) {
				 System.err.println(e.getMessage());
			 }
		  }
		return list;
	}
	
	@Override
	public List<Scenario> findAllSimulation(int userid){
		 List<Scenario> scenarioList = new ArrayList<>();
		    // ユーザーが完了したシナリオを取得するクエリ
		    String sql = "SELECT s.id AS scenario_id, s.title, s.imagelink, f.finish_date " +
		                 "FROM scenario s " +
		                 "INNER JOIN feedback f ON s.id = f.scenario_id " +
		                 "WHERE f.member_id = ? " +
		                 "ORDER BY f.finish_date DESC";
		    Connection conn = null;
		    PreparedStatement pstmt = null;
		    ResultSet rs = null;
		    
		    try  {
		    	conn = getConnection();
		    	pstmt = conn.prepareStatement(sql);
		        pstmt.setInt(1, userid);
		        rs = pstmt.executeQuery();
		        while (rs.next()) {
		        	Scenario scenario = new Scenario();
		            scenario.setScenarioid(rs.getInt("scenario_id"));
		            scenario.setTitle(rs.getString("title"));
		            scenario.setImagelink(rs.getString("imagelink"));
		            scenario.setFinishdate(rs.getTimestamp("finish_date").toString());
		            scenario.setStrfinishdate(rs.getString("finish_date").toString());
		            scenarioList.add(scenario);
		        }
		        
		    } catch (SQLException e) {
		        e.printStackTrace();
		    }finally {
		    	try {
				 	if (rs != null) {
				 		rs.close();
				 	}
				 	if (pstmt != null) {
				 		pstmt.close();
				 	}
				 	if (conn != null) {
				 		conn.close();
				 	}
			 } catch (Exception e) {
				 System.err.println(e.getMessage());
			 }
		    }
		return scenarioList;
	}

	
}
