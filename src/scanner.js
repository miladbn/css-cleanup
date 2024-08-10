import fs from "fs";
import path from "path";
import * as glob from "glob";
import postcss from "postcss";
import sass from "sass";
import * as cheerio from "cheerio";
import chalk from "chalk";

export function scan(targetPath) {
  console.log(chalk.blue("Scanning for unused CSS selectors..."));

  const cssFiles = glob.sync(path.join(targetPath, "**/*.{css,scss}"));
  const selectors = new Set();

  // Collect selectors from CSS/SCSS files
  cssFiles.forEach((file) => {
    try {
      let css = "";

      if (file.endsWith(".scss")) {
        const result = sass.renderSync({ file });
        css = result.css.toString();
      } else {
        css = fs.readFileSync(file, "utf-8");
      }

      const root = postcss.parse(css);
      root.walkRules((rule) => {
        selectors.add(rule.selector.trim());
      });
    } catch (err) {
      console.error(chalk.red(`Error processing file ${file}: ${err.message}`));
    }
  });

  console.log(
    chalk.yellow(`Selectors found in CSS/SCSS: ${Array.from(selectors)}`)
  );

  const htmlFiles = glob.sync(path.join(targetPath, "**/*.{html,js,jsx}"));
  const usedSelectors = new Set();

  // Collect used selectors from HTML/JSX files
  htmlFiles.forEach((file) => {
    try {
      const content = fs.readFileSync(file, "utf-8");
      const $ = cheerio.load(content);

      $("*").each((i, elem) => {
        const classes = $(elem).attr("class");
        if (classes) {
          classes
            .split(" ")
            .forEach((cls) => usedSelectors.add("." + cls.trim()));
        }
        const id = $(elem).attr("id");
        if (id) {
          usedSelectors.add("#" + id.trim());
        }
      });
    } catch (err) {
      console.error(chalk.red(`Error processing file ${file}: ${err.message}`));
    }
  });

  console.log(
    chalk.yellow(`Selectors found in HTML/JSX: ${Array.from(usedSelectors)}`)
  );

  // Compare and find unused selectors
  const unusedSelectors = Array.from(selectors).filter(
    (selector) => !usedSelectors.has(selector)
  );

  console.log(chalk.green(`Unused selectors found: ${unusedSelectors.length}`));
  unusedSelectors.forEach((selector) => console.log(selector));
}
