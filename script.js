const letters = "azertyuiopqsdfghjklmwxcvbn0123456789";
let lettersArray = [...letters];

// Selecting the letters container
let lettresContainer = document.querySelector(".letters");
if (lettresContainer) {
    // Generating the letters
    lettersArray.forEach(letter => {
        let span = document.createElement("span");
        span.appendChild(document.createTextNode(letter));
        span.className = "letter-box";
        lettresContainer.appendChild(span);
    });
}

// Variables for the score and timer
let score = 0;
let bestScore = localStorage.getItem("bestScore") || 0;
let timeLeft = 100; // Time in seconds

// Creating display elements
let scoreElement = document.createElement("div");
scoreElement.className = "score";
scoreElement.textContent = `Score: ${score}`;
document.body.appendChild(scoreElement);

let bestScoreElement = document.createElement("div");
bestScoreElement.className = "best-score";
bestScoreElement.textContent = `Best Score: ${bestScore}`;
document.body.appendChild(bestScoreElement);

let timerElement = document.createElement("div");
timerElement.className = "timer";
timerElement.textContent = `Time: ${timeLeft}s`;
document.body.appendChild(timerElement);

// Load words from the JSON file
async function loadWords() {
    try {
        let response = await fetch("words.json");
        let words = await response.json();

        // Randomly select a category and a word
        let allKeys = Object.keys(words);
        let randomPropName = allKeys[Math.floor(Math.random() * allKeys.length)];
        let randomValueValue = words[randomPropName][Math.floor(Math.random() * words[randomPropName].length)];

        // Display the category
        let categorySpan = document.querySelector(".game-info .category span");
        if (categorySpan) categorySpan.innerHTML = randomPropName;

        // Selecting the container for the letters to guess
        let lettersGuessContainer = document.querySelector(".letters-guess");
        if (lettersGuessContainer) {
            let lettersAndSpace = [...randomValueValue];
            lettersAndSpace.forEach(letter => {
                let emptySpan = document.createElement("span");
                if (letter === " ") emptySpan.className = "with-space";
                lettersGuessContainer.appendChild(emptySpan);
            });
        }

        let guessSpans = document.querySelectorAll(".letters-guess span");
        let wrongAttempts = 0;
        let theDraw = document.querySelector(".hangman-draw");

        // Handling clicks on the letters
        document.addEventListener("click", (e) => {
            if (!e.target.classList.contains("letter-box") || 
                e.target.classList.contains("clicked") || 
                lettresContainer.classList.contains("finished")) return;

            e.target.classList.add("clicked");

            let theClickedLetter = e.target.innerHTML.toLowerCase();
            let theChosenWord = [...randomValueValue.toLowerCase()];
            let theStatus = false;

            theChosenWord.forEach((wordLetter, wordIndex) => {
                if (theClickedLetter === wordLetter) {
                    theStatus = true;
                    guessSpans[wordIndex].innerHTML = theClickedLetter;
                    score += 10; // Increase the score for each correct letter
                    scoreElement.textContent = `Score: ${score}`;
                }
            });

            if (!theStatus) {
                wrongAttempts++;
                theDraw.classList.add(`wrong-${wrongAttempts}`);
                let failSound = document.getElementById("fail");
                if (failSound) failSound.play();
                if (wrongAttempts === 8) endGame(randomValueValue);
            } else {
                let successSound = document.getElementById("success");
                if (successSound) successSound.play();
                if (isGameWon()) endSuccess();
            }
        });

        function endGame(word) {
            clearInterval(timer);
            let div = document.createElement("div");
            div.className = "popup";
            div.textContent = `Game over! The correct word was: "${word.toUpperCase()}"`;
            document.body.appendChild(div);
            lettresContainer.classList.add("finished");
        }

        function endSuccess() {
            clearInterval(timer);
            score += timeLeft * 2; // Bonus based on the remaining time
            scoreElement.textContent = `Score: ${score}`;

            if (score > bestScore) {
                bestScore = score;
                localStorage.setItem("bestScore", bestScore);
                bestScoreElement.textContent = `Best Score: ${bestScore}`;
            }

            let success = document.createElement("div");
            success.className = "success";
            success.textContent = "Well done!";
            document.body.appendChild(success);
            lettresContainer.classList.add("finished");
        }

        function isGameWon() {
            return [...guessSpans].every(span => span.innerHTML.trim() !== "");
        }

        // Timer
        let timer = setInterval(() => {
            timeLeft--;
            timerElement.textContent = `Time: ${timeLeft}s`;
            
            if (timeLeft === 0) {
                clearInterval(timer);
                endGame(randomValueValue);
            }
        }, 1000);

        // Reload button
        let reloadBtn = document.createElement('button');
        reloadBtn.className = 'reload';
        reloadBtn.textContent = 'Play Again';
        document.body.appendChild(reloadBtn);
        reloadBtn.addEventListener('click', () => location.reload());

    } catch (error) {
        console.error("Error loading words:", error);
    }
}
// Call the function to load words
loadWords();

