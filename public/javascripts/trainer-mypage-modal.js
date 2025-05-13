// DOMContentLoaded 시 모달 이벤트용 함수 등록
document.addEventListener('DOMContentLoaded', () => {
    // 모든 모달의 확인 버튼에 이벤트 바인딩
    document.querySelector('#detailModal .btn-close').addEventListener('click', () => {
        const modal = bootstrap.Modal.getInstance(document.getElementById('detailModal'));
        if (modal) modal.hide();
    });

    document.querySelector('#acceptModal .accept-confirm-btn').addEventListener('click', () => {
        handleAcceptConfirm();
    });

    document.querySelector('#rejectModal .reject-confirm-btn').addEventListener('click', () => {
        handleRejectConfirm();
    });
});

// 리스트 버튼에 바인딩
function attachAdviceEventListeners(adviceData) {
    document.querySelectorAll('.view-detail-btn').forEach(btn => {
        btn.onclick = () => {
            const id = +btn.dataset.id;
            const item = adviceData.find(a => a.id === id);
            if (item) showDetailModal(item);
        };
    });

    document.querySelectorAll('.accept-btn').forEach(btn => {
        btn.onclick = () => {
            const id = +btn.dataset.id;
            const item = adviceData.find(a => a.id === id);
            if (item) showAcceptModal(item);
        };
    });

    document.querySelectorAll('.reject-btn').forEach(btn => {
        btn.onclick = () => {
            const id = +btn.dataset.id;
            const item = adviceData.find(a => a.id === id);
            if (item) showRejectModal(item);
        };
    });

    document.querySelectorAll('.view-review-btn').forEach(btn => {
        btn.onclick = () => {
            const id = +btn.dataset.id;
            viewReview(id);
        };
    });
}

// 1) 상세보기 모달 - 답변 등록 기능 제거
// 상세보기 모달에서 상담 내역 표시 부분 수정
async function showDetailModal(item) {
    const M = document.getElementById('detailModal');
    M.dataset.adviceId = item.id;
    const badgeClass = item.status.includes('대기') ? 'status-pending'
        : item.status.includes('진행') ? 'status-progress'
            : 'status-completed';

    M.querySelector('.modal-title').innerHTML = `
    상담 신청 상세 내용
    <span class="status-badge ${badgeClass}">${item.status}</span>
  `;
    M.querySelector('.advice-meta').innerHTML = `
    <div class="d-flex justify-content-between">
      <span><strong>작성자:</strong> ${item.author}</span>
      <span class="ms-3"><strong>신청일:</strong> ${item.date}</span>
    </div>
  `;
    M.querySelector('.advice-title').textContent = item.postTitle;
    M.querySelector('.pet-info').innerHTML = `
    <span class="pet-type">${item.petType}</span>
    <span class="pet-breed">${item.petBreed}</span>
    <span class="pet-age">${item.petAge}</span>
  `;
    M.querySelector('.advice-content').textContent = item.comment;

    // 로딩 메시지 표시
    M.querySelector('.chat-messages').innerHTML = '<p class="text-center">상담 내역을 불러오는 중...</p>';

    let historyHTML = '';

    try {
        // API에서 상담 답변 가져오기 (URL 오타 수정 - ap1 → api)
        const historyData = await apiRequest(`/api/v1/match/${item.id}/answer`);

        // item.chats가 있으면 그것을 사용하고, 없으면 historyData를 사용
        if (item.chats && item.chats.length) {
            item.chats.forEach(c => {
                historyHTML += `
                <div class="advice-chat-item advice-${c.type}">
                  <div>${c.message}</div>
                  <span class="chat-time">${c.time}</span>
                </div>
              `;
            });
        } else if (historyData && historyData.content) {
            // 백틱 내에서 템플릿 리터럴을 사용하려면 ${}를 이스케이프 처리하거나 concatenation 사용
            historyHTML = '<p class="text-muted">' + historyData.content + '</p>';

            // 또는 이렇게도 가능:
            // historyHTML = `<p class="text-muted">${historyData.content}</p>`;
        } else {
            historyHTML = '<p class="text-muted">아직 상담 내역이 없습니다.</p>';
        }
    } catch (error) {
        console.error('상담 내역 가져오기 오류:', error);
        historyHTML = '<p class="">아직 상담 내역이 없습니다.</p>';
    }

    M.querySelector('.chat-messages').innerHTML = historyHTML;

    // 답변 폼과 버튼 숨기기 (항상 숨김 처리)
    M.querySelector('.reply-form').style.display = 'none';
    M.querySelector('.reply-btn').style.display = 'none';

    new bootstrap.Modal(M).show();
}

// 2) 수락하기 모달 수정
function showAcceptModal(item) {
    const M = document.getElementById('acceptModal');
    M.dataset.adviceId = item.id; // ID 저장 추가

    M.querySelector('.advice-meta').innerHTML = `
    <span><strong>작성자:</strong> ${item.author}</span>
    <span class="ms-3"><strong>신청일:</strong> ${item.date}</span>
  `;
    M.querySelector('.advice-title').textContent = item.postTitle;
    M.querySelector('.pet-info').innerHTML = `
    <span class="pet-type">${item.petType}</span>
    <span class="pet-breed">${item.petBreed}</span>
    <span class="pet-age">${item.petAge}</span>
  `;
    M.querySelector('.advice-content').textContent = item.comment;
    M.querySelector('#acceptMessage').value = '';

    new bootstrap.Modal(M).show();
}

// 2-1) 수락 확인 처리 함수
async function handleAcceptConfirm() {
    try {
        const M = document.getElementById('acceptModal');
        const adviceId = +M.dataset.adviceId;

        if (!adviceId) {
            alert('상담 정보를 찾을 수 없습니다.');
            return;
        }

        const msg = M.querySelector('#acceptMessage').value.trim();
        if (!msg) {
            alert('메시지를 입력해주세요.');
            return;
        }

        // API 호출
        await fetch(
            `/api/v1/match/${adviceId}/status`,
            {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    applyId: adviceId,
                    applyStatus: 'APPROVED',
                    applyReason: 'ACCEPTED',
                    content: msg
                })
            }
        );

        // 성공 처리
        alert('상담이 성공적으로 수락되었습니다.');
        bootstrap.Modal.getInstance(M).hide();

        // 상담 목록 새로고침
        await showMyAdvices();

    } catch (error) {
        console.error('상담 수락 중 오류 발생:', error);
        alert('상담 수락 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
}

// 3) 거절하기 모달
function showRejectModal(item) {
    const M = document.getElementById('rejectModal');
    M.dataset.adviceId = item.id; // ID 저장 추가

    M.querySelector('.advice-meta').innerHTML = `
    <span><strong>작성자:</strong> ${item.author}</span>
    <span class="ms-3"><strong>신청일:</strong> ${item.date}</span>
  `;
    M.querySelector('.advice-title').textContent = item.postTitle;
    M.querySelector('.pet-info').innerHTML = `
    <span class="pet-type">${item.petType}</span>
    <span class="pet-breed">${item.petBreed}</span>
    <span class="pet-age">${item.petAge}</span>
  `;
    M.querySelector('.advice-content').textContent = item.comment;
    M.querySelector('#rejectReason').value = '';
    M.querySelector('#rejectMessage').value = '';

    new bootstrap.Modal(M).show();
}

// 3-1) 거절 확인 처리 함수
async function handleRejectConfirm() {
    try {
        const M = document.getElementById('rejectModal');
        const adviceId = +M.dataset.adviceId;

        if (!adviceId) {
            alert('상담 정보를 찾을 수 없습니다.');
            return;
        }

        const reasonSelect = M.querySelector('#rejectReason');
        const messageElement = M.querySelector('#rejectMessage');

        const reason = reasonSelect.value;
        const msg = messageElement.value.trim();

        if (!reason) {
            alert('사유를 선택해주세요.');
            return;
        }

        if (!msg) {
            alert('메시지를 입력해주세요.');
            return;
        }

        // 사유 매핑
        const reasonMap = {
            'specialization': 'NOT_EXPERTISE',
            'schedule': 'SCHEDULE_UNAVAILABLE',
            'information': 'INSUFFICIENT_INFORMATION',
            'policy': 'POLICY_VIOLATION',
            'other': 'OTHER'
        };

        // API 호출
        await fetch(
            `/api/v1/match/${adviceId}/status`,
            {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    applyId: adviceId,
                    applyStatus: 'REJECTED',
                    applyReason: reasonMap[reason],
                    content: msg
                })
            }
        );

        // 성공 처리
        alert('상담이 거절되었습니다.');
        bootstrap.Modal.getInstance(M).hide();

        // 상담 목록 새로고침
        await showMyAdvices();

    } catch (error) {
        console.error('상담 거절 중 오류 발생:', error);
        alert('상담 거절 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
}

// 4) 후기 보기 기능
async function viewReview(adviceId) {
    try {
        // API 호출하여 후기 데이터 가져오기
        const reviewData = await apiRequest(`/api/v1/reviews/applyId/${adviceId}`);

        if (!reviewData) {
            throw new Error('후기 정보를 찾을 수 없습니다.');
        }

        // 후기 모달 생성 (없으면 동적으로 생성)
        let reviewModal = document.getElementById('reviewModal');
        if (!reviewModal) {
            // 모달 동적 생성
            const modalHTML = `
                <div class="modal fade" id="reviewModal" tabindex="-1" aria-labelledby="reviewModalLabel" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content">
                            <div class="trainer-modal-header d-flex justify-content-between align-items-center">
                                <h5 class="modal-title" id="reviewModalLabel">후기 상세</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <div class="review-header d-flex justify-content-between align-items-center">
                                    <div class="review-user-info d-flex align-items-center">
                                        <img src="${reviewData.userImageUrl || 'https://placehold.co/50x50?text=프로필'}" alt="프로필" class="rounded-circle me-2" style="width: 50px; height: 50px;">
                                        <div>
                                            <strong>${reviewData.userNickname || '익명 사용자'}</strong>
                                            <div class="text-muted small">${reviewData.createdAt || '날짜 정보 없음'}</div>
                                        </div>
                                    </div>
                                    <div class="review-rating">
                                        ${'★'.repeat(reviewData.rating || 0)}${'☆'.repeat(5 - (reviewData.rating || 0))}
                                    </div>
                                </div>
                                <div class="review-title mt-3">
                                    <h6>${reviewData.title || '제목 없음'}</h6>
                                </div>
                                <div class="review-content mt-2">
                                    <p>${reviewData.comment || '내용 없음'}</p>
                                </div>
                                ${reviewData.reviewImageUrl ? `
                                <div class="review-image mt-3">
                                    <img src="${reviewData.reviewImageUrl}" alt="리뷰 이미지" class="img-fluid rounded">
                                </div>` : ''}
                                <div class="review-stats mt-3 d-flex align-items-center">
                                    <span class="me-3">
                                        <i class="bi bi-heart${reviewData.hasLiked ? '-fill text-danger' : ''}"></i> 
                                        좋아요 ${reviewData.likeCount || 0}
                                    </span>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">닫기</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // DOM에 모달 추가
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            reviewModal = document.getElementById('reviewModal');
        } else {
            // 기존 모달이 있으면 내용 업데이트
            const userInfoSection = reviewModal.querySelector('.review-user-info');
            if (userInfoSection) {
                const profileImg = userInfoSection.querySelector('img');
                if (profileImg) profileImg.src = reviewData.userImageUrl || 'https://placehold.co/50x50?text=프로필';

                const nameElem = userInfoSection.querySelector('strong');
                if (nameElem) nameElem.textContent = reviewData.userNickname || '익명 사용자';

                const dateElem = userInfoSection.querySelector('.text-muted');
                if (dateElem) dateElem.textContent = reviewData.createdAt || '날짜 정보 없음';
            }

            const ratingElem = reviewModal.querySelector('.review-rating');
            if (ratingElem) ratingElem.innerHTML = '★'.repeat(reviewData.rating || 0) + '☆'.repeat(5 - (reviewData.rating || 0));

            const titleElem = reviewModal.querySelector('.review-title h6');
            if (titleElem) titleElem.textContent = reviewData.title || '제목 없음';

            const contentElem = reviewModal.querySelector('.review-content p');
            if (contentElem) contentElem.textContent = reviewData.comment || '내용 없음';

            // 이미지 처리
            const imageContainer = reviewModal.querySelector('.review-image');
            if (reviewData.reviewImageUrl) {
                if (imageContainer) {
                    const imgElem = imageContainer.querySelector('img');
                    if (imgElem) imgElem.src = reviewData.reviewImageUrl;
                } else {
                    const contentSection = reviewModal.querySelector('.review-content');
                    if (contentSection) {
                        const newImageContainer = document.createElement('div');
                        newImageContainer.className = 'review-image mt-3';
                        newImageContainer.innerHTML = `<img src="${reviewData.reviewImageUrl}" alt="리뷰 이미지" class="img-fluid rounded">`;
                        contentSection.after(newImageContainer);
                    }
                }
            } else if (imageContainer) {
                imageContainer.remove();
            }

            // 좋아요 상태 업데이트
            const statsSection = reviewModal.querySelector('.review-stats');
            if (statsSection) {
                const likeElement = statsSection.querySelector('span');
                if (likeElement) {
                    likeElement.innerHTML = `
                        <i class="bi bi-heart${reviewData.hasLiked ? '-fill text-danger' : ''}"></i> 
                        좋아요 ${reviewData.likeCount || 0}
                    `;
                }
            }
        }

        // 모달 표시
        new bootstrap.Modal(reviewModal).show();

        // 닫기 버튼에 이벤트 리스너 추가
        reviewModal.querySelector('.btn-close').addEventListener('click', () => {
            const modal = bootstrap.Modal.getInstance(reviewModal);
            if (modal) modal.hide();
        });

        reviewModal.querySelector('.modal-footer .btn-secondary').addEventListener('click', () => {
            const modal = bootstrap.Modal.getInstance(reviewModal);
            if (modal) modal.hide();
        });

    } catch (error) {
        console.error('후기 조회 중 오류 발생:', error);
        alert('후기 정보를 불러오는 중 오류가 발생했습니다.');
    }
}