const textareas = document.querySelectorAll("textarea");
const userInput = document.getElementById("userInput");
const generateButton = document.getElementById("generateButton");
const responseArea = document.getElementById("responseArea");
const convertButton = document.getElementById("convertButton");
const formatButton = document.getElementById("formatButton");

const LOADING_DOTS_HTML =
  '<span class="btn-dots" aria-hidden="true">' +
  '<span class="btn-dot">.</span><span class="btn-dot">.</span><span class="btn-dot">.</span></span>';

async function runWithButtonLoading(button, work) {
  const previousHTML = button.innerHTML;
  button.disabled = true;
  button.innerHTML = LOADING_DOTS_HTML;
  try {
    await work();
  } finally {
    button.innerHTML = previousHTML;
    button.disabled = false;
  }
}

userInput.addEventListener("input", () => {
  userInput.style.height = "auto";
  userInput.style.height = userInput.scrollHeight - 20 + "px";
});

async function generateProblems(userInput) {
  const message = userInput.value;
  const response = await fetch("/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });

  const data = await response.json();
  responseArea.value = data.problems;
  console.log("done generating problems");
}

async function formatProblems(responseArea) {
  const problems = responseArea.value;
  const response = await fetch("/format", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ problems }),
  });

  const data = await response.json();
  responseArea.value = data.problems;
  console.log("done formatting problems");
}

async function convertProblems() {
  const problems = responseArea.value;

  const response = await fetch("/convert", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ problems }),
  });

  if (!response.ok) {
    const error = await response.json();
    alert(error.detail || "Conversion failed");
    return;
  }
  const zip = await response.blob();
  const url = URL.createObjectURL(zip);
  const a = document.createElement("a");
  a.href = url;
  a.download = "QTI.zip";
  a.click();
  a.remove(); // Removes the hidden "a" element from the html
  URL.revokeObjectURL(url); // Frees up memory used by the blob URL
}

generateButton.addEventListener("click", async () => {
  if (userInput.value === "") {
    alert("Please enter a topic in Step 1 for problem generation");
    return;
  }
  try {
    await runWithButtonLoading(generateButton, () =>
      generateProblems(userInput),
    );
  } catch (e) {
    console.error(e);
    alert("Generation failed. Check the console and try again.");
  }
});

formatButton.addEventListener("click", async () => {
  if (responseArea.value === "") {
    alert("Please enter problems in Step 2 to format");
    return;
  }
  try {
    await runWithButtonLoading(formatButton, () =>
      formatProblems(responseArea),
    );
  } catch (e) {
    console.error(e);
    alert("Format failed. Check the console and try again.");
  }
});

convertButton.addEventListener("click", async () => {
  if (responseArea.value === "") {
    alert("Please enter problems in Step 2 to convert");
    return;
  }
  try {
    await runWithButtonLoading(convertButton, () => convertProblems());
  } catch (e) {
    console.error(e);
    alert("Convert failed. Check the console and try again.");
  }
});
