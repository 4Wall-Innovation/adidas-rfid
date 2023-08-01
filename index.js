const prompt = require("prompt");
const { Client } = require("node-osc");
const { XMLParser } = require("fast-xml-parser");
const parser = new XMLParser();
const axios = require("axios");
const fs = require("fs");

let {
  targetIpSource,
  targetIp,
  targetPort,
  rfidOSCEndpoint,
  dbServerIP,
  dbServerPort,
  readerName,
} = require("./config");
let oscClient;

const init = async () => {
  if (targetIpSource == "xml") {
    let { data } = await axios.get(
      `http://${dbServerIP}:${dbServerPort}/config`
    );
    if (!data) throw "No data";
    let jsonObj = parser.parse(data);
    if (!jsonObj) throw "No JSON Object";
    let targets = jsonObj.config;
    targetIp = targets[readerName];
    console.log(
      `Target IP "${targetIp}" loaded from remote XML for target "${readerName}"`
    );
  } else if (!targetIp) return console.error("No Target IP found in config");

  if (!targetPort) return console.error("No Target Port found in config");
  if (!rfidOSCEndpoint)
    return console.error("No RFID OSC Endpoint found in config");

  console.log("Target IP Address loaded:", targetIp);
  console.log("Target Port loaded:", targetPort);
  console.log("RFID OSC Endpoint loaded:", rfidOSCEndpoint);

  oscClient = new Client(targetIp, targetPort);
};

const run = async () => {
  prompt.start();
  await init();
  read();
};

const read = async () => {
  let { rfid } = await prompt.get(["rfid"]);
  try {
    oscClient.send(rfidOSCEndpoint, parseInt(rfid), () => {});
    fs.appendFileSync(
      "log.csv",
      `${parseInt(
        rfid
      )},${Date()},${targetIp}:${targetPort},${rfidOSCEndpoint}\n`
    );

    console.log(
      `Sent RFID ${parseInt(
        rfid
      )} to ${targetIp}:${targetPort} ${rfidOSCEndpoint} at ${Date()}`
    );
  } catch (error) {
    console.error(error);
  }
  read();
};

run();
