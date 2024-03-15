import sqlite3 from 'sqlite3';

/* <Database Architecture> */
const aObjectAllTables = [ /* Hardcoded, our entire database architecture (all tables) */
  {
    sTableName: "Email",
    sTableLayout: "ID INTEGER PRIMARY KEY AUTOINCREMENT, Request TEXT, Result TEXT, Time TEXT, Token TEXT, Daily TEXT, Max_CPU TEXT, Avg_CPU TEXT, Total TEXT, Date TEXT, Total_Power_Consumption TEXT, Power_Consumption_for_Request TEXT"
  },
  {
    sTableName: "Prompt",
    sTableLayout: "ID TEXT PRIMARY KEY, Prompt TEXT"
  },
  {
    sTableName: "config",
    sTableLayout: "ID TEXT PRIMARY KEY, Request INTEGER"
  }
  // add new table structures here
];

const sPromptFreundlich = "Du bist ein Professor an einer Universität.\nDu schreibst EMAIL-ANTWORTEN zurück zu den Anfragen des Studenten. \nDu antwortest freundlich zu den EMAILS des Studenten. \nDu sprichst den Studenten mit du und seinem Namen an. \n{sim_prompt}\nDu antwortest bei deutschen EMAILS auf Deutsch. \nDu antwortest bei englischen EMAILS auf Englisch. \nEMAIL: \n{email}\n{ab_oder_zusage}\nANTWORT: ";
const sPromptFormell = "Du bist ein Professor an einer Universität.\nDu schreibst EMAIL-ANTWORTEN zurück zu den Anfragen des Studenten.\nDu antwortest höflich und formell zu den EMAILS des Studenten. \nDu sprichst den Studenten mit Sie und seinem Nachnamen an. \n{sim_prompt}\nDu antwortest bei deutschen EMAILS auf Deutsch. \nDu antwortest bei englischen EMAILS auf Englisch. \nEMAIL: \n{email}\n{ab_oder_zusage}\nANTWORT: ";
const aPromptsSprachton = [
  {
    sprachton: "freundlich",
    prompt: sPromptFreundlich
  },  
  {
    sprachton: "formell",
    prompt: sPromptFormell
  }
]
const aconfig = [
  {
    ID : "opt-1",
    Request : 0
  },
  {
    ID : "opt-2",
    Request : 0
  },
  {
    ID : "chroma",
    Request : 0
  }
]
function onInitDatabase() { /* initializes Database, creates Tables if tables missing*/
  aObjectAllTables.forEach(element => {
    createTable(element.sTableName, element.sTableLayout);
  });
  aPromptsSprachton.forEach(element => {
    SinsertKIData("Prompt", element.sprachton, element.prompt);
  });
  aconfig.forEach(element =>{
    pinsertKIData("Config", element.ID, element.Request);
  })
}

/* </Database Architecture> */

const db = new sqlite3.Database('geniusReplyDatabase.db', (err) => {
  if (err) {
    console.error('Error opening database: ', err.message);
  } else {
    console.log('Connected to the SQLite database');
    onInitDatabase();
    //insertKIData("Email", "5", "123", "40", "599", "8", "100", "99", "99"); // inserts mock data on every npm start
  }
});

function selectAllFromTable(sTableName) {
  console.log("in selectAllFromTable, Table: ", sTableName);
  return new Promise((resolve, reject) => {
    let aDBResult = [];
    db.each('SELECT * FROM ' + sTableName, (err, row) => {
      if (err) {
        console.error('Error querying data: ', err.message);
        reject(err);
      } else {
        //console.log(sTableName + ":", row);
        aDBResult.push(row);
      }
    }, () => {
      console.log("\n aDBResult : ",aDBResult);
      resolve(aDBResult);
    });
  });
}

function createTable(sTableName, sTableLayout) {
  db.serialize((err) => {
    db.run('CREATE TABLE if not exists ' + sTableName + "(" + sTableLayout + ");");
    if (err) {
      console.error('Error createTable: ', err.message);
    } else {
      console.log("Table created or exists: " + sTableName);
    }
  });
}

function ScreateTable(sTableName, sTableLayout) {
  if (sTableLayout === ""){
     sTableLayout = "ID TEXT PRIMARY KEY , Prompt TEXT";
  }
  db.serialize((err) => {
    db.run('CREATE TABLE '+ sTableName + "(" + sTableLayout + ");");
    if (err) {
      console.error('Error create Tables: ', err.message);
  } else {
      console.log("Table creates: " + sTableName + ", " + sTableLayout);
  }
  });
}
function getPromptByID(ID) {
  return new Promise((resolve, reject) => {
    let sql = `SELECT Prompt FROM Prompt WHERE ID = ?`;

    db.get(sql, [ID], (err, row) => {
      if (err) {
        console.error(err.message);
        reject(err);
        return;
      }
      if (!row) {
        console.log('There is no data with the given ID:', ID);
        resolve(null);
        return;
      }
      let prompt = JSON.stringify(row);
      //console.log('Prompt related to the ID ' + ID + ' : ' + prompt);
      resolve(prompt);
    });
  });
}
function getConfByID(ID) {
  return new Promise((resolve, reject) => {
    let sql = `SELECT Request FROM config WHERE ID = ?`;

    db.get(sql, [ID], (err, row) => {
      if (err) {
        console.error(err.message);
        reject(err);
        return;
      }
      if (!row) {
        console.log('There is no data with the given ID:', ID);
        resolve(null);
        return;
      }
      let prompt = JSON.stringify(row);
      console.log('Chroma config related to the ID ' + ID + ' : ' + prompt);
      resolve(prompt);
    });
  });
}


  
function insertData(sTableName, sData) {
  db.serialize((err) => {
    db.run('INSERT INTO '+ sTableName + ' VALUES(' + sData + ')');
    if (err) {
      console.error('Error insert into Tables:', err.message);
  } else {
      console.log( sData + " inserted into " +sTableName);
  }
  });
} 

function deleteTable(sTableName) {
  db.serialize((err) => {
    db.run('DROP TABLE ' + sTableName);
    if (err) {
      console.error('Error delete Tables: ', err.message);
  } else {
      console.log("Tables deleted: " +sTableName);
  }
  })
}

function insertColumn(sTableName, sColumnname,) {
  db.serialize((err) => {
    db.run('ALTER TABLE '+ sTableName + ' ADD COLUMN ' + sColumnname);
    if (err) {
      console.error('Error add Column into Tables: ', err.message);
  } else {
      console.log( sColumnname + " inserted into " + sTableName);
  }
  });
}

function updateColumnData(tableName, id, newValue) {
  db.serialize(() => {
      db.run(`UPDATE ${tableName} SET Request = ? WHERE ID = ?`, [newValue, id], (err) => {
          if (err) {
              console.error('Error when updating chromaconfig :', err.message);
          } else {
              console.log(`config set to  ${newValue} in ${tableName}`);
          }
      });
  });
}

function insertKIData(sTableName, sRequest, sResult, sTime, sToken, sDaily, sMax, sAvg, sTotal, sDate, sTotal_Power_Consumption, sPower_Consumption_for_Request) {
  db.serialize((err) => {
    db.run('INSERT INTO '+ sTableName + ' (Request, Result, Time, Token, Daily, Max_CPU, Avg_CPU, Total, Date, Total_Power_Consumption, Power_Consumption_for_Request)' + ' VALUES(?,?,?,?,?,?,?,?,?,?,?)', sRequest, sResult, sTime, sToken, sDaily, sMax, sAvg, sTotal, sDate,sTotal_Power_Consumption,sPower_Consumption_for_Request);
    if (err) {
      console.error('Error insert into Tables: ', err.message);
    } else {
      // console.log( /* "\n ID: " + */ "\n Request: " + sRequest + "\n Result: " + sResult + "\n Time: " + sTime + "\n Token: " + sToken + "\n Daily Requests: " + sDaily + "\n Max CPU Usage: " + sMax + "\n Average CPU Usage: " + sAvg + "\n Total Personal Requests: " + sTotal + "\n Date: " + sDate + "\n Total Power Consumption: " + sTotal_Power_Consumption + " Watt" + "\n Power Consumption for Request: " + sPower_Consumption_for_Request + " Watt" + "\n inserted into " + sTableName);
      console.log("Inserted request #" + sDaily + " into database. The request had " + sToken + " tokens.");
    }
  });
}
function SinsertKIData(sTableName,ID, sRequest) {
  db.serialize((err) => {
    db.run('INSERT OR IGNORE INTO '+ sTableName + ' (ID,Prompt)' + ' VALUES(?,?)', ID,sRequest);
    if (err) {
      console.error('Error insert into Tables: ', err.message);
  } else {
      //console.log( /* "\n ID: " + */ "\n Request: " + sRequest + "\n ID: "+ ID + "\n inserted into " + sTableName);
  }
  });
}
function pinsertKIData(sTableName,ID, sRequest) {
  db.serialize((err) => {
    db.run('INSERT OR IGNORE INTO '+ sTableName + ' (ID,Request)' + ' VALUES(?,?)', ID,sRequest);
    if (err) {
      console.error('Error insert into Tables: ', err.message);
  } else {
      //console.log( /* "\n ID: " + */ "\n Request: " + sRequest + "\n ID: "+ ID + "\n inserted into " + sTableName);
  }
  });
}
function deleteColumnData(sTableName, sDeleteId) {
  db.serialize((err) => {
    db.run('DELETE FROM '+ sTableName + ' WHERE ' + 'ID' + ' = ' + sDeleteId + ';');
    if (err) {
      console.error('Error delete Tables: ', err.message);
  } else {
      console.log( sDeleteId + " deleted from " + sTableName);
  }
  });
}

export {selectAllFromTable,getPromptByID,getConfByID, SinsertKIData, createTable, deleteTable, insertColumn, updateColumnData, insertKIData, deleteColumnData, onInitDatabase};