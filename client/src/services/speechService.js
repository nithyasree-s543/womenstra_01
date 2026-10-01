// Web Speech API service with multi-language voice check & subtitle fallback

class SpeechService {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.recognition = null;
    this.isListening = false;
    this.isSpeaking = false;
    this.voices = [];
    this.initVoices();
  }

  initVoices() {
    if (this.synth) {
      this.voices = this.synth.getVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => {
          this.voices = this.synth.getVoices();
        };
      }
    }
  }

  // Check if browser has a native voice for the given language code
  hasVoiceForLanguage(langCode = 'en-IN') {
    if (!this.synth) return false;
    const prefix = langCode.slice(0, 2).toLowerCase();
    return this.voices.some(v => v.lang.toLowerCase().startsWith(prefix));
  }

  playChime(type = 'success') {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      if (type === 'success') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15);
        osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.3);
      } else if (type === 'ringtone') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(480, ctx.currentTime + 0.2);
      } else {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(587.33, ctx.currentTime + 0.2);
      }

      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch {}
  }

  // Text-To-Speech
  speak(text, langCode = 'en-IN', onEndCallback, onNoVoiceCallback) {
    if (!this.synth || !text) return;

    this.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    utterance.rate = 0.92;
    utterance.pitch = 1.05;

    // Check matching voice
    const prefix = langCode.slice(0, 2).toLowerCase();
    const match = this.voices.find(v => v.lang.toLowerCase().startsWith(prefix));
    
    if (match) {
      utterance.voice = match;
    } else if (onNoVoiceCallback) {
      onNoVoiceCallback();
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      if (onEndCallback) onEndCallback();
    };

    utterance.onerror = (e) => {
      this.isSpeaking = false;
      if (onEndCallback) onEndCallback();
    };

    this.synth.speak(utterance);
  }

  cancel() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
    }
  }

  // Speech Recognition (STT)
  startListening({ lang = 'en-IN', onResult, onError, onEnd }) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      if (onError) onError('Speech recognition is not supported in this browser.');
      return null;
    }

    if (this.recognition) {
      try { this.recognition.stop(); } catch {}
    }

    this.playChime('listen');

    this.recognition = new SpeechRecognition();
    this.recognition.lang = lang;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;
    this.recognition.continuous = false;

    this.recognition.onstart = () => {
      this.isListening = true;
    };

    this.recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      const isFinal = event.results[0].isFinal;
      if (onResult) onResult({ transcript, isFinal });
    };

    this.recognition.onerror = (event) => {
      this.isListening = false;
      if (onError) onError(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (onEnd) onEnd();
    };

    try {
      this.recognition.start();
    } catch {}

    return this.recognition;
  }

  stopListening() {
    if (this.recognition) {
      try { this.recognition.stop(); } catch {}
      this.isListening = false;
    }
  }
}

export const speechService = new SpeechService();
