document.addEventListener('DOMContentLoaded', function() {
    const settingsBtn = document.getElementById('settings-btn');
    const settingsOptions = document.getElementById('settings-options');
    const gameTimeInput = document.getElementById('game-time');
    const questionsCountInput = document.getElementById('questions-count');
    const saveSettingsBtn = document.getElementById('save-settings-btn');

    const userBtn = document.getElementById('user-btn');
    const userForm = document.getElementById('user-form');
    const userNameInput = document.getElementById('user-name');
    const userEmailInput = document.getElementById('user-email');
    const userNumberInput = document.getElementById('user-number');
    const userSubmitBtn = document.getElementById('submit-user-info');

    // Event listener for Settings button
    if (settingsBtn) {
        settingsBtn.addEventListener('click', function() {
            settingsOptions.style.display = 'block';
            userForm.style.display = 'none'; // Hide user form
        });
    }

    // Event listener for Save Settings button
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent form submission
            // Save settings logic here
            const gameTime = parseInt(gameTimeInput.value);
            const questionsCount = parseInt(questionsCountInput.value);
            console.log(`Game Time: ${gameTime} minutes, Questions Count: ${questionsCount}`);
            // Optionally, you can save these settings for future use
            localStorage.setItem('gameTime', gameTime);
            localStorage.setItem('questionsCount', questionsCount);
            alert('Settings saved!');
        });
    }

    // Event listener for User button
    if (userBtn) {
        userBtn.addEventListener('click', function() {
            userForm.style.display = 'block';
            settingsOptions.style.display = 'none'; // Hide settings options
        });
    }

    // Event listener for User Info Form submission
    if (userSubmitBtn) {
        userSubmitBtn.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent form submission
            // Save user info logic here
            const userName = userNameInput.value;
            const userEmail = userEmailInput.value;
            const userNumber = userNumberInput.value;
            console.log(`User Info: Name - ${userName}, Email - ${userEmail}, Number - ${userNumber}`);
            // Optionally, you can save this user info for future use
            localStorage.setItem('userName', userName);
            localStorage.setItem('userEmail', userEmail);
            localStorage.setItem('userNumber', userNumber);
            alert('User info saved!');
            // Redirect to game start page (replace with actual redirection logic)
            window.location.href = 'game.html'; // Replace with your game start page
        });
    }

    // Game logic for game.html
    if (window.location.pathname.endsWith('game.html')) {
        const startBtn = document.getElementById('start-btn');
        const gameContent = document.getElementById('game-content');
        const timerDisplay = document.getElementById('time-left');
        const questionContainer = document.getElementById('question');
        const answersContainer = document.getElementById('answers');
        const nextQuestionBtn = document.getElementById('next-question-btn');

        let questions = [];
        let currentQuestionIndex = 0;
        let timer;
        let gameTimeInSeconds = localStorage.getItem('gameTime') * 60 || 300; // Default 5 minutes
        let userAnswers = [];

        // Function to load questions from XML
        function loadQuestions() {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', 'questions.xml', true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    const xmlData = xhr.responseXML;
                    questions = parseQuestions(xmlData);
                    startGame();
                }
            };
            xhr.send();
        }

        // Function to parse questions from XML
        function parseQuestions(xml) {
            const questionNodes = xml.getElementsByTagName('question');
            let parsedQuestions = [];
            for (let i = 0; i < questionNodes.length; i++) {
                const questionNode = questionNodes[i];
                const questionText = questionNode.getElementsByTagName('text')[0].textContent;
                const answers = [];
                const answerNodes = questionNode.getElementsByTagName('answer');
                for (let j = 0; j < answerNodes.length; j++) {
                    const answerText = answerNodes[j].textContent;
                    const isCorrect = answerNodes[j].getAttribute('correct') === 'true';
                    answers.push({ text: answerText, correct: isCorrect });
                }
                parsedQuestions.push({ question: questionText, answers: answers });
            }
            return parsedQuestions;
        }

        // Function to start the game
        function startGame() {
            startBtn.style.display = 'none';
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
            const currentQuestion = questions[currentQuestionIndex];
            questionContainer.textContent = currentQuestion.question;
            answersContainer.innerHTML = ''; // Clear previous answers
            currentQuestion.answers.forEach((answer, index) => {
                const answerElement = document.createElement('div');
                answerElement.textContent = answer.text;
                answerElement.classList.add('answer');
                answerElement.dataset.correct = answer.correct; // Store the correct attribute
                answerElement.addEventListener('click', function() {
                    handleAnswerClick(index, answer.correct);
                });
                answersContainer.appendChild(answerElement);
            });
        }

        // Function to handle answer click
        function handleAnswerClick(index, correct) {
            const selectedAnswer = {
                question: questions[currentQuestionIndex].question,
                answer: questions[currentQuestionIndex].answers[index].text,
                correct: correct
            };
            userAnswers.push(selectedAnswer);
            if (!correct) {
                endGame();
                return;
            }
            nextQuestionBtn.style.display = 'block';
            // Optionally, provide visual feedback for correct/incorrect answers
        }

        // Function to move to the next question
        function nextQuestion() {
            currentQuestionIndex++;
            if (currentQuestionIndex < questions.length) {
                displayQuestion();
                nextQuestionBtn.style.display = 'none';
            } else {
                endGame();
            }
        }

        // Function to end the game
        function endGame() {
            clearInterval(timer); // Stop the timer
            gameContent.style.display = 'none';
            // Display game summary or redirect to results page
            const score = calculateScore();
            const summaryMessage = `Game Over! Your score is ${score}.`;
            alert(summaryMessage);
            // Optionally, redirect to a results page or allow replay
            // window.location.href = 'results.html'; // Redirect to results page
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

        // Event listener for Start button
        startBtn.addEventListener('click', function() {
            loadQuestions();
        });

        // Event listener for Next Question button
        nextQuestionBtn.addEventListener('click', function() {
            nextQuestion();
        });
    }
});
