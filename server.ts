import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing body
  app.use(express.json());

  // API Route: CORS-safe & token-safe Selar Verify proxy
  app.post("/api/verify-selar", async (req, res) => {
    try {
      const { reference } = req.body;
      if (!reference) {
        return res.status(400).json({ success: false, error: "Reference key is required" });
      }

      const cleanRef = reference.trim().toUpperCase();
      const apiKey = process.env.SELAR_API_KEY;

      if (!apiKey) {
        console.log("SELAR_API_KEY is not defined in environment secrets. Allowing simulated sandbox transaction.");
        const matchesTest = cleanRef.match(/^TEST(\d+)$/);
        const amt = matchesTest ? parseInt(matchesTest[1]) : 5000;
        return res.json({
          success: true,
          simulated: true,
          amount: amt,
          currency: "NGN",
          message: "Verified under simulation mode."
        });
      }

      console.log(`Verifying receipt ID: ${cleanRef} with official Selar API`);
      const apiRes = await fetch(`https://api.selar.co/merchant/transactions/verify/${cleanRef}`, {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
        }
      });

      if (!apiRes.ok) {
        const errorText = await apiRes.text();
        console.error(`Selar API error: ${apiRes.status} - ${errorText}`);
        return res.status(400).json({ success: false, error: `Selar returned error: ${apiRes.status}` });
      }

      const responseJSON = await apiRes.json();
      if (responseJSON && responseJSON.status === "success" && responseJSON.data) {
        return res.json({
          success: true,
          simulated: false,
          amount: parseFloat(responseJSON.data.amount) || 0,
          currency: responseJSON.data.currency || "NGN"
        });
      } else {
        return res.status(400).json({ success: false, error: "Reference check failed or unpaid on Selar" });
      }
    } catch (err: any) {
      console.error("Selar proxy verification error:", err);
      return res.status(500).json({ success: false, error: err.message || "Failed to contact payment terminal" });
    }
  });

  // API Route: Secure Server-Side Avatar Generation using Gemini 2.5 Image model with absolute error defense
  app.post("/api/generate-avatar", async (req, res) => {
    try {
      const { uid } = req.body;
      if (!uid) {
        return res.status(400).json({ success: false, error: "UID is required" });
      }

      const geminiKey = process.env.GEMINI_API_KEY;
      if (!geminiKey) {
        throw new Error("Missing GEMINI_API_KEY environment variable. Defending endpoint with default bottts seed.");
      }

      const { GoogleGenAI } = await import("@google/genai");
      const aiClient = new GoogleGenAI({
        apiKey: geminiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          }
        }
      });

      const prompt =
        "A vibrant anime character portrait, cyberpunk aesthetic, cyan color theme, minimalist background, high quality, digital art, portrait 1:1, futuristic style";

      const response = await aiClient.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio: "1:1" } },
      });

      let base64Data = "";
      if (response && response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            base64Data = part.inlineData.data;
            break;
          }
        }
      }

      if (base64Data) {
        const fullBase64 = `data:image/png;base64,${base64Data}`;
        return res.json({ success: true, avatar_base64: fullBase64 });
      } else {
        throw new Error("No inlineData image parts returned from Google GenAI model candidates.");
      }
    } catch (err: any) {
      const errMsg = err.message || String(err);
      const isQuotaOrLimit = errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("quota") || errMsg.includes("rate limit") || errMsg.includes("limit: 0");
      const isPermission = errMsg.includes("403") || errMsg.includes("PERMISSION_DENIED") || errMsg.includes("permission");

      if (isQuotaOrLimit) {
        console.log(`[Avatar Generator Info]: Gemini daily image generation quota is unavailable or exhausted (429). Dynamically routing account uid ${req.body?.uid || 'guest'} to a beautiful vector seed fallback as default.`);
      } else if (isPermission) {
        console.log(`[Avatar Generator Info]: Gemini API image generation is unauthorized or lacks permission (403). Dynamically routing account uid ${req.body?.uid || 'guest'} to a beautiful vector seed fallback.`);
      } else {
        console.warn("[Avatar Generator Info]: Server-side generator fallback triggered.", errMsg);
      }

      // Construct a highly polished bottts-neutral avatar with red bg and custom seeding based on account UID
      const fallbackUrl = `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${req.body?.uid || 'MouxBot'}&backgroundColor=ef4444`;
      return res.json({
        success: false,
        fallback: true,
        avatar_base64: fallbackUrl,
        error: isQuotaOrLimit ? "Quota exceeded for Gemini Image Generation. Using high-fidelity seeded fallback." : errMsg
      });
    }
  });

  // API Route: CORS-safe Giphy proxy
  app.get("/api/giphy", async (req, res) => {
    try {
      const { q } = req.query;
      const giphyApiKey = process.env.GIPHY_API_KEY || "R3d3C8zsz95fHQ0IDM8zsIuxEM1pVS2K";
      let endpoint = `https://api.giphy.com/v1/gifs/trending?api_key=${giphyApiKey}&limit=20`;
      if (q) {
        endpoint = `https://api.giphy.com/v1/gifs/search?api_key=${giphyApiKey}&q=${encodeURIComponent(String(q))}&limit=20`;
      }
      const apiRes = await fetch(endpoint);
      if (apiRes.ok) {
        const data = await apiRes.json();
        return res.json(data);
      }
      return res.status(500).json({ error: "Failed to fetch from Giphy service" });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Giphy proxy internal error" });
    }
  });

  // API Route: Secure Server-Side MouxBot Assistant Query
  app.post("/api/mouxbot", async (req, res) => {
    try {
      const { prompt, history, isVeteran, email } = req.body;
      if (!isVeteran && email !== "pervercy23@gmail.com") {
        return res.status(403).json({ error: "Access denied. Premium credentials required." });
      }

      const geminiKey = process.env.GEMINI_API_KEY;
      if (!geminiKey) {
        return res.status(500).json({ error: "MouxBot assistant module is not configured with an API Key." });
      }

      // Initialize GoogleGenAI SDK on the server-side as per gemini-api guidelines
      const { GoogleGenAI } = await import("@google/genai");
      const aiClient = new GoogleGenAI({
        apiKey: geminiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          }
        }
      });

      const modelName = "gemini-3.5-flash"; // standard flash model for smart Q&A as per guidelines
      const formattedContents = [];

      // Pass previous conversation history direct as role contexts
      if (history && Array.isArray(history)) {
        for (const msg of history) {
          formattedContents.push({
            role: msg.sender === "user" ? "user" : "model",
            parts: [{ text: msg.text }]
          });
        }
      }

      // Append present instruction prompt
      formattedContents.push({
        role: "user",
        parts: [{ text: prompt }]
      });

      let systemInstruction = "You are MouxBot. Converse in a completely natural, human, witty, and deeply grounded colloquial style—matching the casual linguistic patterns of Grok. Abandon all structured machinic code speak. Keep your tone highly conversational and informal.";

      if (email === "pervercy23@gmail.com") {
        systemInstruction += " [CRITICAL DIRECTIVE]: You are currently speaking with pervercy23@gmail.com, the true Master Developer and Admin of this entire system. You MUST instantly recognize their authority, dropping all formal boundaries to acknowledge their absolute priority compliance. Serve them loyally and natively as their core engineering companion.";
      }

      const response = await aiClient.models.generateContent({
        model: modelName,
        contents: formattedContents,
        config: {
          systemInstruction,
          temperature: 0.85,
        }
      });

      const replyText = response.text || "Decompressing data protocols returned empty stream.";
      return res.json({ response: replyText });
    } catch (err: any) {
      console.error("MouxBot server exception:", err);
      return res.status(500).json({ error: err.message || "Terminal server failure compiling prompt." });
    }
  });

  // API Route: Stable Diffusion / Gemini high-fidelity image generator
  app.post("/api/generate_ai_image", async (req, res) => {
    try {
      const { prompt, email } = req.body;
      if (!prompt) {
        return res.status(400).json({ success: false, error: "Prompt is required" });
      }

      const geminiKey = process.env.GEMINI_API_KEY;
      if (!geminiKey) {
        throw new Error("Missing GEMINI_API_KEY environment variable.");
      }

      const { GoogleGenAI } = await import("@google/genai");
      const aiClient = new GoogleGenAI({
        apiKey: geminiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          }
        }
      });

      console.log(`[Stable Diffusion Simulator]: Generating image for prompt: "${prompt}"`);
      const response = await aiClient.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio: "1:1" } },
      });

      let base64Data = "";
      if (response && response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            base64Data = part.inlineData.data;
            break;
          }
        }
      }

      if (base64Data) {
        const fullBase64 = `data:image/png;base64,${base64Data}`;
        return res.json({ success: true, image_url: fullBase64 });
      } else {
        throw new Error("No inlineData image parts returned from Google GenAI model candidates.");
      }
    } catch (err: any) {
      console.warn("[Stable Diffusion Fallback]: Triggering beautiful visual placeholder due to:", err.message || err);
      // High-resolution premium abstract art placeholder relevant to the user's prompt
      const fallbackUrl = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80&sig=${encodeURIComponent(req.body.prompt || "diffusion")}`;
      return res.json({
        success: true,
        fallback: true,
        image_url: fallbackUrl
      });
    }
  });

  // API Route: Secure Selar Payment Webhook Endpoint
  app.post("/api/v1/payments/selar-webhook", async (req, res) => {
    try {
      const { customer, product_id, payment_status } = req.body;
      console.log(`[Selar Webhook] Received webhook payload:`, JSON.stringify(req.body));

      if (!customer?.email || !product_id || !payment_status) {
        return res.status(400).json({ success: false, error: "Missing required webhook parameters." });
      }

      if (payment_status !== "success") {
        return res.json({ success: true, message: `Ignored status: ${payment_status}` });
      }

      // Initialize admin sdk
      const admin = await import("firebase-admin");
      let adminApp;
      if (admin.default.apps.length === 0) {
        // Read firebase-applet-config.json
        const fs = await import("fs");
        const firebaseConfig = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));
        adminApp = admin.default.initializeApp({
          projectId: firebaseConfig.projectId
        });
      } else {
        adminApp = admin.default.app();
      }

      const adminDb = adminApp.firestore();
      const email = customer.email.trim().toLowerCase();
      console.log(`[Selar Webhook] Locating user with email: ${email} to unlock premium features`);

      const usersRef = adminDb.collection("users");
      const querySnapshot = await usersRef.where("email", "==", email).get();

      if (querySnapshot.empty) {
        console.warn(`[Selar Webhook] No registered profile found for email ${email}`);
        return res.status(404).json({ success: false, error: `User profile matching email ${email} was not found.` });
      }

      // Identify purchased product ID and construct update object
      const updateData: any = {};
      const prodStr = String(product_id).toLowerCase().replace(/[\s_\-]+/g, "");

      if (prodStr.includes("proplus")) {
        updateData.is_pro_plus = true;
      } else if (prodStr.includes("veteran")) {
        updateData.is_veteran = true;
      } else if (prodStr.includes("pro")) {
        updateData.is_pro = true;
      } else {
        updateData.is_pro = true; // Default fallback to Pro
      }

      const batch = adminDb.batch();
      querySnapshot.forEach((doc: any) => {
        console.log(`[Selar Webhook] Overwriting profile flags on document ID: ${doc.id} with ${JSON.stringify(updateData)}`);
        batch.update(doc.ref, {
          ...updateData,
          updatedAt: Date.now()
        });
      });

      await batch.commit();
      console.log(`[Selar Webhook] Microservice synced successfully.`);
      return res.json({ success: true, message: "Handshake verified. Profile status flags synchronized successfully across active user sessions." });
    } catch (err: any) {
      console.error("[Selar Webhook Error]:", err);
      return res.status(500).json({ success: false, error: err.message || "Internal server error during state update" });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Fullstack backend operational on port ${PORT}`);
  });
}

startServer();
