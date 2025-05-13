let editTrainerModal;
let currentPhotos = [null, null]; // 좌측(0), 우측(1)

// 문서 로드 후 초기화
document.addEventListener('DOMContentLoaded', async function () {
    editTrainerModal = new bootstrap.Modal(document.getElementById('editTrainerModal'));
    await setupModalEventListeners();
});

// 모달 이벤트 리스너 설정
async function setupModalEventListeners() {
    // 저장 버튼 이벤트
    const saveTrainerBtn = document.getElementById('save-trainer-btn');
    if (saveTrainerBtn) {
        saveTrainerBtn.addEventListener('click', await saveTrainerProfile);
    }
}

// 트레이너 프로필 편집 모달 열기
function openEditTrainerModal(trainerData) {
    document.getElementById('trainer-id').value = trainerData.id;
    document.getElementById('edit-title').value = trainerData.title;
    document.getElementById('edit-career').value = trainerData.career;
    document.getElementById('edit-specialties').value = trainerData.specialties;
    document.getElementById('edit-locations').value = trainerData.locations;
    document.getElementById('edit-description').value = trainerData.description;

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

    // 기존 사진 세팅 (0: 좌측, 1: 우측)
    currentPhotos = [null, null];
    trainerData.photos.forEach((photo, idx) => {
        if (idx < 2) currentPhotos[idx] = {
            id: photo.id || null,
            fileUrl: photo.fileUrl || photo,
            isNew: false,
            position: idx
        };
    });

    renderPhotoSlots();
    editTrainerModal.show();
}

// 이미지 슬롯 렌더링 (좌우 1:1 비율)
function renderPhotoSlots() {
    const container = document.getElementById('photos-container');
    container.innerHTML = '';

    const row = document.createElement('div');
    row.className = 'row photo-edit-container';
    container.appendChild(row);

    [0, 1].forEach(index => {
        const col = document.createElement('div');
        col.className = 'col-md-6 image-slot';
        col.dataset.index = index;

        if (currentPhotos[index]) {
            col.innerHTML = `
                <div class="photo-wrapper ratio ratio-1x1">
                    <img src="${currentPhotos[index].fileUrl}" class="img-fluid" alt="사진 ${index + 1}">
                </div>`;
        } else {
            col.innerHTML = `
                <div class="upload-placeholder ratio ratio-1x1">
                    <i class="bi bi-image"></i>
                    <p>사진 추가(${index + 1})</p>
                </div>`;
        }

        // 클릭 시 수정 함수 호출
        col.addEventListener('click', () => editPhotoInput(index));
        row.appendChild(col);
    });
}

// 특정 슬롯에 사진 추가/교체
function editPhotoInput(slotIndex) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';

    fileInput.addEventListener('change', function () {
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            reader.onload = function (e) {
                currentPhotos[slotIndex] = {
                    id: currentPhotos[slotIndex]?.id || null,
                    fileUrl: e.target.result,
                    isNew: true,
                    position: slotIndex,
                };
                renderPhotoSlots();
            };
            reader.readAsDataURL(this.files[0]);
        }
        document.body.removeChild(fileInput);
    });

    document.body.appendChild(fileInput);
    fileInput.click();
}

function base64ToBlob(base64, mimeType = 'image/jpeg') {
    const byteString = atob(base64.split(',')[1]); // base64 헤더 제거
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], {type: mimeType});
}

// 사진 파일 서버 업로드 함수, 0: 좌측, 1: 우측
async function uploadPhotoFile(base64, position) {
    const blob = base64ToBlob(base64);
    const file = new File([blob], 'upload.jpg', {type: blob.type}); // Blob -> File

    const formData = new FormData();
    formData.append('file', file);

    const trainerId = document.getElementById('trainer-id').value;
    const res = await fetch(`/api/v1/trainers/${trainerId}/images/${position}`, {
        method: 'PUT',
        body: formData
    });

    if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Upload failed');
    }

    const data = await res.json();
    return data;
}

// 트레이너 프로필 저장
async function saveTrainerProfile() {
    const trainerId = document.getElementById('trainer-id').value;
    const trainerData = {
        id: trainerId,
        title: document.getElementById('edit-title').value,
        career: document.getElementById('edit-career').value,
        specialties: document.getElementById('edit-specialties').value,
        locations: document.getElementById('edit-locations').value,
        description: document.getElementById('edit-description').value,
        photos: [],
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

    // 새로 추가된 사진 업로드 및 기존 사진 병합
    for (let i = 0; i < 2; i++) {
        const photo = currentPhotos[i];
        console.log("photo: ", photo);
        if (photo.isNew) {
            try {
                const uploaded = await uploadPhotoFile(photo.fileUrl, i);
                trainerData.photos.push({
                    id: uploaded.id,
                    fileUrl: uploaded.fileUrl,
                    isNew: false,      // 업로드가 완료됐으므로 false 처리
                    position: i        // 위치 정보 유지
                });
            } catch (err) {
                alert(`사진 ${i + 1} 업로드 실패: ` + err.message);
                throw Error('사진 업로드 실패');
            }
        } else {
            trainerData.photos.push({
                id: photo.id,
                fileUrl: photo.fileUrl,
                isNew: false,
                position: photo.position // 기존에도 위치 정보 유지
            });
        }

    }

    if (!validateTrainerForm({...trainerData, photos: trainerData.photos})) return;

    try {
        await updateTrainerProfile(trainerData);
        Object.assign(window.trainerData, trainerData);
        renderTrainerProfile(window.trainerData);
        editTrainerModal.hide();
        showSuccessMessage('트레이너 정보가 성공적으로 업데이트되었습니다.');
    } catch (err) {
        alert('프로필 업데이트 중 오류가 발생했습니다: ' + err.message);
    }
}

// 트레이너 프로필 업데이트 API 호출
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
        introduction: trainerData.description,
        photoPositions: trainerData.photos.filter(p => p.id !== null).map(p => ({id: p.id, position: p.position}))
    };
    formData.append('profileData', new Blob([JSON.stringify(profileData)], {type: 'application/json'}));

    const res = await fetch(`/api/v1/trainers/${trainerData.id}`, {method: 'PUT', body: formData});
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to update trainer profile');
    }
    return res.json();
}

// 폼 검증 및 유틸
function validateTrainerForm(data) {
    const fields = ['title', 'career', 'specialties', 'locations', 'description'];
    for (const f of fields) {
        if (!data[f] || !data[f].trim()) {
            alert(`${getFieldName(f)}을(를) 입력해주세요.`);
            return false;
        }
    }
    for (const price of data.prices) {
        if (!price.duration || parseInt(price.duration) <= 0) {
            alert('교육 시간을 올바르게 입력해주세요.');
            return false;
        }
        if (!price.amount || price.amount <= 0) {
            alert('교육 가격을 올바르게 입력해주세요.');
            return false;
        }
    }
    if (currentPhotos.length === 0) {
        alert('최소 한 장 이상의 사진을 등록해주세요.');
        return false;
    }
    return true;
}

function getFieldName(key) {
    const map = {title: '제목', career: '경력', specialties: '전문 분야', locations: '방문 지역', description: '자기소개'};
    return map[key] || key;
}

// 성공 메시지 표시
function showSuccessMessage(msg) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show';
    alertDiv.setAttribute('role', 'alert');
    alertDiv.innerHTML = `${msg}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;
    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => alertDiv.remove(), 150);
    }, 3000);
}

// 파일 크기 포맷
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}