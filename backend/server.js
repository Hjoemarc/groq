const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// GROQ_API_KEY and an optional GROQ_MODEL can be set in backend/.env.
dotenv.config({ path: __dirname + "/.env" });

const PORT = Number.parseInt(process.env.PORT || "3001", 10);
const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-20b";

const app = express();

app.use(cors());
app.use(express.json());

// Ito ang API endpoint na tatawagin ng React Native
app.post("/ask", async (req, res) => {

  // Kunin ang question na pinadala ng user
  const question = req.body.question;

  // Check kung may question na nilagay
  if (!question || !question.trim()) {
    return res.status(400).json({
      error: "Please enter a question."
    });
  }

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({
      error: "GROQ_API_KEY is not set. Add it to backend/.env and restart the server."
    });
  }

  try {
    // I-send ang question sa Groq.
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            {
              role: "user",
              content: question
            }
          ]
        })
      }
    );

    // Kunin ang response mula sa Groq
    const data = await response.json();

    // Check kung may error mula sa Groq
    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "Groq API request failed."
      });
    }

    // Kunin ang sagot ng AI
    const answer = data.choices?.[0]?.message?.content;

    if (!answer) {
      return res.status(502).json({
        error: "Groq returned an unexpected response."
      });
    }

    // Ibalik ang AI answer sa React Native
    res.json({ answer });

  } catch (error) {
    // Kapag may error sa connection o server
    res.status(500).json({
      error: "Could not reach the Groq API. Check your internet connection and try again."
    });
  }
});

// Run server sa configured port (3001 by default to avoid the existing app on 3000)
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Choose another port with PORT=<port> node server.js.`);
  } else {
    console.error("Server failed to start:", error.message);
  }

  process.exit(1);
});
