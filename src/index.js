// src/index.js

const { scan } = require("./scanner");
const { report } = require("./reporter");
const { remove } = require("./remover");

module.exports = {
  scan,
  report,
  remove,
};
