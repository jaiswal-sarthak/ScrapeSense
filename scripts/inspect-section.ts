import fs from "fs";
import { parse } from "node-html-parser";

const html = fs.readFileSync("debug.html", "utf-8");
const root = parse(html);

console.log("Inspecting data-test attributes in homepage section...");

const section = root.querySelector("[data-test='homepage-section-today']");
if (section) {
    const elementsWithDataTest = section.querySelectorAll("[data-test]");
    console.log(`Found ${elementsWithDataTest.length} elements with data-test.`);

    const seen = new Set();
    for (const el of elementsWithDataTest) {
        const val = el.getAttribute("data-test");
        if (val && !seen.has(val)) {
            // Simplify dynamic IDs
            const simplified = val.replace(/\d+/g, "{id}");
            if (!seen.has(simplified)) {
                console.log(`data-test: ${val} (Tag: ${el.tagName})`);
                console.log(`  HTML: ${el.outerHTML.substring(0, 100)}...`);
                seen.add(simplified);
            }
        }
    }
}
