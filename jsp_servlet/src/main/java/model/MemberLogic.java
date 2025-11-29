package model;

import dao.MemberDAO;
import dao.impl.MemberDAOImpl;

public class MemberLogic {
	
	private MemberDAO memberDAO;
	
	public MemberLogic() {
		this.memberDAO = new MemberDAOImpl();
	}
	
	//入力したID,パスワードが登録されているものと一致しているか確認するビジネスロジック。
	public boolean LoginCheck(int id,String password) {
		boolean login = false;
		try {
			String dbpassword = memberDAO.findPasswordByID(id);
			if(password.equals(dbpassword)) {
				login = true;
			}
		}catch(Exception e) {
			e.printStackTrace();
		}
		return login;
	}
	
	//新規会員登録するためのビジネスロジック
	public int insertMember(String name, String birthday, String sex, String password) {
		int id = 0;
		Member member = new Member(name,birthday,sex,password);
		try {
			id = memberDAO.insertMember(member);
			return id;
		}catch(Exception e) {
			return id;
		}
	}
	
	//会員情報を出すためのビジネスロジック。
	public Member findMember(int id){
		try {
			return memberDAO.findMemberByID(id);
		}catch(Exception e){
			e.printStackTrace();
			return new Member();
		}
	}
	
	
}
