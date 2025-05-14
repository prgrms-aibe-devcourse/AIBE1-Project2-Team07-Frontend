const API_BASE_URL = 'https://dev.tuituiworld.store/api/v1/';
let selectedTagNames = [];

document.addEventListener('DOMContentLoaded', async function () {
    // 기본 요소 설정
    const postIdInput = document.getElementById('postId');
    const photoUploadInput = document.getElementById('photoUploadInput');
    const photoUploadBtn = document.getElementById('photoUploadBtn');
    const photoPreviewArea = document.querySelector('.photo-preview-area');
    const currentPhotosArea = document.querySelector('.current-photos-area');
    const videoUploadInput = document.getElementById('videoUploadInput');
    const videoUploadBtn = document.getElementById('videoUploadBtn');
    const videoPreviewArea = document.querySelector('.video-preview-area');
    const currentVideoArea = document.querySelector('.current-video-area');
    const updatePostBtn = document.getElementById('updatePostBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const postTitleInput = document.getElementById('postTitle');
    const postContentTextarea = document.getElementById('postContent');
    const postTagsInput = document.getElementById('postTags');
    const categoryButtons = document.querySelectorAll('input[name="communityCategory"]');
    const petCategoryButtons = document.querySelectorAll('input[name="petCategory"]');
    const confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));
    const confirmActionBtn = document.getElementById('confirmActionBtn');
    const confirmMessage = document.getElementById('confirmMessage');
    const backButton = document.querySelector('.back-btn');

    // URL 경로에서 게시글 ID 추출
    const pathSegments = window.location.pathname.split('/');
    const postId = pathSegments[pathSegments.length - 1];

    if (!postId || isNaN(postId)) {
        alert('잘못된 접근입니다. 유효한 게시글 ID가 필요합니다.');
        window.location.href = '/community';
        return;
    }

    postIdInput.value = postId;

    backButton.href = `/community/post/${postId}`;
    // 상수 설정
    const MAX_PHOTOS = 10;
    const MAX_PHOTO_SIZE = 10 * 1024 * 1024; // 10MB in bytes
    const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB in bytes

    // 상태 변수
    let originalData = null; // 원본 데이터 저장
    let uploadedPhotos = []; // 새로 업로드할 사진 파일
    let uploadedVideo = null; // 새로 업로드할 비디오 파일
    let currentPhotoUrls = []; // 기존 사진 URL
    let currentVideoUrl = null; // 기존 비디오 URL
    let photosToDelete = []; // 삭제할 사진 URL
    let videoToDelete = false; // 비디오 삭제 여부
    let tags = []; // 모든 태그 배열 [{tagId: number, tagName: string}]
    let selectedTags = [];
    let selectedTagsContainer;
    // 선택된 태그 ID 배열
    window.addTag = function(tag) {
        // 태그 ID로 중복 체크
        if (selectedTags.includes(tag.tagId)) {
            return;
        }

        // 태그 이름으로 중복 체크 (같은 이름의 태그가 이미 선택되어 있는지)
        const isTagNameAlreadySelected = Array.from(document.querySelectorAll('.selected-tag span:first-child'))
            .some(span => span.textContent === `#${tag.tagName}`);

        if (isTagNameAlreadySelected) {
            return;
        }

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
    };

    // 태그 데이터 가져오기
    fetchTags();

    // 게시글 데이터 가져오기
    fetchPostData();

    initTagBtn()

    // 이벤트 리스너 설정
    photoUploadBtn.addEventListener('click', function () {
        photoUploadInput.click();
    });

    photoUploadInput.addEventListener('change', handlePhotoUpload);

    videoUploadBtn.addEventListener('click', function () {
        videoUploadInput.click();
    });

    videoUploadInput.addEventListener('change', handleVideoUpload);

    updatePostBtn.addEventListener('click', await handlePostUpdate);

    cancelBtn.addEventListener('click', function () {
        // 변경 사항이 있는지 확인
        if (hasChanges()) {
            showConfirmModal(
                '작성 중인 내용이 있습니다. 정말 취소하시겠습니까?',
                function () {
                    window.location.href = `/community/post/${postId}`;
                }
            );
        } else {
            window.location.href = '/community';
        }
    });

    // 게시글 데이터 가져오기 함수
    async function fetchPostData() {
        try {
            const response = await fetch('/api/v1/posts/' + postId + '/open', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
                }
            });

            if (!response.ok) {
                throw new Error('게시글을 가져오는데 실패했습니다.');
            }

            originalData = await response.json();

            const user = localStorage.getItem('user');
            const userObj = JSON.parse(user);

            if (userObj.name !== originalData.userName) {
                alert("수정할 권한이 없습니다.")
                window.location.href = '/community';
                return;
            }

            populateFormWithData(originalData);
        } catch (error) {
            console.error('게시글 데이터 로드 오류:', error);
            alert('게시글 데이터를 불러오는데 실패했습니다.');
        }
    }

    // 폼에 데이터 채우기
    function populateFormWithData(data) {
        // 제목 및 내용 설정
        postTitleInput.value = data.title;
        postContentTextarea.value = data.content;

        // 게시판 카테고리 설정
        const postCategoryValue = getPostCategoryValue(data.postCategory);
        document.querySelector(`input[name="communityCategory"][value="${postCategoryValue}"]`).checked = true;

        // 펫 카테고리 설정
        const petCategoryValue = getPetCategoryValue(data.petCategory);
        document.querySelector(`input[name="petCategory"][value="${petCategoryValue}"]`).checked = true;

        // 태그 설정
        if (data.tags && data.tags.length > 0) {
            // 태그 이름으로 태그 ID 찾기는 태그 데이터가 로드된 후 수행됨
            selectedTagNames = data.tags;
            setupTagsFromData();
        }

        // 사진 및 비디오 설정
        if (data.imageUrls && data.imageUrls.length > 0) {
            currentPhotoUrls = [...data.imageUrls];
            displayCurrentPhotos();
        }

        if (data.videoUrl) {
            currentVideoUrl = data.videoUrl;
            displayCurrentVideo();
        }
    }

    // 태그 설정
    function setupTagsFromData() {
        if (!selectedTagNames || !tags.length) return;

        // 태그 이름으로 태그 ID 찾기
        selectedTagNames.forEach(tagName => {
            const tagObj = tags.find(t => t.tagName === tagName);
            if (tagObj) {
                selectedTags.push(tagObj.tagId);
                addTagToUI(tagObj);
            }
        });
    }

    // 현재 사진 표시
    function displayCurrentPhotos() {
        currentPhotoUrls.forEach((url, index) => {
            const photoItem = document.createElement('div');
            photoItem.classList.add('photo-item', 'position-relative');
            photoItem.dataset.url = url;

            const img = document.createElement('img');
            img.src = url;
            img.alt = '기존 업로드된 사진';
            img.classList.add('img-fluid');

            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('btn', 'btn-danger', 'btn-sm', 'position-absolute', 'top-0', 'end-0', 'm-1');
            deleteBtn.innerHTML = '&times;'; // '×' 기호
            deleteBtn.addEventListener('click', function () {
                // 삭제 배열에 추가
                photosToDelete.push(url);
                // 현재 사진 배열에서 제거
                const index = currentPhotoUrls.indexOf(url);
                if (index > -1) {
                    currentPhotoUrls.splice(index, 1);
                }
                // 미리보기 제거
                photoItem.remove();
            });

            photoItem.appendChild(img);
            photoItem.appendChild(deleteBtn);
            photoPreviewArea.appendChild(photoItem);
        });
    }

    // 현재 비디오 표시
    function displayCurrentVideo() {
        if (currentVideoUrl) {
            const videoItem = document.createElement('div');
            videoItem.classList.add('video-item', 'position-relative');

            const video = document.createElement('video');
            video.src = currentVideoUrl;
            video.controls = true;
            video.classList.add('img-fluid');

            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('btn', 'btn-danger', 'btn-sm', 'position-absolute', 'top-0', 'end-0', 'm-1');
            deleteBtn.innerHTML = '&times;'; // '×' 기호
            deleteBtn.addEventListener('click', function () {
                videoToDelete = true;
                currentVideoUrl = null;
                videoItem.remove();

                // 비디오 입력 재활성화
                videoUploadBtn.disabled = false;
            });

            videoItem.appendChild(video);
            videoItem.appendChild(deleteBtn);
            videoPreviewArea.appendChild(videoItem);

            // 비디오가 이미 있으면 업로드 버튼 비활성화
            videoUploadBtn.disabled = true;
        }
    }


    // 사진 업로드 처리
    function handlePhotoUpload(event) {
        const files = event.target.files;
        if (files.length === 0) return;

        // 총 사진 개수 체크 (현재 + 새로 업로드 + 파일 선택)
        const totalPhotos = currentPhotoUrls.length + uploadedPhotos.length + files.length;
        if (totalPhotos > MAX_PHOTOS) {
            alert(`사진은 최대 ${MAX_PHOTOS}개까지 업로드 가능합니다.`);
            photoUploadInput.value = '';
            return;
        }

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            // 파일 크기 체크
            if (file.size > MAX_PHOTO_SIZE) {
                alert(`사진 파일 "${file.name}"의 크기가 너무 큽니다. (최대 ${MAX_PHOTO_SIZE / (1024 * 1024)}MB)`);
                continue;
            }

            // 이미지 타입 체크
            if (!file.type.startsWith('image/')) {
                alert(`"${file.name}" 파일은 이미지 형식이 아닙니다.`);
                continue;
            }

            // 업로드 배열에 추가
            uploadedPhotos.push(file);

            // 미리보기 생성
            createPhotoPreview(file);
        }

        // 입력 필드 초기화
        photoUploadInput.value = '';
    }

    // 사진 미리보기 생성
    function createPhotoPreview(file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const photoItem = document.createElement('div');
            photoItem.classList.add('photo-item', 'position-relative');

            const img = document.createElement('img');
            img.src = e.target.result;
            img.alt = '새로 업로드할 사진';
            img.classList.add('img-fluid');

            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('btn', 'btn-danger', 'btn-sm', 'position-absolute', 'top-0', 'end-0', 'm-1');
            deleteBtn.innerHTML = '&times;';
            deleteBtn.addEventListener('click', function () {
                // 업로드 배열에서 제거
                const index = uploadedPhotos.indexOf(file);
                if (index > -1) {
                    uploadedPhotos.splice(index, 1);
                }
                // 미리보기 제거
                photoItem.remove();
            });

            photoItem.appendChild(img);
            photoItem.appendChild(deleteBtn);
            photoPreviewArea.appendChild(photoItem);
        };
        reader.readAsDataURL(file);
    }

    // 비디오 업로드 처리
    function handleVideoUpload(event) {
        const files = event.target.files;
        if (files.length === 0) return;

        const file = files[0]; // 한 개의 비디오만 허용

        // 이미 비디오가 있는 경우
        if (uploadedVideo || currentVideoUrl) {
            alert('동영상은 하나만 업로드 가능합니다. 기존 동영상을 제거하고 다시 시도해주세요.');
            videoUploadInput.value = '';
            return;
        }

        // 파일 크기 체크
        if (file.size > MAX_VIDEO_SIZE) {
            alert(`동영상 파일 "${file.name}"의 크기가 너무 큽니다. (최대 ${MAX_VIDEO_SIZE / (1024 * 1024)}MB)`);
            videoUploadInput.value = '';
            return;
        }

        // 비디오 타입 체크
        if (!file.type.startsWith('video/')) {
            alert(`"${file.name}" 파일은 동영상 형식이 아닙니다.`);
            videoUploadInput.value = '';
            return;
        }

        // 업로드 변수에 저장
        uploadedVideo = file;

        // 기존 비디오가 있다면 자동으로 삭제 처리
        if (currentVideoUrl) {
            videoToDelete = true;
            currentVideoUrl = null;
            videoPreviewArea.innerHTML = '';
        }

        // 미리보기 생성
        createVideoPreview(file);

        // 입력 필드 초기화
        videoUploadInput.value = '';
    }

    // 비디오 미리보기 생성
    function createVideoPreview(file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            // 기존 미리보기 영역 초기화
            videoPreviewArea.innerHTML = '';

            const videoItem = document.createElement('div');
            videoItem.classList.add('video-item', 'position-relative');

            const video = document.createElement('video');
            video.src = e.target.result;
            video.controls = true;
            video.classList.add('img-fluid');

            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('btn', 'btn-danger', 'btn-sm', 'position-absolute', 'top-0', 'end-0', 'm-1');
            deleteBtn.innerHTML = '&times;';
            deleteBtn.addEventListener('click', function () {
                // 업로드 변수 초기화
                uploadedVideo = null;
                // 미리보기 제거
                videoItem.remove();
            });

            videoItem.appendChild(video);
            videoItem.appendChild(deleteBtn);
            videoPreviewArea.appendChild(videoItem);
        };
        reader.readAsDataURL(file);
    }

    // 태그 데이터 가져오기
    async function fetchTags() {
        try {
            const response = await fetch('/api/v1/tags/open', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
                }
            });

            if (!response.ok) {
                throw new Error('태그 데이터를 가져오는데 실패했습니다.');
            }

            // 가져온 태그 데이터를 전역 변수에도 저장
            tags = await response.json();
            window.tags = tags;  // window 객체에 태그 정보 저장

            // 태그 입력 UI 설정
            setupTagInput();
        } catch (error) {
            console.error('태그 데이터 로드 오류:', error);
            alert('태그 데이터를 불러오는데 실패했습니다.');
        }
    }

    // 변경 사항 확인
    function hasChanges() {
        if (!originalData) return false;

        // 제목, 내용 비교
        if (postTitleInput.value !== originalData.title) return true;
        if (postContentTextarea.value !== originalData.content) return true;

        // 카테고리 비교
        const currentPostCategory = getPostCategoryEnum(document.querySelector('input[name="communityCategory"]:checked').value);
        if (currentPostCategory !== originalData.postCategory) return true;

        const currentPetCategory = getPetCategoryEnum(document.querySelector('input[name="petCategory"]:checked').value);
        if (currentPetCategory !== originalData.petCategory) return true;

        // 태그 비교
        if (selectedTags.length !== originalData.tags.length) return true;

        // 태그 내용 비교 (ID와 이름 매핑하여 비교)
        const selectedTagNames = selectedTags.map(tagId => {
            const tag = tags.find(t => t.tagId === tagId);
            return tag ? tag.tagName : null;
        }).filter(name => name !== null).sort();

        const originalTagNames = [...originalData.tags].sort();

        // 배열 내용 비교
        for (let i = 0; i < selectedTagNames.length; i++) {
            if (selectedTagNames[i] !== originalTagNames[i]) {
                return true; // 태그가 변경됨
            }
        }

        // 삭제 예정 사진/비디오 확인
        if (photosToDelete.length > 0) return true;
        if (videoToDelete) return true;

        // 새로 업로드할 사진/비디오 확인
        if (uploadedPhotos.length > 0) return true;
        if (uploadedVideo) return true;

        return false;
    }

    // 게시글 업데이트 처리
    async function handlePostUpdate() {
        const title = postTitleInput.value.trim();
        const content = postContentTextarea.value.trim();

        // 선택된 카테고리 가져오기
        let postCategory = '';
        for (const btn of categoryButtons) {
            if (btn.checked) {
                postCategory = getPostCategoryEnum(btn.value);
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

        // 기본 유효성 검사
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

        // 변경사항이 없는 경우
        if (!hasChanges()) {
            showConfirmModal(
                '변경사항이 없습니다. 커뮤니티로 돌아가시겠습니까?',
                function () {
                    window.location.href = '/community';
                }
            );
            return;
        }

        // PostUpdateDTO 생성
        const postUpdateDTO = {
            postCategory: postCategory,
            petCategory: petCategory,
            title: title,
            content: content,
            tagIds: selectedTags,
            deleteImageUrls: photosToDelete.join(","),
            deleteVideo: videoToDelete
        };

        // FormData 객체 생성
        const formData = new FormData();
        formData.append('updateDTO', new Blob([JSON.stringify(postUpdateDTO)], {
            type: 'application/json'
        }));

        // 새로운 사진이 있는 경우 추가
        if (uploadedPhotos.length > 0) {
            uploadedPhotos.forEach(file => {
                formData.append('files', file);
            });
        }

        // 새로운 비디오가 있는 경우 추가
        if (uploadedVideo) {
            formData.append('video', uploadedVideo);
        }

        try {
            const response = await fetch('/api/v1/posts/' + postId, {
                method: 'PUT',
                body: formData
            });

            if (!response.ok) {
                // HTTP 오류 처리
                const errorData = await response.json();
                throw new Error(`서버 오류: ${response.status} ${response.statusText} - ${errorData.message || ''}`);
            }
            const data = await response.json();
            alert('게시물이 성공적으로 수정되었습니다.');

            // 게시글 상세 페이지로 이동
            window.location.href = `/community/post/${postId}`;
        } catch (error) {
            console.error('게시물 수정 중 오류 발생:', error);
            alert('게시물 수정 중 오류가 발생했습니다: ' + error.message);
        }
    }

    function setupTagInput() {
        // 태그 입력 컨테이너 생성
        const tagInputContainer = document.createElement('div');
        tagInputContainer.classList.add('tag-input-container', 'd-flex', 'flex-wrap', 'align-items-center');
        tagInputContainer.style.position = 'relative';


        // 기존 태그 입력란의 부모 요소
        const tagInputParent = postTagsInput.parentElement;

        // 선택된 태그들이 표시될 영역
        selectedTagsContainer = document.createElement('div');
        selectedTagsContainer.classList.add('selected-tags-container', 'd-flex', 'flex-wrap');

        // 태그 입력을 위한 input 요소
        const tagInput = document.createElement('input');
        tagInput.type = 'text';
        tagInput.classList.add('tag-input', 'border-0', 'flex-grow-1');
        tagInput.placeholder = '태그를 입력하세요...';

        // 자동완성 드롭다운
        const autocompleteDropdown = document.createElement('div');
        autocompleteDropdown.classList.add('autocomplete-dropdown', 'position-absolute', 'bg-white', 'border', 'rounded', 'mt-1', 'w-100', 'shadow-sm');
        autocompleteDropdown.style.display = 'none';
        autocompleteDropdown.style.zIndex = '1000';
        autocompleteDropdown.style.maxHeight = '200px';
        autocompleteDropdown.style.top = '100%';
        autocompleteDropdown.style.overflowY = 'auto';

        // 원래 input 숨기기
        postTagsInput.style.display = 'none';

        // 새 요소들 추가
        tagInputContainer.appendChild(selectedTagsContainer);
        tagInputContainer.appendChild(tagInput);
        tagInputContainer.appendChild(autocompleteDropdown);

        // 기존 입력란 다음에 새 컨테이너 추가
        tagInputParent.insertBefore(tagInputContainer, postTagsInput.nextSibling);

        // 키보드 네비게이션을 위한 변수
        let currentFocus = -1;

        // 태그 입력 이벤트 처리
        tagInput.addEventListener('input', function () {
            const inputValue = this.value.trim();
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
                        tagItem.dataset.tagId = tag.tagId;
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
        tagInput.addEventListener('keydown', function (e) {
            const items = autocompleteDropdown.querySelectorAll('.dropdown-item');

            if (!items.length) return;

            if (autocompleteDropdown.style.display === 'block') {
                // 아래 방향키
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    currentFocus++;
                    if (currentFocus >= items.length) currentFocus = 0;
                    setActiveItem(items);
                }
                // 위 방향키
                else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    currentFocus--;
                    if (currentFocus < 0) currentFocus = items.length - 1;
                    setActiveItem(items);
                }
                // 엔터키
                else if (e.key === 'Enter' && currentFocus > -1) {
                    e.preventDefault();
                    if (items[currentFocus]) {
                        items[currentFocus].click();
                    }
                }
                // ESC 키
                else if (e.key === 'Escape') {
                    autocompleteDropdown.style.display = 'none';
                    currentFocus = -1;
                }
            } else if (e.key === 'Enter' && this.value.trim() !== '') {
                e.preventDefault();
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

        // 활성 아이템 설정
        function setActiveItem(items) {
            removeActiveClass(items);

            if (currentFocus >= 0 && currentFocus < items.length) {
                items[currentFocus].classList.add('active');

                // 스크롤 조정
                const activeItem = items[currentFocus];
                const dropdownRect = autocompleteDropdown.getBoundingClientRect();
                const activeItemRect = activeItem.getBoundingClientRect();

                if (activeItemRect.bottom > dropdownRect.bottom) {
                    autocompleteDropdown.scrollTop += activeItemRect.bottom - dropdownRect.bottom;
                } else if (activeItemRect.top < dropdownRect.top) {
                    autocompleteDropdown.scrollTop -= dropdownRect.top - activeItemRect.top;
                }
            }
        }

        // 활성 클래스 제거
        function removeActiveClass(items) {
            for (let i = 0; i < items.length; i++) {
                items[i].classList.remove('active');
            }
        }
    }

    // 태그 추가 함수
    function addTag(tag) {
        if (!selectedTags.includes(tag.tagId)) {
            selectedTags.push(tag.tagId);
            addTagToUI(tag);
        }
    }

    // UI에 태그 추가
    function addTagToUI(tag) {
        selectedTagsContainer = document.querySelector('.selected-tags-container');

        // 태그 UI 요소 생성
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
    }

    // 태그 제거 함수
    function removeTag(tagId, element) {
        const index = selectedTags.indexOf(tagId);
        if (index > -1) {
            selectedTags.splice(index, 1);
            element.remove();
            // hidden input 업데이트
            updateTagsInput();
        }
    }

    function updateTagsInput() {
        postTagsInput.value = JSON.stringify(selectedTags);
    }

    async function initTagBtn(){
        const tagSuggestionBtn = document.getElementById('tagSuggestionBtn');
        const tagSuggestionContainer = document.getElementById('tagSuggestionContainer');
        const tagSuggestionLoading = document.querySelector('.tag-suggestion-loading');
        const tagSuggestionResults = document.querySelector('.tag-suggestion-results');
        const postContentTextarea = document.getElementById('postContent');
        const postTitleInput = document.getElementById('postTitle');

        if (!tagSuggestionBtn) return;

        tagSuggestionBtn.addEventListener('click', async function() {
            // 제목과 내용이 있는지 확인
            const title = postTitleInput.value.trim();
            const content = postContentTextarea.value.trim();

            if (!title && !content) {
                alert('태그를 추천받으려면 제목 또는 내용을 입력해주세요.');
                return;
            }

            // 로딩 상태 표시
            tagSuggestionContainer.style.display = 'block';
            tagSuggestionLoading.style.display = 'flex';
            tagSuggestionResults.innerHTML = '';

            try {
                // AI API 호출
                const response = await fetch('/api/v1/mcp/tag/post', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        title,
                        content
                    })
                });

                if (!response.ok) {
                    throw new Error('태그 추천을 가져오는데 실패했습니다.');
                }

                const responseData = await response.json();

                // tags 속성에서 태그 배열 추출
                const suggestedTags = responseData.tags || [];

                // 로딩 숨기기
                tagSuggestionLoading.style.display = 'none';

                // 결과가 있는 경우
                if (suggestedTags && suggestedTags.length > 0) {
                    suggestedTags.forEach(tagName => {
                        const tagElement = document.createElement('div');
                        tagElement.classList.add('suggested-tag');
                        tagElement.innerHTML = `<i class="fa fa-tag"></i>${tagName}`;

                        // 이미 선택된 태그인지 확인 (문자열로 확인)
                        const isAlreadySelected = Array.from(document.querySelectorAll('.selected-tag span:first-child'))
                            .some(span => span.textContent === `#${tagName}`);

                        if (isAlreadySelected) {
                            tagElement.classList.add('selected');
                        }

                        // 태그 클릭 이벤트
                        tagElement.addEventListener('click', function() {
                            // 태그 목록이 존재하는지 확인
                            if (window.tags && Array.isArray(window.tags)) {
                                // 모든 태그에서 이름이 일치하는 태그 찾기
                                const matchingTag = window.tags.find(tag => tag.tagName === tagName);
                                if (matchingTag) {
                                    // 선택된 스타일 적용
                                    tagElement.classList.add('selected');
                                    // 글로벌 스코프에 있는 addTag 함수 호출
                                    window.addTag(matchingTag);
                                    return; // 추가 후 함수 종료
                                }
                            }

                            // 태그가 시스템에 없거나 tags 배열이 없는 경우 (새 태그)
                            // 임시 태그 객체 생성 (ID는 실제 생성 시 백엔드에서 부여)
                            const tempTag = {
                                tagId: `5000000`, // 임시 ID
                                tagName: tagName
                            };

                            // 선택된 스타일 적용
                            tagElement.classList.add('selected');
                            // 글로벌 스코프에 있는 addTag 함수 호출
                            window.addTag(tempTag);

                        });

                        tagSuggestionResults.appendChild(tagElement);
                    });
                } else {
                    // 결과가 없는 경우
                    tagSuggestionResults.innerHTML = '<div class="text-muted small">내용에 맞는 태그를 찾을 수 없습니다. 직접 입력해주세요.</div>';
                }

            } catch (error) {
                console.error('태그 추천 오류:', error);
                tagSuggestionLoading.style.display = 'none';
                tagSuggestionResults.innerHTML = '<div class="text-danger small">태그 추천 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.</div>';
            }
        });
    }



    // 확인 모달 표시
    function showConfirmModal(message, callback) {
        confirmMessage.textContent = message;

        // 기존 이벤트 리스너 제거
        const newConfirmBtn = confirmActionBtn.cloneNode(true);
        confirmActionBtn.parentNode.replaceChild(newConfirmBtn, confirmActionBtn);

        // 새 이벤트 리스너 추가
        newConfirmBtn.addEventListener('click', function () {
            confirmModal.hide();
            if (typeof callback === 'function') {
                callback();
            }
        });

        confirmModal.show();
    }

    // 카테고리 Enum 변환 함수
    function getPostCategoryEnum(categoryValue) {
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

    function getPostCategoryValue(categoryEnum) {
        switch (categoryEnum) {
            case 'FREE':
                return '자유게시판';
            case 'QNA':
                return '질문하기';
            case 'TOOL':
                return '펫 도구 후기';
            case 'MYPET':
                return '자랑하기';
            default:
                return '자유게시판';
        }
    }

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

    function getPetCategoryValue(categoryEnum) {
        switch (categoryEnum) {
            case 'DOG':
                return '강아지';
            case 'CAT':
                return '고양이';
            case 'ETC':
                return '기타';
            default:
                return '강아지';
        }
    }
});