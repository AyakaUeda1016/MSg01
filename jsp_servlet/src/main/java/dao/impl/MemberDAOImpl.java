package dao.impl;

import java.sql.Connection;
import java.sql.DriverManager;
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
	

	//新規会員登録の処理(展示用)
	@Override
	public int insertMemberForShow(Member member) {
		int userid = 0;
		//展示用のユーザー登録。登録項目は名前だけ。
		return userid;
	}

}
