// src/scanner.js
const fs = require("fs");
const path = require("path");
const glob = require("glob");
const postcss = require("postcss");
const cheerio = require("cheerio");
const chalk = require("chalk");

function scan(targetPath) {
  console.log(chalk.blue("Scanning for unused CSS selectors..."));

  // Find all CSS files
  const cssFiles = glob.sync(path.join(targetPath, "**/*.css"));
  const selectors = [];

  // Parse CSS files and extract selectors
  cssFiles.forEach((file) => {
    const css = fs.readFileSync(file, "utf-8");
    const root = postcss.parse(css);
    root.walkRules((rule) => {
      selectors.push(rule.selector);
    });
  });

  // Find all HTML/JS files
  const htmlFiles = glob.sync(path.join(targetPath, "**/*.{html,js}"));
  const usedSelectors = [];

  // Parse HTML/JS files and extract used selectors
  htmlFiles.forEach((file) => {
    const content = fs.readFileSync(file, "utf-8");
    const $ = cheerio.load(content);

    $("*").each((i, elem) => {
      const classes = $(elem).attr("class");
      if (classes) {
        classes.split(" ").forEach((cls) => usedSelectors.push("." + cls));
      }
      const id = $(elem).attr("id");
      if (id) {
        usedSelectors.push("#" + id);
      }
      usedSelectors.push($(elem)[0].name);
    });
  });

  // Find unused selectors
  const unusedSelectors = selectors.filter(
    (selector) => !usedSelectors.includes(selector)
  );

  console.log(chalk.green(`Unused selectors found: ${unusedSelectors.length}`));
  unusedSelectors.forEach((selector) => console.log(selector));
}

module.exports = { scan };
