document.addEventListener('DOMContentLoaded', function () {
    const photoUploadInput = document.getElementById('photoUploadInput');
    const photoUploadBtn = document.getElementById('photoUploadBtn');
    const photoPreviewArea = document.querySelector('.photo-preview-area');
    const videoUploadInput = document.getElementById('videoUploadInput');
    const videoUploadBtn = document.getElementById('videoUploadBtn');
    const videoPreviewArea = document.querySelector('.video-preview-area');
    const submitPostBtn = document.getElementById('submitPostBtn');
    const postTitleInput = document.getElementById('postTitle');
    const postContentTextarea = document.getElementById('postContent');
    const postTagsInput = document.getElementById('postTags');

    const MAX_PHOTOS = 10;
    const MAX_PHOTO_SIZE = 20 * 1024 * 1024; // 20MB in bytes
    const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB in bytes

    let uploadedPhotos = []; // Array to store photo files
    let uploadedVideo = null; // Variable to store the video file

    // Trigger file input click when button is clicked for photos
    photoUploadBtn.addEventListener('click', function () {
        photoUploadInput.click();
    });

    // Handle file selection for photos
    photoUploadInput.addEventListener('change', function (event) {
        const files = event.target.files;
        if (files.length === 0) return;

        // Check total number of files (photos + video)
        if (uploadedPhotos.length + files.length + (uploadedVideo ? 1 : 0) > MAX_PHOTOS) {
            alert(`사진과 동영상을 합쳐 최대 ${MAX_PHOTOS}개까지 업로드 가능합니다.`);
            photoUploadInput.value = ''; // Clear the input
            return;
        }

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            // Check file size
            if (file.size > MAX_PHOTO_SIZE) {
                alert(`사진 파일 "${file.name}"의 크기가 너무 큽니다. (최대 ${MAX_PHOTO_SIZE / (1024 * 1024)}MB)`);
                continue; // Skip this file
            }

            // Check if it's an image (basic check using file type)
            if (!file.type.startsWith('image/')) {
                alert(`"${file.name}" 파일은 이미지 형식이 아닙니다.`);
                continue; // Skip this file
            }


            // Add to uploaded photos array
            uploadedPhotos.push(file);

            // Create and display preview
            const reader = new FileReader();
            reader.onload = function (e) {
                const photoItem = document.createElement('div');
                photoItem.classList.add('photo-item', 'position-relative'); // Add position-relative for delete button

                const img = document.createElement('img');
                img.src = e.target.result;
                img.alt = 'Uploaded photo preview';
                img.classList.add('img-fluid');

                const deleteBtn = document.createElement('button');
                deleteBtn.classList.add('btn', 'btn-danger', 'btn-sm', 'position-absolute', 'top-0', 'end-0', 'm-1');
                deleteBtn.innerHTML = '&times;'; // '×' symbol
                deleteBtn.addEventListener('click', function () {
                    // Remove from uploaded photos array
                    const index = uploadedPhotos.indexOf(file);
                    if (index > -1) {
                        uploadedPhotos.splice(index, 1);
                    }
                    // Remove the preview element
                    photoItem.remove();
                    // Update the file input value (optional, but good practice)
                    updatePhotoInputFiles();
                });

                photoItem.appendChild(img);
                photoItem.appendChild(deleteBtn); // Add delete button
                photoPreviewArea.appendChild(photoItem);
            };
            reader.readAsDataURL(file);
        }

        // Clear the input so the same file can be selected again if needed
        photoUploadInput.value = '';
    });

    // Helper function to update the photo input's file list after deletion
    function updatePhotoInputFiles() {
        const dataTransfer = new DataTransfer();
        uploadedPhotos.forEach(file => {
            dataTransfer.items.add(file);
        });
        photoUploadInput.files = dataTransfer.files;
    }


    // Trigger file input click when button is clicked for video
    videoUploadBtn.addEventListener('click', function () {
        videoUploadInput.click();
    });

    // Handle file selection for video
    videoUploadInput.addEventListener('change', function (event) {
        const files = event.target.files;
        if (files.length === 0) return;

        const file = files[0]; // Only one video file is allowed

        // Check if a video is already uploaded
        if (uploadedVideo) {
            alert('동영상은 하나만 업로드 가능합니다. 기존 동영상을 제거하고 다시 시도해주세요.');
            videoUploadInput.value = ''; // Clear the input
            return;
        }

        // Check total number of files (photos + video)
        if (uploadedPhotos.length + 1 > MAX_PHOTOS) { // Check if adding one video exceeds the limit
            alert(`사진과 동영상을 합쳐 최대 ${MAX_PHOTOS}개까지 업로드 가능합니다.`);
            videoUploadInput.value = ''; // Clear the input
            return;
        }


        // Check file size
        if (file.size > MAX_VIDEO_SIZE) {
            alert(`동영상 파일 "${file.name}"의 크기가 너무 큽니다. (최대 ${MAX_VIDEO_SIZE / (1024 * 1024)}MB)`);
            videoUploadInput.value = ''; // Clear the input
            return;
        }

        // Check if it's a video (basic check using file type)
        if (!file.type.startsWith('video/')) {
            alert(`"${file.name}" 파일은 동영상 형식이 아닙니다.`);
            videoUploadInput.value = ''; // Clear the input
            return;
        }

        // Store the video file
        uploadedVideo = file;

        // Create and display preview
        const reader = new FileReader();
        reader.onload = function (e) {
            // Clear previous video preview
            videoPreviewArea.innerHTML = '';

            const videoItem = document.createElement('div');
            videoItem.classList.add('video-item', 'position-relative'); // Add position-relative for delete button

            const video = document.createElement('video');
            video.src = e.target.result;
            video.controls = true;
            video.classList.add('img-fluid'); // Use img-fluid for responsiveness

            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('btn', 'btn-danger', 'btn-sm', 'position-absolute', 'top-0', 'end-0', 'm-1');
            deleteBtn.innerHTML = '&times;'; // '×' symbol
            deleteBtn.addEventListener('click', function () {
                // Remove the video file
                uploadedVideo = null;
                // Remove the preview element
                videoItem.remove();
                // Clear the input value
                videoUploadInput.value = '';
            });


            videoItem.appendChild(video);
            videoItem.appendChild(deleteBtn); // Add delete button
            videoPreviewArea.appendChild(videoItem);
        };
        reader.readAsDataURL(file);

        // Clear the input
        videoUploadInput.value = '';
    });


    // Handle post submission
    submitPostBtn.addEventListener('click', function () {
        const title = postTitleInput.value.trim();
        const content = postContentTextarea.value.trim();
        const tags = postTagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

        // Basic validation (title and content are required)
        if (!title) {
            alert('제목을 입력해주세요.');
            postTitleInput.focus();
            return;
        }

        if (!content) {
            alert('내용을 입력해주세요.');
            postContentTextarea.focus();
            return;
        }

        // Create FormData object to send data including files
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('tags', JSON.stringify(tags)); // Send tags as a JSON string

        // Append photo files
        uploadedPhotos.forEach((file, index) => {
            formData.append(`photos`, file); // Backend should expect 'photos' as an array or handle multiple files with the same key
        });

        // Append video file
        if (uploadedVideo) {
            formData.append('video', uploadedVideo); // Backend should expect 'video'
        }

        window.location.href = '/community';
        return;

        // --- Backend API Request Placeholder ---
        const backendApiUrl = '/api/community/posts'; // Replace with your actual backend endpoint

        fetch(backendApiUrl, {
            method: 'POST',
            body: formData
            // Note: fetch with FormData usually sets the Content-Type header correctly,
            // so you often don't need to set it manually.
        })
            .then(response => {
                if (!response.ok) {
                    // Handle HTTP errors
                    return response.json().then(errorData => {
                        throw new Error(`Server error: ${response.status} ${response.statusText} - ${errorData.message || ''}`);
                    });
                }
                return response.json(); // Assuming the backend returns JSON
            })
            .then(data => {
                console.log('Post successful:', data);
                alert('글이 성공적으로 등록되었습니다.');
                // Redirect to the community page or the new post page
                window.location.href = '/community'; // Example redirect
            })
            .catch(error => {
                console.error('Error submitting post:', error);
                alert('글 등록 중 오류가 발생했습니다: ' + error.message);
            });
    });
});