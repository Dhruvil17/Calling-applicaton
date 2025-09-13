const VoiceResponse = require("twilio").twiml.VoiceResponse;
const AccessToken = require("twilio").jwt.AccessToken;
const VoiceGrant = AccessToken.VoiceGrant;
const querystring = require("querystring");
const axios = require("axios");
const config = require("./ENV_CONFIG");
const nameGenerator = require("./nameGenerator/nameGenerator");

let identity;
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;

exports.tokenGenerator = function tokenGenerator() {
    try {
        // generating a random name
        identity = nameGenerator();

        // Validate required config values
        if (
            !config.twilioAccountSid ||
            !config.apiKey ||
            !config.apiSecret ||
            !config.twimlAppSid
        ) {
            throw new Error("Missing required Twilio configuration values");
        }

        const accessToken = new AccessToken(
            config.twilioAccountSid,
            config.apiKey,
            config.apiSecret,
            { identity }
        );

        const grant = new VoiceGrant({
            outgoingApplicationSid: config.twimlAppSid,
            incomingAllow: true,
        });
        accessToken.addGrant(grant);

        console.log(`Generated token for identity: ${identity}`);

        // Include identity and token in a JSON response
        return {
            identity: identity,
            token: accessToken.toJwt(),
        };
    } catch (error) {
        console.error("Error generating token:", error);
        throw error;
    }
};

exports.voiceResponse = function voiceResponse(requestBody) {
    console.log(requestBody);
    const toNumberOrClientName = requestBody.To;
    const callerId = config.callerId;

    // If the request to the /voice endpoint is TO your Twilio Number,
    // then it is an incoming call towards your Twilio.Device.
    if (toNumberOrClientName == callerId) {
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
        <Response>
            <Dial callerId="${callerId}" answerOnBridge="true" timeLimit="5400" timeout="20">
                <Client statusCallbackEvent="ringing answered completed" statusCallback="${config.frontendUrl}/api/twilioCallback" statusCallbackMethod="POST">
                    <Identity>${identity}</Identity>
                </Client>
            </Dial>
        </Response>`;

        console.log("Generated XML:", xml);
        return xml;
    } else if (requestBody.To) {
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
        <Response>
            <Dial callerId="${callerId}" answerOnBridge="true" timeLimit="5400" timeout="20">
                <Number statusCallbackEvent="initiated ringing answered completed" statusCallback="${config.frontendUrl}/api/twilioCallback" statusCallbackMethod="POST">
                    ${toNumberOrClientName}
                </Number>
            </Dial>
        </Response>`;

        console.log("Generated XML:", xml);
        return xml;
    } else {
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
        <Response>
            <Say>Thanks for calling!</Say>
        </Response>`;

        console.log("Generated XML:", xml);
        return xml;
    }
};

function aiVoiceBotCall(BLegCallUUID) {
    console.log("Calling AI Voice BOT");

    let data = querystring.stringify({
        Url: process.env.AI_AGENT_BASE_URL,
    });

    let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Calls/${BLegCallUUID}/Streams.json`,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization:
                "Basic QUM5MTJiMzFjNDQxYTIzZjQzZDc0NzBkMzAxNDM3ODhjOToxOTJhYjRlOTI1OTMxMzllNWJiNzA4MzNiMmQ4MGJjMQ==",
        },
        data: data,
    };

    axios
        .request(config)
        .then((response) => {
            console.log(JSON.stringify(response.data));
        })
        .catch((error) => {
            if (error.response) {
                console.error(
                    `AI Voice Bot Stream failed: ${error.response.status} - ${error.response.data.message}`
                );
                console.error(`Error code: ${error.response.data.code}`);
            } else {
                console.error(
                    "AI Voice Bot Stream request failed:",
                    error.message
                );
            }
        });
}

exports.twilioCallback = function twilioCallback(requestBody, queryParams) {
    console.log("Twilio Status Callback received:");
    console.log("Body:", requestBody);
    console.log("Query params:", queryParams);

    const {
        CallSid,
        CallStatus,
        From,
        To,
        Direction,
        Duration,
        CallDuration,
        Timestamp,
    } = requestBody;

    if (CallStatus === "in-progress") {
        console.log("AI voice bot call initiated");
        aiVoiceBotCall(CallSid);
    }

    console.log(`Call ${CallSid} status: ${CallStatus}`);
    console.log(`From: ${From} To: ${To}`);
    console.log(`Direction: ${Direction}`);
    console.log(`Duration: ${Duration || CallDuration} seconds`);

    return "OK";
};

exports.hangup = function hangup(requestBody, queryParams) {
    console.log("Hangup endpoint called:");
    console.log("Body:", requestBody);
    console.log("Query params:", queryParams);

    const {
        CallSid,
        CallStatus,
        From,
        To,
        Direction,
        Duration,
        CallDuration,
        Timestamp,
    } = requestBody;

    console.log(`Hanging up call ${CallSid}`);
    console.log(`Call status: ${CallStatus}`);
    console.log(`From: ${From} To: ${To}`);
    console.log(`Duration: ${Duration || CallDuration} seconds`);

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <Response>
        <Hangup/>
    </Response>`;

    console.log("Generated hangup XML:", xml);
    return xml;
};
