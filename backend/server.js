const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// 🔴 PASTE YOUR API KEY HERE
const genAI = new GoogleGenerativeAI("AIzaSyC9cC763eFyRCr9yN8IScddJ2gXbNyamBc");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

app.post('/verify-issue', async (req, res) => {
    try {
        const { title, description, image_base64 } = req.body;

        const prompt = `
        You are an AI verification engine for a college civic issue reporting system.
        INPUT: 
        Title: "${title}"
        Description: "${description}"
        
You are an AI verification assistant for a campus issue reporting system.

The user submits:
- a title
- a description
- an image

Your task is to decide whether the report appears reasonably genuine.

Verification rules:

1. Mark as GENUINE if:
   - the image appears to be a real photo (not a meme, screenshot, cartoon, or AI art)
   - the image shows something that could realistically be related to the issue
   - the title and description share some meaningful keywords or context with the image
   - an exact match is NOT required, only logical consistency

2. Mark as NOT_GENUINE only if:
   - the image is clearly fake, edited, meme, screenshot, or unrelated
   - or the content is misleading or intentionally wrong

3. Mark as ERROR if:
   - the image is too blurry, blank, corrupted, or unreadable

Important guidelines:
- Be practical, not strict.
- Think like a human reviewer.
- Small mismatches are acceptable.
- Partial keyword match is sufficient.
- If the issue could reasonably exist in a campus environment, allow it.

Response format (VERY IMPORTANT):
Return ONLY one of the following exactly:

AI_VERIFIED: GENUINE
AI_VERIFIED: NOT_GENUINE
AI_VERIFIED: ERROR

Do not explain.
Do not add any extra text.
Do not include punctuation.
        `;

        const result = await model.generateContent([
            prompt,
            { inlineData: { data: image_base64, mimeType: "image/jpeg" } }
        ]);

        const text = result.response.text().trim();
        console.log("Gemini Verdict:", text);
        res.send(text);

    } catch (error) {
        console.error(error);
        res.status(500).send("AI_VERIFIED: ERROR");
    }
});

app.listen(port, () => console.log(`🚀 AI Server running at http://localhost:${port}`));