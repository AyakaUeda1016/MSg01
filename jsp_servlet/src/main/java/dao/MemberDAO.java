package dao;

import model.Member;

public interface MemberDAO {

	//IDからパスワードを探す 担当:上田(見せるとこでもないので)
	String findPasswordByID(int id);
	
	//新規登録 担当：上田(見せるとこでもないので)
	int insertMember(Member member);
	
	//新規登録(展示用)担当:山田(画面も)
	int insertMemberForShow(String username);
	
	//IDからメンバー情報を探す 担当:上田(見せるとこでもないので)
	Member findMemberByID(int id);
}
