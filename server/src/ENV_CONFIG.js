require("dotenv/config");
const config = {};

const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const callerId = process.env.TWILIO_CALLER_ID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twimlAppSid = process.env.TWILIO_TWIML_APP_SID;
const API_KEY = process.env.TWILIO_API_KEY;
const twilioSecret = process.env.TWILIO_API_SECRET;
const appUrl = process.env.APP_URL;

config.twilioAccountSid = twilioAccountSid;
config.callerId = callerId;
config.authToken = authToken;
config.twimlAppSid = twimlAppSid;
config.apiKey = API_KEY;
config.apiSecret = twilioSecret;
config.appUrl = appUrl;

module.exports = config;
