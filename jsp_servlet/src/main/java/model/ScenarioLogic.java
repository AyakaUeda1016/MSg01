package model;

import dao.ScenarioDAO;
import dao.impl.ScenarioDAOImpl;

public class ScenarioLogic {
	private ScenarioDAO scenarioDAO;
	
	public ScenarioLogic() {
		this.scenarioDAO = new ScenarioDAOImpl();
	}
}
