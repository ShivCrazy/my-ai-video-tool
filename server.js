// server.js
// Simple Node + Express server to handle /generate for all 3 types.
// Paste this file into your repo as server.js.

const express = require('express');
const fetch = require('node-fetch'); // node >=18 has global fetch; this keeps compatibility
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json({ limit: '10mb' }));

// ---------- CONFIG ----------
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
if (!OPENAI_API_KEY) {
  console.warn('WARNING: OPENAI_API_KEY not set. Set it in Render secrets or .env for local testing.');
}

// Developer-provided uploaded file (we'll transform this path into a URL when deployed)
const exampleFaceLocalPath = '/mnt/data/3ce70e0e-bb54-40b7-a84e-e32e2104c762.png';
// ----------------------------

// Helper: call OpenAI (text completion) - replaceable with actual models / video APIs
async function callOpenAIChat(prompt) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini', // change if you prefer another
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 800
    })
  });
  return res.json();
}

// Simple fake video generator functions (placeholders you can replace with real video providers later)
async function makePresenterVideo(script) {
  // In production: call a TTS + avatar/video service (i.e., D-ID, Synthesia, ElevenLabs + video stitch)
  const chat = await callOpenAIChat(`Create a short plan to turn this script into a presenter video:\n\n${script}`);
  return {
    url: 'https://example.com/presenter-video.mp4',
    note: 'This is a placeholder URL. Integrate a real avatar/video provider to generate real video.'
  };
}

async function makeAnimatedVideo(script) {
  // In production: call stock footage APIs + TTS + ffmpeg stitch
  const chat = await callOpenAIChat(`Suggest 6 scene descriptions and shot directions for this script:\n\n${script}`);
  return {
    url: 'https://example.com/animated-video.mp4',
    note: 'Placeholder. Replace with actual animation pipeline (stock clips + TTS + ffmpeg).'
  };
}

async function makeLipSyncVideo(script) {
  // This would normally upload the face image to a lip-sync provider and request the model to animate it.
  // Developer note: the uploaded file path provided earlier will be used as the source image.
  return {
    url: `file://${exampleFaceLocalPath}`,
    note: 'Local-file response. When deployed we will convert the file path to an accessible URL for the lip-sync service, or you can upload the image to Supabase/gcs and pass that URL to the provider.'
  };
}

app.post('/generate', async (req, res) => {
  try {
    const { script, type } = req.body || {};
    if (!script) return res.status(400).json({ error: 'Please provide "script" in the JSON body.' });

    // Acceptable types: "presenter", "animated", "lipsync", or "all"
    const t = (type || 'presenter').toLowerCase();

    if (t === 'presenter') {
      const result = await makePresenterVideo(script);
      return res.json({ success: true, type: 'presenter', result });
    }

    if (t === 'animated') {
      const result = await makeAnimatedVideo(script);
      return res.json({ success: true, type: 'animated', result });
    }

    if (t === 'lipsync') {
      const result = await makeLipSyncVideo(script);
      return res.json({ success: true, type: 'lipsync', result });
    }

    if (t === 'all') {
      const r1 = await makePresenterVideo(script);
      const r2 = await makeAnimatedVideo(script);
      const r3 = await makeLipSyncVideo(script);
      return res.json({ success: true, type: 'all', results: { presenter: r1, animated: r2, lipsync: r3 }});
    }

    return res.status(400).json({ error: 'Unknown type. Use presenter|animated|lipsync|all' });

  } catch (err) {
    console.error('Server error in /generate', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health
app.get('/', (req, res) => res.send('AI Video Tool API running'));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on port ${port}`));
