package model;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public class Member {
	private int id; //ID
	private String name; //名前
	private String birthday; //誕生日
	private String sex; //性別
	private String password; //パスワード
	private boolean ftimeselect; //始めてシナリオ選択画面に入ったか
	private boolean ftimesimulation; //始めてシミュレーション画面に入ったか。
	
	//コンストラクタ
	public Member() {
		
	}
	
	//コンストラクタ(名前、誕生日、性別、パスワード)
	public Member(String name, String birthday, String sex, String password) {
		this.name = name;
		this.birthday = birthday;
		this.sex = sex;
		this.password = password;
	}
	//コンストラクタ(id,パスワード)
	public Member(int id, String password) {
		this.id = id;
		this.password = password;
	}
	
	//以下アクセサメソッド
	public int getId() {
		return id;
	}
	public void setId(int id) {
		this.id = id;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getBirthday() {
		DateTimeFormatter inputFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
		DateTimeFormatter outputFormatter = DateTimeFormatter.ofPattern("yyyy年MM月dd日");
		// 変換
		LocalDate date = LocalDate.parse(birthday, inputFormatter);
		birthday = date.format(outputFormatter);
		return birthday;
	}
	public void setBirthday(String birthday) {
		this.birthday = birthday;
	}
	public String getSex() {
		return sex;
	}
	public void setSex(String sex) {
		this.sex = sex;
	}
	public String getPassword() {
		return password;
	}
	public void setPassword(String password) {
		this.password = password;
	}
	
	//始めて選択画面を開いたかどうか
	public boolean isFtime_select() {
		return ftimeselect;
	}
	public void setFtime_select(int ftimeselectno) {
		boolean ftimeselect = false;
		if(ftimeselectno == 0) {
			ftimeselect = true;
		}
		this.ftimeselect = ftimeselect;
	}
	
	//始めてシミュレーション画面を開いたかどうか
	public boolean isFtime_simulation() {
		return ftimesimulation;
	}
	public void setFtime_simulation(int ftimesimulationno) {
		boolean ftimesimulation = false;
		if(ftimesimulationno == 0) {
			ftimeselect = true;
		}
		this.ftimesimulation = ftimesimulation;
	}
	
	
}
