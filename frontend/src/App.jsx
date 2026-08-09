
import './App.css'
import { useRef, useState } from "react";
import {
  ShieldCheck,
  Upload,
  ArrowRight,
  AlertTriangle,
  Search,
  Zap,
  Brain,
  CheckCircle2,
  History,
  Sparkles,
  LockKeyhole,
} from "lucide-react";

const demoResult = {
  risk: "HIGH",
  score: 82,
  summary:
    "This message uses urgency, fear, and pressure to push you toward an immediate action.",
  claims: [
    {
      text: "Your bank account will be blocked today.",
      status: "UNVERIFIED",
    },
    {
      text: "You must complete KYC immediately.",
      status: "UNVERIFIED",
    },
  ],
  manipulation: [
    {
      type: "Urgency",
      evidence: "TODAY",
      level: "HIGH",
    },
    {
      type: "Fear",
      evidence: "ACCOUNT WILL BE BLOCKED",
      level: "HIGH",
    },
    {
      type: "Pressure",
      evidence: "IMMEDIATELY",
      level: "MEDIUM",
    },
  ],
  reasons: [
    {
      name: "Urgency",
      points: 15,
      evidence: "urgent",
    },
    {
      name: "Threat",
      points: 15,
      evidence: "blocked",
    },
    {
      name: "Suspicious link",
      points: 20,
      evidence: "click this link",
    },
    {
      name: "Credential request",
      points: 25,
      evidence: "kyc",
    },
  ],
  action:
    "Do not click the link. Open your bank's official app or website manually and verify the notification.",
};

function App() {
  const [text, setText] = useState("");
  const [analyzed, setAnalyzed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verification, setVerification] = useState(null);

  const fileInputRef = useRef(null);

  // =========================================================
  // TEXT ANALYSIS
  // =========================================================

  const analyze = async () => {
    if (!text.trim()) return;

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:3001/api/analyze",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const data = await response.json();

      setResult(data);
      setAnalyzed(true);
    } catch (error) {
      console.error("Backend error:", error);

      alert(
        "Could not connect to the SPLIT backend. Make sure node server.js is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // IMAGE ANALYSIS
  // =========================================================

  const analyzeImage = async (file) => {
    if (!file) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(
        "http://localhost:3001/api/analyze-image",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Image analysis failed");
      }

      const data = await response.json();

      setText(data.extractedText || "Screenshot analyzed");
      setResult(data);
      setAnalyzed(true);
    } catch (error) {
      console.error("Image analysis error:", error);

      alert("Could not analyze screenshot.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // DEMO
  // =========================================================

  const loadDemo = () => {
    const demoText =
      "URGENT!!! Your bank account will be BLOCKED TODAY. Click this link immediately to complete your KYC verification.";

    setText(demoText);
    setResult(demoResult);
    setAnalyzed(true);
  };

  // =========================================================
  // VERIFY CLAIM
  // =========================================================

  const verifyClaim = async (claim) => {
    if (!claim) return;

    setVerifying(true);
    setVerification(null);

    try {
      const response = await fetch(
        "http://localhost:3001/api/verify",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            claim: claim.text,
            context: text,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Verification failed");
      }

      const data = await response.json();

      setVerification({
        claim: claim.text,
        ...data,
      });
    } catch (error) {
      console.error("Verification error:", error);

      alert("Could not generate verification guidance.");
    } finally {
      setVerifying(false);
    }
  };

  // =========================================================
  // RESET
  // =========================================================

  const reset = () => {
    setText("");
    setResult(null);
    setAnalyzed(false);
    setVerification(null);
  };

  return (
    <div className="split-app">
      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <nav className="split-navbar">
        <div className="split-brand">
          <div className="split-brand-icon">
            <ShieldCheck size={22} strokeWidth={2.2} />
          </div>

          <div>
            <div className="split-brand-name">SPLIT</div>
            <div className="split-brand-subtitle">
              INFORMATION INTELLIGENCE
            </div>
          </div>
        </div>

        <div className="split-nav-actions">
          

          <button
            onClick={loadDemo}
            className="split-demo-btn"
          >
            <Sparkles size={17} />
            <span>Try demo</span>
          </button>
        </div>
      </nav>

      {!analyzed ? (
        /* ===================================================
           LANDING PAGE
        =================================================== */

        <main className="split-landing">
          {/* Background decoration */}

          <div className="split-bg-glow split-bg-glow-left" />
          <div className="split-bg-glow split-bg-glow-right" />

          {/* =================================================
              LEFT FLOATING CARDS
          ================================================= */}

          <div className="split-floating-left">
            <div className="floating-message-card floating-card-one">
              <div className="floating-card-top">
                <span className="urgent-dot" />
                <span className="urgent-title">
                  URGENT!!!
                </span>

                <span className="floating-dots">•••</span>
              </div>

              <div className="floating-message">
                Your account will be
                <br />
                blocked today.
              </div>

              <div className="floating-link">
                Click here to verify
              </div>

              <div className="floating-tag floating-tag-red">
                <Zap size={13} />
                Urgency
              </div>
            </div>

            <div className="floating-message-card floating-card-two">
              <div className="floating-message">
                Verify now or face
                <br />
                consequences.
              </div>

              <div className="floating-dots">•••</div>

              <div className="floating-tag floating-tag-orange">
                <Zap size={13} />
                Pressure
              </div>
            </div>

            <div className="floating-message-card floating-card-three">
              <div className="floating-message">
                Limited time offer!
                <br />
                Claim your reward.
              </div>

              <div className="floating-dots">•••</div>

              <div className="floating-tag floating-tag-purple">
                <Zap size={13} />
                Manipulation
              </div>
            </div>
          </div>

          {/* =================================================
              HERO
          ================================================= */}

          <section className="split-hero">
            <div className="split-hero-badge">
              <Brain size={15} />
              Think before you trust
            </div>

            <h1 className="split-hero-title">
              Don't just read it.
              <br />
              <span>Split it.</span>
            </h1>

            <p className="split-hero-description">
              Break suspicious messages, screenshots, headlines and
              claims into{" "}
              <strong>facts</strong>,{" "}
              <strong>unknowns</strong>,{" "}
              <strong>manipulation tactics</strong> and{" "}
              <strong>actions</strong>.
            </p>

            {/* =================================================
                INPUT BOX
            ================================================= */}

            <div className="split-input-wrapper">
              <div className="split-input-card">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste a suspicious message, headline, email, job offer..."
                  className="split-textarea"
                />

                <div className="split-input-footer">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];

                      if (file) {
                        analyzeImage(file);
                      }
                    }}
                  />

                  <button
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    disabled={loading}
                    className="split-upload-btn"
                  >
                    <span className="split-upload-icon">
                      <Upload size={18} />
                    </span>

                    <span className="split-upload-content">
                      <span className="split-upload-title">
                        {loading
                          ? "Reading screenshot..."
                          : "Upload screenshot"}
                      </span>

                      <span className="split-upload-subtitle">
                        PNG, JPG, JPEG (max 10MB)
                      </span>
                    </span>
                  </button>

                  <button
                    onClick={analyze}
                    disabled={!text.trim() || loading}
                    className="split-analyze-btn"
                  >
                    <span>
                      {loading ? "Analyzing..." : "Analyze"}
                    </span>

                    {!loading && (
                      <ArrowRight size={18} />
                    )}
                  </button>
                </div>
              </div>

              <div className="split-privacy">
                <LockKeyhole size={14} />
                <span>
                  Your data is private. We don't store your content.
                </span>
              </div>

              <div className="split-question-line">
                SPLIT doesn't tell you what to believe.
                It shows you what to question.
              </div>
            </div>
          </section>

          {/* =================================================
              RIGHT SHIELD
          ================================================= */}

          <div className="split-shield-area">
            <div className="shield-orbit shield-orbit-one" />
            <div className="shield-orbit shield-orbit-two" />
            <div className="shield-orbit shield-orbit-three" />

            <div className="shield-particle shield-particle-one" />
            <div className="shield-particle shield-particle-two" />
            <div className="shield-particle shield-particle-three" />

            <div className="split-shield">
              <ShieldCheck
                size={190}
                strokeWidth={1.15}
              />
            </div>

            <div className="split-shield-caption">
              <span className="caption-arrow">↖</span>

              <div>
                Information
                <br />
                intelligence
                <br />
                for <span>everyone.</span>
              </div>

              <div className="caption-underline" />
            </div>
          </div>

          {/* =================================================
              FEATURES
          ================================================= */}

          <section className="split-features">
            <Feature
              type="claims"
              icon={<Search size={22} />}
              title="Find the claims"
              text="Separate statements from assumptions and opinions."
            />

            <Feature
              type="manipulation"
              icon={<Zap size={22} />}
              title="Expose manipulation"
              text="Detect urgency, fear, pressure, authority and more."
            />

            <Feature
              type="action"
              icon={<ShieldCheck size={22} />}
              title="Know what to do"
              text="Get practical steps and verification guidance."
            />
          </section>
        </main>
      ) : (
        /* ===================================================
           RESULTS PAGE
        =================================================== */

        <main className="max-w-6xl mx-auto px-5 py-10">
          <button
            onClick={reset}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-8"
          >
            ← Analyze something else
          </button>

          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-6">
            {/* =================================================
                ORIGINAL CONTENT
            ================================================= */}

            <section className="bg-white border border-slate-200 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold">
                  Original content
                </h2>

                <span className="text-xs bg-slate-100 px-3 py-1 rounded-full">
                  Analyzed
                </span>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5 text-sm leading-7 whitespace-pre-wrap">
                {text}
              </div>
            </section>

            {/* =================================================
                RESULTS
            ================================================= */}

            <section className="space-y-5">
              {/* =================================================
                  RISK
              ================================================= */}

              <div className="bg-white border border-red-200 rounded-3xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-red-500 font-semibold">
                      Risk assessment
                    </div>

                    <div className="text-4xl font-bold mt-2">
                      {result?.risk || "UNKNOWN"}
                    </div>
                  </div>

                  <div className="w-20 h-20 rounded-full border-8 border-red-100 flex items-center justify-center">
                    <span className="font-bold text-red-600">
                      {result?.score ?? "--"}
                    </span>
                  </div>
                </div>

                <p className="mt-5 text-sm text-slate-500 leading-6">
                  {result?.summary ||
                    "No summary was returned."}
                </p>
              </div>

              {/* =================================================
                  WHY IS THIS RISKY?
              ================================================= */}

              <div className="bg-white border border-slate-200 rounded-3xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <AlertTriangle
                    size={18}
                    className="text-red-500"
                  />

                  <h2 className="font-semibold">
                    Why is this risky?
                  </h2>
                </div>

                {result?.reasons?.length > 0 ? (
                  <div className="space-y-3">
                    {result.reasons.map(
                      (reason, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-slate-50 rounded-2xl p-4"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-2.5 h-2.5 rounded-full ${
                                reason.points >= 20
                                  ? "bg-red-500"
                                  : "bg-amber-400"
                              }`}
                            />

                            <div>
                              <div className="text-sm font-medium">
                                {reason.name}
                              </div>

                              <div className="text-xs text-slate-400 mt-1">
                                "{reason.evidence}"
                              </div>
                            </div>
                          </div>

                          <div className="text-sm font-bold text-slate-600">
                            +{reason.points}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-2xl p-5 text-sm text-slate-500">
                    No major risk signals were detected.
                  </div>
                )}
              </div>

              {/* =================================================
                  CLAIMS
              ================================================= */}

              <div className="bg-white border border-slate-200 rounded-3xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Search size={18} />

                  <h2 className="font-semibold">
                    Claims detected
                  </h2>
                </div>

                <div className="space-y-3">
                  {result?.claims?.length > 0 ? (
                    result.claims.map(
                      (claim, i) => (
                        <div
                          key={i}
                          className="p-4 bg-slate-50 rounded-2xl"
                        >
                          <div className="text-sm">
                            "{claim.text}"
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-2 text-xs text-amber-600 font-medium">
                              <AlertTriangle size={14} />
                              {claim.status}
                            </div>

                            <button
                              onClick={() =>
                                verifyClaim(claim)
                              }
                              disabled={verifying}
                              className="text-xs font-semibold text-blue-600 hover:text-blue-800 disabled:opacity-50"
                            >
                              {verifying
                                ? "Checking..."
                                : "Verify this →"}
                            </button>
                          </div>
                        </div>
                      )
                    )
                  ) : (
                    <div className="text-sm text-slate-400">
                      No claims detected.
                    </div>
                  )}
                </div>
              </div>

              {/* =================================================
                  VERIFICATION
              ================================================= */}

              {verification && (
                <div className="bg-white border border-blue-200 rounded-3xl p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <ShieldCheck
                      size={18}
                      className="text-blue-600"
                    />

                    <h2 className="font-semibold">
                      Verification plan
                    </h2>
                  </div>

                  <div className="bg-blue-50 rounded-2xl p-4 mb-5">
                    <div className="text-xs uppercase tracking-widest text-blue-600 font-semibold">
                      Claim
                    </div>

                    <p className="text-sm mt-2 leading-6">
                      "{verification.claim}"
                    </p>
                  </div>

                  <div className="mb-6">
                    <div className="text-sm font-semibold mb-2">
                      Current status
                    </div>

                    <div className="inline-flex px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold">
                      {verification.status?.replaceAll(
                        "_",
                        " "
                      )}
                    </div>

                    <p className="text-sm text-slate-500 leading-6 mt-3">
                      {verification.explanation}
                    </p>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-sm font-semibold mb-3">
                      How to verify
                    </h3>

                    <div className="space-y-3">
                      {verification.verificationSteps?.map(
                        (step, index) => (
                          <div
                            key={index}
                            className="flex gap-3"
                          >
                            <div className="w-6 h-6 shrink-0 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-semibold">
                              {index + 1}
                            </div>

                            <p className="text-sm text-slate-600 leading-6">
                              {step}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {verification.sourcesToCheck?.length >
                    0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold mb-3">
                        Sources to check
                      </h3>

                      <div className="space-y-2">
                        {verification.sourcesToCheck.map(
                          (source, index) => (
                            <div
                              key={index}
                              className="text-sm bg-slate-50 rounded-xl p-3"
                            >
                              🔎 {source}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {verification.redFlags?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-3">
                        Red flags to watch for
                      </h3>

                      <div className="space-y-2">
                        {verification.redFlags.map(
                          (flag, index) => (
                            <div
                              key={index}
                              className="text-sm text-red-600 bg-red-50 rounded-xl p-3"
                            >
                              ⚠️ {flag}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* =================================================
                  MANIPULATION
              ================================================= */}

              <div className="bg-white border border-slate-200 rounded-3xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Zap size={18} />

                  <h2 className="font-semibold">
                    Manipulation fingerprint
                  </h2>
                </div>

                <div className="space-y-4">
                  {result?.manipulation?.length > 0 ? (
                    result.manipulation.map(
                      (item, i) => (
                        <div key={i}>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="font-medium">
                              {item.type}
                            </span>

                            <span className="text-slate-400">
                              {item.evidence}
                            </span>
                          </div>

                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                item.level === "HIGH"
                                  ? "bg-red-500 w-[90%]"
                                  : item.level === "MEDIUM"
                                  ? "bg-amber-400 w-[65%]"
                                  : "bg-slate-400 w-[35%]"
                              }`}
                            />
                          </div>
                        </div>
                      )
                    )
                  ) : (
                    <div className="text-sm text-slate-400">
                      No manipulation tactics detected.
                    </div>
                  )}
                </div>
              </div>

              {/* =================================================
                  ACTION
              ================================================= */}

              <div className="bg-slate-900 text-white rounded-3xl p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="text-emerald-400" />

                  <h2 className="font-semibold">
                    Before you act
                  </h2>
                </div>

                <p className="mt-4 text-slate-300 leading-7 text-sm">
                  {result?.action ||
                    "Verify the information through an independent official source before taking action."}
                </p>
              </div>
            </section>
          </div>
        </main>
      )}
    </div>
  );
}

/* =========================================================
   FEATURE CARD
========================================================= */

function Feature({ icon, title, text, type }) {
  return (
    <div className={`split-feature-card split-feature-${type}`}>
      <div className="split-feature-icon">
        {icon}
      </div>

      <div className="split-feature-content">
        <h3>{title}</h3>

        <p>{text}</p>
      </div>

      <div className="split-feature-decoration">
        {type === "claims" && (
          <div className="claims-decoration">
            <span />
            <span />
            <span className="active" />
            <span />
            <span />
          </div>
        )}

        {type === "manipulation" && (
          <div className="target-decoration">
            <div className="target-ring target-ring-one" />
            <div className="target-ring target-ring-two" />
            <div className="target-dot" />
          </div>
        )}

        {type === "action" && (
          <div className="check-decoration">
            <span>✓</span>
            <span>✓</span>
            <span>✓</span>
            <span>✓</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;