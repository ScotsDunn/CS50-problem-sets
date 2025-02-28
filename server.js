const express = require('express');
const request = require('request');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

// GiveCampus donation page
const TARGET_URL = "https://www.givecampus.com/campaigns/21200/donations/new?designation=deltasigmaphifund";

// Middleware to fetch and modify the page
app.get('/donate', (req, res) => {
    request(TARGET_URL, (error, response, body) => {
        if (error) {
            return res.status(500).send("Error fetching donation page");
        }

        const $ = cheerio.load(body);

        // Inject JavaScript to select the recurring donation checkbox
        $('head').append(`
            <script>
                document.addEventListener("DOMContentLoaded", function() {
                    let recurCheckbox = document.getElementById("contribution_recur");
                    let recurringGiftDiv = document.getElementById("recurringGift");

                    if (recurCheckbox && recurringGiftDiv) {
                        recurCheckbox.checked = true;
                        recurringGiftDiv.classList.remove("hidden");
                    }
                });
            </script>
        `);

        res.send($.html());
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
