// State management using a singleton pattern
class AppState {
  static instance = null;

  constructor() {
    if (AppState.instance) {
      return AppState.instance;
    }

    this.currentTool = null;
    this.currentColor = "#FF5252";
    this.isDrawing = false;
    this.lastX = 0;
    this.lastY = 0;
    this.startPoint = null;
    this.eraserMode = false;
    this.editMode = false;
    this.history = [];
    this.historyIndex = -1;
    this.polylinePoints = [];
    this.polylineLines = [];
    this.polylineAngles = [];

    AppState.instance = this;
  }

  static getInstance() {
    if (!AppState.instance) {
      AppState.instance = new AppState();
    }
    return AppState.instance;
  }
}

// Video player management
class VideoManager {
  constructor() {
    this.player1 = null;
    this.player2 = null;
    this.videoElement1 = document.querySelector("#video-player-1");
    this.imageElement = null; // Track the image element if mediaType is image
  }
  initializeMainPlayer() {
    const mediaType = localStorage.getItem("mediaType");
    const selectedMediaSrc = localStorage.getItem("selectedMediaSrc");
    console.log("Media Type:", mediaType);
    console.log("Selected Media Src:", selectedMediaSrc);
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get("userid");
    const videoUrl = urlParams.get("videourl");
    if (userId) {
      localStorage.setItem("userId", userId);
    }
    console.log("User ID:", userId);
    console.log("Video URL:", videoUrl);
    console.log("Current url:", window.location.href);

    // Check if the media is an image
    if (mediaType === "image" && selectedMediaSrc) {
      console.log("Got an image");
      this.loadImage(selectedMediaSrc); // Load the image
      localStorage.removeItem("selectedMediaSrc");
      return; // Exit early; no need to initialize the video player
    }

    // Initialize the video player only if the media type is video
    if (!this.videoElement1) {
      console.warn(
        "Video player 1 is not present in the DOM. Skipping video initialization."
      );
      return;
    }
    const self = this;

    // const self = this;
    // this.player1.ready(function() {
    //   self.initializePlaybackRateControls();
    // });

    this.player1 = videojs(
      "video-player-1",
      {
        controls: true,
        autoplay: "muted",
        playsinline: true,
        fluid: false,
        preload: "auto",
        responsive: true,
        fill: true,
        enableSmoothSeeking: true,
        nativeControlsForTouch: false,
        controlBar: {
          remainingTimeDisplay: false,
          autoHide: false,
          pictureInPictureToggle: false,
          // playbackRateMenuButton: true, // Add this line
          // playbackRateMenuButton: {
          //   // Add playback rate options
          //   playbackRates: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
          //   // Customize the button appearance
          //   className: "vjs-playback-rate",
          // },
        },
        userActions: { hotkeys: true },
        html5: {
          nativeVideoTracks: true,
          nativeAudioTracks: true,
          nativeTextTracks: false,
          nativeControlsForTouch: false,
        },
      },
      function onPlayerReady() {
        const player = this;

        try {
          // if (selectedMediaSrc) {
          if (videoUrl) {
            player.src({
              type: "video/mp4", // Ensure this matches the actual type of the video file
              src: videoUrl,
            });
            player.on("error", function () {
              console.error("Error loading video:", player.error());
              // Provide a fallback video
              self.showUploadMessage(player);
            });
            player.on("loadeddata", async () => {
              console.log("Video has loaded successfully");
              self.removeUploadMessage(player);
              await saveToLibrary(videoUrl, userId);
            });
          } else if (selectedMediaSrc) {
            self.removeUploadMessage(player);
            player.src({
              type: "video/mp4", // Ensure this matches the actual type of the video file
              src: selectedMediaSrc,
            });

            localStorage.removeItem("selectedMediaSrc");

            player.on("error", function () {
              console.error("Error loading video:", player.error());
              // Provide a fallback video
              self.showUploadMessage(player);
            });
          } else {
            // Default video source
            self.showUploadMessage(player);
          }
self.initializePlaybackRateControls();
          enhanceVideoScrubbing();

          player.dimensions(player.currentWidth(), player.currentHeight());
        } catch (error) {
          console.error("Error initializing video player:", error);
          self.showUploadMessage(player);
        }
      }
    );

    
  }

  loadImage(imageSrc) {
    const imgElement = document.createElement("img");
    imgElement.src = imageSrc;
    imgElement.alt = "Selected Image";
    imgElement.style.width = "100%";
    imgElement.style.height = "auto";

    // Replace the video element with the image
    if (this.videoElement1) {
      this.videoElement1.replaceWith(imgElement);
      this.videoElement1 = null; // Clear the reference to avoid future issues
    }

    console.log("Image loaded:", imageSrc);
  }

  initializeSecondPlayer() {
    const self = this;
    if (!this.player2) {
      this.player2 = videojs(
        "video-player-2",
        {
          controls: true,
          autoplay: "muted",
          playsinline: true,
          fluid: false,
          preload: "auto",
          responsive: true,
          fill: true,
          enableSmoothSeeking: true,
          controlBar: {
            remainingTimeDisplay: false,
            autoHide: false,
            pictureInPictureToggle: false,
            // playbackRateMenuButton: {
            //   playbackRates: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
            //   className: "vjs-playback-rate",
            // },
          },
          userActions: { hotkeys: true },
          html5: {
            nativeVideoTracks: true,
            nativeAudioTracks: true,
            nativeTextTracks: false,
            nativeControlsForTouch: false,
          },
        },
        function onPlayerReady() {
          const player = this;
          self.showUploadMessage(player);
          player.dimensions(player.currentWidth(), player.currentHeight());
          enhanceVideoScrubbing();
        }
      );

      this.videoElement2 = document.querySelector("#video-player-2");
    }
  }

  initializePlaybackRateControls() {
    // For player 1
    this.setupPlaybackRateControl(this.player1, "player1");

    // For player 2 if it exists
    if (this.player2) {
      this.setupPlaybackRateControl(this.player2, "player2");
    }
  }

  setupPlaybackRateControl(player, playerId) {
    if (!player) return;

    // Create custom playback rate button
    const playbackRateButton = document.createElement("button");
    playbackRateButton.className = "vjs-playback-rate vjs-control vjs-button";
    playbackRateButton.innerHTML = "1x";
    playbackRateButton.title = "Playback Rate";

    // Create dropdown menu
    const dropdown = document.createElement("div");
    dropdown.className = "vjs-playback-rate-menu vjs-menu";
    dropdown.innerHTML = `
      <ul class="vjs-menu-content">
        <li class="vjs-menu-item" data-rate="0.25">0.25x</li>
        <li class="vjs-menu-item" data-rate="0.5">0.5x</li>
        <li class="vjs-menu-item" data-rate="0.75">0.75x</li>
        <li class="vjs-menu-item vjs-selected" data-rate="1">1x</li>
        <li class="vjs-menu-item" data-rate="1.25">1.25x</li>
        <li class="vjs-menu-item" data-rate="1.5">1.5x</li>
        <li class="vjs-menu-item" data-rate="1.75">1.75x</li>
        <li class="vjs-menu-item" data-rate="2">2x</li>
      </ul>
    `;

    // Find the control bar and insert before the fullscreen button
    const controlBar = player.el().querySelector(".vjs-control-bar");
    const fullscreenButton = player
      .el()
      .querySelector(".vjs-fullscreen-control");

    if (controlBar && fullscreenButton) {
      controlBar.insertBefore(playbackRateButton, fullscreenButton);
      controlBar.appendChild(dropdown);

      // Add click event to toggle dropdown
      playbackRateButton.addEventListener("click", (e) => {
        e.stopPropagation();
        const isActive = dropdown.classList.contains("vjs-lock-showing");
        document.querySelectorAll(".vjs-playback-rate-menu").forEach((menu) => {
          menu.classList.remove("vjs-lock-showing");
        });
        if (!isActive) {
          dropdown.classList.add("vjs-lock-showing");
        }
      });

      // Add click events to rate options
      dropdown.querySelectorAll(".vjs-menu-item").forEach((item) => {
        item.addEventListener("click", (e) => {
          e.stopPropagation();
          const rate = parseFloat(item.getAttribute("data-rate"));
          player.playbackRate(rate);
          playbackRateButton.innerHTML = rate + "x";

          // Update selected state
          dropdown.querySelectorAll(".vjs-menu-item").forEach((i) => {
            i.classList.remove("vjs-selected");
          });
          item.classList.add("vjs-selected");

          dropdown.classList.remove("vjs-lock-showing");
        });
      });

      // Close dropdown when clicking outside
      document.addEventListener("click", () => {
        dropdown.classList.remove("vjs-lock-showing");
      });
    }
  }

  handleSplitScreen() {
    const secondWrapper = document.querySelector("#second-video-wrapper");
    if (secondWrapper.classList.contains("hidden")) {
      secondWrapper.classList.remove("hidden");
      this.initializeSecondPlayer();
      this.addFloatingUploadButtons();
    } else {
      secondWrapper.classList.add("hidden");
      if (this.player2) {
        this.player2.pause();
      }
      this.removeFloatingUploadButtons();
    }
    return true; // To trigger canvas update
  }

  updateDimensions() {
    if (this.player1) {
      this.player1.dimensions(
        this.player1.currentWidth(),
        this.player1.currentHeight()
      );
    }
    if (this.player2) {
      this.player2.dimensions(
        this.player2.currentWidth(),
        this.player2.currentHeight()
      );
    }
  }

  addFloatingUploadButtons() {
    this.removeFloatingUploadButtons();

    const player1Wrapper = document
      .querySelector("#video-player-1")
      .closest(".video-wrapper");
    const player2Wrapper = document
      .querySelector("#video-player-2")
      .closest(".video-wrapper");

    if (player1Wrapper) {
      const uploadIcon1 = document.createElement("div");
      uploadIcon1.innerHTML = this.getUploadSVG();
      uploadIcon1.classList.add("floating-upload-icon", "player1-upload");
      uploadIcon1.onclick = () => this.uploadVideo(1);
      player1Wrapper.appendChild(uploadIcon1);
    }

    if (player2Wrapper) {
      const uploadIcon2 = document.createElement("div");
      uploadIcon2.innerHTML = this.getUploadSVG();
      uploadIcon2.classList.add("floating-upload-icon", "player2-upload");
      uploadIcon2.onclick = () => this.uploadVideo(2);
      player2Wrapper.appendChild(uploadIcon2);
    }

    console.log("Upload icons added!"); // Debugging
  }

  removeFloatingUploadButtons() {
    document
      .querySelectorAll(".floating-upload-icon")
      .forEach((icon) => icon.remove());
  }

  getUploadSVG() {
    return `
            <svg width="25" height="25" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                 <title>Change video</title>
                <circle cx="12" cy="12" r="10" fill="white"/>
                <path d="M12 16V8M8 12L12 8L16 12" stroke="blue" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
  }
  uploadVideo(playerNumber) {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get("userid");

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "video/*";
    input.onchange = async (event) => {
      const file = event.target.files[0];
      if (file) {
        const url = URL.createObjectURL(file);
        if (playerNumber === 1 && this.player1) {
          this.player1.src({ type: "video/mp4", src: url });
          this.removeUploadMessage(this.player1);

          this.player1.on("loadeddata", async () => {
            console.log("Player 1 video loaded via upload");
            await saveToLibrary(url, userId);
          });

          this.player1.play();
        }
        if (playerNumber === 2 && this.player2) {
          this.removeUploadMessage(this.player2);
          this.player2.src({ type: "video/mp4", src: url });
          console.log("Url: ", url);
          this.player2.on("loadeddata", async () => {
            console.log("Player 2 video loaded via upload");
            await saveToLibrary(url, userId);
          });
          this.player2.play();
          // await saveToLibrary(url, userId);
        }
      }
    };
    input.click();
  }
  showUploadMessage(player) {
    // Clear any existing source
    player.src("");

    // Determine which player this is (1 or 2)
    const playerNumber = player === this.player1 ? 1 : 2;

    // Create a div with the upload message
    const messageDiv = document.createElement("div");
    messageDiv.className = "vjs-upload-message";
    messageDiv.innerHTML = `
            <div style="
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                background-color: rgba(0, 0, 0, 0.7);
                color: white;
                text-align: center;
                padding: 20px;
                z-index: 2;
                cursor: pointer;
            ">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <h3 style="margin-top: 15px; font-size: 18px;">Please upload a video in library to start analyzing</h3>
                <p style="margin-top: 10px; font-size: 14px;">No video found. Upload your swing to begin the analysis.</p>
            </div>
        `;

    // Find the player container and append the message
    const playerEl = player.el();

    // Remove any existing message first
    this.removeUploadMessage(player);

    playerEl.appendChild(messageDiv);

    // Add click event listener to the message div
    messageDiv.addEventListener("click", () => {
      this.uploadVideo(playerNumber);
    });
  }
  removeUploadMessage(player) {
    if (!player) return;

    const playerEl = player.el();
    if (!playerEl) return;

    // Remove any existing message
    const existingMessage = playerEl.querySelector(".vjs-upload-message");
    if (existingMessage) {
      existingMessage.remove();
    }
  }
}

// Drawing tools and canvas management
class DrawingManager {
  constructor() {
    this.canvas = new fabric.Canvas("annotation-canvas", {
      width: window.innerWidth,
      height: window.innerHeight,
      selection: true,
      preserveObjectStacking: true,
    });

    console.log("Canvas object:", this.canvas);

    this.state = AppState.getInstance();
    this.initializeEventListeners();
    this.initializeDebugListeners();
    this.setupClickThrough();
  }

  initializeEventListeners() {
    this.canvas.on("object:added", () => this.saveState());
    this.canvas.on("object:modified", () => this.saveState());
    this.canvas.on("object:removed", () => this.saveState());

    // Prevent object duplication
    this.canvas.on("object:selected", (e) => {
      // Ensure only one object is selected at a time
      if (this.canvas.getActiveObjects().length > 1) {
        this.canvas.discardActiveObject();
        this.canvas.setActiveObject(e.target);
      }
    });

    this.canvas.on("selection:cleared", () => {
      // Clear any pending operations but DON'T disable edit mode
      this.canvas.discardActiveObject();
    });

    // Remove the general mouse:down listener that was interfering
    // this.canvas.on("mouse:down", (e) => {
    //   console.log("Canvas mouse down:", e);
    //   // Prevent multiple selections
    //   if (this.canvas.getActiveObjects().length > 0) {
    //     this.canvas.discardActiveObject();
    //   }
    // });
  }

  initializeDebugListeners() {
    document.body.addEventListener("click", (e) => {
      console.log("Body clicked", e.target);
    });

    const videoContainer = document.querySelector(".video-container");
    videoContainer.addEventListener("click", (e) => {
      console.log("Video container clicked", e.target);
    });

    const upperCanvas = this.canvas.upperCanvasEl;
    upperCanvas.addEventListener("click", (e) => {
      console.log("Upper canvas clicked", e.target);
    });

    document.querySelectorAll(".video-js").forEach((video) => {
      video.addEventListener("click", (e) => {
        console.log("Video element clicked", e.target);
      });
    });
  }

  updateDimensions() {
    const containerRect = document
      .querySelector(".video-container")
      .getBoundingClientRect();
    this.canvas.setWidth(containerRect.width);
    this.canvas.setHeight(containerRect.height);
    this.canvas.renderAll();
  }

  initializeFreeDrawing() {
    this.canvas.isDrawingMode = true;
    this.canvas.freeDrawingBrush.width = 2;
    this.canvas.freeDrawingBrush.color = this.state.currentColor;
  }

  // initializeEraser() {
  //     this.state.eraserMode = true;
  //     this.canvas.isDrawingMode = false;
  //     this.canvas.selection = false;
  //     this.canvas.hoverCursor = 'crosshair';
  //     this.canvas.defaultCursor = 'crosshair';

  //     this.canvas.on('mouse:down', (options) => {
  //         if (!this.state.eraserMode) return;

  //         const pointer = this.canvas.getPointer(options.e);
  //         const objects = this.canvas.getObjects();

  //         for (let i = objects.length - 1; i >= 0; i--) {
  //             const object = objects[i];
  //             if (object.containsPoint(pointer)) {
  //                 this.canvas.remove(object);
  //                 this.canvas.renderAll();
  //                 break;
  //             }
  //         }
  //     });
  // }
  initializeEraser() {
    this.state.eraserMode = true;
    this.canvas.isDrawingMode = false;
    this.canvas.selection = false;
    this.canvas.hoverCursor = "crosshair";
    this.canvas.defaultCursor = "crosshair";

    this.canvas.on("mouse:down", (options) => {
      if (!this.state.eraserMode) return;

      const pointer = this.canvas.getPointer(options.e);
      const objects = this.canvas.getObjects();

      for (let i = objects.length - 1; i >= 0; i--) {
        const object = objects[i];

        if (object.containsPoint(pointer)) {
          // Check if the object is a polyline
          const lineIndex = this.state.polylineLines.indexOf(object);
          if (lineIndex !== -1) {
            // Remove the line
            this.state.polylineLines.splice(lineIndex, 1);

            // If it was part of an angle, remove the corresponding angle text
            if (lineIndex < this.state.polylineAngles.length) {
              const angleText = this.state.polylineAngles[lineIndex];
              this.canvas.remove(angleText);
              this.state.polylineAngles.splice(lineIndex, 1);
            }
          }

          // Remove the object from canvas
          this.canvas.remove(object);
          this.canvas.renderAll();
          break;
        }
      }
    });
  }

  initializeEditMode() {
    this.disableDrawing();
    const canvasContainer = this.canvas.wrapperEl;
    const upperCanvas = this.canvas.upperCanvasEl;
    canvasContainer.classList.add("drawing-mode");
    upperCanvas.classList.add("drawing-mode");

    this.canvas.selection = true;
    this.canvas.hoverCursor = "move";

    // Clear any existing event listeners to prevent duplicates
    this.canvas.off("object:scaling");
    this.canvas.off("object:moving");
    this.canvas.off("object:rotating");
    this.canvas.off("mouse:down"); // Clear previous mouse down events

    // Make ALL objects editable
    this.canvas.getObjects().forEach((obj) => {
      obj.selectable = true;
      obj.hasControls = true;
      obj.hasBorders = true;
      obj.setControlsVisibility({
        mt: true, // middle top
        mb: true, // middle bottom
        ml: true, // middle left
        mr: true, // middle right
        bl: true, // bottom left
        br: true, // bottom right
        tl: true, // top left
        tr: true, // top right
        mtr: true, // rotate
      });

      if (obj instanceof fabric.IText) {
        obj.editable = true;
      }
    });

    // Prevent object duplication during transformations
    this.canvas.on("object:scaling", (e) => {
      e.target.setCoords(); // Update coordinates
    });

    this.canvas.on("object:moving", (e) => {
      e.target.setCoords(); // Update coordinates
    });

    this.canvas.on("object:rotating", (e) => {
      e.target.setCoords(); // Update coordinates
    });

    // IMPORTANT: Handle empty space clicks without disabling edit mode
    this.canvas.on("mouse:down", (options) => {
      // If clicking on empty space, just clear selection but stay in edit mode
      if (!options.target) {
        this.canvas.discardActiveObject();
        this.canvas.renderAll();
        // Don't disable edit mode - just clear selection
        return;
      }
    });

    this.canvas.renderAll();
  }

  disableEditMode() {
    // Only disable edit mode when explicitly called (like clicking edit button)
    const canvasContainer = this.canvas.wrapperEl;
    const upperCanvas = this.canvas.upperCanvasEl;
    canvasContainer.classList.remove("drawing-mode");
    upperCanvas.classList.remove("drawing-mode");

    this.canvas.selection = false;
    this.canvas.hoverCursor = "default";

    // Clear edit mode specific events
    this.canvas.off("mouse:down");

    this.canvas.getObjects().forEach((obj) => {
      obj.selectable = false;
      obj.setControlsVisibility({
        mt: false,
        mb: false,
        ml: false,
        mr: false,
        bl: false,
        br: false,
        tl: false,
        tr: false,
        mtr: false,
      });

      if (obj instanceof fabric.IText) {
        obj.editable = false;
      }
    });

    this.canvas.renderAll();
  }
  Gotolibrary() {
    console.log("Go to Library!");
    localStorage.setItem("currentUrl", window.location.href);
    console.log(
      "CURRENT URL:",
      localStorage.getItem("currentUrl", window.location.href)
    );
    // window.location.href = 'pages/library.html';
  }
  initializePolyline() {
    this.state.polylinePoints = [];
    this.state.polylineLines = [];
    this.state.polylineAngles = [];

    this.canvas.on("mouse:down", (evt) => {
      const pointer = this.canvas.getPointer(evt.e);
      const currentPoint = { x: pointer.x, y: pointer.y };

      this.state.polylinePoints.push(currentPoint);

      if (this.state.polylinePoints.length >= 2) {
        const prevPoint =
          this.state.polylinePoints[this.state.polylinePoints.length - 2];
        const line = new fabric.Line(
          [prevPoint.x, prevPoint.y, currentPoint.x, currentPoint.y],
          {
            stroke: this.state.currentColor,
            strokeWidth: 2,
          }
        );
        this.canvas.add(line);
        this.state.polylineLines.push(line);

        if (this.state.polylinePoints.length >= 3) {
          const points = this.state.polylinePoints;
          const lastThreePoints = points.slice(-3);
          const angle = this.calculateAngle(
            lastThreePoints[0],
            lastThreePoints[1],
            lastThreePoints[2]
          );

          const midPoint = lastThreePoints[1];
          const angleText = new fabric.Text(`${angle.toFixed(1)}°`, {
            left: midPoint.x,
            top: midPoint.y,
            fontSize: 16,
            fill: this.state.currentColor,
            selectable: false,
          });
          this.canvas.add(angleText);
          this.state.polylineAngles.push(angleText);
        }
      }

      this.canvas.renderAll();
    });
  }
  initializeShape() {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.style.display = "none";

    fileInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imgSrc = e.target.result;
          this.addShape("image", null, { src: imgSrc });
        };
        reader.readAsDataURL(file);
      }
    });

    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
  }

  calculateAngle(point1, point2, point3) {
    const vector1 = {
      x: point1.x - point2.x,
      y: point1.y - point2.y,
    };
    const vector2 = {
      x: point3.x - point2.x,
      y: point3.y - point2.y,
    };

    const dotProduct = vector1.x * vector2.x + vector1.y * vector2.y;
    const magnitude1 = Math.sqrt(vector1.x * vector1.x + vector1.y * vector1.y);
    const magnitude2 = Math.sqrt(vector2.x * vector2.x + vector2.y * vector2.y);

    let angle = Math.acos(dotProduct / (magnitude1 * magnitude2));
    angle = (angle * 180) / Math.PI;

    return angle;
  }
  toggleFullScreen() {
    const fullscreenBtn = document.querySelector(".tool-btn .fullscreen");

    // Check if the button is active (i.e., it has the 'active' class)
    const isActive =
      fullscreenBtn && fullscreenBtn.classList.contains("active");
    console.log(isActive); //console.log(fullscreenBtn.classList.contains('active'));
    // If not in full-screen and button is not active, enter full-screen
    if (!document.fullscreenElement) {
      console.log("Entering full screen mode.");
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.mozRequestFullScreen) {
        // Firefox
        document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        // Chrome, Safari, and Opera
        document.documentElement.webkitRequestFullscreen();
      } else if (document.documentElement.msRequestFullscreen) {
        // IE/Edge
        document.documentElement.msRequestFullscreen();
      }
      // Set the button as active
      //fullscreenBtn.classList.add('active');
    }

    // If already in full-screen or the button is active, exit full-screen
    // else if (document.fullscreenElement || isActive) {
    //     console.log("Exiting full screen mode.");
    //     if (document.exitFullscreen) {
    //         document.exitFullscreen();
    //     } else if (document.mozCancelFullScreen) { // Firefox
    //         document.mozCancelFullScreen();
    //     } else if (document.webkitExitFullscreen) { // Chrome, Safari, and Opera
    //         document.webkitExitFullscreen();
    //     } else if (document.msExitFullscreen) { // IE/Edge
    //         document.msExitFullscreen();
    //     }
    //     // Remove the active class from the button when exiting fullscreen
    //     fullscreenBtn.classList.remove('active');
    // }
  }

  addShape(shapeType, e, options = {}) {
    console.log("h TEST");
    let shape;
    const pointer = e ? this.canvas.getPointer(e.e) : { x: 100, y: 100 };
    const defaultOptions = {
      fontFamily: "Poppins",
      left: pointer.x,
      top: pointer.y,
      fill: "transparent",
      stroke: this.state.currentColor,
      strokeWidth: 2,
      selectable: true, // Make it selectable by default
      hasControls: true, // Enable controls for resizing
    };

    const finalOptions = { ...defaultOptions, ...options };

    switch (shapeType) {
      case "rectangle":
        shape = new fabric.Rect({
          ...finalOptions,
          width: 100,
          height: 100,
        });
        break;
      case "circle":
        shape = new fabric.Circle({
          ...finalOptions,
          radius: 50,
        });
        break;
      case "triangle":
        shape = new fabric.Triangle({
          ...finalOptions,
          width: 100,
          height: 100,
        });
        break;
      case "line":
        shape = new fabric.Line(
          [pointer.x, pointer.y, pointer.x + 100, pointer.y + 100],
          {
            stroke: this.state.currentColor,
            strokeWidth: 2,
            selectable: true,
            hasControls: true,
          }
        );
        break;
      case "text":
        shape = new fabric.IText("Type here", {
          ...finalOptions,
          fontFamily: "Poppins",
          fontWeight: "14",
          fontSize: 17,
          fill: this.state.currentColor,
          editable: true, // Make text editable
        });
        break;
      case "image":
        // Add image to the canvas
        fabric.Image.fromURL(options.src, (img) => {
          img.set({
            left: pointer.x,
            top: pointer.y,
            scaleX: 0.5,
            scaleY: 0.5,
            selectable: true,
            hasControls: true,
          });
          this.canvas.add(img);
          this.canvas.setActiveObject(img);
          this.canvas.renderAll();
          // Activate edit mode after placing image
          this.activateEditModeAfterShape();
        });
        return; // Return early for images
    }

    if (shape) {
      this.canvas.add(shape);
      this.canvas.setActiveObject(shape);
      this.canvas.renderAll();

      // Activate edit mode for all shapes after placing this shape
      this.activateEditModeAfterShape();
    }
  }

  // Add this new method to activate edit mode after shape placement
  activateEditModeAfterShape() {
    console.log("Activating edit mode after shape placement");

    // Deactivate all tool buttons
    const tools = document.querySelectorAll(".toolbar .tool-btn");
    tools.forEach((tool) => tool.classList.remove("active"));

    // Activate the edit mode button
    const editModeBtn = document.querySelector(".secondary-btn.edit-mode");
    if (editModeBtn) {
      editModeBtn.classList.add("active");
    }

    // Set edit mode state
    this.state.editMode = true;

    // Initialize edit mode for all objects
    this.initializeEditMode();

    // Enable click-through for video controls
    this.enableClickThrough();
  }

  // Add this new method to enable shape editing
  enableShapeEditing(shape) {
    shape.set({
      selectable: true,
      hasControls: true,
      hasBorders: true,
      lockRotation: false,
      lockScalingX: false,
      lockScalingY: false,
    });

    // Enable controls for the shape
    shape.setControlsVisibility({
      mt: true, // middle top
      mb: true, // middle bottom
      ml: true, // middle left
      mr: true, // middle right
      bl: true, // bottom left
      br: true, // bottom right
      tl: true, // top left
      tr: true, // top right
      mtr: true, // rotate
    });

    this.canvas.setActiveObject(shape);
    this.canvas.renderAll();
  }

  // Add this method to disable the active tool
  // Add this method to disable the active tool
  disableActiveTool() {
    const tools = document.querySelectorAll(".toolbar .tool-btn");
    const canvasContainer = this.canvas.wrapperEl;
    const upperCanvas = this.canvas.upperCanvasEl;

    // Remove active class from all tools
    tools.forEach((tool) => tool.classList.remove("active"));

    // Remove drawing mode styles
    canvasContainer.classList.remove("drawing-mode");
    upperCanvas.classList.remove("drawing-mode");
    upperCanvas.style.cursor = "default";

    // Enable click-through for video controls
    this.enableClickThrough();

    // Disable drawing and cleanup events
    this.disableDrawing();
    this.cleanupToolEvents();
  }

  disableDrawing() {
    this.state.eraserMode = false;
    this.state.isDrawing = false;
    this.state.lastX = 0;
    this.state.lastY = 0;
    this.state.startPoint = null;
    this.canvas.isDrawingMode = false;
    this.canvas.selection = true; // Keep selection enabled for shape editing
    this.canvas.hoverCursor = "default";
    this.canvas.defaultCursor = "default";
    this.cleanupToolEvents();

    // But keep objects editable
    this.canvas.getObjects().forEach((obj) => {
      if (obj instanceof fabric.IText) {
        obj.editable = false; // Disable text editing when tool is disabled
      }
    });
  }

  cleanupToolEvents() {
    this.state.eraserMode = false;
    this.state.isDrawing = false;
    this.state.lastX = 0;
    this.state.lastY = 0;
    this.state.startPoint = null;

    // Clear tool-specific mouse events but keep object interactions
    // Don't clear mouse:down if we're in edit mode
    if (!this.state.editMode) {
      this.canvas.off("mouse:down");
    }
    this.canvas.off("mouse:move");
    this.canvas.off("mouse:up");

    // Clear object transformation events
    this.canvas.off("object:scaling");
    this.canvas.off("object:moving");
    this.canvas.off("object:rotating");
    this.canvas.off("object:modified");

    this.canvas.isDrawingMode = false;

    // Keep selection enabled if in edit mode
    this.canvas.selection = this.state.editMode ? true : false;

    this.canvas.hoverCursor = "default";
    this.canvas.defaultCursor = "default";
  }

  setupClickThrough() {
    // Allow clicks to pass through to video when not in drawing mode AND not in edit mode
    this.canvas.on("mouse:down", (options) => {
      const target = options.target;

      // If no object is clicked and we're not in active drawing mode or edit mode,
      // let the event pass through to the video
      if (
        !target &&
        !this.canvas.isDrawingMode &&
        !this.state.eraserMode &&
        !this.state.editMode && // Don't pass through in edit mode
        this.state.currentTool === null
      ) {
        // Simulate click on video element
        this.passClickToVideo(options.e);
        return;
      }
    });

    // Also handle mouse up to ensure video controls work
    this.canvas.on("mouse:up", (options) => {
      if (
        !options.target &&
        !this.canvas.isDrawingMode &&
        !this.state.eraserMode &&
        !this.state.editMode // Don't pass through in edit mode
      ) {
        this.passClickToVideo(options.e);
      }
    });
  }

  passClickToVideo(originalEvent) {
    // Find the video element underneath
    const videoElement = document.querySelector("video");
    if (!videoElement) return;

    // Create a new click event at the same coordinates
    const rect = videoElement.getBoundingClientRect();
    const clickEvent = new MouseEvent("click", {
      clientX: originalEvent.clientX,
      clientY: originalEvent.clientY,
      bubbles: true,
      cancelable: true,
    });

    // Dispatch the event to the video element
    videoElement.dispatchEvent(clickEvent);

    // Also try the video.js control bar
    const controlBar = document.querySelector(".vjs-control-bar");
    if (controlBar) {
      controlBar.dispatchEvent(clickEvent);
    }
  }

  enableClickThrough() {
    const upperCanvas = this.canvas.upperCanvasEl;
    if (upperCanvas) {
      upperCanvas.style.pointerEvents = "none";
    }
  }

  disableClickThrough() {
    const upperCanvas = this.canvas.upperCanvasEl;
    if (upperCanvas) {
      upperCanvas.style.pointerEvents = "auto";
    }
  }

  saveState() {
    this.state.historyIndex++;
    this.state.history[this.state.historyIndex] = JSON.stringify(this.canvas);
    this.state.history.length = this.state.historyIndex + 1;
  }

  undo() {
    if (this.state.historyIndex > 0) {
      this.state.historyIndex--;
      this.loadState();
    }
  }

  redo() {
    if (this.state.historyIndex < this.state.history.length - 1) {
      this.state.historyIndex++;
      this.loadState();
    }
  }

  loadState() {
    this.canvas.loadFromJSON(
      this.state.history[this.state.historyIndex],
      () => {
        this.canvas.renderAll();
      }
    );
  }

  clearCanvas() {
    this.canvas.clear();
    this.saveState();
  }

  setColor(color) {
    this.state.currentColor = color;
    if (this.canvas.isDrawingMode) {
      this.canvas.freeDrawingBrush.color = color;
    }
  }
}

// Main application class
class DrawingApp {
  constructor() {
    this.state = AppState.getInstance();
    this.videoManager = new VideoManager();
    this.drawingManager = new DrawingManager();

    this.initializeApp();
  }

  initializeApp() {
    this.videoManager.initializeMainPlayer();
    this.setupEventListeners();
    this.drawingManager.updateDimensions(); // Initial update
    this.drawingManager.saveState(); // Save initial state

    //  setTimeout(() => {
    //   this.videoManager.initializePlaybackRateControls();
    // }, 1000);
    // Video event listener for dimensions
    if (this.videoManager.player1) {
      this.videoManager.player1.on("loadedmetadata", () => {
        this.drawingManager.updateDimensions();
      });
    }
    // Window resize handler
    window.addEventListener("resize", () => {
      this.videoManager.updateDimensions();
      this.drawingManager.updateDimensions();
      if (this.drawingManager.canvas) {
        this.drawingManager.canvas.setWidth(window.innerWidth);
        this.drawingManager.canvas.setHeight(window.innerHeight);
        this.drawingManager.canvas.renderAll();
      }
    });
  }

  setupEventListeners() {
    document.addEventListener("DOMContentLoaded", function () {
      const selectedMediaSrc = localStorage.getItem("selectedMediaSrc");
      const mediaType = localStorage.getItem("mediaType");
      console.log("Media type: ", mediaType); // Get the type of media
      const editMode = localStorage.getItem("editMode");

      if (editMode === "true" && selectedMediaSrc && mediaType) {
        if (mediaType === "image") {
          // Handle image loading
          const imgElement = document.createElement("img");
          imgElement.src = selectedMediaSrc;
          imgElement.alt = "Selected Image";
          imgElement.style.width = "100%"; // Adjust size as needed
          imgElement.style.height = "auto";

          // Replace the video player with the image
          const videoPlayer1 = document.getElementById("video-player-1");
          const videoWrapper1 = videoPlayer1.parentNode;
          videoWrapper1.replaceWith(imgElement);
        } else if (mediaType === "video") {
          // Handle video loading
          const videoPlayer1 = document.getElementById("video-player-1");
          const videoWrapper2 = document.getElementById("second-video-wrapper");

          // Set the video source
          videoPlayer1.src = selectedMediaSrc;
          videoPlayer1.classList.remove("hidden"); // Ensure it's visible
          videoWrapper2.classList.add("hidden"); // Hide the second video wrapper
          videoPlayer1.load(); // Load the video source
          videoPlayer1.play(); // Auto-play if desired
        }
      }

      // Clear editMode flag after loading the media
      localStorage.setItem("editMode", "false");
    });

    // Tool selection
    document.querySelectorAll(".toolbar .tool-btn").forEach((tool) => {
      tool.addEventListener("click", () => this.handleToolSelection(tool));
    });

    // Edit mode
    // In your setupEventListeners method, update the edit mode button:
    const editModeBtn = document.querySelector(".secondary-btn.edit-mode");
    if (editModeBtn) {
      editModeBtn.addEventListener("click", (e) => {
        if (this.state.editMode) {
          // Exit edit mode
          editModeBtn.classList.remove("active");
          this.drawingManager.disableEditMode();
          this.state.editMode = false;

          // Clear any active selection
          this.drawingManager.canvas.discardActiveObject();
          this.drawingManager.canvas.renderAll();
        } else {
          // Enter edit mode
          editModeBtn.classList.add("active");
          this.drawingManager.initializeEditMode();
          this.state.editMode = true;

          // Deactivate any other active tools
          document.querySelectorAll(".toolbar .tool-btn").forEach((tool) => {
            tool.classList.remove("active");
          });

          // Clear any drawing modes
          this.drawingManager.disableDrawing();
        }
      });
    }

    const libBtn = document.querySelector(".secondary-btn.library");
    if (libBtn) {
      libBtn.addEventListener("click", () => {
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get("userid");

        // if (userId) {
        //     console.log("Extracted User ID:", userId);
        // }
        localStorage.setItem("currentUrl", window.location.href);
        console.log(
          "CURRENT URL:",
          localStorage.getItem("currentUrl", window.location.href)
        );
        if (userId) {
          // Navigate to library page with userid
          window.location.href = `pages/library.html?userid=${userId}`;
        } else {
          // Navigate normally if userid is not found
          window.location.href = "pages/library.html";
        }

        //     window.location.href = 'pages/library.html';
      });
    }

    let mediaRecorder;
    const apirecUrl = CONFIG.API_REC_URL;
    let stream;
    const displayMediaOptions = {
      video: {
        displaySurface: "browser",
        logicalSurface: true,
      },
      audio: {
        suppressLocalAudioPlayback: false,
      },
      preferCurrentTab: true,
      selfBrowserSurface: "include",
      systemAudio: "include",
      surfaceSwitching: "include",
      monitorTypeSurfaces: "include",
    };
    let recordedChunks = [];
    const recordButton = document.getElementById("recordButton");
    const downloadLink = document.getElementById("downloadLink");

    recordButton.addEventListener("click", async () => {
      if (mediaRecorder && mediaRecorder.state === "recording") {
        // Stop recording
        mediaRecorder.stop();
        recordButton.title = "Screen Record";
        return;
      }

      try {
        // Reset recorded chunks
        recordedChunks = [];

        // Request microphone access FIRST
        let micStream;
        try {
          console.log("Requesting microphone access...");
          micStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
            video: false,
          });
          console.log("Microphone access granted");
        } catch (micError) {
          console.error("Could not access microphone:", micError);
          alert(
            "Microphone access was denied. Recording will continue without mic audio."
          );
          micStream = null;
        }

        // THEN request screen capture using your original options
        console.log("Requesting screen capture...");
        const displayStream = await navigator.mediaDevices.getDisplayMedia(
          displayMediaOptions
        );

        console.log(
          "Screen capture granted:",
          displayStream.getVideoTracks().length,
          "video tracks,",
          displayStream.getAudioTracks().length,
          "audio tracks"
        );

        // Combine the streams
        let combinedStream;
        const isSafari = /^((?!chrome|android).)*safari/i.test(
          navigator.userAgent
        );

        if (micStream) {
          // For Chrome/Firefox - use WebAudio API for mixing
          const ctx = new AudioContext();

          // Create a destination for our combined audio
          const dest = ctx.createMediaStreamDestination();

          // Add display audio to the mix if it exists
          if (displayStream.getAudioTracks().length > 0) {
            const displaySource = ctx.createMediaStreamSource(
              new MediaStream([displayStream.getAudioTracks()[0]])
            );
            displaySource.connect(dest);
            console.log("Added system audio to the mix");
          }

          // Add microphone audio to the mix
          if (micStream.getAudioTracks().length > 0) {
            const micSource = ctx.createMediaStreamSource(
              new MediaStream([micStream.getAudioTracks()[0]])
            );
            micSource.connect(dest);
            console.log("Added microphone audio to the mix");
          }

          // Create a new stream with display video and our mixed audio
          const videoTrack = displayStream.getVideoTracks()[0];
          combinedStream = new MediaStream([
            videoTrack,
            ...dest.stream.getTracks(),
          ]);

          console.log("Created combined stream with mixed audio");
        } else {
          combinedStream = displayStream;
          console.log("Using only display stream (no microphone)");
        }

        // Set up MediaRecorder with appropriate MIME type
        const mimeType = "video/webm";

        // Create MediaRecorder with the combined stream
        const options = {
          mimeType,
          audioBitsPerSecond: 128000,
          videoBitsPerSecond: 2500000,
        };

        mediaRecorder = new MediaRecorder(combinedStream, options);

        // Listen for dataavailable event
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunks.push(event.data);
          }
        };

        // Stop event: Save the video file
        mediaRecorder.onstop = async () => {
          const blob = new Blob(recordedChunks, { type: "video/webm" });

          // Create a URL for the blob
          const url = URL.createObjectURL(blob);

          // Create and trigger download automatically
          const downloadLink = document.createElement("a");
          downloadLink.href = url;
          downloadLink.download = "screen-recording.webm";
          document.body.appendChild(downloadLink);
          downloadLink.click();

          // Clean up
          setTimeout(() => {
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(url);
          }, 100);

          recordedChunks = []; // Reset for future recordings
          await uploadRecording(blob); // Call the upload function

          // Stop all tracks from both streams
          displayStream.getTracks().forEach((track) => track.stop());
          if (micStream) {
            micStream.getTracks().forEach((track) => track.stop());
          }
        };

        // Start recording
        mediaRecorder.start(1000); // Create a new chunk every second
        recordButton.title = "Stop Recording";

        // Handle stopping stream after recording
        displayStream.getVideoTracks()[0].onended = () => {
          if (mediaRecorder && mediaRecorder.state === "recording") {
            mediaRecorder.stop();
          }
        };
      } catch (err) {
        console.error("Error during recording setup:", err);
        alert("Could not start recording: " + err.message);
      }
    });

    async function uploadRecording(blob) {
      const urlParams = new URLSearchParams(window.location.search);
      var userId = urlParams.get("userid");
      let saved_userId = localStorage.getItem("userId");

      if (!userId && !saved_userId) {
        console.error("User ID not found in URL.");
        return;
      }
      userId = userId || saved_userId;

      console.log("Uploading recording...");

      const formData = new FormData();
      formData.append("video", blob, "screen-recording.webm");

      try {
        const response = await fetch(`${apirecUrl}/recordings/${userId}`, {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          console.log("Recording uploaded successfully.");
        } else {
          const errorData = await response.json();
          console.error("Error uploading recording:", errorData);
        }
      } catch (uploadError) {
        console.error("Error during upload:", uploadError);
      }
    }
    // document.addEventListener("touchmove", function (event) {
    //     event.preventDefault();
    // }, { passive: false });

    // canvas.on('path:created', function (e) {
    //     e.path.selectable = false; // Ensure strokes remain
    //     canvas.renderAll(); // Force rendering after drawing
    // });

    // canvas.on('path:created', function (e) {
    //     e.path.set({ selectable: false, evented: false });
    //     canvas.add(e.path); // Ensure path is added properly
    //     canvas.renderAll();
    // });

    // Other UI controls
    const clearAllBtn = document.querySelector(".tool-btn.clear-all");
    if (clearAllBtn) {
      clearAllBtn.addEventListener("click", () =>
        this.drawingManager.clearCanvas()
      );
    }

    const mobileClearBtn = document.querySelector(".mobile-clear-btn");
    if (mobileClearBtn) {
      mobileClearBtn.addEventListener("click", () =>
        this.drawingManager.clearCanvas()
      );
    }

    const colorPickerBtn = document.querySelector(".tool-btn.color-picker");
    if (colorPickerBtn) {
      colorPickerBtn.addEventListener("click", () => this.handleColorPicker());
    }

    const splitScreenBtn = document.querySelector(".split-screen");
    if (splitScreenBtn) {
      splitScreenBtn.addEventListener("click", () => {
        if (this.videoManager.handleSplitScreen()) {
          this.drawingManager.updateDimensions();
        }
      });
    }

    // const fullscreenBtn = document.querySelector('.tool-btn .fullscreen');
    // if(fullscreenBtn){
    //     fullscreenBtn.addEventListener('click', () => {
    //         console.log("Full screen btn clicked!")
    //         this.toggleFullScreen();
    //     });
    // }
  }

  handleToolSelection(toolElement) {
    const tools = document.querySelectorAll(".toolbar .tool-btn");
    const canvasContainer = this.drawingManager.canvas.wrapperEl;
    const upperCanvas = this.drawingManager.canvas.upperCanvasEl;

    if (toolElement.classList.contains("active")) {
      toolElement.classList.remove("active");
      this.drawingManager.disableDrawing();
      canvasContainer.classList.remove("drawing-mode");
      upperCanvas.classList.remove("drawing-mode");
      upperCanvas.style.cursor = "default";
      // Enable click-through when tool is deactivated
      this.drawingManager.enableClickThrough();
    } else {
      tools.forEach((t) => t.classList.remove("active"));
      toolElement.classList.add("active");

      canvasContainer.classList.add("drawing-mode");
      upperCanvas.classList.add("drawing-mode");
      upperCanvas.style.cursor = "crosshair";

      // Disable click-through when tool is activated
      this.drawingManager.disableClickThrough();

      const toolName = toolElement.classList[1];
      this.activateTool(toolName);
    }

    if (
      toolElement.classList.contains("fullscreen") &&
      document.fullscreenElement
    ) {
      document.exitFullscreen();
    }
  }

  showPlaybackSpeedMenu() {
  const playbackRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
  
  // Remove existing menu if any
  const existingMenu = document.querySelector('.playback-speed-menu');
  if (existingMenu) {
    existingMenu.remove();
    return;
  }

  // Create menu
  const menu = document.createElement('div');
  menu.className = 'playback-speed-menu';
  menu.innerHTML = `
    <div class="playback-speed-options">
      ${playbackRates.map(rate => `
        <button class="speed-option ${rate === 1 ? 'active' : ''}" data-rate="${rate}">
          ${rate}x
        </button>
      `).join('')}
    </div>
  `;

  // Style the menu
  menu.style.cssText = `
    position: fixed;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: white;
    border-radius: 8px;
    padding: 10px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 1000;
  `;

  menu.querySelector('.playback-speed-options').style.cssText = `
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 5px;
  `;

  menu.querySelectorAll('.speed-option').forEach(option => {
    option.style.cssText = `
      padding: 8px 12px;
      border: none;
      border-radius: 4px;
      background: #f5f5f5;
      cursor: pointer;
      font-size: 14px;
    `;
    
    option.addEventListener('click', (e) => {
      const rate = parseFloat(e.target.getAttribute('data-rate'));
      this.setPlaybackRate(rate);
      menu.remove();
    });
  });

  document.body.appendChild(menu);

  // Close menu when clicking outside
  setTimeout(() => {
    document.addEventListener('click', function closeMenu(e) {
      if (!menu.contains(e.target) && !e.target.closest('.playback-speed')) {
        menu.remove();
        document.removeEventListener('click', closeMenu);
      }
    });
  }, 0);
}

setPlaybackRate(rate) {
  if (this.videoManager.player1) {
    this.videoManager.player1.playbackRate(rate);
  }
  if (this.videoManager.player2) {
    this.videoManager.player2.playbackRate(rate);
  }
  
  // Update button text if you want to show current speed
  const playbackBtn = document.querySelector('.tool-btn.playback-speed');
  if (playbackBtn) {
    const text = playbackBtn.querySelector('text');
    if (text) {
      text.textContent = rate + 'x';
    }
  }
}

  activateTool(toolName) {
    // Disable click-through when using tools
    this.drawingManager.disableClickThrough();

    // First disable edit mode if it's active
    if (this.state.editMode) {
      const editModeBtn = document.querySelector(".secondary-btn.edit-mode");
      if (editModeBtn) {
        editModeBtn.classList.remove("active");
      }
      this.drawingManager.disableEditMode();
      this.state.editMode = false;
    }

    this.drawingManager.disableDrawing();
    this.drawingManager.cleanupToolEvents();

    // Clear all Fabric.js event listeners to prevent conflicts
    this.drawingManager.canvas.off("mouse:down");
    this.drawingManager.canvas.off("mouse:move");
    this.drawingManager.canvas.off("mouse:up");
    this.drawingManager.canvas.off("object:scaling");
    this.drawingManager.canvas.off("object:moving");
    this.drawingManager.canvas.off("object:rotating");

    switch (toolName) {
      case "playback-speed":
      this.showPlaybackSpeedMenu();
      // Deactivate the button after showing menu
      const playbackBtn = document.querySelector('.tool-btn.playback-speed');
      if (playbackBtn) {
        playbackBtn.classList.remove('active');
      }
      break;
      case "draw":
        this.drawingManager.initializeFreeDrawing();
        break;
      case "eraser":
        this.drawingManager.initializeEraser();
        break;
      case "polyline":
        this.drawingManager.initializePolyline();
        break;
      case "rectangle":
      case "circle":
      case "triangle":
      case "line":
      case "text":
        // Set up continuous click listener for shapes (not one-time)
        this.drawingManager.canvas.on("mouse:down", (e) => {
          // Only create shape if we're not interacting with existing objects
          if (!e.target) {
            this.drawingManager.addShape(toolName, e);
          }
        });
        break;
      case "image":
        this.drawingManager.initializeShape();
        break;
      case "fullscreen":
        this.drawingManager.toggleFullScreen();
        // Re-enable the tool after fullscreen
        const fullscreenBtn = document.querySelector(".tool-btn.fullscreen");
        if (fullscreenBtn) {
          fullscreenBtn.classList.remove("active");
        }
        break;
    }
  }

  handleColorPicker() {
    console.log("Inside handle picker.");
    // Check if running on iOS
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    if (!isIOS) {
      console.log("Non-iOS condition");

      // Check if input already exists
      let input = document.getElementById("colorPickerInput");
      if (!input) {
        // Create color input
        input = document.createElement("input");
        input.type = "color";
        input.id = "colorPickerInput";
        input.value = this.state.currentColor;
        input.style.position = "absolute";
        input.style.opacity = "0"; // Hide but keep functional
        input.style.width = "30px";
        input.style.height = "30px";

        // Append next to the color picker button
        const colorPickerBtn = document.querySelector(".tool-btn.color-picker");
        colorPickerBtn.parentNode.insertBefore(
          input,
          colorPickerBtn.nextSibling
        );

        // Wait for the DOM to render before positioning it correctly
        requestAnimationFrame(() => {
          const btnRect = colorPickerBtn.getBoundingClientRect();

          input.style.left = `${
            btnRect.left + window.scrollX - btnRect.width * 0.5
          }px`;
          input.style.top = `${
            btnRect.top + window.scrollY + btnRect.height * 0.2
          }px`;

          console.log(
            "Color picker positioned:",
            input.style.left,
            input.style.top
          );

          // Now trigger the color picker
          input.click();
        });

        // Add event listener for color selection
        input.addEventListener("input", (e) => {
          this.drawingManager.setColor(e.target.value);
          console.log("Selected color:", e.target.value);
        });
      } else {
        input.click();
      }
    } else {
      console.log("iOS condition");
      // Create iOS fallback color picker
      const colors = [
        "#FF0000",
        "#FF4500",
        "#FFA500",
        "#FFFF00",
        "#00FF00",
        "#008000",
        "#00FFFF",
        "#0000FF",
        "#4B0082",
        "#800080",
        "#FF1493",
        "#FFC0CB",
        "#FFFFFF",
        "#808080",
        "#000000",
      ];

      // Create and style the color picker container
      const pickerContainer = document.createElement("div");
      pickerContainer.style.cssText = `
                position: fixed;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 15px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                gap: 8px;
                z-index: 1000;
            `;

      // Create color buttons
      colors.forEach((color) => {
        const colorBtn = document.createElement("button");
        colorBtn.style.cssText = `
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    border: 1px solid #ddd;
                    background-color: ${color};
                    cursor: pointer;
                    padding: 0;
                    margin: 0;
                `;

        colorBtn.addEventListener("click", () => {
          this.drawingManager.setColor(color);
          document.body.removeChild(pickerContainer);
          document.body.removeChild(overlay);
        });

        pickerContainer.appendChild(colorBtn);
      });

      // Create overlay
      const overlay = document.createElement("div");
      overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                z-index: 999;
            `;

      // Close picker when clicking outside
      overlay.addEventListener("click", () => {
        document.body.removeChild(pickerContainer);
        document.body.removeChild(overlay);
      });

      // Add to document
      document.body.appendChild(overlay);
      document.body.appendChild(pickerContainer);
    }
  }
}
// async function saveToLibrary(videoUrl, userId) {
//     let mediaurl = CONFIG.API_MED_URL;
//     try {
//         console.log('Downloading video from:', videoUrl);
//         const response = await fetch(videoUrl);

//         if (!response.ok) {
//             throw new Error(`Failed to download video. Status: ${response.status}`);
//         }

//         const blob = await response.blob();
//         console.log('Downloaded Blob:', blob);

//         // Extract file name or default to 'downloaded-video.webm'
//         const fileName = videoUrl.split('/').pop() || 'downloaded-video.webm';
//         const file = new File([blob], fileName, { type: blob.type });

//         // Prepare the file for upload
//         const formData = new FormData();
//         formData.append('file', file);

//         console.log('Uploading video...');
//         const uploadResponse = await fetch(`${mediaurl}/upload/${userId}`, {
//             method: 'POST',
//             body: formData,
//         });

//         if (!uploadResponse.ok) {
//             throw new Error(`Failed to upload video. Status: ${uploadResponse.status}`);
//         }

//         const data = await uploadResponse.json();
//         console.log('Video uploaded:', data);

//         if (data.media && data.media.fileName) {
//             const fileExtension = data.media.fileName.split('.').pop().toLowerCase();
//             const filePath = `../uploads/${data.media.fileName}`;

//             if (['mp4', 'webm'].includes(fileExtension)) {
//                 // You can call a function to handle the UI update if needed
//                 // addVideoCard(filePath, data.media.originalName);
//             }

//             console.log('Updating Local Storage with:', filePath);
//             // localStorage.setItem('selectedMediaType', 'video');
//             // localStorage.setItem('selectedVideoSrc', filePath);
//         }
//     } catch (error) {
//         console.error('Error in saveToLibrary:', error);
//     }
// }
async function saveToLibrary(videoUrl, userId) {
  let mediaurl = CONFIG.API_MED_URL;
  try {
    console.log("Downloading video from:", videoUrl);
    const response = await fetch(videoUrl);

    if (!response.ok) {
      throw new Error(`Failed to download video. Status: ${response.status}`);
    }

    const blob = await response.blob();
    console.log("Downloaded Blob:", blob);

    // Extract filename and ensure proper extension
    let fileName = videoUrl.split("/").pop();
    if (!fileName.includes(".")) {
      // Check Content-Type to determine correct extension
      const contentType = response.headers.get("Content-Type");
      const extension = contentType === "video/mp4" ? ".mp4" : ".webm";
      fileName += extension;
    }

    const file = new File([blob], fileName, { type: blob.type });

    // Prepare the file for upload
    const formData = new FormData();
    formData.append("file", file);

    console.log("Uploading video...");
    const uploadResponse = await fetch(`${mediaurl}/upload/${userId}`, {
      method: "POST",
      body: formData,
    });

    if (!uploadResponse.ok) {
      throw new Error(
        `Failed to upload video. Status: ${uploadResponse.status}`
      );
    }

    const data = await uploadResponse.json();
    console.log("Video uploaded:", data);

    if (data.media && data.media.fileName) {
      const fileExtension = data.media.fileName.split(".").pop().toLowerCase();
      const filePath = `../uploads/${data.media.fileName}`;

      if (["mp4", "webm"].includes(fileExtension)) {
        // You can call a function to handle the UI update if needed
        // addVideoCard(filePath, data.media.originalName);
      }

      console.log("Updating Local Storage with:", filePath);
      // localStorage.setItem('selectedMediaType', 'video');
      // localStorage.setItem('selectedVideoSrc', filePath);
    }
  } catch (error) {
    console.error("Error in saveToLibrary:", error);
  }
}

function loadFont(fontName) {
  return new Promise((resolve) => {
    const font = new FontFaceObserver(fontName);
    font
      .load()
      .then(() => {
        console.log(fontName + " has loaded.");
        resolve();
      })
      .catch(() => {
        console.warn("Font failed to load: " + fontName);
        resolve();
      });
  });
}

// Helper function to get supported MIME type
function getSupportedMimeType() {
  const possibleTypes = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
    "video/mp4",
    "", // Empty string is a fallback
  ];

  for (const type of possibleTypes) {
    if (type === "" || MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }

  return "";
}
// Initialize the application when DOM is ready
document.addEventListener("DOMContentLoaded", async () => {
  await loadFont("Poppins");
  const app = new DrawingApp();
});

function enhanceVideoScrubbing() {
  const isAppleDevice =
    /Mac|iPhone|iPad|iPod/.test(navigator.userAgent) && !window.MSStream;

  if (!isAppleDevice) {
    return true;
  }

  const videoPlayer = document.querySelector("video");
  const progressHolder = document.querySelector(".vjs-progress-holder");
  const playerContainer = document.querySelector(".video-js");

  if (!videoPlayer || !progressHolder || !playerContainer) {
    setTimeout(enhanceVideoScrubbing, 100);
    return;
  }

  console.log("Video player elements found, enhancing scrubbing...");

  let isScrubbing = false;
  let wasPlaying = false;

  function calculatePositionPercentage(event, element) {
    const bounds = element.getBoundingClientRect();
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    return Math.max(0, Math.min(1, (clientX - bounds.left) / bounds.width));
  }

  function updateVideoTime(percentage) {
    if (!videoPlayer.duration) return;
    const newTime = percentage * videoPlayer.duration;

    // Use fastSeek when possible for keyframe-based jump
    if (
      videoPlayer.fastSeek &&
      Math.abs(videoPlayer.currentTime - newTime) > 0.3
    ) {
      videoPlayer.fastSeek(newTime);
    } else {
      videoPlayer.currentTime = newTime;
    }

    // Dispatch timeupdate for UI sync
    videoPlayer.dispatchEvent(new Event("timeupdate"));
  }

  function handleScrubMove(e) {
    if (!isScrubbing) return;
    e.preventDefault();
    const percentage = calculatePositionPercentage(e, progressHolder);
    updateVideoTime(percentage);
  }

  function startScrubbing(e) {
    wasPlaying = !videoPlayer.paused;
    isScrubbing = true;
    videoPlayer.pause();
    handleScrubMove(e);
    document.body.style.cursor = "grabbing";
  }

  function endScrubbing(e) {
    if (!isScrubbing) return;
    isScrubbing = false;
    if (wasPlaying) videoPlayer.play();
    document.body.style.cursor = "";
  }

  // More responsive pointer/touch handling
  progressHolder.addEventListener("touchstart", startScrubbing, {
    passive: false,
  });
  progressHolder.addEventListener("touchmove", handleScrubMove, {
    passive: false,
  });
  progressHolder.addEventListener("touchend", endScrubbing);

  progressHolder.addEventListener("mousedown", startScrubbing);
  document.addEventListener("mousemove", handleScrubMove);
  document.addEventListener("mouseup", endScrubbing);

  // iOS-specific settings
  if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    videoPlayer.removeAttribute("controls");
    videoPlayer.playsInline = true;
    videoPlayer.webkitPlaysInline = true;
    videoPlayer.setAttribute("preload", "auto");
    videoPlayer.style.transform = "translateZ(0)";
    playerContainer.style.willChange = "transform";
  }

  // Reduce latency on seeked event
  videoPlayer.addEventListener("seeked", () => {
    if (videoPlayer.hls?.startLoad) {
      videoPlayer.hls.startLoad();
    }
  });

  const loadingSpinner = document.querySelector(".vjs-loading-spinner");
  if (loadingSpinner) loadingSpinner.style.display = "none";
}
