import "dotenv/config";
import { chromium } from "playwright";
import fs from "fs";

async function main() {
    const browser = await chromium.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage({
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });

    try {
        console.log("Navigating to Product Hunt...");
        await page.goto("https://www.producthunt.com/", { waitUntil: "domcontentloaded", timeout: 60000 });

        const content = await page.content();
        fs.writeFileSync("debug.html", content);
        console.log("HTML saved to debug.html");

        const title = await page.title();
        console.log("Page Title:", title);

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await browser.close();
    }
}

main();
