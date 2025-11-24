const { runSimulation } = require("./simulation");

console.log("SecuPrison Simulation Output:\n");
console.log(JSON.stringify(runSimulation(), null, 2));
