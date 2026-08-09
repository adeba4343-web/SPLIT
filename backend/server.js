const express = require("express");
const cors = require("cors");
require("dotenv").config();
const multer = require("multer");

const app = express();

const upload = multer({
  storage: multer.memoryStorage(),
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT ||3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/* =========================================================
   RISK SCORING
========================================================= */

function calculateRisk(text, manipulation = []) {
  const content = (text || "").toLowerCase();

  let score = 0;
  const reasons = [];

  const rules = [
    {
      name: "Urgency",
      points: 15,
      patterns: [
        "urgent",
        "urgently",
        "immediately",
        "act now",
        "today only",
        "last chance",
      ],
    },

    {
      name: "Threat",
      points: 15,
      patterns: [
        "blocked",
        "suspended",
        "terminated",
        "warning",
        "danger",
        "final notice",
        "will be closed",
      ],
    },

    {
      name: "Financial request",
      points: 20,
      patterns: [
        "pay",
        "payment",
        "fee",
        "registration fee",
        "send money",
        "transfer money",
        "₹",
        "rs.",
        "rupees",
      ],
    },

    {
      name: "Credential request",
      points: 25,
      patterns: [
        "otp",
        "password",
        "pin",
        "cvv",
        "verification code",
        "one time password",
      ],
    },

    {
      name: "Suspicious link",
      points: 20,
      patterns: [
        "click this link",
        "click here",
        "bit.ly",
        "tinyurl",
        "http://",
        "https://",
      ],
    },

    {
      name: "Authority impersonation",
      points: 15,
      patterns: [
        "bank",
        "police",
        "government",
        "income tax",
        "official",
        "customer support",
        "account security",
      ],
    },

    {
      name: "Too-good-to-be-true offer",
      points: 15,
      patterns: [
        "guaranteed",
        "you have won",
        "congratulations",
        "selected",
        "earn ₹",
        "earn rs",
        "work from home",
        "limited seats",
      ],
    },
  ];

  for (const rule of rules) {
    const matchedPattern = rule.patterns.find((pattern) =>
      content.includes(pattern)
    );

    if (matchedPattern) {
      score += rule.points;

      reasons.push({
        name: rule.name,
        points: rule.points,
        evidence: matchedPattern,
      });
    }
  }

  // Add evidence from Gemini's manipulation analysis
  for (const item of manipulation) {
    if (item.level === "HIGH") {
      score += 8;

      reasons.push({
        name: item.type,
        points: 8,
        evidence: item.evidence,
      });
    } else if (item.level === "MEDIUM") {
      score += 4;

      reasons.push({
        name: item.type,
        points: 4,
        evidence: item.evidence,
      });
    }
  }

  return {
    score: Math.min(score, 100),
    reasons: reasons.slice(0, 6),
  };
}

function addRiskResult(result, analyzedText) {
  const riskAnalysis = calculateRisk(
    analyzedText,
    result.manipulation || []
  );

  result.score = riskAnalysis.score;
  result.reasons = riskAnalysis.reasons;

  if (result.score >= 70) {
    result.risk = "HIGH";
  } else if (result.score >= 35) {
    result.risk = "MEDIUM";
  } else {
    result.risk = "LOW";
  }

  return result;
}

/* =========================================================
   GEMINI CONFIG
========================================================= */

if (!GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY is missing from .env");
}

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "SPLIT backend is alive",
  });
});

/* =========================================================
   TEXT ANALYSIS
========================================================= */

app.post("/api/analyze", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        error: "No text provided",
      });
    }

    if (!GEMINI_API_KEY) {
      return res.status(500).json({
        error: "Gemini API key is not configured",
      });
    }

    const prompt = `
You are SPLIT, an information intelligence assistant.

Your job is NOT to simply label content as "fake".

Analyze the submitted content and help the user understand:

1. What claims are being made.
2. Which claims are verified, unverifiable, or suspicious based ONLY on the content provided.
3. What psychological or manipulative techniques are being used.
4. What the user should do before acting on the information.

IMPORTANT:

- Do not invent facts.
- Do not claim something is definitely false unless the content itself proves it.
- If something cannot be verified from the provided content, mark it UNVERIFIED.
- Be especially careful with financial, medical, legal, emergency, and security-related claims.
- Focus on helping the user THINK rather than blindly trusting an AI verdict.

Return ONLY valid JSON.

CONTENT TO ANALYZE:

${text}
`;

    const responseSchema = {
      type: "OBJECT",
      properties: {
        risk: {
          type: "STRING",
          enum: ["LOW", "MEDIUM", "HIGH"],
        },

        score: {
          type: "INTEGER",
          minimum: 0,
          maximum: 100,
        },

        summary: {
          type: "STRING",
        },

        claims: {
          type: "ARRAY",
          maxItems: 6,
          items: {
            type: "OBJECT",
            properties: {
              text: {
                type: "STRING",
              },
              status: {
                type: "STRING",
                enum: [
                  "VERIFIED",
                  "UNVERIFIED",
                  "SUSPICIOUS",
                  "OPINION",
                ],
              },
            },
            required: ["text", "status"],
          },
        },

        manipulation: {
          type: "ARRAY",
          maxItems: 6,
          items: {
            type: "OBJECT",
            properties: {
              type: {
                type: "STRING",
              },
              evidence: {
                type: "STRING",
              },
              level: {
                type: "STRING",
                enum: ["LOW", "MEDIUM", "HIGH"],
              },
            },
            required: ["type", "evidence", "level"],
          },
        },

        action: {
          type: "STRING",
        },
      },

      required: [
        "risk",
        "score",
        "summary",
        "claims",
        "manipulation",
        "action",
      ],
    };

    const geminiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY,
        },

        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],

          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
            responseSchema,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();

      console.error("Gemini API error:", errorText);

      return res.status(500).json({
        error: "Gemini API request failed",
        details: errorText,
      });
    }

    const data = await geminiResponse.json();

    const generatedText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      console.error("Unexpected Gemini response:", data);

      return res.status(500).json({
        error: "Gemini returned no analysis",
      });
    }

    const result = JSON.parse(generatedText);

    // OUR deterministic score replaces Gemini's score
    addRiskResult(result, text);

    console.log("✅ Gemini text analysis completed");

    res.json(result);

  } catch (error) {
    console.error("❌ Analysis error:", error);

    res.status(500).json({
      error: "Failed to analyze content",
      details: error.message,
    });
  }
});

/* =========================================================
   IMAGE / SCREENSHOT ANALYSIS
========================================================= */

app.post(
  "/api/analyze-image",
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: "No image uploaded",
        });
      }

      if (!GEMINI_API_KEY) {
        return res.status(500).json({
          error: "Gemini API key is not configured",
        });
      }

      const base64Image = req.file.buffer.toString("base64");

      const prompt = `
You are SPLIT, an information intelligence assistant.

Analyze this screenshot.

First identify and transcribe the important text visible in the image.

Then analyze the content for:

1. Claims
2. Unverified or suspicious statements
3. Manipulation tactics
4. Urgency, fear, pressure, authority, social proof
5. Suspicious requests for money, credentials, links, or personal information
6. What the user should do before acting

Do NOT automatically call something fake.

If something cannot be verified from the screenshot, mark it UNVERIFIED.

Return ONLY valid JSON.
`;

      const responseSchema = {
        type: "OBJECT",

        properties: {
          extractedText: {
            type: "STRING",
          },

          risk: {
            type: "STRING",
            enum: ["LOW", "MEDIUM", "HIGH"],
          },

          score: {
            type: "INTEGER",
            minimum: 0,
            maximum: 100,
          },

          summary: {
            type: "STRING",
          },

          claims: {
            type: "ARRAY",
            maxItems: 6,
            items: {
              type: "OBJECT",
              properties: {
                text: {
                  type: "STRING",
                },
                status: {
                  type: "STRING",
                  enum: [
                    "VERIFIED",
                    "UNVERIFIED",
                    "SUSPICIOUS",
                    "OPINION",
                  ],
                },
              },
              required: ["text", "status"],
            },
          },

          manipulation: {
            type: "ARRAY",
            maxItems: 6,
            items: {
              type: "OBJECT",
              properties: {
                type: {
                  type: "STRING",
                },
                evidence: {
                  type: "STRING",
                },
                level: {
                  type: "STRING",
                  enum: ["LOW", "MEDIUM", "HIGH"],
                },
              },
              required: ["type", "evidence", "level"],
            },
          },

          action: {
            type: "STRING",
          },
        },

        required: [
          "extractedText",
          "risk",
          "score",
          "summary",
          "claims",
          "manipulation",
          "action",
        ],
      };

      const geminiResponse = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": GEMINI_API_KEY,
          },

          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                  {
                    inline_data: {
                      mime_type: req.file.mimetype,
                      data: base64Image,
                    },
                  },
                ],
              },
            ],

            generationConfig: {
              temperature: 0.2,
              responseMimeType: "application/json",
              responseSchema,
            },
          }),
        }
      );

      if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text();

        console.error("Gemini image error:", errorText);

        return res.status(500).json({
          error: "Gemini image analysis failed",
          details: errorText,
        });
      }

      const data = await geminiResponse.json();

      const generatedText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!generatedText) {
        console.error("Unexpected Gemini image response:", data);

        return res.status(500).json({
          error: "Gemini returned no image analysis",
        });
      }

      const result = JSON.parse(generatedText);

      // Use extracted screenshot text for deterministic scoring
      addRiskResult(
        result,
        result.extractedText || ""
      );

      console.log("📸 Screenshot analyzed");

      res.json(result);

    } catch (error) {
      console.error("❌ Image analysis error:", error);

      res.status(500).json({
        error: "Failed to analyze screenshot",
        details: error.message,
      });
    }
  }
);

/* =========================================================
   START SERVER
========================================================= */
// =========================================================
// CLAIM VERIFICATION
// =========================================================

app.post("/api/verify", async (req, res) => {
  try {
    const { claim, context } = req.body;

    if (!claim || !claim.trim()) {
      return res.status(400).json({
        error: "No claim provided",
      });
    }

    if (!GEMINI_API_KEY) {
      return res.status(500).json({
        error: "Gemini API key is not configured",
      });
    }

    const prompt = `
You are SPLIT, an information verification assistant.

The user has encountered a potentially suspicious claim.

Your job is NOT to decide whether the claim is definitely true or false.

Instead, create a practical verification plan that helps the user independently check the claim.

CLAIM:
${claim}

CONTEXT:
${context || "No additional context provided."}

Rules:

- Do not invent evidence.
- Do not claim the information is verified unless the provided content proves it.
- Clearly distinguish what can and cannot be established from the provided content.
- Give practical steps a normal person can actually follow.
- Prioritize official and independent sources.
- Warn the user about links, OTPs, passwords, payments, or personal information when relevant.
- Keep the advice concise and actionable.

Return ONLY valid JSON.
`;

    const responseSchema = {
      type: "OBJECT",
      properties: {
        status: {
          type: "STRING",
          enum: [
            "NOT_VERIFIED",
            "PARTIALLY_VERIFIABLE",
            "SUPPORTED_BY_CONTENT",
          ],
        },

        explanation: {
          type: "STRING",
        },

        verificationSteps: {
          type: "ARRAY",
          maxItems: 5,
          items: {
            type: "STRING",
          },
        },

        sourcesToCheck: {
          type: "ARRAY",
          maxItems: 5,
          items: {
            type: "STRING",
          },
        },

        redFlags: {
          type: "ARRAY",
          maxItems: 5,
          items: {
            type: "STRING",
          },
        },
      },

      required: [
        "status",
        "explanation",
        "verificationSteps",
        "sourcesToCheck",
        "redFlags",
      ],
    };

    const geminiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY,
        },

        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],

          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
            responseSchema,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();

      console.error(
        "Gemini verification error:",
        errorText
      );

      return res.status(500).json({
        error: "Gemini verification failed",
      });
    }

    const data = await geminiResponse.json();

    const generatedText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      return res.status(500).json({
        error: "Gemini returned no verification",
      });
    }

    const result = JSON.parse(generatedText);

    console.log("🔎 Claim verification generated");

    res.json(result);

  } catch (error) {
    console.error(
      "❌ Verification error:",
      error
    );

    res.status(500).json({
      error: "Failed to verify claim",
      details: error.message,
    });
  }
});
app.listen(PORT, () => {
  console.log(
    `🔥 SPLIT backend running on http://localhost:${PORT}`
  );
});