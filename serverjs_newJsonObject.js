import express from "express";
import bodyParser from "body-parser";
import { WebSocketServer } from "ws";
import { spawn } from "child_process";
import {
  insertKIData,
  selectAllFromTable,
  getConfByID,
  updateColumnData,
  getPromptByID,
  deleteColumnData,
} from "./database.js";
import got from "got";
import crypto from "crypto";

const app = express();
const __dirname = "../"; // root directory of our full application | (also this path)

// Watch out for this path, adjust to your folder structure
const pythonScriptPath = "../chromadb/main.py"; // CTRL + F auf "sendPostRequestToAIServer()" to change NodeJS/Python

const queryUrl = "http://localhost";
const queryPort = 8082;
const wsPort = 8081;
const GetMailPort = 3000;
const postURL = "http://143.93.245.113:8000/response";
let data = null;
let dt = null;

const passPhrase = "kimail-passphrase";

function encrypt(text, passphrase = passPhrase) {
  const salt = crypto.randomBytes(16);
  const key = crypto.pbkdf2Sync(passphrase, salt, 100000, 32, "sha256");
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${salt.toString("base64")}:${iv.toString("base64")}:${Buffer.from(
    encrypted,
    "hex"
  ).toString("base64")}`;
}

function decrypt(encryptedText, passphrase = passPhrase) {
  const parts = encryptedText.split(":");
  const salt = Buffer.from(parts[0], "base64"); // Decode from base64
  const iv = Buffer.from(parts[1], "base64"); // Decode from base64
  const encrypted = parts[2]; // This will be base64-decoded later

  const key = crypto.pbkdf2Sync(passphrase, salt, 100000, 32, "sha256");
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);

  // Assuming the encrypted part is also base64-encoded
  let decrypted = decipher.update(
    Buffer.from(encrypted, "base64"),
    null,
    "utf8"
  );
  decrypted += decipher.final("utf8");
  return decrypted;
}

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
      //console.log("rompt: ", oPrompt)
      mess = oPrompt.Prompt;
      //console.log("the Prompt in then is :", mess);
      res
        .status(200)
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
// app.get("/prompt", (req, res) => {
//     getPromptByID(sprachton)
//     .then((data) => {
//         res.json(data);
//         console.log("prompt sent to KI-server:", data);
//     })
//     .catch((error) => {
//         console.error("Error when getting Data:", error);
//         res.status(500).send("server error");
//     });
// });
app.get("/config", (req, res) => {
  dt = selectAllFromTable("config")
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
  // new
  let data = req.body;
  console.log("Data to Config: ", req.body);
  let opt1 = data.opt1;
  console.log("opt1 :", opt1);
  updateColumnData("Config", "opt-1", opt1);

  let opt2 = data.opt2;
  console.log("opt2 :", opt2);
  updateColumnData("Config", "opt-2", opt2);
  res.send("conf received successfully");
});

app.post("/dashchromadb", (req, res) => {
  // new
  let data = req.body;
  console.log("Dash to ChromaDB data: ", req.body);

  // sendMailToPythonScript(data);

  // "body": "email text lalala"
  // "action": "insert"

  res.send("Data received successfully");
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
  data = req.body;
  res.send("Data received successfully");
});

app.get("/received", (req, res) => {
  if (data !== null) {
    try {
      res.json(data);
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
      data = JSON.parse(data);
      if (data === 1) {
        mitChroma = 1;
      } else {
        mitChroma = 0;
      }
    })
    .catch((error) => {
      console.error("Error trying to retrieve Mit oder Ohne ChromaDB config setting: ", error);
    });

  if (mitChroma === 1) {
    // Python/ChromaDB POST Request
    sendMailToPythonScript(message, ws);
  } else {
    // NodeJS POST Request
    postToAIserver(message, ws);
  }
}

function sendMailToPythonScript(postMessage, ws) {
  // Python/ChromaDB POST Request
  let oMessageObject;
  if (Buffer.isBuffer(postMessage)) {
    oMessageObject = postMessage.toString();
    console.log("Buffer is: ", oMessageObject);
  } else {
    oMessageObject = JSON.stringify(postMessage);
    console.log("Error\n\n\n\n\n\n>>>>>ERROR, major edge case triggered\n\n\n\n\n\n");
    console.log("Data json stringify: ", oMessageObject);
  }
  const process = spawn("python3", [pythonScriptPath, oMessageObject]);
  let result = "";
  process.stdout.on("data", (data) => {
    result += data.toString();
    console.log("process.stdout.on data", result);
  });
  process.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
  });
  process.on("close", (code) => {
    if (code === 0) {
      ws.send(result); // Sendet das Ergebnis zurück an das Thunderbird-Plugin
      ws.close(); // Schließt die WebSocket-Verbindung
    } else {
      ws.send(`Error: Process exited with code ${code}`);
      ws.close(); // Es ist sinnvoll, die Verbindung auch im Fehlerfall zu schließen
    }
  });
}

async function postToAIserver(postMessage, ws) {
  // NodeJS POST Request
  let oTextBody;
  let dataObject = {
    body: "",
    prompt: "",
    ab_oder_zusage: "",
    action: ""
  };

  if (Buffer.isBuffer(postMessage)) {
    oTextBody = JSON.parse(postMessage.toString());
    console.log("Object is: ", postMessage.toString());

    dataObject.body = encrypt(oTextBody.body);
    dataObject.prompt = encrypt(oTextBody.prompt);
    dataObject.ab_oder_zusage = encrypt(oTextBody.ab_oder_zusage);
    dataObject.action = encrypt(oTextBody.action);

    console.log("dataObject is: ", dataObject);
  } else {
    console.log(
      "big error, show this to developers for a long debugging session"
    );
  }
  let data = await got
    .post(postURL, {
      json: {
        prompt: dataObject.body,
        realPrompt: dataObject.prompt,
        ab_oder_zusage: dataObject.ab_oder_zusage,
        action: dataObject.action
      },
    })
    .json();
  data = decrypt(data);
  data = JSON.stringify(data);
  console.log("data from postToAIserver: ", data);
  ws.send(data); // Sendet das Ergebnis zurück an das Thunderbird-Plugin
}