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

        const filePath = path.join(__dirname, '../public/results/user_results.xlsx');
        // let isFileDownloaded = false; // Flag to track file download
        let questions = [];
        let currentQuestionIndex = 0;
        let timer;
        let gameTimeInSeconds = localStorage.getItem('gameTime') * 60 || 300; // Default 5 minutes
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

                  const questionText = questionNode.getElementsByTagName('text')[0].textContent;
                  const image = questionNode.getElementsByTagName('image')[0]?.textContent || '';
                  const answers = [];
                  const answerNodes = questionNode.getElementsByTagName('answer');

                  for (let j = 0; j < answerNodes.length; j++) {
                      const answerText = answerNodes[j].textContent;
                      const isCorrect = answerNodes[j].getAttribute('correct') === 'true';
                      answers.push({ text: answerText, correct: isCorrect });
                  }

                  parsedQuestions.push({ question: questionText, image: image, answers: answers });
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

        function playBeep() {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
        
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
        
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(1000, audioContext.currentTime); // Beep frequency
            gainNode.gain.setValueAtTime(1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5); // Beep duration
        
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        }


        // Function to start the timer
        function startTimer(duration) {
            let timeLeft = duration;
            timer = setInterval(function() {
                let minutes = Math.floor(timeLeft / 60);
                let seconds = timeLeft % 60;
                timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

                // Play beep sound when countdown reaches 10 seconds or less
                if (timeLeft <= 10 && timeLeft > 0) {
                    playBeep(); // Play beep sound
                    timerDisplay.classList.add('timer-beep'); // Add beep animation class

                    // Remove the animation class after it completes
                    setTimeout(() => {
                        timerDisplay.classList.remove('timer-beep');
                    }, 500); // Match the duration of the animation
                }

                if (--timeLeft < 0) {
                    clearInterval(timer);
                    endGame();
                }
            }, 1000);
        }


        // Function to display the current question
        function displayQuestion() {
            if (shownQuestionIndices.size === questions.length) {
                endGame(); // End game if all questions have been shown
                return;
            }

            let nextIndex;
            do {
                nextIndex = Math.floor(Math.random() * questions.length);
            } while (shownQuestionIndices.has(nextIndex)); // Ensure unique question

            shownQuestionIndices.add(nextIndex); // Add index to shown questions
            currentQuestionIndex = nextIndex; // Update the currentQuestionIndex

            const currentQuestion = questions[currentQuestionIndex];
            questionContainer.innerHTML = ''; // Clear previous content

            // Display question text if available
            if (currentQuestion.question) {
                const questionTextElement = document.createElement('p');
                questionTextElement.textContent = currentQuestion.question;
                questionContainer.appendChild(questionTextElement);
            }

            // Display image if available
            if (currentQuestion.image) {
                const imgElement = document.createElement('img');
                imgElement.src = currentQuestion.image;
                imgElement.alt = 'Question Image';
                imgElement.classList.add('question-image'); // Add CSS class for styling
                questionContainer.appendChild(imgElement);
            }

            answersContainer.innerHTML = ''; // Clear previous answers

            // Display answers
            currentQuestion.answers.forEach((answer, index) => {
                const answerElement = document.createElement('div');
                answerElement.textContent = answer.text;
                answerElement.classList.add('answer');
                answerElement.dataset.correct = answer.correct; // Store correct attribute

                answerElement.addEventListener('click', function() {
                    handleAnswerClick(index, answer.correct); // Handle answer click event
                });

                answersContainer.appendChild(answerElement); // Append each answer
            });

            // Show the Pass button
            const passButton = document.getElementById('pass-button');
            passButton.style.display = 'inline-block'; // Show the Pass button

            // Add event listener for Pass button
            passButton.onclick = function() {
                handlePass(); // Call handlePass function
            };
        }

        // Function to handle passing the question
        function handlePass() {
            const passButton = document.getElementById('pass-button');
            passButton.style.display = 'none'; // Hide the Pass button
            displayQuestion(); // Move to the next question
        }

        // Function to handle answer click
        function handleAnswerClick(index, correct) {
            handleAnswerSelection(index, correct);
        }

        // Function to handle touch events for answering questions
        function handleAnswerTouch(index, correct) {
            handleAnswerSelection(index, correct);
        }

        // Function to handle keyboard events for answering questions
        function handleAnswerKeystroke(index, correct) {
            console.log(questions[currentQuestionIndex]); 
            console.log(`Key pressed: ${index}, Correct: ${correct}`); // Debug log
            handleAnswerSelection(index, correct);
        }
        
        function showMessage(message, duration = 1000) {
            const messageBox = document.getElementById('messageBox');
            messageBox.textContent = message;
            messageBox.classList.remove('hidden');  // Show the message
            // Hide the message after the specified duration
            setTimeout(() => {
                messageBox.classList.add('hidden');  // Hide the message
            }, duration);
        }

        
        function handleAnswerSelection(index, correct) {
            console.log(`Answer selected: ${index}, Correct: ${correct}`);
            const selectedAnswer = {
                question: questions[currentQuestionIndex].question,
                answer: questions[currentQuestionIndex].answers[index].text,
                correct: correct
            };
            userAnswers.push(selectedAnswer);
        
            // Remove 'selected' class from all answers
            const answerElements = document.querySelectorAll('.answer');
            answerElements.forEach(answerElement => {
                answerElement.classList.remove('selected');
            });
        
            // Add 'selected' class to the selected answer
            answersContainer.children[index].classList.add('selected');
        
            // Check if the answer is correct or wrong
            if (correct) {
                console.log("Correct answer!");
            } else {
                console.log("Answer is wrong!");
                playBeep(); // Play the beep sound for wrong answers
                showMessage("Answer is wrong!", 1000);  // Show custom message for 2 seconds
            }
        
            // Proceed to next question automatically after a short delay
            setTimeout(function() {
                if (shownQuestionIndices.size < questions.length) {
                    displayQuestion(); // Display next question
                } else {
                    endGame(); // End game if no more questions
                }
            }, 1000); // Delay before showing the next question
        }

        // Event listeners for answers
        const answerElements = document.querySelectorAll('.answer');
        answerElements.forEach((answerElement, index) => {
            // Click event listener for mouse clicks
            answerElement.addEventListener('click', function() {
                handleAnswerClick(index, questions[currentQuestionIndex].answers[index].correct);
            });

            // Touch event listener for touch events
            answerElement.addEventListener('touchstart', function(event) {
                event.preventDefault(); // Prevent default touch behavior
                handleAnswerTouch(index, questions[currentQuestionIndex].answers[index].correct);
            });
        });

        // Event listener for keyboard events
        document.addEventListener('keydown', function(event) {
            const key = event.key.toLowerCase(); // Normalize to lowercase
            const answerIndices = {
                'a': 0,
                'b': 1,
                'c': 2,
                // Add more mappings if you have more answers
            };
        
            if (answerIndices[key] !== undefined) {
                console.log(questions[currentQuestionIndex]);
                const index = answerIndices[key];
                handleAnswerKeystroke(index, questions[currentQuestionIndex].answers[index].correct);
            }
        });
        

        function endGame() {
            clearInterval(timer); // Stop the timer
    
            // Calculate score and retrieve user info
            const score = calculateScore();
            const userName = localStorage.getItem('userName');
            const userEmail = localStorage.getItem('userEmail');
            const userNumber = localStorage.getItem('userNumber');
            const dateTime = new Date().toISOString();
    
            //    // Get the last timer value
            const timerValue = timerDisplay.textContent; // Get the current displayed timer value
            // const [minutes, seconds] = timerValue.split(':').map(Number);
            // const totalSeconds = minutes * 60 + seconds; // Convert to total seconds

            const user = {
                name: userName,
                email: userEmail,
                number: userNumber,
                score: score,
                dateTime: dateTime,
                timerValue:timerValue
                // timerValue: totalSeconds // Save the timer value
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
            window.location.href = `results.html?name=${userName}&email=${userEmail}&number=${userNumber}&score=${score}&dateTime=${encodeURIComponent(dateTime)}`;
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




