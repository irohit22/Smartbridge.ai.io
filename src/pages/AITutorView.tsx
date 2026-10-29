import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { ChatMessage, TutorProviderMode, BackendHealthInfo } from '../types';
import { getOfflineTutorResponse } from '../utils/offlineTutorEngine';
import { TutorVisualization } from '../components/TutorVisualization';
import { detectVisualModel, buildTutorVisualSpec } from '../utils/visualModelDetector';
import { getUserSkillProfile, getSkillConfig } from '../utils/skillPersonalization';
import { recordLearningActivity } from '../utils/activityTracker';

interface AITutorViewProps {
  onShowToast: (msg: string) => void;
}

function formatInline(text: string): string {
  if (!text) return '';
  let res = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Inline code: `code`
  res = res.replace(/`([^`]+)`/g, '<code class="chat-inline-code">$1</code>');

  // Bold: **text**
  res = res.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Italic: *text* (when not preceded or followed by an asterisk)
  res = res.replace(/(^|[^\*])\*([^*]+)\*([^\*]|$)/g, '$1<em>$2</em>$3');

  return res;
}

function highlightSyntax(code: string, lang?: string): string {
  if (!code) return '';
  // 1. Escape HTML entities
  const escaped = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const cleanLang = (lang || '').toLowerCase().trim();
  if (cleanLang === 'text' || cleanLang === 'plain') {
    return escaped;
  }

  // Tokenize comments (single and multi-line), strings, keywords, booleans/null, numbers, and function calls
  const tokenRegex = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(\b(?:const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|default|try|catch|finally|throw|async|await|class|extends|super|import|from|export|new|this|typeof|instanceof|void|yield|in|of)\b)|(\b(?:true|false|null|undefined|NaN)\b)|(\b\d+(?:\.\d+)?\b)|(\b[a-zA-Z_$][a-zA-Z0-9_$]*(?=\s*\())/g;

  return escaped.replace(tokenRegex, (match, comment, str, keyword, booleanNull, number, fnName) => {
    if (comment) return `<span class="token-comment">${comment}</span>`;
    if (str) return `<span class="token-string">${str}</span>`;
    if (keyword) return `<span class="token-keyword">${keyword}</span>`;
    if (booleanNull) return `<span class="token-boolean">${booleanNull}</span>`;
    if (number) return `<span class="token-number">${number}</span>`;
    if (fnName) return `<span class="token-function">${fnName}</span>`;
    return match;
  });
}

interface MarkdownBlock {
  type: 'p' | 'h2' | 'h3' | 'h4' | 'divider' | 'code' | 'ul' | 'ol' | 'callout';
  lang?: string;
  content?: string;
  items?: string[];
}

function parseMarkdownBlocks(md: string): MarkdownBlock[] {
  const lines = md.split('\n');
  const blocks: MarkdownBlock[] = [];
  let currentCode: { lang: string; lines: string[] } | null = null;
  let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code fence
    if (line.trim().startsWith('```')) {
      if (currentCode) {
        blocks.push({ type: 'code', lang: currentCode.lang, content: currentCode.lines.join('\n') });
        currentCode = null;
      } else {
        if (currentList) {
          blocks.push(currentList);
          currentList = null;
        }
        const lang = line.trim().slice(3).trim();
        currentCode = { lang: lang || 'Code', lines: [] };
      }
      continue;
    }

    if (currentCode) {
      currentCode.lines.push(line);
      continue;
    }

    const trimmed = line.trim();
    if (!trimmed) {
      if (currentList) {
        blocks.push(currentList);
        currentList = null;
      }
      continue;
    }

    // Divider
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      if (currentList) {
        blocks.push(currentList);
        currentList = null;
      }
      blocks.push({ type: 'divider' });
      continue;
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      if (currentList) { blocks.push(currentList); currentList = null; }
      blocks.push({ type: 'h4', content: trimmed.slice(4) });
      continue;
    }
    if (trimmed.startsWith('## ')) {
      if (currentList) { blocks.push(currentList); currentList = null; }
      blocks.push({ type: 'h3', content: trimmed.slice(3) });
      continue;
    }
    if (trimmed.startsWith('# ')) {
      if (currentList) { blocks.push(currentList); currentList = null; }
      blocks.push({ type: 'h2', content: trimmed.slice(2) });
      continue;
    }

    // Callout (> quote)
    if (trimmed.startsWith('> ')) {
      if (currentList) { blocks.push(currentList); currentList = null; }
      blocks.push({ type: 'callout', content: trimmed.slice(2) });
      continue;
    }

    // List items: - or * or •
    const listMatch = trimmed.match(/^[-*•]\s+(.*)$/);
    if (listMatch) {
      if (!currentList || currentList.type !== 'ul') {
        if (currentList) blocks.push(currentList);
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(listMatch[1]);
      continue;
    }

    // Numbered list: 1. or 2.
    const numMatch = trimmed.match(/^\d+\.\s+(.*)$/);
    if (numMatch) {
      if (!currentList || currentList.type !== 'ol') {
        if (currentList) blocks.push(currentList);
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(numMatch[1]);
      continue;
    }

    if (currentList) {
      blocks.push(currentList);
      currentList = null;
    }

    // Regular paragraph
    blocks.push({ type: 'p', content: trimmed });
  }

  if (currentCode) {
    blocks.push({ type: 'code', lang: currentCode.lang, content: currentCode.lines.join('\n') });
  }
  if (currentList) {
    blocks.push(currentList);
  }

  return blocks;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-welcome',
    sender: 'assistant',
    text: 'Hello Alex! I am your Smart Bridge AI Study Tutor. I can break down algorithms, explain complex web development concepts, debug code snippets, or generate technical interview scenarios.',
    bulletPoints: [
      'Ask conceptual questions like "How does the React 19 compiler work?"',
      'Request memory-hook analogies or real-world mental models',
      'Paste code snippets to analyze time and space complexity'
    ],
    timestamp: 'Just now',
    isDemo: true
  }
];

export const AITutorView: React.FC<AITutorViewProps> = ({ onShowToast }) => {
  const [activeSkill, setActiveSkill] = useState<string>(() => {
    return getUserSkillProfile()?.primarySkill || 'Python';
  });

  const activeSkillConfig = getSkillConfig(activeSkill);

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: `Hello Alex! I am your Smart Bridge AI Study Tutor. Today, let's explore **${activeSkillConfig.name}** together step by step with easy real-life analogies, clean code examples, and practice checks!`,
      bulletPoints: [
        `Ask conceptual questions like "${activeSkillConfig.tutorPrompts[0]}"`,
        'Request memory-hook analogies or everyday mental models (Mixer Grinder, 10 Pushups, Kitchen Box)',
        'Paste code snippets to analyze line-by-line or debug errors'
      ],
      timestamp: 'Just now',
      isDemo: true
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [providerMode, setProviderMode] = useState<TutorProviderMode>('auto');
  const [ollamaErrorDetail, setOllamaErrorDetail] = useState<{
    type: string;
    reason: string;
    setupGuide?: string;
  } | null>(null);
  const [backendHealth, setBackendHealth] = useState<BackendHealthInfo>({
    status: 'loading',
    app: 'SMART BRIDGE AI Backend',
    port: 3000,
    geminiConfigured: false,
    ollamaRunning: false,
    ollamaModelAvailable: false,
    ollamaModel: 'qwen3:4b',
    ollamaTimeoutMs: 120000
  });

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((data: BackendHealthInfo) => {
        setBackendHealth(data);
      })
      .catch((err) => {
        console.warn('[AI Tutor] Backend health check failed:', err);
        setBackendHealth({
          status: 'error',
          app: 'SMART BRIDGE AI Backend',
          port: 3000,
          geminiConfigured: false,
          ollamaRunning: false,
          ollamaModelAvailable: false,
          ollamaModel: 'qwen3:4b',
          ollamaTimeoutMs: 120000
        });
      });
  }, []);

  const handleProviderChange = (newMode: TutorProviderMode) => {
    setProviderMode(newMode);
    if (newMode === 'ollama') {
      if (!backendHealth.ollamaRunning) {
        onShowToast('⚠️ Local Ollama is not running. Start it with "ollama serve"');
      } else if (!backendHealth.ollamaModelAvailable) {
        onShowToast(`ℹ️ Model ${backendHealth.ollamaModel || 'qwen3:4b'} missing. Run "ollama pull ${backendHealth.ollamaModel || 'qwen3:4b'}"`);
      } else {
        onShowToast(`🦙 Switched to 100% Offline AI (${backendHealth.ollamaModel || 'qwen3:4b'})`);
      }
    } else if (newMode === 'gemini') {
      if (!backendHealth.geminiConfigured) {
        onShowToast('⚠️ Gemini API key not configured on server');
      } else {
        onShowToast('🌟 Switched to Gemini Online AI');
      }
    } else {
      onShowToast('⚡ Auto Mode: Online Gemini with Local Ollama fallback');
    }
  };

  useEffect(() => {
    const handleSkillChanged = (e: any) => {
      if (e.detail?.primarySkill) {
        setActiveSkill(e.detail.primarySkill);
      }
    };
    window.addEventListener('smartbridge:skill-changed', handleSkillChanged);
    return () => window.removeEventListener('smartbridge:skill-changed', handleSkillChanged);
  }, []);

  const suggestedPrompts = activeSkillConfig.tutorPrompts;

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isTyping) return;

    const msgCount = messages.length;
    const userMsg: ChatMessage = {
      id: `user-${msgCount + 1}`,
      sender: 'user',
      text: query,
      timestamp: 'Just now'
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      // 1. Attempt connection to backend API via Vite proxy /api/tutor
      let backendAnswer: any = null;
      let apiFailureReason = '';
      let apiSetupGuide = '';

      try {
        const controller = new AbortController();
        const timeoutMs = providerMode === 'ollama'
          ? (backendHealth.ollamaTimeoutMs || 180000)
          : 7000;
        const timer = setTimeout(() => controller.abort(), timeoutMs);

        // Include recent conversation turns for context-aware follow-ups
        const conversationHistory = messages.slice(-6).map((m) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          text: m.markdown || m.text
        }));

        const res = await fetch('/api/tutor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: query,
            history: conversationHistory,
            provider: providerMode
          }),
          signal: controller.signal
        });
        clearTimeout(timer);

        if (res.ok) {
          const json = await res.json();
          if (json.ok) {
            backendAnswer = json;
            setOllamaErrorDetail(null);
          } else {
            apiFailureReason = json.reason || 'AI generation failed';
            if (json.setupGuide) {
              apiSetupGuide = json.setupGuide;
            }
            if (json.errorType) {
              setOllamaErrorDetail({
                type: json.errorType,
                reason: json.reason || 'Ollama generation failed',
                setupGuide: json.setupGuide
              });
            }
            console.warn('[AI Tutor Server Note]', json.reason);
          }
        } else {
          apiFailureReason = `Server HTTP error ${res.status}`;
          console.warn('[AI Tutor HTTP Error]', res.status, res.statusText);
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          const limitSec = Math.round((backendHealth.ollamaTimeoutMs || 120000) / 1000);
          apiFailureReason = `Request timed out after ${limitSec}s`;
          if (providerMode === 'ollama') {
            setOllamaErrorDetail({
              type: 'TIMEOUT',
              reason: `Generation timed out after ${limitSec}s`,
              setupGuide: `The model '${backendHealth.ollamaModel || 'qwen3:4b'}' exceeded the timeout threshold on this hardware. Increase OLLAMA_TIMEOUT_MS in server/.env.`
            });
          }
        } else {
          apiFailureReason = err.message || 'Cannot connect to backend server';
        }
        console.warn('[AI Tutor Network Exception]', apiFailureReason);
      }

      if (backendAnswer) {
        let visualModel = backendAnswer.visualModel || detectVisualModel(query, backendAnswer.markdown || backendAnswer.text) || undefined;
        let visual = backendAnswer.visual || (visualModel ? buildTutorVisualSpec(visualModel) : undefined);
        const botReply: ChatMessage = {
          id: `bot-${msgCount + 2}`,
          sender: 'assistant',
          explanation: backendAnswer.explanation || backendAnswer.text,
          text: backendAnswer.text,
          markdown: backendAnswer.markdown,
          bulletPoints: backendAnswer.bulletPoints,
          codeSnippet: backendAnswer.codeSnippet,
          suggestedFollowUp: backendAnswer.suggestedFollowUp,
          timestamp: 'Just now',
          sourceLabel: backendAnswer.sourceLabel || (backendAnswer.source === 'ollama' ? `🦙 Ollama · Local (${backendAnswer.model || 'qwen3:4b'})` : '🌟 Gemini AI Model · Online'),
          sourceType: backendAnswer.source || 'gemini',
          model: backendAnswer.model,
          fallbackNotice: backendAnswer.fallbackNotice,
          visual,
          visualType: backendAnswer.visualType || visual?.visualType,
          visualTitle: backendAnswer.visualTitle || visual?.visualTitle,
          visualDescription: backendAnswer.visualDescription || visual?.visualDescription,
          visualModel
        };
        setMessages((prev) => [...prev, botReply]);
        setIsTyping(false);
        recordLearningActivity({
          type: 'tutor',
          title: `AI Tutor: ${query.length > 40 ? query.slice(0, 37) + '...' : query}`,
          category: 'AI Learning',
          icon: '🤖'
        });
        return;
      }

      // --------------------------------------------------------------------------
      // SPECIFIC FAILURE HANDLING PER PROVIDER MODE
      // --------------------------------------------------------------------------

      // A. Explicit Online Mode Failure: NEVER silently switch to Ollama
      if (providerMode === 'gemini') {
        const errorMsg: ChatMessage = {
          id: `bot-${msgCount + 2}`,
          sender: 'assistant',
          text: `⚠️ **Online AI Request Failed**\n\n${apiFailureReason || 'Gemini Cloud AI is currently unreachable or unconfigured.'}\n\n*Online mode is configured to query Google Gemini directly without switching to local offline models. To run locally without internet, switch your AI Engine to **Offline (Ollama)** or **Auto**.*`,
          markdown: `### ⚠️ Online AI Request Failed\n\n${apiFailureReason || 'Gemini Cloud AI is currently unreachable or unconfigured.'}\n\n> **Online Policy:** Online mode never silently switches to local models. To use the local offline model, switch to **Offline (Ollama)** or **Auto** in the AI Engine selector above.`,
          timestamp: 'Just now',
          sourceLabel: '⚠️ Gemini · Online Error',
          sourceType: 'gemini'
        };
        setMessages((prev) => [...prev, errorMsg]);
        setIsTyping(false);
        onShowToast(`Online request failed: ${apiFailureReason}`);
        return;
      }

      // B. Explicit Offline Mode Failure: Ollama unavailable
      if (providerMode === 'ollama') {
        const isMemErr = apiFailureReason.toLowerCase().includes('memory') || apiFailureReason.toLowerCase().includes('requires');
        const isTimeout = apiFailureReason.toLowerCase().includes('timed out');
        
        let errorTitle = 'Ollama unavailable';
        if (isMemErr) {
          errorTitle = `Insufficient memory for ${backendHealth.ollamaModel || 'qwen3:4b'}`;
        } else if (isTimeout) {
          errorTitle = `Generation timed out (${backendHealth.ollamaModel || 'qwen3:4b'})`;
        }

        onShowToast(`⚠️ ${errorTitle}. Falling back to Built-in Offline Tutor.`);
        const offlineReply = getOfflineTutorResponse(query);
        let visualModel = offlineReply.visualModel || detectVisualModel(query, offlineReply.markdown || offlineReply.text) || undefined;
        let visual = offlineReply.visual || (visualModel ? buildTutorVisualSpec(visualModel) : undefined);

        let setupNotice = '';
        if (isMemErr) {
          setupNotice = `\n\n> ⚠️ **Ollama Memory Notice:** Local model \`${backendHealth.ollamaModel || 'qwen3:4b'}\` requires more memory than currently available on this system.\n> 💡 **Remedy:** ${apiSetupGuide || 'Close heavy background apps to free RAM, or configure a lighter model in server/.env.'}\n> 📖 **Active Engine:** Answered by **Built-in Offline Tutor** (never simulated as Qwen output).`;
        } else if (isTimeout) {
          setupNotice = `\n\n> ⏱️ **Ollama Timeout Notice:** Local model \`${backendHealth.ollamaModel || 'qwen3:4b'}\` exceeded the timeout threshold on this hardware.\n> 💡 **Remedy:** ${apiSetupGuide || 'Increase OLLAMA_TIMEOUT_MS in server/.env or free system resources.'}\n> 📖 **Active Engine:** Answered by **Built-in Offline Tutor** (never simulated as Qwen output).`;
        } else if (apiSetupGuide) {
          setupNotice = `\n\n> ℹ️ **Ollama Diagnostic:** ${apiSetupGuide}\n> 📖 **Active Engine:** Answered by **Built-in Offline Tutor** (never simulated as Qwen output).`;
        } else {
          setupNotice = `\n\n> ℹ️ **Ollama Setup:** Ensure Ollama is running ('ollama serve') with model \`${backendHealth.ollamaModel || 'qwen3:4b'}\`.\n> 📖 **Active Engine:** Answered by **Built-in Offline Tutor** (never simulated as Qwen output).`;
        }

        const botReply: ChatMessage = {
          id: `bot-${msgCount + 2}`,
          sender: 'assistant',
          explanation: offlineReply.explanation || offlineReply.text,
          text: offlineReply.text + setupNotice,
          markdown: (offlineReply.markdown || offlineReply.text) + setupNotice,
          bulletPoints: offlineReply.bulletPoints,
          codeSnippet: offlineReply.codeSnippet,
          suggestedFollowUp: offlineReply.suggestedFollowUp,
          timestamp: 'Just now',
          sourceLabel: '📖 Built-in Offline Tutor',
          sourceType: 'offline-curriculum',
          fallbackNotice: `Ollama unavailable (${apiFailureReason}). Answered using built-in offline curriculum.`,
          visual,
          visualType: offlineReply.visualType || visual?.visualType,
          visualTitle: offlineReply.visualTitle || visual?.visualTitle,
          visualDescription: offlineReply.visualDescription || visual?.visualDescription,
          visualModel
        };
        setMessages((prev) => [...prev, botReply]);
        setIsTyping(false);
        recordLearningActivity({
          type: 'tutor',
          title: `AI Tutor: ${query.length > 40 ? query.slice(0, 37) + '...' : query}`,
          category: 'AI Learning',
          icon: '🤖'
        });
        return;
      }

      // C. Auto Mode Failure: both cloud and local AI failed -> built-in engine
      if (apiFailureReason) {
        onShowToast(`AI services unavailable (${apiFailureReason}). Using built-in offline tutor.`);
      }

      await new Promise((r) => setTimeout(r, 200));
      const offlineReply = getOfflineTutorResponse(query);
      let visualModel = offlineReply.visualModel || detectVisualModel(query, offlineReply.markdown || offlineReply.text) || undefined;
      let visual = offlineReply.visual || (visualModel ? buildTutorVisualSpec(visualModel) : undefined);
      const botReply: ChatMessage = {
        id: `bot-${msgCount + 2}`,
        sender: 'assistant',
        explanation: offlineReply.explanation || offlineReply.text,
        text: offlineReply.text,
        markdown: offlineReply.markdown,
        bulletPoints: offlineReply.bulletPoints,
        codeSnippet: offlineReply.codeSnippet,
        suggestedFollowUp: offlineReply.suggestedFollowUp,
        timestamp: 'Just now',
        sourceLabel: offlineReply.sourceLabel,
        sourceType: offlineReply.source,
        visual,
        visualType: offlineReply.visualType || visual?.visualType,
        visualTitle: offlineReply.visualTitle || visual?.visualTitle,
        visualDescription: offlineReply.visualDescription || visual?.visualDescription,
        visualModel
      };
      setMessages((prev) => [...prev, botReply]);
      setIsTyping(false);
      recordLearningActivity({
        type: 'tutor',
        title: `AI Tutor: ${query.length > 40 ? query.slice(0, 37) + '...' : query}`,
        category: 'AI Learning',
        icon: '🤖'
      });
    } catch {
      setIsTyping(false);
      // Restore user text on unexpected failure so question is not lost
      setInputText(query);
      onShowToast('Error generating answer. Your question was preserved.');
    }
  };

  const handleCopy = (content: string, blockId?: string) => {
    if (blockId) {
      setCopiedId(blockId);
      setTimeout(() => setCopiedId(null), 2000);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(content)
        .then(() => onShowToast('Copied code to clipboard! 📋'))
        .catch(() => fallbackCopy(content));
    } else {
      fallbackCopy(content);
    }
  };

  const fallbackCopy = (content: string) => {
    try {
      const el = document.createElement('textarea');
      el.value = content;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.focus();
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      onShowToast('Copied code to clipboard! 📋');
    } catch {
      onShowToast('Unable to copy code to clipboard.');
    }
  };

  const handleClear = () => {
    setMessages(INITIAL_MESSAGES);
    onShowToast('Chat conversation reset.');
  };

  const handleVoiceDemo = () => {
    setInputText('Explain React useEffect dependency array pitfalls');
    onShowToast('Voice dictation simulated! 🎙️');
  };

  // Status badge details
  let badgeTitle = 'Auto · Smart Fallback';
  let badgeSub = 'Gemini Online ➔ Ollama Local';
  let badgeColor = '#10b981';
  let badgePulseShadow = '0 0 0 3px rgba(16, 185, 129, 0.2)';

  if (providerMode === 'gemini') {
    if (backendHealth.geminiConfigured) {
      badgeTitle = 'Gemini · Online';
      badgeSub = 'Live Google Gemini Cloud Model';
      badgeColor = '#10b981';
      badgePulseShadow = '0 0 0 3px rgba(16, 185, 129, 0.2)';
    } else {
      badgeTitle = 'Gemini Unconfigured';
      badgeSub = 'Add GEMINI_API_KEY to server/.env';
      badgeColor = '#f59e0b';
      badgePulseShadow = '0 0 0 3px rgba(245, 158, 11, 0.2)';
    }
  } else if (providerMode === 'ollama') {
    if (backendHealth.ollamaRunning && backendHealth.ollamaModelAvailable) {
      badgeTitle = 'Ollama · Local';
      badgeSub = `${backendHealth.ollamaModel || 'qwen3:4b'} · 100% Offline AI`;
      badgeColor = '#a855f7';
      badgePulseShadow = '0 0 0 3px rgba(168, 85, 247, 0.25)';
    } else if (backendHealth.ollamaRunning && !backendHealth.ollamaModelAvailable) {
      badgeTitle = `Model Missing (${backendHealth.ollamaModel || 'qwen3:4b'})`;
      badgeSub = `Run 'ollama pull ${backendHealth.ollamaModel || 'qwen3:4b'}'`;
      badgeColor = '#f59e0b';
      badgePulseShadow = '0 0 0 3px rgba(245, 158, 11, 0.2)';
    } else {
      badgeTitle = 'Ollama Not Running';
      badgeSub = 'Start Ollama or run "ollama serve"';
      badgeColor = '#ef4444';
      badgePulseShadow = '0 0 0 3px rgba(239, 68, 68, 0.2)';
    }
  } else {
    // Auto
    if (backendHealth.geminiConfigured) {
      badgeTitle = 'Gemini Cloud AI Active';
      badgeSub = 'Live Google Gemini Model Connected';
      badgeColor = '#10b981';
      badgePulseShadow = '0 0 0 3px rgba(168, 85, 247, 0.25)';
    } else if (backendHealth.ollamaRunning && backendHealth.ollamaModelAvailable) {
      badgeTitle = 'Ollama · Local Active';
      badgeSub = `${backendHealth.ollamaModel || 'qwen3:4b'} (Offline Fallback)`;
      badgeColor = '#a855f7';
      badgePulseShadow = '0 0 0 3px rgba(168, 85, 247, 0.25)';
    } else {
      badgeTitle = 'Built-in Offline Tutor';
      badgeSub = 'Local pedagogical knowledge base';
      badgeColor = '#f59e0b';
      badgePulseShadow = '0 0 0 3px rgba(245, 158, 11, 0.2)';
    }
  }

  return (
    <div className="view-container">
      {/* View Header */}
      <div className="view-header-row">
        <div>
          <span className="eyebrow">PEDAGOGICAL ASSISTANT</span>
          <h1 className="view-main-title">AI Learning Tutor</h1>
          <p className="view-desc">
            Ask technical questions, explore architectural mental models, or debug syntax with step-by-step guidance.
          </p>
        </div>

        {/* Provider Selector and Connection Status */}
        <div className="tutor-header-controls">
          <div className="provider-select-group" role="radiogroup" aria-label="AI Tutor Provider Mode">
            <span className="provider-select-label">AI Engine:</span>
            <button
              type="button"
              role="radio"
              aria-checked={providerMode === 'auto'}
              data-provider="auto"
              className={`provider-chip ${providerMode === 'auto' ? 'active' : ''}`}
              onClick={() => handleProviderChange('auto')}
              title="Auto: Gemini cloud when available with automatic local Ollama and offline engine fallback"
            >
              <span className="provider-chip-icon">⚡</span> Auto
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={providerMode === 'gemini'}
              data-provider="gemini"
              className={`provider-chip ${providerMode === 'gemini' ? 'active' : ''}`}
              onClick={() => handleProviderChange('gemini')}
              title="Online: Google Gemini API exclusively"
            >
              <span className="provider-chip-icon">🌟</span> Online (Gemini)
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={providerMode === 'ollama'}
              data-provider="ollama"
              className={`provider-chip ${providerMode === 'ollama' ? 'active' : ''}`}
              onClick={() => handleProviderChange('ollama')}
              title={`Offline: Local Ollama model (${backendHealth.ollamaModel || 'qwen3:4b'}) with zero internet`}
            >
              <span className="provider-chip-icon">🦙</span> Offline (Ollama)
            </button>
          </div>

          {/* Connection Status Badge */}
          <div className="demo-notice-badge">
            <span
              className="badge-pulse"
              style={{
                background: badgeColor,
                boxShadow: badgePulseShadow
              }}
            ></span>
            <div>
              <strong>{badgeTitle}</strong>
              <span className="demo-notice-sub">{badgeSub}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Helpful Setup Warning Banner for Offline Mode when Ollama is not ready */}
      {providerMode === 'ollama' && !backendHealth.ollamaRunning && (
        <div className="tutor-setup-alert" role="alert">
          <div className="setup-alert-icon">⚠️</div>
          <div className="setup-alert-body">
            <strong>Ollama is not running locally</strong>
            <p>
              Offline AI mode requires Ollama to be running at <code>{backendHealth.ollamaBaseUrl || 'http://127.0.0.1:11434'}</code>.
              Please start the Ollama application or run <code>ollama serve</code> in your terminal.
            </p>
          </div>
        </div>
      )}

      {providerMode === 'ollama' && backendHealth.ollamaRunning && !backendHealth.ollamaModelAvailable && (
        <div className="tutor-setup-alert alert-warning" role="alert">
          <div className="setup-alert-icon">ℹ️</div>
          <div className="setup-alert-body">
            <strong>Model &ldquo;{backendHealth.ollamaModel || 'qwen3:4b'}&rdquo; not downloaded</strong>
            <p>
              Please run <code>ollama pull {backendHealth.ollamaModel || 'qwen3:4b'}</code> once in your terminal while connected to the internet.
              Once downloaded, you can use the AI Tutor completely offline without internet!
            </p>
          </div>
        </div>
      )}

      {providerMode === 'ollama' && ollamaErrorDetail?.type === 'INSUFFICIENT_MEMORY' && (
        <div className="tutor-setup-alert alert-warning" role="alert">
          <div className="setup-alert-icon">⚠️</div>
          <div className="setup-alert-body">
            <strong>Ollama Memory Warning: {backendHealth.ollamaModel || 'qwen3:4b'}</strong>
            <p>
              {ollamaErrorDetail.reason}
            </p>
            {ollamaErrorDetail.setupGuide && (
              <p style={{ marginTop: '0.25rem', opacity: 0.85 }}>
                {ollamaErrorDetail.setupGuide}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Suggested Prompt Chips */}
      <div className="prompt-chips-tray" role="group" aria-label="Suggested Prompts">
        <span className="prompt-tray-label">Quick Prompts:</span>
        {suggestedPrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            className="prompt-chip-btn"
            onClick={() => handleSend(prompt)}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Thread Container */}
      <div className="chat-interface-panel">
        <div className="chat-scroll-region" role="log" aria-live="polite">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className={`chat-bubble-row ${
                msg.sender === 'user' ? 'bubble-user' : 'bubble-assistant'
              }`}
            >
              <div className="chat-avatar" aria-hidden="true">
                {msg.sender === 'user' ? 'AK' : '🤖'}
              </div>

              <div className="chat-content-wrap">
                <div className="chat-meta-bar">
                  <strong>
                    {msg.sender === 'user' ? 'Alex Kumar' : 'Smart Bridge Tutor'}
                  </strong>
                  {msg.sourceLabel ? (
                    <span
                      className="tag-demo-pill"
                      style={{
                        background:
                          msg.sourceType === 'gemini'
                            ? 'rgba(16, 185, 129, 0.12)'
                            : msg.sourceType === 'ollama'
                              ? 'rgba(168, 85, 247, 0.15)'
                              : 'rgba(56, 189, 248, 0.12)',
                        color:
                          msg.sourceType === 'gemini'
                            ? '#34d399'
                            : msg.sourceType === 'ollama'
                              ? '#c084fc'
                              : '#38bdf8',
                        borderColor:
                          msg.sourceType === 'gemini'
                            ? 'rgba(16, 185, 129, 0.3)'
                            : msg.sourceType === 'ollama'
                              ? 'rgba(168, 85, 247, 0.35)'
                              : 'rgba(56, 189, 248, 0.3)'
                      }}
                    >
                      {msg.sourceLabel}
                    </span>
                  ) : msg.isDemo ? (
                    <span className="tag-demo-pill">Simulated AI</span>
                  ) : null}
                  {msg.fallbackNotice && (
                    <span className="tag-fallback-pill" title={msg.fallbackNotice}>
                      ⚡ {msg.fallbackNotice}
                    </span>
                  )}
                  <span className="chat-timestamp">{msg.timestamp}</span>
                </div>

                <div className="chat-body-text">
                  {msg.markdown ? (
                    parseMarkdownBlocks(msg.markdown).map((block, bIdx) => {
                      if (block.type === 'h2') {
                        return <h2 key={bIdx}>{block.content}</h2>;
                      }
                      if (block.type === 'h3') {
                        return <h3 key={bIdx}>{block.content}</h3>;
                      }
                      if (block.type === 'h4') {
                        return <h4 key={bIdx}>{block.content}</h4>;
                      }
                      if (block.type === 'divider') {
                        return <hr key={bIdx} className="chat-divider" />;
                      }
                      if (block.type === 'callout') {
                        return (
                          <div
                            key={bIdx}
                            className="chat-callout-box"
                            dangerouslySetInnerHTML={{ __html: formatInline(block.content || '') }}
                          />
                        );
                      }
                      if (block.type === 'code') {
                        const blockKey = `${msg.id}-${bIdx}`;
                        const isPseudocode = block.lang?.toLowerCase().includes('pseudo');
                        const displayLang = isPseudocode
                          ? 'Pseudocode (Conceptual)'
                          : (block.lang || 'JavaScript');

                        return (
                          <div key={bIdx} className="chat-code-block">
                            <div className="code-header">
                              <div className="code-lang-tag">
                                <span
                                  className="code-lang-dot"
                                  style={{ background: isPseudocode ? '#f59e0b' : '#38bdf8' }}
                                ></span>
                                <span className="code-lang-name">{displayLang}</span>
                              </div>
                              <button
                                type="button"
                                className="btn-code-copy"
                                onClick={() => handleCopy(block.content || '', blockKey)}
                                title="Copy code snippet to clipboard"
                              >
                                {copiedId === blockKey ? '✓ Copied!' : '📋 Copy Code'}
                              </button>
                            </div>
                            <pre>
                              <code
                                dangerouslySetInnerHTML={{
                                  __html: highlightSyntax(block.content || '', block.lang)
                                }}
                              />
                            </pre>
                          </div>
                        );
                      }
                      if (block.type === 'ul' && block.items) {
                        return (
                          <ul key={bIdx} className="chat-bullets">
                            {block.items.map((it, iIdx) => (
                              <li key={iIdx} dangerouslySetInnerHTML={{ __html: formatInline(it) }} />
                            ))}
                          </ul>
                        );
                      }
                      if (block.type === 'ol' && block.items) {
                        return (
                          <ol key={bIdx} className="chat-bullets">
                            {block.items.map((it, iIdx) => (
                              <li key={iIdx} dangerouslySetInnerHTML={{ __html: formatInline(it) }} />
                            ))}
                          </ol>
                        );
                      }
                      return (
                        <p
                          key={bIdx}
                          dangerouslySetInnerHTML={{ __html: formatInline(block.content || '') }}
                        />
                      );
                    })
                  ) : (
                    <>
                      <p>{msg.explanation || msg.text}</p>
                      {msg.bulletPoints && msg.bulletPoints.length > 0 && (
                        <ul className="chat-bullets">
                          {msg.bulletPoints.map((bp, i) => (
                            <li key={i} dangerouslySetInnerHTML={{ __html: formatInline(bp) }} />
                          ))}
                        </ul>
                      )}
                      {msg.codeSnippet && (
                        <div className="chat-code-block">
                          <div className="code-header">
                            <div className="code-lang-tag">
                              <span className="code-lang-dot"></span>
                              <span className="code-lang-name">TypeScript / JavaScript</span>
                            </div>
                            <button
                              type="button"
                              className="btn-code-copy"
                              onClick={() => handleCopy(msg.codeSnippet!, `${msg.id}-snippet`)}
                              title="Copy code snippet to clipboard"
                            >
                              {copiedId === `${msg.id}-snippet` ? '✓ Copied!' : '📋 Copy Code'}
                            </button>
                          </div>
                          <pre>
                            <code
                              dangerouslySetInnerHTML={{
                                __html: highlightSyntax(msg.codeSnippet, 'typescript')
                              }}
                            />
                          </pre>
                        </div>
                      )}
                    </>
                  )}

                  {msg.suggestedFollowUp && !msg.markdown && (
                    <div className="chat-followup-tip">
                      💡 <em>{msg.suggestedFollowUp}</em>
                    </div>
                  )}
                </div>

                {(msg.visual || msg.visualModel) && (
                  <div className="chat-visual-model-wrap">
                    <TutorVisualization
                      visual={msg.visual}
                      visualModel={msg.visualModel}
                      visualType={msg.visualType}
                      visualTitle={msg.visualTitle}
                      visualDescription={msg.visualDescription}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="chat-bubble-row bubble-assistant"
            >
              <div className="chat-avatar" aria-hidden="true">
                🤖
              </div>
              <div className="chat-content-wrap">
                <div className="typing-indicator-wrap">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span className="typing-status-text">Gemini AI synthesizing pedagogical explanation...</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Chat Input Bar */}
        <form
          className="chat-form-tray"
          action="#"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSend();
          }}
        >
          <textarea
            className="chat-input-textarea"
            rows={2}
            placeholder="Type your question (e.g., 'How does the event loop handle promises?')..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            aria-label="Ask AI Tutor"
          />

          <div className="chat-form-actions">
            <div className="form-action-left">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleVoiceDemo}
                title="Simulate speech-to-text dictation"
              >
                🎙️ Voice Demo
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleClear}
                title="Reset conversation"
              >
                ↺ Clear
              </button>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={!inputText.trim() || isTyping}
            >
              {isTyping ? 'Generating Answer...' : 'Send Message ↗'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
