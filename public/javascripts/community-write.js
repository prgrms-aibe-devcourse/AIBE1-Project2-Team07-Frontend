const API_BASE_URL = 'https://dev.tuituiworld.store/api/v1/';

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
    const categoryButtons = document.querySelectorAll('input[name="communityCategory"]');
    const petCategoryButtons = document.querySelectorAll('input[name="petCategory"]');

    const MAX_PHOTOS = 10;
    const MAX_PHOTO_SIZE = 10 * 1024 * 1024; // 10MB in bytes
    const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB in bytes

    let uploadedPhotos = []; // Array to store photo files
    let uploadedVideo = null; // Variable to store the video file
    let tags = []; // Array to store tag objects {id: number, name: string}
    let selectedTags = []; // Array to store selected tag IDs

    if(localStorage.getItem("accessToken") == null){
        alert("로그인을 해주세요");
        location.href = "/community";
        return;
    }

    // 태그 데이터 가져오기ㄴ
    fetchTags();

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

    // 태그 자동완성 기능 구현
    function setupTagInput() {
        // 태그 입력란 요소
        const tagInputContainer = document.createElement('div');
        tagInputContainer.classList.add('tag-input-container', 'd-flex', 'flex-wrap', 'align-items-center', 'border', 'rounded', 'p-2');

        // 기존 태그 입력란을 감싸는 부모 요소
        const tagInputParent = postTagsInput.parentElement;

        // 새로운 입력란 (선택된 태그들이 표시될 영역)
        const selectedTagsContainer = document.createElement('div');
        selectedTagsContainer.classList.add('selected-tags-container', 'd-flex', 'flex-wrap', 'gap-2');

        // 실제 태그 입력을 위한 input 요소
        const tagInput = document.createElement('input');
        tagInput.type = 'text';
        tagInput.classList.add('tag-input', 'border-0', 'flex-grow-1', 'py-1');
        tagInput.placeholder = '태그를 입력하세요...';

        // 자동완성 결과를 표시할 드롭다운
        const autocompleteDropdown = document.createElement('div');
        autocompleteDropdown.classList.add('autocomplete-dropdown', 'position-absolute', 'bg-white', 'border', 'rounded', 'mt-1', 'w-100', 'shadow-sm');
        autocompleteDropdown.style.display = 'none';
        autocompleteDropdown.style.zIndex = '1000';
        autocompleteDropdown.style.maxHeight = '200px';
        autocompleteDropdown.style.overflowY = 'auto';

        // 원래 input 숨기기
        postTagsInput.style.display = 'none';

        // 새 요소들 추가
        tagInputContainer.appendChild(selectedTagsContainer);
        tagInputContainer.appendChild(tagInput);

        // 기존 입력란 다음에 새 컨테이너 추가
        tagInputParent.insertBefore(tagInputContainer, postTagsInput.nextSibling);
        tagInputParent.appendChild(autocompleteDropdown);

        // 키보드 네비게이션을 위한 변수들
        let currentFocus = -1;

// 태그 입력 이벤트 처리
        tagInput.addEventListener('input', function() {
            const inputValue = this.value.trim();

            // 현재 포커스 초기화
            currentFocus = -1;

            if (inputValue.length > 0) {
                // 입력값으로 태그 필터링
                const filteredTags = tags.filter(tag =>
                    tag.tagName.toLowerCase().includes(inputValue.toLowerCase()) &&
                    !selectedTags.includes(tag.tagId)
                );

                // 자동완성 드롭다운 표시
                if (filteredTags.length > 0) {
                    autocompleteDropdown.innerHTML = '';
                    filteredTags.forEach(tag => {
                        const tagItem = document.createElement('div');
                        tagItem.classList.add('dropdown-item', 'py-2', 'px-3', 'cursor-pointer');
                        tagItem.textContent = tag.tagName;
                        tagItem.dataset.tagId = tag.tagId; // 태그 ID를 데이터 속성에 저장
                        tagItem.addEventListener('click', () => {
                            addTag(tag);
                            tagInput.value = '';
                            autocompleteDropdown.style.display = 'none';
                        });
                        autocompleteDropdown.appendChild(tagItem);
                    });
                    autocompleteDropdown.style.display = 'block';
                } else {
                    autocompleteDropdown.style.display = 'none';
                }
            } else {
                autocompleteDropdown.style.display = 'none';
            }
        });

// 키보드 방향키 및 엔터키 처리
        tagInput.addEventListener('keydown', function(e) {
            const items = autocompleteDropdown.querySelectorAll('.dropdown-item');

            if (!items.length) return;

            // 드롭다운이 표시되어 있을 때만 처리
            if (autocompleteDropdown.style.display === 'block') {
                // 아래 방향키
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    currentFocus++;
                    // 리스트의 끝에 도달하면 처음으로 돌아감
                    if (currentFocus >= items.length) currentFocus = 0;
                    setActiveItem(items);
                }
                // 위 방향키
                else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    currentFocus--;
                    // 리스트의 처음에서 위로 가면 끝으로 이동
                    if (currentFocus < 0) currentFocus = items.length - 1;
                    setActiveItem(items);
                }
                // 엔터키
                else if (e.key === 'Enter' && currentFocus > -1) {
                    e.preventDefault();
                    if (items[currentFocus]) {
                        items[currentFocus].click(); // 선택된 아이템 클릭
                    }
                }
                // ESC 키
                else if (e.key === 'Escape') {
                    autocompleteDropdown.style.display = 'none';
                    currentFocus = -1;
                }
            } else if (e.key === 'Enter' && this.value.trim() !== '') {
                // 드롭다운이 숨겨져 있지만 입력값이 있는 경우
                e.preventDefault();
                // 드롭다운을 다시 표시하고 첫 번째 항목 선택
                const inputValue = this.value.trim();
                const filteredTags = tags.filter(tag =>
                    tag.tagName.toLowerCase().includes(inputValue.toLowerCase()) &&
                    !selectedTags.includes(tag.tagId)
                );

                if (filteredTags.length > 0) {
                    addTag(filteredTags[0]);
                    this.value = '';
                }
            }
        });

        function setActiveItem(items) {
            // 모든 아이템에서 활성 클래스 제거
            removeActiveClass(items);

            // 현재 포커스 항목에 활성 클래스 추가
            if (currentFocus >= 0 && currentFocus < items.length) {
                items[currentFocus].classList.add('active');

                // 스크롤이 필요한 경우 스크롤 조정
                const activeItem = items[currentFocus];
                const dropdownRect = autocompleteDropdown.getBoundingClientRect();
                const activeItemRect = activeItem.getBoundingClientRect();

                // 현재 활성 항목이 드롭다운 아래쪽 경계를 넘어가는 경우
                if (activeItemRect.bottom > dropdownRect.bottom) {
                    autocompleteDropdown.scrollTop += activeItemRect.bottom - dropdownRect.bottom;
                }
                // 현재 활성 항목이 드롭다운 위쪽 경계를 넘어가는 경우
                else if (activeItemRect.top < dropdownRect.top) {
                    autocompleteDropdown.scrollTop -= dropdownRect.top - activeItemRect.top;
                }
            }
        }

        function removeActiveClass(items) {
            for (let i = 0; i < items.length; i++) {
                items[i].classList.remove('active');
            }
        }

// 태그 추가 함수 수정
        function addTag(tag) {
            if (!selectedTags.includes(tag.tagId)) {
                selectedTags.push(tag.tagId);

                // 선택한 태그 UI 생성
                const tagElement = document.createElement('div');
                tagElement.classList.add('selected-tag', 'd-inline-flex', 'align-items-center', 'rounded', 'py-1', 'px-2', 'me-1', 'mb-1');

                const tagText = document.createElement('span');
                tagText.textContent = `#${tag.tagName}`;

                const removeBtn = document.createElement('span');
                removeBtn.classList.add('ms-2', 'cursor-pointer');
                removeBtn.innerHTML = '&times;';
                removeBtn.addEventListener('click', () => removeTag(tag.tagId, tagElement));

                tagElement.appendChild(tagText);
                tagElement.appendChild(removeBtn);
                selectedTagsContainer.appendChild(tagElement);

                // hidden input 업데이트
                updateTagsInput();
            }
        }

// 태그 제거 함수 수정
        function removeTag(tagId, element) {
            const index = selectedTags.indexOf(tagId);
            if (index > -1) {
                selectedTags.splice(index, 1);
                element.remove();
                updateTagsInput();
            }
        }

        // hidden input 업데이트 함수
        function updateTagsInput() {
            postTagsInput.value = JSON.stringify(selectedTags);
        }
    }

    // API에서 태그 데이터 가져오기
    async function fetchTags() {
        try {
            const response = await fetch(API_BASE_URL + 'tags/open', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
                }
            });
            if (!response.ok) {
                throw new Error('태그 데이터를 가져오는데 실패했습니다.');
            }

            tags = await response.json();
            // 태그 입력 UI 설정
            setupTagInput();

        } catch (error) {
            console.error('태그 데이터 로드 오류:', error);
            alert('태그 데이터를 불러오는데 실패했습니다.');
        }
    }

    // Handle post submission
    submitPostBtn.addEventListener('click', function () {
        const title = postTitleInput.value.trim();
        const content = postContentTextarea.value.trim();

        // Get selected category values
        let postCategory = '';
        for (const btn of categoryButtons) {
            if (btn.checked) {
                postCategory = getCategoryEnum(btn.value);
                break;
            }
        }

        let petCategory = '';
        for (const btn of petCategoryButtons) {
            if (btn.checked) {
                petCategory = getPetCategoryEnum(btn.value);
                break;
            }
        }

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

        if (!postCategory) {
            alert('게시판 카테고리를 선택해주세요.');
            return;
        }

        if (!petCategory) {
            alert('펫 카테고리를 선택해주세요.');
            return;
        }

        // Create PostRequestDTO
        const postRequestDTO = {
            postCategory: postCategory,
            petCategory: petCategory,
            title: title,
            content: content,
            tagIds: selectedTags
        };

        // Create FormData object to send data including files
        const formData = new FormData();
        formData.append('requestDTO', new Blob([JSON.stringify(postRequestDTO)], {
            type: 'application/json'
        }));

        if (uploadedPhotos.length > 0) {
            uploadedPhotos.forEach(file => {
                formData.append('files', file);
            });
        }

        if (uploadedVideo) {
            formData.append('video', uploadedVideo);
        }

        fetch(API_BASE_URL + 'posts', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
            },
            body: formData
        })
            .then(response => {
                if (!response.ok) {
                    // Handle HTTP errors
                    return response.json().then(errorData => {
                        throw new Error(`서버 오류: ${response.status} ${response.statusText} - ${errorData.message || ''}`);
                    });
                }
                return response.json(); // 백엔드가 JSON을 반환한다고 가정
            })
            .then(data => {
                alert('글이 성공적으로 등록되었습니다.');
                // 커뮤니티 페이지로 리디렉션
                window.location.href = '/community';
            })
            .catch(error => {
                console.error('게시물 등록 중 오류 발생:', error);
                alert('글 등록 중 오류가 발생했습니다: ' + error.message);
            });
    });

    // 카테고리 enum 변환 함수
    function getCategoryEnum(categoryValue) {
        switch (categoryValue) {
            case '자유게시판':
                return 'FREE';
            case '질문하기':
                return 'QNA';
            case '펫 도구 후기':
                return 'TOOL';
            case '자랑하기':
                return 'MYPET';
            default:
                return 'FREE';
        }
    }

    // 펫 카테고리 enum 변환 함수
    function getPetCategoryEnum(categoryValue) {
        switch (categoryValue) {
            case '강아지':
                return 'DOG';
            case '고양이':
                return 'CAT';
            case '기타':
                return 'ETC';
            default:
                return 'DOG';
        }
    }
});