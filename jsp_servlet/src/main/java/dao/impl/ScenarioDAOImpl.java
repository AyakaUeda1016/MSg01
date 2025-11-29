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
			 } catch (SQLException e) {
				 System.err.println(e.getMessage());
			 }
		  }
		return list;
	}
	
	@Override
	public List<Scenario> findAllSimulation(int userid){
		List<Scenario> list = new ArrayList<>();
		//以下シナリオのID(scenario_id)、終了日(finish_date)、シナリオのイメージ画像(imagelink)を出す処理を書く。
		return list;
	}

	
}
