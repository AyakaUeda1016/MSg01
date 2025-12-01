package model;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class Scenario {
	private int scenarioid; //シナリオの番号
	private String title; //シナリオのタイトル
	private String description; //シナリオの紹介文
	private String imagelink; //シナリオのイメージ画像リンク
	private int userid; //ユーザーID
	private String finishdate; //終了日
	private String strfinishdate; 

	//コンストラクタ
	public Scenario() {
		
	}
	
	//コンストラクタ(シナリオID、タイトル、説明文、画像リンク)
	public Scenario(int scenarioid, String title, String explain, String imagelink) {
		this.scenarioid = scenarioid;
		this.title = title;
		this.description = explain;
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

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getImagelink() {
		return imagelink;
	}

	public void setImagelink(String imagelink) {
		this.imagelink = imagelink;
	}
	
	public String getStrfinishdate() {
		return strfinishdate;
	}

	public void setStrfinishdate(String finishdate) {
		DateTimeFormatter inputFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
		DateTimeFormatter outputFormatter = DateTimeFormatter.ofPattern("yyyy年MM月dd日 HH:mm");

		// 変換：日時を扱うので LocalDateTime を使う
		LocalDateTime dateTime = LocalDateTime.parse(finishdate, inputFormatter);
		String strfinishdate = dateTime.format(outputFormatter);
		this.strfinishdate = strfinishdate;
	}
}
