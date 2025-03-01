const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;
const TARGET_URL = "https://www.givecampus.com/campaigns/21200/donations/new?designation=deltasigmaphifund";

// Home route
app.get('/', (req, res) => {
    res.send('<h1>GiveCampus Proxy is Running!</h1><p>Go to <a href="/donate">/donate</a> to access the donation page.</p>');
});

// Puppeteer Proxy to Load GiveCampus
app.get('/donate', async (req, res) => {
    try {
        console.log("Launching Puppeteer...");
        
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            headless: true
        });
        const page = await browser.newPage();

        console.log("Navigating to GiveCampus...");
        await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });

        console.log("Modifying donation page...");
        await page.evaluate(() => {
            let recurCheckbox = document.getElementById("contribution_recur");
            let recurringGiftDiv = document.getElementById("recurringGift");

            if (recurCheckbox && recurringGiftDiv) {
                recurCheckbox.checked = true;
                recurringGiftDiv.classList.remove("hidden");
            }
        });

        // Get the modified page content
        const modifiedHtml = await page.content();

        console.log("Closing Puppeteer...");
        await browser.close();

        res.send(modifiedHtml);

    } catch (error) {
        console.error("Puppeteer Error:", error);
        res.status(500).send("Error loading the donation page");
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
