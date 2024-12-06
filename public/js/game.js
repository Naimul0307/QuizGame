document.addEventListener('DOMContentLoaded', function() {
    // Game logic for game.html
    if (window.location.pathname.endsWith('game.html')) {
        const gameContent = document.getElementById('game-content');
        const timerDisplay = document.getElementById('timer');
        const questionContainer = document.getElementById('question');
        const answersContainer = document.getElementById('answers');
    

        // At the top of your game.js file
        const fs = require('fs');
        const path = require('path');
        const XLSX = require('xlsx');
        // const os = require('os');

        // Detect the user's home directory
        // const userHome = os.homedir();

        // Automatically determine the file path for the user's system
        // This will point to the Documents folder within the user's home directory
        // const filePath = path.join(userHome, 'Documents', 'QuizGame3', 'user_results.xlsx');
        
        const filePath = path.join(__dirname, '../public/results/user_results.xlsx');

        // Ensure that the directory exists, and if not, create it
        const directoryPath = path.dirname(filePath);
        if (!fs.existsSync(directoryPath)) {
            fs.mkdirSync(directoryPath, { recursive: true });
            console.log('Directory created:', directoryPath);
        } else {
            console.log('Directory already exists:', directoryPath);
        }
        
        // let isFileDownloaded = false; // Flag to track file download
        let questions = [];
        let currentQuestionIndex = 0;
        let audioContext;
        let gameTimeInSeconds = parseInt(localStorage.getItem('gameTimeSeconds')) || 60; // Default 20 seconds
        let timer;
        let userAnswers = [];
        let questionsCount = parseInt(localStorage.getItem('questionsCount')) || 4; // Default to 4 questions

      // Set to keep track of shown question indices
      let shownQuestionIndices = new Set();

      function loadQuestions() {
          const xhr = new XMLHttpRequest();
          xhr.open('GET', '../public/xml/questions.xml', true);
          xhr.onreadystatechange = function() {
              if (xhr.readyState == 4 && xhr.status == 200) {
                  const xmlData = xhr.responseXML;
                  questions = parseQuestions(xmlData);
                  startGame();
              }
          };
          xhr.send();
      }

      // Function to parse questions from XML and select a random subset
      function parseQuestions(xml) {
        const questionNodes = xml.getElementsByTagName('question');
        let parsedQuestions = [];
    
        // Convert NodeList to array and shuffle
        const shuffledQuestions = advancedShuffle(Array.from(questionNodes));
    
        // Use a Set to keep track of selected indices to avoid duplicates
        let selectedQuestionsSet = new Set();
    
        // Select a random subset of questions based on desired criteria
        while (selectedQuestionsSet.size < questionsCount && selectedQuestionsSet.size < shuffledQuestions.length) {
            let randomIndex = Math.floor(Math.random() * shuffledQuestions.length);
            if (!selectedQuestionsSet.has(randomIndex)) {
                selectedQuestionsSet.add(randomIndex); // Ensure unique question selection
                const questionNode = shuffledQuestions[randomIndex];
    
                // Extract the title (if present)
                const title = questionNode.getElementsByTagName('title')[0]?.textContent || '';
    
                // Extract the question text
                const questionText = questionNode.getElementsByTagName('text')[0]?.textContent || '';
    
                // Extract the image (if present)
                const image = questionNode.getElementsByTagName('image')[0]?.textContent || '';
    
                // Extract the answers
                const answers = [];
                const answerNodes = questionNode.getElementsByTagName('answer');
                for (let j = 0; j < answerNodes.length; j++) {
                    const answerText = answerNodes[j].textContent;
                    const isCorrect = answerNodes[j].getAttribute('correct') === 'true';
                    answers.push({ text: answerText, correct: isCorrect });
                }
    
                // Add the parsed question to the array
                parsedQuestions.push({ title: title, question: questionText, image: image, answers: answers });
            }
        }
    
        return parsedQuestions;
    }
    

      
      function seededRandom(seed) {
          const x = Math.sin(seed++) * 10000;
          return x - Math.floor(x);
      }
      
      function advancedShuffle(array, seed = 0) {
          let currentIndex = array.length;

          // First pass: Fisher-Yates shuffle
          while (currentIndex !== 0) {
              const randomIndex = Math.floor(seededRandom(seed) * currentIndex);
              seed++;  // Increment seed for next random number
              currentIndex--;
              [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
          }

          // Second pass: Another shuffle for increased randomness
          currentIndex = array.length;
          while (currentIndex !== 0) {
              const randomIndex = Math.floor(seededRandom(seed) * currentIndex);
              seed++;
              currentIndex--;
              [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
          }

          return array;
      }

        // Function to start the game
        function startGame() {
            gameContent.style.display = 'block';
            startTimer(gameTimeInSeconds);
            displayQuestion();
        }


        function startTimer(duration) {
            let timeLeft = duration;
            timer = setInterval(function() {
                let minutes = Math.floor(timeLeft / 60);
                let seconds = timeLeft % 60;
                timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    
                // Play beep sound when countdown reaches 10 seconds or less
                if (timeLeft <= 10 && timeLeft > 0) {
                    playBeep('timeup');
                    timerDisplay.classList.add('timer-beep');
                    setTimeout(() => {
                        timerDisplay.classList.remove('timer-beep');
                    }, 500);
                }
    
                if (--timeLeft < 0) {
                    clearInterval(timer);
                    endGame();
                }
            }, 1000);
        }

        function playBeep(type) {
            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
        
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
        
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
        
            // Set frequency and waveform type based on the `type` argument
            switch(type) {
                case 'correct':
                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);  // Higher pitch
                    break;
                case 'incorrect':
                    oscillator.type = 'square';
                    oscillator.frequency.setValueAtTime(500, audioContext.currentTime);  // Lower pitch
                    break;
                case 'timeup':
                    oscillator.type = 'triangle';
                    oscillator.frequency.setValueAtTime(700, audioContext.currentTime);  // Medium pitch
                    break;
                default:
                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);  // Default to higher pitch
                    break;
            }
        
            // Set the gain (volume) and fade out over time
            gainNode.gain.setValueAtTime(1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
        
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5); // Duration of the beep
        }
        

        function displayQuestion() {
    
            // Clear previous question and answers
            questionContainer.innerHTML = '';
            answersContainer.innerHTML = '';
                  // Check if all questions have been shown; end the game if true
            if (shownQuestionIndices.size === questions.length) {
                endGame(); // End game if all questions have been shown
                return;
            }
        
            let nextIndex;
            // Keep selecting a random index until we find one that hasn't been shown before
            do {
                nextIndex = Math.floor(Math.random() * questions.length);
            } while (shownQuestionIndices.has(nextIndex)); // Ensure unique question
        
            // Add the selected index to the set of shown questions
            shownQuestionIndices.add(nextIndex); 
            currentQuestionIndex = nextIndex; // Update the current question index
        
            const currentQuestion = questions[currentQuestionIndex];
            questionContainer.innerHTML = ''; // Clear any previous question content
        
            // Display the question title if available
            if (currentQuestion.title) {
                const titleElement = document.createElement('h2');
                titleElement.textContent = currentQuestion.title;
                titleElement.classList.add('question-title'); // Optional: Add CSS class for styling
                questionContainer.appendChild(titleElement);
            }
        
            // Display an image associated with the question if available
            if (currentQuestion.image) {
                const imgElement = document.createElement('img');
                imgElement.src = currentQuestion.image;
                imgElement.alt = 'Question Image';
                imgElement.classList.add('question-image'); // Add CSS class for styling
                questionContainer.appendChild(imgElement);
            }
        
            // Display the actual question text
            if (currentQuestion.question) {
                const questionTextElement = document.createElement('p');
                questionTextElement.textContent = currentQuestion.question;
                questionTextElement.classList.add('question-text'); // Optional styling
                questionContainer.appendChild(questionTextElement);
            }

            // Display the answers
            currentQuestion.answers.forEach((answer, index) => {
                const answerElement = document.createElement('button');
                answerElement.classList.add('answer', 'btn', 'btn-primary', 'mb-2');
                answerElement.textContent = answer.text;
                answerElement.classList.add('answer');
                answerElement.dataset.correct = answer.correct;
                // Attach click event
                answerElement.addEventListener('click', () => {
                    handleAnswerSelection(index, answer.correct);
                });
        
                answersContainer.appendChild(answerElement);
            });
            // Enable keyboard support after rendering answers
            setupKeyboardListeners();
        }
        
        function handleAnswerSelection(index, correct) {
            console.log(`Answer selected: ${index}, Correct: ${correct}`);
        
            // Store the selected answer's data
            const selectedAnswer = {
                question: questions[currentQuestionIndex].question,
                answer: questions[currentQuestionIndex].answers[index].text,
                correct: correct
            };
            userAnswers.push(selectedAnswer); // Add the selected answer to the userAnswers array
        
            // Highlight the selected answer
            const answerButtons = answersContainer.children;
            answerButtons[index].classList.add('selected'); // Add 'selected' class to the chosen answer
        
            // Add 'correct' or 'incorrect' class based on the answer
            if (correct) {
                answerButtons[index].classList.add('correct'); // Highlight the answer as correct
                playBeep('correct'); // Play the beep sound for correct answers
            } else {
                answerButtons[index].classList.add('incorrect'); // Highlight the answer as incorrect
                playBeep('incorrect'); // Play the beep sound for wrong answers
            }
        
            // Disable all buttons after selection
            for (let i = 0; i < answerButtons.length; i++) {
                answerButtons[i].classList.add('disabled');
                answerButtons[i].disabled = true;
            }
        
            // Wait for the next question after a short delay
            setTimeout(function() {
                if (shownQuestionIndices.size < questions.length) {
                    displayQuestion(); // Display next question
                } else {
                    endGame(); // End game if no more questions
                }
            }, 1000); // Delay before showing the next question
        }
        
        // Add keyboard event listeners for answers
        function setupKeyboardListeners() {
            const answerButtons = answersContainer.children;
            document.addEventListener('keydown', function handleKeydown(event) {
                const key = event.key.toLowerCase();
                const keyMap = ['a', 'b', 'c', 'd'];
                const index = keyMap.indexOf(key);

                if (index !== -1 && index < answerButtons.length) {
                    handleAnswerSelection(index, questions[currentQuestionIndex].answers[index].correct);
                    // Remove the listener to prevent multiple selections
                    document.removeEventListener('keydown', handleKeydown);
                }
            });
        }

        function endGame() {
            clearInterval(timer); // Stop the timer
        
            // Calculate score and retrieve user info
            const score = calculateScore();
            const userName = localStorage.getItem('userName');
            const userEmail = localStorage.getItem('userEmail');
            const dateTime = new Date().toISOString();
        
            // Get the last timer value
            const timerValue = timerDisplay.textContent;
        
            // Use fixed totalQuestions from questionsCount
            const totalQuestions = questionsCount;
            const correctAnswers = score;
        
            // Determine the result message
            const resultMessage = {
                correctAnswers: correctAnswers,
                totalQuestions: totalQuestions,
                message: correctAnswers === 0
                    ? "Time's up! Better luck next time." : `You answered ${correctAnswers} out of ${totalQuestions} questions correctly!`
            };
        
            // Show the result message
            showMessage(resultMessage, "result", true);
        
            // Wait for 6 seconds after the result message, then redirect
            setTimeout(function () {
                // Create the user data object
                const user = {
                    name: userName,
                    score: score,
                    dateTime: dateTime,
                    timerValue: timerValue
                };
        
                // Check if the file exists
                let users = [];
                if (fs.existsSync(filePath)) {
                    // Read existing data
                    const workbook = XLSX.readFile(filePath);
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
        
                    // Convert the existing sheet to JSON
                    users = XLSX.utils.sheet_to_json(worksheet);
                }
        
                // Append new user data
                users.push(user);
        
                // Create a new worksheet and workbook
                const newWorksheet = XLSX.utils.json_to_sheet(users);
                const newWorkbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, "Results");
        
                // Write the updated workbook to the file
                XLSX.writeFile(newWorkbook, filePath);
        
                // Redirect to results page
                window.location.href = `results.html?name=${userName}&email=${userEmail}&score=${score}&dateTime=${encodeURIComponent(dateTime)}`;
            }, 6000); // Wait for 6 seconds before redirecting
        }
        
        function showMessage(message, type, isResult = false) {
            const messageBox = document.createElement("div");
        
            if (isResult) {
                const resultMessageBox = document.getElementById("resultMessageBox");
                resultMessageBox.classList.remove("hidden");
        
                // Clear previous result message to avoid appending multiple times
                resultMessageBox.innerHTML = ""; // Clear any previous message
        
                // Create the result header element
                const headerMessage = document.createElement("h1");
                headerMessage.id = "result-message";
                headerMessage.classList.add("hidden");
        
                // Create the result summary element
                const resultSummary = document.createElement("p");
                resultSummary.id = "result-summary";
                resultSummary.classList.add("hidden");
        
                // Determine the message type
                if (message.correctAnswers === 0) {
                    headerMessage.innerHTML = "Time's Up!";
                    resultSummary.innerHTML = `You answered <span id="correct-answers">0</span> out of <span id="total-questions">${message.totalQuestions || 0}</span> questions correctly.`;
                } else {
                    headerMessage.innerHTML = "Congratulations!";
                    resultSummary.innerHTML = `You answered <span id="correct-answers">${message.correctAnswers || 0}</span> out of <span id="total-questions">${message.totalQuestions || 0}</span> questions correctly.`;
                }
        
                // Append the header and summary to the result message box
                resultMessageBox.appendChild(headerMessage);
                resultMessageBox.appendChild(resultSummary);
        
                // Show the messages with animation
                setTimeout(() => {
                    headerMessage.classList.remove("hidden"); // Show the header
                }, 1000); // Delay before showing the header
        
                setTimeout(() => {
                    resultSummary.classList.remove("hidden"); // Show the summary
                }, 1000); // Delay before showing the summary
        
                // Hide the result message after 10 seconds
                setTimeout(() => {
                    resultMessageBox.classList.add("hide"); // Apply fade-out animation
                }, 10000); // Hide after 10 seconds
            } else {
                // Handle non-result message
                const answerMessageBox = document.getElementById("answerMessageBox");
                answerMessageBox.classList.remove("hidden");
        
                messageBox.classList.add("message-box", type);
                messageBox.innerHTML = `<span>${message}</span>`;
                answerMessageBox.appendChild(messageBox);
        
                // Hide the answer message after 1 second
                setTimeout(() => {
                    messageBox.classList.add("hide"); // Apply fade-out animation
                }, 1000); // Hide after 1 second
            }
        }
        
        
        // Function to calculate score (example logic)
        function calculateScore() {
            let correctAnswers = 0;
            userAnswers.forEach(answer => {
                if (answer.correct) {
                    correctAnswers++;
                }
            });
            return correctAnswers;
        }
        
        // Automatically start the game after 5 seconds
        loadQuestions();
    }

});


