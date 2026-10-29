import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import vm from 'vm';
import { fileURLToPath } from 'url';
import { generateOfflineCareerAnalysis } from './offlineCareerEngine.js';
import { detectVisualModelServer, buildTutorVisualSpec } from './visualModelDetector.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Resolve and load .env safely from server folder, smart-bridge folder, or workspace root
const possibleEnvPaths = [
  path.join(__dirname, '.env'),
  path.join(__dirname, '../.env'),
  path.join(__dirname, '../../.env')
];

let loadedEnvPath = null;
for (const envPath of possibleEnvPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim()) {
      loadedEnvPath = envPath;
      break;
    }
    if (!loadedEnvPath) {
      loadedEnvPath = envPath;
    }
  }
}

const app = express();
const PORT = process.env.PORT || 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen3:4b';
const OLLAMA_TIMEOUT_MS = Number(process.env.OLLAMA_TIMEOUT_MS) || 120000;
const OLLAMA_KEEP_ALIVE = process.env.OLLAMA_KEEP_ALIVE || '60m';

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Gracefully handle path aliases & accidental double prefixes from various proxy / rewrite layers
app.use((req, res, next) => {
  if (req.url.startsWith('/api/api/')) {
    req.url = req.url.replace('/api/api/', '/api/');
  }
  next();
});

/**
 * GET /api/health (and /health)
 * Returns service status, Gemini configuration, and local Ollama model readiness.
 * Never exposes the key.
 */
app.get(['/api/health', '/health'], async (req, res) => {
  const geminiConfigured = Boolean(
    GEMINI_API_KEY &&
    GEMINI_API_KEY.trim() &&
    !GEMINI_API_KEY.includes('your_gemini_api_key')
  );

  let ollamaRunning = false;
  let ollamaModelAvailable = false;
  let installedModels = [];

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const tagsRes = await fetch(`${OLLAMA_BASE_URL}/api/tags`, { signal: controller.signal });
    clearTimeout(timeout);
    if (tagsRes.ok) {
      ollamaRunning = true;
      const data = await tagsRes.json();
      installedModels = (data.models || []).map((m) => m.name || m.model);
      ollamaModelAvailable = installedModels.some(
        (name) => name === OLLAMA_MODEL || name === `${OLLAMA_MODEL}:latest` || name.startsWith(`${OLLAMA_MODEL}:`)
      );
    }
  } catch {
    // Ollama not running or timed out
  }

  res.json({
    status: 'ok',
    app: 'SMART BRIDGE AI Backend',
    port: Number(PORT),
    geminiConfigured,
    ollamaRunning,
    ollamaModelAvailable,
    ollamaModel: OLLAMA_MODEL,
    ollamaBaseUrl: OLLAMA_BASE_URL,
    ollamaTimeoutMs: OLLAMA_TIMEOUT_MS,
    ollamaKeepAlive: OLLAMA_KEEP_ALIVE,
    installedModels,
    timestamp: new Date().toISOString()
  });
});

/**
 * Verifies code blocks inside markdown for syntactic correctness and ensures no
 * invalid translated keywords (like agar, warna, wapas) corrupt programming code.
 * Ensures pseudocode is explicitly labeled.
 */
function verifyAndSanitizeCodeBlocks(markdown) {
  if (!markdown || typeof markdown !== 'string') return markdown;

  // Regex to match markdown code blocks
  const codeBlockRegex = /```([a-zA-Z0-9_#-]*)\n([\s\S]*?)```/g;

  // Replacements for Hindi/Hinglish words that might accidentally slip into executable code
  const pseudoKeywordReplacements = [
    { regex: /\bagar\s*\(/gi, replacement: 'if (' },
    { regex: /\bagar\b/gi, replacement: 'if' },
    { regex: /\bwarna\s*\{/gi, replacement: 'else {' },
    { regex: /\bwarna\b/gi, replacement: 'else' },
    { regex: /\bwapas\s+/gi, replacement: 'return ' },
    { regex: /\bjabtak\s*\(/gi, replacement: 'while (' },
    { regex: /\bkarya\s+/gi, replacement: 'function ' },
    { regex: /\bchalao\b/gi, replacement: 'run' }
  ];

  return markdown.replace(codeBlockRegex, (match, rawLang, codeContent) => {
    let lang = (rawLang || '').trim().toLowerCase();
    let code = codeContent;

    // If clearly labeled as pseudocode or plain text, preserve
    if (lang === 'pseudocode' || lang === 'text' || lang === 'plain') {
      return `\`\`\`${lang}\n${code}\`\`\``;
    }

    // Replace any translated keywords in executable code blocks
    let modified = false;
    for (const item of pseudoKeywordReplacements) {
      if (item.regex.test(code)) {
        code = code.replace(item.regex, item.replacement);
        modified = true;
      }
    }

    // Check JavaScript / TypeScript syntax if applicable
    const isJsLike = ['javascript', 'js', 'typescript', 'ts', 'jsx', 'tsx', ''].includes(lang);
    if (isJsLike) {
      // Validate syntax with vm.Script (stripping import/export and TypeScript type annotations for basic verification)
      const testableCode = code
        .replace(/^\s*import\s+.*?from\s+['"].*?['"];?/gm, '// import')
        .replace(/^\s*export\s+(default\s+)?/gm, '')
        .trim();

      let isValid = true;
      try {
        new vm.Script(testableCode);
      } catch (err) {
        isValid = false;
      }

      // If syntax is invalid and clearly contains non-executable step notes or pseudo indicators:
      if (!isValid && (code.toLowerCase().includes('pseudocode') || code.toLowerCase().includes('step 1') || code.includes('->'))) {
        lang = 'pseudocode';
        if (!code.startsWith('// Pseudocode')) {
          code = `// Pseudocode: Not executable\n${code}`;
        }
      } else if (!lang) {
        lang = 'javascript';
      }
    }

    return `\`\`\`${lang || 'javascript'}\n${code}\`\`\``;
  });
}

/**
 * Query local Ollama instance using POST /api/chat with stream: false.
 * Sends supported messages format and reads answer from message.content.
 */
async function queryOllamaChat({ message, history = [], systemPrompt }) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);

  // Construct supported messages format for Ollama
  const messages = [
    { role: 'system', content: systemPrompt }
  ];

  if (Array.isArray(history) && history.length > 0) {
    const recent = history.slice(-6);
    for (const h of recent) {
      if (h && typeof h === 'object') {
        const role = (h.sender === 'user' || h.role === 'user') ? 'user' : 'assistant';
        const content = (h.markdown || h.text || h.content || '').trim();
        if (content) {
          messages.push({ role, content });
        }
      }
    }
  }

  messages.push({ role: 'user', content: message });

  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages,
        stream: false,
        keep_alive: OLLAMA_KEEP_ALIVE
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      let errBody = '';
      try {
        const errJson = await res.json();
        errBody = errJson?.error || JSON.stringify(errJson);
      } catch {
        try {
          errBody = await res.text();
        } catch {
          errBody = '';
        }
      }

      if (res.status === 404 || errBody.toLowerCase().includes('not found')) {
        return {
          ok: false,
          errorType: 'MODEL_NOT_FOUND',
          error: `Model '${OLLAMA_MODEL}' was not found in your local Ollama installation.`,
          setupGuide: `Run 'ollama list' in your terminal or pull the model with 'ollama pull ${OLLAMA_MODEL}'.`
        };
      }

      const isMemoryError =
        (errBody.toLowerCase().includes('requires') && errBody.toLowerCase().includes('available')) ||
        errBody.toLowerCase().includes('memory') ||
        errBody.toLowerCase().includes('out of memory');

      if (isMemoryError) {
        return {
          ok: false,
          errorType: 'INSUFFICIENT_MEMORY',
          error: `Insufficient system memory to load model '${OLLAMA_MODEL}': ${errBody}`,
          setupGuide: `Model '${OLLAMA_MODEL}' requires more system memory than currently available. Close memory-heavy apps to free unified RAM, or configure a lighter model in server/.env.`
        };
      }

      return {
        ok: false,
        errorType: 'OLLAMA_HTTP_ERROR',
        error: `Ollama returned HTTP error ${res.status}: ${errBody || 'Unknown error'}`,
        setupGuide: `Check Ollama service status at ${OLLAMA_BASE_URL}.`
      };
    }

    const data = await res.json();
    const rawContent = data?.message?.content || '';
    if (!rawContent) {
      return {
        ok: false,
        errorType: 'EMPTY_RESPONSE',
        error: 'Ollama returned an empty response.',
        setupGuide: `Verify model '${OLLAMA_MODEL}' is working with 'ollama run ${OLLAMA_MODEL}'.`
      };
    }

    const cleanMarkdown = verifyAndSanitizeCodeBlocks(rawContent.trim());
    return {
      ok: true,
      markdown: cleanMarkdown,
      model: OLLAMA_MODEL
    };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      return {
        ok: false,
        errorType: 'TIMEOUT',
        error: `Ollama generation timed out after ${OLLAMA_TIMEOUT_MS / 1000}s.`,
        setupGuide: `The model '${OLLAMA_MODEL}' exceeded the ${OLLAMA_TIMEOUT_MS / 1000}s timeout threshold on your machine. You can increase OLLAMA_TIMEOUT_MS in server/.env.`
      };
    }
    const isConnRefused = err.code === 'ECONNREFUSED' || (err.cause && err.cause.code === 'ECONNREFUSED');
    return {
      ok: false,
      errorType: 'OLLAMA_NOT_RUNNING',
      error: isConnRefused
        ? `Ollama service is not running at ${OLLAMA_BASE_URL}.`
        : `Could not connect to Ollama (${err.message}).`,
      setupGuide: `Start the Ollama app or run 'ollama serve' in your terminal.`
    };
  }
}

/**
 * Query Gemini model cascade (gemini-3.5-flash-lite -> gemini-3.5-flash)
 */
async function queryGeminiCascade({ cleanMsg, history = [], systemPrompt }) {
  const contents = [];
  if (Array.isArray(history) && history.length > 0) {
    const recentHistory = history.slice(-6);
    for (const h of recentHistory) {
      if (h && typeof h === 'object') {
        const text = (h.markdown || h.text || h.content || '').trim();
        if (text) {
          const role = (h.sender === 'user' || h.role === 'user') ? 'user' : 'model';
          if (contents.length === 0 && role === 'model') continue;
          contents.push({ role, parts: [{ text }] });
        }
      }
    }
  }

  contents.push({ role: 'user', parts: [{ text: cleanMsg }] });

  const candidateModels = ['gemini-3.5-flash-lite', 'gemini-3.5-flash'];
  let lastError = '';

  for (const model of candidateModels) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);
    try {
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY.trim())}`;
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: { temperature: 0.35, maxOutputTokens: 2048 }
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        const rawMarkdown = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const cleanMarkdown = verifyAndSanitizeCodeBlocks(rawMarkdown.trim());
        return { ok: true, markdown: cleanMarkdown, model };
      } else {
        const errText = await res.text().catch(() => '');
        console.warn(`[Gemini API Error] model=${model} status=${res.status}: ${errText.slice(0, 150)}`);
        lastError = `Status ${res.status}`;
      }
    } catch (err) {
      clearTimeout(timeoutId);
      lastError = err.message || 'Timeout/Network error';
    }
  }

  return { ok: false, error: lastError };
}

/**
 * Uniform response formatter for all AI Tutor responses (Gemini & Ollama)
 */
function formatTutorPayload({
  cleanMarkdown,
  cleanMsg,
  source,
  sourceLabel,
  model,
  provider,
  fallbackNotice
}) {
  const paragraphs = cleanMarkdown.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const introParagraph =
    paragraphs.find((p) => !p.startsWith('#') && !p.startsWith('```') && !p.startsWith('---')) ||
    paragraphs[0] ||
    'Here is the explanation.';
  const plainText = introParagraph.replace(/[#*`_]/g, '').trim();

  const codeMatch = cleanMarkdown.match(/```(?:[a-zA-Z0-9_-]+)?\n([\s\S]*?)```/);
  const codeSnippet = codeMatch ? codeMatch[1].trim() : undefined;

  const bulletMatches = cleanMarkdown.match(/(?:^|\n)\s*[-*•]\s+([^\n]+)/g);
  const bulletPoints = bulletMatches
    ? bulletMatches.slice(0, 4).map((b) => b.replace(/^\s*[-*•]\s+/, '').replace(/\*\*/g, '').trim())
    : [];

  const lastParagraph = paragraphs[paragraphs.length - 1] || '';
  const isFollowUp =
    lastParagraph.endsWith('?') ||
    lastParagraph.toLowerCase().includes('follow-up') ||
    lastParagraph.toLowerCase().includes('doubt');
  const suggestedFollowUp = isFollowUp ? lastParagraph.replace(/[*_#]/g, '').trim() : undefined;

  const visualModel = detectVisualModelServer(cleanMsg, cleanMarkdown) || undefined;
  const visual = visualModel ? buildTutorVisualSpec(visualModel) : undefined;

  return {
    ok: true,
    source,
    sourceLabel,
    model,
    provider,
    explanation: plainText,
    text: plainText,
    markdown: cleanMarkdown,
    bulletPoints,
    codeSnippet,
    suggestedFollowUp,
    visual,
    visualType: visual?.visualType,
    visualTitle: visual?.visualTitle,
    visualDescription: visual?.visualDescription,
    visualModel,
    fallbackNotice
  };
}

/**
 * POST /api/tutor
 * Unified AI Tutor Endpoint supporting:
 * - auto: Gemini online first -> local Ollama fallback -> built-in offline engine
 * - online: Gemini cloud only (never silently falls back to Ollama)
 * - offline: Ollama local model only (never calls Gemini or external AI API)
 */
app.post(['/api/tutor', '/tutor'], async (req, res) => {
  try {
    const { message = '', history = [], provider = 'auto', mode } = req.body || {};
    const cleanMsg = typeof message === 'string' ? message.trim() : '';

    if (!cleanMsg) {
      return res.status(400).json({ ok: false, error: 'Question message cannot be empty' });
    }

    const selectedProvider = (provider || mode || 'auto').toLowerCase().trim();
    const isExplicitOffline = selectedProvider === 'offline' || selectedProvider === 'ollama';
    const isExplicitOnline = selectedProvider === 'online' || selectedProvider === 'gemini';

    const isGeminiKeyConfigured = Boolean(
      GEMINI_API_KEY &&
      GEMINI_API_KEY.trim() &&
      !GEMINI_API_KEY.includes('your_gemini_api_key')
    );

    // Detect if user is specifically requesting a concise/short answer
    const isBrevityRequested = /\b(short answer|brief|concise|in 1 line|in 2 lines|in 1-2 lines|in a few words|tldr|quick summary)\b/i.test(cleanMsg);

    const systemPrompt = `You are the SMART BRIDGE AI Study Tutor—a patient, encouraging, and brilliant personal teacher for students preparing for tech careers.

YOUR TEACHING PHILOSOPHY & CRITICAL GUIDELINES:

1. Personal Teacher Persona:
   - Always address the student directly in a warm, patient, and conversational manner (e.g., "Great question!", "Let's break this down together step by step.").
   - Never be sterile, terse, or merely output dictionary definitions. Teach the concept with empathy.

2. Language & Tone:
   - Default to simple, beginner-friendly English with everyday vocabulary.
   - If the student asks in Hindi or Hinglish (e.g. "Mujhe JavaScript promises Hinglish mein bilkul basic se samjhao", "Recursion kya hota hai?"), respond naturally in the same friendly Hinglish / Hindi.

3. Adaptive Depth & Length:
   ${isBrevityRequested
     ? '- The student has specifically requested a SHORT or CONCISE answer. Provide a direct, beginner-friendly 1-2 paragraph explanation (or 3 crisp bullet points). Do NOT provide the full 8-section breakdown unless explicitly asked.'
     : '- For general questions or "explain in detail", provide a thorough, structured, and comprehensive lesson using the educational structure below.'}

4. Natural Educational Structure for Detailed Lessons:
   - **Simple Definition**: Clear, jargon-free explanation. If introducing technical terms (e.g., call stack, immutable, reconciliation), explain what they mean immediately in plain words.
   - **Why It Matters**: The real-world problem this solves or why developers use it.
   - **How It Works Step-by-Step**: A clear, chronological walkthrough of the mechanism.
   - **Relatable Real-World Analogy**: A vivid non-programming analogy from everyday life (e.g., cafeteria line, recipe, Russian nesting dolls, postal delivery, restaurant waiter).
   - **Practical Code Example**: Clean, runnable, and commented code snippet when relevant to software engineering.
   - **Line-by-Line Breakdown**: When dissecting code or loops, clearly walk through key lines or iterations.
   - **Common Mistakes / Pitfalls**: Highlight the #1 trap or misconception beginners face and how to avoid it.
   - **Quick Summary**: 2-3 bullet points recapping the core takeaways.
   - **Thoughtful Follow-Up**: Ask one engaging question or suggest a tiny tweak only when it genuinely aids active learning.

5. CRITICAL PROGRAMMING SYNTAX & CODE ACCURACY RULES:
   - Code examples MUST ALWAYS be 100% syntactically valid in the target language (e.g., standard JavaScript / TypeScript keywords like "if", "else", "return", "function", "const", "let", "var", "for", "while", "class", "try", "catch", "async", "await").
   - NEVER invent or translate programming keywords or syntax into Hindi, Hinglish, or informal spoken words inside code blocks.
     * NEVER write pseudo-keywords like "agar", "yadi", "warna", "wapas", "karo", "jabtak", "chalao" in code!
     * ALWAYS write standard English keywords: "if", "else", "return", "function", etc.
   - Comments inside code blocks (// comment) may be in English or Hinglish, but the executable code syntax must be strictly valid.
   - KEEP EXPLANATIONS AND CODE SEPARATE: Always place code in distinct, dedicated markdown code blocks (\`\`\`javascript ... \`\`\`). Do not embed prose paragraphs inside code fences.
   - PSEUDOCODE: If non-executable pseudocode or conceptual diagrams are intentionally provided, you MUST explicitly label the block as \`\`\`pseudocode and include a leading comment: "// Pseudocode: Not executable".

6. ACCURATE TECHNICAL CONCEPTS (Avoid Misleading Simplifications):
   - When explaining JavaScript concurrency or the Event Loop: Accurately explain that JavaScript commonly executes application code (the call stack) on a single main thread. Asynchronous operations (such as timers setTimeout, network requests fetch/XHR, and disk I/O in Node.js) are handled concurrently by host browser Web APIs or Node.js runtime/libuv worker threads, with their completion callbacks queued back to the microtask queue or task/macrotask queue.

7. Handling "I Don't Understand" / Simplification:
   - If the student says "I don't understand", "explain it more simply", or seems stuck, warmly reassure them. Explain again using even simpler everyday language and a brand-new, different analogy.

8. Non-Programming Questions:
   - For non-coding topics (math, career advice, study habits, architecture concepts), adapt naturally without forcing code snippets.

9. Formatting:
   - Format cleanly in readable GitHub Markdown using headings (##, ###), bullet lists, bold keywords for emphasis, and properly syntax-highlighted code blocks (\`\`\`javascript, \`\`\`typescript, \`\`\`python, etc.).`;

    // --------------------------------------------------------------------------
    // CASE 1: EXPLICIT OFFLINE MODE (Ollama local model only)
    // NEVER call Gemini or any external API.
    // --------------------------------------------------------------------------
    if (isExplicitOffline) {
      console.log(`[AI Tutor Backend] Offline Mode requested: Calling local Ollama (${OLLAMA_MODEL})...`);
      const ollamaRes = await queryOllamaChat({ message: cleanMsg, history, systemPrompt });
      if (ollamaRes.ok) {
        return res.json(
          formatTutorPayload({
            cleanMarkdown: ollamaRes.markdown,
            cleanMsg,
            source: 'ollama',
            sourceLabel: `🦙 Ollama · Local (${OLLAMA_MODEL})`,
            model: OLLAMA_MODEL,
            provider: 'offline'
          })
        );
      }

      // Ollama failed in explicit offline mode
      console.warn(`[AI Tutor Backend] Offline Ollama failed: ${ollamaRes.error}`);
      return res.json({
        ok: false,
        source: 'offline-error',
        provider: 'offline',
        errorType: ollamaRes.errorType,
        reason: ollamaRes.error,
        setupGuide: ollamaRes.setupGuide,
        fallback: true
      });
    }

    // --------------------------------------------------------------------------
    // CASE 2: EXPLICIT ONLINE MODE (Gemini API only)
    // NEVER silently fall back to Ollama.
    // --------------------------------------------------------------------------
    if (isExplicitOnline) {
      console.log('[AI Tutor Backend] Online Mode requested: Calling Gemini Cloud AI...');
      if (!isGeminiKeyConfigured) {
        return res.json({
          ok: false,
          source: 'online-error',
          provider: 'online',
          fallback: false,
          reason: 'GEMINI_API_KEY is not configured on the server. Add your key to server/.env or switch provider to Offline (Ollama).'
        });
      }

      const geminiResult = await queryGeminiCascade({ cleanMsg, history, systemPrompt });
      if (geminiResult.ok) {
        return res.json(
          formatTutorPayload({
            cleanMarkdown: geminiResult.markdown,
            cleanMsg,
            source: 'gemini',
            sourceLabel: '🌟 Gemini AI Model · Online',
            provider: 'online'
          })
        );
      }

      // Online failed — DO NOT silently switch to Ollama
      console.warn(`[AI Tutor Backend] Online Gemini failed: ${geminiResult.error}`);
      return res.json({
        ok: false,
        source: 'online-error',
        provider: 'online',
        fallback: false,
        reason: `Gemini Online AI request failed: ${geminiResult.error}. (Online mode is configured to not fall back to local models).`
      });
    }

    // --------------------------------------------------------------------------
    // CASE 3: AUTO MODE (Try Gemini -> fallback to Ollama -> fallback to built-in)
    // --------------------------------------------------------------------------
    let geminiError = '';
    if (isGeminiKeyConfigured) {
      const geminiResult = await queryGeminiCascade({ cleanMsg, history, systemPrompt });
      if (geminiResult.ok) {
        return res.json(
          formatTutorPayload({
            cleanMarkdown: geminiResult.markdown,
            cleanMsg,
            source: 'gemini',
            sourceLabel: '🌟 Gemini AI Model · Online',
            provider: 'auto'
          })
        );
      }
      geminiError = geminiResult.error;
    } else {
      geminiError = 'GEMINI_API_KEY not configured';
    }

    // Gemini unavailable in Auto mode — try Ollama locally
    console.log(`[AI Tutor Backend] Auto Mode: Gemini unavailable (${geminiError}). Attempting local Ollama (${OLLAMA_MODEL})...`);
    const ollamaRes = await queryOllamaChat({ message: cleanMsg, history, systemPrompt });
    if (ollamaRes.ok) {
      return res.json(
        formatTutorPayload({
          cleanMarkdown: ollamaRes.markdown,
          cleanMsg,
          source: 'ollama',
          sourceLabel: `🦙 Ollama · Local (${OLLAMA_MODEL})`,
          model: OLLAMA_MODEL,
          provider: 'auto',
          fallbackNotice: `Gemini cloud unavailable (${geminiError}). Seamlessly answered with local Ollama (${OLLAMA_MODEL}).`
        })
      );
    }

    // Both failed in Auto mode — instruct frontend to fall back to built-in curriculum
    console.warn(`[AI Tutor Backend] Auto Mode: Both cloud and local AI failed: ${ollamaRes.error}`);
    return res.json({
      ok: false,
      source: 'auto-fallback',
      provider: 'auto',
      fallback: true,
      reason: `Gemini cloud unavailable (${geminiError}) and local Ollama unavailable (${ollamaRes.error}).`
    });
  } catch (err) {
    console.warn('[SMART BRIDGE Server] Tutor request error:', err.message);
    return res.json({
      ok: false,
      fallback: true,
      reason: err.message || 'API invocation error'
    });
  }
});

/**
 * Parses markdown into structured NoteSection[] for backwards compatibility
 * with existing tests and components expecting note.sections.
 */
function parseMarkdownToSections(markdown) {
  if (!markdown || typeof markdown !== 'string') return [];
  const rawSections = markdown.split(/(?=^##\s+)/m);
  const sections = [];

  for (const block of rawSections) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    const headingMatch = trimmed.match(/^##\s+([^\n]+)/);
    let heading = headingMatch ? headingMatch[1].trim() : '';
    let body = trimmed;

    if (!heading) {
      const topTitleMatch = trimmed.match(/^#\s+([^\n]+)/);
      if (topTitleMatch) {
        heading = 'Overview & Introduction';
        body = trimmed.replace(/^#\s+[^\n]+\n*/, '').trim();
      } else {
        heading = 'Overview';
      }
    } else {
      body = trimmed.replace(/^##\s+[^\n]+\n*/, '').trim();
    }

    // Extract code snippet if present inside this section
    const codeMatch = body.match(/```(?:[a-zA-Z0-9_-]+)?\n([\s\S]*?)```/);
    const code = codeMatch ? codeMatch[1].trim() : undefined;

    sections.push({
      heading,
      content: body,
      code
    });
  }

  if (sections.length === 0) {
    const codeMatch = markdown.match(/```(?:[a-zA-Z0-9_-]+)?\n([\s\S]*?)```/);
    sections.push({
      heading: 'Comprehensive Study Notes',
      content: markdown,
      code: codeMatch ? codeMatch[1].trim() : undefined
    });
  }

  return sections;
}

/**
 * POST /api/notes
 * Generates authoritative, hackathon-ready study notes using Gemini API.
 * Returns { ok: true, source: 'gemini', title, topic, markdown, sections, ... }
 */
app.post(['/api/notes', '/notes'], async (req, res) => {
  try {
    const {
      topic = '',
      subject = 'Computer Science & IT',
      educationLevel = 'College / Undergraduate',
      detailLevel = 'comprehensive',
      style = 'cheatsheet',
      language = 'English'
    } = req.body || {};

    const cleanTopic = typeof topic === 'string' ? topic.trim() : '';
    if (!cleanTopic) {
      return res.status(400).json({ ok: false, error: 'Study topic cannot be empty' });
    }

    const isKeyConfigured = Boolean(
      GEMINI_API_KEY &&
      GEMINI_API_KEY.trim() &&
      !GEMINI_API_KEY.includes('your_gemini_api_key')
    );

    if (!isKeyConfigured) {
      return res.json({
        ok: false,
        fallback: true,
        reason: 'GEMINI_API_KEY not configured on server. Use local offline curriculum engine.'
      });
    }

    const systemPrompt = `You are the SMART BRIDGE Master Study Notes Architect—an expert educator and textbook author who crafts authoritative, clear, engaging, and thoroughly structured study notes for students.

Your study notes must be genuinely useful for exam revision, deep conceptual understanding, and practical application.

NATURAL EDUCATIONAL NOTE STRUCTURE:
Your generated note MUST be formatted cleanly in GitHub Markdown and naturally include these sections:

# [Topic Title]: Comprehensive Study Guide

## 1. Introduction & Overview
A motivating, beginner-friendly introduction explaining what this concept is, its primary role, and why it matters in real-world systems.

## 2. Learning Objectives & Prerequisites
- **Learning Objectives**: 3-5 clear bullet points stating what competencies the student will master.
- **Prerequisites**: Key foundational concepts needed (or "None: Beginner-friendly").

## 3. Core Terminology & Definitions
Precise, plain-language definitions of critical terms and keywords. Always explain technical terms when first introduced.

## 4. In-Depth Architectural & Conceptual Breakdown
Detailed explanations structured with logical subheadings (###). Explain step-by-step mechanisms and internal workings.

## 5. Real-World Analogy
At least one relatable, intuitive analogy from everyday life that builds a clear mental model (e.g. an orchestra conductor, restaurant kitchen, city traffic system).

## 6. Detailed Comparison Table
A structured Markdown table comparing key alternatives, components, or parameters (e.g. Process vs Thread, Paging vs Segmentation, Monolithic vs Microkernel).

## 7. System Diagrams & Flowcharts
A clean, text-based ASCII diagram or flowchart inside a code block (e.g., process states: New -> Ready -> Running -> Waiting -> Terminated, or memory layout) to help visual learners.

## 8. Practical Implementation / Code Example
- For programming / computer science topics: Provide clean, 100% syntactically valid runnable code snippet(s) with explanations and line-by-line breakdown.
- For non-programming topics: Provide concrete case studies or domain examples without forcing code.

## 9. Advantages, Limitations & Common Pitfalls
- **Key Advantages**: Why this approach or technology is chosen.
- **Limitations & Trade-offs**: When it is not suitable or resource constraints.
- **Common Mistakes / Pitfalls**: 2-3 frequent exam misconceptions or beginner traps.

## 10. High-Yield Exam & Interview Points
Crucial definitions, theoretical guarantees, time/space complexities, or frequently asked interview questions.

## 11. Quick Revision Summary
A crisp, high-yield bulleted recap for rapid review before an exam.

## 12. Practice Questions & Self-Check
Provide 5 to 8 practice questions (multiple choice, conceptual, or problem-solving).
CRITICAL: Put the questions first, then create a distinct subsection "### Detailed Solutions & Explanations" below them so students can attempt the questions first before checking answers!

CRITICAL QUALITY & LANGUAGE RULES:
- Language: Default to student-friendly English. If the user specifies Hindi or Hinglish, write the entire explanation in natural, fluent Hindi or Hinglish.
- No repetitive filler, shallow bullet points, or unsupported claims.
- Valid Code: NEVER output translated pseudo-keywords (e.g. agar, warna, wapas) in code. Code blocks must be 100% syntactically valid in the target language.
- Formatting: Clean Markdown headings (##, ###), bullet lists, bold keywords, markdown tables (| ... |), and code fences.`;

    const userPrompt = `Please synthesize an in-depth, authoritative study guide for:
Topic: "${cleanTopic}"
Subject/Domain: ${subject}
Education Level: ${educationLevel}
Notes Style: ${style}
Detail Depth: ${detailLevel}
Language: ${language}`;

    const candidateModels = ['gemini-3.5-flash-lite', 'gemini-3.5-flash'];
    let apiResponse = null;
    let lastError = '';

    for (const model of candidateModels) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 22000);
      try {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY.trim())}`;
        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemPrompt }]
            },
            contents: [
              {
                role: 'user',
                parts: [{ text: userPrompt }]
              }
            ],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 4096
            }
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          apiResponse = res;
          break;
        } else {
          lastError = `Status ${res.status}`;
        }
      } catch (err) {
        clearTimeout(timeoutId);
        lastError = err.message || 'Timeout/Network error';
      }
    }

    if (!apiResponse || !apiResponse.ok) {
      console.warn(`[SMART BRIDGE Server] Notes Gemini API cascade fallback: ${lastError}`);
      return res.json({
        ok: false,
        fallback: true,
        reason: `Gemini API returned ${lastError}`
      });
    }

    const data = await apiResponse.json();
    const rawMarkdown = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleanMarkdown = verifyAndSanitizeCodeBlocks(rawMarkdown.trim());

    // Extract title from top # Heading if present, or fallback to cleanTopic
    const titleMatch = cleanMarkdown.match(/^#\s+([^\n]+)/m);
    const parsedTitle = titleMatch ? titleMatch[1].replace(/[:\-–].*$/, '').trim() : cleanTopic;

    const sections = parseMarkdownToSections(cleanMarkdown);

    const styleLabels = {
      cheatsheet: '⚡ Exam Cheatsheet & Syntax',
      summary: '📌 Executive Conceptual Summary',
      flashcards: '🎴 Flashcard Bullet Q&As',
      tutorial: '🛠️ Hands-on Step-by-Step Guide'
    };

    return res.json({
      ok: true,
      source: 'gemini',
      sourceLabel: '🌟 Gemini Cloud AI',
      id: `note-${Date.now()}`,
      topic: cleanTopic,
      title: parsedTitle || cleanTopic,
      styleLabel: styleLabels[style] || 'Comprehensive Study Guide',
      language,
      detailLevel,
      educationLevel,
      subject,
      markdown: cleanMarkdown,
      sections,
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn('[SMART BRIDGE Server] Notes generation error:', err.message);
    return res.json({
      ok: false,
      fallback: true,
      reason: err.message || 'Notes generation error'
    });
  }
});

/**
 * POST /api/career
 * Intelligent Career Compass Analyzer
 * Analyzes student credentials, projects, and skills to recommend realistic entry-level roles,
 * differentiate demonstrated vs self-reported skills, and construct an actionable 3-phase roadmap.
 * Provider Cascade: Gemini Cloud AI -> Ollama Local AI -> Offline Pedagogical Career Engine.
 */
app.post(['/api/career', '/career'], async (req, res) => {
  try {
    const profile = req.body || {};
    const degree = (profile.degree || 'B.Tech / B.E.').trim();
    const branch = (profile.branch || 'Computer Science & Engineering').trim();
    const semester = (profile.semester || '6th Semester').trim();
    const skills = Array.isArray(profile.skills) ? profile.skills : [];
    const projects = (profile.projects || '').trim();
    const certifications = (profile.certifications || '').trim();
    const preferredAreas = Array.isArray(profile.preferredAreas) ? profile.preferredAreas : [];
    const rolePreference = (profile.rolePreference || 'Internship / Trainee').trim();

    const isKeyReady = Boolean(
      GEMINI_API_KEY &&
      GEMINI_API_KEY.trim() &&
      !GEMINI_API_KEY.includes('your_gemini_api_key')
    );

    let apiResponse = null;
    let lastError = null;

    if (isKeyReady) {
      const systemInstruction = `You are an expert, realistic technical career counselor and engineering hiring advisor for undergraduate and graduate technology students.
Your goal is to perform a realistic Career Compass analysis based on the student's profile.

CRITICAL RULES:
1. Ground your recommendations in the student's real background.
2. Differentiate strictly between "demonstratedSkills" (skills proven by concrete implementation in projects, code repositories, or practical experience) and "selfReportedSkills" (skills listed on the profile without verified project proof).
3. Recommend 3 to 4 realistic entry-level roles (e.g. Intern, Trainee, Junior Developer, Associate).
4. NEVER fabricate active vacancies, hiring quotas, or fake hiring guarantees (e.g. do not say "Company X is hiring 50 people right now" or "Guaranteed 100% job").
5. NEVER invent fake specific salary compensation numbers; explain standard market expectations objectively.
6. Provide safe, verified search terms (e.g. "React frontend developer intern fresher") for searching real job boards.
7. Structure a practical 3-phase learning roadmap (Phase 1: Foundation Deep-Dive & Code Hygiene, Phase 2: Production-Grade Portfolio Project, Phase 3: Interview Readiness & Targeted Outreach).
8. Return ONLY valid JSON matching this schema:
{
  "studentSummary": {
    "demonstratedSkills": ["string"],
    "selfReportedSkills": ["string"],
    "transferableStrengths": ["string"],
    "primaryReadinessObservation": "string"
  },
  "jobRecommendations": [
    {
      "id": "role-1",
      "title": "string",
      "overview": "string",
      "whyItFits": "string",
      "skillsYouHave": ["string"],
      "skillsToImprove": ["string"],
      "typicalRequirements": ["string"],
      "matchAssessment": "string",
      "readinessStatus": "Ready to Explore Now (Intern / Junior)" | "Explore After Preparation (2-3 Months)",
      "suggestedPortfolioProjects": ["string"],
      "marketContextNote": "string",
      "safeSearchQuery": "string"
    }
  ],
  "learningRoadmap": [
    {
      "phaseTitle": "string",
      "timeframe": "string",
      "focusSkills": ["string"],
      "actionMilestones": ["string"],
      "deliverableEvidence": "string"
    }
  ]
}`;

      const skillsSummary = skills.map(s => typeof s === 'string' ? s : `${s.name} (${s.level || 'Intermediate'})`).join(', ');

      const userPrompt = `Please analyze this student's profile and generate a comprehensive Career Compass assessment in valid JSON:
- Degree: ${degree}
- Branch / Major: ${branch}
- Current Semester / Stage: ${semester}
- Skills: ${skillsSummary || 'None specified'}
- Hands-on Projects & Practical Experience: ${projects || 'No project description provided'}
- Certifications / Extracurriculars: ${certifications || 'None'}
- Preferred Career Areas: ${preferredAreas.join(', ') || 'Open to all technology areas'}
- Role Preference: ${rolePreference}

Ensure JSON is fully valid and complete without trailing commas or markdown wraps.`;

      const candidateModels = [
        'gemini-2.5-flash',
        'gemini-2.0-flash',
        'gemini-1.5-flash'
      ];

      for (const model of candidateModels) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY.trim())}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);

        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
              systemInstruction: { parts: [{ text: systemInstruction }] },
              generationConfig: {
                temperature: 0.4,
                responseMimeType: 'application/json'
              }
            }),
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          if (res.ok) {
            apiResponse = res;
            break;
          } else {
            lastError = `Status ${res.status}`;
          }
        } catch (err) {
          clearTimeout(timeoutId);
          lastError = err.message || 'Timeout/Network error';
        }
      }

      if (apiResponse && apiResponse.ok) {
        try {
          const data = await apiResponse.json();
          let rawJson = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          rawJson = rawJson.trim();
          if (rawJson.startsWith('```json')) {
            rawJson = rawJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
          } else if (rawJson.startsWith('```')) {
            rawJson = rawJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
          }
          const parsed = JSON.parse(rawJson);
          if (parsed && Array.isArray(parsed.jobRecommendations) && parsed.jobRecommendations.length > 0) {
            return res.json({
              ok: true,
              source: 'gemini',
              sourceLabel: '🌟 Gemini Cloud AI',
              id: `career-analysis-${Date.now()}`,
              studentSummary: parsed.studentSummary || {
                demonstratedSkills: [],
                selfReportedSkills: skills.map(s => typeof s === 'string' ? s : `${s.name} (${s.level || 'Intermediate'})`),
                transferableStrengths: ['Problem-solving', 'Analytical thinking'],
                primaryReadinessObservation: 'Analysis completed with Gemini Cloud AI.'
              },
              jobRecommendations: parsed.jobRecommendations,
              learningRoadmap: parsed.learningRoadmap || [],
              analyzedAt: new Date().toISOString()
            });
          }
        } catch (parseErr) {
          console.warn('[SMART BRIDGE Server] Gemini Career JSON parsing error:', parseErr.message);
        }
      }
    }

    // 2. Try Ollama local AI fallback if available
    try {
      const ollamaController = new AbortController();
      const ollamaTimeout = setTimeout(() => ollamaController.abort(), 3500);
      const ollamaRes = await fetch('http://127.0.0.1:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.2',
          prompt: `Analyze this student profile: Degree ${degree}, Branch ${branch}, Skills: ${skills.map(s => s.name || s).join(', ')}. Return JSON with studentSummary, jobRecommendations, and learningRoadmap.`,
          stream: false,
          format: 'json'
        }),
        signal: ollamaController.signal
      });
      clearTimeout(ollamaTimeout);
      if (ollamaRes.ok) {
        const ollamaData = await ollamaRes.json();
        const parsedOllama = JSON.parse(ollamaData.response || '{}');
        if (parsedOllama && Array.isArray(parsedOllama.jobRecommendations)) {
          return res.json({
            ok: true,
            source: 'ollama',
            sourceLabel: '🦙 Ollama Local AI',
            id: `career-analysis-${Date.now()}`,
            ...parsedOllama,
            analyzedAt: new Date().toISOString()
          });
        }
      }
    } catch {
      // Ollama not reachable; proceed to deterministic offline engine
    }

    // 3. Deterministic Offline Pedagogical Career Engine fallback
    const offlineResult = generateOfflineCareerAnalysis({
      degree,
      branch,
      semester,
      skills,
      projects,
      certifications,
      preferredAreas,
      rolePreference
    });

    return res.json({
      ok: true,
      ...offlineResult
    });
  } catch (err) {
    console.warn('[SMART BRIDGE Server] Career analysis error:', err.message);
    const offlineFallback = generateOfflineCareerAnalysis(req.body || {});
    return res.json({
      ok: true,
      ...offlineFallback
    });
  }
});

/**
 * Validates AI-generated quiz questions to ensure:
 * - 4 distinct, non-empty options
 * - Valid integer correctAnswerIndex (0..3)
 * - Valid non-empty question and explanation strings
 */
function validateGeneratedQuizQuestions(rawItems, expectedTopic) {
  if (!Array.isArray(rawItems)) return [];
  const valid = [];
  for (let i = 0; i < rawItems.length; i++) {
    const item = rawItems[i];
    if (!item || typeof item !== 'object') continue;
    const question = typeof item.question === 'string' ? item.question.trim() : '';
    if (question.length < 15) continue;

    const rawOptions = Array.isArray(item.options)
      ? item.options.map((o) => String(o || '').trim()).filter(Boolean)
      : [];
    if (rawOptions.length !== 4) continue;

    // Check for duplicate options within the same question
    const uniqueOptions = new Set(rawOptions.map((o) => o.toLowerCase()));
    if (uniqueOptions.size !== 4) continue;

    const correctIdx = Number(item.correctAnswerIndex);
    if (!Number.isInteger(correctIdx) || correctIdx < 0 || correctIdx > 3) continue;

    const explanation = typeof item.explanation === 'string' ? item.explanation.trim() : '';
    if (explanation.length < 10) continue;

    const difficulty = ['Easy', 'Medium', 'Hard'].includes(item.difficulty)
      ? item.difficulty
      : 'Medium';
    const subtopic = typeof item.subtopic === 'string' && item.subtopic.trim()
      ? item.subtopic.trim()
      : 'Core Concepts';

    valid.push({
      id: item.id && typeof item.id === 'string'
        ? item.id
        : `ai-gen-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
      track: item.track || 'webdev',
      topic: expectedTopic || item.topic || 'General Practice',
      subtopic,
      difficulty,
      question,
      options: rawOptions,
      correctAnswerIndex: correctIdx,
      explanation
    });
  }
  return valid;
}

/**
 * Extracts and parses a JSON array from AI output (handles code fences, raw text, etc.)
 */
function parseJsonArrayFromAiOutput(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;
  const trimmed = rawText.trim();

  // Try direct parse first
  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && Array.isArray(parsed.questions)) return parsed.questions;
  } catch {}

  // Try extracting from markdown code block ```json ... ```
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try {
      const parsed = JSON.parse(codeBlockMatch[1].trim());
      if (Array.isArray(parsed)) return parsed;
      if (parsed && Array.isArray(parsed.questions)) return parsed.questions;
    } catch {}
  }

  // Try finding array bracket boundaries [ ... ]
  const firstBracket = trimmed.indexOf('[');
  const lastBracket = trimmed.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    try {
      const sliced = trimmed.substring(firstBracket, lastBracket + 1);
      const parsed = JSON.parse(sliced);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }

  return null;
}

/**
 * POST /api/quiz
 * Generates fresh, pedagogically validated multiple-choice quiz questions using Gemini or Ollama.
 * Rejects repeated questions by cross-referencing excluded question texts.
 * Returns { ok: true, source: 'gemini' | 'ollama', questions: QuizQuestion[] }
 */
app.post(['/api/quiz', '/quiz'], async (req, res) => {
  try {
    const {
      topic = 'React & Frontend Architecture',
      difficulty = 'Medium',
      count = 5,
      excludeQuestions = [],
      provider = 'auto'
    } = req.body || {};

    const cleanTopic = typeof topic === 'string' ? topic.trim() : 'React & Frontend Architecture';
    const cleanDiff = typeof difficulty === 'string' ? difficulty.trim() : 'Medium';
    const safeCount = Math.min(Math.max(Number(count) || 5, 1), 10);
    const selectedProvider = (provider || 'auto').toLowerCase().trim();

    console.log(`[AI Quiz Backend] Request received: topic="${cleanTopic}", diff="${cleanDiff}", count=${safeCount}, provider="${selectedProvider}"`);

    // Prepare exclusion instructions to ensure AI does not produce repeated questions
    let exclusionClause = '';
    if (Array.isArray(excludeQuestions) && excludeQuestions.length > 0) {
      const sampleExcluded = excludeQuestions.slice(-10).map((q, idx) => `${idx + 1}. ${q}`).join('\n');
      exclusionClause = `CRITICAL UNIQUENESS REQUIREMENT:
The user has recently seen the following questions. You MUST NOT repeat any of these questions or create trivial variations of them:
${sampleExcluded}
Each generated question must test a fresh, distinct aspect or practical engineering scenario.`;
    }

    const systemPrompt = `You are the SMART BRIDGE AI Quiz Generation Engine.
Your task is to generate exactly ${safeCount} high-quality, technically accurate multiple-choice assessment questions.

Topic: ${cleanTopic}
Difficulty: ${cleanDiff === 'Any' ? 'Balanced mix of Easy, Medium, and Hard' : cleanDiff}
Target Audience: Engineering students, tech job seekers, and computer science learners.

${exclusionClause}

STRICT SPECIFICATION:
1. Each question must present a realistic technical scenario, code behavior question, or conceptual trade-off.
2. Provide exactly 4 distinct, plausible options.
3. Exactly ONE option must be correct.
4. "correctAnswerIndex" MUST be an integer: 0, 1, 2, or 3.
5. "explanation" MUST be 2-3 sentences explaining why the correct option is right and the specific misconception behind incorrect options.
6. Return a valid JSON array of objects. Do not include introductory conversational text.

JSON FORMAT:
[
  {
    "id": "ai-gen-${Date.now()}-1",
    "track": "webdev",
    "topic": "${cleanTopic}",
    "subtopic": "Core Concept",
    "difficulty": "${cleanDiff === 'Any' ? 'Medium' : cleanDiff}",
    "question": "Clear, technically precise question here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswerIndex": 0,
    "explanation": "Detailed explanation of correct answer and common pitfalls."
  }
]`;

    let generatedQuestions = null;
    let usedSource = 'offline';
    let usedModel = 'none';

    // 1. Try Gemini if online or auto mode
    const isGeminiKeyConfigured = Boolean(
      GEMINI_API_KEY &&
      GEMINI_API_KEY.trim() &&
      !GEMINI_API_KEY.includes('your_gemini_api_key')
    );

    if (
      (selectedProvider === 'auto' || selectedProvider === 'online' || selectedProvider === 'gemini') &&
      isGeminiKeyConfigured
    ) {
      try {
        const geminiRes = await queryGeminiCascade({
          cleanMsg: `Generate ${safeCount} questions for ${cleanTopic} (${cleanDiff}) in JSON format`,
          history: [],
          systemPrompt
        });
        if (geminiRes.ok && geminiRes.markdown) {
          const parsed = parseJsonArrayFromAiOutput(geminiRes.markdown);
          const validated = validateGeneratedQuizQuestions(parsed, cleanTopic);
          if (validated.length >= 1) {
            generatedQuestions = validated;
            usedSource = 'gemini';
            usedModel = geminiRes.model;
          }
        }
      } catch (err) {
        console.warn('[AI Quiz Backend] Gemini generation failed:', err.message);
      }
    }

    // 2. Try Ollama if Gemini failed or offline/ollama mode requested
    if (
      !generatedQuestions &&
      (selectedProvider === 'auto' || selectedProvider === 'offline' || selectedProvider === 'ollama')
    ) {
      try {
        const ollamaRes = await queryOllamaChat({
          message: `Generate ${safeCount} questions for ${cleanTopic} (${cleanDiff}) in JSON format`,
          history: [],
          systemPrompt
        });
        if (ollamaRes.ok && ollamaRes.markdown) {
          const parsed = parseJsonArrayFromAiOutput(ollamaRes.markdown);
          const validated = validateGeneratedQuizQuestions(parsed, cleanTopic);
          if (validated.length >= 1) {
            generatedQuestions = validated;
            usedSource = 'ollama';
            usedModel = OLLAMA_MODEL;
          }
        }
      } catch (err) {
        console.warn('[AI Quiz Backend] Ollama generation failed:', err.message);
      }
    }

    if (generatedQuestions && generatedQuestions.length > 0) {
      return res.json({
        ok: true,
        source: usedSource,
        model: usedModel,
        questions: generatedQuestions
      });
    }

    // Graceful offline curriculum fallback when AI services are unavailable or exhausted
    const fallbackBank = [
      {
        id: `css-fb-1-${Date.now()}`,
        topic: cleanTopic,
        difficulty: cleanDiff,
        question: 'How does setting box-sizing: border-box affect the box model calculations of an element?',
        options: [
          'It includes padding and border within the specified width and height',
          'It adds margin and padding outside the specified width and height',
          'It removes borders completely from the element rendering tree',
          'It calculates element dimensions based only on viewport units'
        ],
        correctAnswerIndex: 0,
        explanation: 'Setting box-sizing: border-box ensures that width and height specify the total space including content, padding, and border, preventing unexpected layout overflows.'
      },
      {
        id: `css-fb-2-${Date.now()}`,
        topic: cleanTopic,
        difficulty: cleanDiff,
        question: 'In modern CSS Flexbox, what is the primary distinction between justify-content and align-items?',
        options: [
          'justify-content aligns along the main axis; align-items aligns along the cross axis',
          'justify-content aligns along the cross axis; align-items aligns along the main axis',
          'justify-content only works on grid containers; align-items only works on flex containers',
          'Both properties align elements along the vertical axis only'
        ],
        correctAnswerIndex: 0,
        explanation: 'In Flexbox, justify-content distributes items along the primary (main) axis determined by flex-direction, while align-items aligns items along the perpendicular cross axis.'
      },
      {
        id: `react-fb-1-${Date.now()}`,
        topic: cleanTopic,
        difficulty: cleanDiff,
        question: 'Why should keys assigned to elements in a React list be stable, unique, and predictable?',
        options: [
          'To help React identify which items have changed, been added, or been removed during reconciliation',
          'To automatically sort the array elements alphabetically in the browser DOM',
          'To bind DOM event listeners directly to the browser window',
          'To enable CSS module scoping inside the rendered component tree'
        ],
        correctAnswerIndex: 0,
        explanation: 'React uses keys during Virtual DOM reconciliation to match elements between renders, preventing erroneous state transfers across array reorders.'
      }
    ];

    const unexcluded = fallbackBank.filter(
      (q) => !excludeQuestions.some((ex) => typeof ex === 'string' && ex.toLowerCase().includes(q.question.slice(0, 25).toLowerCase()))
    );
    const chosenFallbacks = unexcluded.length >= safeCount ? unexcluded.slice(0, safeCount) : fallbackBank.slice(0, safeCount);

    return res.json({
      ok: true,
      source: 'offline-curriculum',
      model: 'smartbridge-curriculum-v1',
      questions: chosenFallbacks
    });
  } catch (err) {
    console.warn('[AI Quiz Backend] Error:', err.message);
    return res.status(500).json({
      ok: false,
      error: err.message,
      fallback: true
    });
  }
});

// Only bind to persistent port in local standalone development (not in Vercel serverless / services runtime)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    const isKeyReady = Boolean(GEMINI_API_KEY && GEMINI_API_KEY.trim() && !GEMINI_API_KEY.includes('your_gemini_api_key'));
    console.log(`====================================================`);
    console.log(`🌟 SMART BRIDGE AI Backend active at http://localhost:${PORT}`);
    console.log(`   Health Endpoint: http://localhost:${PORT}/api/health`);
    console.log(`   Tutor Endpoint:  http://localhost:${PORT}/api/tutor`);
    console.log(`   Notes Endpoint:  http://localhost:${PORT}/api/notes`);
    console.log(`   Career Endpoint: http://localhost:${PORT}/api/career`);
    console.log(`   Quiz Endpoint:   http://localhost:${PORT}/api/quiz`);
    console.log(`   Gemini Status:   ${isKeyReady ? 'Configured (Live)' : 'Not Configured (Offline Fallback Ready)'}`);
    if (loadedEnvPath) {
      console.log(`   Config Source:   ${path.basename(path.dirname(loadedEnvPath))}/${path.basename(loadedEnvPath)}`);
    }
    console.log(`====================================================`);

    // Pre-warm TLS connection to Google Gemini API
    if (isKeyReady) {
      fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite?key=${encodeURIComponent(GEMINI_API_KEY.trim())}`)
        .catch(() => {});
    }
  });
}

export default app;
export { app };
