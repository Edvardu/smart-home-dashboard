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
      setStates((prev) => ({ ...prev, [lamp]: state }));
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

  return (
    <div style={{ fontFamily: "Arial", padding: "2rem" }}>
      <h1>Hue Play Control Panel</h1>
      <p>Status: {connected ? "🟢 Connected" : "🔴 Disconnected"}</p>

      <button onClick={() => setLinked(!linked)}>
        {linked ? "🔗 Linked" : "🔓 Unlinked"}
      </button>

      {linked ? (
        <div style={{ marginTop: "2rem" }}>
          <h3>Both Lights</h3>
          <button onClick={() => handleToggle(null, "ON")}>Turn ON</button>
          <button onClick={() => handleToggle(null, "OFF")} style={{ marginLeft: "1rem" }}>
            Turn OFF
          </button>
          <div style={{ marginTop: "1rem" }}>
            <label>Brightness: {brightness}</label>
            <br />
            <input
              type="range"
              min="0"
              max="254"
              value={brightness}
              onChange={(e) => handleBrightness(null, e.target.value)}
            />
          </div>
        </div>
      ) : (
        ["hue_play_left", "hue_play_right"].map((lamp) => (
          <div key={lamp} style={{ marginTop: "2rem" }}>
            <h3>{lamp.replace("hue_play_", "Hue ").replace("_", " ")}</h3>
            <button onClick={() => handleToggle(lamp, "ON")}>Turn ON</button>
            <button onClick={() => handleToggle(lamp, "OFF")} style={{ marginLeft: "1rem" }}>
              Turn OFF
            </button>
            <div style={{ marginTop: "1rem" }}>
              <label>Brightness: {brightness}</label>
              <br />
              <input
                type="range"
                min="0"
                max="254"
                value={brightness}
                onChange={(e) => handleBrightness(lamp, e.target.value)}
              />
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default App;


