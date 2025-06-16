const startBtn = document.getElementById("startBtn");
const transcription = document.getElementById("transcription");
const themeToggle = document.getElementById("themeToggle");

let recognition;
if ("webkitSpeechRecognition" in window) {
  recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-US";

  let isRecording = false;

  startBtn.addEventListener("click", () => {
    if (isRecording) {
      recognition.stop();
      startBtn.classList.remove("recording");
      startBtn.setAttribute("aria-pressed", "false");
      isRecording = false;
    } else {
      recognition.start();
      startBtn.classList.add("recording");
      startBtn.setAttribute("aria-pressed", "true");
      isRecording = true;
    }
  });

  recognition.onresult = (event) => {
    let interimTranscript = "";
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const transcript = event.results[i][0].transcript;
      interimTranscript += transcript;
    }
    transcription.value = interimTranscript;
  };
} else {
  alert("Your browser does not support speech recognition.");
}

themeToggle.addEventListener("click", () => {
  const html = document.documentElement;
  const currentTheme = html.getAttribute("data-theme");
  html.setAttribute("data-theme", currentTheme === "light" ? "dark" : "light");
  themeToggle.innerHTML =
    currentTheme === "light"
      ? '<i class="bi bi-moon-stars-fill"></i>'
      : '<i class="bi bi-sun-fill"></i>';
});
