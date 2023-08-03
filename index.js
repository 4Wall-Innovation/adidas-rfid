const prompt = require("prompt");
const { Client } = require("node-osc");
const { XMLParser } = require("fast-xml-parser");
const parser = new XMLParser();
const axios = require("axios");
const fs = require("fs");

let { targetPort, rfidOSCEndpoint } = require("./config");
let oscClients = [];

const init = async () => {
  if (!targetPort) return console.error("No Target Port found in config");
  if (!rfidOSCEndpoint)
    return console.error("No RFID OSC Endpoint found in config");

  console.log("Target Port loaded:", targetPort);
  console.log("RFID OSC Endpoint loaded:", rfidOSCEndpoint);

  for (let index = 0; index < 5; index++) {
    let ip = `10.0.0.6${index + 1}`;
    oscClients.push(new Client(ip, targetPort));
    console.log("Target IP Address loaded:", ip);
  }
};

const run = async () => {
  prompt.start();
  await init();
  read();
};

const logScan = (rfid, ip) => {
  let logFile = "log.csv";

  let exists = fs.existsSync(logFile);
  if (!exists) fs.writeFileSync(logFile, "rfid,timestamp,target,endpoint\n");

  fs.appendFileSync(
    logFile,
    `${parseInt(rfid)},${Date()},${ip}:${targetPort},${rfidOSCEndpoint}\n`
  );

  console.log(
    `Sent RFID ${parseInt(
      rfid
    )} to ${ip}:${targetPort} ${rfidOSCEndpoint} at ${Date()}`
  );
};

const read = async () => {
  let { target } = await prompt.get(["target"]);
  let { rfid } = await prompt.get(["rfid"]);
  try {
    let oscClient = oscClients[parseInt(target) - 1];
    oscClient.send(rfidOSCEndpoint, parseInt(rfid), () => {});
    logScan(rfid, oscClient.host);
  } catch (error) {
    console.error(error);
  }
  read();
};

run();
