import "dotenv/config";
import { inspectPage } from "../lib/scraper/html-inspector";
import { generateSchemaFromHTML } from "../lib/ai/groq";

async function main() {
    const url = "https://www.indiegogo.com/explore/all";
    const instruction = "fetch top 10 projects";

    console.log(`Testing schema generation for: ${url}`);
    console.log(`Instruction: ${instruction}\n`);

    // Step 1: Inspect page
    console.log("Step 1: Inspecting page...");
    const inspection = await inspectPage(url);

    console.log(`\nPage title: ${inspection.title}`);
    console.log(`HTML snippet length: ${inspection.htmlSnippet.length} chars`);
    console.log(`\nFound patterns:`);
    console.log(`- data-test attributes: ${inspection.patterns.dataTestAttributes.slice(0, 10).join(', ')}`);
    console.log(`- data-testid attributes: ${inspection.patterns.dataTestIdAttributes.slice(0, 10).join(', ')}`);
    console.log(`- Repeating selectors: ${inspection.patterns.repeatingSelectors.slice(0, 5).join(', ')}`);
    console.log(`- Semantic tags: ${inspection.patterns.semanticTags.join(', ')}`);

    // Step 2: Generate schema from HTML
    console.log(`\nStep 2: Generating schema from HTML...`);
    const schema = await generateSchemaFromHTML({
        url,
        instruction,
        htmlSnippet: inspection.htmlSnippet,
        patterns: inspection.patterns,
    });

    console.log(`\nGenerated schema:`);
    console.log(JSON.stringify(schema, null, 2));
}

main().catch(console.error);
