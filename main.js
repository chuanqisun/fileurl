const fileContent = document.getElementById("file-content");
const fileMetadata = document.getElementById("file-metadata");

document.body.addEventListener("click", handleActions);
window.addEventListener("hashchange", handleHashChange);
handleHashChange();

async function handleHashChange() {
  const hash = location.hash.slice(1);
  const { name, type, size, body } = searchParamsStringToDict(hash);

  const textContent = body ? await dataUrlToTextContent(body) : "No file selected";
  fileContent.textContent = textContent;
  fileMetadata.textContent = JSON.stringify({ name, type, size }, null, 2);
}

/**
 * @param {string} dataUrl
 */
async function dataUrlToTextContent(dataUrl) {
  const blob = await dataUrlToBlob(dataUrl);
  const decompressedBlob = await decompress(blob);
  return decompressedBlob.text();
}

/**
 * @param {string} dataUrl
 * @returns {Promise<Blob>}
 */
async function dataUrlToBlob(dataUrl) {
  return fetch(dataUrl).then((res) => res.blob());
}

/**
 * @param {MouseEvent} e
 */
async function handleActions(e) {
  const action = e.target?.closest?.("[data-action]")?.getAttribute("data-action");
  console.debug("action", action);
  if (action === "upload") {
    const [file] = await pickFiles();
    const { name, type, size } = file;
    const compressedFile = await compress(file);
    const body = await fileToDataUrl(compressedFile);
    location.hash = dictToSearchParamsString({ name, type, size, body });
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
 * @param {Record<string, string>} dict
 * @returns {string}
 */
function dictToSearchParamsString(dict) {
  const mutableDict = new URLSearchParams();
  const metaEntries = Object.entries(dict);
  metaEntries.forEach(([key, value]) => {
    mutableDict.set(key, value);
  });

  return mutableDict.toString();
}

/**
 * @param {string} str
 * @returns {Record<string, string>}
 */
function searchParamsStringToDict(str) {
  const searchParams = new URLSearchParams(str);
  return Object.fromEntries(searchParams.entries());
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

/**
 * @param {Blob} blob
 * @returns {Promise<Blob>}
 */
async function compress(blob) {
  const response = await new Response(blob.stream().pipeThrough(new CompressionStream("deflate")));
  return response.blob();
}

/**
 * @template {Blob} T
 * @param {T} blob
 * @returns {Promise<T>}
 */
async function decompress(blob) {
  const response = await new Response(blob.stream().pipeThrough(new DecompressionStream("deflate")));
  return response.blob();
}
