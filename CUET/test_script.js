document.addEventListener('DOMContentLoaded', () => {
    // Configuration
    const csvFilePath = "./cuet_phy.csv";
    const totalTimeMinutes = 12; // As per screenshot timer & instructions
    const marksCorrect = 5;
    const marksIncorrect = -1;

    // DOM Elements
    const questionNumberEl = document.getElementById('q-num');
    const questionTextEl = document.getElementById('q-text');
    const optionsForm = document.getElementById('options-form');
    const optionLabels = optionsForm.querySelectorAll('.option-label'); // Get labels for easier access
    const optionTexts = {
        a: document.getElementById('opt-a'),
        b: document.getElementById('opt-b'),
        c: document.getElementById('opt-c'),
        d: document.getElementById('opt-d')
    };
    const radioButtons = optionsForm.elements['option']; // Access radio group

    const paletteGridEl = document.getElementById('palette-grid');
    const timerEl = document.getElementById('time');

    const markReviewBtn = document.getElementById('mark-btn');
    const clearResponseBtn = document.getElementById('clear-btn');
    const saveNextBtn = document.getElementById('next-btn'); // Save & Next is in sidebar
    const submitBtn = document.getElementById('submit-btn');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const pauseBtn = document.getElementById('pause-btn'); // Pause button functionality TBD

    // Test State Variables
    let questions = []; // Array to hold question objects {q: '', a: '', b: '', c: '', d: '', correct: '', index: N }
    let currentQuestionIndex = 0;
    let userAnswers = []; // Stores { selectedOption: 'a'/'b'/'c'/'d' or null, status: 'not_visited'/'not_answered'/'answered'/'marked'/'marked_answered' }
    let timeLeft = totalTimeMinutes * 60;
    let timerInterval = null;
    let testSubmitted = false;

    // --- Initialization ---
    async function initializeTest() {
        requestFullScreen(); // Attempt fullscreen on load
        try {
            const csvData = await fetchCSV(csvFilePath);
            questions = parseCSV(csvData);
            if (questions.length === 0) throw new Error("No questions loaded.");

            // Initialize userAnswers array based on number of questions
            userAnswers = Array(questions.length).fill(null).map(() => ({
                selectedOption: null,
                status: 'not_visited' // Initial status
            }));

            buildPalette();
            displayQuestion(currentQuestionIndex); // Display first question
            startTimer();

        } catch (error) {
            console.error("Error initializing test:", error);
            questionTextEl.textContent = `Error loading test: ${error.message}. Please check the CSV file and path.`;
            // Disable controls if loading fails
            disableAllControls();
        }
    }

    // --- Fetch and Parse CSV ---
    async function fetchCSV(filePath) {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} - Could not fetch ${filePath}`);
        }
        return await response.text();
    }

    function parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        const parsedQuestions = [];
        lines.forEach((line, index) => {
            // Basic CSV parsing (handle potential quotes and commas within quotes)
             const regex = /"([^"]*)"|([^,]+)/g;
             let match;
             const values = [];
             while (match = regex.exec(line)) {
                values.push(match[1] || match[2]); // Prefer quoted content if available
             }

             if (values.length >= 6) { // Need at least Q, A, B, C, D, Correct
                parsedQuestions.push({
                    q: values[0].trim(),
                    a: values[1].trim(),
                    b: values[2].trim(),
                    c: values[3].trim(),
                    d: values[4].trim(),
                    correct: values[5].trim().toLowerCase(),
                    index: index // Store original index
                });
            } else {
                console.warn(`Skipping malformed CSV line ${index + 1}: ${line}`);
            }
        });
        return parsedQuestions;
    }


    // --- Display Logic ---
    function displayQuestion(index) {
        if (index < 0 || index >= questions.length) return; // Boundary check

        const qData = questions[index];
        currentQuestionIndex = index;

        // Update Question Number and Text
        questionNumberEl.textContent = index + 1;
        questionTextEl.textContent = qData.q;

        // Update Option Text
        optionTexts.a.textContent = qData.a;
        optionTexts.b.textContent = qData.b;
        optionTexts.c.textContent = qData.c;
        optionTexts.d.textContent = qData.d;

        // Update Question Status (if not visited, mark as not answered)
        if (userAnswers[index].status === 'not_visited') {
            userAnswers[index].status = 'not_answered';
        }

        // Restore Saved Answer / Clear Radio Buttons
        clearSelection(); // Clear first
        const savedAnswer = userAnswers[index].selectedOption;
        if (savedAnswer) {
            try {
                 const radioToCheck = optionsForm.querySelector(`input[name="option"][value="${savedAnswer}"]`);
                 if (radioToCheck) {
                    radioToCheck.checked = true;
                 } else {
                    console.warn(`Saved answer "${savedAnswer}" for Q${index+1} does not match any option value.`);
                    userAnswers[index].selectedOption = null; // Clear invalid saved answer
                 }
            } catch (e) { console.error("Error setting radio button:", e); }
        }

        updatePalette(); // Highlight current question in palette
    }

    function clearSelection() {
        radioButtons.forEach(radio => radio.checked = false);
    }

    // --- Palette Logic ---
    function buildPalette() {
        paletteGridEl.innerHTML = ''; // Clear existing palette
        questions.forEach((_, index) => {
            const button = document.createElement('button');
            button.textContent = index + 1;
            button.classList.add('palette-item');
            // Add status class later in updatePalette
            button.dataset.index = index; // Store index on the button
            button.addEventListener('click', () => {
                saveCurrentState(); // Save state of the question *before* jumping
                displayQuestion(index);
            });
            paletteGridEl.appendChild(button);
        });
    }

    function updatePalette() {
        const paletteItems = paletteGridEl.querySelectorAll('.palette-item');
        paletteItems.forEach((button, index) => {
            if (index >= userAnswers.length) return; // Safety check

            const status = userAnswers[index].status;
            // Remove old status classes
            button.classList.remove('not_visited', 'not_answered', 'answered', 'marked', 'marked-answered', 'current');

            // Add current status class
            if (status) {
                button.classList.add(status);
            } else {
                 button.classList.add('not_visited'); // Fallback
            }


            // Highlight current question
            if (index === currentQuestionIndex) {
                button.classList.add('current');
            }
        });
    }

    // --- Timer Logic ---
    function startTimer() {
        timerInterval = setInterval(() => {
            if (testSubmitted) {
                 clearInterval(timerInterval);
                 return;
            }
            timeLeft--;
            timerEl.textContent = formatTime(timeLeft);

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                alert("Time's up! Submitting the test.");
                submitTest();
            }
        }, 1000);
        timerEl.textContent = formatTime(timeLeft); // Initial display
    }

    function formatTime(seconds) {
        if (seconds < 0) seconds = 0;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    // --- Navigation and Actions ---

    function getSelectedOption() {
        const selectedRadio = optionsForm.querySelector('input[name="option"]:checked');
        return selectedRadio ? selectedRadio.value : null;
    }

    function saveCurrentState() {
         if (currentQuestionIndex < 0 || currentQuestionIndex >= userAnswers.length) return;

        const selectedValue = getSelectedOption();
        const currentStatus = userAnswers[currentQuestionIndex].status;

         // Only update if status isn't just 'marked' (we preserve 'marked' or 'marked_answered')
        if (currentStatus !== 'marked' && currentStatus !== 'marked_answered') {
             if (selectedValue) {
                userAnswers[currentQuestionIndex].status = 'answered';
             } else if (currentStatus !== 'not_visited') { // If visited but no answer selected
                 userAnswers[currentQuestionIndex].status = 'not_answered';
             }
        } else if (currentStatus === 'marked') { // If it was marked, and now an answer is selected
             if(selectedValue) {
                 userAnswers[currentQuestionIndex].status = 'marked_answered';
             }
        } else if (currentStatus === 'marked_answered') { // If it was marked+answered, and answer is removed
            if(!selectedValue) {
                userAnswers[currentQuestionIndex].status = 'marked'; // Revert to just marked
            }
        }

        // Save the selected option value regardless of status change
        userAnswers[currentQuestionIndex].selectedOption = selectedValue;
    }


    function handleSaveAndNext() {
        saveCurrentState(); // Save the answer and update status
        if (currentQuestionIndex < questions.length - 1) {
            displayQuestion(currentQuestionIndex + 1);
        } else {
            // Optionally loop back or stay on last question
            // alert("You are on the last question.");
             displayQuestion(currentQuestionIndex); // Re-display to update palette
             updatePalette(); // Make sure palette is up-to-date
        }
    }

    function handleMarkForReviewAndNext() {
        const selectedValue = getSelectedOption();
        userAnswers[currentQuestionIndex].selectedOption = selectedValue; // Save selection even if only marking

        // Update status
        if (selectedValue) {
            userAnswers[currentQuestionIndex].status = 'marked_answered';
        } else {
            userAnswers[currentQuestionIndex].status = 'marked';
        }

        if (currentQuestionIndex < questions.length - 1) {
            displayQuestion(currentQuestionIndex + 1);
        } else {
            // alert("You are on the last question. Marked for review.");
            displayQuestion(currentQuestionIndex); // Re-display to update palette
            updatePalette(); // Make sure palette is up-to-date
        }
    }

    function handleClearResponse() {
        clearSelection(); // Clear radio button UI
        userAnswers[currentQuestionIndex].selectedOption = null; // Clear saved answer

        // Update status: if it was 'answered' or 'marked_answered', revert to 'not_answered' or 'marked'
        const currentStatus = userAnswers[currentQuestionIndex].status;
        if (currentStatus === 'answered') {
             userAnswers[currentQuestionIndex].status = 'not_answered';
        } else if (currentStatus === 'marked_answered') {
             userAnswers[currentQuestionIndex].status = 'marked';
        }
         // If it was 'not_answered' or 'marked' already, clearing doesn't change the base status.

        updatePalette(); // Update visual status
    }

    function submitTest() {
        if (testSubmitted) return; // Prevent multiple submissions
        testSubmitted = true;
        clearInterval(timerInterval); // Stop the timer
        disableAllControls();

        // --- Scoring Logic (Example) ---
        let score = 0;
        let answeredCount = 0;
        let correctCount = 0;
        let incorrectCount = 0;
        let notAttempted = 0;

        questions.forEach((q, index) => {
            const userAnswer = userAnswers[index];
            if (userAnswer.selectedOption) {
                answeredCount++;
                if (userAnswer.selectedOption === q.correct) {
                    score += marksCorrect;
                    correctCount++;
                } else {
                    score += marksIncorrect;
                    incorrectCount++;
                }
            } else {
                 notAttempted++;
            }
        });

        // --- Display Results (Basic Alert) ---
        const resultMessage = `
            Test Submitted!
            ---------------------
            Total Questions: ${questions.length}
            Answered: ${answeredCount}
            Correct: ${correctCount}
            Incorrect: ${incorrectCount}
            Not Attempted: ${notAttempted}
            ---------------------
            Score: ${score}
        `;
        alert(resultMessage);

        // You would typically redirect to a results page here
         console.log("User Answers:", userAnswers); // Log answers for debugging
         console.log("Final Score:", score);
         // window.location.href = 'results.html'; // Example redirection
    }

    function disableAllControls() {
         saveNextBtn.disabled = true;
         markReviewBtn.disabled = true;
         clearResponseBtn.disabled = true;
         submitBtn.disabled = true;
         paletteGridEl.querySelectorAll('button').forEach(btn => btn.disabled = true);
         optionsForm.querySelectorAll('input').forEach(input => input.disabled = true);
         // Optionally disable pause/fullscreen too
         // pauseBtn.disabled = true;
         // fullscreenBtn.disabled = true;
    }


    // --- Fullscreen API ---
    function requestFullScreen() {
        const elem = document.documentElement; // Get the root element (HTML)
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(err => {
                console.warn(`Fullscreen request failed: ${err.message} (${err.name})`);
                // Maybe browser needs user interaction first. Button click helps.
            });
        } else if (elem.mozRequestFullScreen) { /* Firefox */
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { /* IE/Edge */
            elem.msRequestFullscreen();
        }
    }

    function exitFullScreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }

    function toggleFullScreen() {
        if (!document.fullscreenElement &&    // Standard
            !document.mozFullScreenElement && // Firefox
            !document.webkitFullscreenElement && // Chrome, Safari and Opera
            !document.msFullscreenElement) {  // IE/Edge
            requestFullScreen();
            fullscreenBtn.innerHTML = `<i class="fas fa-compress"></i> Exit Full Screen`;
        } else {
            exitFullScreen();
             fullscreenBtn.innerHTML = `<i class="fas fa-expand"></i> Full Screen`;
        }
    }

    // --- Event Listeners ---
    saveNextBtn.addEventListener('click', handleSaveAndNext);
    markReviewBtn.addEventListener('click', handleMarkForReviewAndNext);
    clearResponseBtn.addEventListener('click', handleClearResponse);
    submitBtn.addEventListener('click', () => {
        // Add a confirmation dialog
        if (confirm("Are you sure you want to submit the test?")) {
            submitTest();
        }
    });
    fullscreenBtn.addEventListener('click', toggleFullScreen);
     // Add listener for fullscreen change (e.g., user pressing ESC)
     document.addEventListener('fullscreenchange', () => {
         if (!document.fullscreenElement) {
             fullscreenBtn.innerHTML = `<i class="fas fa-expand"></i> Full Screen`;
         }
     });


    // --- Start Test ---
    initializeTest();

}); // End DOMContentLoaded