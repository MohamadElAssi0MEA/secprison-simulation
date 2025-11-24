const { runSimulation } = require("../src/simulation");

test("returns 7 layers", () => {
  const result = runSimulation();
  expect(result.length).toBe(7);
});

test("each layer has vulnerability + analogy", () => {
  const result = runSimulation();
  for (const layer of result) {
    expect(layer.vulnerability).toBeDefined();
    expect(layer.prisonAnalogy).toBeDefined();
  }
});
