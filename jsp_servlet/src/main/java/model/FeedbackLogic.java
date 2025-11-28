package model;

import dao.FeedBackDAO;
import dao.impl.FeedbackDAOImpl;

public class FeedbackLogic {
	private FeedBackDAO feedbackDAO;
	
	public FeedbackLogic() {
		this.feedbackDAO = new FeedbackDAOImpl();
	}
	
	public String receiveResult(int userid,int scenarioid,String finishdate) {
		String result = null;
		Feedback feedback = new Feedback();
		feedback.setUserid(userid);
		feedback.setScenarioid(scenarioid);
		feedback.setFinishdate(finishdate);
		try {
			result = feedbackDAO.findResult(feedback);
			return result;
		}catch(Exception e) {
			e.printStackTrace();
			return result;
		}
	}
	
	public String receiveConvasation(int userid,int scenarioid,String finishdate) {
		String result = null;
		Feedback feedback = new Feedback();
		feedback.setUserid(userid);
		feedback.setScenarioid(scenarioid);
		feedback.setFinishdate(finishdate);
		try {
			result = feedbackDAO.findResult(feedback);
			return result;
		}catch(Exception e) {
			e.printStackTrace();
			return result;
		}
	}
}
