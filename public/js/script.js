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
            // Validate user info
            const userName = userNameInput.value.trim();
            const userEmail = userEmailInput.value.trim();
            const userNumber = userNumberInput.value.trim();
            if (userName === '' || userEmail === '' || userNumber === '') {
                alert('Please fill out all fields.');
                return;
            }
            // Save user info logic here
            localStorage.setItem('userName', userName);
            localStorage.setItem('userEmail', userEmail);
            localStorage.setItem('userNumber', userNumber);
            alert('User info saved!');
            // Redirect to game start page (replace with actual redirection logic)
            window.location.href = 'game.html'; // Replace with your game start page
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

        // Function to load questions from XML and select random subset
        function loadQuestions() {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', '/public/xml/questions.xml', true);
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

            // Add touch event listeners to answers
            answersContainer.querySelectorAll('.answer').forEach(answerElement => {
                answerElement.addEventListener('touchstart', function(event) {
                    handleAnswerClick(Array.from(answersContainer.children).indexOf(this), this.dataset.correct === 'true');
                });
            });
        }

        // Function to handle answer click or key press
        function handleAnswerClick(index, correct) {
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

            // Add 'selected' class to the clicked answer
            answersContainer.children[index].classList.add('selected');

            if (!correct) {
                endGame();
                return;
            }

            // Proceed to next question automatically
            setTimeout(function() {
                currentQuestionIndex++;
                if (currentQuestionIndex < questions.length) {
                    displayQuestion();
                } else {
                    endGame();
                }
            }, 1000); // Adjust delay as needed for any transition or animation
        }

        // Function to add key press event listeners
        function addKeyListeners() {
            document.addEventListener('keydown', function(event) {
                const key = event.key.toLowerCase();
                const keyMapping = { 'a': 0, 'b': 1, 'c': 2, 'd': 3 };
                if (key in keyMapping) {
                    const index = keyMapping[key];
                    if (index < answersContainer.children.length) {
                        const correct = answersContainer.children[index].dataset.correct === 'true';
                        handleAnswerClick(index, correct);
                    }
                }
            });
        }

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
});