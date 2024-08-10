// src/index.js

const { scan } = require("./scanner");
const { report } = require("./reporter");
const { remove } = require("./remover");

module.exports = {
  scan,
  report,
  remove,
};
if (require.main === module) {
  const args = process.argv.slice(2);

  switch (args[0]) {
    case "scan":
      scan(args[1]);
      break;
    case "report":
      report();
      break;
    case "remove":
      remove();
      break;
    default:
      console.log("Invalid command. Use scan, report, or remove.");
  }
}
