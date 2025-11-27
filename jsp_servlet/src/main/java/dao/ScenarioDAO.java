package dao;

import java.util.List;

import model.Scenario;

public interface ScenarioDAO {
	//シナリオ選択画面ですべてのシナリオの一覧を出す。 担当：山田
	List<Scenario> findAllScenario();
	
	//成長記録画面に今までやったすべてのシミュレーションの一覧を出す。 担当：山田
	List<Scenario> findAllSimulation(int userid);
	
	
}
