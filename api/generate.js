export default async function handler(req, res) {
  try {
    const { script } = req.body;

    if (!script) {
      return res.status(400).json({ error: "Script text missing" });
    }

    // Call OpenAI API (placeholder for now)
    const fakeVideoUrl = "https://example.com/generated-video.mp4";

    res.status(200).json({ url: fakeVideoUrl });

  } catch (error) {
    console.error("Error generating video:", error);
    res.status(500).json({ error: "Server error" });
  }
}
