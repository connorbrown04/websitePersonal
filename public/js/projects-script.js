let imgDownloads = {optimizer: {href: "", name: ""}};

async function uploadFile() {
  const loadText = document.getElementById("loading-text");
  loadText.classList.remove("d-none");
  const uploadForm = document.querySelector("#optimizer-upload-form");
  let formData = new FormData(uploadForm); 
  if(!fileupload.files[0]) {
    loadText.innerText = "No File Provided";
    return;
  } else {
    loadText.innerText = "Optimizing...";
  }
  formData.append("fileuploadd", fileupload.files[0]);
  const res = await fetch('/upload', {
    method: "POST", 
    body: formData
  });
  
  let filename = "[placeholder]";
  for (var pair of res.headers.entries()) {
    if(pair[0] == "filename") {
      filename = pair[1];
    }
  }
  res.blob().then(data => {
    imgDownloads.optimizer.href = window.URL.createObjectURL(data);
    imgDownloads.optimizer.name = filename;
    document.querySelector("#download-button").classList.remove("d-none");
    loadText.innerText = "";
  });
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
      document.getElementById("qual-container").classList.add("d-none");
    } else {
      document.getElementById("qual-container").classList.remove("d-none");
    }
  }
}

function updateQual(val) {
  document.getElementById("qual-display").innerText = val;
}

