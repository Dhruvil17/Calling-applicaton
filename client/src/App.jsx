import axios from "axios";
import { useEffect, useRef, useState } from "react";
import "./App.css";
import { Device } from "@twilio/voice-sdk";

function App() {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [callStatus, setCallStatus] = useState("");
    const [callerId, setCallerId] = useState("");
    const [incomingCall, setIncomingCall] = useState(null); // State to handle incoming call
    const callerToken = useRef(null);
    const device = useRef(null);

    useEffect(() => {
        async function fetchToken() {
            try {
                const response = await axios.get("http://localhost:3000/token");
                callerToken.current = response.data.token;
                setCallerId(response.data.identity);
            } catch (err) {
                console.error("Error fetching token:", err);
            }
        }
        fetchToken();
    }, []);

    useEffect(() => {
        if (callerToken.current) {
            device.current = new Device(callerToken.current, {
                codecPreferences: ["opus", "pcmu"],
            });

            // to recieve incoming calls device should be registered
            device.current.register();

            device.current.on("registered", () => {
                console.log("Device registered");
            });

            device.current.on("error", (error) => {
                console.error("Device error:", error);
            });

            device.current.on("incoming", (call) => {
                setIncomingCall(call);
                setCallStatus(`Incoming call from ${call.parameters.From}`);
            });

            device.current.on("disconnect", () => {
                setCallStatus("Call disconnected");
                setIncomingCall(null);
            });
        }
    }, [callerToken.current]);

    const handleClick = async () => {
        try {
            const params = {
                To: phoneNumber,
            };

            if (device.current) {
                const call = await device.current.connect({ params });

                call.on("accept", () => {
                    setCallStatus("Call in progress...");
                });
                call.on("disconnect", () => {
                    setCallStatus("Call ended");
                });
                call.on("cancel", () => {
                    setCallStatus("Call canceled");
                    console.log("Call canceled");
                });
                call.on("error", (error) => {
                    console.error("Call error:", error);
                    setCallStatus(`Call error: ${error.message}`);
                });
            } else {
                throw new Error("Unable to make call");
            }
        } catch (error) {
            console.error("Error making call:", error);
        }
    };

    const acceptIncomingCall = () => {
        if (incomingCall) {
            incomingCall.accept();
            setCallStatus("Call in progress...");
            setIncomingCall(null);
        }
    };

    const rejectIncomingCall = () => {
        if (incomingCall) {
            incomingCall.reject();
            setCallStatus("Incoming call rejected");
            setIncomingCall(null);
        }
    };

    return (
        <>
            <div className="appBody">
                <h1>Your CallerId: {callerId}</h1>
                <label htmlFor="phone-input">Phone or CallerId</label>
                <input
                    type="text"
                    id="phone-input"
                    className="phoneInput"
                    placeholder="+919999999999"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                />

                <button
                    onClick={handleClick}
                    className="callBtn"
                    disabled={!phoneNumber.trim()}>
                    Make Call
                </button>

                {incomingCall && (
                    <div className="incomingCall">
                        <div className="callStatus">{callStatus}</div>
                        <button
                            onClick={acceptIncomingCall}
                            className="callBtn">
                            Accept
                        </button>
                        <button onClick={rejectIncomingCall} className="endBtn">
                            Reject
                        </button>
                    </div>
                )}

                {!incomingCall && (
                    <div className="callStatus">{callStatus}</div>
                )}
            </div>
        </>
    );
}

export default App;
