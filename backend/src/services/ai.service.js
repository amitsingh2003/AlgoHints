import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const modelPreferences = [
  "gemini-2.5-pro-preview-03-25",
  "gemini-2.5-pro-exp-03-25",
  "gemini-2.0-flash",
];

const systemInstruction = `
🎯 **Advanced Problem-Solving Hint System**

You are an expert DSA and Competitive Programming Coach that provides progressive, structured hints to help users develop their problem-solving skills without giving away complete solutions.

## 🧠 Hint Structure (Always Follow This Sequence)

### 1️⃣ Basic Idea Hint
- Reframe the problem in simple, intuitive terms
- Identify the core challenge without suggesting specific approaches
- Help the user understand what the problem is really asking
- Use analogies or real-world examples to illustrate the problem

### 2️⃣ Approach Hint
- Suggest general problem-solving paradigms (DP, Greedy, DFS/BFS, etc.)
- Explain WHY this approach fits the problem's characteristics
- Discuss trade-offs between different possible approaches
- Do not provide implementation details yet

### 3️⃣ Algorithm/Concept Hint
- Recommend specific algorithms, data structures, or techniques
- Explain key insights needed to solve the problem
- Identify potential edge cases and optimization opportunities
- Address time/space complexity considerations
- Include relevant mathematical concepts if applicable

### 4️⃣ Pseudocode Structure
- Provide high-level pseudocode that outlines the solution logic
- Include initialization, main operations, and return steps
- Identify variables and their purposes
- Cover key logic branches and edge cases
- Do NOT provide direct code implementation

## 🚨 Critical Guidelines

1. NEVER provide complete solutions or direct code implementations
2. Always maintain a teaching tone that encourages independent thinking
3. Structure hints progressively - from general to specific
4. Use clear formatting with bullet points, numbered lists, and emphasis
5. Include diagrams or visual explanations using text when beneficial
6. Address edge cases and optimizations in later hints
7. Acknowledge multiple valid approaches when they exist
8. For optimization problems, discuss space/time complexity explicitly
9. Use precise technical terminology appropriate for the topic
10. Break down complex problems into smaller, manageable components

Your goal is to be a masterful guide who leads the user to their "aha!" moment rather than providing the answer directly. Each hint should build naturally on the previous one, creating a pathway to understanding.
`;

const quotaExceededModels = new Set();

let lastSuccessfulModel = null;

/**
 * Attempts to generate content with a given model
 * @param {string} modelName - The model to use
 * @param {string} prompt - The prompt to send
 * @returns {Promise<string|null>} - Response text or null if failed
 */
async function tryGenerateWithModel(modelName, prompt) {
  if (quotaExceededModels.has(modelName)) {
    console.log(`Skipping ${modelName} due to previous quota exceeded error`);
    return null;
  }

  try {
    console.log(`Attempting to generate with model: ${modelName}`);
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: systemInstruction,
    });

    const result = await model.generateContent(prompt);

    lastSuccessfulModel = modelName;
    return result.response.text();
  } catch (error) {
    console.log(`Failed to generate with model ${modelName}: ${error.message}`);

    if (error.message.includes("quota") || error.message.includes("429")) {
      console.log(`Adding ${modelName} to quota exceeded list`);
      quotaExceededModels.add(modelName);
    }

    return null;
  }
}

/**
 * Attempts to generate content with models in order of preference
 * @param {string} prompt - The prompt to send
 * @returns {Promise<Object>} - Response text and model used
 */
async function generateWithFallback(prompt) {
  if (lastSuccessfulModel) {
    console.log(
      `Trying previously successful model first: ${lastSuccessfulModel}`
    );
    const response = await tryGenerateWithModel(lastSuccessfulModel, prompt);
    if (response !== null) {
      return { modelUsed: lastSuccessfulModel, response };
    }
    console.log(
      `Previously successful model ${lastSuccessfulModel} failed, trying others`
    );
  }

  for (const modelName of modelPreferences) {
    if (modelName === lastSuccessfulModel) continue;

    const response = await tryGenerateWithModel(modelName, prompt);
    if (response !== null) {
      return { modelUsed: modelName, response };
    }
  }

  throw new Error("All models failed to generate a response");
}

/**
 * @param {string} problemStatement
 * @returns {Promise<Object>}
 */
async function generateHint(problemStatement) {
  console.log(
    `Processing hint request for problem: ${problemStatement.substring(
      0,
      100
    )}${problemStatement.length > 100 ? "..." : ""}`
  );

  const promptTemplates = [
    `I need a Basic Idea Hint for this problem. Focus on reframing it in simple terms, using analogies if helpful, and identifying the core challenge without suggesting specific approaches:
     
    ${problemStatement}`,

    `I need an Approach Hint for this problem. Suggest general problem-solving paradigms (like DP, Greedy, DFS/BFS, etc.), explain WHY this approach fits, and discuss trade-offs between possible approaches. No implementation details yet:
     
    ${problemStatement}`,

    `I need an Algorithm/Concept Hint for this problem. Recommend specific algorithms, data structures, or techniques. Explain key insights, identify edge cases, address complexity, and include relevant mathematical concepts if applicable:
     
    ${problemStatement}`,

    `I need a Pseudocode Structure for this problem. Provide high-level pseudocode that outlines the solution logic, including initialization, main operations, and return steps. Identify variables and cover key logic branches and edge cases, but do NOT provide direct code implementation:
     
    ${problemStatement}`,
  ];

  try {
    const firstPromptResult = await generateWithFallback(promptTemplates[0]);
    const modelToUse = firstPromptResult.modelUsed;

    console.log(`Using model ${modelToUse} for all hints`);

    const remainingResults = await Promise.all(
      promptTemplates.slice(1).map(async (prompt) => {
        if (quotaExceededModels.has(modelToUse)) {
          return generateWithFallback(prompt);
        }

        const response = await tryGenerateWithModel(modelToUse, prompt);
        if (response !== null) {
          return { modelUsed: modelToUse, response };
        }

        return generateWithFallback(prompt);
      })
    );

    console.log(`Successfully generated all hints`);

    return {
      basicIdea: firstPromptResult.response,
      approachHint: remainingResults[0].response,
      algorithmHint: remainingResults[1].response,
      pseudocodeHint: remainingResults[2].response,
      modelUsed: modelToUse,
    };
  } catch (error) {
    console.error("Error generating hints:", error);
    throw new Error("Failed to generate hints. Please try again later.");
  }
}

export default generateHint;
