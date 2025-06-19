const startBtn = document.getElementById("startBtn");
const transcription = document.getElementById("transcription");
const themeToggle = document.getElementById("themeToggle");
const saveBtn = document.getElementById("saveBtn");
const notesList = document.getElementById("notesList");

let recognition;
let isRecording = false;

// Web Speech API setup
if ("webkitSpeechRecognition" in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = function (event) {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
        }
        transcription.value = transcript;
    };

    startBtn.addEventListener("click", () => {
        if (isRecording) {
            recognition.stop();
            startBtn.classList.remove("recording");
            startBtn.setAttribute("aria-pressed", "false");
            startBtn.innerHTML = "🎤 Start Recording";
            isRecording = false;
        } else {
            recognition.start();
            startBtn.classList.add("recording");
            startBtn.setAttribute("aria-pressed", "true");
            startBtn.innerHTML = "⏹️ Stop Recording";
            isRecording = true;
        }
    });
} else {
    alert("Your browser does not support speech recognition.");
}

// Save Note to backend
saveBtn.addEventListener("click", () => {
    const note = transcription.value.trim();

    if (!note) {
        alert("Note is empty!");
        return;
    }

    fetch("/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ note: note }),
})
.then(res => res.json())
.then(data => {
    if (data.success) {
        const li = document.createElement("li");
        li.className = "list-group-item";
       li.innerHTML = `<strong>${data.note}</strong><br><small class="text-muted">${data.timestamp}</small>`;

        notesList.appendChild(li);
        transcription.value = "";

        // ✅ Snackbar to show user feedback
        showSnackbar("Note saved successfully!");

        // ✅ Check if clear button should be enabled
        updateClearButtonState();
    } else {
        showSnackbar("Failed to save note.");
    }
});

});

// Theme toggle logic
themeToggle.addEventListener("click", () => {
    const html = document.documentElement;
    const currentTheme = html.getAttribute("data-theme") || "light";
    const newTheme = currentTheme === "light" ? "dark" : "light";
    html.setAttribute("data-theme", newTheme);

    themeToggle.innerHTML = newTheme === "dark"
        ? '<i class="bi bi-moon-stars-fill"></i>'
        : '<i class="bi bi-sun-fill"></i>';
});

document.getElementById("clearBtn").addEventListener("click", () => {
  if (!confirm("Are you sure you want to delete all notes?")) return;

  fetch("/clear", {
    method: "POST"
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      document.getElementById("notesList").innerHTML = "";
      updateClearButtonState();
      showSnackbar("All notes cleared.");

    } else {
      showSnackbar("Failed to clear notes.");
    }
  });
});

function showSnackbar(message) {
  const snackbar = document.getElementById("snackbar");
  snackbar.textContent = message;
  snackbar.className = "show";
  setTimeout(() => {
    snackbar.className = snackbar.className.replace("show", "");
  }, 3000);
}
function updateClearButtonState() {
  const list = document.getElementById("notesList");
  const clearBtn = document.getElementById("clearBtn");
  clearBtn.disabled = list.children.length === 0;
}
window.addEventListener("DOMContentLoaded", updateClearButtonState);

