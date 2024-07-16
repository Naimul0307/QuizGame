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

    function showAlert(message, className = '') {
        const alertElement = document.createElement('div');
        alertElement.className = `alert alert-dismissible fade show ${className}`;
        alertElement.innerHTML = `
            <strong>${message}</strong>
        `;
        document.body.appendChild(alertElement);

        // Automatically close alert after 3 seconds
        setTimeout(function() {
            alertElement.classList.remove('show');
            alertElement.classList.add('fade');
            setTimeout(function() {
                alertElement.remove();
            }, 200); // Match CSS fade transition duration
        }, 3000);
    }

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
            showAlert('Settings saved!', 'success'); // Show centered alert
            // Redirect after showing the alert message for 3 seconds
            setTimeout(function() {
                window.location.href = 'user.html';
            });
        });
    }

    // Event listener for User button
    if (userBtn) {
        userBtn.addEventListener('click', function() {
            setTimeout(function() {
                window.location.href = 'info.html';
            });
        });
    }

    // Event listener for User Info Form submission
    if (userSubmitBtn) {
        userSubmitBtn.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent form submission
            // Validate user info
            const userName = userNameInput.value.trim();
            const userEmail = userEmailInput.value.trim();
            const userNumber = userNumberInput.value.trim();
            // Save user info logic here
            localStorage.setItem('userName', userName);
            localStorage.setItem('userEmail', userEmail);
            localStorage.setItem('userNumber', userNumber);
            // Redirect after showing the alert message for 3 seconds
            setTimeout(function() {
                window.location.href = 'game.html';
            });
        });
    }

    // Event listener for changing color on settings option select
    const colorOptions = document.querySelectorAll('.color-option');

    colorOptions.forEach(option => {
        option.addEventListener('click', function() {
            const color = option.dataset.color;
            document.body.style.backgroundColor = color; // Change background color
            // Optionally, you can save the selected color for future use
            localStorage.setItem('backgroundColor', color);
        });
    });

    // Restore saved background color from localStorage
    const savedColor = localStorage.getItem('backgroundColor');
    if (savedColor) {
        document.body.style.backgroundColor = savedColor;
    }

    // Game logic for game.html
    if (window.location.pathname.endsWith('game.html')) {
        const startBtn = document.getElementById('start-btn');
        const gameContent = document.getElementById('game-content');
        const timerDisplay = document.getElementById('timer');
        const questionContainer = document.getElementById('question');
        const answersContainer = document.getElementById('answers');

        let questions = [];
        let currentQuestionIndex = 0;
        let timer;
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

        // Function to parse questions from XML and select random subset
        function parseQuestions(xml) {
            const questionNodes = xml.getElementsByTagName('question');
            let parsedQuestions = [];

            // Shuffle array to get random order
            const shuffledQuestions = shuffle(Array.from(questionNodes));

            // Select the first questionsCount questions from shuffled list
            const selectedQuestions = shuffledQuestions.slice(0, questionsCount);

            selectedQuestions.forEach(questionNode => {
                const questionText = questionNode.getElementsByTagName('text')[0].textContent;
                const answers = [];
                const answerNodes = questionNode.getElementsByTagName('answer');
                for (let j = 0; j < answerNodes.length; j++) {
                    const answerText = answerNodes[j].textContent;
                    const isCorrect = answerNodes[j].getAttribute('correct') === 'true';
                    answers.push({ text: answerText, correct: isCorrect });
                }
                parsedQuestions.push({ question: questionText, answers: answers });
            });

            return parsedQuestions;
        }

        // Function to shuffle array (Fisher-Yates shuffle)
        function shuffle(array) {
            let currentIndex = array.length, randomIndex;

            // While there remain elements to shuffle...
            while (currentIndex !== 0) {

                // Pick a remaining element...
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex--;

                // And swap it with the current element.
                [array[currentIndex], array[randomIndex]] = [
                    array[randomIndex], array[currentIndex]];
            }

            return array;
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
            // Ensure all questions are exhausted
            if (shownQuestionIndices.size === questions.length) {
                endGame();
                return;
            }

            let nextIndex;
            do {
                nextIndex = Math.floor(Math.random() * questions.length);
            } while (shownQuestionIndices.has(nextIndex));

            shownQuestionIndices.add(nextIndex);

            const currentQuestion = questions[nextIndex];
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

            if (!correct) {
                endGame();
                return;
            }

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

        // Event listener for Start button
        startBtn.addEventListener('click', function() {
            loadQuestions();
        });
    }

    // Integrate Simple Keyboard for input fields
    function integrateSimpleKeyboard() {
        const keyboard = new Keyboard({
            onChange: input => onInputChange(input),
            onKeyPress: button => onKeyPress(button)
        });

        function onInputChange(input) {
            document.querySelector('.input').value = input;
        }

        function onKeyPress(button) {
            console.log('Button pressed', button);
        }

        document.querySelectorAll('input[type="text"], input[type="email"], input[type="number"]').forEach(input => {
            input.addEventListener('focus', () => {
                keyboard.setOptions({
                    inputName: input.name,
                    layout: 'default'
                });
                document.querySelector('.simple-keyboard').style.display = 'block';
            });

            input.addEventListener('blur', () => {
                setTimeout(() => {
                    if (!document.querySelector('.simple-keyboard').contains(document.activeElement)) {
                        document.querySelector('.simple-keyboard').style.display = 'none';
                    }
                }, 200);
            });
        });
    }
});
