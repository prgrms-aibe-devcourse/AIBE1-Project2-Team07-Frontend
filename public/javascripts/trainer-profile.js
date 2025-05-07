// 전역 변수
let trainerId; // URL에서 추출한 트레이너 ID
let currentPage = 1; // 현재 리뷰 페이지
const reviewsPerPage = 3; // 한 페이지당 리뷰 수
let trainerData = null; // 트레이너 데이터 저장
let allReviews = []; // 모든 리뷰 데이터 저장

window.currentUserId = 1;   // 나중에 로그인 한 사람으로 바꿔야 함

function getDummyDataById(id) {
    switch (id) {
        case 1: return getDummyData1();
        case 2: return getDummyData2();
        case 3: return getDummyData3();
        case 4: return getDummyData4();
        case 5: return getDummyData5();
        case 6: return getDummyData6();
        case 7: return getDummyData7();
        default:
            console.warn(`알 수 없는 trainer id: ${id}, 기본 1번 데이터 사용`);
            return getDummyData1();
    }
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    // URL에서 트레이너 ID 추출
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get('id');
    const serviceType = params.get('serviceType');
    trainerId = idParam ? parseInt(idParam, 10) : NaN; // trainerId 전역변수 설정

    if (isNaN(trainerId)) {
        showError('유효한 트레이너 ID가 전달되지 않았습니다.');
        return;
    }

    // 트레이너 정보 로드
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

        // 더미 데이터 사용
        trainerData = getDummyDataById(trainerId);

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

// 더미 데이터 (백엔드 API 대체용)
// 1번 트레이너 (김구 훈련사)
function getDummyData1() {
    return {
        id: 1,
        title: "반려견과 보호자의 소통을 연결하는 다리가 되어드립니다",
        name: "김구 훈련사",
        profileImage: "https://placedog.net/200/200?random=1",
        rating: 4.0,
        reviewCount: 128,
        career: "방문훈련 5년, 행동교정 전문가",
        specialties: "분리불안 교정, 기본명령어, 사회성 향상",
        locations: "서울 전역, 경기 일부 지역",
        photos: ["https://placedog.net/600/400?random",
            "https://placedog.net/600/400?random=2"],
        qualifications: [
            { title: "KKC 인증 훈련사", organization: "한국애견연맹", image: "https://cdn-icons-png.flaticon.com/512/190/190411.png" },
            { title: "행동교정 전문가 과정", organization: "펫아카데미", image: "https://cdn-icons-png.flaticon.com/512/190/190411.png" }
        ],
        prices: [
            { type: "방문교육", duration: "90분", amount: 60000 },
            { type: "영상교육", duration: "60분", amount: 30000 }
        ],
        description:
            "안녕하세요, 김구 훈련사입니다. 반려견의 마음을 이해하고 보호자님과의 신뢰를 바탕으로 훈련을 진행합니다.\n\n" +
            "저는 분리불안 교정과 기본명령어 교육에 풍부한 경험을 가지고 있으며, 반려견이 스스로 안정감을 느낄 수 있도록 돕습니다.\n\n" +
            "일관성과 긍정강화를 중시하며, 가정에서 쉽게 실천할 수 있는 맞춤형 훈련 프로그램을 설계해 드립니다.\n\n" +
            "언제든지 편하게 문의해 주세요!"
    };
}

// 2번 트레이너 (박훈 훈련사)
function getDummyData2() {
    return {
        id: 2,
        title: "행동 문제 없는 행복한 산책을 약속드립니다",
        name: "박훈 훈련사",
        profileImage: "https://placedog.net/200/200?random=1",
        rating: 4.0,
        reviewCount: 85,
        career: "반려견 산책 매너 7년 경력",
        specialties: "산책 예절, 리드 제어, 사회화 훈련",
        locations: "서울 강남·서초, 경기 분당",
        photos: ["https://placedog.net/600/400?random",
            "https://placedog.net/600/400?random=2"],
        qualifications: [
            { title: "도그워크 인스트럭터", organization: "펫워킹 아카데미", image: "https://cdn-icons-png.flaticon.com/512/190/190411.png" }
        ],
        prices: [
            { type: "방문교육", duration: "60분", amount: 50000 },
            { type: "영상교육", duration: "45분", amount: 25000 }
        ],
        description:
            "안녕하세요, 박훈 훈련사입니다. 반려견과 보호자님이 함께 걷는 산책길이 즐겁도록 도와드립니다.\n\n" +
            "저는 산책 중 당김이나 소음 공포 등의 행동 문제를 체계적으로 교정하여, 보호자님이 편안하게 산책할 수 있도록 합니다.\n\n" +
            "실제 거리 환경에서의 훈련을 통해 반려견이 스스로 집중과 침착함을 유지하도록 이끌어 드립니다.\n\n" +
            "함께 산책의 즐거움을 되찾아 보세요!"
    };
}

// 3번 트레이너 (이민 훈련사)
function getDummyData3() {
    return {
        id: 3,
        title: "행동 문제, 이젠 걱정 없이 해결해 드립니다",
        name: "이민 훈련사",
        profileImage: "https://placedog.net/200/200?random=1",
        rating: 4.0,
        reviewCount: 102,
        career: "행동교정 임상 6년",
        specialties: "공격성 교정, 분리불안, 과도 짖음",
        locations: "서울 마포·용산, 경기 일산",
        photos: ["https://placedog.net/600/400?random",
            "https://placedog.net/600/400?random=2"],
        qualifications: [
            { title: "펫심리 상담 자격증", organization: "반려동물심리연구소", image: "https://cdn-icons-png.flaticon.com/512/190/190411.png" }
        ],
        prices: [
            { type: "방문교육", duration: "120분", amount: 80000 },
            { type: "영상교육", duration: "60분", amount: 35000 }
        ],
        description:
            "안녕하세요, 이민 훈련사입니다. 공격성이나 과도 짖음 같은 행동 문제를 근본부터 교정합니다.\n\n" +
            "반려견의 스트레스 요인을 파악하고, 단계별로 자신감을 회복할 수 있는 훈련을 제공합니다.\n\n" +
            "훈련 후에도 지속적인 사후 관리를 통해 안정적인 행동 유지가 가능하도록 지원합니다.\n\n" +
            "함께 문제를 해결해 나가요!"
    };
}

// 4번 트레이너 (최훈 훈련사)
function getDummyData4() {
    return {
        id: 4,
        title: "매너 있는 산책으로 이웃에게도 사랑받게 해드립니다",
        name: "최훈 훈련사",
        profileImage: "https://placedog.net/200/200?random=1",
        rating: 4.0,
        reviewCount: 76,
        career: "도그 워킹 강사 5년",
        specialties: "반려견 산책 예절, 리드 콘트롤",
        locations: "서울 송파·강동, 경기 수원",
        photos: ["https://placedog.net/600/400?random",
            "https://placedog.net/600/400?random=2"],
        qualifications: [
            { title: "애견 산책 전문가", organization: "펫워킹협회", image: "https://cdn-icons-png.flaticon.com/512/190/190411.png" }
        ],
        prices: [
            { type: "방문교육", duration: "45분", amount: 45000 },
            { type: "영상교육", duration: "30분", amount: 20000 }
        ],
        description:
            "안녕하세요, 최훈 훈련사입니다. 반려견과 보호자님이 편안한 산책을 즐길 수 있도록 돕습니다.\n\n" +
            "짖음 제어부터 당김 방지까지, 실제 거리에서 훈련하여 실전 능력을 길러드립니다.\n\n" +
            "짧고 집중도 높은 세션으로 빠른 변화를 경험해 보세요!"
    };
}

// 5번 트레이너 (정경 훈련사)
function getDummyData5() {
    return {
        id: 5,
        title: "가정에 딱 맞춘 맞춤형 훈련으로 편안함을 드립니다",
        name: "정경 훈련사",
        profileImage: "https://placedog.net/200/200?random=1",
        rating: 4.0,
        reviewCount: 89,
        career: "퍼스널 맞춤 훈련 4년",
        specialties: "가정방문 맞춤 케어, 기본훈련",
        locations: "서울 은평·서대문, 경기 고양",
        photos: ["https://placedog.net/600/400?random",
            "https://placedog.net/600/400?random=2"],
        qualifications: [
            { title: "퍼스널 트레이닝 자격증", organization: "펫트레이닝랩", image: "https://cdn-icons-png.flaticon.com/512/190/190411.png" }
        ],
        prices: [
            { type: "방문교육", duration: "60분", amount: 55000 },
            { type: "영상교육", duration: "45분", amount: 30000 }
        ],
        description:
            "안녕하세요, 정경 훈련사입니다. 보호자님 가정 환경과 반려견 성향을 고려한 1:1 맞춤 훈련을 제공합니다.\n\n" +
            "가정 내 실제 사례를 바탕으로, 쉽고 실용적인 훈련 팁을 전수합니다.\n\n" +
            "훈련 후에도 교육 자료와 피드백으로 지속적인 관리를 약속드립니다."
    };
}

// 6번 트레이너 (문재 훈련사)
function getDummyData6() {
    return {
        id: 6,
        title: "소형견과 부드럽게 소통하는 방법을 알려드립니다",
        name: "문재 훈련사",
        profileImage: "https://placedog.net/200/200?random=1",
        rating: 4.5,
        reviewCount: 94,
        career: "소형견 전문 훈련 6년",
        specialties: "소형견 기본훈련, 긍정강화",
        locations: "서울 영등포·구로, 경기 안산",
        photos: ["https://placedog.net/600/400?random",
            "https://placedog.net/600/400?random=2"],
        qualifications: [
            { title: "소형견 전문 과정", organization: "펫아카데미", image: "https://cdn-icons-png.flaticon.com/512/190/190411.png" }
        ],
        prices: [
            { type: "방문교육", duration: "50분", amount: 65000 },
            { type: "영상교육", duration: "40분", amount: 35000 }
        ],
        description:
            "안녕하세요, 문재 훈련사입니다. 소형견의 특성을 고려한 세심한 접근으로 신뢰를 쌓아갑니다.\n\n" +
            "긍정강화를 중점에 두고, 반려견이 스스로 보고 배우는 훈련을 진행합니다.\n\n" +
            "보호자님께도 이해하기 쉬운 가이드와 체크리스트를 제공합니다."
    };
}

// 7번 트레이너 (윤석 훈련사)
function getDummyData7() {
    return {
        id: 7,
        title: "대형견과의 든든한 동행, 안전하고 즐겁게!",
        name: "윤석 훈련사",
        profileImage: "https://placedog.net/200/200?random=1",
        rating: 4.7,
        reviewCount: 110,
        career: "대형견 전문 훈련 8년",
        specialties: "대형견 사회성, 강도 높은 운동 훈련",
        locations: "서울 강북·성북, 경기 의정부",
        photos: ["https://placedog.net/600/400?random",
            "https://placedog.net/600/400?random=2"],
        qualifications: [
            { title: "대형견 교육 전문가", organization: "펫트레이닝협회", image: "https://cdn-icons-png.flaticon.com/512/190/190411.png" }
        ],
        prices: [
            { type: "방문교육", duration: "120분", amount: 90000 },
            { type: "영상교육", duration: "60분", amount: 45000 }
        ],
        description:
            "안녕하세요, 윤석 훈련사입니다. 대형견의 체력과 성향을 고려한 맞춤형 훈련을 제공합니다.\n\n" +
            "사회성 향상과 에너지 분출을 위한 운동 프로그램을 포함하여, 균형 잡힌 일정을 설계해 드립니다.\n\n" +
            "안전하고 즐거운 훈련으로 든든한 파트너가 되어 드리겠습니다."
    };
}

// 더미 리뷰 데이터
// 더미 리뷰 데이터
function getDummyReviews() {
    return {
        reviews: [
            {
                id: 1,
                name: "김**님",
                rating: 5,
                content: "김구 훈련사님 덕분에 우리 강아지 하늘이가 분리불안에서 많이 벗어났어요. 예전엔 문 앞에서 계속 짖기만 했는데, 이제는 혼자서도 편안하게 쉬더라고요. 집에서도 꾸준히 복습하며 좋은 변화를 경험 중입니다!",
                profileImage: "https://placedog.net/100/100?random=11"
            },
            {
                id: 2,
                name: "박**님",
                rating: 4,
                content: "산책할 때만 되면 철퍼덕 누워 버리던 우리 코코가, 박훈 훈련사님 수업 후 리드 줄도 스스로 당기지 않고 잘 따라다녀요. 아직 완벽하진 않지만 처음보다 훨씬 편해졌습니다!",
                profileImage: "https://placedog.net/100/100?random=22"
            },
            {
                id: 3,
                name: "이**님",
                rating: 5,
                content: "이민 훈련사님께서 과도한 짖음 문제를 근본부터 잡아주셨어요. 낯선 사람이나 다른 강아지가 와도 차분히 앉아 기다리는 모습에 깜짝 놀랐습니다. 정말 감사합니다!",
                profileImage: "https://placedog.net/100/100?random=33"
            },
            {
                id: 4,
                name: "최**님",
                rating: 5,
                content: "최훈 훈련사님과 함께한 산책 매너 수업 덕분에, 우리 반려견 초코가 이웃 주민들에게도 사랑받는 산책러가 되었어요. 간단한 팁 하나하나가 생활에 바로 적용돼서 좋아요.",
                profileImage: "https://placedog.net/100/100?random=44"
            },
            {
                id: 5,
                name: "정**님",
                rating: 4,
                content: "정경 훈련사님이 집 구조에 맞춘 1:1 맞춤 훈련을 해주셔서, 화장실 훈련도 순조롭게 진행 중입니다. 매일 가이드라인 대로 연습하니 금방 습득하더라고요.",
                profileImage: "https://placedog.net/100/100?random=55"
            },
            {
                id: 6,
                name: "송**님",
                rating: 5,
                content: "문재 훈련사님 수업 후, 포메라니안 우리 뽀미가 긍정강화를 정말 좋아해요. 간식 없이도 즐겁게 참여하는 모습이 인상적입니다. 동영상 가이드도 큰 도움이 됩니다!",
                profileImage: "https://placedog.net/100/100?random=66"
            },
            {
                id: 7,
                name: "한**님",
                rating: 5,
                content: "윤석 훈련사님 덕분에 대형견 루시가 사회성 수업을 받고 사람도, 다른 개도 편안하게 대하게 되었어요. 에너지 발산 운동까지 포함된 프로그램이라 신체적으로도 훨씬 건강해졌습니다.",
                profileImage: "https://placedog.net/100/100?random=77"
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