let imgDownloads = {optimizer: {href: "", name: ""}};//stores the information for different file downloads on the page
//creates an object of all .loading-text elements with a corrisponding "inactive" tag, controls when a loading animation is playing on the page
let loadingTextElements = (() => {
  const elements = document.querySelectorAll(".loading-text");
  const values = {};
  for(let element of elements) {
    values[element] = "inactive";
  }
  return values;
})();


//uploads optimizer form and stores response file in imgDownloads
async function optimizer() {
  const loadText = document.getElementById("opti-loading-text");
  const uploadForm = document.querySelector("#optimizer-upload-form");
  const uploadBtn = document.querySelector("#optimizer-upload");

  //store form data
  let formData = new FormData(uploadForm); 
  //return if no file
  if(!fileupload.files[0]) {
    loadText.innerText = "No File Provided";
    return;
  }
  
  //TODO: figure out why I have to append file that should already be there
  formData.append("fileuploadd", fileupload.files[0]);
  //send request to server with formData
  const resPromise = fetch('/optimizer', {
    method: "POST", 
    body: formData
  });

  //start loading animation
  loadingTextElements[loadText] = "active";
  dotAnimation(loadText, "Optimizing");
  //disable upload btn
  uploadBtn.disabled = "disabled";

  //when response is recieved
  resPromise.then((res) => {
    let filename = "[placeholder]";
    //find and set filename
    for (var pair of res.headers.entries()) {
      if(pair[0] == "filename") {
        filename = pair[1];
      }
    }
    //convert to blob
    res.blob().then(data => {
      //extract url and name of image
      imgDownloads.optimizer.href = window.URL.createObjectURL(data);
      imgDownloads.optimizer.name = filename;
      //disable loading animation
      loadText.innerText = "";
      loadingTextElements[loadText] = "inactive"
      //unhide download btn and reenable upload button
      document.querySelector("#optimizer-download").classList.remove("d-none");
      uploadBtn.removeAttribute("disabled");
    });
  });

  
  
  
}

//create anchor with download information of specific project and click
function downloadFile(project) {
  var a = document.createElement("a");
  a.href = imgDownloads[project].href;
  a.download = imgDownloads[project].name;
  a.click();
}

//controls available options for optimizer form
function updateOptions(elementID) {
  if(elementID == "conversion-type") {
    if(document.getElementById("conversion-type").value == "webp") {
      document.getElementById("loss-less").value = "lossy";
      document.getElementById("loss-less").onchange();
    }
    document.getElementById("lossless").classList.toggle("d-none");
    return;
  }
  if(elementID == "loss-less") {
    document.getElementById("qual-container").classList.toggle("invisible");
  }
}

//updates quality number with change of slider
function updateQual(val) {
  document.getElementById("qual-display").innerText = val;
}

//wrapper function to play a trailing dot animation for loading text
async function dotAnimation(element, pretext) {
  dotAnimationRecur(element, pretext, 0);
}

//recursive timeout function that creates a 3 trailing dot aimation
function dotAnimationRecur(element, pretext, count) {
  if(loadingTextElements[element] == "inactive") {
    element.innerText = "";
    return;
  }
  element.innerText = pretext + ".".repeat(count);
  setTimeout(dotAnimationRecur, 500, element, pretext, (count + 1) % 4);
}



