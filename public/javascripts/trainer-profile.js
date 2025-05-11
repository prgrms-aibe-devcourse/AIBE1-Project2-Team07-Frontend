// 전역 변수
let trainerId; // URL에서 추출한 트레이너 ID
let currentPage = 1; // 현재 리뷰 페이지
const reviewsPerPage = 3; // 한 페이지당 리뷰 수
let trainerData = null; // 트레이너 데이터 저장
let allReviews = []; // 모든 리뷰 데이터 저장

window.currentUserId = 1;   // 나중에 로그인 한 사람으로 바꿔야 함

const baseUrl = "https://dev.tuituiworld.store/api/v1/";
const accessToken = localStorage.getItem('accessToken');
// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname;
    let trainerNickname = null;

    const match = path.match(/\/trainers\/profile\/(.+)/);
    if (match && match[1]) {
        trainerNickname = decodeURIComponent(match[1]);
    }

    if (trainerNickname) {
        loadTrainerDataByNickname(trainerNickname);
        loadTrainerReviewByNickname(trainerNickname);
    } else {
        showError('유효한 트레이너 정보가 전달되지 않았습니다.');
    }
});

// 트레이너 리뷰 데이터 로드 함수
async function loadTrainerReviewByNickname(trainerNickname) {
    try {
        const apiUrl = baseUrl + 'reviews/trainers/' + trainerNickname;
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const apiReviews = await response.json();

        // API 리뷰 데이터를 사이트 형식으로 변환
        allReviews = convertApiReviewsToSiteFormat(apiReviews);

    } catch (error) {
        console.error('리뷰 데이터 로드 오류:', error);
        showError('리뷰 정보를 불러오는 데 문제가 발생했습니다.');
    }
}

// API 리뷰 데이터를 사이트 형식으로 변환하는 함수
function convertApiReviewsToSiteFormat(apiReviews) {
    if (!Array.isArray(apiReviews)) {
        console.error('리뷰 데이터가 배열 형식이 아닙니다.');
        return [];
    }

    return apiReviews.map(review => {
        // 별점 유효성 검사 (1-5 사이의 값인지 확인)
        const validRating = review.rating >= 1 && review.rating <= 5 ? review.rating : 3;

        // 이름 마스킹 처리 (이미 마스킹 처리되어 있다면 그대로 사용)
        const nameWithMask = review.userNickname + "님"

        return {
            id: review.reviewId,
            name: nameWithMask,
            rating: validRating,
            content: review.comment || "",
            title: review.title || "",
            profileImage: review.userImageUrl || "https://placedog.net/100/100?random=" + review.reviewId,
            createdAt: review.createdAt,
            likeCount: review.likeCount || 0,
            hasLiked: review.hasLiked || false
        };
    });
}

// 리뷰 렌더링 함수 업데이트
function renderReviews(reviews, append = false) {
    const reviewsContainer = document.getElementById('reviews-container');

    if(!reviewsContainer) {
        console.log("없습니다")
        return;
    }

    // 리뷰가 없을 경우 메시지 표시
    if (reviews.length === 0) {
        const noReviewDiv = document.createElement('div');
        noReviewDiv.className = 'no-review-message text-center py-3';
        noReviewDiv.innerHTML = '<p class="text-muted">아직 작성된 리뷰가 없습니다.</p>';
        reviewsContainer.appendChild(noReviewDiv);
        return;
    }

    // 리뷰 추가
    reviews.forEach(review => {
        const reviewDiv = document.createElement('div');
        reviewDiv.className = 'review-item mb-4';

        // 별점 문자열 생성
        const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);

        // 날짜 포맷팅 (있는 경우)
        const formattedDate = review.createdAt
            ? new Date(review.createdAt).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
            : '';

        reviewDiv.innerHTML = `
<div class="review-header d-flex align-items-center mb-2">
  <div class="reviewer-photo-wrapper me-3">
    <img src="${review.profileImage || '/images/default-user.jpg'}" alt="리뷰어" class="reviewer-photo">
  </div>
  <div class="flex-grow-1">
    <div class="d-flex justify-content-between align-items-center">
      <h5 class="reviewer-name mb-0">${review.name}</h5>
      ${formattedDate ? `<small class="text-muted">${formattedDate}</small>` : ''}
    </div>
    <div class="review-rating">
      <span class="star-rating">${stars}</span>
    </div>
  </div>
</div>
<div class="review-content">
  ${review.title ? `<h6 class="review-title">${review.title}</h6>` : ''}
  <p>${review.content}</p>
</div>
<div class="review-actions mt-2">
  <button class="btn btn-sm btn-outline-secondary like-button ${review.hasLiked ? 'active' : ''}" 
    data-review-id="${review.id}">
    <i class="bi bi-heart${review.hasLiked ? '-fill' : ''}"></i> 
    좋아요 <span class="like-count">${review.likeCount}</span>
  </button>
</div>
`;

        reviewsContainer.appendChild(reviewDiv);
    });

    // 좋아요 버튼 이벤트 리스너 추가
    setupLikeButtonEvents();
}

// 좋아요 버튼 이벤트 리스너 설정
function setupLikeButtonEvents() {
    const likeButtons = document.querySelectorAll('.like-button');
    likeButtons.forEach(button => {
        button.addEventListener('click', async function(event) {
            event.preventDefault();

            const reviewId = this.dataset.reviewId;
            const isCurrentlyLiked = this.classList.contains('active');
            const likeCountEl = this.querySelector('.like-count');
            let likeCount = parseInt(likeCountEl.textContent);

            try {
                // 토큰이 없는 경우 로그인 필요 알림
                if (!accessToken) {
                    alert('로그인이 필요한 기능입니다.');
                    return;
                }

                // API 호출 (실제 API 엔드포인트로 수정 필요)
                const apiUrl = baseUrl + `reviews/${reviewId}/likes/toggle`;
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP Error: ${response.status}`);
                }

                // UI 업데이트
                if (isCurrentlyLiked) {
                    this.classList.remove('active');
                    this.querySelector('i').className = 'bi bi-heart';
                    likeCount--;
                } else {
                    this.classList.add('active');
                    this.querySelector('i').className = 'bi bi-heart-fill';
                    likeCount++;
                }

                likeCountEl.textContent = likeCount;

            } catch (error) {
                console.error('좋아요 처리 중 오류 발생:', error);
                alert('좋아요 처리 중 오류가 발생했습니다.');
            }
        });
    });
}

// 페이지 로드 시 실행 함수 업데이트
document.addEventListener('DOMContentLoaded', async function() {
    const path = window.location.pathname;
    let trainerNickname = null;

    const match = path.match(/\/trainers\/profile\/(.+)/);
    if (match && match[1]) {
        trainerNickname = decodeURIComponent(match[1]);
    }

    if (trainerNickname) {
        // 트레이너 프로필 데이터 로드
        loadTrainerDataByNickname(trainerNickname);

        // 트레이너 리뷰 데이터 로드
        loadTrainerReviewByNickname(trainerNickname);
    } else {
        showError('유효한 트레이너 정보가 전달되지 않았습니다.');
    }
});
// 트레이너 데이터 로드 함수
async function loadTrainerDataByNickname(trainerNickname) {
    try {
        // 로딩 스피너 표시
        document.getElementById('loading-spinner').classList.remove('d-none');

        // API에서 받아온 데이터를 사용
        // 실제 데이터 구조에 맞춰 아래 변환 로직 적용
        const apiUrl = baseUrl + 'trainers/' + trainerNickname;
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const apiData = await response.json();

        // API 데이터를 기존 사이트 형식으로 변환
        trainerData = convertApiDataToSiteFormat(apiData);
        window.nickname = apiData.nickname;
        // UI 렌더링
        renderTrainerProfile(trainerData);

        loadReviews(1);

        // 이벤트 리스너 설정
        setupEventListeners();

    } catch (error) {
        console.error('트레이너 데이터 로드 오류:', error);
        showError('트레이너 정보를 불러오는 데 문제가 발생했습니다.');
    } finally {
        // 로딩 스피너 숨김
        document.getElementById('loading-spinner').classList.add('d-none');
    }
}

// API 데이터를 사이트 형식으로 변환하는 함수
// API 데이터를 사이트 형식으로 변환하는 함수
function convertApiDataToSiteFormat(apiData) {
    // 기본 이미지 URL (프로필 이미지가 없을 경우 사용)
    const defaultProfileImage = "https://placedog.net/200/200?random=1";
    const defaultPhoto = "https://placedog.net/600/400?random";

    // 전문 분야 배열을 문자열로 변환
    const specialties = apiData.specializationText;
    const tags = apiData.specializations ? apiData.specializations : [];

    // 서비스 요금 변환 (새 형식에 맞춤)
    const prices = [];
    if (apiData.serviceFees && Array.isArray(apiData.serviceFees)) {
        apiData.serviceFees.forEach(fee => {
            // 서비스 타입을 한글로 변환
            let type = "교육";
            if (fee.serviceType === "VIDEO_TRAINING") {
                type = "영상교육";
            } else if (fee.serviceType === "VISIT_TRAINING") {
                type = "방문교육";
            }

            // 시간 포맷팅
            const duration = `${fee.durationMinutes}분`;

            prices.push({
                type: type,
                duration: duration,
                amount: fee.feeAmount
            });
        });
    }

    // 서비스 요금이 없을 경우 기본 가격 설정
    if (prices.length === 0) {
        prices.push(
            { type: "방문교육", duration: "60분", amount: 50000 },
            { type: "영상교육", duration: "30분", amount: 30000 }
        );
    }

    // 자격증 정보 변환
    const qualifications = [];
    if (apiData.certifications && apiData.certifications.length > 0) {
        apiData.certifications.forEach(cert => {
            qualifications.push({
                title: cert.name || "자격증",
                organization: cert.issuingOrganization || "발급기관",
                image: "https://cdn-icons-png.flaticon.com/512/190/190411.png" // 기본 이미지
            });
        });
    } else {
        // 자격증이 없을 경우 기본 자격증 설정
        qualifications.push(
            { title: "반려동물 행동 전문가", organization: "한국애견연맹", image: "https://cdn-icons-png.flaticon.com/512/190/190411.png" }
        );
    }

    // 사진 배열 처리
    let photos = [defaultPhoto, defaultPhoto];
    if (apiData.photos) {
        try {
            // 문자열이면 파싱 시도
            if (typeof apiData.photos === 'string') {
                const parsedPhotos = JSON.parse(apiData.photos);
                if (Array.isArray(parsedPhotos) && parsedPhotos.length > 0) {
                    photos = parsedPhotos;
                }
            }
            // 이미 배열이면 그대로 사용
            else if (Array.isArray(apiData.photos) && apiData.photos.length > 0) {
                photos = apiData.photos;
            }
        } catch (error) {
            console.error("사진 데이터 파싱 오류:", error);
        }
    }

    return {
        id: apiData.trainerId,
        title: apiData.title || "반려동물 행동 전문가", // 제목이 없으면 기본값 사용
        name: apiData.nickname + " 훈련사",
        profileImage: apiData.profileImageUrl && apiData.profileImageUrl !== "string"
            ? apiData.profileImageUrl
            : defaultProfileImage,
        rating: apiData.averageRating || 0,
        reviewCount: apiData.reviewCount || 0,
        career: apiData.representativeCareer || `반려견 훈련 ${apiData.experienceYears || 0}년 경력`,
        specialties: specialties || apiData.specializationText || "기본 훈련, 행동 교정",
        tags: tags,
        locations: apiData.visitingAreas || "서울 전역",
        photos: photos,
        qualifications: qualifications,
        prices: prices,
        description: apiData.introduction || "반려동물 행동 및 훈련 전문가입니다."
    };
}


// 트레이너 프로필 렌더링 함수
function renderTrainerProfile(data) {
    // 템플릿 복제
    const template = document
        .getElementById('trainer-profile-template')
        .content.cloneNode(true);
    const container = document.getElementById('trainer-profile-container');

    // 1. 제목 및 “수정” 버튼
    const titleContainer = template.querySelector('#trainer-title-container');
    const titleEl = template.querySelector('#trainer-title');
    titleEl.textContent = data.title;

    // 로그인 사용자 ID와 트레이너 ID가 같으면 “수정” 버튼 추가
    if (window.currentUserId === data.id) {
        const editBtn = document.createElement('button');
        editBtn.type      = 'button';
        editBtn.className = 'btn btn-outline-secondary btn-sm btn-edit';
        editBtn.textContent = '수정';
        editBtn.addEventListener('click', () => {
            openEditTrainerModal(data);
        });
        titleContainer.appendChild(editBtn);
    }

    // 기본 정보 설정
    template.querySelector('#trainer-title').textContent = data.title;
    template.querySelector('#trainer-name').textContent = data.name;
    template.querySelector('#trainer-rating').textContent = data.rating.toFixed(1);
    template.querySelector('#review-count').textContent = `(${data.reviewCount}개의 리뷰)`;
    template.querySelector('#reviews-title').textContent = `고객 후기 ${data.reviewCount}개`;

    // 트레이너 프로필 이미지
    template.querySelector('#trainer-profile-image').src = data.profileImage;

    if (data.tags && data.tags.length > 0) {
        // trainer-info 바로 다음에 태그 컨테이너 추가
        const trainerInfo = template.querySelector('.trainer-info');

        if (trainerInfo) {
            // 기존 태그 컨테이너가 있는지 확인
            let tagsContainer = template.querySelector('.trainer-tags-container');

            // 없으면 생성
            if (!tagsContainer) {
                tagsContainer = document.createElement('div');
                tagsContainer.className = 'trainer-tags-container mb-4';

                // 태그 제목 추가
                const tagsTitle = document.createElement('h5');
                tagsTitle.className = 'tags-title mb-3';
                tagsTitle.textContent = '태그';
                tagsContainer.appendChild(tagsTitle);

                // 태그들을 담을 div 생성
                const tagsDiv = document.createElement('div');
                tagsDiv.id = 'trainer-tags';
                tagsDiv.className = 'trainer-tags';
                tagsContainer.appendChild(tagsDiv);

                // trainer-info 다음, hr 전에 삽입
                const nextHr = trainerInfo.nextElementSibling;
                trainerInfo.parentNode.insertBefore(tagsContainer, nextHr);
            }

            // 태그 렌더링
            const tagsEl = tagsContainer.querySelector('#trainer-tags');
            data.tags.forEach(tag => {
                const tagSpan = document.createElement('span');
                tagSpan.className = 'badge me-2 mb-2';
                tagSpan.textContent = `#${tag}`;
                tagsEl.appendChild(tagSpan);
            });
        }
    }

    // 트레이너 사진 갤러리
    const photosContainer = template.querySelector('#trainer-photos');
    data.photos.forEach((photo, index) => {
        const colDiv = document.createElement('div');
        colDiv.className = 'col-md-6';

        const img = document.createElement('img');
        img.src = photo;
        img.alt = `트레이너 사진 ${index + 1}`;
        img.className = 'img-fluid cat-photo';

        colDiv.appendChild(img);
        photosContainer.appendChild(colDiv);
    });

    // 경력, 전문 분야, 방문 지역
    template.querySelector('#trainer-career').textContent = data.career;
    template.querySelector('#trainer-specialties').textContent = data.specialties;
    template.querySelector('#trainer-locations').textContent = data.locations;

    // 자격/경력
    const qualificationsContainer = template.querySelector('#qualifications-container');
    data.qualifications.forEach(qualification => {
        const qualDiv = document.createElement('div');
        qualDiv.className = 'qualification-item d-flex align-items-center mb-3';

        qualDiv.innerHTML = `
      <div class="qualification-image me-3">
        <img src="${qualification.image}" alt="자격증" class="img-fluid rounded" width="80">
      </div>
      <div class="qualification-info">
        <p class="qualification-title mb-1">${qualification.title}</p>
        <p class="qualification-org mb-0 text-muted">${qualification.organization}</p>
      </div>
    `;

        qualificationsContainer.appendChild(qualDiv);
    });

    // 가격 정보
    const priceTableBody = template.querySelector('#price-table-body');
    data.prices.forEach(price => {
        const row = document.createElement('tr');
        row.innerHTML = `
      <td>${price.duration}</td>
      <td>${price.type}</td>
      <td class="text-end fw-bold">₩${formatNumber(price.amount)}</td>
    `;
        priceTableBody.appendChild(row);
    });

    // 자기소개
    const descEl = template.querySelector('#trainer-description');
    // \n 을 <br> 로 바꿔서 innerHTML 로 삽입
    descEl.innerHTML = data.description
        .split('\n')
        .map(line => line.trim() ? line : '')  // 빈 줄은 빈 문자열로
        .join('<br>');

    // 컨테이너에 렌더링된 템플릿 추가
    container.innerHTML = '';
    container.appendChild(template);

    // 컨테이너 표시
    container.classList.remove('d-none');

    const serviceType = new URLSearchParams(window.location.search).get('serviceType'); // 'video' or 'visit'
    if (serviceType) {
        const trainerName = data.name;
        // 타이틀
        const modalTitle = document.getElementById('inquiryModalLabel');
        modalTitle.textContent = `${trainerName}님에게 ${serviceType === 'video' ? '영상' : '방문'} 문의`;

        // 라디오 체크
        const radio = document.querySelector(`input[name="serviceType"][value="${serviceType}"]`);
        if (radio) radio.checked = true;

        new bootstrap.Modal(document.getElementById('inquiryModal')).show();
    }
}

function toggleDescription() {
    const desc = document.getElementById('trainer-description');
    const btn = document.getElementById('toggle-description-btn');

    if (desc.classList.contains('collapsed')) {
        desc.classList.remove('collapsed');
        btn.textContent = '접기';
    } else {
        desc.classList.add('collapsed');
        btn.textContent = '더보기';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('toggle-description-btn');
    const desc = document.getElementById('trainer-description');

    if (btn && desc) {
        btn.addEventListener('click', toggleDescription);

        // 초기 길이에 따라 버튼 표시 여부 결정
        if (desc.textContent.length < 200) {
            btn.style.display = 'none';
        }
    }
});

// 리뷰 로드 함수 - 페이징 처리 개선
function loadReviews(page, append = false) {
    try {
        // 페이징 처리
        const startIndex = (page - 1) * reviewsPerPage;
        const endIndex = Math.min(startIndex + reviewsPerPage, allReviews.length);

        // 현재 페이지의 리뷰만 가져오기
        const pageReviews = allReviews.slice(startIndex, endIndex);

        // 리뷰 렌더링
        renderReviews(pageReviews, append);

        // 더 이상 리뷰가 없으면 더보기 버튼 숨김
        if (endIndex >= allReviews.length) {
            document.getElementById('load-more-reviews').classList.add('d-none');
        } else {
            document.getElementById('load-more-reviews').classList.remove('d-none');
        }

        // 현재 페이지 업데이트
        currentPage = page;

    } catch (error) {
        console.error('리뷰 로드 오류:', error);
        showError('리뷰를 불러오는 데 문제가 발생했습니다.');
    }
}


// 이벤트 리스너 설정 함수
function setupEventListeners() {
    // 후기 더보기 버튼 클릭 이벤트
    const reviewMoreBtn = document.getElementById('load-more-reviews');
    if (reviewMoreBtn) {
        reviewMoreBtn.addEventListener('click', function() {
            loadReviews(currentPage + 1, true);
        });
    }

    // 설명 접기/펼치기 버튼 이벤트
    const toggleBtn = document.getElementById('toggle-description-btn');
    const desc = document.getElementById('trainer-description');

    if (toggleBtn && desc) {
        toggleBtn.addEventListener('click', toggleDescription);

        // 초기 길이에 따라 버튼 표시 여부 결정
        if (desc.textContent.length < 200) {
            toggleBtn.style.display = 'none';
        }
    }
}

// 에러 메시지 표시 함수
function showError(message) {
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = message;
    errorElement.classList.remove('d-none');
}

// 숫자 포맷팅 (천 단위 콤마)
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}