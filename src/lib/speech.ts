/**
 * Speech Synthesis Utilities for Chitti-Robo
 * Configured for natural Hinglish (Indian English/Hindi) voice synthesis
 * and sanitization of special characters, Markdown symbols, stars, dots, and emojis.
 */

/**
 * Sanitizes input text for text-to-speech engine.
 * Removes code segments, backticks, asterisks, double dots, hashes, brackets, checkboxes, and emojis
 * to prevent the speech engine from reading special characters literally (e.g., saying "star", "dot", "asterisk").
 */
export function sanitizeTextForSpeech(text: string): string {
  if (!text) return "";
  
  let cleaned = text;

  // 1. Omit code segments completely
  cleaned = cleaned.replace(/```[\s\S]*?```/g, " [code segment omitted] ");

  // 2. Remove inline backticks
  cleaned = cleaned.replace(/`([^`]+)`/g, "$1");

  // 3. Remove Markdown bold/italic syntax (like **bold**, *italic*, __bold__, _italic_)
  cleaned = cleaned.replace(/\*\*+/g, ""); // removes ** or ***
  cleaned = cleaned.replace(/\*/g, "");    // removes single *
  cleaned = cleaned.replace(/__+/g, "");   // removes __
  cleaned = cleaned.replace(/_/g, " ");     // replaces _ with space

  // 4. Clean Markdown links and brackets: [text](url) -> text
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1");
  cleaned = cleaned.replace(/\[([^\]]+)\]/g, "$1");

  // 5. Replace dashes and arrows (like ->, =>, ---) which might be read aloud as "dash dash dash arrow"
  cleaned = cleaned.replace(/->/g, " ");
  cleaned = cleaned.replace(/=>/g, " ");
  cleaned = cleaned.replace(/--+/g, " ");
  cleaned = cleaned.replace(/==+/g, " ");

  // 6. Clean multiple dots/ellipses (e.g. ..., ..) but KEEP single sentence-ending dots so that it pauses naturally
  cleaned = cleaned.replace(/\.{2,}/g, " ");

  // 7. Remove any other special symbols that synthesizers read out literally
  // Replace characters: *, #, @, $, %, ^, &, (, ), _, +, =, {, }, [, ], |, \, <, >, /, ~
  cleaned = cleaned.replace(/[*#@$%^&()_+=|\\<>{}\[\]~""]/g, " ");

  // 8. Replace emojis and common symbols that might cause weird voice reads
  cleaned = cleaned.replace(/✅/g, " ");
  cleaned = cleaned.replace(/❌/g, " ");
  cleaned = cleaned.replace(/🚨/g, " Alert ");
  cleaned = cleaned.replace(/🏆/g, " ");
  cleaned = cleaned.replace(/🎉/g, " ");
  cleaned = cleaned.replace(/⭐/g, " ");

  // Clean up extra whitespaces
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  return cleaned;
}

/**
 * Gets the selected Indian voice language from localStorage.
 * Defaults to "hi-IN" (Hindi) or "en-IN" (Indian English).
 */
export function getSelectedIndianVoiceLang(): string {
  if (typeof window === "undefined" || !window.localStorage) return "hi-IN";
  return window.localStorage.getItem("preferred-indian-voice-lang") || "hi-IN";
}

/**
 * Saves the selected Indian voice language to localStorage.
 */
export function setSelectedIndianVoiceLang(lang: string): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  window.localStorage.setItem("preferred-indian-voice-lang", lang);
}

/**
 * Lists all available Indian language voices from the browser's native speech synthesis.
 */
export function getAvailableIndianVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  const voices = window.speechSynthesis.getVoices();
  
  // List of Indian language codes
  const indianLangCodes = ["hi", "en-in", "ta", "te", "kn", "ml", "bn", "mr", "gu", "pa", "ur"];
  
  return voices.filter((v) => {
    const lang = v.lang.toLowerCase();
    const name = v.name.toLowerCase();
    
    // Matches if lang contains "-in" (India) or specifically start with code like "hi" or contains "india"
    const isIndianLang = indianLangCodes.some(code => lang.startsWith(code));
    const isIndiaCountry = lang.includes("-in") || lang.includes("_in") || name.includes("india") || name.includes("indian");
    
    return isIndianLang || isIndiaCountry;
  });
}

/**
 * Dynamically resolves the best available Hinglish (Hindi/Indian English) voice.
 * Prioritizes the user's selected voice lang, then 'hi-IN' (Hindi) and 'en-IN' (Indian English).
 */
export function getHinglishVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;

  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  const preferredLang = getSelectedIndianVoiceLang().toLowerCase();

  // 1. Try to find the user's preferred Indian voice
  let voice = voices.find(
    (v) => v.lang.toLowerCase() === preferredLang || v.lang.toLowerCase().startsWith(preferredLang)
  );

  // 2. Try to find exact Hindi (hi-IN) voice
  if (!voice) {
    voice = voices.find(
      (v) => v.lang.toLowerCase() === "hi-in" || v.lang.toLowerCase().startsWith("hi_in")
    );
  }

  // 3. Try Indian English (en-IN) voice as a superb alternative for natural Hinglish flow
  if (!voice) {
    voice = voices.find(
      (v) => v.lang.toLowerCase() === "en-in" || v.lang.toLowerCase().startsWith("en_in")
    );
  }

  // 4. Match any voice name containing "india", "hindi", or "accent"
  if (!voice) {
    voice = voices.find(
      (v) =>
        v.name.toLowerCase().includes("india") ||
        v.name.toLowerCase().includes("hindi") ||
        v.lang.toLowerCase().includes("in")
    );
  }

  return voice || null;
}

/**
 * Globally unified speak function with sanitization and Hinglish voice binding.
 */
export function speakText(
  text: string,
  onEnd?: () => void,
  onError?: () => void
): SpeechSynthesisUtterance | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;

  try {
    // Cancel any active/pending speech to prevent overlapping or browser freezing
    window.speechSynthesis.cancel();

    const cleanedText = sanitizeTextForSpeech(text);
    if (!cleanedText) return null;

    const utterance = new SpeechSynthesisUtterance(cleanedText);

    // Dynamic voice assignment
    const voice = getHinglishVoice();
    if (voice) {
      utterance.voice = voice;
    }

    // Set natural rate and pitch
    utterance.rate = 1.05; // Slightly faster for natural Indian cadence
    utterance.pitch = 1.0;

    if (onEnd) utterance.onend = onEnd;
    if (onError) utterance.onerror = onError;

    window.speechSynthesis.speak(utterance);
    return utterance;
  } catch (err) {
    console.warn("Speech synthesis trigger failed:", err);
    if (onError) onError();
    return null;
  }
}
