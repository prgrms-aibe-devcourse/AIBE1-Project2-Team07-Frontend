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
            advice.applyStatus === 'PENDING'  ? 'status-pending'
                : advice.applyStatus === 'APPROVED' ? 'status-progress'
                    : advice.applyStatus === 'REJECTED' ? 'status-completed'
                        : 'status-completed'
        }">
  ${
            advice.applyStatus === 'PENDING'  ? '답변 대기'
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
                    <span class="pet-age">${advice.petMonthAge ? `${Math.floor(advice.petMonthAge/12)}년 ${advice.petMonthAge%12}개월` : '나이 정보 없음'}</span>
                </div>
            </div>
            <div class="advice-body">
                <p class="advice-content">${advice.content || ''}</p>
            </div>
            <div class="advice-actions">
                <button data-id="${advice.applyId}" data-trainer="${advice.trainerName || '훈련사'}" data-content="${advice.content}" data-status="${advice.status}" data-pet-type="${advice.petType}" data-pet-breed="${advice.petBreed}" data-pet-month-age="${advice.petMonthAge}" class="btn btn-primary btn-sm view-detail-btn">상세보기</button>
                ${advice.applyStatus === "답변 완료" && !advice.hasReviewed ?
            `<button data-id="${advice.applyId}" data-trainer="${advice.trainerName || '훈련사'}" class="btn btn-success btn-sm write-review-btn">리뷰 작성</button>` :
            advice.hasReviewed ?
                `<div class="review-button-container">
                        <button data-id="${advice.applyId}" class="btn btn-outline-secondary btn-sm view-review-btn">
                            작성한 리뷰 보기
                        </button>
                    </div>` :
                ''
        }
            </div>
        </div>
    `}).join('');

    document.getElementById('post-container').innerHTML = advicesHTML;

    // 페이지네이션 업데이트
    updatePagination(dataToShow.length);

    // 이벤트 리스너 추가
    attachUserAdviceEventListeners();
}

// 별점 생성 헬퍼 함수
function generateStarRating(rating) {
    let stars = '';
    for (let i = 0; i < 5; i++) {
        stars += i < rating ? '★' : '☆';
    }
    return `<span class="star-rating-text">${stars}</span>`;
}

async function fetchAdviceDetail(applyId) {
    try {
        console.log(`상담 상세 정보 요청: ID ${applyId}, URL: ${API_BASE_URL}/api/v1/match/${applyId}/answer`);
        console.log('사용중인 accessToken:', accessToken);

        const res = await fetch(`${API_BASE_URL}/api/v1/match/${applyId}/answer`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('응답 상태:', res.status, res.statusText);

        if (!res.ok) {
            const errorText = await res.text();
            console.error('API 응답 오류:', errorText);
            throw new Error(`내가 신청한 상담 상세 조회 실패 (상태 코드: ${res.status})`);
        }

        const data = await res.json();
        console.log('상담 상세 데이터:', data);
        return data || {};
    } catch (err) {
        console.error('상담 상세 조회 중 오류 발생:', err);

        // 토큰 만료 가능성 체크
        if (err.message && err.message.includes('401')) {
            alert('로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
            // 로그인 페이지로 리디렉션하는 코드 추가 가능
            // window.location.href = '/login.html';
            return {};
        }

        alert('내가 신청한 상담 상세조회를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.');
        return {};
    }
}

// 상담 내역 이벤트 리스너 추가
function attachUserAdviceEventListeners() {
    // 상세보기 버튼
    document.querySelectorAll('.view-detail-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // ① data-id 속성에서 ID 가져오기
            // const adviceId = this.getAttribute('data-id');
            // const content = this.getAttribute('data-content');
            const id        = this.dataset.id;
            const trainer   = this.dataset.trainer;
            const content   = this.dataset.content;
            const status    = this.dataset.status;
            const petType   = this.dataset.petType;
            const petBreed  = this.dataset.petBreed;
            const rawMonth = parseInt(this.dataset.petMonthAge, 10);
            const petAge = rawMonth
                ? `${Math.floor(rawMonth / 12)}년 ${rawMonth % 12}개월`
                : '나이 정보 없음';

            const adviceData = currentPosts.find(a => a.applyId === parseInt(id, 10));

            if (adviceData) {
                showAdviceDetailModal(id, trainer, content, status, petType, petBreed, petAge);
                console.log('상세보기 호출된 adviceId:', id);
            } else {
                alert('상담 정보를 찾을 수 없습니다.');
            }
        });
    });

    // 리뷰 작성 버튼
    document.querySelectorAll('.write-review-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id        = this.dataset.id;
            // const trainerName = this.getAttribute('data-trainer');
            showReviewModal(id, trainerName);
        });
    });

    // 작성한 리뷰 보기 버튼
    document.querySelectorAll('.view-review-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id        = this.dataset.id;
            showReviewDetailModal(id);
        });
    });
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

    reviewImageInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                reviewPreview.src = e.target.result;
            };
            reader.readAsDataURL(this.files[0]);
        }
    });

    // 리뷰 제출 이벤트
    document.getElementById('submitReview').addEventListener('click', function() {
        const adviceId = document.getElementById('adviceId').value;
        const rating = document.querySelector('input[name="rating"]:checked')?.value || 0;
        const content = document.getElementById('reviewContent').value;

        if (rating === 0) {
            alert('별점을 선택해주세요.');
            return;
        }

        if (!content.trim()) {
            alert('리뷰 내용을 입력해주세요.');
            return;
        }

        // 실제로는 서버에 리뷰 데이터를 전송
        alert(`리뷰가 성공적으로 등록되었습니다! (백엔드 연동 후 실제 저장됩니다)`);
        reviewModal.hide();

        // 리뷰 작성 후 상담 내역 다시 불러오기 (실제 구현 시)
        // showUserAdvices();
    });
}

// 작성한 리뷰보기 모달 함수 추가
function showReviewDetailModal(adviceId){
    // 실무에서는 서버에서 해당 ID의 리뷰를 가져와야 함
    const review = myReviews.find(r => r.id === parseInt(adviceId)) || myReviews[0];

    // 기존 모달이 있으면 제거
    let existingModal = document.getElementById('reviewDetailModal');
    if (existingModal) {
        existingModal.remove();
    }

    // 별점 HTML 생성
    const starsHTML = generateStarRating(review.rating);

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
                                    <div class="review-author">${review.author}</div>
                                    <div class="review-date text-muted small">${review.date}</div>
                                </div>
                                <div class="review-rating">
                                    ${starsHTML}
                                </div>
                            </div>
                            ${review.image ? `
                            <div class="review-image mb-3">
                                <img src="${review.image}" alt="리뷰 이미지" class="img-fluid rounded">
                            </div>` : ''}
                            <div class="review-content p-3 bg-light rounded">
                                ${review.content}
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
    document.getElementById('editReview').addEventListener('click', function() {
        reviewDetailModal.hide();
        // 수정 모달 표시 (기존 리뷰 작성 모달을 재사용할 수 있음)
        showReviewModal(adviceId, userAdviceRequests.find(a => a.id === parseInt(adviceId))?.trainerName || '');
    });
}

// 상담 상세보기 모달 표시
async function showAdviceDetailModal(adviceId, trainerName, content, status, petType, petBreed, petAge) {

    const adviceData = await fetchAdviceDetail(adviceId);

    // 기존 모달이 있으면 제거
    let existingModal = document.getElementById('adviceDetailModal');
    if (existingModal) {
        existingModal.remove();
    }

    // 채팅 내역 HTML 생성
    let chatsHTML = '';
    if (adviceData.chats && adviceData.chats.length > 0) {
        chatsHTML = adviceData.chats.map(chat => `
            <div class="chat-message ${chat.type === 'trainer' ? 'trainer-message' : 'user-message'}">
                <div class="message-content">
                    <p>${chat.message}</p>
                    <small class="message-time">${chat.time}</small>
                </div>
            </div>
        `).join('');
    } else {
        if (adviceData.status === "PENDING") {
            chatsHTML = `
                <div class="chat-waiting">
                    <p class="text-center text-muted">
                        <i class="fas fa-clock me-2"></i>답변을 기다리고 있어요. 훈련사가 곧 답변해드릴 거예요!
                    </p>
                </div>
            `;
        } else {
            chatsHTML = `
                <div class="chat-empty">
                    <p class="text-center text-muted">채팅 내역이 없습니다.</p>
                </div>
            `;
        }
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
                                    <p><strong>상담 날짜:</strong> ${adviceData.createdAt}</p>
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
                                ${content}
                            </div>
                        </div>

                        <div class="advice-chat-section">
                            <h6 class="section-title">상담 내역</h6>
                            <div class="chat-container">
                                ${adviceData.content}
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

    // 추가 질문 보내기 이벤트 (답변 완료 상태일 때만)
    if (adviceData.status === "답변 완료") {
        document.getElementById('sendAdditionalQuestion').addEventListener('click', function() {
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