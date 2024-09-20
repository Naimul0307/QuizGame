document.addEventListener('DOMContentLoaded', function() {
    // Game logic for game.html
    if (window.location.pathname.endsWith('game.html')) {
        const gameContent = document.getElementById('game-content');
        const countdownTimerElement = document.getElementById('countdown-timer');
        const timerDisplay = document.getElementById('timer');
        const countdownDisplay = document.getElementById('countdown');
        const questionContainer = document.getElementById('question');
        const answersContainer = document.getElementById('answers');

        let questions = [];
        let currentQuestionIndex = 0;
        let timer;
        let countdownTimer;
        let countdownInSeconds = 5; // Countdown time before the game starts
        let gameTimeInSeconds = localStorage.getItem('gameTime') * 60 || 300; // Default 5 minutes
        let userAnswers = [];
        let questionsCount = parseInt(localStorage.getItem('questionsCount')) || 4; // Default to 4 questions

        // Set to keep track of shown question indices
        let shownQuestionIndices = new Set();

        // Function to load questions from XML and select random subset
        function loadQuestions() {
            const xhr = new XMLHttpRequest();
            // xhr.open('GET', '/public/xml/questions.xml', true);
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

        // // Function to parse questions from XML and select random subset
        // function parseQuestions(xml) {
        //     const questionNodes = xml.getElementsByTagName('question');
        //     let parsedQuestions = [];

        //     // Shuffle array to get random order
        //     const shuffledQuestions = shuffle(Array.from(questionNodes));

        //     // Select the first questionsCount questions from shuffled list
        //     const selectedQuestions = shuffledQuestions.slice(0, questionsCount);

        //     selectedQuestions.forEach(questionNode => {
        //         const questionText = questionNode.getElementsByTagName('text')[0].textContent;
        //         const image = questionNode.getElementsByTagName('image')[0]?.textContent || '';
        //         const answers = [];
        //         const answerNodes = questionNode.getElementsByTagName('answer');
        //         for (let j = 0; j < answerNodes.length; j++) {
        //             const answerText = answerNodes[j].textContent;
        //             const isCorrect = answerNodes[j].getAttribute('correct') === 'true';
        //             answers.push({ text: answerText, correct: isCorrect });
        //         }
        //         parsedQuestions.push({ question: questionText,image: image, answers: answers });
        //     });

        //     return parsedQuestions;
        // }

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

        
        // Function to shuffle array (Fisher-Yates shuffle)
        // function shuffle(array) {
        //     let currentIndex = array.length, randomIndex;

        //     // While there remain elements to shuffle...
        //     while (currentIndex !== 0) {

        //         // Pick a remaining element...
        //         randomIndex = Math.floor(Math.random() * currentIndex);
        //         currentIndex--;

        //         // And swap it with the current element.
        //         [array[currentIndex], array[randomIndex]] = [
        //             array[randomIndex], array[currentIndex]];
        //     }
        //     return array;
        // }

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
        
        
        // Function to show a countdown before starting the game
        function showCountdown() {
            gameContent.style.display = 'none'; // Hide game content during countdown
            timerDisplay.style.display = 'none'; // Hide game timer during countdown
            let countdown = countdownInSeconds;

            countdownTimer = setInterval(function () {
                countdownDisplay.textContent = `Game starts in: ${countdown}`;
                countdown--;

                if (countdown < 0) {
                    clearInterval(countdownTimer);
                    countdownTimerElement.style.display = 'none'; // Hide countdown
                    timerDisplay.style.display = 'block'; // Show the timer after countdown
                    loadQuestions(); // Start loading questions after countdown
                }
            }, 1000);
        }


        // Function to start the game
        function startGame() {
            gameContent.style.display = 'block';
            startTimer(gameTimeInSeconds);
            displayQuestion();
        }

    
        // Function to start the timer
        function startTimer(duration) {
            let timeLeft = duration;
            timer = setInterval(function() {
                let minutes = Math.floor(timeLeft / 60);
                let seconds = timeLeft % 60;
                timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
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

            const currentQuestion = questions[nextIndex];
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
            handleAnswerSelection(index, correct);
        }

        // Function to handle answer selection (used by click, touch, and keystroke)
        function handleAnswerSelection(index, correct) {
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

            // if (!correct) {
            //     endGame();
            //     return;
            // }

            // Proceed to next question automatically
            setTimeout(function() {
                if (shownQuestionIndices.size === questions.length) {
                    endGame();
                } else {
                    displayQuestion();
                }
            }, 1000); // Adjust delay as needed for any transition or animation
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
            const key = event.key;
            // Example: Map keys '1', '2', '3' to answer indices (adjust as needed)
            if (key === 'A' || key === 'a') {
                handleAnswerKeystroke(0, questions[currentQuestionIndex].answers[0].correct);
            } else if (key === 'B' || key === 'b') {
                handleAnswerKeystroke(1, questions[currentQuestionIndex].answers[1].correct);
            } else if (key === 'C' || key === 'c') {
                handleAnswerKeystroke(2, questions[currentQuestionIndex].answers[2].correct);
            } else if (key === 'D' || key === 'd') {
                handleAnswerKeystroke(3, questions[currentQuestionIndex].answers[3].correct);
            } 
            // Add more key mappings for additional answers if needed
        });

        // Function to end the game
        function endGame() {
            clearInterval(timer); // Stop the timer

            // Calculate score
            const score = calculateScore();

            // Save user info and score to localStorage
            const userName = localStorage.getItem('userName');
            const userEmail = localStorage.getItem('userEmail');
            const userNumber = localStorage.getItem('userNumber');

            const user = { name: userName, email: userEmail, number: userNumber, score: score };

            // Store user data in an array in localStorage
            let users = JSON.parse(localStorage.getItem('users')) || [];
            users.push(user);
            localStorage.setItem('users', JSON.stringify(users));
            // Redirect to results page
            window.location.href = `results.html?name=${userName}&email=${userEmail}&number=${userNumber}&score=${score}`;
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
        showCountdown();
    }
});



