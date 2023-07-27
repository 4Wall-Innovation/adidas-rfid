const { targetIp, targetPort, rfidOSCEndpoint } = require("./config");
const prompt = require("prompt");
const { Client } = require("node-osc");

if (!targetIp) return console.error("No Target IP found in config");
if (!targetPort) return console.error("No Target Port found in config");
if (!rfidOSCEndpoint)
  return console.error("No RFID OSC Endpoint found in config");

console.log("Target IP Address loaded:", targetIp);
console.log("Target Port loaded:", targetPort);
console.log("RFID OSC Endpoint loaded:", rfidOSCEndpoint);

const oscClient = new Client(targetIp, targetPort);

const run = async () => {
  let { rfid } = await prompt.get(["rfid"]);
  try {
    oscClient.send(rfidOSCEndpoint, String(rfid), () => {});
  } catch (error) {
    console.error(error);
  }

  run();
};

prompt.start();
run();
