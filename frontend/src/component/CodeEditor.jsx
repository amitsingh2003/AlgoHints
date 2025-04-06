import React, { useRef, useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";
import {
  Play,
  Save,
  ChevronDown,
  Clock,
  Database,
  Code2,
  AlertTriangle,
  Terminal,
  Download,
  Settings,
  Layout,
  PanelLeft,
  X,
  Moon,
  Plus,
  Cpu,
  Github,
  Coffee,
} from "lucide-react";

const LANGUAGE_IDS = {
  javascript: 63,
  python: 71,
  java: 62,
  cpp: 54,
};

const LANGUAGES = {
  javascript: { name: "JavaScript", icon: "js", color: "#f7df1e" },
  python: { name: "Python", icon: "py", color: "#3776ab" },
  java: { name: "Java", icon: "java", color: "#007396" },
  cpp: { name: "C++", icon: "cpp", color: "#00599c" },
};

const CodeEditor = () => {
  const editorRef = useRef(null);
  const dropdownRef = useRef(null);
  const editorContainerRef = useRef(null);
  const outputContainerRef = useRef(null);
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem("selectedLanguage");
    return savedLanguage || "javascript";
  });
  useEffect(() => {
    localStorage.setItem("selectedLanguage", language);
  }, [language]);
  const [code, setCode] = useState("// Start coding here");
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [output, setOutput] = useState("// Output will appear here");
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState("");
  const [executionStats, setExecutionStats] = useState(null);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [panelExpanded, setPanelExpanded] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [layout, setLayout] = useState("horizontal");
  const [fontSize, setFontSize] = useState(14);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const starterCode = {
    javascript:
      '// JavaScript starter code\nfunction solve(input) {\n  // Your solution here\n  console.log("Input received:", input);\n  \n  return "Result";\n}\n\n// Example usage\nconst result = solve("sample input");\nconsole.log(result);',
    python:
      '# Python starter code\ndef solve(input):\n    # Your solution here\n    print("Input received:", input)\n    \n    return "Result"\n\n# Example usage\nresult = solve("sample input")\nprint(result)',
    java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println(solve("sample input"));\n    }\n    \n    public static String solve(String input) {\n        // Implement your solution\n        System.out.println("Input received: " + input);\n        return "Result";\n    }\n}',
    cpp: '#include <iostream>\n#include <string>\nusing namespace std;\n\nstring solve(string input) {\n    // Your solution here\n    cout << "Input received: " << input << endl;\n    \n    return "Result";\n}\n\nint main() {\n    string result = solve("sample input");\n    cout << result << endl;\n    return 0;\n}\n',
  };

  useEffect(() => {
    const savedCode = localStorage.getItem(`savedCode_${language}`);
    if (savedCode) {
      setCode(savedCode);
    } else {
      setCode(starterCode[language] || "// Start coding here");
    }
  }, [language]);

  useEffect(() => {
    if (code && isEditorReady) {
      localStorage.setItem(`savedCode_${language}`, code);
    }
  }, [code, language, isEditorReady]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsLanguageDropdownOpen(false);
      }
      if (settingsOpen && !event.target.closest(".settings-panel")) {
        setSettingsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [settingsOpen]);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isFullscreen]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    setIsEditorReady(true);

    editor.updateOptions({
      fontSize: fontSize,
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      wordWrap: "on",
      cursorBlinking: "smooth",
      cursorSmoothCaretAnimation: "on",
      roundedSelection: true,
      renderWhitespace: "boundary",
      fontFamily:
        "'Fira Code', 'Source Code Pro', Consolas, 'Courier New', monospace",
      fontLigatures: true,
    });

    monaco.languages.registerCompletionItemProvider(language, {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        let suggestions = [];

        suggestions.push({
          label: "for",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: getForLoopSnippet(language),
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        });

        if (language === "javascript") {
          suggestions = [
            ...suggestions,
            ...getJavaScriptSuggestions(monaco, range),
          ];
        } else if (language === "python") {
          suggestions = [
            ...suggestions,
            ...getPythonSuggestions(monaco, range),
          ];
        } else if (language === "cpp") {
          suggestions = [...suggestions, ...getCppSuggestions(monaco, range)];
        }

        return { suggestions };
      },
    });

    const savedCode = localStorage.getItem(`savedCode_${language}`);
    if (savedCode) {
      editor.setValue(savedCode);
      setCode(savedCode);
    }
  };

  const getForLoopSnippet = (lang) => {
    switch (lang) {
      case "javascript":
        return "for (let i = 0; i < ${1:array}.length; i++) {\n\t${2}\n}";
      case "python":
        return "for i in range(len(${1:array})):\n\t${2}";
      case "java":
        return "for (int i = 0; i < ${1:array}.length; i++) {\n\t${2}\n}";
      case "cpp":
        return "for (int i = 0; i < ${1:array}.size(); i++) {\n\t${2}\n}";
      default:
        return "for (let i = 0; i < ${1:array}.length; i++) {\n\t${2}\n}";
    }
  };

  const getJavaScriptSuggestions = (monaco, range) => {
    return [
      {
        label: "function",
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText: "function ${1:name}(${2:params}) {\n\t${3}\n}",
        insertTextRules:
          monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range,
      },
      {
        label: "console.log",
        kind: monaco.languages.CompletionItemKind.Method,
        insertText: "console.log(${1});",
        insertTextRules:
          monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range,
      },
      {
        label: "map",
        kind: monaco.languages.CompletionItemKind.Method,
        insertText: "${1:array}.map(${2:item} => {\n\treturn ${3};\n});",
        insertTextRules:
          monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range,
      },
      {
        label: "filter",
        kind: monaco.languages.CompletionItemKind.Method,
        insertText: "${1:array}.filter(${2:item} => {\n\treturn ${3};\n});",
        insertTextRules:
          monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range,
      },
    ];
  };

  const getPythonSuggestions = (monaco, range) => {
    return [
      {
        label: "def",
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText:
          "def ${1:function_name}(${2:parameters}):\n\t${3}\n\treturn ${4}",
        insertTextRules:
          monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range,
      },
      {
        label: "print",
        kind: monaco.languages.CompletionItemKind.Method,
        insertText: "print(${1})",
        insertTextRules:
          monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range,
      },
      {
        label: "list comprehension",
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText: "[${1:expression} for ${2:item} in ${3:iterable}]",
        insertTextRules:
          monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range,
      },
    ];
  };

  const getCppSuggestions = (monaco, range) => {
    return [
      {
        label: "include",
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText: "#include <${1:iostream}>",
        insertTextRules:
          monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range,
      },
      {
        label: "cout",
        kind: monaco.languages.CompletionItemKind.Method,
        insertText: "cout << ${1} << endl;",
        insertTextRules:
          monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range,
      },
      {
        label: "vector",
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText: "vector<${1:int}> ${2:vec};",
        insertTextRules:
          monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range,
      },
    ];
  };

  const showNotification = (message, type = "success") => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  };

  const saveCode = () => {
    if (!isEditorReady) return;

    const currentCode = editorRef.current.getValue();

    localStorage.setItem(`savedCode_${language}`, currentCode);

    const blob = new Blob([currentCode], { type: "text/plain" });

    const fileExtensions = {
      javascript: ".js",
      python: ".py",
      java: ".java",
      cpp: ".cpp",
    };

    const fileName = `code${fileExtensions[language] || ".txt"}`;

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showNotification("Code saved to your device!", "success");
  };

  const runCode = async () => {
    if (!isEditorReady || isRunning) return;

    setIsRunning(true);
    setError("");
    setOutput("Running code...");
    setExecutionStats(null);

    const currentCode = editorRef.current.getValue();
    const languageId = LANGUAGE_IDS[language];

    try {
      await runWithJudge0(currentCode, languageId);
    } catch (error) {
      console.error("Judge0 execution failed:", error);

      try {
        await runWithFallback(currentCode);
      } catch (fallbackError) {
        console.error("Fallback execution failed:", fallbackError);
        setOutput("⚠️ Execution failed. Please try again later.");
        setError(
          "Both execution methods failed. This might be due to API limits or an unsupported language."
        );
        showNotification("Execution failed. Please try again later.", "error");
      }
    } finally {
      setIsRunning(false);
    }
  }; 
  const apiKey = import.meta.env.VITE_RAPIDAPI_KEY;


  const runWithJudge0 = async (sourceCode, languageId) => {
    const JUDGE0_API = "https://judge0-ce.p.rapidapi.com";

    try {
      const createResponse = await axios({
        method: "POST",
        url: `${JUDGE0_API}/submissions`,
        headers: {
          "content-type": "application/json",
          "X-RapidAPI-Key": apiKey,
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        },
        data: {
          source_code: sourceCode,
          language_id: languageId,
          stdin: userInput,
        },
      });

      const { token } = createResponse.data;

      let result;
      let attempts = 0;
      const maxAttempts = 10;

      do {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const statusResponse = await axios({
          method: "GET",
          url: `${JUDGE0_API}/submissions/${token}`,
          headers: {
            "X-RapidAPI-Key": apiKey,
            "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
          },
          params: {
            base64_encoded: "false",
          },
        });
        

        result = statusResponse.data;
        attempts++;
      } while (result.status.id <= 2 && attempts < maxAttempts);
      let outputText = "";

      if (result.stdout) {
        outputText += result.stdout;
      }

      if (result.stderr) {
        outputText += "\n\n// Error output:\n" + result.stderr;
      }

      if (result.compile_output) {
        outputText += "\n\n// Compilation output:\n" + result.compile_output;
      }

      if (outputText.trim() === "") {
        outputText = "// No output generated";
      }

      setOutput(outputText);

      setExecutionStats({
        time: result.time,
        memory: result.memory,
        status: result.status.description,
      });

      if (panelExpanded && outputContainerRef.current) {
        outputContainerRef.current.scrollIntoView({ behavior: "smooth" });
      }
    } catch (error) {
      console.error("Judge0 API error:", error);
      throw new Error("Judge0 execution failed");
    }
  };

  const runWithFallback = async (sourceCode) => {
    if (language !== "javascript") {
      throw new Error("Fallback execution only supports JavaScript");
    }

    try {
      const startTime = performance.now();

      let outputBuffer = [];
      const originalLog = console.log;
      const inputValue = userInput;

      const sandbox = new Function(
        "input",
        `
        let consoleOutput = [];
        const originalConsole = console;
        console.log = function() {
          consoleOutput.push(Array.from(arguments).join(' '));
        };
        
        try {
          ${sourceCode}
        } catch (error) {
          consoleOutput.push("Runtime Error: " + error.message);
        }
        
        return consoleOutput;
      `
      );

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(
          () => reject(new Error("Execution timed out (5s limit)")),
          5000
        );
      });

      const executionPromise = Promise.resolve().then(() =>
        sandbox(inputValue)
      );
      const results = await Promise.race([executionPromise, timeoutPromise]);

      const endTime = performance.now();

      setOutput(results.join("\n") || "// No output generated");

      setExecutionStats({
        time: ((endTime - startTime) / 1000).toFixed(3),
        memory: "N/A (client-side)",
        status: "Completed (client-side execution)",
      });

      if (panelExpanded && outputContainerRef.current) {
        outputContainerRef.current.scrollIntoView({ behavior: "smooth" });
      }
    } catch (error) {
      setOutput(`// Execution Error: ${error.message}`);
      throw error;
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        saveCode();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        runCode();
      }

      if (e.altKey && e.key === "p") {
        e.preventDefault();
        setPanelExpanded(!panelExpanded);
      }

      if (e.altKey && e.key === "f") {
        e.preventDefault();
        setIsFullscreen(!isFullscreen);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isEditorReady, isRunning, panelExpanded, isFullscreen]);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({ fontSize: fontSize });
    }
  }, [fontSize]);

  const getLanguageIcon = (lang) => {
    return (
      <div className="flex items-center gap-3">
        <div
          className="w-7 h-5 flex items-center justify-center rounded text-xs font-bold text-white"
          style={{ backgroundColor: LANGUAGES[lang].color }}
        >
          {LANGUAGES[lang].icon.toUpperCase()}
        </div>
        {LANGUAGES[lang].name}
      </div>
    );
  };

  const renderStatusBadge = () => {
    if (!executionStats) return null;

    const status = executionStats.status;
    let bgColor = "bg-green-500 text-white";

    if (status.includes("Error") || status.includes("error")) {
      bgColor = "bg-red-500 text-white";
    } else if (
      status.includes("Time Limit") ||
      status.includes("Memory Limit")
    ) {
      bgColor = "bg-yellow-500 text-white";
    }

    return (
      <span
        className={`${bgColor} text-xs px-2 py-1 rounded-full inline-flex items-center animate-pulse-once`}
      >
        {status}
      </span>
    );
  };

  const layoutClass =
    layout === "vertical" ? "flex-col md:flex-col" : "flex-col md:flex-row";

  const editorSizeClass =
    layout === "vertical"
      ? "w-full h-1/2 md:h-3/5"
      : "w-full md:w-3/5 h-1/2 md:h-full";

  const consoleSizeClass =
    layout === "vertical"
      ? "w-full h-1/2 md:h-2/5"
      : "w-full md:w-2/5 h-1/2 md:h-full";

  const fullscreenClass = isFullscreen ? "fixed inset-0 z-50 bg-gray-900" : "";

  return (
    <div
      className={`flex flex-col h-screen w-full overflow-hidden bg-gray-900 text-white ${fullscreenClass}`}
    >
      <style jsx="true">{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            transform: translateX(-20px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes pulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes borderPulse {
          0% {
            box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4);
          }
          70% {
            box-shadow: 0 0 0 6px rgba(99, 102, 241, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }

        .animate-slide-in {
          animation: slideIn 0.3s ease-out forwards;
        }

        .animate-pulse {
          animation: pulse 2s infinite ease-in-out;
        }

        .animate-pulse-once {
          animation: pulse 1s ease-in-out;
        }

        .animate-fade-in-scale {
          animation: fadeInScale 0.3s ease-out forwards;
        }

        .animate-border-pulse {
          animation: borderPulse 1.5s infinite;
        }

        .glass-effect {
          background: rgba(17, 24, 39, 0.8);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .editor-container {
          transition: all 0.3s ease;
        }

        .console-transition {
          transition: all 0.3s ease;
        }

        .settings-panel {
          animation: fadeInScale 0.3s ease-out;
        }

        .glow {
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.3),
            0 0 20px rgba(99, 102, 241, 0.2);
        }

        .notification-enter {
          animation: fadeInScale 0.3s ease-out;
        }

        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.7);
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.5);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.7);
        }
      `}</style>

      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all transform notification-enter ${
              notification.type === "error"
                ? "bg-red-500 text-white"
                : "bg-indigo-600 text-white"
            }`}
          >
            <div className="flex items-center space-x-2">
              {notification.type === "error" ? (
                <AlertTriangle size={16} />
              ) : (
                <div className="w-4 h-4 rounded-full bg-white"></div>
              )}
              <span>{notification.message}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700 shadow-md z-10">
        <div className="flex items-center gap-2 animate-slide-in">
          <Code2 size={24} className="text-indigo-400" />
          

          <div className="mx-2 h-5 border-r border-gray-600"></div>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md hover:bg-gray-700 transition-colors border border-gray-700"
            >
              {getLanguageIcon(language)}
              <ChevronDown size={16} />
            </button>

            {isLanguageDropdownOpen && (
              <div className="absolute left-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg overflow-hidden z-10 w-40 animate-fade-in-scale glass-effect">
                {Object.keys(LANGUAGES).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setLanguage(lang);
                      setIsLanguageDropdownOpen(false);
                    }}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-gray-700 transition-colors ${
                      language === lang
                        ? "bg-indigo-500/20 border-l-2 border-indigo-500"
                        : ""
                    }`}
                  >
                    {getLanguageIcon(lang)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="flex items-center gap-1 px-2 py-1 text-sm rounded-md hover:bg-gray-700 transition-colors"
          >
            <Settings size={16} className="text-gray-400" />
          </button>

          <button
            onClick={() =>
              setLayout(layout === "horizontal" ? "vertical" : "horizontal")
            }
            className="flex items-center gap-1 px-2 py-1 text-sm rounded-md hover:bg-gray-700 transition-colors"
          >
            <Layout size={16} className="text-gray-400" />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="flex items-center gap-1 px-2 py-1 text-sm rounded-md hover:bg-gray-700 transition-colors"
          >
            <Plus
              size={16}
              className={`text-gray-400 transition-transform ${
                isFullscreen ? "rotate-45" : ""
              }`}
            />
          </button>

          <button
            onClick={saveCode}
            disabled={!isEditorReady}
            className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md bg-indigo-600 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
          >
            <Save size={16} />
            <span>Save</span>
          </button>

          <button
            onClick={runCode}
            disabled={!isEditorReady || isRunning}
            className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md bg-emerald-600 hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
          >
            {isRunning ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Running...</span>
              </>
            ) : (
              <>
                <Play size={16} />
                <span>Run</span>
              </>
            )}
          </button>
        </div>
      </div>

      {settingsOpen && (
        <div className="absolute top-16 right-4 z-20 bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-4 w-64 settings-panel glass-effect">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-white">Settings</h3>
            <button
              onClick={() => setSettingsOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Font Size
              </label>
              <div className="flex items-center">
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <span className="ml-2 text-sm w-8 text-center">
                  {fontSize}px
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Layout</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setLayout("horizontal")}
                  className={`flex-1 py-1 text-sm rounded-md border border-gray-700 transition-colors ${
                    layout === "horizontal"
                      ? "bg-indigo-600 border-indigo-500"
                      : "bg-gray-700"
                  }`}
                >
                  Horizontal
                </button>
                <button
                  onClick={() => setLayout("vertical")}
                  className={`flex-1 py-1 text-sm rounded-md border border-gray-700 transition-colors ${
                    layout === "vertical"
                      ? "bg-indigo-600 border-indigo-500"
                      : "bg-gray-700"
                  }`}
                >
                  Vertical
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-700">
              <h4 className="text-sm font-medium text-gray-300 mb-2">
                Keyboard Shortcuts
              </h4>
              <ul className="text-xs text-gray-400 space-y-1">
                <li className="flex justify-between">
                  <span>Run Code</span>
                  <span className="font-mono">Ctrl+Enter</span>
                </li>
                <li className="flex justify-between">
                  <span>Save Code</span>
                  <span className="font-mono">Ctrl+S</span>
                </li>
                <li className="flex justify-between">
                  <span>Toggle Panel</span>
                  <span className="font-mono">Alt+P</span>
                </li>
                <li className="flex justify-between">
                  <span>Toggle Fullscreen</span>
                  <span className="font-mono">Alt+F</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <div
        className={`flex ${layoutClass} h-full p-3 gap-3`}
        ref={editorContainerRef}
      >
        <div
          className={`${editorSizeClass} flex flex-col editor-container rounded-lg overflow-hidden border border-gray-800 glow`}
        >
          <div className="bg-gray-800 text-gray-300 px-4 py-2 text-sm flex items-center justify-between border-b border-gray-700">
            <div className="flex items-center gap-1.5">
              <Cpu size={14} className="text-indigo-400" />
              <span>Code Editor</span>
            </div>

            {isRunning && (
              <div className="flex items-center gap-1.5 text-yellow-400 animate-pulse">
                <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                <span className="text-xs">Executing...</span>
              </div>
            )}
          </div>

          <div className="flex-grow relative overflow-hidden">
            <Editor
              height="100%"
              language={language}
              value={code}
              theme="vs-dark"
              options={{
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                fontLigatures: true,
                fontSize: fontSize,
                wordWrap: "on",
                automaticLayout: true,
                padding: { top: 10 },
              }}
              onChange={(value) => setCode(value)}
              onMount={handleEditorDidMount}
              className="w-full h-full"
            />

            {isRunning && (
              <div className="absolute inset-0 bg-gray-900 bg-opacity-20 flex items-center justify-center animate-fade-in">
                <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-center animate-fade-in-scale shadow-xl glass-effect">
                  <div className="animate-spin mr-3 h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
                  <span>Executing code...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div
          className={`${consoleSizeClass} flex flex-col console-transition rounded-lg overflow-hidden border border-gray-800`}
        >
          <div className="bg-gray-800 text-gray-300 px-4 py-2 text-sm flex items-center justify-between border-b border-gray-700">
            <div className="flex items-center gap-1.5">
              <Terminal size={14} className="text-green-400" />
              <span>Console Output</span>
            </div>

            <div className="flex items-center gap-2">
              {executionStats && renderStatusBadge()}

              <button
                onClick={() => setPanelExpanded(!panelExpanded)}
                className="text-gray-400 hover:text-white"
              >
                <PanelLeft
                  size={14}
                  className={`transform transition-transform ${
                    panelExpanded ? "" : "rotate-180"
                  }`}
                />
              </button>
            </div>
          </div>

          {panelExpanded && (
            <div className="flex flex-col flex-grow" ref={outputContainerRef}>
              <div className="px-3 py-2 bg-gray-800 border-b border-gray-700">
                <label className="block text-xs text-gray-400 mb-1">
                  Input (stdin)
                </label>
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  className="w-full h-16 bg-gray-900 border border-gray-700 rounded p-2 text-sm font-mono resize-none focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Enter input for your program..."
                />
              </div>

              <div className="flex-grow p-3 bg-gray-900 overflow-auto">
                <pre className="text-sm font-mono whitespace-pre-wrap text-gray-300">
                  {output}
                </pre>

                {error && (
                  <div className="mt-3 p-3 bg-red-900 bg-opacity-30 border border-red-800 rounded-md text-sm font-mono text-red-300">
                    {error}
                  </div>
                )}
              </div>

              {executionStats && (
                <div className="flex items-center justify-between px-3 py-2 bg-gray-800 border-t border-gray-700 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-gray-400">
                      <Clock size={12} />
                      <span>Time: {executionStats.time}s</span>
                    </div>

                    <div className="flex items-center gap-1 text-gray-400">
                      <Database size={12} />
                      <span>Memory: {executionStats.memory || "N/A"}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setOutput("// Output will appear here");
                      setExecutionStats(null);
                      setError("");
                    }}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-800 text-gray-400 border-t border-gray-700 px-4 py-2 text-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Cpu size={12} />
            {isEditorReady ? "Editor ready" : "Loading editor..."}
          </span>

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
          >
            <Github size={12} />
            View on GitHub
          </a>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-500">
            Made with <Coffee size={12} className="inline text-gray-400" />
          </span>

          <div className="flex items-center h-4">
            <div className="w-1 h-1 rounded-full bg-green-500"></div>
            <div className="w-1 h-1 rounded-full bg-blue-500 mx-1"></div>
            <div className="w-1 h-1 rounded-full bg-purple-500"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
