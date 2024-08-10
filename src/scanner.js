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

  // Ensure we are finding and reading CSS/SCSS files
  if (cssFiles.length === 0) {
    console.log(chalk.red("No CSS or SCSS files found!"));
    return;
  }

  cssFiles.forEach((file) => {
    console.log(chalk.blue(`Processing file: ${file}`));

    try {
      let css = "";

      if (file.endsWith(".scss")) {
        console.log(chalk.yellow("Compiling SCSS file..."));
        const result = sass.renderSync({ file });
        css = result.css.toString();
      } else {
        console.log(chalk.yellow("Reading CSS file..."));
        css = fs.readFileSync(file, "utf-8");
      }

      console.log(chalk.green(`File content:\n${css}`));

      const root = postcss.parse(css);
      root.walkRules((rule) => {
        console.log(chalk.cyan(`Selector found: ${rule.selector}`));
        selectors.add(rule.selector.trim());
      });
    } catch (err) {
      console.error(chalk.red(`Error processing file ${file}: ${err.message}`));
    }
  });

  console.log(
    chalk.yellow(`Selectors found in CSS/SCSS: ${Array.from(selectors)}`)
  );

  // No need to proceed further if no selectors were found
  if (selectors.size === 0) {
    console.log(chalk.red("No selectors found in CSS/SCSS files."));
    return;
  }
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
