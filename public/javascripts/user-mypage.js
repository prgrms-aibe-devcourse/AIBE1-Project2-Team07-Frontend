const userJSON = localStorage.getItem('user');
const accessToken = localStorage.getItem('accessToken');
let storedUser = null;

try {
    storedUser = JSON.parse(userJSON);
} catch (e) {
    console.error('로컬스토리지 사용자 정보 파싱 실패:', e);
}

// 전역 변수로 현재 페이지와 페이지당 아이템 개수 설정
let currentPage = 1;
const itemsPerPage = 5;
// 현재 로드된 게시물을 전역 변수로 저장 (검색에 사용)
let currentPosts = [];
let searchQuery = '';
let currentTab = 'profile';

const tabStates = {
    profile: {currentPage: 1},
    mypost: {currentPage: 1},
    liked: {currentPage: 1},
    advice: {currentPage: 1}
};

async function setupSearchButton() {
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('search-input');

    if (searchButton && searchInput) {
        searchButton.addEventListener('click', async function () {
            const query = searchInput.value.trim().toLowerCase();
            searchQuery = query;

            if (query) {
                let searchResults = [];

                // 현재 로드된 게시물에서 검색
                if (currentPosts && currentPosts.length > 0) {
                    searchResults = currentPosts.filter(post =>
                        (post.title && post.title.toLowerCase().includes(query)) ||
                        (post.content && post.content.toLowerCase().includes(query))
                    );

                    tabStates[currentTab].currentPage = 1;

                    // 현재 활성화된 탭에 따라 적절한 렌더링 함수 호출
                    if (currentTab === 'advice') {
                        showUserAdvices(searchResults);
                    } else {
                        renderPosts(searchResults, 1);
                    }
                } else {
                    // 검색할 데이터가 없는 경우
                    alert('검색할 데이터가 없습니다. 먼저 게시물을 불러와주세요.');
                }

                if (searchResults.length === 0) {
                    alert(`'${query}'에 해당하는 결과가 없습니다.`);
                }
            } else {
                // 검색어가 비었을 경우 전체 목록 표시
                switchTab(currentTab, false);
            }
        });

        // 엔터키로도 검색 가능
        searchInput.addEventListener('keyup', function (e) {
            if (e.key === 'Enter') {
                searchButton.click();
            }
        });
    }
}

// 사용자 프로필 업데이트 함수
async function updateUserProfile() {
    // 입력 필드에서 값 가져오기
    const nameInput = document.querySelector('.profile-input[name="name"]');
    const nicknameInput = document.querySelector('.profile-input[name="nickname"]');
    const fileInput = document.querySelector('.profile-input[name="profileImage"]');

    if (!nameInput || !nicknameInput) {
        throw new Error('프로필 입력 필드를 찾을 수 없습니다.');
    }

    const name = nameInput.value.trim();
    const nickname = nicknameInput.value.trim();

    const latestUser = JSON.parse(localStorage.getItem('user'));
    let profileImageUrl = latestUser.profileImageUrl;

    // 입력 값 검증
    if (!name || !nickname) {
        throw new Error('이름과 닉네임은 필수 입력 항목입니다.');
    }

    if (fileInput && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const res = await uploadProfileImage(file);
        profileImageUrl = res.profileImageUrl;
    }

    // 프로필 업데이트 요청 데이터
    const updateData = {
        name,
        nickname,
        profileImageUrl
    };

    // API 호출
    const response = await fetch(`/api/v1/users/update`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
    });

    if (!response.ok) {
        throw new Error(`프로필 업데이트 실패: ${response.status}`);
    }

    const updatedUserData = await response.json();

    // 로컬 스토리지 사용자 정보 업데이트
    localStorage.setItem('user', JSON.stringify({
        ...storedUser,
        name: name,
        nickname: nickname
    }));

    return updatedUserData;
}

// 프로필 정보 렌더링 함수
function renderProfile() {
    let profileSection = document.querySelector('.profile-section');

    // 모든 컨텐츠 영역 숨기기 (검색바도 여기서 숨겨짐)
    hideAllContent();

    if (!profileSection) {
        profileSection = document.createElement('div');
        profileSection.className = 'profile-section';

        // 사용자 정보 새로 불러오기
        const userJSON = localStorage.getItem('user');
        const storedUser = userJSON ? JSON.parse(userJSON) : {};
        const imgUrl = storedUser.profileImageUrl && storedUser.profileImageUrl.trim()
            ? storedUser.profileImageUrl
            : 'https://placehold.co/180x180';

        profileSection.innerHTML = `
            <div class="profile-image-container">
                <img src="${imgUrl}" alt="프로필 이미지" class="profile-image">
                <div class="profile-image-overlay">
                    <img src="images/icons/camera.svg" alt="사진 아이콘" class="camera-icon">
                </div>
            </div>
            
            <div class="profile-info">
                <div class="profile-info-row">
                    <div class="profile-info-label">닉네임</div>
                    <div class="profile-info-value">
                        <input type="text" class="profile-input" name="nickname" value="${storedUser.nickname || ''}">
                    </div>
                </div>
                <div class="profile-info-row">
                    <div class="profile-info-label">이름</div>
                    <div class="profile-info-value">
                        <input type="text" class="profile-input" name="name" value="${storedUser.name || ''}">
                    </div>
                </div>
                <div class="profile-info-row">
                    <div class="profile-info-label">이메일</div>
                    <div class="profile-info-value">
                        <input type="email" class="profile-input" name="email" value="${storedUser.email || ''}" readonly>
                    </div>
                </div>
            </div>
            
            <div class="profile-button-group">
                <button class="profile-button save-button">저장하기</button>
                <button class="profile-button edit-button">훈련사 신청</button>
            </div>
        `;

        const contentWrapper = document.querySelector('.content-wrapper');
        if (contentWrapper) {
            contentWrapper.appendChild(profileSection);
        }
    } else {
        // 프로필 섹션이 이미 존재하는 경우, 최신 사용자 정보로 업데이트
        const userJSON = localStorage.getItem('user');
        const storedUser = userJSON ? JSON.parse(userJSON) : {};
        const imgUrl = storedUser.profileImageUrl && storedUser.profileImageUrl.trim()
            ? storedUser.profileImageUrl
            : 'https://placehold.co/180x180';

        const profileImage = profileSection.querySelector('.profile-image');
        if (profileImage) profileImage.src = imgUrl;

        const nicknameInput = profileSection.querySelector('.profile-input[name="nickname"]');
        if (nicknameInput) nicknameInput.value = storedUser.nickname || '';

        const nameInput = profileSection.querySelector('.profile-input[name="name"]');
        if (nameInput) nameInput.value = storedUser.name || '';

        const emailInput = profileSection.querySelector('.profile-input[name="email"]');
        if (emailInput) emailInput.value = storedUser.email || '';
    }

    // 프로필 섹션만 보이게 설정
    profileSection.style.display = 'block';
}

// 별점 생성 헬퍼 함수
function generateStarRating(rating) {
    let stars = '';
    for (let i = 0; i < 5; i++) {
        stars += i < rating ? '★' : '☆';
    }
    return `<span class="star-rating-text">${stars}</span>`;
}

// 리뷰 작성 모달 표시
function showReviewModal(adviceId, trainerName) {
    // 기존 모달이 있으면 제거
    let existingModal = document.getElementById('reviewModal');
    if (existingModal) {
        existingModal.remove();
    }

    // 모달 생성
    const modalHTML = `
        <div class="modal fade" id="reviewModal" tabindex="-1" aria-labelledby="reviewModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="user-modal-header d-flex justify-content-between align-items-center">
                        <h5 class="modal-title" id="reviewModalLabel">${trainerName} 훈련사 리뷰 작성</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="reviewForm">
                            <input type="hidden" id="adviceId" value="${adviceId}">
                            <div class="mb-3">
                                <label class="form-label">별점</label>
                                <div class="rating">
                                    <input type="radio" id="star5" name="rating" value="5" /><label for="star5"></label>
                                    <input type="radio" id="star4" name="rating" value="4" /><label for="star4"></label>
                                    <input type="radio" id="star3" name="rating" value="3" /><label for="star3"></label>
                                    <input type="radio" id="star2" name="rating" value="2" /><label for="star2"></label>
                                    <input type="radio" id="star1" name="rating" value="1" /><label for="star1"></label>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="reviewContent" class="form-label">리뷰 내용</label>
                                <textarea class="form-control" id="reviewContent" rows="5" placeholder="훈련사의 상담은 어땠나요? 상세한 리뷰를 남겨주세요."></textarea>
                            </div>
                            <div class="mb-3">
                                <label for="reviewImage" class="form-label">사진 첨부 (선택)</label>
                                <div class="review-image-container">
                                    <div class="review-preview">
                                        <img id="reviewPreview" src="https://placehold.co/200x200" alt="리뷰 이미지 미리보기">
                                    </div>
                                    <div class="review-upload-btn-wrapper">
                                        <button type="button" class="btn btn-outline-secondary upload-btn">
                                            사진 업로드
                                        </button>
                                        <input type="file" id="reviewImage" accept="image/*" class="review-upload-input">
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn certificate-btn-secondary" data-bs-dismiss="modal">취소</button>
                        <button type="button" class="btn certificate-btn-primary" id="submitReview">제출하기</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // 모달을 body에 추가
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // 모달 객체 생성 및 표시
    const reviewModal = new bootstrap.Modal(document.getElementById('reviewModal'));
    reviewModal.show();

    // 이미지 미리보기 기능
    const reviewImageInput = document.getElementById('reviewImage');
    const reviewPreview = document.getElementById('reviewPreview');

    reviewImageInput.addEventListener('change', function () {
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            reader.onload = function (e) {
                reviewPreview.src = e.target.result;
            };
            reader.readAsDataURL(this.files[0]);
        }
    });

    // 리뷰 제출 이벤트
    document.getElementById('submitReview').addEventListener('click', async () => {
        const adviceId = document.getElementById('adviceId').value;
        const rating   = document.querySelector('input[name="rating"]:checked')?.value;
        const comment  = document.getElementById('reviewContent').value;
        const fileInput= document.getElementById('reviewImage');

        if (!rating)  return alert('별점을 선택해주세요.');
        if (!comment.trim()) return alert('리뷰 내용을 입력해주세요.');

        const formData = new FormData();
        // JSON 부분은 Blob 으로
        formData.append(
            'requestDTO',
            new Blob([JSON.stringify({
                applyId:   Number(adviceId),
                rating:    Number(rating),
                comment:   comment
            })], { type: 'application/json' })
        );
        // 파일이 있으면 첨부
        if (fileInput.files.length > 0) {
            formData.append('file', fileInput.files[0]);
        }

        try {
            const res = await fetch('/api/v1/reviews', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) {
                const errJson = await res.json().catch(()=>({}));
                throw new Error(errJson.message || res.statusText);
            }

            alert('리뷰가 성공적으로 등록되었습니다!');
            bootstrap.Modal.getInstance(document.getElementById('reviewModal')).hide();
            showUserAdvices();

        } catch (err) {
            console.error('리뷰 등록 오류:', err);
            alert(`리뷰 등록 중 오류가 발생했습니다: ${err.message}`);
        }
    });
}

// 리뷰 수정 모달 함수 (기존 리뷰 데이터로 미리 채워 넣음)
function showReviewEditModal(applyId, reviewData) {
    // 기존 상담 정보 가져오기
    const adviceInfo = currentPosts.find(a => a.applyId === parseInt(applyId));
    const trainerName = adviceInfo ? adviceInfo.trainerName : '훈련사';

    // 기존 모달이 있으면 제거
    let existingModal = document.getElementById('reviewModal');
    if (existingModal) {
        existingModal.remove();
    }

    // 모달 생성
    const modalHTML = `
        <div class="modal fade" id="reviewModal" tabindex="-1" aria-labelledby="reviewModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="user-modal-header d-flex justify-content-between align-items-center">
                        <h5 class="modal-title" id="reviewModalLabel">${trainerName} 훈련사 리뷰 수정</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="reviewForm">
                            <input type="hidden" id="adviceId" value="${applyId}">
                            <input type="hidden" id="reviewId" value="${reviewData.id || ''}">
                            <div class="mb-3">
                                <label class="form-label">별점</label>
                                <div class="rating">
                                    <input type="radio" id="star5" name="rating" value="5" ${reviewData.rating === 5 ? 'checked' : ''} /><label for="star5"></label>
                                    <input type="radio" id="star4" name="rating" value="4" ${reviewData.rating === 4 ? 'checked' : ''} /><label for="star4"></label>
                                    <input type="radio" id="star3" name="rating" value="3" ${reviewData.rating === 3 ? 'checked' : ''} /><label for="star3"></label>
                                    <input type="radio" id="star2" name="rating" value="2" ${reviewData.rating === 2 ? 'checked' : ''} /><label for="star2"></label>
                                    <input type="radio" id="star1" name="rating" value="1" ${reviewData.rating === 1 ? 'checked' : ''} /><label for="star1"></label>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="reviewContent" class="form-label">리뷰 내용</label>
                                <textarea class="form-control" id="reviewContent" rows="5" placeholder="훈련사의 상담은 어땠나요? 상세한 리뷰를 남겨주세요.">${reviewData.comment || ''}</textarea>
                            </div>
                            <div class="mb-3">
                                <label for="reviewImage" class="form-label">사진 첨부 (선택)</label>
                                <div class="review-image-container">
                                    <div class="review-preview">
                                        <img id="reviewPreview" src="${reviewData.reviewImageUrl || 'https://placehold.co/200x200'}" alt="리뷰 이미지 미리보기">
                                    </div>
                                    <div class="review-upload-btn-wrapper">
                                        <button type="button" class="btn btn-outline-secondary upload-btn">
                                            사진 업로드
                                        </button>
                                        <input type="file" id="reviewImage" accept="image/*" class="review-upload-input">
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn certificate-btn-secondary" data-bs-dismiss="modal">취소</button>
                        <button type="button" data-review-id="${reviewData.reviewId}" class="btn certificate-btn-primary" id="updateReview">수정하기</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // 모달을 body에 추가
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // 모달 객체 생성 및 표시
    const reviewModal = new bootstrap.Modal(document.getElementById('reviewModal'));
    reviewModal.show();

    // 이미지 미리보기 기능
    const reviewImageInput = document.getElementById('reviewImage');
    const reviewPreview = document.getElementById('reviewPreview');

    reviewImageInput.addEventListener('change', function () {
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            reader.onload = function (e) {
                reviewPreview.src = e.target.result;
            };
            reader.readAsDataURL(this.files[0]);
        }
    });

    // 리뷰 수정 이벤트
    document.getElementById('updateReview').addEventListener('click', async function () {
        const adviceId = document.getElementById('adviceId').value;
        const reviewId = this.dataset.reviewId;
        const rating = document.querySelector('input[name="rating"]:checked')?.value || 0;
        const comment = document.getElementById('reviewContent').value;
        const imageInput = document.getElementById('reviewImage');

        if (rating === 0) {
            alert('별점을 선택해주세요.');
            return;
        }

        if (!comment.trim()) {
            alert('리뷰 내용을 입력해주세요.');
            return;
        }

        const payload = {
            rating: Number(rating),
            comment
        };

        try {
            // PUT 요청으로 리뷰 업데이트
            const res = await fetch(`/api/v1/reviews/${reviewId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errText = await res.text();
                console.error('리뷰 수정 실패:', errText);
                throw new Error(`서버 오류 (상태 코드: ${res.status})`);
            }

            alert('리뷰가 성공적으로 수정되었습니다!');

            const reviewModalEl = document.getElementById('reviewModal');
            bootstrap.Modal.getInstance(reviewModalEl).hide();

            // 화면 갱신
            showUserAdvices();

        } catch (err) {
            console.error(err);
            alert(`리뷰 수정 중 오류가 발생했습니다: ${err.message}`);
        }
    });
}

// 작성한 리뷰보기 모달 함수 추가
async function showReviewDetailModal(applyId) {
    // 실제 API에서 해당 applyId에 대한 리뷰 조회
    const review = await fetchReviewByApplyId(applyId);

    if (!review) {
        alert('리뷰를 찾을 수 없습니다.');
        return;
    }

    // 기존 모달이 있으면 제거
    let existingModal = document.getElementById('reviewDetailModal');
    if (existingModal) {
        existingModal.remove();
    }

    // 별점 HTML 생성
    const starsHTML = generateStarRating(review.rating);

    // 날짜 포맷팅 (ISO 문자열을 날짜로 변환)
    const reviewDate = review.createdAt
        ? new Date(review.createdAt).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        : '날짜 정보 없음';

    // 모달 생성
    const modalHTML = `
        <div class="modal fade" id="reviewDetailModal" tabindex="-1" aria-labelledby="reviewDetailModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="user-modal-header d-flex justify-content-between align-items-center">
                        <h5 class="modal-title" id="reviewDetailModalLabel">내가 작성한 리뷰</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="review-detail">
                            <div class="d-flex justify-content-between mb-3">
                                <div class="review-meta">
                                    <div class="review-author">${storedUser.nickname || '작성자'}</div>
                                    <div class="review-date text-muted small">${reviewDate}</div>
                                </div>
                                <div class="review-rating">
                                    ${starsHTML}
                                </div>
                            </div>
                            ${review.reviewImageUrl ? `
                            <div class="review-image mb-3">
                                <img src="${review.reviewImageUrl}" alt="리뷰 이미지" class="img-fluid rounded">
                            </div>` : ''}
                            <div class="review-content p-3 bg-light rounded">
                                ${review.comment || '내용 없음'}
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn certificate-btn-secondary" data-bs-dismiss="modal">닫기</button>
                        <button type="button" class="btn certificate-btn-primary" id="editReview">수정하기</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // 모달을 body에 추가
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // 모달 객체 생성 및 표시
    const reviewDetailModal = new bootstrap.Modal(document.getElementById('reviewDetailModal'));
    reviewDetailModal.show();

    // 수정하기 버튼 클릭 이벤트
    document.getElementById('editReview').addEventListener('click', function () {
        reviewDetailModal.hide();
        // 수정 모달 표시 (기존 리뷰 작성 모달을 재사용하고 기존 데이터로 채워넣음)
        showReviewEditModal(applyId, review);
    });
}

// 상담 상세보기 모달 표시
async function showAdviceDetailModal(adviceId, trainerName, content, status, petType, petBreed, petAge, imageUrl) {
    // 기존 모달이 있으면 제거
    let existingModal = document.getElementById('adviceDetailModal');
    if (existingModal) {
        existingModal.remove();
    }

    let adviceData = {};

    // PENDING 상태가 아닐 때만 상세 정보 API 호출
    if (status !== 'PENDING') {
        try {
            adviceData = await fetchAdviceDetail(adviceId);
        } catch (error) {
            console.error('상담 상세 정보 조회 실패:', error);
            adviceData = {};
        }
    }

    // 채팅 내역 HTML 생성
    let contentHTML = '';

    // 상태에 따른 컨텐츠 분기 처리
    if (status === 'PENDING') {
        contentHTML = `
            <div class="chat-waiting">
                <p class="text-center text-muted">
                    <i class="fas fa-clock me-2"></i>답변을 기다리고 있어요. 훈련사가 곧 답변해드릴 거예요!
                </p>
            </div>
        `;
    } else if (status === 'REJECTED') {
        contentHTML = `
            <div class="chat-rejected">
                <p class="text-center text-muted">
                    <i class="fas fa-times-circle me-2"></i>상담 요청이 거절되었습니다.
                </p>
            </div>
        `;
    } else if (adviceData && adviceData.content) {
        // 상담 내용이 있는 경우
        contentHTML = adviceData.content;
    } else {
        // 상담 내용이 없는 경우
        contentHTML = `
            <div class="chat-empty">
                <p class="text-center text-muted">상담 내역이 없습니다.</p>
            </div>
        `;
    }

    // 모달 HTML 생성
    const modalHTML = `
        <div class="modal fade" id="adviceDetailModal" tabindex="-1" aria-labelledby="adviceDetailModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content">
                    <div class="user-modal-header d-flex justify-content-between align-items-center">
                        <h5 class="modal-title" id="adviceDetailModalLabel">상담 상세내역</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="advice-detail-info mb-4">
                            <div class="row">
                                <div class="col-md-6">
                                    <p><strong>상담 날짜:</strong> ${adviceData.createdAt || '정보 없음'}</p>
                                    <p><strong>상담 상태:</strong> 
                                        <span class="badge ${status === 'PENDING' ? 'bg-warning'
        : status === 'APPROVED' ? 'bg-info'
            : status === 'REJECTED' ? 'bg-secondary'
                : 'bg-success'
    }">
                                                                                     ${status === 'PENDING' ? '답변 대기'
        : status === 'APPROVED' ? '상담 수락'
            : status === 'REJECTED' ? '상담 거절'
                : status || '알 수 없음'
    }
                                        </span>
                                    </p>
                                </div>
                                <div class="col-md-6">
                                    <p><strong>반려동물:</strong> ${petType} (${petBreed}, ${petAge})</p>
                                    <p><strong>훈련사:</strong> ${trainerName || '미배정'}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="advice-question-section mb-4">
                            <h6 class="section-title">상담 요청 내용</h6>
                            <div class="advice-question p-3 bg-light rounded">
                              ${content || '내용 없음'}
                            </div>
                            ${imageUrl ? `
                              <div class="advice-image mt-2">
                                <img
                                  src="${imageUrl}"
                                  alt="첨부 이미지"
                                  class="img-fluid rounded"
                                  style="width:300px; height:auto;"
                                  onerror="this.remove()"
                                />
                              </div>
                            ` : ''}
                          </div>

                        <div class="advice-chat-section">
                            <h6 class="section-title">상담 내역</h6>
                            <div class="chat-container">
                                ${contentHTML}
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn certificate-btn-secondary" data-bs-dismiss="modal">닫기</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // 모달을 body에 추가
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // 모달 객체 생성 및 표시
    const adviceDetailModal = new bootstrap.Modal(document.getElementById('adviceDetailModal'));
    adviceDetailModal.show();

    // 추가 질문 보내기 이벤트 - API 응답에 특정 상태가 있을 때만 추가
    if (adviceData && adviceData.status === "답변 완료" && document.getElementById('sendAdditionalQuestion')) {
        document.getElementById('sendAdditionalQuestion').addEventListener('click', function () {
            const additionalQuestion = document.getElementById('additionalQuestion').value.trim();

            if (!additionalQuestion) {
                alert('질문 내용을 입력해주세요.');
                return;
            }

            // 실제로는 서버에 추가 질문을 전송
            alert('추가 질문이 전송되었습니다! (백엔드 연동 후 실제 적용됩니다)');
            adviceDetailModal.hide();
        });
    }
}

// 상담 내역 이벤트 리스너 추가
function attachUserAdviceEventListeners() {
    // 상세보기 버튼
    document.querySelectorAll('.view-detail-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = this.dataset.id;
            const trainer = this.dataset.trainer;
            const content = this.dataset.content;
            const status = this.dataset.status;
            const petType = this.dataset.petType;
            const petBreed = this.dataset.petBreed;
            const rawMonth = parseInt(this.dataset.petMonthAge, 10);
            const petAge = rawMonth
                ? `${Math.floor(rawMonth / 12)}년 ${rawMonth % 12}개월`
                : '나이 정보 없음';
            const imageUrl = this.dataset.imageUrl;

            const adviceData = currentPosts.find(a => a.applyId === parseInt(id, 10));
            if (adviceData) {
                showAdviceDetailModal(id, trainer, content, status, petType, petBreed, petAge, imageUrl);
            } else {
                alert('상담 정보를 찾을 수 없습니다.');
            }
        });
    });

    // 리뷰 작성 버튼
    document.querySelectorAll('.write-review-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = this.dataset.id;
            const trainerName = this.dataset.trainer;
            showReviewModal(id, trainerName);
        });
    });

    // 작성한 리뷰 보기 버튼
    document.querySelectorAll('.view-review-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = this.dataset.id;
            showReviewDetailModal(id);
        });
    });
}

// 사용자 상담내역 표시 함수
function showUserAdvices(filteredAdvices = null) {
    hideAllContent();

    // 게시글 영역 표시
    const postContainer = document.getElementById('post-container');
    if (postContainer) postContainer.style.display = 'block';

    // 페이지네이션 표시
    const pagination = document.querySelector('.pagination');
    if (pagination) pagination.parentElement.style.display = 'block';

    // 검색바 표시
    const searchBar = document.querySelector('.search-bar');
    if (searchBar) searchBar.style.display = 'flex';

    // 필터링된 데이터 또는 원본 데이터 사용
    let dataToShow = filteredAdvices || currentPosts;

    // 데이터가 비어있는 경우
    if (!dataToShow || dataToShow.length === 0) {
        document.getElementById('post-container').innerHTML = '<p class="no-results">상담 내역이 없습니다.</p>';
        return;
    }

    // 페이징 처리
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, dataToShow.length);
    const currentPageAdvices = dataToShow.slice(startIndex, endIndex);

    // 상담내역 렌더링
    const advicesHTML = currentPageAdvices.map(advice => {
        return `
        <div class="user-advice-item">
            <div class="advice-header">
                <div class="advice-title-section">
                    <h5 class="advice-title">${advice.trainerName || '배정 대기중'} 훈련사</h5>
                    <span class="advice-status ${
            advice.applyStatus === 'PENDING' ? 'status-pending'
                : advice.applyStatus === 'APPROVED' ? 'status-progress'
                    : advice.applyStatus === 'REJECTED' ? 'status-completed'
                        : 'status-completed'
        }">
                      ${
            advice.applyStatus === 'PENDING' ? '상담 대기'
                : advice.applyStatus === 'APPROVED' ? '상담 수락'
                    : advice.applyStatus === 'REJECTED' ? '상담 거절'
                        : advice.applyStatus || '알 수 없음'
        }
                    </span>
                </div>
                <div class="advice-meta">
                    <span class="advice-date">${advice.createdAt || '날짜 정보 없음'}</span>
                </div>
            </div>
            <div class="advice-details">
                <div class="pet-info">
                    <span class="pet-type">${advice.petType || '반려동물 종류 없음'}</span>
                    <span class="pet-breed">${advice.petBreed || '품종 정보 없음'}</span>
                    <span class="pet-age">${advice.petMonthAge ? `${Math.floor(advice.petMonthAge / 12)}년 ${advice.petMonthAge % 12}개월` : '나이 정보 없음'}</span>
                </div>
            </div>
            <div class="advice-body">
                <p class="advice-content">${advice.content || ''}</p>
            </div>
            <div class="advice-actions">
                <!-- 상세보기 버튼은 모든 상태에서 표시 -->
                <button data-id="${advice.applyId}" data-trainer="${advice.trainerName || '훈련사'}" data-content="${advice.content}" data-status="${advice.applyStatus}" data-pet-type="${advice.petType}" data-pet-breed="${advice.petBreed}" data-pet-month-age="${advice.petMonthAge}" data-image-url="${advice.imageUrl}" class="btn btn-primary btn-sm view-detail-btn">상세보기</button>
                
                <!-- 상담 수락 상태일 때만 리뷰 버튼 표시 (리뷰 작성 여부에 따라 다른 버튼 표시) -->
                ${advice.applyStatus === 'APPROVED' ?
            advice.hasReviewed ?
                `<button data-id="${advice.applyId}" class="btn btn-outline-secondary btn-sm view-review-btn">작성한 리뷰 보기</button>` :
                `<button data-id="${advice.applyId}" data-trainer="${advice.trainerName || '훈련사'}" class="btn btn-success btn-sm write-review-btn">리뷰 작성</button>`
            : ''
        }
            </div>
        </div>
    `
    }).join('');

    document.getElementById('post-container').innerHTML = advicesHTML;

    // 페이지네이션 업데이트
    updatePagination(dataToShow.length);

    // 이벤트 리스너 추가
    attachUserAdviceEventListeners();
}

async function fetchMyPosts() {
    try {
        const res = await fetch(`/api/v1/posts/users/me`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!res.ok) throw new Error('내 게시물 조회 실패');
        const data = await res.json();
        return data;
    } catch (err) {
        console.error(err);
        alert('내 게시물을 불러오는데 실패했습니다.');
        return [];
    }
}

async function fetchLikedPosts() {
    try {
        const res = await fetch(`/api/v1/posts/users/liked`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!res.ok) throw new Error('내가 좋아요한 게시물 조회 실패');
        const data = await res.json();
        return data;
    } catch (err) {
        console.error(err);
        alert('내가 좋아요한 게시물을 불러오는데 실패했습니다.');
        return [];
    }
}

async function fetchMyAdvice() {
    try {
        const res = await fetch(`/api/v1/match/user`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!res.ok) throw new Error('내가 신청한 상담 조회 실패');
        const result = await res.json();
        return result.data || [];
    } catch (err) {
        console.error(err);
        alert('내가 신청한 상담을 불러오는데 실패했습니다.');
        return [];
    }
}

async function fetchAdviceDetail(applyId) {
    try {
        const res = await fetch(`/api/v1/match/${applyId}/answer`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error('API 응답 오류:', errorText);
            throw new Error(`내가 신청한 상담 상세 조회 실패 (상태 코드: ${res.status})`);
        }

        const data = await res.json();
        return data || {};
    } catch (err) {
        console.error('상담 상세 조회 중 오류 발생:', err);

        alert('내가 신청한 상담 상세조회를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.');
        return {};
    }
}

// 특정 상담(applyId)에 대한 리뷰 조회 함수
async function fetchReviewByApplyId(applyId) {
    try {
        const res = await fetch(`/api/v1/reviews/users/me`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error('리뷰 조회 API 응답 오류:', errorText);
            throw new Error(`리뷰 조회 실패 (상태 코드: ${res.status})`);
        }

        const reviews = await res.json();

        // 2. applyId에 해당하는 리뷰만 필터링
        const targetReview = reviews.find(review => review.applyId === parseInt(applyId));

        if (!targetReview) {
            console.error(`applyId ${applyId}에 해당하는 리뷰를 찾을 수 없습니다.`);
            return null;
        }

        return targetReview;

    } catch (err) {
        console.error('리뷰 조회 중 오류 발생:', err);
        alert('리뷰를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.');
        return null;
    }
}

// 게시글 렌더링 함수 - 페이지네이션 적용
function renderPosts(posts, page = 1) {
    const postListElement = document.getElementById('post-container');
    if (!postListElement) return; // 요소가 없으면 함수 종료

    postListElement.innerHTML = '';

    // 페이지에 맞는 게시글만 추출
    const startIndex = (page - 1) * itemsPerPage;
    const paginatedPosts = posts.slice(startIndex, startIndex + itemsPerPage);

    if (paginatedPosts.length === 0) {
        postListElement.innerHTML = '<div class="alert alert-info">게시글이 없습니다.</div>';
        return;
    }

    // 카테고리 매핑 (trainer-mypage.js와 일관성 유지)
    const postCategoryMap = {
        'FREE': '자유',
        'QNA': '질문',
        'TOOL': '펫 도구',
        'MYPET': '자랑하기'
    };

    const petCategoryMap = {
        'DOG': '강아지',
        'CAT': '고양이',
        'ETC': '기타'
    };

    // 게시글 렌더링
    paginatedPosts.forEach((post) => {
        try {
            // API 응답 구조에 맞게 필드 접근 (안전하게 속성 확인)
            const postCategory = post.postCategory ? (postCategoryMap[post.postCategory] || post.postCategory) : '카테고리 없음';
            const petCategory = post.petCategory ? (petCategoryMap[post.petCategory] || post.petCategory) : '';
            const imageUrl = post.imageUrls && post.imageUrls.length > 0 ? post.imageUrls[0] : null;
            const createdAt = post.createdAt || '날짜 없음';
            const title = post.title || '제목 없음';
            const content = post.content || '내용 없음';
            const likeCount = post.likeCount !== undefined ? post.likeCount : 0;
            const commentCount = post.commentCount !== undefined ? post.commentCount : 0;

            // 태그 표시
            const tagsHtml = post.tags && post.tags.length > 0
                ? `<div class="post-tags">${post.tags.map(tag => `<span class="tag">#${tag}</span>`).join(' ')}</div>`
                : '';

            const postElement = document.createElement('div');
            postElement.className = 'post-item';
            postElement.onclick = function() {
                window.location.href = `/community/post/${post.postId}`;
            };
            postElement.style.cursor = 'pointer';

            postElement.innerHTML = `
                <div class="post-info">
                    <div class="post-categories">
                        <span class="post-category">${postCategory}</span>
                        ${petCategory ? `<span class="pet-category">${petCategory}</span>` : ''}
                    </div>
                    <h4 class="post-title">${title}</h4>
                    <p class="post-content">${content}</p>
                    ${tagsHtml}
                    <div class="post-meta">
                        ${createdAt} &nbsp;&nbsp; 
                        <span class="like-count">♥ ${likeCount}</span> &nbsp;&nbsp; 
                        <span class="comment-count">💬 ${commentCount}</span>
                    </div>
                </div>
                <div class="post-image">
                    ${imageUrl ? `<img src="${imageUrl}" alt="게시글 이미지" onerror="this.src='https://placehold.co/200x200?text=이미지+없음'">` : ''}
                </div>
            `;
            postListElement.appendChild(postElement);
        } catch (error) {
            console.error('게시글 렌더링 중 오류 발생:', error, post);
            const errorElement = document.createElement('div');
            errorElement.className = 'post-item error';
            errorElement.textContent = '게시글을 표시할 수 없습니다.';
            postListElement.appendChild(errorElement);
        }
    });

    // 페이지네이션 업데이트
    updatePagination(posts.length);
}

// 페이지네이션 업데이트 함수
function updatePagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginationElement = document.querySelector('.pagination');
    if (!paginationElement) return; // 요소가 없으면 함수 종료

    paginationElement.innerHTML = '';

    // 이전 버튼
    const prevItem = document.createElement('li');
    prevItem.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevItem.innerHTML = `<a class="page-link" href="#" ${currentPage === 1 ? 'aria-disabled="true"' : ''}>&laquo;</a>`;
    paginationElement.appendChild(prevItem);

    // 페이지 번호
    for (let i = 1; i <= totalPages; i++) {
        const pageItem = document.createElement('li');
        pageItem.className = `page-item ${i === currentPage ? 'active' : ''}`;
        pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        paginationElement.appendChild(pageItem);
    }

    // 다음 버튼
    const nextItem = document.createElement('li');
    nextItem.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextItem.innerHTML = `<a class="page-link" href="#" ${currentPage === totalPages ? 'aria-disabled="true"' : ''}>&raquo;</a>`;
    paginationElement.appendChild(nextItem);

    // 페이지 버튼 이벤트 추가
    addPaginationEvents();
}

// 페이지네이션 이벤트 추가 함수
function addPaginationEvents() {
    // 페이지 번호 클릭 이벤트
    document.querySelectorAll('.pagination .page-link').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            const text = this.textContent;

            // 현재 탭의 페이지 상태
            const currentTabState = tabStates[currentTab];

            // 페이지 번호 처리
            if (text === '«') {
                if (currentTabState.currentPage > 1) {
                    currentTabState.currentPage--;
                }
            } else if (text === '»') {
                const totalPages = Math.ceil(currentPosts.length / itemsPerPage);
                if (currentTabState.currentPage < totalPages) {
                    currentTabState.currentPage++;
                }
            } else {
                currentTabState.currentPage = parseInt(text);
            }

            // 현재 활성화된 탭에 따라 적절한 렌더링 함수 호출
            if (currentTab === 'advice') {
                showUserAdvices(currentPosts);
            } else {
                renderPosts(currentPosts, currentTabState.currentPage);
            }
        });
    });
}

// 모든 컨텐츠 영역 숨기기
function hideAllContent() {
    // 게시글 컨테이너 숨기기
    const postContainer = document.getElementById('post-container');
    if (postContainer) postContainer.style.display = 'none';

    // 리뷰 섹션 숨기기
    const reviewSection = document.getElementById('review-section');
    if (reviewSection) reviewSection.style.display = 'none';

    // 프로필 섹션 숨기기
    const profileSection = document.querySelector('.profile-section');
    if (profileSection) profileSection.style.display = 'none';

    // 검색바 숨기기
    const searchBar = document.querySelector('.search-bar');
    if (searchBar) searchBar.style.display = 'none';

    // 페이지네이션 숨기기
    const pagination = document.querySelector('.pagination');
    if (pagination && pagination.parentElement) pagination.parentElement.style.display = 'none';
}

// 게시물 관련 컨텐츠 표시 함수
function showPostContent() {
    // 1) 기존 콘텐츠 숨기기
    hideAllContent();

    // 2) 게시글 영역 표시
    const postContainer = document.getElementById('post-container');
    if (postContainer) postContainer.style.display = 'block';

    // 3) 페이지네이션 표시
    const pagination = document.querySelector('.pagination');
    if (pagination) pagination.parentElement.style.display = 'block';

    // 4) 검색바 표시 (flex로 복원)
    const searchBar = document.querySelector('.search-bar');
    if (searchBar) searchBar.style.display = 'flex';
}

// 탭 메뉴 활성화 처리 및 필터링
function setupTabEvents() {
    document.querySelectorAll('.tab-menu .nav-link').forEach(tab => {
        tab.addEventListener('click', async function (e) {
            e.preventDefault();

            // 클릭된 탭의 ID에서 'tab-' 접두사 제거
            const tabId = this.id.replace('tab-', '');

            // switchTab 함수 호출
            switchTab(tabId);
        });
    });
}

// 프로필 이미지 업로드 함수
async function uploadProfileImage(file) {
    // FormData 객체 생성
    const formData = new FormData();
    formData.append('file', file);

    // API 호출
    const response = await fetch(`/api/v1/users/updateImage`, {
        method: 'PUT',
        body: formData
    });

    if (!response.ok) {
        throw new Error(`이미지 업로드 실패: ${response.status}`);
    }

    const result = await response.json();

    // storedUser 변수와 로컬스토리지, 그리고 화면에 모두 반영
    storedUser.profileImageUrl = result.profileImageUrl || result.url;
    localStorage.setItem('user', JSON.stringify(storedUser));
    // 현재 띄워진 프로필 이미지에도 즉시 적용
    const imgEl = document.querySelector('.profile-image');
    if (imgEl) imgEl.src = storedUser.profileImageUrl;
    return result;
}

// 프로필 이미지 변경 이벤트 설정 - 백엔드 연동 추가
function setupProfileImage() {
    document.addEventListener('click', function (e) {
        // 이미지나 오버레이를 클릭했을 때만 작동하도록
        if (e.target.classList.contains('profile-image') ||
            e.target.classList.contains('profile-image-overlay') ||
            e.target.classList.contains('camera-icon')) {

            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.style.display = 'none';

            document.body.appendChild(fileInput);
            fileInput.click();

            fileInput.addEventListener('change', async () => {
                const file = fileInput.files[0];
                if (file) {
                    try {
                        // 파일 크기 체크 (예: 5MB 제한)
                        if (file.size > 5 * 1024 * 1024) {
                            alert('이미지 크기는 5MB 이하여야 합니다.');
                            document.body.removeChild(fileInput);
                            return;
                        }

                        // 이미지 미리보기 업데이트
                        const reader = new FileReader();
                        reader.onload = function (e) {
                            const profileImage = document.querySelector('.profile-image');
                            if (profileImage) {
                                profileImage.src = e.target.result;
                            }
                        };
                        reader.readAsDataURL(file);

                        // 서버에 이미지 업로드
                        await uploadProfileImage(file);

                    } catch (error) {
                        console.error('이미지 업로드 중 오류 발생:', error);
                        alert('이미지 업로드에 실패했습니다. 다시 시도해주세요.');
                    }
                }
                // 사용 후 제거
                document.body.removeChild(fileInput);
            });
        }
    });
}

// 프로필 버튼 이벤트 설정
function setupProfileButtons() {
    document.addEventListener('click', async function (e) {
        // 저장하기 버튼
        if (e.target.classList.contains('save-button')) {
            try {
                await updateUserProfile();
                alert('프로필이 성공적으로 업데이트되었습니다.');
            } catch (error) {
                console.error('프로필 업데이트 중 오류 발생:', error);
                alert('프로필 업데이트에 실패했습니다. 다시 시도해주세요.');
            }
        }
    });
}
function switchTab(tabName, updateUrl = true) {
    // 현재 활성화된 탭 정보 저장
    currentTab = tabName;

    // 모든 탭에서 active 클래스 제거
    document.querySelectorAll('.tab-menu .nav-link').forEach(tab => {
        tab.classList.remove('active');
    });

    // 선택된 탭에 active 클래스 추가 (tab- 접두사 추가)
    const tabElement = document.getElementById(`tab-${tabName}`);
    if (tabElement) {
        tabElement.classList.add('active');
    }

    // 현재 탭 페이지 상태 사용
    currentPage = tabStates[tabName].currentPage || 1;

    // URL 업데이트 (필요한 경우)
    if (updateUrl) {
        const url = new URL(window.location);
        url.searchParams.set('tab', tabName);
        window.history.pushState({tab: tabName}, '', url);
    }

    // 검색어 초기화
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';
    searchQuery = '';

    // 탭에 따른 컨텐츠 로드
    switch (tabName) {
        case 'profile':
            renderProfile();
            break;
        case 'mypost':
            showPostContent();
            // 비동기로 데이터 로드
            fetchMyPosts().then(posts => {
                currentPosts = posts;
                renderPosts(posts, tabStates[tabName].currentPage);
            });
            break;
        case 'liked':
            showPostContent();
            // 비동기로 데이터 로드
            fetchLikedPosts().then(posts => {
                currentPosts = posts;
                renderPosts(posts, tabStates[tabName].currentPage);
            });
            break;
        case 'advice':
            // 비동기로 데이터 로드
            fetchMyAdvice().then(advices => {
                currentPosts = advices;
                showUserAdvices(advices);
            });
            break;
        default:
            showPostContent();
    }
}

// 페이지 로드 시 초기화
window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');

    // 이벤트 리스너 설정
    setupTabEvents();
    setupProfileButtons();
    setupSearchButton();
    setupProfileImage();

    // URL 히스토리 변경 감지
    window.addEventListener('popstate', function (event) {
        if (event.state && event.state.tab) {
            // URL 업데이트 없이 탭 전환
            switchTab(event.state.tab, false);
        } else {
            // 기본 탭으로 돌아가기
            switchTab('profile', false);
        }
    });

    // 파라미터에 따른 탭 선택 또는 기본 탭(프로필) 선택
    if (tabParam && ['profile', 'mypost', 'liked', 'advice'].includes(tabParam)) {
        switchTab(tabParam);
    } else {
        // 기본적으로 프로필 탭 활성화
        switchTab('profile');
    }
});