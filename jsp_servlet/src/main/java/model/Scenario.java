package model;

public class Scenario {
	private int scenarioid; //シナリオの番号
	private String title; //シナリオのタイトル
	private String explain; //シナリオの紹介文
	private String imagelink; //シナリオのイメージ画像リンク
	private int userid; //ユーザーID
	private String finishdate; //終了日
	
	
	//コンストラクタ
	public Scenario() {
		
	}
	
	//コンストラクタ(シナリオID、タイトル、説明文、画像リンク)
	public Scenario(int scenarioid, String title, String explain, String imagelink) {
		this.scenarioid = scenarioid;
		this.title = title;
		this.explain = explain;
		this.imagelink = imagelink;
	}
	
	//コンストラクタ(シナリオID、ユーザーID、タイトル、終了日、画像リンク)
	public Scenario(int scenarioid, int userid, String title, String finishdate, String imagelink) {
		this.scenarioid = scenarioid;
		this.userid = userid;
		this.title = title;
		this.finishdate = finishdate;
		this.imagelink = imagelink;
	}
	
	//以下アクセサメソッド。
	public int getScenarioid() {
		return scenarioid;
	}

	public int getUserid() {
		return userid;
	}

	public void setUserid(int userid) {
		this.userid = userid;
	}

	public String getFinishdate() {
		return finishdate;
	}

	public void setFinishdate(String finishdate) {
		this.finishdate = finishdate;
	}

	public void setScenarioid(int id) {
		this.scenarioid = id;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getExplain() {
		return explain;
	}

	public void setExplain(String explain) {
		this.explain = explain;
	}

	public String getImagelink() {
		return imagelink;
	}

	public void setImagelink(String imagelink) {
		this.imagelink = imagelink;
	}
	
}
