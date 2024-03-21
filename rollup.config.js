"use strict";

let clear = require("rollup-plugin-clear");
let resolve = require("@rollup/plugin-node-resolve");
let commonjs = require("@rollup/plugin-commonjs");
let screeps = require("rollup-plugin-screeps");
let json = require("@rollup/plugin-json");

let cfg;
const dest = process.env.DEST;
if (!dest) {
  console.log(
    "No destination specified - code will be compiled but not uploaded"
  );
} else if ((cfg = require("./screeps.json")[dest]) == null) {
  throw new Error("Invalid upload destination");
}

module.exports = {
  input: "src/main.js",
  output: {
    file: "dist/main.js",
    format: "cjs",
  },

  plugins: [
    clear({ targets: ["dist"] }),
    resolve({ rootDir: "src" }),
    commonjs(),
    json(),
    screeps({ config: cfg, dryRun: cfg == null }),
  ],
};
