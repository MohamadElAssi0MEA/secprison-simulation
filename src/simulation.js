const layers = [
  { id: 1, name: "Physical", analogy: "Fence breach", vulnerabilities: ["Hardware tampering", "Cable cutting", "Physical port access"], checklistType: "Read-Do" },
  { id: 2, name: "Data Link", analogy: "Fake ID at gate", vulnerabilities: ["ARP spoofing", "MAC cloning", "Switch port misuse"], checklistType: "Read-Confirm" },
  { id: 3, name: "Network", analogy: "Corridor rerouting", vulnerabilities: ["IP spoofing", "Route poisoning", "BGP tampering"], checklistType: "Read-Do" },
  { id: 4, name: "Transport", analogy: "Guard handshake bypass", vulnerabilities: ["SYN flood", "TCP hijacking", "UDP abuse"], checklistType: "Read-Confirm" },
  { id: 5, name: "Session", analogy: "Intercom hijack", vulnerabilities: ["Session fixation", "Token replay", "Session hijacking"], checklistType: "Read-Do" },
  { id: 6, name: "Presentation", analogy: "Translator corrupted files", vulnerabilities: ["Encoding abuse", "Serialization flaws", "Data format attacks"], checklistType: "Read-Confirm" },
  { id: 7, name: "Application", analogy: "Visitor record manipulation", vulnerabilities: ["SQL injection", "XSS", "Command injection"], checklistType: "Read-Do" }
];

function pickOne(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function generateChecklist(type, layerName, vuln) {
  const templates = {
    "Read-Do": [
      "Read: Review vulnerability.",
      `Do: Locate where ${vuln} impacts ${layerName}.`,
      "Do: Apply mitigation.",
      "Do: Validate fix."
    ],
    "Read-Confirm": [
      "Read: Review vulnerability.",
      `Confirm: ${vuln} exists or does not exist in ${layerName}.`,
      "Confirm: Log evidence."
    ]
  };
  return templates[type];
}

function runSimulation() {
  return layers.map(layer => {
    const vuln = pickOne(layer.vulnerabilities);
    const checklist = generateChecklist(layer.checklistType, layer.name, vuln);
    return {
      layer: layer.name,
      vulnerability: vuln,
      prisonAnalogy: layer.analogy,
      checklistType: layer.checklistType,
      checklist
    };
  });
}

module.exports = { runSimulation };
