const video = document.getElementById("webcam");
const liveView = document.getElementById("liveView");
const demosSection = document.getElementById("demos");
const enableWebcamButton = document.getElementById("webcamButton");

var model = undefined;
var children = [];

cocoSsd.load().then((loadModel) => {
  model = loadModel;
  demosSection.classList.remove("invisible");
});

// Check if webcam access is supported.
const getUserMediaSupported = () => {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
};

// If webcam supported, add event listener to button for when user
// wants to activate it to call enableCam function which we will
// define in the next step.
if (getUserMediaSupported()) {
  enableWebcamButton.addEventListener("click", enableCam);
} else {
  console.warn("getUserMedia() is not supported by your browser");
}

// Enable the live webcam view and start classification.
const enableCam = (event) => {
  // Only continue if the COCO-SSD has finished loading.
  if (!model) {
    return;
  }

  // Hide the button once clicked.
  event.target.classList.add("removed");

  // getUsermedia parameters to force video but not audio.
  const constraints = {
    video: true,
  };

  // Activate the webcam stream.
  navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
    video.srcObject = stream;
    video.addEventListener("loadeddata", predictWebcam);
  });
};

// Placeholder function for next step.
const predictWebcam = () => {
  model.detect(video).then((predcitions) => {
    for (let i = 0; i < children.length; i++) {
      liveView.removeChild(children[i]);
    }

    children.splice(0);

    for (let n = 0; n < predcitions.length; n++) {
      if (predcitions[n].score > 0.66) {
        const p = document.createElement("p");
        p.innerText = `${predcitions[n].class} - with ${Math.round(
          parseFloat(predcitions[n].score) * 100
        )}% confidence`;

        p.style = `margin-left: ${predcitions[n].bbox[0]}px;
                            margin-top: ${predcitions[n].bbox[1] - 10}px;
                            width: ${predcitions[n].bbox[2] - 10}px;
                            top:0; left:0;`;

        const highlighter = document.createElement("div");
        highlighter.setAttribute("class", "highlighter");
        highlighter.style = `left: ${predcitions[n].bbox[0]}px;
                                    top: ${predcitions[n].bbox[1]}px;
                                    width: ${predcitions[n].bbox[2]}px;
                                    height: ${predcitions[n].bbox[3]}px;`;

        liveView.appendChild(highlighter);
        liveView.appendChild(p);
        children.push(highlighter);
        children.push(p);
      }
    }
    window.requestAnimationFrame(predictWebcam);
  });
};

demosSection.classList.remove("invisible");
