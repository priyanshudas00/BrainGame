import React, { useState, useEffect } from 'react';
import { Trophy, RefreshCw, Target, Clock, Award, ChevronUp, ChevronDown, Zap, BarChart4, Brain, BookOpen, Check, X, HelpCircle, ArrowLeft } from 'lucide-react';

function App() {
  // Shared state
  const [gameType, setGameType] = useState<'none' | 'number' | 'quiz'>('none');
  const [gameHistory, setGameHistory] = useState<Array<{type: string, difficulty: string, attempts: number, time: number, score: number}>>([]);
  const [showStats, setShowStats] = useState(false);
  
  // Number game state
  const [minRange, setMinRange] = useState(1);
  const [maxRange, setMaxRange] = useState(100);
  const [secretNumber, setSecretNumber] = useState(0);
  const [guess, setGuess] = useState('');
  const [message, setMessage] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timerInterval, setTimerInterval] = useState<number | null>(null);
  const [hintCount, setHintCount] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [hintText, setHintText] = useState('');
  const [previousGuesses, setPreviousGuesses] = useState<Array<{value: number, result: string}>>([]);

  // Quiz game state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizDifficulty, setQuizDifficulty] = useState('medium');
  const [quizQuestions, setQuizQuestions] = useState<Array<{
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
  }>>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizTimeElapsed, setQuizTimeElapsed] = useState(0);
  const [quizTimerInterval, setQuizTimerInterval] = useState<number | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<Array<{
    question: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }>>([]);

  // Quiz questions by difficulty
  const easyQuizQuestions = [
    {
      question: "What is the capital of France?",
      options: ["London", "Berlin", "Paris", "Madrid"],
      correctAnswer: "Paris",
      explanation: "Paris is the capital and most populous city of France."
    },
    {
      question: "Which planet is known as the Red Planet?",
      options: ["Earth", "Mars", "Jupiter", "Venus"],
      correctAnswer: "Mars",
      explanation: "Mars is called the Red Planet because of its reddish appearance due to iron oxide (rust) on its surface."
    },
    {
      question: "What is 2 + 2?",
      options: ["3", "4", "5", "6"],
      correctAnswer: "4",
      explanation: "The sum of 2 and 2 is 4."
    },
    {
      question: "Which animal is known as the King of the Jungle?",
      options: ["Tiger", "Elephant", "Lion", "Giraffe"],
      correctAnswer: "Lion",
      explanation: "Lions are often called the King of the Jungle, although they typically live in grasslands and plains."
    },
    {
      question: "How many continents are there on Earth?",
      options: ["5", "6", "7", "8"],
      correctAnswer: "7",
      explanation: "The seven continents are Africa, Antarctica, Asia, Australia, Europe, North America, and South America."
    }
  ];

  const mediumQuizQuestions = [
    {
      question: "Which element has the chemical symbol 'Au'?",
      options: ["Silver", "Gold", "Aluminum", "Argon"],
      correctAnswer: "Gold",
      explanation: "Au is the chemical symbol for Gold, derived from the Latin word 'aurum'."
    },
    {
      question: "In which year did World War II end?",
      options: ["1943", "1945", "1947", "1950"],
      correctAnswer: "1945",
      explanation: "World War II ended in 1945 with the surrender of Germany in May and Japan in September."
    },
    {
      question: "What is the largest organ in the human body?",
      options: ["Heart", "Liver", "Skin", "Brain"],
      correctAnswer: "Skin",
      explanation: "The skin is the largest organ of the human body, covering an area of about 2 square meters for an average adult."
    },
    {
      question: "Which famous scientist developed the theory of relativity?",
      options: ["Isaac Newton", "Albert Einstein", "Galileo Galilei", "Nikola Tesla"],
      correctAnswer: "Albert Einstein",
      explanation: "Albert Einstein published his theory of relativity in the early 20th century, revolutionizing our understanding of space, time, and gravity."
    },
    {
      question: "What is the capital of Australia?",
      options: ["Sydney", "Melbourne", "Canberra", "Perth"],
      correctAnswer: "Canberra",
      explanation: "Canberra is the capital city of Australia, not Sydney or Melbourne as many people think."
    }
  ];

  const hardQuizQuestions = [
    {
      question: "What is the smallest prime number greater than 100?",
      options: ["101", "103", "107", "109"],
      correctAnswer: "101",
      explanation: "101 is the smallest prime number greater than 100. A prime number is only divisible by 1 and itself."
    },
    {
      question: "Which of these is NOT one of Shakespeare's plays?",
      options: ["Macbeth", "Romeo and Juliet", "The Tempest", "The Canterbury Tales"],
      correctAnswer: "The Canterbury Tales",
      explanation: "The Canterbury Tales was written by Geoffrey Chaucer, not William Shakespeare."
    },
    {
      question: "What is the half-life of Carbon-14?",
      options: ["1,460 years", "5,730 years", "10,000 years", "14,500 years"],
      correctAnswer: "5,730 years",
      explanation: "Carbon-14 has a half-life of approximately 5,730 years, which makes it useful for dating organic materials up to about 60,000 years old."
    },
    {
      question: "Which of these countries was NOT part of the Soviet Union?",
      options: ["Ukraine", "Belarus", "Romania", "Kazakhstan"],
      correctAnswer: "Romania",
      explanation: "Romania was never part of the Soviet Union, although it was a communist state and part of the Warsaw Pact during the Cold War."
    },
    {
      question: "In computer science, what does 'ACID' stand for in database transactions?",
      options: [
        "Atomicity, Consistency, Isolation, Durability",
        "Automated, Controlled, Integrated, Distributed",
        "Asynchronous, Concurrent, Independent, Direct",
        "Algorithmic, Computational, Iterative, Deterministic"
      ],
      correctAnswer: "Atomicity, Consistency, Isolation, Durability",
      explanation: "ACID stands for Atomicity, Consistency, Isolation, and Durability, which are properties that guarantee reliable processing of database transactions."
    }
  ];

  // Generate a random number within the range
  const generateRandomNumber = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  // Initialize or reset the number game
  const initNumberGame = () => {
    const newSecretNumber = generateRandomNumber(minRange, maxRange);
    setSecretNumber(newSecretNumber);
    setGuess('');
    setMessage(`I'm thinking of a number between ${minRange} and ${maxRange}...`);
    setAttempts(0);
    setGameWon(false);
    setGameStarted(true);
    setTimeElapsed(0);
    setHintCount(getMaxHints(difficulty));
    setShowHint(false);
    setPreviousGuesses([]);
    
    // Start timer
    if (timerInterval) clearInterval(timerInterval);
    const interval = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    setTimerInterval(interval as unknown as number);
    
    console.log(`Secret number: ${newSecretNumber}`); // For debugging
  };

  // Initialize or reset the quiz game
  const initQuizGame = () => {
    // Set questions based on difficulty
    let questions;
    switch(quizDifficulty) {
      case 'easy':
        questions = easyQuizQuestions;
        break;
      case 'medium':
        questions = mediumQuizQuestions;
        break;
      case 'hard':
        questions = hardQuizQuestions;
        break;
      default:
        questions = mediumQuizQuestions;
    }
    
    // Shuffle questions
    const shuffledQuestions = [...questions].sort(() => Math.random() - 0.5);
    setQuizQuestions(shuffledQuestions);
    
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setQuizScore(0);
    setQuizCompleted(false);
    setShowExplanation(false);
    setQuizTimeElapsed(0);
    setAnsweredQuestions([]);
    setGameStarted(true);
    
    // Start timer
    if (quizTimerInterval) clearInterval(quizTimerInterval);
    const interval = setInterval(() => {
      setQuizTimeElapsed(prev => prev + 1);
    }, 1000);
    setQuizTimerInterval(interval as unknown as number);
  };

  // Get max hints based on difficulty
  const getMaxHints = (diff: string) => {
    switch(diff) {
      case 'easy': return 3;
      case 'medium': return 2;
      case 'hard': return 1;
      default: return 2;
    }
  };

  // Handle difficulty change for number game
  const handleNumberDifficultyChange = (newDifficulty: string) => {
    setDifficulty(newDifficulty);
    
    switch(newDifficulty) {
      case 'easy':
        setMinRange(1);
        setMaxRange(50);
        break;
      case 'medium':
        setMinRange(1);
        setMaxRange(100);
        break;
      case 'hard':
        setMinRange(1);
        setMaxRange(500);
        break;
      default:
        setMinRange(1);
        setMaxRange(100);
    }
    
    setGameStarted(false);
    setMessage('Select a difficulty and start the game!');
    setHintCount(getMaxHints(newDifficulty));
  };

  // Handle difficulty change for quiz game
  const handleQuizDifficultyChange = (newDifficulty: string) => {
    setQuizDifficulty(newDifficulty);
    setGameStarted(false);
  };

  // Handle guess submission
  const handleGuess = () => {
    const userGuess = parseInt(guess);
    
    // Validate input
    if (isNaN(userGuess)) {
      setMessage('Please enter a valid number!');
      return;
    }
    
    // Check if guess is out of range
    if (userGuess < minRange || userGuess > maxRange) {
      setMessage(`Please enter a number between ${minRange} and ${maxRange}!`);
      return;
    }
    
    // Increment attempts
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    
    let result = '';
    // Check guess against secret number
    if (userGuess === secretNumber) {
      setMessage(`Congratulations! You guessed the number in ${newAttempts} attempts!`);
      setGameWon(true);
      if (timerInterval) clearInterval(timerInterval);
      
      const score = calculateScore();
      
      // Save game to history
      setGameHistory(prev => [...prev, {
        type: 'number',
        difficulty,
        attempts: newAttempts,
        time: timeElapsed,
        score
      }]);
      
      result = 'correct';
    } else if (userGuess < secretNumber) {
      const diff = secretNumber - userGuess;
      let hint = 'Too low!';
      
      if (diff > (maxRange - minRange) / 2) {
        hint = 'Way too low!';
      } else if (diff < (maxRange - minRange) / 10) {
        hint = 'Very close, but too low!';
      }
      
      setMessage(`${hint} Try a higher number. (Attempt: ${newAttempts})`);
      result = 'low';
    } else {
      const diff = userGuess - secretNumber;
      let hint = 'Too high!';
      
      if (diff > (maxRange - minRange) / 2) {
        hint = 'Way too high!';
      } else if (diff < (maxRange - minRange) / 10) {
        hint = 'Very close, but too high!';
      }
      
      setMessage(`${hint} Try a lower number. (Attempt: ${newAttempts})`);
      result = 'high';
    }
    
    // Add to previous guesses
    setPreviousGuesses(prev => [...prev, {value: userGuess, result}]);
    
    // Clear input field
    setGuess('');
  };

  // Handle quiz answer selection
  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    
    const currentQuestion = quizQuestions[currentQuestionIndex];
    const isCorrect = answer === currentQuestion.correctAnswer;
    
    // Add to answered questions
    setAnsweredQuestions(prev => [...prev, {
      question: currentQuestion.question,
      userAnswer: answer,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect
    }]);
    
    // Update score if correct
    if (isCorrect) {
      setQuizScore(prev => prev + 1);
    }
    
    // Show explanation
    setShowExplanation(true);
  };

  // Move to next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      // Quiz completed
      setQuizCompleted(true);
      if (quizTimerInterval) clearInterval(quizTimerInterval);
      
      const score = calculateQuizScore();
      
      // Save quiz to history
      setGameHistory(prev => [...prev, {
        type: 'quiz',
        difficulty: quizDifficulty,
        attempts: quizQuestions.length,
        time: quizTimeElapsed,
        score
      }]);
    }
  };

  // Get a hint
  const getHint = () => {
    if (hintCount <= 0) return;
    
    setHintCount(prev => prev - 1);
    setShowHint(true);
    
    // Generate hint based on secret number
    const range = maxRange - minRange;
    const quarterRange = Math.floor(range / 4);
    
    let hint;
    if (secretNumber <= minRange + quarterRange) {
      hint = `The number is in the lower quarter of the range (${minRange}-${minRange + quarterRange})`;
    } else if (secretNumber <= minRange + 2 * quarterRange) {
      hint = `The number is in the lower-middle quarter of the range (${minRange + quarterRange + 1}-${minRange + 2 * quarterRange})`;
    } else if (secretNumber <= minRange + 3 * quarterRange) {
      hint = `The number is in the upper-middle quarter of the range (${minRange + 2 * quarterRange + 1}-${minRange + 3 * quarterRange})`;
    } else {
      hint = `The number is in the upper quarter of the range (${minRange + 3 * quarterRange + 1}-${maxRange})`;
    }
    
    setHintText(hint);
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  // Calculate score for number game
  const calculateScore = () => {
    const difficultyFactor = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3;
    const rangeFactor = Math.log(maxRange - minRange + 1) / Math.log(10);
    const attemptPenalty = attempts * 10;
    const timePenalty = Math.floor(timeElapsed / 5);
    
    const score = Math.floor(1000 * difficultyFactor * rangeFactor - attemptPenalty - timePenalty);
    return Math.max(score, 0);
  };

  // Calculate score for quiz game
  const calculateQuizScore = () => {
    const difficultyFactor = quizDifficulty === 'easy' ? 1 : quizDifficulty === 'medium' ? 2 : 3;
    const correctAnswers = answeredQuestions.filter(q => q.isCorrect).length;
    const percentageCorrect = (correctAnswers / quizQuestions.length) * 100;
    const timePenalty = Math.floor(quizTimeElapsed / 10);
    
    const score = Math.floor(percentageCorrect * difficultyFactor * 10 - timePenalty);
    return Math.max(score, 0);
  };

  // Initialize game on component mount
  useEffect(() => {
    // Clean up timers on unmount
    return () => {
      if (timerInterval) clearInterval(timerInterval);
      if (quizTimerInterval) clearInterval(quizTimerInterval);
    };
  }, []);

  // Game selection screen
  const renderGameSelection = () => {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md backdrop-blur-sm bg-opacity-95 border border-white border-opacity-20">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">Brain Games</h1>
            <p className="text-gray-600">Challenge your mind with our fun games!</p>
          </div>
          
          <div className="grid grid-cols-1 gap-4 mb-6">
            <button 
              onClick={() => setGameType('number')}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white p-6 rounded-xl transition-all transform hover:scale-105 shadow-lg flex flex-col items-center justify-center"
            >
              <Target className="mb-3" size={48} />
              <h2 className="text-xl font-bold mb-1">Number Wizard</h2>
              <p className="text-sm text-blue-100">Guess the secret number</p>
            </button>
            
            <button 
              onClick={() => setGameType('quiz')}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white p-6 rounded-xl transition-all transform hover:scale-105 shadow-lg flex flex-col items-center justify-center"
            >
              <Brain className="mb-3" size={48} />
              <h2 className="text-xl font-bold mb-1">Knowledge Quiz</h2>
              <p className="text-sm text-pink-100">Test your knowledge</p>
            </button>
          </div>
          
          {gameHistory.length > 0 && (
            <button 
              className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
              onClick={() => setShowStats(!showStats)}
            >
              <BarChart4 className="mr-2" size={18} />
              {showStats ? 'Hide Stats' : 'Show Stats'}
            </button>
          )}
          
          {showStats && gameHistory.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Your Game History</h3>
              <div className="max-h-40 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-gray-200">
                      <th className="pb-2">Game</th>
                      <th className="pb-2">Difficulty</th>
                      <th className="pb-2">Score</th>
                      <th className="pb-2">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gameHistory.map((game, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-2 capitalize">{game.type}</td>
                        <td className="py-2 capitalize">{game.difficulty}</td>
                        <td className="py-2">{game.score}</td>
                        <td className="py-2">{formatTime(game.time)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Number game
  const renderNumberGame = () => {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md backdrop-blur-sm bg-opacity-95 border border-white border-opacity-20">
          <div className="flex justify-between items-center mb-4">
            <button 
              onClick={() => {
                setGameType('none');
                if (timerInterval) clearInterval(timerInterval);
              }}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Number Wizard</h1>
            <div className="w-5"></div> {/* Empty div for spacing */}
          </div>
          
          <p className="text-center text-gray-600 mb-6">
            {!gameStarted 
              ? 'Challenge your intuition and guess the magic number!' 
              : `Range: ${minRange} - ${maxRange}`}
          </p>

          {!gameStarted ? (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3 text-gray-700 flex items-center justify-center">
                <Target className="mr-2 text-purple-500" size={20} />
                Select Your Challenge:
              </h2>
              <div className="grid grid-cols-3 gap-3">
                <button 
                  className={`py-3 px-4 rounded-lg transition-all transform hover:scale-105 ${
                    difficulty === 'easy' 
                      ? 'bg-gradient-to-r from-green-400 to-green-500 text-white shadow-lg' 
                      : 'bg-gray-100 hover:bg-green-50 text-gray-700'
                  }`}
                  onClick={() => handleNumberDifficultyChange('easy')}
                >
                  Easy
                </button>
                <button 
                  className={`py-3 px-4 rounded-lg transition-all transform hover:scale-105 ${
                    difficulty === 'medium' 
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-lg' 
                      : 'bg-gray-100 hover:bg-yellow-50 text-gray-700'
                  }`}
                  onClick={() => handleNumberDifficultyChange('medium')}
                >
                  Medium
                </button>
                <button 
                  className={`py-3 px-4 rounded-lg transition-all transform hover:scale-105 ${
                    difficulty === 'hard' 
                      ? 'bg-gradient-to-r from-red-400 to-red-500 text-white shadow-lg' 
                      : 'bg-gray-100 hover:bg-red-50 text-gray-700'
                  }`}
                  onClick={() => handleNumberDifficultyChange('hard')}
                >
                  Hard
                </button>
              </div>
              <button 
                className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-4 rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center"
                onClick={initNumberGame}
              >
                <Zap className="mr-2" size={18} />
                Start Challenge
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4 text-sm">
                <div className="flex items-center text-gray-600">
                  <Clock size={16} className="mr-1" />
                  {formatTime(timeElapsed)}
                </div>
                <div className="flex items-center text-gray-600">
                  <Award size={16} className="mr-1" />
                  Attempts: {attempts}
                </div>
                {!gameWon && (
                  <div className="flex items-center text-gray-600">
                    <Zap size={16} className="mr-1" />
                    Hints: {hintCount}
                  </div>
                )}
              </div>
              
              <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg shadow-inner">
                <p className={`text-center ${gameWon ? 'text-green-600 font-bold' : 'text-gray-700'}`}>
                  {message}
                </p>
                
                {showHint && (
                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
                    <p className="font-medium">Hint: {hintText}</p>
                  </div>
                )}
              </div>

              {!gameWon && (
                <>
                  <div className="mb-6">
                    <div className="flex">
                      <input
                        type="number"
                        value={guess}
                        onChange={(e) => setGuess(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleGuess()}
                        placeholder="Enter your guess"
                        className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
                        min={minRange}
                        max={maxRange}
                      />
                      <button
                        onClick={handleGuess}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 px-6 rounded-r-lg transition-colors font-medium"
                      >
                        Guess
                      </button>
                    </div>
                    
                    {hintCount > 0 && (
                      <button
                        onClick={getHint}
                        className="mt-3 w-full bg-yellow-100 hover:bg-yellow-200 text-yellow-800 py-2 px-4 rounded-lg transition-colors text-sm flex items-center justify-center"
                      >
                        <Zap className="mr-1" size={14} />
                        Use a Hint ({hintCount} remaining)
                      </button>
                    )}
                  </div>
                  
                  {previousGuesses.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Previous Guesses:</h3>
                      <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 bg-gray-50 rounded-lg">
                        {previousGuesses.map((pg, idx) => (
                          <div 
                            key={idx} 
                            className={`px-2 py-1 rounded text-xs font-medium flex items-center ${
                              pg.result === 'correct' ? 'bg-green-100 text-green-800' :
                              pg.result === 'low' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                            }`}
                          >
                            {pg.value}
                            {pg.result === 'low' && <ChevronUp size={12} className="ml-1" />}
                            {pg.result === 'high' && <ChevronDown size={12} className="ml-1" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {gameWon && (
                <div className="mb-6 text-center">
                  <div className="flex justify-center mb-4">
                    <Trophy className="text-yellow-500" size={64} />
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-green-700 font-medium mb-2">
                      You found the number {secretNumber} in {attempts} attempts!
                    </p>
                    <p className="text-green-600 text-2xl font-bold">
                      Score: {calculateScore()}
                    </p>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-white p-2 rounded">
                        <span className="text-gray-500">Time:</span> {formatTime(timeElapsed)}
                      </div>
                      <div className="bg-white p-2 rounded">
                        <span className="text-gray-500">Difficulty:</span> {difficulty}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={initNumberGame}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-3 px-4 rounded-lg transition-colors shadow-lg flex items-center justify-center"
              >
                <RefreshCw className="mr-2" size={18} />
                {gameWon ? 'Play Again' : 'Restart Game'}
              </button>
              
              <button
                onClick={() => {
                  setGameStarted(false);
                  if (timerInterval) clearInterval(timerInterval);
                }}
                className="w-full mt-3 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors"
              >
                Back to Menu
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  // Quiz game
  const renderQuizGame = () => {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-orange-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md backdrop-blur-sm bg-opacity-95 border border-white border-opacity-20">
          <div className="flex justify-between items-center mb-4">
            <button 
              onClick={() => {
                setGameType('none');
                if (quizTimerInterval) clearInterval(quizTimerInterval);
              }}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Knowledge Quiz</h1>
            <div className="w-5"></div> {/* Empty div for spacing */}
          </div>
          
          <p className="text-center text-gray-600 mb-6">
            {!gameStarted 
              ? 'Test your knowledge with our challenging quiz!' 
              : quizCompleted ? 'Quiz completed!' : `Question ${currentQuestionIndex + 1} of ${quizQuestions.length}`}
          </p>

          {!gameStarted ? (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3 text-gray-700 flex items-center justify-center">
                <BookOpen className="mr-2 text-purple-500" size={20} />
                Select Difficulty:
              </h2>
              <div className="grid grid-cols-3 gap-3">
                <button 
                  className={`py-3 px-4 rounded-lg transition-all transform hover:scale-105 ${
                    quizDifficulty === 'easy' 
                      ? 'bg-gradient-to-r from-green-400 to-green-500 text-white shadow-lg' 
                      : 'bg-gray-100 hover:bg-green-50 text-gray-700'
                  }`}
                  onClick={() => handleQuizDifficultyChange('easy')}
                >
                  Easy
                </button>
                <button 
                  className={`py-3 px-4 rounded-lg transition-all transform hover:scale-105 ${
                    quizDifficulty === 'medium' 
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-lg' 
                      : 'bg-gray-100 hover:bg-yellow-50 text-gray-700'
                  }`}
                  onClick={() => handleQuizDifficultyChange('medium')}
                >
                  Medium
                </button>
                <button 
                  className={`py-3 px-4 rounded-lg transition-all transform hover:scale-105 ${
                    quizDifficulty === 'hard' 
                      ? 'bg-gradient-to-r from-red-400 to-red-500 text-white shadow-lg' 
                      : 'bg-gray-100 hover:bg-red-50 text-gray-700'
                  }`}
                  onClick={() => handleQuizDifficultyChange('hard')}
                >
                  Hard
                </button>
              </div>
              <button 
                className="w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white py-3 px-4 rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center"
                onClick={initQuizGame}
              >
                <Brain className="mr-2" size={18} />
                Start Quiz
              </button>
            </div>
          ) : !quizCompleted ? (
            <>
              <div className="flex justify-between items-center mb-4 text-sm">
                <div className="flex items-center text-gray-600">
                  <Clock size={16} className="mr-1" />
                  {formatTime(quizTimeElapsed)}
                </div>
                <div className="flex items-center text-gray-600">
                  <Award size={16} className="mr-1" />
                  Score: {quizScore}/{quizQuestions.length}
                </div>
              </div>
              
              <div className="mb-6">
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow-inner mb-4">
                  <p className="text-gray-800 font-medium">
                    {quizQuestions[currentQuestionIndex]?.question}
                  </p>
                </div>
                
                <div className="space-y-2">
                  {quizQuestions[currentQuestionIndex]?.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => !selectedAnswer && handleAnswerSelect(option)}
                      disabled={!!selectedAnswer}
                      className={`w-full p-3 rounded-lg text-left transition-colors ${
                        selectedAnswer === option 
                          ? option === quizQuestions[currentQuestionIndex].correctAnswer
                            ? 'bg-green-100 border border-green-300 text-green-800'
                            : 'bg-red-100 border border-red-300 text-red-800'
                          : selectedAnswer && option === quizQuestions[currentQuestionIndex].correctAnswer
                            ? 'bg-green-100 border border-green-300 text-green-800'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                      }`}
                    >
                      <div className="flex items-center">
                        {selectedAnswer && option === quizQuestions[currentQuestionIndex].correctAnswer ? (
                          <Check size={18} className="mr-2 text-green-600" />
                        ) : selectedAnswer === option && option !== quizQuestions[currentQuestionIndex].correctAnswer ? (
                          <X size={18} className="mr-2 text-red-600" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-400 mr-2 flex items-center justify-center">
                            {String.fromCharCode(65 + index)}
                          </div>
                        )}
                        {option}
                      </div>
                    </button>
                  ))}
                </div>
                
                {showExplanation && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start">
                      <HelpCircle size={18} className="mr-2 text-blue-600 mt-0.5" />
                      <p className="text-blue-800 text-sm">
                        {quizQuestions[currentQuestionIndex]?.explanation}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {selectedAnswer && (
                <button
                  onClick={handleNextQuestion}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white py-3 px-4 rounded-lg transition-colors shadow-lg flex items-center justify-center"
                >
                  {currentQuestionIndex < quizQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                </button>
              )}
            </>
          ) : (
            <div className="mb-6 text-center">
              <div className="flex justify-center mb-4">
                <Trophy className="text-yellow-500" size={64} />
              </div>
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                <p className="text-purple-700 font-medium mb-2">
                  Quiz Completed!
                </p>
                <p className="text-purple-600 text-2xl font-bold mb-2">
                  Score: {calculateQuizScore()}
                </p>
                <p className="text-gray-700">
                  You got {quizScore} out of {quizQuestions.length} questions correct!
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-white p-2 rounded">
                    <span className="text-gray-500">Time:</span> {formatTime(quizTimeElapsed)}
                  </div>
                  <div className="bg-white p-2 rounded">
                    <span className="text-gray-500">Difficulty:</span> {quizDifficulty}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-white rounded-lg shadow border border-gray-100">
                <h3 className="font-semibold text-gray-700 mb-2 text-left">Your Answers:</h3>
                <div className="max-h-40 overflow-y-auto">
                  {answeredQuestions.map((q, index) => (
                    <div key={index} className={`p-2 mb-2 rounded-lg ${q.isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                      <p className="text-sm font-medium text-left">{index + 1}. {q.question}</p>
                      <div className="flex justify-between text-xs mt-1">
                        <span>Your answer: <span className={q.isCorrect ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>{q.userAnswer}</span></span>
                        {!q.isCorrect && <span>Correct: <span className="text-green-600 font-medium">{q.correctAnswer}</span></span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <button
                onClick={initQuizGame}
                className="w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white py-3 px-4 rounded-lg transition-colors shadow-lg flex items-center justify-center"
              >
                <RefreshCw className="mr-2" size={18} />
                Play Again
              </button>
              
              <button
                onClick={() => {
                  setGameStarted(false);
                }}
                className="w-full mt-3 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors"
              >
                Back to Menu
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render the appropriate game based on gameType
  if (gameType === 'none') {
    return renderGameSelection();
  } else if (gameType === 'number') {
    return renderNumberGame();
  } else if (gameType === 'quiz') {
    return renderQuizGame();
  }

  // Default fallback
  return renderGameSelection();
}

export default App;