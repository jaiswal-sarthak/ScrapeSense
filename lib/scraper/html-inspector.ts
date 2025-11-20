import { chromium } from "playwright";

interface PagePatterns {
    dataTestAttributes: string[];
    dataTestIdAttributes: string[];
    commonClasses: string[];
    repeatingSelectors: string[];
    semanticTags: string[];
}

interface InspectionResult {
    html: string;
    htmlSnippet: string; // First 15KB for AI
    patterns: PagePatterns;
    title: string;
}

/**
 * Inspects a webpage and extracts HTML structure and patterns
 * for AI-based schema generation
 */
export async function inspectPage(url: string): Promise<InspectionResult> {
    let browser;
    try {
        browser = await chromium.launch({
            headless: true,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-accelerated-2d-canvas",
                "--no-first-run",
                "--no-zygote",
                "--single-process",
            ],
        });
    } catch (error: any) {
        if (error.message?.includes("Executable doesn't exist") || error.message?.includes("browserType.launch")) {
            throw new Error(
                "Playwright browser not installed. Please ensure 'npx playwright install chromium' runs during build."
            );
        }
        throw error;
    }
    const page = await browser.newPage();

    try {
        console.log(`Inspecting: ${url}`);
        await page.goto(url, {
            waitUntil: "domcontentloaded",
            timeout: 30000
        });

        // Wait for dynamic content to load
        await page.waitForTimeout(3000);

        // Get page title
        const title = await page.title();

        // Get full HTML
        const html = await page.content();

        // Extract patterns using browser context
        const patterns = await page.evaluate(() => {
            const result: PagePatterns = {
                dataTestAttributes: [],
                dataTestIdAttributes: [],
                commonClasses: [],
                repeatingSelectors: [],
                semanticTags: [],
            };

            // Find all data-test attributes
            const dataTestElements = document.querySelectorAll('[data-test]');
            result.dataTestAttributes = Array.from(dataTestElements)
                .map(el => el.getAttribute('data-test'))
                .filter((attr): attr is string => attr !== null)
                .slice(0, 50); // Limit to 50

            // Find all data-testid attributes
            const dataTestIdElements = document.querySelectorAll('[data-testid]');
            result.dataTestIdAttributes = Array.from(dataTestIdElements)
                .map(el => el.getAttribute('data-testid'))
                .filter((attr): attr is string => attr !== null)
                .slice(0, 50);

            // Find common class patterns (classes used 3+ times)
            const classMap = new Map<string, number>();
            document.querySelectorAll('[class]').forEach(el => {
                const classes = el.className.split(' ').filter(c => c.trim());
                classes.forEach(cls => {
                    classMap.set(cls, (classMap.get(cls) || 0) + 1);
                });
            });

            result.commonClasses = Array.from(classMap.entries())
                .filter(([, count]) => count >= 3)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 30)
                .map(([cls]) => cls);

            // Find semantic tags
            const semanticSelectors = ['article', 'section', 'main', 'aside', 'nav', 'header', 'footer'];
            semanticSelectors.forEach(tag => {
                const count = document.querySelectorAll(tag).length;
                if (count > 0) {
                    result.semanticTags.push(`${tag} (${count})`);
                }
            });

            // Find repeating patterns (elements with same tag+class appearing 3+ times)
            const elementMap = new Map<string, number>();
            document.querySelectorAll('*').forEach(el => {
                if (el.className && typeof el.className === 'string') {
                    const firstClass = el.className.split(' ')[0];
                    if (firstClass) {
                        const selector = `${el.tagName.toLowerCase()}.${firstClass}`;
                        elementMap.set(selector, (elementMap.get(selector) || 0) + 1);
                    }
                }
            });

            result.repeatingSelectors = Array.from(elementMap.entries())
                .filter(([, count]) => count >= 3)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 20)
                .map(([selector, count]) => `${selector} (${count})`);

            return result;
        });

        // Create HTML snippet for AI (first 15KB)
        const htmlSnippet = html.substring(0, 15000);

        await browser.close();

        return {
            html,
            htmlSnippet,
            patterns,
            title,
        };
    } catch (error) {
        await browser.close();
        throw error;
    }
}

/**
 * Find the most likely container selector for repeating items
 */
export function suggestContainerSelector(patterns: PagePatterns): string | null {
    // Priority 1: data-test attributes with common patterns
    const itemPatterns = ['item', 'post', 'card', 'row', 'entry', 'product'];
    for (const pattern of itemPatterns) {
        const match = patterns.dataTestAttributes.find(attr =>
            attr.toLowerCase().includes(pattern)
        );
        if (match) {
            return `[data-test^="${match.split('-')[0]}"]`;
        }
    }

    // Priority 2: data-testid attributes
    for (const pattern of itemPatterns) {
        const match = patterns.dataTestIdAttributes.find(attr =>
            attr.toLowerCase().includes(pattern)
        );
        if (match) {
            return `[data-testid^="${match.split('-')[0]}"]`;
        }
    }

    // Priority 3: Repeating selectors
    if (patterns.repeatingSelectors.length > 0) {
        const first = patterns.repeatingSelectors[0];
        return first.split(' (')[0]; // Remove count
    }

    return null;
}
