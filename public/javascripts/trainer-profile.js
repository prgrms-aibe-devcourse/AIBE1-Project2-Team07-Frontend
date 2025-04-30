// 전역 변수
let trainerId; // URL에서 추출한 트레이너 ID
let currentPage = 1; // 현재 리뷰 페이지
const reviewsPerPage = 3; // 한 페이지당 리뷰 수 (5에서 3으로 변경)
let trainerData = null; // 트레이너 데이터 저장
let allReviews = []; // 모든 리뷰 데이터 저장

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    // URL에서 트레이너 ID 추출
    const urlParams = new URLSearchParams(window.location.search);
    // trainerId = urlParams.get('id');  // 나중에이걸로바꿀거임
    trainerId = 1;

    if (!trainerId) {
        showError('트레이너 ID가 제공되지 않았습니다.');
        return;
    }

    // 트레이너 정보 로드 - 더미 데이터로 바로 사용
    loadTrainerData();
});

// 트레이너 데이터 로드 함수
async function loadTrainerData() {
    try {
        // 로딩 스피너 표시
        document.getElementById('loading-spinner').classList.remove('d-none');

        // API 호출 대신 더미 데이터 사용
        // const apiUrl = `/api/trainers/${trainerId}`;
        // const response = await fetch(apiUrl);
        // if (!response.ok) {
        //     throw new Error(`HTTP Error: ${response.status}`);
        // }
        // trainerData = await response.json();

        // 더미 데이터 직접 사용
        trainerData = getDummyData();

        // UI 렌더링
        renderTrainerProfile(trainerData);

        // 더미 리뷰 데이터 가져오기
        const reviewsData = getDummyReviews();
        allReviews = reviewsData.reviews; // 모든 리뷰 데이터 저장

        // 초기 리뷰 로드 - 첫 페이지만 표시
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

// 트레이너 프로필 렌더링 함수
function renderTrainerProfile(data) {
    // 컨테이너에서 템플릿 복제
    const template = document.getElementById('trainer-profile-template').content.cloneNode(true);
    const container = document.getElementById('trainer-profile-container');

    // 기본 정보 설정
    template.querySelector('#trainer-title').textContent = data.title;
    template.querySelector('#trainer-name').textContent = data.name;
    template.querySelector('#trainer-rating').textContent = data.rating.toFixed(1);
    template.querySelector('#review-count').textContent = `(${data.reviewCount}개의 리뷰)`;
    template.querySelector('#reviews-title').textContent = `고객 후기 ${data.reviewCount}개`;

    // 트레이너 프로필 이미지
    template.querySelector('#trainer-profile-image').src = data.profileImage;

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
    template.querySelector('#trainer-description').textContent = data.description;

    // 컨테이너에 렌더링된 템플릿 추가
    container.innerHTML = '';
    container.appendChild(template);

    // 컨테이너 표시
    container.classList.remove('d-none');
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

// 리뷰 렌더링 함수
function renderReviews(reviews, append = false) {
    const reviewsContainer = document.getElementById('reviews-container');

    // append가 false이면 기존 리뷰를 지움
    if (!append) {
        reviewsContainer.innerHTML = '';
    }

    // 리뷰 추가
    reviews.forEach(review => {
        const reviewDiv = document.createElement('div');
        reviewDiv.className = 'review-item mb-4';

        // 별점 문자열 생성
        const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);

        reviewDiv.innerHTML = `
  <div class="review-header d-flex align-items-center mb-2">
    <div class="reviewer-photo-wrapper me-3">
      <img src="${review.profileImage || '/images/default-user.jpg'}" alt="리뷰어" class="reviewer-photo">
    </div>
    <div>
      <h5 class="reviewer-name mb-0">${review.name}</h5>
      <div class="review-rating">
        <span class="star-rating">${stars}</span>
      </div>
    </div>
  </div>
  <div class="review-content">
    <p>${review.content}</p>
  </div>
`;


        reviewsContainer.appendChild(reviewDiv);
    });
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

// 더미 데이터 (백엔드 API 대체용)
function getDummyData() {
    return {
        id: 1,
        title: "우리 아이들의 마음을 이해하는 소통의 창이 되어드릴게요",
        name: "김*규 훈련사",
        profileImage: "images/cat1.jpeg",
        rating: 5.0,
        reviewCount: 504,
        career: "방문훈련 전문, 동물병원근무, 행동교정 전문",
        specialties: "공격성 교육 전문, 소/중형견 전문",
        locations: "서울특별시, 인천광역시 연수구, 남동구, 미추홀구, 동구, 부평구, 계양구, 서구, 경기 파주시, 고양시, 의정부시, 남양주시, 하남시, 광주시, 양평시, 용인시, 과천시, 광명시, 시흥시, 의왕시, 수원시, 오산시, 화성시, 부천시, 안산시, 양주시, 구리시, 김포시, 고양시, 남양주시 (그 외 지역은 출장비 발생)",
        photos: [
            "images/cat1.jpeg",
            "images/cat.png"
        ],
        qualifications: [
            {
                title: "KKC 인증 : 으아 훈련사",
                organization: "한국애견연맹(KKC)",
                image: "images/cat1.jpeg"
            },{
                title: "KKC 인증 : 아으 훈련사",
                organization: "한국애견연맹(KKC)",
                image: "images/cat.png"
            },{
                title: "KKC 인증 : 아으 훈련사",
                organization: "한국애견연맹(KKC)",
                image: "images/objects.jpg"
            }
        ],
        prices: [
            {
                type: "방문교육",
                duration: "100분",
                amount: 70000
            },
            {
                type: "영상교육",
                duration: "60분",
                amount: 10000
            },
            {
                type: "영상교육",
                duration: "60분",
                amount: 10000
            }
        ],
        description: "지금 우리의 행복 함께 있는 귀중한 반려견 우리 아이들에 대해 얼마나 많고 계시지요? 지금을 위해 우리 아이들을 무의식적 행복 인생 기쁨이 있습니다. 기계적 일관성이 분명한 훈련기 이러다 보다 단순한 일입니다. 기계적 소어 온오프 다르지 않고 다루기도 쉽습니다. 저는 우리 아이들에게 그런자 보호자에게지 저런자 마음으로 꼭는 소통의 창을 열어드리고자 합니다. 너무많은 훈련법들이 지시와 수동으로 방문훈련의 일월요로 보호자분과 단독연습의 소통의 창을 만들어 드리겠습니다"
    };
}

// 더미 리뷰 데이터
function getDummyReviews() {
    return {
        reviews: [
            {
                id: 1,
                name: "김**님",
                rating: 5,
                content: "저희 아기 털이가 워낙서 교육 요청드렸었는데 정아지도 저도 앉아, 다 스트레스 받지 않는 쪽으로 교육할 수 있을거라는 희망을 얻었습니다. 행복하시고 아래가 쑥쑥 되게 실력도 잘배우시고 이해 수준 엄청나 잠재되었어요 앞으로는 제가 일관된 태도로 교육해야겠지만 개선될 수 있는 가능성이 보여서 기뻐요 잠깐 본 아이도 안아줘서 더음애 선생 교육으로 또 뵐것입니다.",
                profileImage: "images/cat1.jpeg"
            },
            {
                id: 2,
                name: "박**님",
                rating: 4,
                content: "저희 댕댕이가 산책할 때 너무 많이 당겨서 힘들었는데, 훈련사님의 교육 덕분에 많이 좋아졌어요. 아직 완벽하진 않지만 차분하게 산책하는 방법을 알게 되었습니다.",
                profileImage: "images/cat.png"
            },
            {
                id: 3,
                name: "이**님",
                rating: 5,
                content: "다른 강아지를 보면 짖고 공격적이었던 우리 강아지가 많이 차분해졌어요. 훈련사님의 친절한 설명과 효과적인 교육법 덕분에 집에서도 지속적으로 훈련할 수 있게 되었습니다. 정말 감사합니다!",
                profileImage: "images/cat.png"
            },
            {
                id: 4,
                name: "최**님",
                rating: 5,
                content: "우리 강아지가 분리불안이 심해서 고민이었는데, 훈련사님 덕분에 많이 개선되었어요. 체계적인 교육 방법과 친절한 설명 덕분에 집에서도 꾸준히 훈련할 수 있었습니다.",
                profileImage: "images/cat.png"
            },
            {
                id: 5,
                name: "정**님",
                rating: 4,
                content: "처음 강아지를 키우면서 어떻게 교육해야할지 막막했는데, 훈련사님의 도움으로 기본적인 명령어부터 차근차근 배울 수 있었어요. 특히 배변 훈련에 많은 도움이 되었습니다.",
                profileImage: "images/cat.png"
            },
            {
                id: 6,
                name: "송**님",
                rating: 5,
                content: "산책 중 다른 강아지를 만나면 과도하게 흥분하던 우리 아이가 많이 차분해졌어요. 훈련사님이 알려주신 방법대로 꾸준히 연습한 결과 지금은 다른 강아지를 만나도 침착하게 대할 수 있게 되었습니다!",
                profileImage: "images/cat.png"
            },
            {
                id: 7,
                name: "송**님",
                rating: 5,
                content: "산책 중 다른 강아지를 만나면 과도하게 흥분하던 우리 아이가 많이 차분해졌어요. 훈련사님이 알려주신 방법대로 꾸준히 연습한 결과 지금은 다른 강아지를 만나도 침착하게 대할 수 있게 되었습니다!",
                profileImage: "images/cat.png"
            }
        ],
        isLastPage: false
    };
}

// 기존 백엔드 대체 코드는 제거하고 직접 더미 데이터를 사용합니다
// window.addEventListener('DOMContentLoaded', function() {
//     if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
//         const originalFetch = window.fetch;
//         window.fetch = function(url, options) {
//             ...
//         };
//     }
// });