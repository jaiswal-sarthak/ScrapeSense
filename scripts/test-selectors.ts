import fs from "fs";
import { parse } from "node-html-parser";

const html = fs.readFileSync("debug.html", "utf-8");
const root = parse(html);

console.log("Finding post container...");

// Find elements with data-test starting with "post-name-"
const postNames = root.querySelectorAll("[data-test^='post-name-']");
console.log(`Found ${postNames.length} post names.`);

if (postNames.length > 0) {
    const firstPostName = postNames[0];
    console.log(`First post name data-test: ${firstPostName.getAttribute("data-test")}`);

    // Go up to find the container
    let parent = firstPostName.parentNode;
    let depth = 0;
    while (parent && depth < 5) {
        console.log(`Parent ${depth} tag: ${parent.tagName}, class: ${parent.getAttribute("class")}, data-test: ${parent.getAttribute("data-test")}`);
        // console.log(`Parent ${depth} HTML: ${parent.outerHTML.substring(0, 100)}...`);
        parent = parent.parentNode;
        depth++;
    }
}
