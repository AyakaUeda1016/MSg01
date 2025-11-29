package model;

import java.util.ArrayList;
import java.util.List;

import dao.ScenarioDAO;
import dao.impl.ScenarioDAOImpl;

public class ScenarioLogic {
	private ScenarioDAO scenarioDAO;
	
	public ScenarioLogic() {
		this.scenarioDAO = new ScenarioDAOImpl();
	}
	
	public List<Scenario>findScenario() {
		List<Scenario> list = new ArrayList<>();
		try {
			list = scenarioDAO.findAllScenario();
			return list;
		}catch(Exception e) {
			e.printStackTrace();
			return list;
		}
	}
	
}
