import express from "express";
import bodyParser from "body-parser";
import { WebSocketServer } from "ws";
import {
  insertKIData,
  selectAllFromTable,
  getConfByID,
  updateColumnData,
  getPromptByID,
  deleteColumnData,
} from "./database.js";
import got from "got";
import { Agent } from 'https';

const app = express();
const __dirname = "../"; // root directory of our full application
const queryUrl = "http://localhost";
const queryPort = 8082;
const wsPort = 8081;
const GetMailPort = 3000;
const postURL = "https://143.93.245.113:9000/hypothetical";
// Create a new HTTPS agent that doesn't reject unauthorized certificates
const httpsAgent = new Agent({
  rejectUnauthorized: false, // This bypasses SSL/TLS certificate validation
});
let oEmailPostData = null;
let sLastChromaSize = "-1 (no value yet)";
let data;
let dt;

// Middleware configuration
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.get("/main/popup.html", function (req, res) {
  res.sendFile("/thunderbird-plugin/main/popup.html", { root: __dirname });
});
app.get("/main/popup.css", function (req, res) {
  res.sendFile("/thunderbird-plugin/main/popup.css", { root: __dirname });
});
app.get("/images/wait_animation.png", function (req, res) {
  res.sendFile("/thunderbird-plugin/images/wait_animation.png", {
    root: __dirname,
  });
});
app.get("/images/math-greater.png", function (req, res) {
  res.sendFile("/thunderbird-plugin/images/math-greater.png", {
    root: __dirname,
  });
});
app.get("/images/math-lower.png", function (req, res) {
  res.sendFile("/thunderbird-plugin/images/math-lower.png", {
    root: __dirname,
  });
});
app.get("/images/copy.png", function (req, res) {
  res.sendFile("/thunderbird-plugin/images/copy.png", {
    root: __dirname,
  });
});
app.get("/images/refresh.png", function (req, res) {
  res.sendFile("/thunderbird-plugin/images/refresh.png", {
    root: __dirname,
  });
});
app.get("/images/settings.png", function (req, res) {
  res.sendFile("/thunderbird-plugin/images/settings.png", {
    root: __dirname,
  });
});
app.get("/main/popup.js", function (req, res) {
  res.sendFile("/thunderbird-plugin/main/popup.js", { root: __dirname });
});
app.post("/AI_data", (req, res) => {
  let data = req.body;
  console.log("Data from AI :", req.body);
  insertKIData(
    "Email",
    data.request,
    data.result,
    data.time,
    data.token,
    data.daily_requests,
    data.max_cpu_usage,
    data.avg_cpu_usage,
    data.total_personal_requests,
    data.date,
    data.total_power_consumption,
    data.power_consumption_for_request
  );
  res.send("Data received successfully");
});
app.post("/delete_data", (req, res) => {
  let data = req.body;
  console.log("Column to delete :", req.body);
  deleteColumnData(data.table, parseInt(data.id));
  res.send("Data received successfully");
});
let mess = "";
app.post("/sprachton", (req, res) => {
  let sprachton = "freundlich";
  sprachton = req.body;
  sprachton = sprachton.sprachton;
  console.log("Sprachton to be used is: ", sprachton);
  getPromptByID(sprachton)
    .then((prompt) => {
      let oPrompt = JSON.parse(prompt);
      mess = oPrompt.Prompt;
      //console.log("the Prompt in then is :", mess);
      res.status(200)
      .json({ message: "Sprachton received successfully ", mess });
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération du prompt:", error);
    });
});
app.get("/data", (req, res) => {
  selectAllFromTable("Email")
    .then((data) => {
      res.json(data);
      console.log("Data sent to Dash:", data);
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération des données:", error);
      res.status(500).send("Erreur sur le serveur");
    });
});
app.get("/setting", (req, res) => {
  getConfByID("chroma")
    .then((data) => {
      res.json(data);
      console.log("settings sent to Dashboard:", data);
    })
    .catch((error) => {
      console.error("Error when fetching data fir setting:", error);
      res.status(500).send("Server errorr");
    });
});
app.get("/config", (req, res) => {
  selectAllFromTable("config")
    .then((dt) => {
      res.json(dt);
      console.log("Data sent to Config:", dt);
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération des données:", error);
      res.status(500).send("Erreur sur le serveur");
    });
});
app.post("/update_config", (req, res) => {
  let data = req.body;
  let opt = data.conf;
  updateColumnData("Config", "chroma", opt);
  console.log("config added to database");
  res.send("chroma config updated");
});
app.post("/conf", (req, res) => {
  let data = req.body;
  console.log("Data to ConfigDatabase: ", req.body);
  let opt1 = data.opt1;
  console.log("opt1 :", opt1);
  updateColumnData("Config", "opt-1", opt1);

  let opt2 = data.opt2;
  console.log("opt2 :", opt2);
  updateColumnData("Config", "opt-2", opt2);
  res.send("conf received successfully");
});
app.post("/hat", (req, res) => {
  let data = req.body;
  console.log("Data to ConfigDatabase: ", req.body);
  let opt1 = data.opt1;
  console.log("opt1 :", opt1);
  updateColumnData("Config", "opt-1", opt1);

  let opt2 = data.opt2;
  console.log("opt2 :", opt2);
  updateColumnData("Config", "opt-2", opt2);
  res.send("conf received successfully");
});
app.post("/dashchromadb", (req, res) => {
  let bInsert = true;
  let oChromaInsertData = {
    body: req.body.response,
    prompt: "",
    ab_oder_zusage: "",
    action: "insert",
  };
  console.log("Dash to ChromaDB data: ", req.body);
  sendMailToPythonScript(oChromaInsertData, "", "", bInsert);
  res.send("ChromaDB insert OK. ChromaDB size approximately: " + sLastChromaSize);
});

app.listen(queryPort, () => {
  console.log(`GeniusReply-Server is listening to ${queryUrl}:${queryPort}`);
});

const wss = new WebSocketServer({ port: wsPort });
wss.on("connection", function connection(ws) {
  ws.on("message", function incoming(message) {
    sendPostRequestToAIServer(message, ws);
  });

  ws.on("close", function () {
    console.log("Client disconnected");
  });
});
console.log(`WebSocket-Server is listening to ws:${queryUrl}:${wsPort}`);

app.post("/mail_from_thunderbird", (req, res) => {
  oEmailPostData = req.body;
  res.send("Data received successfully");
});

app.get("/received", (req, res) => {
  if (oEmailPostData !== null) {
    try {
      res.json(oEmailPostData);
    } catch (error) {
      console.error("conversion error to JSON: ", error);
      res.status(500).send("Errorcon server");
    }
  } else {
    res.status(404).send("no data");
  }
});

app.listen(GetMailPort, () => {
  console.log(`Thunderbird-Server is listening to ${queryUrl}:${GetMailPort}`);
});

/* using python script again */

function sendPostRequestToAIServer(message, ws) {
  let mitChroma = 0;
  getConfByID("chroma")
    .then((data) => {
      console.log("Data:", data);
      data = JSON.parse(data);
      //console.log("JSON parsed Data:", data);
      data = data["Request"];
      if (data === 1) {
        mitChroma = 1;
      } else {
        mitChroma = 0;
      }
      //console.log("Mit Chroma Data:", data);
      //console.log("Mit Chroma Var:", mitChroma);
      // mitChroma = 0; /* override value for testing */
      sendMailToPythonScript(message, ws, mitChroma);
    })
    .catch((error) => {
      console.error("Error trying to retrieve use ChromaDB config setting: ", error);
    });
}

async function sendMailToPythonScript(postMessage, ws, mitChroma, bInsert) {
  // Python/ChromaDB POST Request
  let oMessageObject = {};
  oMessageObject.mit_chroma = null;
  let oDataPostReq;
  if (Buffer.isBuffer(postMessage)) {
    oMessageObject = postMessage.toString();
    oMessageObject = JSON.parse(oMessageObject);
    if (mitChroma === 0 || mitChroma === 1) {
      oMessageObject.mit_chroma = mitChroma;
    } else {
      console.log("ERROR mit_chroma value not 0 or 1, exiting.");
      return;
    }
    console.log("Buffer is: ", oMessageObject);
  } else {
    oMessageObject = postMessage;
    console.log(postMessage);
    oMessageObject.mit_chroma = 1;
    console.log("ChromaDB insert object: ", oMessageObject);
  }
  oDataPostReq = await got.post(postURL, {
    json: oMessageObject,
    agent: {
        https: httpsAgent
    }, // Use the custom HTTPS agent for this request
  }).json();
  if (!bInsert) { /* if not insert action, return data to websocket */
    console.log(oDataPostReq);
    oDataPostReq = JSON.stringify(oDataPostReq);
    ws.send(oDataPostReq);
    ws.close();
  } else {
    sLastChromaSize = oDataPostReq.chroma_size.toString();
    console.log("response from insert", oDataPostReq);
  }
}