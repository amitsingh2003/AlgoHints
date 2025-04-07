# AlgoHints - Progressive Algorithm Problem Solving Platform

AlgoHints is an interactive platform designed to help developers master Data Structures and Algorithms (DSA) and Competitive Programming (CP) through a guided hint system rather than providing direct solutions.

## 🚀 Features

- **Progressive Hint System**: Get step-by-step guidance without spoilers
  - Basic Idea: Simple framing of the problem
  - Approach: General problem-solving paradigms
  - Algorithm: Specific techniques and insights
  - Pseudocode: High-level solution structure without implementation
  
- **Integrated Code Editor**: Monaco-based editor with syntax highlighting
  
- **Judge0 API Integration**: Run and test your solutions directly in the platform
  
- **OCR for Problem Input**: Upload problem statements as images
  
- **Responsive Design**: Works on desktop and mobile devices

## 📁 Project Structure

```
/backend
├── node_modules      # Node dependencies
├── src               # Backend source code
├── uploads           # Temporary storage for uploaded images
├── .env              # Environment variables
├── eng.traineddata   # OCR training data
├── index.js          # Entry point
└── package.json      # Project configuration

/frontend
├── node_modules      # Node dependencies
├── public            # Static assets
├── src
│   ├── component
│   │   ├── CodeEditor.jsx  # Monaco editor component
│   │   ├── Home.jsx        # Home page
│   │   └── App.jsx         # Main application component
│   ├── index.css           # Global styles
│   └── main.js             # Frontend entry point
├── .env                    # Environment variables
├── package.json            # Project configuration
└── vite.config.js          # Vite configuration
```

## 🛠️ Technologies Used

### Backend
- Node.js
- Express
- Google Generative AI (Gemini API)
- OCR for image processing

### Frontend
- React
- Monaco Editor
- Framer Motion for animations
- Tailwind CSS for styling
- Lucide React for icons
- React Syntax Highlighter

## 🚦 How It Works

1. **Problem Input**: Users can enter algorithm problems as text or upload images
2. **Generate Hints**: The system analyzes the problem and creates progressive hints
3. **Step-by-Step Guidance**: Users get increasingly detailed hints as needed
4. **Code Solution**: Write and test solutions in the integrated code editor

## 💡 The Hint System

AlgoHints provides a four-level hint system:

1. **Basic Idea Hint**: Reframes the problem in intuitive terms without suggesting specific approaches
2. **Approach Hint**: Suggests general problem-solving paradigms (DP, Greedy, DFS/BFS, etc.)
3. **Algorithm/Concept Hint**: Recommends specific algorithms, data structures, or techniques
4. **Pseudocode Structure**: Provides high-level pseudocode without direct implementation

## 🔧 Setup and Installation

### Prerequisites
- Node.js (v14+)
- npm or yarn
- Gemini API key

### Backend Setup
```bash
cd backend
npm install
# Create .env file with your API keys and configuration
# GEMINI_API_KEY=your_api_key_here
# PORT=3000
npm start
```

### Frontend Setup
```bash
cd frontend
npm install
# Create .env file if needed
npm run dev
```

## 🚀 API Endpoints

- `POST /ai/get-review`: Generate hints for a problem statement
- `POST /ai/ocr`: Process uploaded images to extract problem statements

## 👥 Target Users

- Students learning DSA concepts
- Developers preparing for technical interviews
- Competitive programmers looking to improve their skills
- Self-learners who prefer guided discovery over direct solutions

## 🎯 Project Goals

AlgoHints aims to bridge the gap between struggling alone and being given direct solutions. By providing progressive hints, it helps users:

1. Develop their own problem-solving skills
2. Understand the thought process behind algorithm design
3. Practice implementing solutions independently
4. Build confidence through guided discovery

## 📝 License

[MIT](LICENSE)

## 🙏 Acknowledgements

- Judge0 API for code execution
- Monaco Editor for the code editing experience
- Google's Generative AI (Gemini) for hint generation
