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

// Toggle note content visibility
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".note-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const content = btn.nextElementSibling;
      const isVisible = content.style.display === "block";
      content.style.display = isVisible ? "none" : "block";
    });
  });
});

window.addEventListener("DOMContentLoaded", () => {
  const hour = new Date().getHours();
  const isDaytime = hour >= 6 && hour < 18;
  document.body.classList.add(isDaytime ? "daytime" : "nighttime");
});
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("edit-btn")) {
    const noteBlock = e.target.closest(".note-block");
    const noteText = noteBlock.querySelector(".note-text");
    const originalText = noteText.textContent;

    // Replace note text with textarea
    const textarea = document.createElement("textarea");
    textarea.value = originalText;
    textarea.className = "form-control my-2";

    // Replace text node
    noteBlock.replaceChild(textarea, noteText);

    // Create Save button
    const saveBtn = document.createElement("button");
    saveBtn.textContent = "💾 Save";
    saveBtn.className = "btn btn-success btn-sm";

    e.target.replaceWith(saveBtn);

    saveBtn.addEventListener("click", () => {
      const updatedText = textarea.value.trim();
      const noteId = noteBlock.dataset.id;

      if (!updatedText) {
        alert("Note cannot be empty!");
        return;
      }

      fetch("/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: noteId, content: updatedText }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            // Update UI
            const newP = document.createElement("p");
            newP.className = "note-text";
            newP.textContent = updatedText;

            noteBlock.replaceChild(newP, textarea);
            saveBtn.replaceWith(e.target); // Re-add Edit button
            e.target.textContent = "✏️ Edit";
            e.target.classList.add("edit-btn");
          } else {
            alert("Failed to update note.");
          }
        });
    });
  }
});
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("edit-btn")) {
    const noteContent = e.target.closest(".note-content");
    const noteText = noteContent.querySelector(".note-text");
    const noteId = noteContent.dataset.id;

    // Replace note text with a textarea
    const currentText = noteText.textContent;
    const textarea = document.createElement("textarea");
    textarea.value = currentText;
    textarea.className = "form-control mb-2";

    // Create save button
    const saveBtn = document.createElement("button");
    saveBtn.textContent = "💾 Save Changes";
    saveBtn.className = "btn btn-success btn-sm";

    // Clear original content and add new form
    noteContent.innerHTML = "";
    noteContent.appendChild(textarea);
    noteContent.appendChild(saveBtn);

    saveBtn.addEventListener("click", function () {
      const updatedNote = textarea.value.trim();
      if (!updatedNote) {
        alert("Note cannot be empty.");
        return;
      }

      fetch("/edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: noteId, content: updatedNote }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            // Replace textarea with updated text
            noteContent.innerHTML = `
              <p class="note-text">${updatedNote}</p>
              <small class="timestamp">${data.timestamp}</small><br />
              <button class="btn btn-warning btn-sm edit-btn">✏️ Edit</button>
            `;
          } else {
            alert("Failed to update note.");
          }
        });
    });
  }
});
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("delete-btn")) {
    const noteEl = e.target.closest(".note-toggle");
    const noteText = e.target.dataset.note;

    fetch("/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ note: noteText }),
    })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        noteEl.remove();
      } else {
        alert("Failed to delete note.");
      }
    });
  }
});
