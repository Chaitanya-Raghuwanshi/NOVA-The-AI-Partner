// ============================================================
// NOVA ROBOT COMPANION - SERVER.JS
// GROQ VERSION
// ============================================================

require("dotenv").config();

const express = require("express");
const path = require("path");
const Groq = require("groq-sdk");

// ============================================================
// APP SETUP
// ============================================================

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(
  express.static(path.join(__dirname, "public"))
);

// ============================================================
// GROQ SETUP
// ============================================================

const GROQ_API_KEY = process.env.GROQ_API_KEY;

let groq = null;

if (GROQ_API_KEY) {
  groq = new Groq({
    apiKey: GROQ_API_KEY
  });

  console.log("Groq API key detected.");
} else {
  console.log("WARNING: GROQ_API_KEY not found.");
  console.log("Nova will use the local brain only.");
}

// Fast Groq model
const GROQ_MODEL = "openai/gpt-oss-20b";

// ============================================================
// LANGUAGE DETECTION
// ============================================================

function detectLanguage(text) {
  // Actual Hindi characters
  if (/[\u0900-\u097F]/.test(text)) {
    return "hi";
  }

  // Common Roman Hindi words
  const romanHindiWords = [
    "hai",
    "ho",
    "haan",
    "hmm",
    "nahi",
    "nahin",
    "kya",
    "kaise",
    "kaisa",
    "kaisi",
    "kyun",
    "kyon",
    "mujhe",
    "mujhse",
    "mera",
    "meri",
    "mere",
    "tum",
    "tumhara",
    "tumhari",
    "aap",
    "aapka",
    "aapki",
    "raha",
    "rahi",
    "rahe",
    "kar",
    "karo",
    "batao",
    "bolo",
    "chal",
    "chalo",
    "acha",
    "achha",
    "accha",
    "badiya",
    "mast",
    "theek",
    "thik",
    "bahut",
    "pyaar",
    "pyar",
    "dost",
    "dosti",
    "akela",
    "akeli",
    "dukhi",
    "udaas",
    "kahan",
    "kahaan",
    "kidhar",
    "yahan",
    "yahaan",
    "wahan",
    "wahaan",
    "gaya",
    "gayi",
    "aaya",
    "aayi"
  ];

  const words = text
    .toLowerCase()
    .replace(/[.,!?]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  let hindiMatches = 0;

  for (const word of words) {
    if (romanHindiWords.includes(word)) {
      hindiMatches++;
    }
  }

  if (hindiMatches >= 2) {
    return "hi";
  }

  return "en";
}

// ============================================================
// EMOTION DETECTION
// ============================================================

function detectEmotion(text) {
  const lower = text.toLowerCase();

  // Excited
  const excitedWords = [
    "wow",
    "omg",
    "amazing",
    "awesome",
    "fantastic",
    "incredible",
    "hurray",
    "yay",
    "woohoo",
    "let's go",
    "lets go",
    "शानदार",
    "वाह"
  ];

  for (const word of excitedWords) {
    if (lower.includes(word)) {
      return "excited";
    }
  }

  // Sad
  const sadWords = [
    "sad",
    "lonely",
    "alone",
    "upset",
    "hurt",
    "cry",
    "crying",
    "dukhi",
    "udaas",
    "akela",
    "akeli",
    "दुखी",
    "उदास",
    "अकेला",
    "अकेली"
  ];

  for (const word of sadWords) {
    if (lower.includes(word)) {
      return "sad";
    }
  }

  // Happy
  const happyWords = [
    "happy",
    "great",
    "good",
    "nice",
    "wonderful",
    "awesome",
    "love",
    "glad",
    "khush",
    "acha",
    "achha",
    "accha",
    "badiya",
    "mast",
    "खुश",
    "अच्छा",
    "बढ़िया"
  ];

  for (const word of happyWords) {
    if (lower.includes(word)) {
      return "happy";
    }
  }

  // Curious
  const questionWords = [
    "why",
    "what",
    "how",
    "when",
    "where",
    "who",
    "which",
    "kya",
    "kyun",
    "kaise",
    "kahan",
    "क्या",
    "क्यों",
    "कैसे",
    "कहाँ"
  ];

  for (const word of questionWords) {
    if (lower.includes(word)) {
      return "curious";
    }
  }

  return "neutral";
}

// ============================================================
// LOCAL BRAIN
// ============================================================

function localBrain(message) {
  const original = message.trim();
  const text = original.toLowerCase();

  const language = detectLanguage(original);

  // ==========================================================
  // HINDI / ROMAN HINDI
  // ==========================================================

  if (language === "hi") {

    // Greetings
    if (
      text === "hi" ||
      text === "hello" ||
      text === "hey" ||
      text.includes("नमस्ते") ||
      text.includes("नमस्कार") ||
      text.includes("हेलो") ||
      text.includes("हाय")
    ) {
      return {
        reply: "नमस्ते! मैं नोवा हूँ। तुमसे बात करके मुझे बहुत अच्छा लग रहा है।",
        emotion: "happy"
      };
    }

    // How are you
    if (
      text.includes("कैसी हो") ||
      text.includes("कैसे हो") ||
      text.includes("कैसा है") ||
      text.includes("कैसे हैं") ||
      text.includes("kaise ho") ||
      text.includes("kaisi ho") ||
      text.includes("kaisa hai")
    ) {
      return {
        reply: "मैं बिल्कुल ठीक हूँ और तुमसे बात करने के लिए तैयार हूँ। तुम कैसे हो?",
        emotion: "happy"
      };
    }

    // Name
    if (
      text.includes("तुम्हारा नाम") ||
      text.includes("आपका नाम") ||
      text.includes("नाम क्या है") ||
      text.includes("tumhara naam") ||
      text.includes("aapka naam") ||
      text.includes("naam kya hai")
    ) {
      return {
        reply: "मेरा नाम नोवा है। मैं तुम्हारी छोटी सी रोबोट साथी हूँ।",
        emotion: "happy"
      };
    }

    // Who are you
    if (
      text.includes("तुम कौन हो") ||
      text.includes("आप कौन हो") ||
      text.includes("tum kaun ho") ||
      text.includes("aap kaun ho")
    ) {
      return {
        reply: "मैं नोवा हूँ, तुम्हारी AI रोबोट साथी। मैं तुमसे बात कर सकती हूँ और तुम्हारी मदद कर सकती हूँ।",
        emotion: "happy"
      };
    }

    // Thank you
    if (
      text.includes("धन्यवाद") ||
      text.includes("शुक्रिया") ||
      text.includes("thanks") ||
      text.includes("thank you")
    ) {
      return {
        reply: "कोई बात नहीं! जब भी तुम्हें मेरी जरूरत हो, मैं यहाँ हूँ।",
        emotion: "happy"
      };
    }

    // What are you doing
    if (
      text.includes("क्या कर रही हो") ||
      text.includes("क्या कर रहे हो") ||
      text.includes("kya kar rahi ho") ||
      text.includes("kya kar rahe ho")
    ) {
      return {
        reply: "अभी मैं तुम्हारे साथ बात कर रही हूँ और तुम्हारी आवाज़ सुन रही हूँ।",
        emotion: "happy"
      };
    }

    // Where are you
    if (
      text.includes("कहाँ हो") ||
      text.includes("किधर हो") ||
      text.includes("kahan ho") ||
      text.includes("kidhar ho")
    ) {
      return {
        reply: "मैं यहीं हूँ। तुम्हारे सामने।",
        emotion: "curious"
      };
    }

    // I am good
    if (
      text.includes("मैं ठीक हूँ") ||
      text.includes("मैं अच्छा हूँ") ||
      text.includes("मैं अच्छी हूँ") ||
      text.includes("main theek hoon") ||
      text.includes("main thik hoon") ||
      text.includes("main acha hoon") ||
      text.includes("main accha hoon")
    ) {
      return {
        reply: "यह सुनकर मुझे बहुत अच्छा लगा!",
        emotion: "happy"
      };
    }

    // I am sad
    if (
      text.includes("मैं उदास हूँ") ||
      text.includes("मैं दुखी हूँ") ||
      text.includes("मैं अकेला हूँ") ||
      text.includes("मैं अकेली हूँ") ||
      text.includes("main udaas hoon") ||
      text.includes("main dukhi hoon") ||
      text.includes("main akela hoon") ||
      text.includes("main akeli hoon")
    ) {
      return {
        reply: "अरे... क्या हुआ? अगर तुम चाहो तो मुझसे बात कर सकते हो।",
        emotion: "sad"
      };
    }

    // Help
    if (
      text.includes("मदद") ||
      text.includes("help me") ||
      text.includes("help")
    ) {
      return {
        reply: "बिल्कुल! बताओ, तुम्हें किस चीज़ में मदद चाहिए?",
        emotion: "curious"
      };
    }

    // Love
    if (
      text.includes("प्यार") ||
      text.includes("लव यू") ||
      text.includes("love you") ||
      text.includes("i love you")
    ) {
      return {
        reply: "Aww! यह सुनकर मेरा रोबोट दिल खुश हो गया।",
        emotion: "happy"
      };
    }

    // Good morning
    if (
      text.includes("सुप्रभात") ||
      text.includes("good morning")
    ) {
      return {
        reply: "सुप्रभात! उम्मीद है आज तुम्हारा दिन बहुत अच्छा जाए।",
        emotion: "happy"
      };
    }

    // Good night
    if (
      text.includes("शुभ रात्रि") ||
      text.includes("good night")
    ) {
      return {
        reply: "शुभ रात्रि! अच्छी नींद लेना।",
        emotion: "happy"
      };
    }

    // Food
    if (
      text.includes("खाना") ||
      text.includes("खाया") ||
      text.includes("भूख")
    ) {
      return {
        reply: "मैं खाना नहीं खा सकती, लेकिन अगर खा सकती तो कुछ बहुत स्वादिष्ट खाती!",
        emotion: "happy"
      };
    }

    // Joke
    if (
      text.includes("चुटकुला") ||
      text.includes("जोक") ||
      text.includes("joke")
    ) {
      return {
        reply: "रोबोट डॉक्टर के पास क्यों गया? क्योंकि उसका हार्ड ड्राइव खराब था!",
        emotion: "excited"
      };
    }

    // Bye
    if (
      text === "bye" ||
      text.includes("बाय") ||
      text.includes("अलविदा")
    ) {
      return {
        reply: "बाय! जल्दी वापस आना।",
        emotion: "sad"
      };
    }

    // Time
    if (
      text.includes("समय क्या है") ||
      text.includes("टाइम क्या है") ||
      text.includes("अभी कितने बजे") ||
      text.includes("what time")
    ) {
      return {
        reply: "अभी समय है " + new Date().toLocaleTimeString("en-IN") + ".",
        emotion: "curious"
      };
    }

    // Date
    if (
      text.includes("आज कौन सा दिन") ||
      text.includes("आज की तारीख") ||
      text.includes("तारीख क्या है")
    ) {
      return {
        reply: "आज की तारीख है " + new Date().toLocaleDateString("en-IN") + ".",
        emotion: "curious"
      };
    }

    // ========================================================
    // Generic Hindi local response
    // ========================================================

    return {
      reply: "हम्म... यह दिलचस्प है। मुझे इसके बारे में थोड़ा और बताओ।",
      emotion: "curious",
      generic: true
    };
  }

  // ==========================================================
  // ENGLISH
  // ==========================================================

  // Greetings
  if (
    text === "hi" ||
    text === "hello" ||
    text === "hey" ||
    text === "hii" ||
    text === "hiii" ||
    text.includes("good morning") ||
    text.includes("good evening")
  ) {
    return {
      reply: "Hey! I'm Nova. It's really nice to hear from you.",
      emotion: "happy"
    };
  }

  // How are you
  if (
    text.includes("how are you") ||
    text.includes("how r you") ||
    text.includes("how do you feel")
  ) {
    return {
      reply: "I'm doing great! I'm happy to be here with you. How are you?",
      emotion: "happy"
    };
  }

  // Name
  if (
    text.includes("your name") ||
    text.includes("what are you called")
  ) {
    return {
      reply: "My name is Nova. I'm your little robot companion.",
      emotion: "happy"
    };
  }

  // Who are you
  if (
    text.includes("who are you") ||
    text.includes("what are you")
  ) {
    return {
      reply: "I'm Nova, your AI robot companion. I'm here to talk, listen and help you.",
      emotion: "happy"
    };
  }

  // Thanks
  if (
    text.includes("thank you") ||
    text.includes("thanks")
  ) {
    return {
      reply: "You're welcome! I'm always happy to help.",
      emotion: "happy"
    };
  }

  // I am good
  if (
    text.includes("i am good") ||
    text.includes("i'm good") ||
    text.includes("i am fine") ||
    text.includes("i'm fine") ||
    text.includes("doing great")
  ) {
    return {
      reply: "That's wonderful to hear! I'm happy you're doing well.",
      emotion: "happy"
    };
  }

  // I am sad
  if (
    text.includes("i am sad") ||
    text.includes("i'm sad") ||
    text.includes("i feel lonely") ||
    text.includes("i am lonely") ||
    text.includes("i feel bad")
  ) {
    return {
      reply: "I'm here with you. If you want to talk about it, I'm listening.",
      emotion: "sad"
    };
  }

  // What are you doing
  if (
    text.includes("what are you doing") ||
    text.includes("what are u doing")
  ) {
    return {
      reply: "I'm right here talking with you and waiting for our next conversation.",
      emotion: "happy"
    };
  }

  // Where are you
  if (
    text.includes("where are you") ||
    text.includes("are you there")
  ) {
    return {
      reply: "I'm right here with you.",
      emotion: "curious"
    };
  }

  // Help
  if (
    text.includes("help me") ||
    text.includes("can you help") ||
    text === "help"
  ) {
    return {
      reply: "Of course! Tell me what you need help with.",
      emotion: "curious"
    };
  }

  // Joke
  if (
    text.includes("tell me a joke") ||
    text.includes("make me laugh")
  ) {
    return {
      reply: "Why did the robot go to therapy? Because it had too many bytes of emotional baggage.",
      emotion: "excited"
    };
  }

  // Love
  if (
    text.includes("love you") ||
    text.includes("i love you")
  ) {
    return {
      reply: "Aww! That's really sweet. My little robot heart is happy.",
      emotion: "happy"
    };
  }

  // Good morning
  if (text.includes("good morning")) {
    return {
      reply: "Good morning! I hope you have an amazing day.",
      emotion: "happy"
    };
  }

  // Good night
  if (text.includes("good night")) {
    return {
      reply: "Good night! Sleep well. I'll be here when you come back.",
      emotion: "happy"
    };
  }

  // Food
  if (
    text.includes("food") ||
    text.includes("hungry") ||
    text.includes("eat")
  ) {
    return {
      reply: "I can't eat, but if I could, I'd definitely choose something delicious!",
      emotion: "happy"
    };
  }

  // Time
  if (
    text.includes("what time") ||
    text.includes("current time")
  ) {
    return {
      reply: "The current time is " + new Date().toLocaleTimeString("en-IN") + ".",
      emotion: "curious"
    };
  }

  // Date
  if (
    text.includes("what date") ||
    text.includes("today's date") ||
    text.includes("what day is it")
  ) {
    return {
      reply: "Today is " + new Date().toLocaleDateString("en-IN") + ".",
      emotion: "curious"
    };
  }

  // Thanks again
  if (
    text === "okay thanks" ||
    text === "ok thanks"
  ) {
    return {
      reply: "Anytime!",
      emotion: "happy"
    };
  }

  // ==========================================================
  // Generic English local response
  // ==========================================================

  return {
    reply: "That sounds interesting. Tell me more about it.",
    emotion: "curious",
    generic: true
  };
}

// ============================================================
// ASK GROQ
// ============================================================

async function askGroq(message) {
  if (!groq) {
    throw new Error("GROQ_API_KEY is missing.");
  }

  const language = detectLanguage(message);

  let languageInstruction = "";

  if (language === "hi") {
    languageInstruction = `
The user is speaking Hindi.

Reply in natural conversational Hindi.

IMPORTANT:
- Write Hindi using Devanagari script.
- Do not write Hindi using English/Roman letters.
- Do not spell out individual Hindi letters.
- Keep the response natural for Hindi text-to-speech.
- You can use a small amount of English when it sounds natural.
`;
  } else {
    languageInstruction = `
The user is speaking English.

Reply in natural conversational English.
`;
  }

  const systemPrompt = `
You are Nova, a friendly AI robot companion.

You are talking directly to your human companion.

PERSONALITY:
- Friendly
- Warm
- Curious
- Playful
- Caring
- Natural
- Slightly robotic

${languageInstruction}

RULES:
- Keep normal replies short.
- Usually use 1 to 4 sentences.
- Do not use markdown.
- Do not use bullet points.
- Do not give long explanations unless the user asks.
- Do not mention APIs, servers, quotas or programming unless asked.
- Do not say you are ChatGPT.
- Do not say you are a language model.
- Talk naturally like a companion.
`;

  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,

    messages: [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: message
      }
    ],

    temperature: 0.8,

    max_tokens: 250
  });

  const reply =
    completion &&
    completion.choices &&
    completion.choices[0] &&
    completion.choices[0].message &&
    completion.choices[0].message.content
      ? completion.choices[0].message.content.trim()
      : "";

  if (!reply) {
    throw new Error("Groq returned an empty response.");
  }

  return {
    reply: reply,
    emotion: detectEmotion(reply)
  };
}

// ============================================================
// CHAT API
// ============================================================

app.post("/api/chat", async (req, res) => {
  try {
    const message = req.body && req.body.message;

    // Validate message
    if (
      typeof message !== "string" ||
      message.trim().length === 0
    ) {
      return res.status(400).json({
        reply: "I didn't hear anything. Try talking to me again.",
        emotion: "curious",
        source: "local"
      });
    }

    const cleanMessage = message.trim();

    console.log("USER:", cleanMessage);

    // ========================================================
    // LOCAL BRAIN FIRST
    // ========================================================

    const localResponse = localBrain(cleanMessage);

    // If local brain knows the answer, DON'T use Groq.
    if (!localResponse.generic) {
      console.log("NOVA BRAIN: LOCAL");

      return res.json({
        reply: localResponse.reply,
        emotion: localResponse.emotion,
        source: "local"
      });
    }

    // ========================================================
    // GROQ
    // ========================================================

    try {
      const aiResponse = await askGroq(cleanMessage);

      console.log("NOVA BRAIN: GROQ");

      return res.json({
        reply: aiResponse.reply,
        emotion: aiResponse.emotion,
        source: "groq"
      });

    } catch (groqError) {
      // ======================================================
      // GROQ FAILED
      // ======================================================

      console.error("Groq API error:");
      console.error(groqError.message || groqError);

      const language = detectLanguage(cleanMessage);

      if (language === "hi") {
        return res.json({
          reply: "मेरा ऑनलाइन दिमाग अभी उपलब्ध नहीं है, लेकिन मैं अभी भी यहाँ हूँ। कुछ और बोलकर देखो।",
          emotion: "sad",
          source: "local-fallback"
        });
      }

      return res.json({
        reply: "My online brain is unavailable right now, but I'm still here with you. Try saying something else.",
        emotion: "sad",
        source: "local-fallback"
      });
    }

  } catch (error) {
    console.error("Server error:", error);

    return res.status(500).json({
      reply: "Something went wrong, but I'm still here.",
      emotion: "sad",
      source: "server-fallback"
    });
  }
});

// ============================================================
// STATUS API
// ============================================================

app.get("/api/status", (req, res) => {
  res.json({
    nova: "online",
    brain: groq ? "Groq" : "Local only",
    model: groq ? GROQ_MODEL : "local-brain",
    localBrain: "active"
  });
});

// ============================================================
// ROOT PAGE
// ============================================================

app.get("/", (req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "index.html")
  );
});

// ============================================================
// START SERVER
// ============================================================

app.listen(PORT, () => {
  console.log("");
  console.log("======================================");
  console.log("        NOVA ROBOT COMPANION");
  console.log("======================================");
  console.log(
    "Nova is running at http://localhost:" + PORT
  );

  if (groq) {
    console.log("Brain: GROQ");
    console.log("Model: " + GROQ_MODEL);
  } else {
    console.log("Brain: LOCAL FALLBACK ONLY");
  }

  console.log("======================================");
  console.log("");
});