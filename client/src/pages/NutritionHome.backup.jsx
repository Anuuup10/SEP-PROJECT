import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Bell,
  Camera,
  Home,
  BarChart3,
  ScanLine,
  History,
  User,
  ChevronRight,
  Flame,
  Droplet,
  Wheat,
  Mic,
  Sparkles,
  X,
  Send,
  Volume2,
  VolumeX,
  Loader2,
  Square,
  Languages,
} from "lucide-react";

const CALORIES_EATEN = 1420;
const CALORIES_GOAL = 2000;
const CALORIE_PCT = Math.round((CALORIES_EATEN / CALORIES_GOAL) * 100);

const ASSISTANT_ENDPOINT = "/api/assistant/chat";

const MAX_HISTORY_TURNS = 10;

const MACROS = [
  { key: "protein", label: "Protein", value: 82, target: 120, unit: "g", color: "#17a374", Icon: Flame },
  { key: "carbs", label: "Carbs", value: 165, target: 250, unit: "g", color: "#f5a623", Icon: Droplet },
  { key: "fat", label: "Fat", value: 48, target: 70, unit: "g", color: "#f0883e", Icon: Wheat },
];

const RECENT_MEALS = [
  { name: "Chicken Rice Meal", calories: 628, protein: 38, items: 3, emoji: "🍗" },
];

const NAV_ITEMS = [
  { key: "home", label: "Home", Icon: Home },
  { key: "progress", label: "Progress", Icon: BarChart3 },
  { key: "scan", label: "Scan", Icon: ScanLine },
  { key: "history", label: "History", Icon: History },
  { key: "profile", label: "Profile", Icon: User },
];

const QUICK_ACTIONS = [
  {
    key: "calories",
    label: "Today's calories",
    prompt: "How many calories have I eaten today and how many are remaining?",
  },
  {
    key: "protein",
    label: "Protein today",
    prompt: "How much protein have I had today and how much is left for my goal?",
  },
  {
    key: "suggest",
    label: "What should I eat?",
    prompt: "Based on my remaining calories and protein today, what should I eat next?",
  },
  {
    key: "macros",
    label: "Remaining macros",
    prompt: "What are my remaining macros (protein, carbs, fat) for today?",
  },
];

function easeOutQuint(t) {
  return 1 - Math.pow(1 - t, 5);
}

export default function NutritionHome() {
  const [activeNav, setActiveNav] = useState("home");
  const [displayedCalories, setDisplayedCalories] = useState(0);
  const [ringPct, setRingPct] = useState(0);
  const [ringFrac, setRingFrac] = useState(0);
  const [breathe, setBreathe] = useState({ scale: 1, glow: 0 });
  const [ringEntered, setRingEntered] = useState(false);

  const [scanSheet, setScanSheet] = useState(null);
  const [isHolding, setIsHolding] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");

  const [conversation, setConversation] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [assistantError, setAssistantError] = useState("");
  const [recognitionLang, setRecognitionLang] = useState("ne-NP");
  const speechSupported =
    typeof window !== "undefined" &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  const ttsSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  const summaryRef = useRef(null);
  const hasAnimatedRef = useRef(false);
  const rafRef = useRef(null);
  const countRafRef = useRef(null);
  const longPressTimerRef = useRef(null);
  const longPressFiredRef = useRef(false);
  const recognitionRef = useRef(null);
  const conversationEndRef = useRef(null);

  const LONG_PRESS_MS = 420;

  const nutritionContext = useMemo(() => {
    const protein = MACROS.find((m) => m.key === "protein");
    const carbs = MACROS.find((m) => m.key === "carbs");
    const fat = MACROS.find((m) => m.key === "fat");
    return {
      caloriesConsumed: CALORIES_EATEN,
      calorieTarget: CALORIES_GOAL,
      caloriesRemaining: Math.max(0, CALORIES_GOAL - CALORIES_EATEN),
      proteinConsumed: protein?.value ?? null,
      proteinTarget: protein?.target ?? null,
      proteinRemaining: protein ? Math.max(0, protein.target - protein.value) : null,
      carbsConsumed: carbs?.value ?? null,
      carbsTarget: carbs?.target ?? null,
      fatConsumed: fat?.value ?? null,
      fatTarget: fat?.target ?? null,
      foodsToday: RECENT_MEALS.map((meal) => ({
        name: meal.name,
        calories: meal.calories,
        protein: meal.protein,
      })),
      goal: null,
    };
  }, []);

  const assistantState = assistantError
    ? "error"
    : isHolding
    ? "listening"
    : isProcessing
    ? "thinking"
    : isSpeaking
    ? "speaking"
    : "idle";

  const assistantStateLabel = {
    listening: "सुन्दै छु...",
    thinking: "Thinking...",
    speaking: "बोल्दै छु...",
    error: "Connection issue",
    idle: speechSupported ? "Hold the mic to talk" : "Type a message below",
  }[assistantState];

  // --- FIXED: speak() now waits for voices to finish loading before
  // picking one, instead of possibly checking an empty voice list. Chrome
  // loads voices asynchronously, so getVoices() can return [] on the very
  // first call even when a matching voice exists.
  const speak = useCallback(
    (text) => {
      if (muted || !ttsSupported) return;
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const looksNepali = /[\u0900-\u097F]/.test(text);

        const pickVoiceAndSpeak = () => {
          const voices = window.speechSynthesis.getVoices();
          const nepaliVoice = looksNepali
            ? voices.find((v) => v.lang && v.lang.toLowerCase().startsWith("ne"))
            : null;
          if (nepaliVoice) utterance.voice = nepaliVoice;
          utterance.lang = nepaliVoice ? "ne-NP" : "en-US";
          utterance.rate = 1;
          utterance.onstart = () => setIsSpeaking(true);
          utterance.onend = () => setIsSpeaking(false);
          utterance.onerror = () => setIsSpeaking(false);
          window.speechSynthesis.speak(utterance);
        };

        const existingVoices = window.speechSynthesis.getVoices();
        if (existingVoices.length === 0) {
          window.speechSynthesis.onvoiceschanged = pickVoiceAndSpeak;
        } else {
          pickVoiceAndSpeak();
        }
      } catch (err) {
        setIsSpeaking(false);
      }
    },
    [muted, ttsSupported]
  );

  const stopSpeaking = useCallback(() => {
    if (ttsSupported) {
      try {
        window.speechSynthesis.cancel();
      } catch (err) {
        // no-op
      }
    }
    setIsSpeaking(false);
  }, [ttsSupported]);

  const sendToAssistant = useCallback(
    async (userText) => {
      const trimmed = userText.trim();
      if (!trimmed || isProcessing) return;

      setAssistantError("");
      setConversation((prev) => [...prev, { role: "user", text: trimmed }]);
      setIsProcessing(true);

      try {
        const history = conversation.slice(-MAX_HISTORY_TURNS).map((turn) => ({
          role: turn.role,
          content: turn.text,
        }));

        const response = await fetch(ASSISTANT_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed, history, context: nutritionContext }),
        });

        if (!response.ok) {
          throw new Error("Assistant request failed with status " + response.status);
        }

        const data = await response.json();
        const reply = data.reply || "Sorry, I didn't quite get that.";
        setConversation((prev) => [...prev, { role: "assistant", text: reply }]);
        speak(reply);
      } catch (err) {
        if (process.env.NODE_ENV !== "production") {
          console.error("Assistant request failed:", err);
        }
        setAssistantError("माफ गर्नुहोस्, अहिले AI सँग connect हुन सकेन। फेरि प्रयास गर्नुहोस्।");
      } finally {
        setIsProcessing(false);
      }
    },
    [conversation, isProcessing, nutritionContext, speak]
  );

  const closeVoiceSheet = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        // no-op
      }
      recognitionRef.current = null;
    }
    if (ttsSupported) window.speechSynthesis.cancel();
    setIsHolding(false);
    setIsSpeaking(false);
    setIsProcessing(false);
    setVoiceTranscript("");
    setConversation([]);
    setAssistantError("");
    setScanSheet(null);
  }, [ttsSupported]);

  const handleTextSubmit = useCallback(
    (event) => {
      event.preventDefault();
      if (!textInput.trim() || isProcessing) return;
      sendToAssistant(textInput);
      setTextInput("");
    },
    [textInput, isProcessing, sendToAssistant]
  );

  const handleQuickAction = useCallback(
    (prompt) => {
      if (isProcessing) return;
      sendToAssistant(prompt);
    },
    [isProcessing, sendToAssistant]
  );

  const startVoiceAssistant = useCallback(() => {
    setVoiceTranscript("");
    setAssistantError("");
    setScanSheet("voice");
    setIsHolding(true);
    if (isSpeaking) stopSpeaking();

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = recognitionLang;
      recognition.interimResults = true;
      recognition.continuous = true;
      recognition.onresult = (event) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setVoiceTranscript(transcript);
      };
      recognition.onerror = () => {};
      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      recognitionRef.current = null;
    }
  }, [recognitionLang, isSpeaking, stopSpeaking]);

  const stopVoiceAssistant = useCallback(() => {
    setIsHolding(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        // no-op — recognition may already be stopped
      }
      recognitionRef.current = null;
    }
    setVoiceTranscript((current) => {
      if (current.trim()) sendToAssistant(current);
      return "";
    });
  }, [sendToAssistant]);

  const handleScanPointerDown = useCallback(() => {
    longPressFiredRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      longPressFiredRef.current = true;
      startVoiceAssistant();
    }, LONG_PRESS_MS);
  }, [startVoiceAssistant]);

  const handleScanPointerUp = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (longPressFiredRef.current) {
      stopVoiceAssistant();
    } else {
      setScanSheet("ai");
      setTimeout(() => setScanSheet(null), 1400);
    }
  }, [stopVoiceAssistant]);

  const handleScanPointerCancel = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (longPressFiredRef.current) {
      stopVoiceAssistant();
    }
  }, [stopVoiceAssistant]);

  const runCountUp = useCallback(() => {
    if (countRafRef.current) cancelAnimationFrame(countRafRef.current);

    const start = performance.now();
    const duration = 1400;

    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = easeOutQuint(t);
      setDisplayedCalories(Math.round(eased * CALORIES_EATEN));
      const exactPct = eased * CALORIE_PCT;
      setRingFrac(exactPct);
      setRingPct(Math.round(exactPct));
      if (t < 1) {
        countRafRef.current = requestAnimationFrame(tick);
      } else {
        countRafRef.current = null;
      }
    }
    countRafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    hasAnimatedRef.current = true;
    const enterTimer = setTimeout(() => setRingEntered(true), 40);
    const countTimer = setTimeout(() => runCountUp(), 260);
    return () => {
      clearTimeout(enterTimer);
      clearTimeout(countTimer);
    };
  }, [runCountUp]);

  useEffect(() => {
    const el = summaryRef.current;
    if (!el) return;

    let hasLeft = false;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            hasLeft = true;
          } else if (hasLeft) {
            hasLeft = false;
            runCountUp();
          }
        });
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [runCountUp]);

  useEffect(() => {
    const scrollEl = summaryRef.current?.closest("[data-scroll-container]");

    function handleScroll() {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const el = summaryRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const containerRect = scrollEl
          ? scrollEl.getBoundingClientRect()
          : { top: 0, height: window.innerHeight };
        const viewportCenter = containerRect.top + containerRect.height / 2;
        const elCenter = rect.top + rect.height / 2;
        const distance = Math.abs(viewportCenter - elCenter);
        const maxDistance = containerRect.height / 1.4;
        const proximity = Math.max(0, 1 - distance / maxDistance);
        setBreathe({
          scale: 1 + proximity * 0.035,
          glow: proximity,
        });
      });
    }

    const target = scrollEl || window;
    target.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      target.removeEventListener("scroll", handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (countRafRef.current) cancelAnimationFrame(countRafRef.current);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          // no-op
        }
        recognitionRef.current = null;
      }
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
      if (ttsSupported) {
        try {
          window.speechSynthesis.cancel();
        } catch (err) {
          // no-op
        }
      }
    };
  }, [ttsSupported]);

  const ringRadius = 62;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference * (1 - ringFrac / 100);

  useEffect(() => {
    if (scanSheet === "voice") {
      conversationEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [conversation, isProcessing, scanSheet]);

  const dotAngle = (ringFrac / 100) * 360 - 90;
  const dotAngleRad = (dotAngle * Math.PI) / 180;
  const dotX = 74 + ringRadius * Math.cos(dotAngleRad);
  const dotY = 74 + ringRadius * Math.sin(dotAngleRad);

  return (
    <div style={styles.page}>
      <div style={styles.frame} className="app-frame">
        <div style={styles.scrollArea} data-scroll-container className="app-scroll-area">
          <div style={styles.header}>
            <div>
              <h1 style={styles.greeting} className="app-greeting">
                Hello, Alex! <span style={styles.wave}>👋</span>
              </h1>
              <p style={styles.subGreeting}>Track your nutrition today</p>
            </div>
            <div style={styles.headerIcons}>
              <button type="button" style={styles.bellButton} aria-label="Notifications">
                <Bell size={17} color="#2b3b34" strokeWidth={2} />
                <span style={styles.bellDot} />
              </button>
              <div style={styles.avatar}>
                <User size={17} color="#ffffff" strokeWidth={2} />
              </div>
            </div>
          </div>

          <div style={styles.sectionHeaderRow}>
            <h2 style={styles.sectionHeading}>Today's Summary</h2>
            <button type="button" style={styles.linkButton}>
              Edit Goal
            </button>
          </div>

          <div ref={summaryRef} style={styles.summaryCard} className="app-summary-card">
            <div
              className="app-ring-wrap"
              style={{
                ...styles.ringWrap,
                opacity: ringEntered ? 1 : 0,
                transform: `scale(${ringEntered ? breathe.scale : 0.82})`,
                filter: `drop-shadow(0 0 ${8 + breathe.glow * 14}px rgba(23,163,116,${
                  0.15 + breathe.glow * 0.25
                }))`,
              }}
            >
              <svg width="100%" height="100%" viewBox="0 0 148 148" className="app-ring-svg">
                <circle
                  cx="74"
                  cy="74"
                  r={ringRadius}
                  fill="none"
                  stroke="#eef3f0"
                  strokeWidth="12"
                />
                <circle
                  cx="74"
                  cy="74"
                  r={ringRadius}
                  fill="none"
                  stroke="url(#ringGradient)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringOffset}
                  transform="rotate(-90 74 74)"
                />
                <defs>
                  <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4fe0ab" />
                    <stop offset="100%" stopColor="#17a374" />
                  </linearGradient>
                </defs>
                {ringFrac > 0.5 && (
                  <circle
                    className="app-ring-dot"
                    cx={dotX}
                    cy={dotY}
                    r="8.5"
                    fill="#ffffff"
                    stroke="#17a374"
                    strokeWidth="3.5"
                  />
                )}
              </svg>
              <div style={styles.ringCenter}>
                <span style={styles.ringNumber} className="app-ring-number">
                  {displayedCalories.toLocaleString()}
                </span>
                <span style={styles.ringUnit}>/ {CALORIES_GOAL.toLocaleString()} kcal</span>
                <span style={styles.ringPct}>{ringPct}%</span>
              </div>
            </div>

            <div style={styles.macroList}>
              {MACROS.map((macro, idx) => {
                const pct = Math.min(100, Math.round((macro.value / macro.target) * 100));
                return (
                  <div key={macro.key}>
                    <div style={styles.macroRow}>
                      <span style={styles.macroLabelWrap}>
                        <macro.Icon size={13} color={macro.color} strokeWidth={2.4} />
                        <span style={styles.macroLabel}>{macro.label}</span>
                      </span>
                      <span style={styles.macroValue}>
                        {macro.value}
                        <span style={styles.macroTarget}>
                          /{macro.target}
                          {macro.unit}
                        </span>
                      </span>
                    </div>
                    <div style={styles.macroTrack}>
                      <div
                        style={{
                          ...styles.macroFill,
                          width: `${pct}%`,
                          backgroundColor: macro.color,
                        }}
                      />
                    </div>
                    {idx < MACROS.length - 1 && <div style={styles.macroDivider} />}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={styles.sectionHeaderRow}>
            <h2 style={styles.sectionHeading}>Recent Meals</h2>
            <button type="button" style={styles.linkButton}>
              See All
            </button>
          </div>

          {RECENT_MEALS.map((meal) => (
            <button key={meal.name} type="button" style={styles.mealCard} className="meal-card">
              <div style={styles.mealThumb}>
                <span role="img" aria-label="meal" style={styles.mealEmoji}>
                  {meal.emoji}
                </span>
              </div>
              <div style={styles.mealInfo}>
                <p style={styles.mealName}>{meal.name}</p>
                <p style={styles.mealMeta}>
                  {meal.calories} kcal · {meal.items} items
                </p>
              </div>
              <ChevronRight size={16} color="#a2b0aa" />
            </button>
          ))}

          <div style={{ height: "92px" }} />
        </div>

        <nav style={styles.bottomNav}>
          {NAV_ITEMS.map((item) => {
            const isActive = activeNav === item.key;
            if (item.key === "scan") {
              return (
                <button
                  key={item.key}
                  type="button"
                  className="scan-nav-shine"
                  onPointerDown={handleScanPointerDown}
                  onPointerUp={handleScanPointerUp}
                  onPointerLeave={handleScanPointerCancel}
                  onPointerCancel={handleScanPointerCancel}
                  onContextMenu={(e) => e.preventDefault()}
                  onClick={() => setActiveNav(item.key)}
                  style={{
                    ...styles.scanNavButton,
                    transform: `translateY(-30px) scale(${isHolding ? 1.12 : 1})`,
                    boxShadow: isHolding
                      ? "0 0 0 8px rgba(23,163,116,0.18), 0 8px 18px rgba(23,163,116,0.4)"
                      : "0 8px 18px rgba(23,163,116,0.4)",
                  }}
                  aria-label="Scan — tap for AI scanner, hold for the voice assistant"
                >
                  <item.Icon size={19} color="#ffffff" strokeWidth={2.2} />
                </button>
              );
            }
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveNav(item.key)}
                style={styles.navButton}
              >
                <item.Icon
                  size={18}
                  color={isActive ? "#176b4d" : "#687570"}
                  strokeWidth={2}
                />
                <span
                  style={{
                    ...styles.navLabel,
                    color: isActive ? "#176b4d" : "#687570",
                    fontWeight: isActive ? 700 : 600,
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {scanSheet && (
          <div style={styles.sheetOverlay}>
            <div style={scanSheet === "voice" ? styles.sheetCardVoice : styles.sheetCard}>
              {scanSheet === "ai" && (
                <>
                  <div style={styles.sheetIconWrapAi}>
                    <Sparkles size={22} color="#ffffff" strokeWidth={2.2} />
                  </div>
                  <p style={styles.sheetTitle}>Opening AI Food Scanner</p>
                  <p style={styles.sheetSubtitle}>
                    Point your camera at a meal to log it automatically.
                  </p>
                  <div style={styles.scanLineTrack}>
                    <div style={styles.scanLine} />
                  </div>
                </>
              )}

              {scanSheet === "voice" && (
                <div style={styles.voicePanel}>
                  <div style={styles.voiceHeader}>
                    <div style={styles.voiceHeaderTitleWrap}>
                      <div style={styles.voiceHeaderIcon}>
                        <Sparkles size={14} color="#ffffff" strokeWidth={2.4} />
                      </div>
                      <div>
                        <p style={styles.voiceHeaderTitle}>KhanaLens Assistant</p>
                        <p style={styles.voiceHeaderStatus}>{assistantStateLabel}</p>
                      </div>
                    </div>
                    <div style={styles.voiceHeaderActions}>
                      <button
                        type="button"
                        onClick={() =>
                          setRecognitionLang((lang) => (lang === "ne-NP" ? "en-US" : "ne-NP"))
                        }
                        style={styles.voiceIconButton}
                        aria-label="Toggle voice input language"
                        title={
                          recognitionLang === "ne-NP"
                            ? "Voice input: Nepali (tap for English)"
                            : "Voice input: English (tap for Nepali)"
                        }
                      >
                        <Languages size={15} color="#66736f" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setMuted((m) => !m)}
                        style={styles.voiceIconButton}
                        aria-label={muted ? "Unmute replies" : "Mute replies"}
                      >
                        {muted ? (
                          <VolumeX size={16} color="#66736f" />
                        ) : (
                          <Volume2 size={16} color="#66736f" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={closeVoiceSheet}
                        style={styles.voiceIconButton}
                        aria-label="Close assistant"
                      >
                        <X size={16} color="#66736f" />
                      </button>
                    </div>
                  </div>

                  <div style={styles.chatScrollArea}>
                    {conversation.length === 0 && !voiceTranscript && (
                      <div style={styles.chatEmptyState}>
                        <div style={styles.micWrap}>
                          <span
                            style={{
                              ...styles.micRing,
                              ...styles.micRing1,
                              opacity: isHolding ? 1 : 0,
                            }}
                          />
                          <span
                            style={{
                              ...styles.micRing,
                              ...styles.micRing2,
                              opacity: isHolding ? 1 : 0,
                            }}
                          />
                          <div style={styles.micCore}>
                            <Mic size={22} color="#ffffff" strokeWidth={2.2} />
                          </div>
                        </div>
                        <p style={styles.chatEmptyTitle}>{assistantStateLabel}</p>
                        <p style={styles.chatEmptySubtitle}>
                          {speechSupported
                            ? "Ask about your calories, macros, or what to eat next."
                            : "Voice input isn't supported here — type below instead."}
                        </p>
                      </div>
                    )}

                    {conversation.map((turn, idx) => (
                      <div
                        key={idx}
                        className="chat-bubble-in"
                        style={{
                          ...styles.chatBubbleRow,
                          justifyContent: turn.role === "user" ? "flex-end" : "flex-start",
                        }}
                      >
                        <div
                          style={{
                            ...styles.chatBubble,
                            ...(turn.role === "user"
                              ? styles.chatBubbleUser
                              : styles.chatBubbleAssistant),
                          }}
                        >
                          {turn.text}
                        </div>
                      </div>
                    ))}

                    {isHolding && voiceTranscript && (
                      <div style={{ ...styles.chatBubbleRow, justifyContent: "flex-end" }}>
                        <div style={{ ...styles.chatBubble, ...styles.chatBubbleInterim }}>
                          {voiceTranscript}
                        </div>
                      </div>
                    )}

                    {isProcessing && (
                      <div style={{ ...styles.chatBubbleRow, justifyContent: "flex-start" }}>
                        <div style={{ ...styles.chatBubble, ...styles.chatBubbleAssistant }}>
                          <Loader2 size={14} className="spin-icon" style={{ marginRight: "6px" }} />
                          Thinking...
                        </div>
                      </div>
                    )}

                    {isSpeaking && (
                      <div style={{ ...styles.chatBubbleRow, justifyContent: "flex-start" }}>
                        <button type="button" onClick={stopSpeaking} style={styles.stopSpeakingChip}>
                          <Square size={10} color="#17a374" strokeWidth={3} fill="#17a374" />
                          Stop speaking
                        </button>
                      </div>
                    )}

                    {assistantError && <p style={styles.voiceErrorText}>{assistantError}</p>}

                    <div ref={conversationEndRef} />
                  </div>

                  <div style={styles.quickActionsRow}>
                    {QUICK_ACTIONS.map((action) => (
                      <button
                        key={action.key}
                        type="button"
                        onClick={() => handleQuickAction(action.prompt)}
                        disabled={isProcessing}
                        style={{
                          ...styles.quickActionChip,
                          opacity: isProcessing ? 0.5 : 1,
                        }}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>

                  <div style={styles.voiceInputRow}>
                    <button
                      type="button"
                      onPointerDown={startVoiceAssistant}
                      onPointerUp={stopVoiceAssistant}
                      onPointerLeave={() => isHolding && stopVoiceAssistant()}
                      onContextMenu={(e) => e.preventDefault()}
                      disabled={!speechSupported || isProcessing}
                      style={{
                        ...styles.chatMicButton,
                        ...(isHolding ? styles.chatMicButtonActive : {}),
                        opacity: speechSupported && !isProcessing ? 1 : 0.4,
                      }}
                      aria-label="Hold to talk"
                    >
                      <Mic size={18} color="#ffffff" strokeWidth={2.2} />
                    </button>

                    <form onSubmit={handleTextSubmit} style={styles.chatForm}>
                      <input
                        type="text"
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder={isSpeaking ? "Speaking..." : "Or type a message"}
                        disabled={isProcessing}
                        style={styles.chatTextInput}
                      />
                      <button
                        type="submit"
                        style={styles.chatSendButton}
                        aria-label="Send message"
                        disabled={!textInput.trim() || isProcessing}
                      >
                        <Send size={16} color="#ffffff" strokeWidth={2.2} />
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {scanSheet && <div className="siri-glow-wrap" aria-hidden="true" />}
      </div>

      <style>
        {`
          @keyframes dotPulse {
            0%, 100% {
              filter: drop-shadow(0 0 0 rgba(23,163,116,0.45));
            }
            50% {
              filter: drop-shadow(0 0 5px rgba(23,163,116,0.55));
            }
          }

          .app-ring-dot {
            animation: dotPulse 2.4s ease-in-out infinite;
            transform-origin: center;
          }

          @keyframes sheetFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes sheetCardIn {
            from { opacity: 0; transform: translateY(14px) scale(0.97); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }

          @keyframes micRingPulse {
            0% { transform: scale(0.7); opacity: 0.55; }
            100% { transform: scale(1.8); opacity: 0; }
          }

          @keyframes scanLineSweep {
            0% { top: 6%; }
            50% { top: 88%; }
            100% { top: 6%; }
          }

          @keyframes bubbleIn {
            from { opacity: 0; transform: translateY(6px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .chat-bubble-in {
            animation: bubbleIn 0.22s ease-out;
          }

          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          .spin-icon {
            animation: spin 0.8s linear infinite;
          }

          @keyframes sweepMove {
            0%, 12% { left: -60%; }
            55%, 100% { left: 130%; }
          }

          .scan-nav-shine {
            position: relative;
            overflow: hidden;
          }

          .scan-nav-shine::after {
            content: "";
            position: absolute;
            top: 0;
            left: -60%;
            width: 40%;
            height: 100%;
            background: linear-gradient(
              100deg,
              rgba(255,255,255,0) 0%,
              rgba(255,255,255,0.3) 40%,
              rgba(255,255,255,0.65) 50%,
              rgba(255,255,255,0.3) 60%,
              rgba(255,255,255,0) 100%
            );
            transform: skewX(-20deg);
            animation: sweepMove 3.4s cubic-bezier(0.37,0,0.15,1) 0.6s infinite;
            pointer-events: none;
          }

          .meal-card:active {
            transform: scale(0.98);
          }

          .quick-action-chip:active {
            transform: scale(0.96);
          }

          @media (max-width: 400px) {
            .app-scroll-area {
              padding-left: 15px !important;
              padding-right: 15px !important;
            }
            .app-frame {
              border-radius: 0 !important;
              box-shadow: none !important;
            }
            .siri-glow-wrap {
              border-radius: 0 !important;
              border-width: 2px !important;
            }
          }

          @media (max-width: 360px) {
            .app-greeting {
              font-size: 16.5px !important;
            }
            .app-ring-wrap {
              width: 100px !important;
              height: 100px !important;
            }
            .app-ring-number {
              font-size: 17px !important;
            }
            .app-summary-card {
              gap: 12px !important;
              padding: 16px 13px !important;
            }
            .siri-glow-wrap {
              animation: siriGlowIn 0.3s ease-out, siriHaloMobile 1.7s ease-in-out infinite;
            }
          }

          @media (max-height: 700px) {
            .app-scroll-area {
              padding-top: 14px !important;
            }
          }

          @keyframes siriGlowIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes siriHalo {
            0%, 100% {
              border-color: rgba(23,163,116,0.95);
              box-shadow:
                0 0 0 1px rgba(23,163,116,0.5),
                0 0 18px 3px rgba(23,163,116,0.55),
                0 0 38px 10px rgba(79,224,171,0.4),
                inset 0 0 16px 2px rgba(23,163,116,0.4),
                inset 0 0 34px 8px rgba(79,224,171,0.22);
            }
            50% {
              border-color: rgba(168,255,223,1);
              box-shadow:
                0 0 0 1px rgba(79,224,171,0.7),
                0 0 28px 7px rgba(79,224,171,0.8),
                0 0 58px 18px rgba(23,163,116,0.55),
                inset 0 0 26px 5px rgba(168,255,223,0.55),
                inset 0 0 48px 12px rgba(79,224,171,0.3);
            }
          }

          @keyframes siriHaloMobile {
            0%, 100% {
              border-color: rgba(23,163,116,0.95);
              box-shadow:
                0 0 0 1px rgba(23,163,116,0.5),
                0 0 10px 2px rgba(23,163,116,0.55),
                0 0 20px 5px rgba(79,224,171,0.4),
                inset 0 0 10px 1px rgba(23,163,116,0.4),
                inset 0 0 20px 4px rgba(79,224,171,0.22);
            }
            50% {
              border-color: rgba(168,255,223,1);
              box-shadow:
                0 0 0 1px rgba(79,224,171,0.7),
                0 0 16px 4px rgba(79,224,171,0.8),
                0 0 30px 9px rgba(23,163,116,0.55),
                inset 0 0 16px 3px rgba(168,255,223,0.55),
                inset 0 0 26px 6px rgba(79,224,171,0.3);
            }
          }

          .siri-glow-wrap {
            position: absolute;
            inset: 0;
            border-radius: 32px;
            box-sizing: border-box;
            border: 3px solid rgba(23,163,116,0.95);
            pointer-events: none;
            z-index: 8;
            animation: siriGlowIn 0.3s ease-out, siriHalo 1.7s ease-in-out infinite;
          }
        `}
      </style>
    </div>
  );
}

const styles = {
  page: {
    width: "100vw",
    height: "100vh",
    background: "#f6f9f7",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    boxSizing: "border-box",
  },

  frame: {
    position: "relative",
    width: "100%",
    maxWidth: "430px",
    height: "100%",
    maxHeight: "900px",
    background: "#fbfdfc",
    boxShadow: "0 20px 60px rgba(20,70,52,0.14)",
    borderRadius: "32px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },

  scrollArea: {
    flex: 1,
    overflowY: "auto",
    padding: "18px 17px 0 17px",
    boxSizing: "border-box",
    WebkitOverflowScrolling: "touch",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "18px",
  },

  greeting: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 800,
    color: "#153d2e",
    letterSpacing: "-0.01em",
  },

  wave: {
    display: "inline-block",
  },

  subGreeting: {
    margin: "5px 0 0 0",
    fontSize: "12px",
    color: "#66736f",
    fontWeight: 500,
  },

  headerIcons: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  bellButton: {
    position: "relative",
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    border: "1px solid rgba(227,235,231,0.9)",
    backgroundColor: "rgba(255,255,255,0.65)",
    backdropFilter: "blur(10px) saturate(160%)",
    WebkitBackdropFilter: "blur(10px) saturate(160%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    padding: 0,
  },

  bellDot: {
    position: "absolute",
    top: "9px",
    right: "10px",
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    backgroundColor: "#f0883e",
    border: "1.5px solid #ffffff",
  },

  avatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #4fe0ab 0%, #22c58c 45%, #17a374 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  sectionHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "13px",
  },

  sectionHeading: {
    margin: 0,
    fontSize: "14px",
    fontWeight: 800,
    color: "#153d2e",
  },

  linkButton: {
    border: "none",
    background: "transparent",
    color: "#23845f",
    fontWeight: 700,
    fontSize: "11.5px",
    cursor: "pointer",
    padding: 0,
  },

  summaryCard: {
    background: "#ffffff",
    borderRadius: "18px",
    border: "1px solid #e3ebe7",
    padding: "20px 17px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    boxShadow: "0 8px 24px rgba(20,70,52,0.06)",
    marginBottom: "26px",
    boxSizing: "border-box",
  },

  ringWrap: {
    position: "relative",
    width: "clamp(104px, 30vw, 132px)",
    height: "clamp(104px, 30vw, 132px)",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition:
      "transform 0.7s cubic-bezier(0.22,1,0.36,1), opacity 0.7s ease-out, filter 0.2s ease-out",
  },

  ringCenter: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  ringNumber: {
    fontSize: "19px",
    fontWeight: 800,
    color: "#153d2e",
    lineHeight: 1.1,
  },

  ringUnit: {
    fontSize: "9px",
    color: "#687570",
    fontWeight: 600,
    marginTop: "2px",
  },

  ringPct: {
    fontSize: "10.5px",
    fontWeight: 800,
    color: "#176b4d",
    marginTop: "4px",
  },

  macroList: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    minWidth: 0,
  },

  macroRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  macroLabelWrap: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },

  macroLabel: {
    fontSize: "12px",
    fontWeight: 700,
    color: "#20352d",
  },

  macroValue: {
    fontSize: "12px",
    fontWeight: 800,
    color: "#153d2e",
  },

  macroTarget: {
    fontSize: "10px",
    fontWeight: 600,
    color: "#687570",
  },

  macroTrack: {
    width: "100%",
    height: "5px",
    borderRadius: "999px",
    backgroundColor: "#eef3f0",
    marginTop: "7px",
    overflow: "hidden",
  },

  macroFill: {
    height: "100%",
    borderRadius: "999px",
    transition: "width 0.9s cubic-bezier(0.22,1,0.36,1)",
  },

  macroDivider: {
    height: "1px",
    backgroundColor: "#f1f5f2",
    margin: "10px 0 0 0",
  },

  mealCard: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    background: "#ffffff",
    border: "1px solid #e3ebe7",
    borderRadius: "16px",
    padding: "12px",
    cursor: "pointer",
    textAlign: "left",
    boxShadow: "0 6px 18px rgba(20,70,52,0.05)",
    boxSizing: "border-box",
    transition: "transform 0.15s ease",
  },

  mealThumb: {
    width: "46px",
    height: "46px",
    borderRadius: "13px",
    background: "linear-gradient(135deg, #ffe7c2 0%, #ffd39a 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  mealEmoji: {
    fontSize: "20px",
  },

  mealInfo: {
    flex: 1,
    minWidth: 0,
  },

  mealName: {
    margin: 0,
    fontSize: "13px",
    fontWeight: 700,
    color: "#153d2e",
  },

  mealMeta: {
    margin: "3px 0 0 0",
    fontSize: "11px",
    color: "#687570",
    fontWeight: 500,
  },

  bottomNav: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    background: "rgba(255,255,255,0.78)",
    backdropFilter: "blur(16px) saturate(160%)",
    WebkitBackdropFilter: "blur(16px) saturate(160%)",
    borderTop: "1px solid rgba(227,235,231,0.9)",
    padding: "9px 6px calc(11px + env(safe-area-inset-bottom, 0px)) 6px",
    boxSizing: "border-box",
  },

  navButton: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    padding: "4px 6px",
  },

  navLabel: {
    fontSize: "9.5px",
  },

  scanNavButton: {
    width: "46px",
    height: "46px",
    borderRadius: "50%",
    border: "3.5px solid #ffffff",
    background: "linear-gradient(135deg, #4fe0ab 0%, #22c58c 45%, #17a374 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 8px 18px rgba(23,163,116,0.4)",
    transition: "transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease",
  },

  sheetOverlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(15,40,32,0.32)",
    backdropFilter: "blur(2px)",
    WebkitBackdropFilter: "blur(2px)",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    animation: "sheetFadeIn 0.2s ease-out",
    zIndex: 5,
  },

  sheetCard: {
    width: "100%",
    maxWidth: "430px",
    background: "#ffffff",
    borderTopLeftRadius: "26px",
    borderTopRightRadius: "26px",
    padding: "30px 24px calc(30px + env(safe-area-inset-bottom, 0px)) 24px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    animation: "sheetCardIn 0.28s cubic-bezier(0.22,1,0.36,1)",
    boxShadow: "0 -12px 30px rgba(20,70,52,0.16)",
  },

  sheetCardVoice: {
    width: "100%",
    maxWidth: "430px",
    height: "min(78vh, 660px)",
    background: "#ffffff",
    borderTopLeftRadius: "26px",
    borderTopRightRadius: "26px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    animation: "sheetCardIn 0.28s cubic-bezier(0.22,1,0.36,1)",
    boxShadow: "0 -12px 30px rgba(20,70,52,0.16)",
    overflow: "hidden",
  },

  voicePanel: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    width: "100%",
  },

  voiceHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 18px",
    borderBottom: "1px solid #eef3f0",
    flexShrink: 0,
  },

  voiceHeaderTitleWrap: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
  },

  voiceHeaderIcon: {
    width: "26px",
    height: "26px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #4fe0ab 0%, #22c58c 45%, #17a374 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  voiceHeaderTitle: {
    margin: 0,
    fontSize: "14px",
    fontWeight: 800,
    color: "#153d2e",
  },

  voiceHeaderStatus: {
    margin: "1px 0 0 0",
    fontSize: "10.5px",
    fontWeight: 600,
    color: "#687570",
  },

  voiceHeaderActions: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },

  voiceIconButton: {
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    border: "1px solid #e3ebe7",
    backgroundColor: "#f6f9f7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },

  chatScrollArea: {
    flex: 1,
    overflowY: "auto",
    padding: "16px 18px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    WebkitOverflowScrolling: "touch",
  },

  chatEmptyState: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "20px 10px",
  },

  chatEmptyTitle: {
    margin: "4px 0 0 0",
    fontSize: "14.5px",
    fontWeight: 800,
    color: "#153d2e",
  },

  chatEmptySubtitle: {
    margin: "6px 0 0 0",
    fontSize: "12px",
    color: "#66736f",
    fontWeight: 500,
    maxWidth: "260px",
  },

  chatBubbleRow: {
    display: "flex",
    width: "100%",
  },

  chatBubble: {
    maxWidth: "78%",
    padding: "10px 13px",
    borderRadius: "16px",
    fontSize: "13px",
    fontWeight: 500,
    lineHeight: 1.4,
    display: "flex",
    alignItems: "center",
  },

  chatBubbleUser: {
    background: "linear-gradient(135deg, #4fe0ab 0%, #22c58c 45%, #17a374 100%)",
    color: "#ffffff",
    borderBottomRightRadius: "5px",
  },

  chatBubbleAssistant: {
    backgroundColor: "#f1f5f2",
    color: "#20352d",
    borderBottomLeftRadius: "5px",
  },

  chatBubbleInterim: {
    background: "linear-gradient(135deg, #4fe0ab 0%, #22c58c 45%, #17a374 100%)",
    color: "#ffffff",
    opacity: 0.55,
    borderBottomRightRadius: "5px",
  },

  stopSpeakingChip: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    border: "1px solid #cdeadd",
    backgroundColor: "#effaf4",
    color: "#17a374",
    fontSize: "11.5px",
    fontWeight: 700,
    borderRadius: "999px",
    padding: "6px 12px",
    cursor: "pointer",
  },

  voiceErrorText: {
    fontSize: "11.5px",
    fontWeight: 600,
    color: "#c1443a",
    textAlign: "center",
    margin: "4px 0 0 0",
  },

  quickActionsRow: {
    display: "flex",
    gap: "8px",
    padding: "0 14px 10px 14px",
    overflowX: "auto",
    flexShrink: 0,
    WebkitOverflowScrolling: "touch",
  },

  quickActionChip: {
    flexShrink: 0,
    border: "1px solid #e3ebe7",
    backgroundColor: "#f6f9f7",
    color: "#20352d",
    fontSize: "11.5px",
    fontWeight: 700,
    borderRadius: "999px",
    padding: "8px 13px",
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "transform 0.1s ease",
  },

  voiceInputRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 14px calc(12px + env(safe-area-inset-bottom, 0px)) 14px",
    borderTop: "1px solid #eef3f0",
    flexShrink: 0,
    boxSizing: "border-box",
  },

  chatMicButton: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    border: "none",
    background: "linear-gradient(135deg, #4fe0ab 0%, #22c58c 45%, #17a374 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
    boxShadow: "0 6px 14px rgba(23,163,116,0.32)",
    transition: "transform 0.15s ease, box-shadow 0.15s ease",
  },

  chatMicButtonActive: {
    transform: "scale(1.08)",
    boxShadow: "0 0 0 6px rgba(23,163,116,0.16), 0 6px 14px rgba(23,163,116,0.4)",
  },

  chatForm: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#f6f9f7",
    border: "1px solid #e3ebe7",
    borderRadius: "999px",
    padding: "4px 4px 4px 14px",
  },

  chatTextInput: {
    flex: 1,
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: "13px",
    color: "#20352d",
    minWidth: 0,
  },

  chatSendButton: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    border: "none",
    background: "linear-gradient(135deg, #4fe0ab 0%, #22c58c 45%, #17a374 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
  },

  sheetIconWrapAi: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #4fe0ab 0%, #22c58c 45%, #17a374 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "14px",
    boxShadow: "0 8px 18px rgba(23,163,116,0.32)",
  },

  sheetTitle: {
    margin: 0,
    fontSize: "15.5px",
    fontWeight: 800,
    color: "#153d2e",
  },

  sheetSubtitle: {
    margin: "6px 0 0 0",
    fontSize: "12px",
    color: "#66736f",
    fontWeight: 500,
    maxWidth: "260px",
  },

  sheetTranscript: {
    margin: "12px 0 0 0",
    fontSize: "12.5px",
    fontWeight: 600,
    color: "#20352d",
    fontStyle: "italic",
    maxWidth: "280px",
  },

  scanLineTrack: {
    position: "relative",
    width: "180px",
    height: "3px",
    marginTop: "18px",
    borderRadius: "999px",
    backgroundColor: "#eef3f0",
    overflow: "visible",
  },

  scanLine: {
    position: "absolute",
    left: 0,
    top: 0,
    width: "180px",
    height: "3px",
    borderRadius: "999px",
    background: "linear-gradient(90deg, rgba(23,163,116,0) 0%, #17a374 50%, rgba(23,163,116,0) 100%)",
    animation: "scanLineSweep 1.2s ease-in-out infinite",
  },

  micWrap: {
    position: "relative",
    width: "56px",
    height: "56px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "14px",
  },

  micRing: {
    position: "absolute",
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    border: "2px solid #17a374",
    animation: "micRingPulse 1.8s ease-out infinite",
  },

  micRing1: {
    animationDelay: "0s",
  },

  micRing2: {
    animationDelay: "0.6s",
  },

  micCore: {
    position: "relative",
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #4fe0ab 0%, #22c58c 45%, #17a374 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 18px rgba(23,163,116,0.35)",
  },
};