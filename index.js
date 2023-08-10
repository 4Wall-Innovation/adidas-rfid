const prompt = require("prompt");
const { Client } = require("node-osc");
const { XMLParser } = require("fast-xml-parser");
const parser = new XMLParser();
const axios = require("axios");
const fs = require("fs");

let { targetPort, targetIp, rfidOSCEndpoint } = require("./config");
let oscClient;

const init = async () => {
  if (!targetIp) return console.error("No Target IP found in config");
  if (!targetPort) return console.error("No Target Port found in config");
  if (!rfidOSCEndpoint)
    return console.error("No RFID OSC Endpoint found in config");
  console.log("Target Ip loaded:", targetPort);
  console.log("Target Port loaded:", targetPort);
  console.log("RFID OSC Endpoint loaded:", rfidOSCEndpoint);

  oscClient = new Client(targetIp, targetPort);
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
  let { rfid } = await prompt.get(["rfid"]);
  try {
    oscClient.send(rfidOSCEndpoint, parseInt(rfid), () => {});
    logScan(rfid, oscClient.host);
  } catch (error) {
    console.error(error);
  }
  read();
};

run();
