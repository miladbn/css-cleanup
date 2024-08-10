import fs from "fs";
import path from "path";
import * as glob from "glob";
import postcss from "postcss";
import sass from "sass";
import * as cheerio from "cheerio";
import chalk from "chalk";
import { parse as parseJSX } from "react-docgen"; // This helps to parse JSX files for CSS classes.

export function scan(targetPath) {
  console.log(chalk.blue("Scanning for unused CSS selectors..."));

  const cssFiles = glob.sync(path.join(targetPath, "**/*.{css,scss}"));
  const selectors = [];

  cssFiles.forEach((file) => {
    let css = "";

    if (file.endsWith(".scss")) {
      // Compile SCSS to CSS
      const result = sass.renderSync({ file });
      css = result.css.toString();
    } else {
      // Read CSS file directly
      css = fs.readFileSync(file, "utf-8");
    }

    const root = postcss.parse(css);
    root.walkRules((rule) => {
      selectors.push(rule.selector);
    });
  });

  const htmlFiles = glob.sync(path.join(targetPath, "**/*.{html,js,jsx}"));
  const usedSelectors = [];

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

    if (file.endsWith(".jsx")) {
      // Parse JSX files to extract class names and IDs
      const jsxContent = content;
      const jsxClasses = extractJsxClasses(jsxContent);
      usedSelectors.push(...jsxClasses);
    }
  });

  const unusedSelectors = selectors.filter(
    (selector) => !usedSelectors.includes(selector)
  );

  console.log(chalk.green(`Unused selectors found: ${unusedSelectors.length}`));
  unusedSelectors.forEach((selector) => console.log(selector));
}

function extractJsxClasses(content) {
  const classRegex = /className=["' ]([^"' ]+)/g;
  const idRegex = /id=["' ]([^"' ]+)/g;
  const selectors = [];
  let match;

  while ((match = classRegex.exec(content)) !== null) {
    selectors.push("." + match[1]);
  }

  while ((match = idRegex.exec(content)) !== null) {
    selectors.push("#" + match[1]);
  }

  return selectors;
}
