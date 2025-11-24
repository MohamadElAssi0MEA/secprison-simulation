import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

/*
  SecuPrison UI - Full Features
  - Interactive prison-layer map (SVG)
  - Animated vulnerability flow (D3)
  - Start / Stop / Reset simulation controls
  - MITRE ATT&CK panel (sample)
  - Dark / Light toggle
  - Export logs (JSON / CSV)
*/

// Sample layer positions for the prison map
const LAYERS = [
  { id: 1, name: "Physical", x: 50, y: 50, color: "#c0392b" },
  { id: 2, name: "Data Link", x: 200, y: 50, color: "#d35400" },
  { id: 3, name: "Network", x: 350, y: 50, color: "#f39c12" },
  { id: 4, name: "Transport", x: 500, y: 50, color: "#27ae60" },
  { id: 5, name: "Session", x: 650, y: 50, color: "#2980b9" },
  { id: 6, name: "Presentation", x: 800, y: 50, color: "#8e44ad" },
  { id: 7, name: "Application", x: 950, y: 50, color: "#2c3e50" }
];

// Sample MITRE mapping (minimal)
const MITRE_SAMPLE = {
  "Hardware tampering": { id: "T1561", desc: "Physical tampering of hardware" },
  "ARP spoofing": { id: "T1557", desc: "ARP spoofing / poison" },
  "IP spoofing": { id: "T1595", desc: "IP route manipulation" },
  "SYN flood": { id: "T1499", desc: "SYN flood / DoS" },
  "Session hijacking": { id: "T1078", desc: "Session hijacking / credential misuse" },
  "Encoding abuse": { id: "T1132", desc: "Encoding / data obfuscation" },
  "SQL injection": { id: "T1190", desc: "SQL injection" }
};

function downloadObjectAsJson(exportObj, exportName){
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj, null, 2));
  const dlAnchorElem = document.createElement('a');
  dlAnchorElem.setAttribute("href", dataStr);
  dlAnchorElem.setAttribute("download", exportName + ".json");
  dlAnchorElem.click();
}

function downloadArrayAsCSV(arr, filename){
  if(!arr || arr.length === 0) return;
  const keys = Object.keys(arr[0]);
  const csv = [
    keys.join(","),
    ...arr.map(row => keys.map(k => JSON.stringify(row[k] ?? "")).join(","))
  ].join("\n");
  const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
  const dlAnchorElem = document.createElement('a');
  dlAnchorElem.setAttribute("href", dataStr);
  dlAnchorElem.setAttribute("download", filename + ".csv");
  dlAnchorElem.click();
}

export default function App(){
  const svgRef = useRef();
  const [running, setRunning] = useState(false);
  const [simData, setSimData] = useState([]); // log of events
  const [dark, setDark] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [latestRun, setLatestRun] = useState(null);
  const animRef = useRef(null);

  useEffect(() => {
    // draw static prison map
    const svg = d3.select(svgRef.current);
    svg.attr("viewBox", "0 0 1100 200").style("background", dark ? "#111827" : "#f8fafc");
    svg.selectAll("*").remove();

    // legend / layer blocks
    const groups = svg.selectAll("g.layer")
      .data(LAYERS)
      .enter()
      .append("g")
      .attr("class", "layer")
      .attr("transform", d => `translate(${d.x}, ${d.y})`)
      .style("cursor", "pointer")
      .on("click", d => {
        setSelectedLayer(d.name);
      });

    groups.append("rect")
      .attr("width", 140)
      .attr("height", 80)
      .attr("rx", 8)
      .attr("ry", 8)
      .attr("fill", d => dark ? d3.color(d.color).darker(0.5) : d.color)
      .attr("stroke", d => dark ? "#fff" : "#222")
      .attr("stroke-width", 1.5);

    groups.append("text")
      .attr("x", 70)
      .attr("y", 44)
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .style("fill", dark ? "#fff" : "#fff")
      .style("font-weight", "700")
      .text(d => d.name);

    // if running animation, add a moving circle
    if(running){
      startAnimation(svg);
    }

    return () => {
      stopAnimation();
    };
    // re-run when dark or running toggles
  }, [dark, running]);

  function startAnimation(svg){
    // generate a run: pick one vuln per layer (client-side)
    const run = LAYERS.map(layer => {
      const candidates = {
        "Physical": ["Hardware tampering","Cable cutting","Physical port access"],
        "Data Link": ["ARP spoofing","MAC cloning","Switch port misuse"],
        "Network": ["IP spoofing","Route poisoning","BGP tampering"],
        "Transport": ["SYN flood","TCP hijacking","UDP abuse"],
        "Session": ["Session fixation","Token replay","Session hijacking"],
        "Presentation": ["Encoding abuse","Serialization flaws","Data format attacks"],
        "Application": ["SQL injection","XSS","Command injection"]
      }[layer.name];

      const vuln = candidates[Math.floor(Math.random() * candidates.length)];
      return {
        layer: layer.name,
        x: layer.x + 70, // center of rect
        y: layer.y + 40,
        vulnerability: vuln,
        analogy: layer.name + " analogy",
        checklistType: (layer.id % 2 === 1) ? "Read-Do" : "Read-Confirm",
        timestamp: new Date().toISOString()
      };
    });

    setLatestRun(run);
    setSimData(prev => [...prev, { runId: Date.now(), events: run }]);

    // animate a token moving across the layers in order
    const token = svg.append("circle")
      .attr("class", "token")
      .attr("r", 10)
      .attr("cx", run[0].x)
      .attr("cy", run[0].y)
      .attr("fill", dark ? "#f59e0b" : "#111827")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5);

    let i = 0;
    function step(){
      if(!running) return;
      i++;
      if(i >= run.length) {
        // finished
        setRunning(false);
        token.remove();
        return;
      }
      token.transition()
        .duration(900)
        .attr("cx", run[i].x)
        .attr("cy", run[i].y)
        .on("end", () => {
          // small pulse at arrival
          svg.append("circle")
            .attr("cx", run[i].x)
            .attr("cy", run[i].y)
            .attr("r", 6)
            .attr("fill", "#fff")
            .attr("opacity", 0.8)
            .transition()
            .duration(700)
            .attr("r", 24)
            .attr("opacity", 0)
            .remove();

          if(running) step();
        });
    }
    animRef.current = { token, svg };
    // kick off after tiny delay
    setTimeout(step, 300);
  }

  function stopAnimation(){
    setRunning(false);
    if(animRef.current && animRef.current.token){
      animRef.current.token.remove();
    }
    animRef.current = null;
  }

  function resetSimulation(){
    stopAnimation();
    setSimData([]);
    setLatestRun(null);
    setSelectedLayer(null);
  }

  function exportLatestJSON(){
    if(!latestRun) return alert("No run available to export.");
    downloadObjectAsJson(latestRun, "secuprison-latest-run");
  }

  function exportAllCSV(){
    if(!simData || simData.length === 0) return alert("No logs to export.");
    // flatten events
    const flat = simData.flatMap(s => s.events.map(e => ({ runId: s.runId, ...e })));
    downloadArrayAsCSV(flat, "secuprison-all-runs");
  }

  // MITRE panel lookup
  function mitreFor(vuln){
    return MITRE_SAMPLE[vuln] || null;
  }

  return (
    <div style={{ fontFamily: "system-ui, Arial", color: dark ? "#e5e7eb" : "#0f172a", padding: 12 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <h1>SecuPrison — Interactive Simulation</h1>
        <div>
          <button onClick={() => setDark(d => !d)} style={{ marginRight: 8 }}>
            {dark ? "Switch to Light" : "Switch to Dark"}
          </button>
          <button onClick={() => { if(running) stopAnimation(); else setRunning(true); }} style={{ marginRight: 8 }}>
            {running ? "Stop" : "Start"}
          </button>
          <button onClick={resetSimulation} style={{ marginRight: 8 }}>Reset</button>
          <button onClick={exportLatestJSON} style={{ marginRight: 8 }}>Export Latest (JSON)</button>
          <button onClick={exportAllCSV}>Export All (CSV)</button>
        </div>
      </header>

      <main style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
        <section style={{ background: dark ? "#0b1220" : "#ffffff", padding: 12, borderRadius: 8, boxShadow: "0 2px 6px rgba(0,0,0,0.08)" }}>
          <svg ref={svgRef} width="100%" height="240" />
          <div style={{ marginTop: 12 }}>
            <strong>Selected Layer:</strong> {selectedLayer || "None"} &nbsp;
            {selectedLayer && <button onClick={() => {
              // open MITRE info for the first vulnerability we can map from latestRun
              const event = latestRun && latestRun.find(e => e.layer === selectedLayer);
              if(event){
                const m = mitreFor(event.vulnerability);
                if(m) alert(`${m.id}: ${m.desc}\n\nVulnerability: ${event.vulnerability}`);
                else alert(`No MITRE mapping for ${event.vulnerability}`);
              } else {
                alert("No event yet for this layer. Start the simulation.");
              }
            }}>Show MITRE</button>}
          </div>
        </section>

        <aside style={{ background: dark ? "#071025" : "#ffffff", padding: 12, borderRadius: 8 }}>
          <h3>Latest Run</h3>
          {!latestRun && <p>No run yet — press Start.</p>}
          {latestRun && (
            <div>
              <ol>
                {latestRun.map((e, idx) => (
                  <li key={idx} style={{ marginBottom: 8 }}>
                    <strong>{e.layer}</strong>: {e.vulnerability} <br />
                    <small>{e.checklistType} — {e.timestamp}</small><br />
                    <button onClick={() => {
                      const m = mitreFor(e.vulnerability);
                      if(m) alert(`${m.id}: ${m.desc}`);
                      else alert("No MITRE mapping available for this vulnerability.");
                    }}>MITRE</button>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <hr />

          <h4>Simulation Logs</h4>
          <p>Total runs: {simData.length}</p>
          <details>
            <summary>View raw logs</summary>
            <pre style={{ maxHeight: 200, overflow: "auto", background: dark ? "#02121a" : "#f8fafc", padding: 8 }}>
              {JSON.stringify(simData, null, 2)}
            </pre>
          </details>
        </aside>
      </main>

      <footer style={{ marginTop: 12, fontSize: 12 }}>
        <div>
          Paper (uploaded): <code>/mnt/data/USENIX Official Conference Paper (2).pdf</code>
        </div>
      </footer>
    </div>
  );
}
