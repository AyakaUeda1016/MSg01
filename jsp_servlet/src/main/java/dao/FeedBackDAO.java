package dao;

import model.Feedback;

public interface FeedBackDAO {
	
	//成長記録詳細用のデータ(result_data)を持ってくる 担当：山田　締め切り:12/2
	String findResultforgrowthrecord(Feedback feedback);
	
	//成長記録詳細→会話ログを表示させるためのデータ(convasation_log)を持ってくる  担当:山田 締め切り:12/2
	String findConversationlogforgrowthrecord(Feedback feedback);
	
	//リザルト画面用のデータを持ってくる 担当：上田
	String findResult(Feedback feedback);
	
	//リザルト画面→会話ログのデータを持ってくる 担当:上田
	String findConversationlog(Feedback feedback);
	
	//グラフ画面生成用のデータ(result_data)を持ってくる 担当：上田
	String MakeGraphData(Feedback feedback);
	
	//当日ランク展示用のデータを持ってくる(result_data) 担当：上田(後日)
	String MakeRankData(Feedback feedback);
	
}
