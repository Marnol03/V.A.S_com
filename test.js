import {createTable,getPromptByID, SinsertKIData, deleteTable,getConfByID, selectAllFromTable, insertColumn, updateColumnData, insertKIData, deleteColumnData, onInitDatabase} from './database.js'

const Test1 = 4;
const Test2 = "123";
const Test3 = "2345";
const Test4 = "3456";
const Test5 = "4567";
const Test6 = "5678";
const Test7 = "6789";
const Test8 = "Du bist ein Professor an einer Universität.\nDu schreibst EMAIL-ANTWORTEN zurück zu den Anfragen des Studenten. \nDu antwortest freundlich zu den EMAILS des Studenten. \nDu sprichst den Studenten mit 'du' und seinem Namen an. \n{sim_prompt}\nDu antwortest bei deutschen EMAILS auf Deutsch. \nDu antwortest bei englischen EMAILS auf Englisch. \nEMAIL: \n{email}\nANTWORT:";
const Test9 = "Du bist ein Professor an einer Universität.\nDu schreibst EMAIL-ANTWORTEN zurück zu den Anfragen des Studenten.\nDu antwortest höflich und formell zu den EMAILS des Studenten. \nDu sprichst den Studenten mit 'Sie' und seinem Nachnamen an. \n{sim_prompt}\nDu antwortest bei deutschen EMAILS auf Deutsch. \nDu antwortest bei englischen EMAILS auf Englisch. \nEMAIL: \n{email}\n{ab_oder_zusage}\nANTWORT: let last_ID = 0";
var tet = JSON.stringify(Test9);
//createTable("Test","");
//ScreateTable("prompt","");
//insertData("Test3", "1, 'Email', 'AI', 400, 10, 'TEST'");

//selectAllFromTable("Config");
//updateColumnData("Config", "opt-1", 2);
//deleteTable("Config");

//insertColumn("Email", "Power_Consumption_for_Request")

//1. ID, 2. Input und Output, 3. Dauer, Tokens, Kommentar

//insertKIData("Test", Test2, Test3, Test4, Test5, Test6, Test7, Test8, Test9)
//SinsertKIData("Prompt","freundlich",Test8);
//SinsertKIData("Prompt","formell",Test9);

//insertColumnData("Test", "Input", "'TEST'", "2")

//deleteColumnData("Test", 10)
//updateColumnData("Config","chroma",Test1,"Request","Request");


//createTable("Email","");
//insertData("Test3", "1, 'Email', 'AI', 400, 10, 'TEST'");
//selectAllFromTable("config");
//deleteTable("Prompt");
//insertColumn("Test", "Token INT")
//1. ID, 2. Input und Output, 3. Dauer, Tokens, Kommentar
//insertKIData("Test", Test2, Test3, Test4, Test5, Test6, Test7, Test8, Test9)
//deleteColumnData("Prompt", "freundlich");
//getPromptByID('formell');
//onInitDatabase();
