package model;

import java.util.List;

import dao.FeedBackDAO;
import dao.impl.FeedbackDAOImpl;

public class FeedbackLogic {
	private FeedBackDAO feedbackDAO;
	
	public FeedbackLogic() {
		this.feedbackDAO = new FeedbackDAOImpl();
	}
	
	public String receiveResultforGrowth(int userid,int scenarioid,String finishdate) {
		String result = null;
		Feedback feedback = new Feedback(userid,scenarioid,finishdate);
		try {
			result = feedbackDAO.findResultforgrowthrecord(feedback);
			return result;
		}catch(Exception e) {
			e.printStackTrace();
			return result;
		}
	}
	
	public String receiveConvasationforGrowth(int userid,int scenarioid,String finishdate) {
		String result = null;
		Feedback feedback = new Feedback(userid,scenarioid,finishdate);
		try {
			result = feedbackDAO.findConversationlogforgrowthrecord(feedback);
			return result;
		}catch(Exception e) {
			e.printStackTrace();
			return result;
		}
	}
	
	public String receiveConvasationforResult(int userid,int scenarioid) {
		String jsonstr = null;
		Feedback feedback = new Feedback(userid,scenarioid);
		try {
			jsonstr = feedbackDAO.findConversationlog(feedback);
			return jsonstr;
		}catch(Exception e) {
			e.printStackTrace();
			return jsonstr;
		}
	}
	
	public List<String>receiveResultforResult(int userid,int scenarioid){
		List<String> results = null;
		Feedback feedback = new Feedback(userid,scenarioid);
		try {
			results = feedbackDAO.findResult(feedback);
			return results;
		}catch(Exception e) {
			e.printStackTrace();
			return results;
		}
		
	}
}
