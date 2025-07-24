const express = require("express");
const router = express.Router();


const spreadsheetData = {
  sheet1: {
    A1: { formula: "=B1+C1", dependsOn: ["B1", "C1"] },
    B1: { formula: "=D1", dependsOn: ["D1"] },
    C1: { formula: "=D1+E1", dependsOn: ["D1", "E1"] },
    D1: { formula: "=1", dependsOn: [] },
    E1: { formula: "=2", dependsOn: [] },
  }};


function getReverseDeps(sheetId) {
  const reverse = {};
  const cells = spreadsheetData[sheetId];

  for (const [cell, data] of Object.entries(cells)) {
    for (const dep of data.dependsOn) {
      if (!reverse[dep]) reverse[dep] = [];
      reverse[dep].push(cell);
    }
  }

  return reverse;
}


router.get("/:sheetId/cells/:cellId/dependents", (req, res) => {
  const { sheetId, cellId } = req.params;
  const visited = new Set();
  const result = [];

  const reverseDeps = getReverseDeps(sheetId);

  function dfs(cell) {
    if (visited.has(cell)) return;
    visited.add(cell);
    if (reverseDeps[cell]) {
      for (const dependent of reverseDeps[cell]) {
        result.push(dependent);
        dfs(dependent);
      }
    }
  }

  dfs(cellId);
  res.json({ dependents: result });
});


router.get("/:sheetId/cells/:cellId/dependencies", (req, res) => {
  const { sheetId, cellId } = req.params;
  const cell = spreadsheetData[sheetId]?.[cellId];
  if (!cell) return res.status(404).json({ error: "Cell not found" });
  res.json({ dependencies: cell.dependsOn });
});


router.get("/:sheetId/recalculate-order/:cellId", (req, res) => {
  const { sheetId, cellId } = req.params;
  const visited = new Set();
  const visiting = new Set();
  const result = [];

  const graph = spreadsheetData[sheetId];

  function dfs(node) {
    if (visiting.has(node)) throw new Error("Cycle detected!");
    if (visited.has(node)) return;

    visiting.add(node);

    for (const dep of graph[node]?.dependsOn || []) {
      dfs(dep);
    }

    visiting.delete(node);
    visited.add(node);
    result.push(node);
  }

  try {
    dfs(cellId);
    res.json({ recalculationOrder: result.reverse() });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
