package model;

import dao.MemberDAO;
import dao.impl.MemberDAOImpl;

public class MemberLogic {
	
	private MemberDAO memberDAO;
	
	public MemberLogic() {
		this.memberDAO = new MemberDAOImpl();
	}
	
	//新規会員登録するためのビジネスロジック
	public int insertMember(String name) {
		int id = 0;
		Member member = new Member();
		member.setName(name);
		try {
			id = memberDAO.insertMemberForShow(member);
			return id;
		}catch(Exception e) {
			return id;
		}
	}
	
	
	
}
