// State management using a singleton pattern
class AppState {
    static instance = null;
    
    constructor() {
        if (AppState.instance) {
            return AppState.instance;
        }
        
        this.currentTool = null;
        this.currentColor = '#FF5252';
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
        this.videoElement1 = document.querySelector('#video-player-1');
        this.imageElement = null; // Track the image element if mediaType is image
    }
    initializeMainPlayer() {
        const mediaType = localStorage.getItem('mediaType');
        const selectedMediaSrc = localStorage.getItem('selectedMediaSrc');
        console.log("Media Type:", mediaType );
        console.log("Selected Media Src:", selectedMediaSrc);
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('userid');
        const videoUrl = urlParams.get('videourl');
        if (userId) {     
            localStorage.setItem('userId', userId);
        }
        console.log('User ID:', userId);
        console.log('Video URL:', videoUrl);
        console.log('Current url:',window.location.href);

        // Check if the media is an image
        if (mediaType === 'image' && selectedMediaSrc) {
            console.log("Got an image");
            this.loadImage(selectedMediaSrc); // Load the image
            localStorage.removeItem('selectedMediaSrc');
            return; // Exit early; no need to initialize the video player
        }
    
        // Initialize the video player only if the media type is video
        if (!this.videoElement1) {
            console.warn('Video player 1 is not present in the DOM. Skipping video initialization.');
            return;
        }
        const self = this;
    
        this.player1 = videojs('video-player-1', {
            controls: true,
            autoplay: 'muted',
            playsinline: true,
            fluid: false,
            preload: 'auto',
            responsive: true,
            fill: true,
            enableSmoothSeeking: true,
            nativeControlsForTouch:false,
            controlBar: {
                remainingTimeDisplay: false,
                autoHide: false,
                pictureInPictureToggle: false
            },
            userActions: { hotkeys: true },
            html5: {
                nativeVideoTracks: true,
                nativeAudioTracks: true,
                nativeTextTracks: false,
                nativeControlsForTouch: false,
            }
        }, function onPlayerReady() {
            const player = this;
    
            try {
                // if (selectedMediaSrc) {
                    if (videoUrl){
                        player.src({
                            type: 'video/mp4', // Ensure this matches the actual type of the video file
                            src: videoUrl
                        });
                        player.on('error', function () {
                            console.error('Error loading video:', player.error());
                            // Provide a fallback video
                            self.showUploadMessage(player);
                        });
                        player.on('loadeddata', async () => {
                            console.log('Video has loaded successfully');
                            self.removeUploadMessage(player);
                            await saveToLibrary(videoUrl, userId);
                        });
                    }
                   else if (selectedMediaSrc) {
                    self.removeUploadMessage(player);
                    player.src({
                        type: 'video/mp4', // Ensure this matches the actual type of the video file
                        src: selectedMediaSrc
                    });

                    localStorage.removeItem('selectedMediaSrc');
    
                    player.on('error', function () {
                        console.error('Error loading video:', player.error());
                        // Provide a fallback video
                        self.showUploadMessage(player);
                    });
                } else {
                    // Default video source
                    self.showUploadMessage(player);
                }
                
    
                player.dimensions(player.currentWidth(), player.currentHeight());
            }catch (error) {
                console.error('Error initializing video player:', error);
                self.showUploadMessage(player);
            }
        });
    }
    
    loadImage(imageSrc) {
        const imgElement = document.createElement('img');
        imgElement.src = imageSrc;
        imgElement.alt = 'Selected Image';
        imgElement.style.width = '100%';
        imgElement.style.height = 'auto';
    
        // Replace the video element with the image
        if (this.videoElement1) {
            this.videoElement1.replaceWith(imgElement);
            this.videoElement1 = null; // Clear the reference to avoid future issues
        }
    
        console.log('Image loaded:', imageSrc);
        
    }
   
    initializeSecondPlayer() {
        const self = this;
        if (!this.player2) {
            this.player2 = videojs('video-player-2', {
                controls: true,
                autoplay: 'muted',
                playsinline: true,
                fluid: false,
                preload: 'auto',
                responsive: true,
                fill: true,
                enableSmoothSeeking: true,
                controlBar: {
                    remainingTimeDisplay: false,
                    autoHide: false,
                    pictureInPictureToggle: false
                },
                userActions: { hotkeys: true },
                html5: {
                    nativeVideoTracks: true,
                    nativeAudioTracks: true,
                    nativeTextTracks: false,
                    nativeControlsForTouch: false,
                }
            }, function onPlayerReady() {
                const player = this;
                self.showUploadMessage(player);
                player.dimensions(player.currentWidth(), player.currentHeight());
            });

            this.videoElement2 = document.querySelector('#video-player-2');
        }
    }

    handleSplitScreen() {
        const secondWrapper = document.querySelector('#second-video-wrapper');
        if (secondWrapper.classList.contains('hidden')) {
            secondWrapper.classList.remove('hidden');
            this.initializeSecondPlayer();
            this.addFloatingUploadButtons();
        } else {
            secondWrapper.classList.add('hidden');
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
    
        const player1Wrapper = document.querySelector("#video-player-1").closest(".video-wrapper");
        const player2Wrapper = document.querySelector("#video-player-2").closest(".video-wrapper");
    
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
        document.querySelectorAll(".floating-upload-icon").forEach(icon => icon.remove());
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
        const userId = urlParams.get('userid');

        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'video/*';
        input.onchange = async (event) => {
            const file = event.target.files[0];
            if (file) {
                const url = URL.createObjectURL(file);
                if (playerNumber === 1 && this.player1) {
                    this.player1.src({ type: 'video/mp4', src: url });
                    this.removeUploadMessage(this.player1);

                    this.player1.on('loadeddata', async () => {
                        console.log('Player 1 video loaded via upload');
                        await saveToLibrary(url, userId);
                    });

                    this.player1.play();
                }if (playerNumber === 2 && this.player2) {
                    this.removeUploadMessage(this.player2);
                    this.player2.src({ type: 'video/mp4', src: url });
                    console.log("Url: ",url);
                    this.player2.on('loadeddata', async () => {
                        console.log('Player 2 video loaded via upload');
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
        const messageDiv = document.createElement('div');
        messageDiv.className = 'vjs-upload-message';
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
        messageDiv.addEventListener('click', () => {
            this.uploadVideo(playerNumber);
        });
    }
    removeUploadMessage(player) {
        if (!player) return;
        
        const playerEl = player.el();
        if (!playerEl) return;
        
        // Remove any existing message
        const existingMessage = playerEl.querySelector('.vjs-upload-message');
        if (existingMessage) {
            existingMessage.remove();
        }
    }
    
}    

// Drawing tools and canvas management
class DrawingManager {
    constructor() {
        this.canvas = new fabric.Canvas('annotation-canvas', {
            width: window.innerWidth,
            height: window.innerHeight,
            selection: true,
            preserveObjectStacking: true
        });
        
        console.log('Canvas object:', this.canvas);
        
        this.state = AppState.getInstance();
        this.initializeEventListeners();
        this.initializeDebugListeners();
    }

    initializeEventListeners() {
        this.canvas.on('object:added', () => this.saveState());
        this.canvas.on('object:modified', () => this.saveState());
        this.canvas.on('object:removed', () => this.saveState());
        this.canvas.on('mouse:down', (e) => {
            console.log('Canvas mouse down:', e);
        });
    }

    initializeDebugListeners() {
        document.body.addEventListener('click', (e) => {
            console.log('Body clicked', e.target);
        });

        const videoContainer = document.querySelector('.video-container');
        videoContainer.addEventListener('click', (e) => {
            console.log('Video container clicked', e.target);
        });

        const upperCanvas = this.canvas.upperCanvasEl;
        upperCanvas.addEventListener('click', (e) => {
            console.log('Upper canvas clicked', e.target);
        });

        document.querySelectorAll('.video-js').forEach(video => {
            video.addEventListener('click', (e) => {
                console.log('Video element clicked', e.target);
            });
        });
    }

    updateDimensions() {
        const containerRect = document.querySelector('.video-container').getBoundingClientRect();
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
        this.canvas.hoverCursor = 'crosshair';
        this.canvas.defaultCursor = 'crosshair';
    
        this.canvas.on('mouse:down', (options) => {
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
        canvasContainer.classList.add('drawing-mode');
        upperCanvas.classList.add('drawing-mode');

        this.canvas.selection = true;
        this.canvas.hoverCursor = 'move';
        
        this.canvas.getObjects().forEach(obj => {
            obj.selectable = true;
            obj.setControlsVisibility({
                mt: true,     // middle top
                mb: true,     // middle bottom
                ml: true,     // middle left
                mr: true,     // middle right
                bl: true,     // bottom left
                br: true,     // bottom right
                tl: true,     // top left
                tr: true,     // top right
                mtr: true     // rotate
            });
            
            if (obj instanceof fabric.IText) {
                obj.editable = true;
            }
        });

        this.canvas.renderAll();
    }

    disableEditMode() {
        const canvasContainer = this.canvas.wrapperEl;
        const upperCanvas = this.canvas.upperCanvasEl;
        canvasContainer.classList.remove('drawing-mode');
        upperCanvas.classList.remove('drawing-mode');

        this.canvas.selection = false;
        this.canvas.hoverCursor = 'default';
        
        this.canvas.getObjects().forEach(obj => {
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
                mtr: false
            });
            
            if (obj instanceof fabric.IText) {
                obj.editable = false;
            }
        });

        this.canvas.renderAll();
    }
    Gotolibrary(){
        console.log("Go to Library!");
        localStorage.setItem('currentUrl', window.location.href); 
        console.log("CURRENT URL:",localStorage.getItem('currentUrl', window.location.href)); 
       // window.location.href = 'pages/library.html'; 
    }
    initializePolyline() {
        this.state.polylinePoints = [];
        this.state.polylineLines = [];
        this.state.polylineAngles = [];

        this.canvas.on('mouse:down', (evt) => {
            const pointer = this.canvas.getPointer(evt.e);
            const currentPoint = { x: pointer.x, y: pointer.y };
            
            this.state.polylinePoints.push(currentPoint);
            
            if (this.state.polylinePoints.length >= 2) {
                const prevPoint = this.state.polylinePoints[this.state.polylinePoints.length - 2];
                const line = new fabric.Line(
                    [prevPoint.x, prevPoint.y, currentPoint.x, currentPoint.y],
                    {
                        stroke: this.state.currentColor,
                        strokeWidth: 2
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
                    const angleText = new fabric.Text(
                        `${angle.toFixed(1)}°`,
                        {
                            left: midPoint.x,
                            top: midPoint.y,
                            fontSize: 16,
                            fill: this.state.currentColor,
                            selectable: false
                        }
                    );
                    this.canvas.add(angleText);
                    this.state.polylineAngles.push(angleText);
                }
            }
            
            this.canvas.renderAll();
        });
    }
    initializeShape() {
        const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = 'image/*';
                fileInput.style.display = 'none';
            
                fileInput.addEventListener('change', (event) => {
                    const file = event.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            const imgSrc = e.target.result;
                            this.addShape('image', null, { src: imgSrc });
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
            y: point1.y - point2.y
        };
        const vector2 = {
            x: point3.x - point2.x,
            y: point3.y - point2.y
        };

        const dotProduct = vector1.x * vector2.x + vector1.y * vector2.y;
        const magnitude1 = Math.sqrt(vector1.x * vector1.x + vector1.y * vector1.y);
        const magnitude2 = Math.sqrt(vector2.x * vector2.x + vector2.y * vector2.y);
        
        let angle = Math.acos(dotProduct / (magnitude1 * magnitude2));
        angle = angle * 180 / Math.PI;
        
        return angle;
    }
    toggleFullScreen() {
        const fullscreenBtn = document.querySelector('.tool-btn .fullscreen');
    
        // Check if the button is active (i.e., it has the 'active' class)
        const isActive = fullscreenBtn && fullscreenBtn.classList.contains('active');
        console.log(isActive)  ;     //console.log(fullscreenBtn.classList.contains('active'));
        // If not in full-screen and button is not active, enter full-screen
        if (!document.fullscreenElement) {
            console.log("Entering full screen mode.");
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.mozRequestFullScreen) { // Firefox
                document.documentElement.mozRequestFullScreen();
            } else if (document.documentElement.webkitRequestFullscreen) { // Chrome, Safari, and Opera
                document.documentElement.webkitRequestFullscreen();
            } else if (document.documentElement.msRequestFullscreen) { // IE/Edge
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
        let shape;
        const pointer = e ? this.canvas.getPointer(e.e) : { x: 100, y: 100 };
        const defaultOptions = {
            fontFamily: 'Poppins',
            left: pointer.x,
            top: pointer.y,
            fill: 'transparent',
            stroke: this.state.currentColor,
            strokeWidth: 2
        };

        const finalOptions = { ...defaultOptions, ...options };

        switch (shapeType) {
            case 'rectangle':
                shape = new fabric.Rect({
                    ...finalOptions,
                    width: 100,
                    height: 100
                });
                break;
            case 'circle':
                shape = new fabric.Circle({
                    ...finalOptions,
                    radius: 50
                });
                break;
            case 'triangle':
                shape = new fabric.Triangle({
                    ...finalOptions,
                    width: 100,
                    height: 100
                });
                break;
            case 'line':
                shape = new fabric.Line(
                    [pointer.x, pointer.y, pointer.x + 100, pointer.y + 100],
                    {
                        stroke: this.state.currentColor,
                        strokeWidth: 2
                    }
                );
                break;
            case 'text':   
                shape = new fabric.IText('Type here', {
                    ...finalOptions,
                    fontFamily: 'Poppins',
                    fontWeight: '14',
                    fontSize: 17,
                    fill: this.state.currentColor
                });
        
                break;
            case 'image':
                    // Add image to the canvas
                    fabric.Image.fromURL(options.src, (img) => {
                        img.set({
                            left: pointer.x,
                            top: pointer.y,
                            scaleX: 0.5,
                            scaleY: 0.5,
                        });
                        this.canvas.add(img);
                        this.canvas.setActiveObject(img);
                        this.canvas.renderAll();
                    });
                    break;
          
        }

        if (shape) {
            this.canvas.add(shape);
            this.canvas.setActiveObject(shape);
            this.canvas.renderAll();
        }
    }

    disableDrawing() {
        this.state.eraserMode = false;
        this.state.isDrawing = false;
        this.state.lastX = 0;
        this.state.lastY = 0;
        this.state.startPoint = null;
        this.canvas.isDrawingMode = false;
        this.canvas.selection = true;
        this.canvas.hoverCursor = 'default';
        this.canvas.defaultCursor = 'default';
        this.cleanupToolEvents();
    }

    cleanupToolEvents() {
        this.canvas.off('mouse:down');
        this.canvas.off('mouse:move');
        this.canvas.off('mouse:up');
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
        this.canvas.loadFromJSON(this.state.history[this.state.historyIndex], () => {
            this.canvas.renderAll();
        });
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

        // Video event listener for dimensions
        if(this.videoManager.player1){
        this.videoManager.player1.on('loadedmetadata', () => {
            this.drawingManager.updateDimensions();
        });
    }
        // Window resize handler
        window.addEventListener('resize', () => {
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

       

        document.addEventListener('DOMContentLoaded', function () {
            const selectedMediaSrc = localStorage.getItem('selectedMediaSrc');
            const mediaType = localStorage.getItem('mediaType');
            console.log("Media type: ",mediaType); // Get the type of media
            const editMode = localStorage.getItem('editMode');
        
            if (editMode === 'true' && selectedMediaSrc && mediaType) {
                if (mediaType === 'image') {
                    // Handle image loading
                    const imgElement = document.createElement('img');
                    imgElement.src = selectedMediaSrc;
                    imgElement.alt = 'Selected Image';
                    imgElement.style.width = '100%'; // Adjust size as needed
                    imgElement.style.height = 'auto';
        
                    // Replace the video player with the image
                    const videoPlayer1 = document.getElementById('video-player-1');
                    const videoWrapper1 = videoPlayer1.parentNode;
                    videoWrapper1.replaceWith(imgElement);
                } else if (mediaType === 'video') {
                    // Handle video loading
                    const videoPlayer1 = document.getElementById('video-player-1');
                    const videoWrapper2 = document.getElementById('second-video-wrapper');
        
                    // Set the video source
                    videoPlayer1.src = selectedMediaSrc;
                    videoPlayer1.classList.remove('hidden'); // Ensure it's visible
                    videoWrapper2.classList.add('hidden'); // Hide the second video wrapper
                    videoPlayer1.load(); // Load the video source
                    videoPlayer1.play(); // Auto-play if desired
                }
            }
        
            // Clear editMode flag after loading the media
            localStorage.setItem('editMode', 'false');
        });
        
        // Tool selection
        document.querySelectorAll('.toolbar .tool-btn').forEach(tool => {
            tool.addEventListener('click', () => this.handleToolSelection(tool));
        });

        // Edit mode
        const editModeBtn = document.querySelector('.secondary-btn.edit-mode');
        if (editModeBtn) {
            editModeBtn.addEventListener('click', (e) => {
                if (this.state.editMode) {
                    editModeBtn.classList.remove('active');
                    this.drawingManager.disableEditMode();
                    this.state.editMode = false;
                } else {
                    editModeBtn.classList.add('active');
                    this.drawingManager.initializeEditMode();
                    this.state.editMode = true;
                    // Deactivate any other active tools
                    document.querySelectorAll('.toolbar .tool-btn').forEach(tool => {
                        tool.classList.remove('active');
                    });
                }
            });
        }
        
        const libBtn = document.querySelector('.secondary-btn.library');
        if (libBtn) {
            libBtn.addEventListener('click', () => {
            const urlParams = new URLSearchParams(window.location.search);
            const userId = urlParams.get('userid');

            // if (userId) {
            //     console.log("Extracted User ID:", userId);
            // }
            localStorage.setItem('currentUrl', window.location.href); 
            console.log("CURRENT URL:",localStorage.getItem('currentUrl', window.location.href)); 
            if (userId) {
                // Navigate to library page with userid
                window.location.href = `pages/library.html?userid=${userId}`;
            } else {
                // Navigate normally if userid is not found
                window.location.href = 'pages/library.html';
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
                logicalSurface: true
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
                    autoGainControl: true
                },
                video: false
            });
            console.log("Microphone access granted");
        } catch (micError) {
            console.error("Could not access microphone:", micError);
            alert("Microphone access was denied. Recording will continue without mic audio.");
            micStream = null;
        }

        // THEN request screen capture using your original options
        console.log("Requesting screen capture...");
        const displayStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
        
        console.log("Screen capture granted:", 
            displayStream.getVideoTracks().length, "video tracks,",
            displayStream.getAudioTracks().length, "audio tracks");
        
        // Combine the streams
        let combinedStream;
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        
        if (micStream) {
            // For Chrome/Firefox - use WebAudio API for mixing
            const ctx = new AudioContext();
            
            // Create a destination for our combined audio
            const dest = ctx.createMediaStreamDestination();
            
            // Add display audio to the mix if it exists
            if (displayStream.getAudioTracks().length > 0) {
                const displaySource = ctx.createMediaStreamSource(new MediaStream([displayStream.getAudioTracks()[0]]));
                displaySource.connect(dest);
                console.log("Added system audio to the mix");
            }
            
            // Add microphone audio to the mix
            if (micStream.getAudioTracks().length > 0) {
                const micSource = ctx.createMediaStreamSource(new MediaStream([micStream.getAudioTracks()[0]]));
                micSource.connect(dest);
                console.log("Added microphone audio to the mix");
            }
            
            // Create a new stream with display video and our mixed audio
            const videoTrack = displayStream.getVideoTracks()[0];
            combinedStream = new MediaStream([
                videoTrack,
                ...dest.stream.getTracks()
            ]);
            
            console.log("Created combined stream with mixed audio");
        } else {
            combinedStream = displayStream;
            console.log("Using only display stream (no microphone)");
        }

        // Set up MediaRecorder with appropriate MIME type
        const mimeType = 'video/webm';
        
        // Create MediaRecorder with the combined stream
        const options = { 
            mimeType,
            audioBitsPerSecond: 128000,
            videoBitsPerSecond: 2500000
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
            const downloadLink = document.createElement('a');
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
            displayStream.getTracks().forEach(track => track.stop());
            if (micStream) {
                micStream.getTracks().forEach(track => track.stop());
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
    var userId = urlParams.get('userid');
    let saved_userId = localStorage.getItem('userId');

    if (!userId && !saved_userId) {
        console.error('User ID not found in URL.');
        return;
    }
    userId = userId || saved_userId;

    console.log('Uploading recording...');

    const formData = new FormData();
    formData.append('video', blob, 'screen-recording.webm');

    try {
        const response = await fetch(`${apirecUrl}/recordings/${userId}`, {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            console.log('Recording uploaded successfully.');
        } else {
            const errorData = await response.json();
            console.error('Error uploading recording:', errorData);
        }
    } catch (uploadError) {
        console.error('Error during upload:', uploadError);
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
        const clearAllBtn = document.querySelector('.tool-btn.clear-all');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => this.drawingManager.clearCanvas());
        }

        const mobileClearBtn = document.querySelector('.mobile-clear-btn');
        if (mobileClearBtn) {
            mobileClearBtn.addEventListener('click', () => this.drawingManager.clearCanvas());
        }

        const colorPickerBtn = document.querySelector('.tool-btn.color-picker');
        if (colorPickerBtn) {
            colorPickerBtn.addEventListener('click', () => this.handleColorPicker());
        }

        const splitScreenBtn = document.querySelector('.split-screen');
        if (splitScreenBtn) {
            splitScreenBtn.addEventListener('click', () => {
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
        const tools = document.querySelectorAll('.toolbar .tool-btn');
        const canvasContainer = this.drawingManager.canvas.wrapperEl;
        const upperCanvas = this.drawingManager.canvas.upperCanvasEl;
        
        if (toolElement.classList.contains('active')) {
            toolElement.classList.remove('active');
            this.drawingManager.disableDrawing();
            canvasContainer.classList.remove('drawing-mode');
            upperCanvas.classList.remove('drawing-mode');
            upperCanvas.style.cursor = 'default';

        } else {
            tools.forEach(t => t.classList.remove('active'));
            toolElement.classList.add('active');
            
            canvasContainer.classList.add('drawing-mode');
            upperCanvas.classList.add('drawing-mode');
            upperCanvas.style.cursor = 'crosshair';
            
            const toolName = toolElement.classList[1];
            this.activateTool(toolName);
        }
        if (toolElement.classList.contains('fullscreen') && document.fullscreenElement) {
            document.exitFullscreen();
        }
        // Listen for Fullscreen Exit
        document.addEventListener("fullscreenchange", () => {
        const fullscreenBtn = document.querySelector('.tool-btn.fullscreen');
        if (!document.fullscreenElement && fullscreenBtn) {
            fullscreenBtn.classList.remove('active');
        }
});
    }

    activateTool(toolName) {
        // First disable edit mode if it's active
        if (this.state.editMode) {
            const editModeBtn = document.querySelector('.secondary-btn.edit-mode');
            if (editModeBtn) {
                editModeBtn.classList.remove('active');
            }
            this.drawingManager.disableEditMode();
            this.state.editMode = false;
            const canvasContainer = this.drawingManager.canvas.wrapperEl;
            const upperCanvas = this.drawingManager.canvas.upperCanvasEl;
            canvasContainer.classList.add('drawing-mode');
            upperCanvas.classList.add('drawing-mode');
        }

        this.drawingManager.disableDrawing();
        this.drawingManager.cleanupToolEvents();
        
        switch (toolName) {
            case 'draw':
                this.drawingManager.initializeFreeDrawing();
                break;
            case 'eraser':
                this.drawingManager.initializeEraser();
                break;
            case 'polyline':
                this.drawingManager.initializePolyline();
                break;
            case 'rectangle':
            case 'circle':
            case 'triangle':
            case 'line':
            case 'text':
                this.drawingManager.canvas.on('mouse:down', (e) => 
                    this.drawingManager.addShape(toolName, e));
                break;
            case 'image':
                this.drawingManager.initializeShape();
                break;
            case 'fullscreen':
                this.drawingManager.toggleFullScreen();

        }
    }

    handleColorPicker() {
        console.log("Inside handle picker.");
        // Check if running on iOS
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
        if (!isIOS) {
            console.log("Non-iOS condition");
    
            // Check if input already exists
            let input = document.getElementById("colorPickerInput");
            if (!input) {
                // Create color input
                input = document.createElement('input');
                input.type = 'color';
                input.id = "colorPickerInput";
                input.value = this.state.currentColor;
                input.style.position = "absolute";
                input.style.opacity = "0";  // Hide but keep functional
                input.style.width = "30px"; 
                input.style.height = "30px"; 
    
                // Append next to the color picker button
                const colorPickerBtn = document.querySelector(".tool-btn.color-picker");
                colorPickerBtn.parentNode.insertBefore(input, colorPickerBtn.nextSibling);
    
                // Wait for the DOM to render before positioning it correctly
                requestAnimationFrame(() => {
                    const btnRect = colorPickerBtn.getBoundingClientRect();
                    
                    input.style.left = `${btnRect.left + window.scrollX - (btnRect.width * 0.5)}px`; 
                    input.style.top = `${btnRect.top + window.scrollY + (btnRect.height * 0.2)}px`; 
                    
                    console.log("Color picker positioned:", input.style.left, input.style.top);
    
                    // Now trigger the color picker
                    input.click();
                });
    
                // Add event listener for color selection
                input.addEventListener('input', (e) => {
                    this.drawingManager.setColor(e.target.value);
                    console.log("Selected color:", e.target.value);
                });
            } else {
                input.click();
            }
        }
        else {
            console.log("iOS condition");
            // Create iOS fallback color picker
            const colors = [
                '#FF0000', '#FF4500', '#FFA500', '#FFFF00', '#00FF00', 
                '#008000', '#00FFFF', '#0000FF', '#4B0082', '#800080',
                '#FF1493', '#FFC0CB', '#FFFFFF', '#808080', '#000000'
            ];
    
            // Create and style the color picker container
            const pickerContainer = document.createElement('div');
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
            colors.forEach(color => {
                const colorBtn = document.createElement('button');
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
                
                colorBtn.addEventListener('click', () => {
                    this.drawingManager.setColor(color);
                    document.body.removeChild(pickerContainer);
                    document.body.removeChild(overlay);
                });
                
                pickerContainer.appendChild(colorBtn);
            });
    
            // Create overlay
            const overlay = document.createElement('div');
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
            overlay.addEventListener('click', () => {
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
        console.log('Downloading video from:', videoUrl);
        const response = await fetch(videoUrl);

        if (!response.ok) {
            throw new Error(`Failed to download video. Status: ${response.status}`);
        }

        const blob = await response.blob();
        console.log('Downloaded Blob:', blob);

        // Extract filename and ensure proper extension
        let fileName = videoUrl.split('/').pop();
        if (!fileName.includes('.')) {
            // Check Content-Type to determine correct extension
            const contentType = response.headers.get('Content-Type');
            const extension = contentType === 'video/mp4' ? '.mp4' : '.webm';
            fileName += extension;
        }

        const file = new File([blob], fileName, { type: blob.type });

        // Prepare the file for upload
        const formData = new FormData();
        formData.append('file', file);

        console.log('Uploading video...');
        const uploadResponse = await fetch(`${mediaurl}/upload/${userId}`, {
            method: 'POST',
            body: formData,
        });

        if (!uploadResponse.ok) {
            throw new Error(`Failed to upload video. Status: ${uploadResponse.status}`);
        }

        const data = await uploadResponse.json();
        console.log('Video uploaded:', data);

        if (data.media && data.media.fileName) {
            const fileExtension = data.media.fileName.split('.').pop().toLowerCase();
            const filePath = `../uploads/${data.media.fileName}`;

            if (['mp4', 'webm'].includes(fileExtension)) {
                // You can call a function to handle the UI update if needed
                // addVideoCard(filePath, data.media.originalName);
            }

            console.log('Updating Local Storage with:', filePath);
            // localStorage.setItem('selectedMediaType', 'video');
            // localStorage.setItem('selectedVideoSrc', filePath);
        }
    } catch (error) {
        console.error('Error in saveToLibrary:', error);
    }
}

function loadFont(fontName) {
    return new Promise((resolve) => {
        const font = new FontFaceObserver(fontName);
        font.load().then(() => {
            console.log(fontName + " has loaded.");
            resolve();
        }).catch(() => {
            console.warn("Font failed to load: " + fontName);
            resolve();
        });
    });
}

// Helper function to get supported MIME type
function getSupportedMimeType() {
    const possibleTypes = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
        'video/mp4',
        ''  // Empty string is a fallback
    ];
    
    for (const type of possibleTypes) {
        if (type === '' || MediaRecorder.isTypeSupported(type)) {
            return type;
        }
    }
    
    return '';
}
// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    await loadFont('Poppins');
    const app = new DrawingApp();
});