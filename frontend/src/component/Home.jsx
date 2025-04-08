import React, { useState, useRef, useEffect } from "react";
import {
  File,
  Upload,
  Share2,
  Copy,
  Lightbulb,
  Code,
  Brain,
  ChevronRight,
  Check,
  X,
  Loader,
  Terminal,
  PenTool,
  Zap,
  Monitor,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  javascript,
  python,
} from "react-syntax-highlighter/dist/esm/languages/prism";
SyntaxHighlighter.registerLanguage("javascript", javascript);
SyntaxHighlighter.registerLanguage("python", python);
SyntaxHighlighter.registerLanguage("pseudocode", javascript);

export default function AlgorithmHintSystem() {
  const [question, setQuestion] = useState("");
  const [showResponse, setShowResponse] = useState(false);
  const [activeHint, setActiveHint] = useState("basicIdea");
  const [copied, setCopied] = useState(false);
  const [sharedConfirm, setSharedConfirm] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hintData, setHintData] = useState(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const savedQuestion = localStorage.getItem("algorithmQuestion");
    const savedUploadedImage = localStorage.getItem("uploadedImage");
    const savedHintData = localStorage.getItem("hintData");
    const savedShowResponse = localStorage.getItem("showResponse");
    const savedActiveHint = localStorage.getItem("activeHint");

    if (savedQuestion) setQuestion(savedQuestion);
    if (savedUploadedImage) setUploadedImage(savedUploadedImage);
    if (savedHintData) setHintData(JSON.parse(savedHintData));
    if (savedShowResponse) setShowResponse(JSON.parse(savedShowResponse));
    if (savedActiveHint) setActiveHint(savedActiveHint);
  }, []);

  useEffect(() => {
    localStorage.setItem("algorithmQuestion", question);
    localStorage.setItem("uploadedImage", uploadedImage || "");
    localStorage.setItem("hintData", JSON.stringify(hintData) || "");
    localStorage.setItem("showResponse", JSON.stringify(showResponse));
    localStorage.setItem("activeHint", activeHint);
  }, [question, uploadedImage, hintData, showResponse, activeHint]);

  useEffect(() => {
    const applyAOSEffects = () => {
      const elementsToAnimate = document.querySelectorAll("[data-aos]");
      elementsToAnimate.forEach((element, index) => {
        setTimeout(() => {
          element.classList.add("aos-animate");
        }, index * 100);
      });
    };

    if (showResponse) {
      setTimeout(applyAOSEffects, 300);
    } else {
      applyAOSEffects();
    }
  }, [showResponse]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://algohints.onrender.com/ai/get-review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: question,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setHintData(result.data);
        setShowResponse(true);
      } else {
        showToast("Error getting hints. Please try again.", "error");
      }
    } catch (error) {
      console.error("API request failed:", error);

      const mockData = {
        basicIdea:
          "### Basic Approach\n\nThis problem is about **finding the maximum possible minimum height** after removing at most k buildings.\n\nThe key insight is that we can approach this as a **binary search problem** on the possible minimum heights.\n\n*   By selecting a target minimum height, we can check if it's achievable by removing at most k buildings.\n*   We can then find the maximum achievable minimum height using binary search.",
        approachHint:
          "### Approach Details\n\n1.  Define a search space for the minimum height (from min to max in the array)\n2.  For each potential minimum height, count how many buildings we need to remove\n3.  If we need to remove ≤ k buildings, this minimum height is achievable\n4.  Use binary search to find the maximum achievable minimum height\n\n**Key observation**: If a certain minimum height is achievable with ≤ k removals, all lower minimum heights are also achievable.",
        algorithmHint:
          "### Algorithm Steps\n\n1.  Find the range of possible heights (min and max in the array)\n2.  Perform binary search on this range to find the maximum achievable minimum height\n3.  For each mid value in binary search:\n    *   Count buildings that are shorter than mid (these need to be removed)\n    *   If count ≤ k, we can achieve this height (search higher)\n    *   Otherwise, we cannot achieve this height (search lower)\n4.  Return the maximum height found to be achievable\n\n**Time Complexity**: O(n log m) where n is the number of buildings and m is the range of heights",
        pseudocodeHint:
          "```pseudocode\nfunction maximizeMinHeight(heights, k):\n    low = min(heights)\n    high = max(heights)\n    result = low\n    \n    while low <= high:\n        mid = (low + high) / 2\n        removalsNeeded = countRemovals(heights, mid)\n        \n        if removalsNeeded <= k:\n            result = mid\n            low = mid + 1  // Try to find higher minimum height\n        else:\n            high = mid - 1  // We need to remove too many buildings\n    \n    return result\n\nfunction countRemovals(heights, targetMin):\n    count = 0\n    for height in heights:\n        if height < targetMin:\n            count++  // Need to remove this building\n    return count\n```",
      };
      setHintData(mockData);
      setShowResponse(true);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "info") => {
    console.log(`[${type.toUpperCase()}] ${message}`);
  };

  const handleCopy = () => {
    if (hintData) {
      navigator.clipboard.writeText(hintData[activeHint]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showToast("Hint copied to clipboard!", "success");
    }
  };

  const handleShare = () => {
    if (navigator.share && hintData) {
      navigator
        .share({
          title: "Algorithm Hint",
          text: hintData[activeHint],
          url: window.location.href,
        })
        .catch(() => {
          navigator.clipboard.writeText(window.location.href);
          setSharedConfirm(true);
          setTimeout(() => setSharedConfirm(false), 2000);
        });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setSharedConfirm(true);
      setTimeout(() => setSharedConfirm(false), 2000);
      showToast("Link copied to clipboard!", "success");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setLoading(true);
      const formData = new FormData();
      formData.append("image", file);

      try {
        const response = await fetch("https://algohints.onrender.com/ai/ocr", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          setQuestion(result.text);
          const reader = new FileReader();
          reader.onload = (e) => {
            setUploadedImage(e.target.result);
          };
          reader.readAsDataURL(file);
          showToast("Image processed successfully!", "success");
        } else {
          showToast(
            "OCR processing failed. Please try again or enter the text manually.",
            "error"
          );
        }
      } catch (error) {
        console.error("OCR request failed:", error);

        const reader = new FileReader();
        reader.onload = (e) => {
          setUploadedImage(e.target.result);
          setQuestion(
            "You are given an integer array heights where heights[i] represents the height of the ith building. You can select at most k buildings and remove them to maximize the minimum height among the remaining buildings. Find the maximum possible minimum height after at most k removals."
          );
          showToast("Demo mode: Using sample problem text", "info");
        };
        reader.readAsDataURL(file);
      } finally {
        setLoading(false);
        setShowUploadOptions(false);
      }
    }
  };

  const handlePaste = async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          setLoading(true);

          const formData = new FormData();
          formData.append("image", file);

          try {
            const response = await fetch("https://algohints.onrender.com/ai/ocr", {
              method: "POST",
              body: formData,
            });

            const result = await response.json();

            if (result.success) {
              setQuestion(result.text);
            } else {
              showToast(
                "OCR processing failed. Please try again or enter the text manually.",
                "error"
              );
            }
          } catch (error) {
            console.error("OCR request failed:", error);
            showToast(
              "Failed to process pasted image. Please try again.",
              "error"
            );
          }

          const reader = new FileReader();
          reader.onload = (event) => {
            setUploadedImage(event.target.result);
          };
          reader.readAsDataURL(file);

          setLoading(false);
          break;
        }
      }
    }
  };

  const extractPseudocode = (pseudocodeHint) => {
    if (!pseudocodeHint) return "";

    const match = pseudocodeHint.match(/```pseudocode\n([\s\S]*?)```/);
    if (match && match[1]) {
      return match[1].trim();
    }

    return pseudocodeHint.replace(/```pseudocode|```/g, "").trim();
  };

  const hintSections = [
    {
      id: "basicIdea",
      label: "Basic Idea",
      icon: <Lightbulb size={20} className="text-amber-400" />,
    },
    {
      id: "approachHint",
      label: "Approach",
      icon: <PenTool size={20} className="text-emerald-400" />,
    },
    {
      id: "algorithmHint",
      label: "Algorithm",
      icon: <Brain size={20} className="text-blue-400" />,
    },
    {
      id: "pseudocodeHint",
      label: "Pseudocode",
      icon: <Terminal size={20} className="text-purple-400" />,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4 },
    },
  };

  const formatText = (text) => {
    text = text.replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="text-cyan-300">$1</strong>'
    );

    text = text.replace(/\*(.*?)\*/g, '<em class="text-purple-300">$1</em>');

    text = text.replace(
      /`(.*?)`/g,
      '<code class="bg-gray-900 px-1.5 py-0.5 rounded text-sm text-cyan-300 border border-gray-700">$1</code>'
    );

    return text;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-200 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
          data-aos="fade-down"
        >
          <div className="flex items-center justify-center mb-2">
            <motion.div
              animate={{
                rotate: [0, 10, 0, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            >
              <Brain
                size={32}
                className="text-blue-500 mr-2 drop-shadow-glow"
              />
            </motion.div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              AlgoHints
            </h1>
          </div>
          <p className="text-gray-400 text-base">
            Get step-by-step guidance for algorithm problems
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gray-800/70 rounded-lg shadow-xl border border-gray-700/70 backdrop-blur-sm p-6 mb-8 hover:shadow-blue-900/20 hover:shadow-2xl transition-all duration-300"
          data-aos="fade-up"
          style={{
            boxShadow: "0 10px 30px -10px rgba(66, 153, 225, 0.2)",
          }}
        >
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <Monitor size={20} className="text-blue-400 mr-2" />
              <h2 className="text-xl font-medium text-white">
                Algorithm Problem
              </h2>
            </div>
            <motion.button
              onClick={() => fileInputRef.current.click()}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="px-3 py-2 bg-gray-700/80 rounded-md hover:bg-blue-600/80 text-blue-400 hover:text-white transition-all flex items-center shadow-md"
              disabled={loading}
              aria-label="Upload image"
            >
              <Upload size={18} className="mr-2" />
              <span className="text-sm">Upload</span>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
                disabled={loading}
              />
            </motion.button>
          </div>

          {uploadedImage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4 relative rounded-md overflow-hidden shadow-lg border border-gray-600/70"
            >
              <img
                src={uploadedImage}
                alt="Uploaded problem"
                className="max-h-64 w-full object-contain bg-gray-900/80 p-2"
              />
              <motion.button
                onClick={() => {
                  setUploadedImage(null);
                }}
                whileHover={{ scale: 1.1, backgroundColor: "rgb(220, 38, 38)" }}
                whileTap={{ scale: 0.9 }}
                className="absolute top-2 right-2 bg-gray-900/90 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors shadow-md"
                disabled={loading}
              >
                <X size={16} />
              </motion.button>
            </motion.div>
          )}

          <textarea
            ref={textareaRef}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onPaste={handlePaste}
            placeholder="Paste your algorithm problem here or upload an image... (Ctrl+V to paste images directly)"
            className="w-full h-40 p-4 bg-gray-900/70 border border-gray-700/70 rounded-md focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500/70 outline-none resize-none text-gray-200 placeholder-gray-500 font-mono text-sm mb-4 transition-all shadow-inner"
            disabled={loading}
          />

          <div className="flex justify-end">
            <motion.button
              onClick={handleSubmit}
              disabled={!question.trim() || loading}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className={`px-6 py-2 rounded-md font-medium flex items-center shadow-lg ${
                question.trim() && !loading
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-700 text-white shadow-blue-900/30"
                  : "bg-gray-700/80 text-gray-400 cursor-not-allowed"
              } transition-all duration-200 text-sm`}
              style={{
                textShadow:
                  question.trim() && !loading
                    ? "0 1px 3px rgba(0,0,0,0.3)"
                    : "none",
              }}
            >
              {loading ? (
                <>
                  <Loader size={16} className="mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap size={16} className="mr-2" />
                  Generate Hints
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        <AnimatePresence>
          {loading && !showResponse && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <div className="relative mb-4">
                <motion.div
                  animate={{
                    rotate: 360,
                    transition: {
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    },
                  }}
                  className="w-16 h-16 rounded-full border-t-2 border-l-2 border-blue-500 shadow-lg shadow-blue-500/20"
                ></motion.div>
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                >
                  <Brain size={24} className="text-blue-400" />
                </motion.div>
              </div>
              <motion.p
                animate={{
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="text-blue-400 font-medium drop-shadow-glow"
              >
                Analyzing algorithm...
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showResponse && hintData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8 mb-12"
              data-aos="fade-up"
            >
              <div
                className="bg-gray-800/70 rounded-lg border border-gray-700/70 overflow-hidden shadow-2xl backdrop-blur-sm transition-all hover:shadow-blue-900/20"
                style={{
                  boxShadow: "0 10px 40px -15px rgba(66, 153, 225, 0.25)",
                }}
              >
                <div className="flex flex-wrap border-b border-gray-700/70">
                  {hintSections.map((section) => (
                    <motion.button
                      key={section.id}
                      whileHover={{
                        backgroundColor:
                          activeHint === section.id
                            ? undefined
                            : "rgba(55, 65, 81, 0.7)",
                      }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center px-4 py-3 ${
                        activeHint === section.id
                          ? "bg-gray-700 text-blue-400 border-t-2 border-blue-500 font-medium"
                          : "text-gray-400 hover:text-gray-200"
                      } transition-colors text-sm md:text-base`}
                      onClick={() => setActiveHint(section.id)}
                    >
                      <span className="mr-2">{section.icon}</span>
                      {section.label}
                    </motion.button>
                  ))}
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-white flex items-center">
                      {hintSections.find((s) => s.id === activeHint)?.icon}
                      <span className="ml-2">
                        {hintSections.find((s) => s.id === activeHint)?.label}{" "}
                        Hint
                      </span>
                    </h3>
                    <div className="flex space-x-3">
                      <motion.button
                        onClick={handleCopy}
                        whileHover={{ scale: 1.05, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-1.5 bg-gray-700/80 rounded-md text-gray-300 hover:bg-gray-600 hover:text-blue-400 transition-colors relative flex items-center shadow-md"
                      >
                        {copied ? (
                          <Check size={16} className="text-green-400 mr-1" />
                        ) : (
                          <Copy size={16} className="mr-1" />
                        )}
                        <span className="text-xs">Copy</span>
                        <AnimatePresence>
                          {copied && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8, y: -5 }}
                              animate={{ opacity: 1, scale: 1, y: -30 }}
                              exit={{ opacity: 0, scale: 0.8, y: -5 }}
                              className="absolute top-0 left-0 bg-gray-900/90 text-green-400 text-xs px-2 py-1 rounded shadow-lg border border-gray-700/70 backdrop-blur-sm"
                            >
                              Copied!
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>
                      <motion.button
                        onClick={handleShare}
                        whileHover={{ scale: 1.05, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-1.5 bg-gray-700/80 rounded-md text-gray-300 hover:bg-gray-600 hover:text-blue-400 transition-colors relative flex items-center shadow-md"
                      >
                        <Share2 size={16} className="mr-1" />
                        <span className="text-xs">Share</span>
                        <AnimatePresence>
                          {sharedConfirm && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8, y: -5 }}
                              animate={{ opacity: 1, scale: 1, y: -30 }}
                              exit={{ opacity: 0, scale: 0.8, y: -5 }}
                              className="absolute top-0 left-0 bg-gray-900/90 text-blue-400 text-xs px-2 py-1 rounded shadow-lg border border-gray-700/70 backdrop-blur-sm"
                            >
                              Link copied!
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeHint}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      {activeHint === "pseudocodeHint" ? (
                        <div className="rounded-lg overflow-hidden border border-gray-700/80 bg-gray-900/60 shadow-inner">
                          <div className="bg-gray-800/80 px-4 py-2 flex items-center justify-between border-b border-gray-700/80">
                            <div className="flex items-center">
                              <Code
                                size={16}
                                className="text-purple-400 mr-2"
                              />
                              <span className="font-mono text-sm text-gray-300">
                                maximizeMinHeight.algo
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              Pseudocode
                            </div>
                          </div>

                          <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="relative my-0"
                          >
                            <SyntaxHighlighter
                              language="javascript"
                              style={vscDarkPlus}
                              showLineNumbers={true}
                              wrapLines={true}
                              customStyle={{
                                margin: 0,
                                padding: "1rem",
                                background: "rgb(22, 27, 34)",
                                fontSize: "0.9rem",
                                borderRadius: "0",
                              }}
                            >
                              {extractPseudocode(hintData[activeHint])}
                            </SyntaxHighlighter>
                          </motion.div>
                        </div>
                      ) : (
                        <motion.div
                          variants={containerVariants}
                          initial="hidden"
                          animate="visible"
                          className="prose prose-invert max-w-none"
                        >
                          {hintData[activeHint].split("\n").map((line, i) => {
                            if (
                              line.includes("```pseudocode") ||
                              line.trim() === "```"
                            ) {
                              return null;
                            }

                            if (line.startsWith("### ")) {
                              return (
                                <motion.h3
                                  key={i}
                                  variants={itemVariants}
                                  className="font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mt-0 mb-4 pb-2 border-b border-gray-700/70"
                                >
                                  {line.replace(/^###\s*/, "")}
                                </motion.h3>
                              );
                            } else if (
                              line.trim().startsWith("* ") ||
                              line.trim().startsWith("- ")
                            ) {
                              return (
                                <motion.div
                                  key={i}
                                  variants={itemVariants}
                                  className="flex items-baseline mb-2"
                                >
                                  <span className="text-blue-400 mr-2">•</span>
                                  <p
                                    className="m-0 text-gray-300"
                                    dangerouslySetInnerHTML={{
                                      __html: formatText(
                                        line.replace(/^\s*[\*\-]\s*/, "")
                                      ),
                                    }}
                                  ></p>
                                </motion.div>
                              );
                            } else if (/^\s*\d+\.\s/.test(line)) {
                              return (
                                <motion.div
                                  key={i}
                                  variants={itemVariants}
                                  className="flex items-baseline mb-2"
                                >
                                  <span className="text-blue-400 mr-2 font-mono">
                                    {line.match(/^\s*(\d+)\./)[1]}.
                                  </span>
                                  <p
                                    className="m-0 text-gray-300"
                                    dangerouslySetInnerHTML={{
                                      __html: formatText(
                                        line.replace(/^\s*\d+\.\s*/, "")
                                      ),
                                    }}
                                  ></p>
                                </motion.div>
                              );
                            } else if (line.trim() === "") {
                              return <div key={i} className="h-4"></div>;
                            } else {
                              return (
                                <motion.p
                                  key={i}
                                  variants={itemVariants}
                                  className="mb-4 text-gray-300"
                                  dangerouslySetInnerHTML={{
                                    __html: formatText(line),
                                  }}
                                ></motion.p>
                              );
                            }
                          })}
                        </motion.div>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {activeHint !== "pseudocodeHint" && (
                    <motion.button
                      onClick={() => {
                        const currentIndex = hintSections.findIndex(
                          (section) => section.id === activeHint
                        );
                        if (currentIndex < hintSections.length - 1) {
                          setActiveHint(hintSections[currentIndex + 1].id);
                        }
                      }}
                      whileHover={{ scale: 1.03, x: 3 }}
                      whileTap={{ scale: 0.98 }}
                      className="mt-6 px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-500 hover:to-purple-600 rounded-md text-white shadow-lg shadow-blue-900/30 flex items-center text-sm font-medium transition-all duration-200"
                    >
                      Next Hint <ChevronRight size={18} className="ml-1" />
                    </motion.button>
                  )}
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.4 }}
                className="bg-amber-600/20 border border-amber-500/30 rounded-lg p-4 flex items-start text-sm"
              >
                <AlertTriangle
                  size={20}
                  className="text-amber-400 mr-3 mt-0.5 flex-shrink-0"
                />
                <div>
                  <h4 className="font-medium text-amber-400">Learning Note</h4>
                  <p className="text-gray-300">
                    These hints are designed to guide you progressively without
                    giving away the complete solution immediately. Try to solve
                    the problem with each hint before moving to the next level
                    of detail.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
