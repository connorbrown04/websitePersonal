let imgHref = "";
let imgName = "";
let downloadActive = false;

async function uploadFile() {
  const uploadForm = document.querySelector("#upload-form");
  let formData = new FormData(uploadForm);
  if (!fileupload.files[0]) return;
  formData.append("fileuploadd", fileupload.files[0]);
  const res = await fetch('/upload', {
    method: "POST",
    body: formData
  });

  let filename = "[placeholder]";
  for (var pair of res.headers.entries()) {
    if (pair[0] == "filename") {
      filename = pair[1];
    }
  }
  res.blob().then(data => {
    imgHref = window.URL.createObjectURL(data);
    imgName = filename;
    downloadActive = true;
    document.querySelector("#download-button").classList.remove("hidden");
  });
}

function downloadFile() {
  var a = document.createElement("a");
  a.href = imgHref;
  a.download = imgName;
  a.click();
}

function updateOptions(elementID) {
  console.log(elementID);
  if (elementID == "conversion-type") {
    if (document.getElementById("conversion-type").value == "webp") {
      document.getElementById("loss-less").value = "lossy";
      document.getElementById("loss-less").onchange();
      document.getElementById("lossless").classList.add("hidden");
    } else {
      document.getElementById("lossless").classList.remove("hidden");
    }
  }
  if (elementID == "loss-less") {
    if (document.getElementById("loss-less").value == "lossless") {
      console.log("lossless selected")
      document.getElementById("qual").classList.add("hidden");
      document.getElementById("qual-label").classList.add("hidden");
    } else {
      document.getElementById("qual").classList.remove("hidden");
      document.getElementById("qual-label").classList.remove("hidden");
    }
  }
}

