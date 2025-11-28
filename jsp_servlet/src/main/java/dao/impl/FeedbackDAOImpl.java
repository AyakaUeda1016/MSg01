package dao.impl;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

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
		//成長記録詳細用の結果データを持ってくる処理を書く
		return resultdata;
	}


	@Override
	public String findConversationlogforgrowthrecord(Feedback feedback) {
		String conversationdata = null;
		//成長記録詳細用の結果データを持ってくる処理を書く
		return null;
	}
		
	@Override
	public String findResult(Feedback feedback) {
		String resultdata = null;
		//result_dataを持ってくる処理を書く
		return resultdata;
	}

	@Override
	public String findConversationlog(Feedback feedback) {
		String conversationdata = null;
		//会話ログを持ってくる
		return conversationdata;
	}

	@Override
	public String MakeGraphData(Feedback feedback) {
		String graphdata = null;
		// グラフデータに必要なデータをとってきて必要なら生成する。
		return graphdata;
	}

	@Override
	public String MakeRankData(Feedback feedback) {
		// TODO 自動生成されたメソッド・スタブ
		return null;
	}

}
