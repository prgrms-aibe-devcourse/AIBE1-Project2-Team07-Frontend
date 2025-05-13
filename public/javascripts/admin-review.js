// 로컬스토리지에서 user 정보
const userJSON = localStorage.getItem('user');
const accessToken = localStorage.getItem('accessToken');
let storedUser = null;

try {
    storedUser = JSON.parse(userJSON);
} catch (e) {
    console.error('로컬스토리지 사용자 정보 파싱 실패:', e);
}

document.addEventListener('DOMContentLoaded', function() {
    // Show loading initially
    document.getElementById('loader').classList.remove('hidden');
    document.getElementById('reviewListContainer').classList.add('hidden');

    fetchReviews()
        .finally(() => {
            // Hide loader when done
            document.getElementById('loader').classList.add('hidden');
            document.getElementById('reviewListContainer').classList.remove('hidden');
        });

    // Close modal when clicking the close button
    document.getElementById('closeModal').addEventListener('click', function() {
        document.getElementById('reviewModal').classList.add('hidden');
    });

    // Close modal when clicking outside of it
    document.addEventListener('mouseup', function(e) {
        const modal = document.querySelector("#reviewModal .bg-white");
        if (!modal.contains(e.target)) {
            document.getElementById('reviewModal').classList.add('hidden');
        }
    });
});

async function fetchReviews() {
    try {
        if (!accessToken) {
            throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.');
        }

        const res = await fetch(`/api/v1/admin/reviews`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(`리뷰 목록 조회 실패 (${res.status}): ${errorData.message || res.statusText}`);
        }

        const data = await res.json();
        console.log('리뷰 목록:', data);
        renderReviews(data);
        return data;
    } catch (err) {
        console.error('리뷰 목록 조회 오류:', err);
        showStatus(`리뷰 목록 조회 실패: ${err.message}`, 'error');
        renderReviews([]);
        return [];
    }
}

function renderReviews(reviews) {
    const container = document.getElementById('reviewList');
    container.innerHTML = '';

    if (!reviews.length) {
        document.getElementById('noReviewsMessage').classList.remove('hidden');
        return;
    }
    document.getElementById('noReviewsMessage').classList.add('hidden');

    reviews.forEach(review => {
        // 날짜 형식 변환
        const createdDate = new Date(review.createdAt);
        const formattedDate = createdDate.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });

        const row = document.createElement('tr');
        row.className = 'border-b border-gray-200 hover:bg-gray-100';
        row.innerHTML = `
          <td class="py-4 px-6">
            <div class="font-medium">${review.userNickname || '사용자'}</div>
          </td>
          <td class="py-4 px-6">
            <div class="ellipsis" style="max-width: 250px;">${review.trainerNickname}</div>
          </td>
          <td class="py-4 px-6">
            <div class="ellipsis" style="max-width: 250px;">${review.comment || '내용 없음'}</div>
          </td>
          <td class="py-4 px-6 text-center">
            ${formattedDate}
          </td>
          <td class="py-4 px-6 text-center">
            <div class="flex justify-center space-x-4">
              <span class="flex items-center">
                <svg class="w-4 h-4 text-red-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path>
                </svg>
                ${review.likeCount}
              </span>
            </div>
          </td>
          <td class="py-4 px-6 text-center">
            <div class="flex justify-center space-x-2">
              <button class="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600 focus:ring-2 focus:ring-blue-300"
                      onclick="viewReviewDetail(${review.applyId})">상세</button>
              <button class="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600 focus:ring-2 focus:ring-red-300"
                      onclick="deleteReview(${review.reviewId})">삭제</button>
            </div>
          </td>
        `;
        container.appendChild(row);
    });
}

async function viewReviewDetail(applyId) {
    document.getElementById('reviewDetailContainer').classList.add('hidden');
    document.getElementById('modalError').classList.add('hidden');
    document.getElementById('modalLoading').classList.remove('hidden');
    document.getElementById('reviewModal').classList.remove('hidden');

    try {
        const res = await fetch(`/api/v1/reviews/applyId/${applyId}`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) {
            throw new Error(`리뷰 상세 조회 실패 (${res.status})`);
        }

        const reviewDetail = await res.json();
        console.log('리뷰 상세:', reviewDetail);

        // 리뷰 상세 정보 렌더링
        renderReviewDetail(reviewDetail);

    } catch (err) {
        console.error('리뷰 상세 조회 오류:', err);
        document.getElementById('modalLoading').classList.add('hidden');
        document.getElementById('modalError').classList.remove('hidden');
        document.getElementById('modalError').textContent = `리뷰 상세를 불러오는데 실패했습니다: ${err.message}`;
    }
}

function renderReviewDetail(reviewDetail) {
    // 사용자 정보
    document.getElementById('userImage').src = reviewDetail.userImageUrl || '/images/default-user.png';
    document.getElementById('userNickname').textContent = reviewDetail.userNickname || '알 수 없음';

    // 날짜 표시
    const createdDate = new Date(reviewDetail.createdAt);
    document.getElementById('reviewDate').textContent = createdDate.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });

    // 별점 표시
    const ratingStars = document.getElementById('ratingStars');
    ratingStars.innerHTML = '';
    const rating = parseInt(reviewDetail.rating) || 0;
    for (let i = 0; i < 5; i++) {
        const star = document.createElement('span');
        star.textContent = i < rating ? '★' : '☆';
        ratingStars.appendChild(star);
    }

    // 훈련사 정보
    document.getElementById('trainerImage').src = reviewDetail.trainerImageUrl || '/images/default-trainer.png';
    document.getElementById('trainerName').textContent = reviewDetail.trainerName || '알 수 없음';
    document.getElementById('trainerNickname').textContent = reviewDetail.trainerNickname || '';

    // 리뷰 내용
    document.getElementById('reviewComment').textContent = reviewDetail.comment || '내용 없음';

    // 리뷰 이미지
    const reviewImageContainer = document.getElementById('reviewImageContainer');
    const reviewImage = document.getElementById('reviewImage');

    if (reviewDetail.reviewImageUrl) {
        reviewImage.src = reviewDetail.reviewImageUrl;
        reviewImageContainer.classList.remove('hidden');
    } else {
        reviewImageContainer.classList.add('hidden');
    }

    // 좋아요 정보
    document.getElementById('likeCount').textContent = `좋아요 ${reviewDetail.likeCount || 0}개`;

    // 모달 표시
    document.getElementById('modalLoading').classList.add('hidden');
    document.getElementById('reviewDetailContainer').classList.remove('hidden');
}

function deleteReview(reviewId) {
    if (!confirm('정말 이 리뷰를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;

    showStatus('리뷰 삭제 중...', 'loading');

    fetch(`/api/v1/admin/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(async response => {
            if (!response.ok) {
                // 에러 바디가 있으면 파싱, 없으면 상태 텍스트 사용
                let msg = response.statusText;
                try {
                    const errJson = await response.json();
                    msg = errJson.message || msg;
                } catch {}
                throw new Error(msg);
            }
            // 성공 시 빈 바디라도 에러 안 나게 처리
            try {
                return await response.json();
            } catch {
                return {};
            }
        })
        .then(() => {
            showStatus('리뷰가 성공적으로 삭제되었습니다.', 'success');
            fetchReviews();
        })
        .catch(error => {
            console.error('삭제 오류:', error);
            showStatus(`리뷰 삭제 중 오류가 발생했습니다: ${error.message}`, 'error');
        });
}

function showStatus(message, type) {
    const statusDiv = document.getElementById('statusMessage');
    statusDiv.classList.remove('hidden', 'bg-green-100', 'bg-red-100', 'bg-blue-100', 'text-green-800', 'text-red-800', 'text-blue-800');

    if (type === 'success') {
        statusDiv.classList.add('bg-green-100', 'text-green-800');
    } else if (type === 'error') {
        statusDiv.classList.add('bg-red-100', 'text-red-800');
    } else if (type === 'loading') {
        statusDiv.classList.add('bg-blue-100', 'text-blue-800');
    }

    statusDiv.textContent = message;
    statusDiv.classList.remove('hidden');

    // Auto hide after 5 seconds for success and error messages
    if (type !== 'loading') {
        setTimeout(function() {
            statusDiv.classList.add('hidden');
        }, 5000);
    }
}