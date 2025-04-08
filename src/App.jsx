import { useEffect, useState } from "react";
import mqtt from "mqtt";

function App() {
  const [client, setClient] = useState(null);
  const [connected, setConnected] = useState(false);
  const [brightness, setBrightness] = useState(128);
  const [linked, setLinked] = useState(true);
  const [states, setStates] = useState({
    hue_play_left: "OFF",
    hue_play_right: "OFF",
  });

  useEffect(() => {
    const mqttUrl = "ws://192.168.50.223:9001";
    const mqttClient = mqtt.connect(mqttUrl);

    mqttClient.on("connect", () => {
      console.log("✅ MQTT connected");
      setConnected(true);
      mqttClient.subscribe("zigbee2mqtt/+/state");
    });

    mqttClient.on("message", (topic, message) => {
      const [, lamp] = topic.split("/");
      const state = message.toString();
      setStates((prev) => ({ ...prev, [lamp]: state }));
    });

    mqttClient.on("error", (err) => {
      console.error("MQTT connection error:", err);
      mqttClient.end();
    });

    setClient(mqttClient);

    return () => mqttClient.end();
  }, []);

  const publishState = (lamp, state) => {
    if (client && connected) {
      const payload = JSON.stringify({ state });
      client.publish(`zigbee2mqtt/${lamp}/set`, payload);
    }
  };

  const publishBrightness = (lamp, bri) => {
    if (client && connected) {
      const payload = JSON.stringify({ brightness: parseInt(bri) });
      client.publish(`zigbee2mqtt/${lamp}/set`, payload);
      setBrightness(bri);
    }
  };

  const handleToggle = (lamp, state) => {
    if (linked) {
      publishState("hue_play_left", state);
      publishState("hue_play_right", state);
    } else {
      publishState(lamp, state);
    }
  };

  const handleBrightness = (lamp, value) => {
    if (linked) {
      publishBrightness("hue_play_left", value);
      publishBrightness("hue_play_right", value);
    } else {
      publishBrightness(lamp, value);
    }
  };

  const getStatusIcon = (lamp) => {
    const state = linked ? states.hue_play_left : states[lamp];
    return state === "ON" ? "💡" : "❌";
  };

  return (
    <div style={{
      fontFamily: "Segoe UI, sans-serif",
      padding: "2rem",
      backgroundColor: "#1e1e2f",
      color: "#ffffff",
      minHeight: "100vh"
    }}>
      <h1 style={{ textAlign: "center" }}>💡 Smart Home Dashboard</h1>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: "2rem" }}>
        <button
          onClick={() => setLinked(!linked)}
          style={{
            padding: "0.5rem 1.5rem",
            backgroundColor: linked ? "#4caf50" : "#f44336",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "1rem"
          }}
        >
          {linked ? "🔗 Linked Mode" : "🔓 Individual Mode"}
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: "3rem" }}>
        {(linked ? ["both"] : ["hue_play_left", "hue_play_right"]).map((lamp) => (
          <div
            key={lamp}
            style={{
              backgroundColor: "#2b2b3c",
              borderRadius: "12px",
              padding: "1.5rem",
              width: "220px",
              textAlign: "center",
              boxShadow: "0 0 15px rgba(0,0,0,0.4)"
            }}
          >
            <h2 style={{ marginBottom: "1rem" }}>
              {lamp === "both"
                ? "Both Lamps"
                : `${getStatusIcon(lamp)} ${lamp.replace("hue_play_", "Hue ").replace("_", " ")}`}
            </h2>
            <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
              <button
                onClick={() => handleToggle(lamp === "both" ? null : lamp, "ON")}
                style={{ padding: "0.4rem 0.8rem", backgroundColor: "#2196f3", color: "white", border: "none", borderRadius: "4px" }}
              >
                ON
              </button>
              <button
                onClick={() => handleToggle(lamp === "both" ? null : lamp, "OFF")}
                style={{ padding: "0.4rem 0.8rem", backgroundColor: "#9e9e9e", color: "white", border: "none", borderRadius: "4px" }}
              >
                OFF
              </button>
            </div>
            <div style={{
              marginTop: "1.5rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }}>
              <label style={{ marginBottom: "0.5rem" }}>Brightness</label>
              <input
                type="range"
                min="0"
                max="254"
                value={brightness}
                onChange={(e) => handleBrightness(lamp === "both" ? null : lamp, e.target.value)}
                style={{
                  writingMode: "bt-lr",
                  WebkitAppearance: "slider-vertical",
                  width: "30px",
                  height: "160px"
                }}
              />
              <div style={{ marginTop: "0.5rem", fontSize: "0.9rem" }}>{brightness}</div>
            </div>
          </div>
        ))}
      </div>

      <p style={{ textAlign: "center", marginTop: "2rem", color: connected ? "#4caf50" : "#f44336" }}>
        {connected ? "🟢 Connected to MQTT" : "🔴 Disconnected from MQTT"}
      </p>
    </div>
  );
}

export default App;
