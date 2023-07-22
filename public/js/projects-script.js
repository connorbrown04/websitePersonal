let imgDownloads = {optimizer: {href: "", name: ""}};
let loadingTextElements = (() => {
  const elements = document.querySelectorAll(".loading-text");
  const values = {};
  for(let element of elements) {
    values[element] = "inactive";
  }
  return values;
})();


async function uploadFile() {
  const loadText = document.getElementById("opti-loading-text");
  const uploadForm = document.querySelector("#optimizer-upload-form");
  const uploadBtn = document.querySelector("#optimizer-upload");
  let formData = new FormData(uploadForm); 
  if(!fileupload.files[0]) {
    loadText.innerText = "No File Provided";
    return;
  }
  
  formData.append("fileuploadd", fileupload.files[0]);
  const resPromise = fetch('/upload', {
    method: "POST", 
    body: formData
  });
  loadingTextElements[loadText] = "active";

  uploadBtn.disabled = "disabled";

  resPromise.then((res) => {
    let filename = "[placeholder]";
    for (var pair of res.headers.entries()) {
      if(pair[0] == "filename") {
        filename = pair[1];
      }
    }
    res.blob().then(data => {
      imgDownloads.optimizer.href = window.URL.createObjectURL(data);
      imgDownloads.optimizer.name = filename;
      loadText.innerText = "";
      loadingTextElements[loadText] = "inactive"
      document.querySelector("#optimizer-download").classList.remove("d-none");
      uploadBtn.removeAttribute("disabled");
    });
  });

  dotAnimation(loadText, "Optimizing");
  
  
}

function downloadFile(project) {
  var a = document.createElement("a");
  a.href = imgDownloads[project].href;
  a.download = imgDownloads[project].name;
  a.click();
}

function updateOptions(elementID) {
  if(elementID == "conversion-type") {
    if(document.getElementById("conversion-type").value == "webp") {
      document.getElementById("loss-less").value = "lossy";
      document.getElementById("loss-less").onchange();
      document.getElementById("lossless").classList.add("d-none");
    } else {
      document.getElementById("lossless").classList.remove("d-none");
    }
  }
  if(elementID == "loss-less") {
    if(document.getElementById("loss-less").value == "lossless") {
      document.getElementById("qual-container").classList.add("invisible");
    } else {
      document.getElementById("qual-container").classList.remove("invisible");
    }
  }
}

function updateQual(val) {
  document.getElementById("qual-display").innerText = val;
}

async function dotAnimation(element, pretext) {
  dotAnimationRecur(element, pretext, 0);
}

function dotAnimationRecur(element, pretext, count) {
  if(loadingTextElements[element] == "inactive") {
    element.innerText = "";
    return;
  }
  element.innerText = pretext + ".".repeat(count);
  setTimeout(dotAnimationRecur, 500, element, pretext, (count + 1) % 4);
}



