package dao.impl;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

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
	
	//指定したIDに一致するパスワードを探す処理
	public String findPasswordByID(int id) {
		String sql = "SELECT * FROM member WHERE id = ?;";
		String password = null;
		Connection con = null;
		PreparedStatement prst = null;
		ResultSet rs = null;
		try {
			con = getConnection();
			prst = con.prepareStatement(sql);
			prst.setInt(1, id);
		}catch(SQLException e) {
			e.printStackTrace();
		}finally {
			
		}
		return password;
	}
	
	//新規会員登録の処理。
	public int insertMember(Member member) {
		int id = 0;
		//ここから新しく登録した会員情報をmemberテーブルに追加する処理を書く。ID(数値)を出してほしい。
		return id;
	}
	
	//会員情報を出す処理
	public Member findMemberByID(int id){
		Member member = new Member();
		//ここからIDから会員の情報を探す→memberにセットする処理を書く。
		return member;
	}

	//新規会員登録の処理(展示用)
	@Override
	public int insertMemberForShow(String username) {
		// TODO 自動生成されたメソッド・スタブ
		return 0;
	}

}
