// 더미 상담 내역 데이터 (실제로는 서버에서 가져와야 함)
const userAdviceRequests = [
    {
        id: 1,
        trainerId: 101,
        trainerName: '강형욱',
        postTitle: '강아지 분리불안 상담',
        status: '답변 대기중',
        date: '2025-05-01',
        petType: '강아지',
        petBreed: '말티즈',
        petAge: '2살',
        comment: '강아지가 혼자 있을 때 짖고 불안해하는데 어떻게 해결할 수 있을까요?',
        hasReview: false
    },
    {
        id: 2,
        trainerId: 102,
        trainerName: '김민지',
        postTitle: '고양이 배변훈련 문제',
        status: '답변 완료',
        date: '2025-04-25',
        petType: '고양이',
        petBreed: '코리안 숏헤어',
        petAge: '1살',
        comment: '화장실 사용을 잘 하다가 갑자기 화장실 밖에서 볼일을 보기 시작했어요.',
        hasReview: false
    },
    {
        id: 3,
        trainerId: 103,
        trainerName: '박준호',
        postTitle: '강아지 산책 시 끌기 문제',
        status: '답변 완료',
        date: '2025-04-20',
        petType: '강아지',
        petBreed: '골든 리트리버',
        petAge: '3살',
        comment: '산책할 때 계속 앞으로 끌고 가서 힘들어요. 어떻게 훈련시킬 수 있을까요?',
        hasReview: true
    }
];

const myReviews = [
    {
        id: 1,
        author: "박*지",
        content: "펫시터 서비스 너무 만족스러웠어요. 다음에도 꼭 부탁드릴게요!",
        date: "2025-04-29",
        rating: 5,
        image: 'https://placedog.net/80/80?random=6'
    },
    {
        id: 2,
        author: "이*린",
        content: "정확한 훈련법 알려주셔서 감사합니다. 우리 강아지가 차분해졌어요.",
        date: "2025-04-28",
        rating: 4,
        image: 'https://placedog.net/80/80?random=6'
    },
    {
        id: 3,
        author: "박*준",
        content: "친절한 답변 감사드립니다. 토끼 관리가 한결 수월해졌어요.",
        date: "2025-04-27",
        rating: 5,
        image: 'https://placedog.net/80/80?random=6'
    }
];

const adviceRequests = [
    {
        id: 1,
        author: "김민수",
        postTitle: "강아지 분리불안 해결법",
        comment: "3살 푸들이 집에 혼자 있으면 계속 울어서요. 훈련 방법이 있을까요?",
        link: "/posts/dog-anxiety",
        date: "2025-04-23",
        status: "답변 대기중",
        petType: "강아지",
        petBreed: "푸들",
        petAge: "3살"
    },
    {
        id: 2,
        author: "이준호",
        postTitle: "고양이 식욕부진",
        comment: "평소 잘 먹던 고양이가 일주일째 밥을 거부해요. 병원 방문 전 체크할 증상 알려주세요.",
        link: "/posts/cat-appetite",
        date: "2025-04-22",
        status: "답변 완료",
        petType: "고양이",
        petBreed: "러시안 블루",
        petAge: "4살",
        chats: [
            {
                type: "trainer",
                message: "안녕하세요, 이준호님. 고양이 식욕부진은 다양한 원인이 있을 수 있어요. 혹시 최근에 사료를 바꾸셨나요? 또는, 고양이가 평소와 다른 행동을 보이나요?",
                time: "2025-04-22 10:15"
            }
        ]
    },
    {
        id: 3,
        author: "최하늘",
        postTitle: "햄스터 야행성 조절",
        comment: "햄스터가 밤새 울어서 잠을 못 자요. 낮 시간에 깨우는 팁이 있을까요?",
        link: "/posts/hamster-nocturnal",
        date: "2025-04-20",
        status: "답변 완료",
        petType: "햄스터",
        petBreed: "드워프 햄스터",
        petAge: "6개월",
        chats: [
            {
                type: "trainer",
                message: "안녕하세요, 최하늘님. 햄스터는 본래 야행성 동물이라 활동 패턴을 완전히 바꾸기는 어렵습니다. 하지만 몇 가지 방법으로 야간 소음을 줄일 수 있어요.",
                time: "2025-04-20 15:30"
            }
        ]
    }
];

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
                <p class="advice-content" data-content="${advice.content}">${advice.content || ''}</p>
            </div>
            <div class="advice-actions">
                <button data-id="${advice.applyId}" class="btn btn-primary btn-sm view-detail-btn">상세보기</button>
                ${advice.applyStatus === "답변 완료" && !advice.hasReviewed ?
            `<button data-id="${advice.id}" data-trainer="${advice.trainerName || '훈련사'}" class="btn btn-success btn-sm write-review-btn">리뷰 작성</button>` :
            advice.hasReviewed ?
                `<div class="review-button-container">
                        <button data-id="${advice.id}" class="btn btn-outline-secondary btn-sm view-review-btn">
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
        const res = await fetch(`${API_BASE_URL}/api/v1/match/${applyId}/answer`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        if (!res.ok) throw new Error('내가 신청한 상담 상세 조회 실패');
        const data = await res.json();
        console.log(data);
        return data || [];
    } catch (err) {
        console.error(err);
        alert('내가 신청한 상담 상세조회를 불러오는데 실패했습니다.');
        return [];
    }
}

// 상담 내역 이벤트 리스너 추가
function attachUserAdviceEventListeners() {
    const content = this.getAttribute('data-content');
    console.log(content);
    // 상세보기 버튼
    document.querySelectorAll('.view-detail-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // ① data-id 속성에서 ID 가져오기
            const adviceId = this.getAttribute('data-id');
            console.log(adviceId);
            // ② currentPosts 배열에서 applyId 가 일치하는 객체 찾기
            const adviceData = currentPosts.find(a => a.applyId === parseInt(adviceId, 10));
            // const adviceData = await fetchAdviceDetail(adviceId);
            if (adviceData) {
                // ③ 찾은 데이터로 상세모달 띄우기
                showAdviceDetailModal(adviceId, adviceData.trainerName, content);
                console.log('상세보기 호출된 adviceId:', adviceId);
            } else {
                alert('상담 정보를 찾을 수 없습니다.');
            }
        });
    });

    // 리뷰 작성 버튼
    document.querySelectorAll('.write-review-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const adviceId = this.getAttribute('data-id');
            const trainerName = this.getAttribute('data-trainer');
            showReviewModal(adviceId, trainerName);
        });
    });

    // 작성한 리뷰 보기 버튼
    document.querySelectorAll('.view-review-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const adviceId = this.getAttribute('data-id');
            showReviewDetailModal(adviceId);
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
function showAdviceDetailModal(adviceId, trainerName, content) {

    const adviceData = fetchAdviceDetail(adviceId);

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
                        <h5 class="modal-title" id="adviceDetailModalLabel">${adviceData.postTitle}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="advice-detail-info mb-4">
                            <div class="row">
                                <div class="col-md-6">
                                    <p><strong>상담 날짜:</strong> ${adviceData.createdAt}</p>
                                    <p><strong>상담 상태:</strong> 
                                        <span class="badge ${adviceData.applyStatus === 'PENDING' ? 'bg-warning' : adviceData.applyStatus === 'APPROVED'  ? 'bg-info' : 'bg-success'}"> ${ adviceData.applyStatus === 'PENDING'   ? '답변 대기' : adviceData.applyStatus === 'APPROVED'  ? '상담 수락' : (adviceData.applyStatus || '알 수 없음')} </span>
                                    </p>
                                </div>
                                <div class="col-md-6">
                                    <p><strong>반려동물:</strong> ${adviceData.petType} (${adviceData.petBreed}, ${adviceData.petMonthAge})</p>
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