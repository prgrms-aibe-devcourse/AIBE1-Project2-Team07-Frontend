// 트레이너 프로필 편집 모달 관련 스크립트
let editTrainerModal;
let currentPhotos = []; // 현재 사진 목록 저장
let originalPhotos = []; // 원본 사진 저장용

// 문서 로드 후 초기화
document.addEventListener('DOMContentLoaded', async function () {
    // 모달 요소 가져오기
    editTrainerModal = new bootstrap.Modal(document.getElementById('editTrainerModal'));

    // 모달 내 요소들에 대한 이벤트 리스너 설정
    await setupModalEventListeners();
});

// 모달 이벤트 리스너 설정
async function setupModalEventListeners() {
    // 사진 추가 버튼 이벤트
    const addPhotoBtn = document.getElementById('add-photo-btn');
    if (addPhotoBtn) {
        addPhotoBtn.addEventListener('click', addPhotoInput);
    }

    // 저장 버튼 이벤트
    const saveTrainerBtn = document.getElementById('save-trainer-btn');
    if (saveTrainerBtn) {
        saveTrainerBtn.addEventListener('click', await saveTrainerProfile);
    }

    // 교육 문의 모달 관련 이벤트 리스너
    setupInquiryModalListeners();
}

// 교육 문의 모달 이벤트 리스너 설정
function setupInquiryModalListeners() {
    // 교육 문의 버튼 클릭 시 모달 열기
    const inquiryButton = document.getElementById('inquiry-button');
    if (inquiryButton) {
        inquiryButton.addEventListener('click', function () {
            const inquiryModal = new bootstrap.Modal(document.getElementById('inquiryModal'));

            // 트레이너 이름을 모달 제목에 설정
            const modalTitle = document.getElementById('inquiryModalLabel');
            if (modalTitle && trainerData) {
                modalTitle.textContent = `${trainerData.name}에게 교육 문의하기`;
            }

            inquiryModal.show();
        });
    }

    // 문의 내용 글자 수 카운트
    const inquiryMessage = document.getElementById('inquiryMessage');
    const charCount = document.getElementById('charCount');

    if (inquiryMessage && charCount) {
        inquiryMessage.addEventListener('input', function () {
            const count = this.value.length;
            charCount.textContent = count;

            // 20자 이상 입력 시 문의하기 버튼 활성화
            const submitBtn = document.getElementById('submitInquiry');
            if (submitBtn) {
                submitBtn.disabled = count < 20;
            }
        });
    }


    // 파일 첨부 버튼 클릭 시 파일 입력 창 열기
    const fileAttachmentBtn = document.getElementById('fileAttachmentBtn');
    const inquiryFileInput = document.getElementById('inquiryFileInput');

    if (fileAttachmentBtn && inquiryFileInput) {
        fileAttachmentBtn.addEventListener('click', function () {
            inquiryFileInput.click();
        });

        // 파일 선택 시 파일명 표시
        inquiryFileInput.addEventListener('change', function () {
            const fileList = document.getElementById('fileList');
            if (fileList) {
                fileList.innerHTML = '';

                if (this.files.length > 0) {
                    for (let i = 0; i < this.files.length; i++) {
                        const fileItem = document.createElement('div');
                        fileItem.className = 'file-item';
                        fileItem.innerHTML = `
                            <span class="file-name">${this.files[i].name}</span>
                            <span class="file-size">(${formatFileSize(this.files[i].size)})</span>
                        `;
                        fileList.appendChild(fileItem);
                    }
                }
            }
        });
    }

    // 문의하기 버튼 클릭 시 처리
    const submitInquiryBtn = document.getElementById('submitInquiry');
    if (submitInquiryBtn) {
        submitInquiryBtn.addEventListener('click', submitInquiry);
    }
}

// 트레이너 프로필 편집 모달 열기
function openEditTrainerModal(trainerData) {
    // 현재 트레이너 정보로 모달 폼 채우기
    document.getElementById('trainer-id').value = trainerData.id;
    document.getElementById('edit-title').value = trainerData.title;
    document.getElementById('edit-career').value = trainerData.career;
    document.getElementById('edit-specialties').value = trainerData.specialties;
    document.getElementById('edit-locations').value = trainerData.locations;
    document.getElementById('edit-description').value = trainerData.description;

    // 가격 정보 설정
    const visitPrice = trainerData.prices.find(p => p.type === "방문교육");
    const videoPrice = trainerData.prices.find(p => p.type === "영상교육");

    if (visitPrice) {
        document.getElementById('visit-duration').value = parseInt(visitPrice.duration);
        document.getElementById('visit-price').value = visitPrice.amount;
    }

    if (videoPrice) {
        document.getElementById('video-duration').value = parseInt(videoPrice.duration);
        document.getElementById('video-price').value = videoPrice.amount;
    }

    originalPhotos = trainerData.photos;

    // 사진 정보 설정
    setupPhotosInModal(trainerData.photos);

    // 모달 열기
    editTrainerModal.show();
}

// 모달에 사진 설정
function setupPhotosInModal(photos) {
    const photosContainer = document.getElementById('photos-container');
    photosContainer.innerHTML = '';
    currentPhotos = [...photos];

    // 사진 프리뷰 렌더링
    currentPhotos.forEach((photo, idx) => addPhotoPreview(photo, idx));

    // 사진 추가 버튼 활성/비활성
    const addBtn = document.getElementById('add-photo-btn');
    if (addBtn) {
        addBtn.disabled = currentPhotos.length >= 2;
    }
}

// 사진 미리보기 추가
function addPhotoPreview(photo, index) {
    const photosContainer = document.getElementById('photos-container');

    const photoCol = document.createElement('div');
    photoCol.className = 'col-md-4 mb-3';
    photoCol.dataset.index = index;

    photoCol.innerHTML = `
        <div class="photo-preview-container">
            <img src="${photo.fileUrl}" class="img-fluid photo-preview" alt="트레이너 사진">
            <button type="button" class="btn btn-danger btn-sm delete-photo" data-index="${index}">
                <i class="bi bi-trash"></i> 삭제
            </button>
        </div>
    `;

    // 삭제 버튼에 이벤트 리스너 추가
    const deleteBtn = photoCol.querySelector('.delete-photo');
    deleteBtn.addEventListener('click', function () {
        const index = parseInt(this.dataset.index);
        deletePhoto(index);
    });

    photosContainer.appendChild(photoCol);
}

// 사진 입력 추가
function addPhotoInput() {
    if (currentPhotos.length >= 2) {
        alert('사진은 최대 2장까지만 등록할 수 있습니다.');
        return;
    }

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';

    fileInput.addEventListener('change', function () {
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const photo = {fileUrl: e.target.result};
                currentPhotos.push(photo);
                addPhotoPreview(photo, currentPhotos.length - 1);
                // 사진 추가 버튼 활성/비활성 재검사
                document.getElementById('add-photo-btn').disabled = currentPhotos.length >= 2;
            };
            reader.readAsDataURL(this.files[0]);
        }
        document.body.removeChild(fileInput);
    });

    document.body.appendChild(fileInput);
    fileInput.click();
}

// 사진 삭제
function deletePhoto(index) {
    // 현재 사진 목록에서 해당 인덱스 제거
    currentPhotos.splice(index, 1);

    // 모달에서 사진 미리보기 다시 렌더링
    setupPhotosInModal(currentPhotos);
}

// 트레이너 프로필 저장
async function saveTrainerProfile() {
    // 폼 데이터 수집
    const trainerData = {
        id: document.getElementById('trainer-id').value,
        title: document.getElementById('edit-title').value,
        career: document.getElementById('edit-career').value,
        specialties: document.getElementById('edit-specialties').value,
        locations: document.getElementById('edit-locations').value,
        description: document.getElementById('edit-description').value,
        photos: currentPhotos,
        prices: [
            {
                type: "방문교육",
                duration: document.getElementById('visit-duration').value + "분",
                amount: parseInt(document.getElementById('visit-price').value)
            },
            {
                type: "영상교육",
                duration: document.getElementById('video-duration').value + "분",
                amount: parseInt(document.getElementById('video-price').value)
            }
        ]
    };

    // 폼 검증
    if (!validateTrainerForm(trainerData)) {
        return;
    }

    // API 호출 (백엔드 연동 시)
    await updateTrainerProfile(trainerData);

    // 임시로 로컬 데이터 업데이트
    Object.assign(window.trainerData, trainerData);

    // UI 업데이트
    renderTrainerProfile(window.trainerData);

    // 모달 닫기
    editTrainerModal.hide();

    // 성공 메시지 표시
    showSuccessMessage('트레이너 정보가 성공적으로 업데이트되었습니다.');
}

async function updateTrainerProfile(trainerData) {
    const formData = new FormData();

    const profileData = {
        title: trainerData.title,
        representativeCareer: trainerData.career,
        specializationText: trainerData.specialties,
        visitingAreas: trainerData.locations,
        serviceFees: trainerData.prices.map(price => ({
            serviceType: price.type === "방문교육" ? "VISIT_TRAINING" : "VIDEO_TRAINING",
            time: price.duration.split('분')[0],
            price: price.amount
        })),
        tags: [],
        introduction: trainerData.description
    };

    // Add profile data as JSON
    formData.append('profileData', new Blob([JSON.stringify(profileData)], {
        type: 'application/json'
    }));

    if (isPhotoModified(originalPhotos, trainerData.photos)) {
        const photoFiles = await Promise.all(
            trainerData.photos.map(async (photoData, index) => {
                if (photoData instanceof File) return photoData;
                const response = await fetch(photoData.fileUrl || photoData);
                const blob = await response.blob();
                return new File([blob], `trainer_photo_${index}.jpg`, {type: blob.type || 'image/jpeg'});
            })
        );
        photoFiles.forEach(file => {
            formData.append('photos', file);
        });
    }

    // Send the PUT request
    const response = await fetch(`/api/v1/trainers/${trainerData.id}`, {
        method: 'PUT',
        body: formData,
    });

    // Check if the response is successful
    if (!response.ok) {
        // Parse error response
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update trainer profile');
    }
}

function isPhotoModified(original, current) {
    if (original.length !== current.length) return true;

    for (let i = 0; i < original.length; i++) {
        if (original[i].fileUrl !== current[i].fileUrl || original[i].fileName !== current[i].fileName) {
            return true;
        }
    }
    return false;
}

// 폼 검증
function validateTrainerForm(data) {
    // 필수 필드 확인
    const requiredFields = ['title', 'career', 'specialties', 'locations', 'description'];

    for (const field of requiredFields) {
        if (!data[field] || data[field].trim() === '') {
            alert(`${getFieldName(field)}을(를) 입력해주세요.`);
            return false;
        }
    }

    // 가격 정보 확인
    for (const price of data.prices) {
        if (!price.duration || parseInt(price.duration) <= 0) {
            alert('교육 시간을 올바르게 입력해주세요.');
            return false;
        }

        if (!price.amount || parseInt(price.amount) <= 0) {
            alert('교육 가격을 올바르게 입력해주세요.');
            return false;
        }
    }

    // 사진 확인
    if (data.photos.length === 0) {
        alert('최소 한 장 이상의 사진을 등록해주세요.');
        return false;
    }

    return true;
}

// 필드 이름 가져오기
function getFieldName(field) {
    const fieldNames = {
        'title': '제목',
        'career': '경력',
        'specialties': '전문 분야',
        'locations': '방문 지역',
        'description': '자기소개'
    };

    return fieldNames[field] || field;
}

// 성공 메시지 표시
function showSuccessMessage(message) {
    // 임시 알림 메시지 표시
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show';
    alertDiv.setAttribute('role', 'alert');
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    // 페이지 상단에 알림 메시지 추가
    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);

    // 3초 후 알림 메시지 자동 제거
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => alertDiv.remove(), 150);
    }, 3000);
}

// 교육 문의 제출
function submitInquiry() {
    // 폼 데이터 수집
    const petType = document.getElementById('petType').value;
    const petBreed = document.getElementById('petBreed').value;
    const petAgeYears = document.getElementById('petAgeYears').value;
    const petAgeMonths = document.getElementById('petAgeMonths').value;
    const inquiryMessage = document.getElementById('inquiryMessage').value;
    const fileInput = document.getElementById('inquiryFileInput');

    // 폼 검증
    if (!petType || !petBreed || !petAgeYears || !inquiryMessage) {
        alert('모든 필수 항목을 입력해주세요.');
        return;
    }

    if (inquiryMessage.length < 20) {
        alert('문의 내용은 최소 20자 이상 입력해주세요.');
        return;
    }

    // 문의 데이터 객체 생성
    const inquiryData = {
        trainerId: trainerId,
        petType,
        petBreed,
        petAge: {
            years: parseInt(petAgeYears) || 0,
            months: parseInt(petAgeMonths) || 0
        },
        message: inquiryMessage,
        files: fileInput.files
    };

    // API 호출 (백엔드 연동 시)
    // submitTrainerInquiry(inquiryData);

    // 모달 닫기
    const inquiryModal = bootstrap.Modal.getInstance(document.getElementById('inquiryModal'));
    inquiryModal.hide();

    // 성공 메시지 표시
    showSuccessMessage('교육 문의가 성공적으로 전송되었습니다.');

    // 폼 초기화
    resetInquiryForm();
}

// 교육 문의 폼 초기화
function resetInquiryForm() {
    document.getElementById('petType').value = '';
    document.getElementById('petBreed').value = '';
    document.getElementById('petAgeYears').value = '';
    document.getElementById('petAgeMonths').value = '';
    document.getElementById('inquiryMessage').value = '';
    document.getElementById('inquiryFileInput').value = '';
    document.getElementById('fileList').innerHTML = '';
    document.getElementById('charCount').textContent = '0';
    document.getElementById('submitInquiry').disabled = true;
}

// 파일 크기 포맷
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}