import { useEffect, useState } from "react";
import mqtt from "mqtt";

function App() {
  const [client, setClient] = useState(null);
  const [connected, setConnected] = useState(false);
  const [lightState, setLightState] = useState("OFF");
  const [brightness, setBrightness] = useState(128);

  useEffect(() => {
    const mqttUrl = "ws://192.168.50.223:9001"; // Replace with your MQTT broker IP + WebSocket port
    const mqttClient = mqtt.connect(mqttUrl);

    mqttClient.on("connect", () => {
      console.log("✅ MQTT connected");
      setConnected(true);
    });

    mqttClient.on("error", (err) => {
      console.error("MQTT connection error:", err);
      mqttClient.end();
    });

    setClient(mqttClient);

    return () => mqttClient.end();
  }, []);

  const publishState = (state) => {
    if (client && connected) {
      const payload = JSON.stringify({ state });
      client.publish("zigbee2mqtt/hue_play_right/set", payload);
      setLightState(state);
    }
  };

  const publishBrightness = (bri) => {
    if (client && connected) {
      const payload = JSON.stringify({ brightness: parseInt(bri) });
      client.publish("zigbee2mqtt/hue_play_right/set", payload);
      setBrightness(bri);
    }
  };

  return (
    <div style={{ fontFamily: "Arial", padding: "2rem" }}>
      <h1>Hue Play Control Panel</h1>
      <p>Status: {connected ? "🟢 Connected" : "🔴 Disconnected"}</p>
      <button onClick={() => publishState("ON")}>Turn ON</button>
      <button onClick={() => publishState("OFF")} style={{ marginLeft: "1rem" }}>
        Turn OFF
      </button>
      <div style={{ marginTop: "2rem" }}>
        <label>Brightness: {brightness}</label>
        <br />
        <input
          type="range"
          min="0"
          max="254"
          value={brightness}
          onChange={(e) => publishBrightness(e.target.value)}
        />
      </div>
    </div>
  );
}

export default App;

