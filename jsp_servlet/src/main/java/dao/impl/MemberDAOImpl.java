package dao.impl;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

import dao.MemberDAO;
import model.Member;

public class MemberDAOImpl implements MemberDAO{
	
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
	

	//新規会員登録の処理(展示用)
	@Override
	public int insertMemberForShow(Member member) {
		int userid = 0;
		String sql = "INSERT INTO member_MS(name) VALUES(?)";
		Connection con = null;
		PreparedStatement prst = null;
		ResultSet rs = null;
		try {
			con = getConnection();
			prst = con.prepareStatement(sql,Statement.RETURN_GENERATED_KEYS);
			prst.setString(1, member.getName());
			int result = prst.executeUpdate();
			if (result == 1) {
				rs = prst.getGeneratedKeys();
				if (rs.next()) {
					userid = rs.getInt(1);
				}
			}
		}catch(SQLException e){
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
		return userid;
	}

}
