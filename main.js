console.debug("hello fileurl");

const fileContent = document.getElementById("file-content");

document.body.addEventListener("click", handleActions);
window.addEventListener("hashchange", handleHashChange);
handleHashChange();

function handleHashChange() {
  const dataUrl = location.hash.slice(1);
  dataUrl ? displayHash(dataUrl) : displayEmpty();
}

/**
 * @param {string} dataUrl
 */
async function displayHash(dataUrl) {
  const blob = await dataUrlToBlob(dataUrl);
  fileContent.textContent = await blob.text();
}

/**
 * @param {string} dataUrl
 * @returns {Promise<Blob>}
 */
async function dataUrlToBlob(dataUrl) {
  return fetch(dataUrl).then((res) => res.blob());
}

function displayEmpty() {
  fileContent.textContent = "No file selected";
}

/**
 * @param {MouseEvent} e
 */
async function handleActions(e) {
  const action = e.target?.closest?.("[data-action]")?.getAttribute("data-action");
  console.debug("action", action);
  if (action === "upload") {
    const [file] = await pickFiles();
    console.log(file);
    const fileDataUrl = await fileToDataUrl(file);
    location.hash = fileDataUrl;
  }
}

/**
 * @returns {Promise<FileList>}
 */
async function pickFiles() {
  return new Promise((resolve) => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";

    fileInput.addEventListener("change", (e) => {
      resolve(e.target.files);
    });

    fileInput.click();
  });
}

/**
 * @param {File} file
 * @returns {Promise<string>}
 */
async function fileToDataUrl(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target.result);
    };
    reader.readAsDataURL(file);
  });
}

/**
 * @param {string} dataUrl
 * @returns {string}
 */
function dataUrlToBase64(dataUrl) {
  return dataUrl.slice(dataUrl.indexOf("base64,") + 7);
}
