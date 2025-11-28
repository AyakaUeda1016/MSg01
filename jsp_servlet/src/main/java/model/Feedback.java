package model;

public class Feedback {
	private int userid; //ユーザーID
	private int scenarioid; //シナリオID
	private String finishdate; //終了日
	private String resultdata; //シミュレーション結果データJSON
	private String convasationlog;//会話ログの結果データJSON
	
	//コンストラクタ
	public Feedback() {
		
	}
	
	//コンストラクタ(ユーザーID、シナリオID、終了日)
	public Feedback(int userid, int scenarioid, String finishdate) {
		this.userid = userid;
		this.scenarioid = scenarioid;
		this.finishdate = finishdate;
	}
	
	//以下アクセサメソッド。
	public int getUserid() {
		return userid;
	}
	public void setUserid(int userid) {
		this.userid = userid;
	}
	public int getScenarioid() {
		return scenarioid;
	}
	public void setScenarioid(int scenarioid) {
		this.scenarioid = scenarioid;
	}
	public String getFinishdate() {
		return finishdate;
	}
	public void setFinishdate(String finishdate) {
		this.finishdate = finishdate;
	}
	public String getResultdata() {
		return resultdata;
	}
	public void setResultdata(String resultdata) {
		this.resultdata = resultdata;
	}
	public String getConvasationlog() {
		return convasationlog;
	}
	public void setConvasationlog(String convasationlog) {
		this.convasationlog = convasationlog;
	}
}
