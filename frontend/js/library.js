// Fetch media files from the server

const apiUrl = CONFIG.API_MED_URL; 
const api=CONFIG.API_URL;
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('userid');

addRecording();
fetch(`${apiUrl}/mediabyuser/${userId}`)
  .then(response => response.json())
  .then(files => {
    
    files.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
    files.forEach(file => {
        console.log('File: ', file.fileName);
     
      const fileExtension = file.fileName.split('.').pop().toLowerCase();
      const filePath = `../uploads`;
      console.log('File Path', filePath);
   
      if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {

        addImageCard(`${filePath}/${file.fileName}`, file.originalName);
        
      } else if (['mp4', 'webm', 'mov', 'hevc','MOV'].includes(fileExtension)) {
       
        addVideoCard(`${filePath}/${file.fileName}`, file.originalName);
        
       
      }

     

    });
  })
  .catch(error => console.error('Error fetching media files:', error));






// DOM Elements
const gallery = document.getElementById('gallery');
const loadMore = document.getElementById('loadMore');
const fileInput = document.getElementById('fileInput');
const imageGallery = document.getElementById('imageGallery');
const imageFileInput = document.getElementById('imageFileInput');
const loadMoreImages = document.getElementById('loadMoreImages');

let videoCount = 0;

// Event Listeners
loadMore.addEventListener('click', function(e) {
    e.preventDefault();
    fileInput.click();
});

fileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const videoURL = URL.createObjectURL(file);
       
        console.log('File Name:',file.name);

        
        const formData = new FormData();
        formData.append('file', file);

        fetch(`${apiUrl}/upload/${userId}`, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log('Video uploaded:', data);
          
            console.log('Video originalName:', data.media.originalName);
            if (data.media && data.media.fileUrl && data.media.originalName) {
                
                
                addVideoCard(data.media.fileUrl, data.media.originalName);
                console.log("Inside if condition");
                
            }
           
            // window.location.reload();
            refreshVideoGallery();
        })
        .catch(error => console.error('Error uploading video:', error));
    }
});

loadMoreImages.addEventListener('click', function(e) {
    e.preventDefault();
    imageFileInput.click();
});

imageFileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const imageURL = URL.createObjectURL(file);
      

        
        const formData = new FormData();
        formData.append('file', file);

        fetch(`${apiUrl}/upload/${userId}`, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log('Image uploaded:', data);
            

            console.log('Image originalName:', data.media.originalName);
            if (data.media && data.media.fileUrl && data.media.originalName) {
                
                addImageCard(data.media.fileUrl, data.media.originalName);
                console.log("Inside if condition of image");
                
            }
            // window.location.reload();
            refreshImageGallery();
        })
        .catch(error => console.error('Error uploading image:', error));
    }
});

// Functions
function addVideoCard(videoSrc, title) {

    console.log('Inside add video card.Title: ',title);
    console.log('Video source: ',videoSrc);

    const card = document.createElement('div');
    card.className = 'card';

    const video = document.createElement('video');
   
    video.src = videoSrc;
    video.controls = true;
    video.playsInline = true;
    video.loop = true;
    video.muted = true;




    const cardContent = document.createElement('div');
    cardContent.className = 'card-content';

    const heading = document.createElement('h3');
    heading.textContent = title;

    const editButton = document.createElement('button');
    editButton.className = 'edit-button';
    // Create the SVG element
    const svgIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgIcon.setAttribute('viewBox', '0 0 24 24');
    svgIcon.setAttribute('fill', 'none');
    svgIcon.setAttribute('stroke', 'currentColor');
    svgIcon.setAttribute('stroke-width', '2');
    svgIcon.style.width = '20px'; // Adjust width as needed
    svgIcon.style.height = '20px'; // Adjust height as needed

    // First path
    const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path1.setAttribute('d', 'M12 19l7-7 3 3-7 7-3-3z');
    path1.setAttribute('fill', '#2196F3'); // Set the fill color for the first path

    // Second path
    const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path2.setAttribute('d', 'M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5');

    // Append paths to the SVG
    svgIcon.appendChild(path1);
    svgIcon.appendChild(path2);

    // Add the SVG to the button
    editButton.appendChild(svgIcon);

    
    const deleteIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    deleteIcon.setAttribute('viewBox', '0 0 24 24');
    deleteIcon.setAttribute('fill', 'none');
    deleteIcon.setAttribute('stroke', '#FF5252');
    deleteIcon.setAttribute('stroke-width', '2');
    deleteIcon.style.width = '25px'; // Adjust as needed
    deleteIcon.style.height = '38px'; // Adjust as needed
    deleteIcon.style.bottom = '25px';
    deleteIcon.style.marginLeft = '5px';
    deleteIcon.style.backgroundColor = 'none';

    // Create and append the `path` element
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2');

    // Append the path to the SVG
    deleteIcon.appendChild(path);


    heading.addEventListener('click', function () {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = heading.textContent;
        heading.style.display= 'none';
        cardContent.insertBefore(input, editButton);



        // Handle when the user clicks outside or presses Enter to save the new title
        input.addEventListener('blur', () => {
            saveTitle(input.value);
            if (input.parentNode) {  
                cardContent.removeChild(input);
            }
        });

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveTitle(input.value);
                if (input.parentNode) {  
                    cardContent.removeChild(input);
                }
            }
        });

        input.focus(); 
    });

   
    function saveTitle(newTitle) {
        heading.textContent = newTitle;
        heading.style.display= 'block';
        
        console.log('New title saved:', newTitle);


        fetch(`${apiUrl}/getall`)
        .then(response => response.json())
        .then(files => {
            
            const media = files.find(file => file.fileName === videoSrc.split('/').pop());

            if (media) {
                const mediaId = media._id;

              
                const payload = { originalName: newTitle };

               
                fetch(`${apiUrl}/update/${mediaId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Media id (frontend):', mediaId);
                    console.log('Media updated successfully (frontend):', data);
                })
                .catch(error => console.error('Error updating media:', error));
            } else {
                console.error('Media not found with the given filename.');
            }
        })
        .catch(error => console.error('Error fetching media files:', error));
    }
    
    editButton.addEventListener('click', function() {
        
        
        localStorage.removeItem('selectedMediaSrc');
        localStorage.setItem('selectedMediaSrc', videoSrc);
        localStorage.setItem('mediaType', 'video'); 
        localStorage.setItem('editMode', 'true');

        window.location.href = '../index.html';
    });

    deleteIcon.addEventListener('click', function () {
        fetch(`${apiUrl}/getall`)
          .then((response) => response.json())
          .then((files) => {
            const media = files.find(file => file.fileName === videoSrc.split('/').pop());
      
            if (media) {
              const mediaId = media._id;
      
              // Confirm before deleting
              if (confirm('Are you sure you want to delete this media?')) {
                deleteMedia(mediaId, card);
              }
            } else {
              console.error('Media not found with the given filename.');
            }
          })
          .catch(error => console.error('Error fetching media files:', error));
      });

      
    cardContent.appendChild(heading);
    cardContent.appendChild(editButton);
    cardContent.appendChild(deleteIcon);

    card.appendChild(video);
    card.appendChild(cardContent);
    gallery.appendChild(card);

    videoCount++;
}

function addImageCard(imageSrc, title) {
    const card = document.createElement('div');
    card.className = 'card';

    const img = document.createElement('img');
    img.src = imageSrc;
    img.alt = title;

    const cardContent = document.createElement('div');
    cardContent.className = 'card-content';

    const heading = document.createElement('h3');
    heading.textContent = title;
    

    const deleteIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    deleteIcon.setAttribute('viewBox', '0 0 24 24');
    deleteIcon.setAttribute('fill', 'none');
    deleteIcon.setAttribute('stroke', '#FF5252');
    deleteIcon.setAttribute('stroke-width', '2');
    deleteIcon.style.width = '25px'; // Adjust as needed
    deleteIcon.style.height = '38px'; // Adjust as needed
    deleteIcon.style.bottom = '25px';
    deleteIcon.style.marginLeft = '5px';
    deleteIcon.style.backgroundColor = 'none';

    // Create and append the `path` element
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2');

    // Append the path to the SVG
    deleteIcon.appendChild(path);

    const editButton = document.createElement('button');
    editButton.className = 'edit-button';

    // Create the SVG element
    const svgIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgIcon.setAttribute('viewBox', '0 0 24 24');
    svgIcon.setAttribute('fill', 'none');
    svgIcon.setAttribute('stroke', 'currentColor');
    svgIcon.setAttribute('stroke-width', '2');
    svgIcon.style.width = '20px'; 
    svgIcon.style.height = '20px'; 

    // First path
    const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path1.setAttribute('d', 'M12 19l7-7 3 3-7 7-3-3z');
    path1.setAttribute('fill', '#2196F3'); // Set the fill color for the first path

    // Second path
    const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path2.setAttribute('d', 'M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5');

    // Append paths to the SVG
    svgIcon.appendChild(path1);
    svgIcon.appendChild(path2);

    // Add the SVG to the button
    editButton.appendChild(svgIcon);


    heading.addEventListener('click', function () {
        const input = document.createElement('input');
        input.id = 'titleInput'; 
        input.type = 'text';
        input.value = heading.textContent;
        heading.style.display= 'none';
        cardContent.insertBefore(input, editButton);



      
        input.addEventListener('blur', () => {
            saveimgTitle(input.value);
            cardContent.removeChild(input);
        });

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveimgTitle(input.value);
                cardContent.removeChild(input);
            }
        });

        input.focus(); 
    });

    
    function saveimgTitle(newTitle) {
        heading.textContent = newTitle;
        heading.style.display= 'block';
     
        console.log('New title saved image:', newTitle);

        fetch(`${apiUrl}/getall`)
        .then(response => response.json())
        .then(files => {
            
            const media = files.find(file => file.fileName === imageSrc.split('/').pop());

            if (media) {
                const mediaId = media._id;

              
                const payload = { originalName: newTitle };

               
                fetch(`${apiUrl}/update/${mediaId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Media id (frontend):', mediaId);
                    console.log('Media updated successfully (frontend):', data);
                })
                .catch(error => console.error('Error updating media:', error));
            } else {
                console.error('Media not found with the given filename.');
            }
        })
        .catch(error => console.error('Error fetching media files:', error));
    }
    
    editButton.addEventListener('click', function() {

        localStorage.setItem('selectedMediaSrc', imageSrc); 
        localStorage.setItem('mediaType', 'image'); 
        localStorage.setItem('editMode', 'true');
        window.location.href = '../index.html';
    });
    

    deleteIcon.addEventListener('click', function () {
        fetch(`${apiUrl}/getall`)
          .then((response) => response.json())
          .then((files) => {
            const media = files.find(file => file.fileName === imageSrc.split('/').pop());
      
            if (media) {
              const mediaId = media._id;
      
              // Confirm before deleting
              if (confirm('Are you sure you want to delete this media?')) {
                deleteMedia(mediaId, card);
              }
            } else {
              console.error('Media not found with the given filename.');
            }
          })
          .catch(error => console.error('Error fetching media files:', error));
      });

    cardContent.appendChild(heading);
    cardContent.appendChild(editButton);
    cardContent.appendChild(deleteIcon);


    card.appendChild(img);
    card.appendChild(cardContent);
    imageGallery.appendChild(card);
}
document.getElementById("backtoindex").addEventListener("click", function() {
    const previousUrl = localStorage.getItem('currentUrl');
    console.log("Previous url was:",previousUrl);
    //window.location.href = "../index.html?prev=${encodeURIComponent(previousUrl)}`"; 
    window.location.href = previousUrl; 
    
});

function deleteMedia(mediaId, videoCard) {
    if (!mediaId) {
      console.error('No media ID provided for deletion');
      return;
    }
    console.log("Media id:",mediaId);
    // Send DELETE request to the backend
    fetch(`${apiUrl}/delete/${mediaId}`, {
      method: 'DELETE',
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === 'Media deleted successfully!') {
          console.log('Media deleted successfully:', data);
          
          // Remove the video card from the gallery
          videoCard.remove();
        } else {
          console.error('Failed to delete media:', data.error);
        }
      })
      .catch((error) => console.error('Error deleting media:', error));
  }
  
function refreshVideoGallery() {
    fetch(`${apiUrl}/mediabyuser/${userId}`)
        .then(response => response.json())
        .then(files => {
            files.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
            gallery.innerHTML = ''; 

         
            files.forEach(file => {
                const fileExtension = file.fileName.split('.').pop().toLowerCase();
                const filePath = `../uploads/${file.fileName}`;
               if (['mp4', 'webm'].includes(fileExtension)) {
                    addVideoCard(filePath, file.originalName);
                }
            });
        })
        .catch(error => console.error('Error fetching media files:', error));
}

function refreshImageGallery() {
    fetch(`${apiUrl}/mediabyuser/${userId}`)
        .then(response => response.json())
        .then(files => {
            files.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
            imageGallery.innerHTML = '';

        
            files.forEach(file => {
                const fileExtension = file.fileName.split('.').pop().toLowerCase();
                const filePath = `../uploads/${file.fileName}`;
                if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
                    addImageCard(filePath, file.originalName);
                }
            });
        })
        .catch(error => console.error('Error fetching media files:', error));
}

document.getElementById('fileInput').addEventListener('change', simulateUpload);
document.getElementById('imageFileInput').addEventListener('change', simulateUpload);

function simulateUpload() {
    document.getElementById('progress-bar').style.display='block';
    const progressBar = document.getElementById('progress');
    let progress = 0;

   
    progressBar.style.width = '0%';

    const interval = setInterval(() => {
        if (progress < 100) {
            progress += 10; 
            progressBar.style.width = progress + '%'; 
        } else {
            clearInterval(interval); 
            alert('Upload complete!');
            document.getElementById('progress-bar').style.display='none';
        }

    }, 100); 
    
}

function removeInput() {
    const inputElement = document.getElementById('titleInput');
    if (inputElement) {
        cardContent.removeChild(inputElement);
    }
}



function createVideoCard(videoUrl, title) {
    console.log("Create Video Card");
    const card = document.createElement('div');
    card.classList.add('recording-card');

    const videoElement = document.createElement('video');
    videoElement.src = videoUrl;
    videoElement.controls = true; 

    const titleElement = document.createElement('h3');
    titleElement.innerText = title;

    card.appendChild(videoElement);
    card.appendChild(titleElement);

    return card;
}

async function addRecording() {
    const urlParams = new URLSearchParams(window.location.search);
                const userId = urlParams.get('userid');

                if (userId) {
                   console.log("userId found");
    try {
        const response = await fetch(`${api}/rec/recordings/user/${userId}`);
        const recordings = await response.json();

        // Check for errors in the response
        if (response.status === 404) {
            //console.log(recordings.message); // No recordings found
            console.log("There isnt any recordings for this user");
            displayNoRecordingsMessage(userId);
            return;
        }
        else{
        // Display the recordings
        displayRecordings(recordings);}
    } catch (error) {
        console.error('Error fetching recordings:', error);
    }
}else{
    console.log("unable to find userId");
}}
function displayNoRecordingsMessage(userId) {
    const messageContainer = document.getElementById('message-container'); 
    messageContainer.innerHTML = `<p>No recordings found for user ID: <strong>${userId}</strong>.</p>`;
    messageContainer.style.color = 'red'; 
}

function displayRecordings(recordings) {
    const gallery = document.getElementById('recordings-gallery');
    gallery.innerHTML = ''; 
    console.log('Hello I am inside display rec');
    recordings.forEach(recording => {
        let card;
        
        card = createVideoCard(recording.videoUrl, recording.title);
       

        if (card) {
            gallery.appendChild(card);
        }
    });
}

// Function to fetch recordings from the API based on user ID
async function fetchRecordingsByUserId(userId) {
    try {
        const response = await fetch(`${api}/api/rec/recordings/user/${userId}`);
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const recordings = await response.json(); // Assuming the API returns a JSON array
        return recordings; // Return the fetched recordings
    } catch (error) {
        console.error('Error fetching recordings:', error);
        alert('Failed to fetch recordings. Please try again.');
        return [];
    }
}


