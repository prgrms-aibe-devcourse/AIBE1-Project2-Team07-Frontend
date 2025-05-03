// 더미 데이터 - 프로필 정보
const profileData = {
    profileImage: "./images/cat1.jpeg",
    nickname: "홍길동",
    email: "example.gmail.com",
    center: "중앙 센터",
    certifications: [
        { label: "1차 자격증", image: "./images/cat1.jpeg" },
        { label: "2차 자격증", image: "./images/cat1.jpeg" },
        { label: "3차 자격증", image: "./images/cat1.jpeg" },
        { label: "4차 자격증", image: "./images/cat1.jpeg" }
    ]
};

// 더미 데이터 - 내가 쓴 글, 좋아요한 글
const posts = [
    {
        id: 1,
        category: '라운지',
        title: '강아지랑 산책할 때 이거 쓰시나요?',
        content: '요즘 강아지랑 산책할 때 이 하네스 사용하는데 너무 좋아요! 제가 발견한 최고의 하네스인데 혹시 다들 어떤 제품 쓰시는지 궁금해요. 저는 이 제품이 산책할 때 강아지가 끌어당기는 힘을 분산시켜서 어깨나 팔에 부담이 덜 가는 것 같아요. 특히 중대형견 키우시는 분들께 추천드려요...',
        author: '강아지맘',
        date: "2025-04-28",
        likeCount: 2,
        commentCount: 15,
        image: 'https://placedog.net/80/80?random=2'
    },
    {
        id: 2,
        category: '라운지',
        title: '강아지랑 산책할 때 이거 쓰시나요?',
        content: '요즘 강아지랑 산책할 때 이 하네스 사용하는데 너무 좋아요! 제가 발견한 최고의 하네스인데 혹시 다들 어떤 제품 쓰시는지 궁금해요. 저는 이 제품이 산책할 때 강아지가 끌어당기는 힘을 분산시켜서 어깨나 팔에 부담이 덜 가는 것 같아요. 특히 중대형견 키우시는 분들께 추천드려요...',
        author: '강아지맘',
        date: "2025-04-28",
        likeCount: 2,
        commentCount: 15,
        image: 'https://placedog.net/80/80?random=2'
    },
    {
        id: 3,
        category: '라운지',
        title: '강아지랑 산책할 때 이거 쓰시나요?',
        content: '요즘 강아지랑 산책할 때 이 하네스 사용하는데 너무 좋아요! 제가 발견한 최고의 하네스인데 혹시 다들 어떤 제품 쓰시는지 궁금해요. 저는 이 제품이 산책할 때 강아지가 끌어당기는 힘을 분산시켜서 어깨나 팔에 부담이 덜 가는 것 같아요. 특히 중대형견 키우시는 분들께 추천드려요...',
        author: '강아지맘',
        date: "2025-04-28",
        likeCount: 2,
        commentCount: 15,
        image: 'https://placedog.net/80/80?random=2'
    },
    {
        id: 4,
        category: '라운지',
        title: '강아지랑 산책할 때 이거 쓰시나요?',
        content: '요즘 강아지랑 산책할 때 이 하네스 사용하는데 너무 좋아요! 제가 발견한 최고의 하네스인데 혹시 다들 어떤 제품 쓰시는지 궁금해요. 저는 이 제품이 산책할 때 강아지가 끌어당기는 힘을 분산시켜서 어깨나 팔에 부담이 덜 가는 것 같아요. 특히 중대형견 키우시는 분들께 추천드려요...',
        author: '강아지맘',
        date: "2025-04-28",
        likeCount: 2,
        commentCount: 15,
        image: 'https://placedog.net/80/80?random=2'
    },
    {
        id: 5,
        category: '라운지',
        title: '강아지랑 산책할 때 이거 쓰시나요?',
        content: '요즘 강아지랑 산책할 때 이 하네스 사용하는데 너무 좋아요! 제가 발견한 최고의 하네스인데 혹시 다들 어떤 제품 쓰시는지 궁금해요. 저는 이 제품이 산책할 때 강아지가 끌어당기는 힘을 분산시켜서 어깨나 팔에 부담이 덜 가는 것 같아요. 특히 중대형견 키우시는 분들께 추천드려요...',
        author: '강아지맘',
        date: "2025-04-28",
        likeCount: 2,
        commentCount: 15,
        image: 'https://placedog.net/80/80?random=2'
    },
    {
        id: 6,
        category: '라운지',
        title: '강아지랑 산책할 때 이거 쓰시나요?',
        content: '요즘 강아지랑 산책할 때 이 하네스 사용하는데 너무 좋아요! 제가 발견한 최고의 하네스인데 혹시 다들 어떤 제품 쓰시는지 궁금해요. 저는 이 제품이 산책할 때 강아지가 끌어당기는 힘을 분산시켜서 어깨나 팔에 부담이 덜 가는 것 같아요. 특히 중대형견 키우시는 분들께 추천드려요...',
        author: '강아지맘',
        date: "2025-04-28",
        likeCount: 2,
        commentCount: 15,
        image: 'https://placedog.net/80/80?random=2'
    }
];

// 더미 데이터 - 내가 받은 후기
const myReviews = [
    {
        id: 1,
        author: "김*희",
        content: "우리 강아지가 많이 개선되었어요. 정말 감사합니다!",
        date: "2025-04-28",
        rating: 5,
        image: "./images/cat1.jpeg"
    },
    {
        id: 2,
        author: "김*희",
        content: "우리 강아지가 많이 개선되었어요. 정말 감사합니다!",
        date: "2025-04-28",
        rating: 5,
        image: "./images/cat1.jpeg"
    },
    {
        id: 3,
        author: "김*희",
        content: "우리 강아지가 많이 개선되었어요. 정말 감사합니다!",
        date: "2025-04-28",
        rating: 5,
        image: "./images/cat1.jpeg"
    },
    {
        id: 4,
        author: "김*희",
        content: "우리 강아지가 많이 개선되었어요. 정말 감사합니다!",
        date: "2025-04-28",
        rating: 5,
        image: "./images/cat1.jpeg"
    },
    {
        id: 5,
        author: "김*희",
        content: "우리 강아지가 많이 개선되었어요. 정말 감사합니다!",
        date: "2025-04-28",
        rating: 5,
        image: "./images/cat1.jpeg"
    },
    {
        id: 6,
        author: "김*희",
        content: "우리 강아지가 많이 개선되었어요. 정말 감사합니다!",
        date: "2025-04-28",
        rating: 5,
        image: "./images/cat1.jpeg"
    }
];

const adviceRequests = [
    {
        id: 1,
        author: "김민희",
        postTitle: "강아지 짖음 문제",
        comment: "3개월 된 말티즈를 키우고 있습니다. 최근에 집을 비우면 계속 짖어서 이웃 민원이 들어오고 있어요. 분리불안이 있는 것 같은데 어떻게 훈련시켜야 할지 모르겠습니다. 도움 부탁드립니다.",
        link: "/posts/dog-barking",
        date: "2025-04-25",
        status: "답변 대기중",
        petType: "강아지",
        petBreed: "말티즈",
        petAge: "3개월"
    },
    {
        id: 2,
        author: "이준호",
        postTitle: "고양이 식욕 감소",
        comment: "5살 된 브리티시 숏헤어 고양이가 3일 전부터 밥을 잘 안 먹고 있어요. 평소 좋아하던 간식도 거부하고 기운이 없는 것 같습니다. 병원에 가봐야 할까요? 어떤 증상을 살펴봐야 할지 조언 부탁드립니다.",
        link: "/posts/cat-appetite",
        date: "2025-04-23",
        status: "답변 완료",
        petType: "고양이",
        petBreed: "브리티시 숏헤어",
        petAge: "5살"
    },
    {
        id: 3,
        author: "박서연",
        postTitle: "햄스터 케이지 추천",
        comment: "새로 햄스터를 입양하려고 합니다. 시리안 햄스터에게 적합한 케이지 사이즈와 추천 모델이 있을까요? 또한 필수적으로 구비해야 할 용품들도 알려주시면 감사하겠습니다. 처음 키워보는 거라 모르는 것이 많아요.",
        link: "/posts/hamster-cage",
        date: "2025-04-22",
        status: "답변 대기중",
        petType: "햄스터",
        petBreed: "시리안 햄스터",
        petAge: "입양 예정"
    },
    {
        id: 4,
        author: "최지영",
        postTitle: "강아지 알레르기 증상",
        comment: "프렌치불독 (2살)이 최근에 피부를 자주 긁고 발을 핥는 증상을 보입니다. 또한 눈 주변이 붉어지고 있어요. 알레르기 검사를 받아야 할까요? 집에서 관리할 수 있는 방법이 있을까요? 사료는 최근에 바꾼 적이 없습니다.",
        link: "/posts/dog-allergy",
        date: "2025-04-21",
        status: "답변 대기중",
        petType: "강아지",
        petBreed: "프렌치불독",
        petAge: "2살"
    },
    {
        id: 5,
        author: "정민수",
        postTitle: "토끼 이갈이 문제",
        comment: "6개월 된 네덜란드 드워프 토끼가 집안 가구와 전선을 계속 갉아먹는 문제가 있습니다. 장난감과 이갈이용 나무를 제공해도 효과가 없어요. 토끼가 안전하게 이갈이할 수 있는 방법과 가구 보호 방법을 알고 싶습니다.",
        link: "/posts/rabbit-chewing",
        date: "2025-04-20",
        status: "답변 완료",
        petType: "토끼",
        petBreed: "네덜란드 드워프",
        petAge: "6개월"
    },
    {
        id: 6,
        author: "송하은",
        postTitle: "새 고양이 적응 문제",
        comment: "기존에 키우던 고양이(3살)에게 새 고양이(1살)를 데려왔는데 적응이 잘 안되고 있어요. 기존 고양이가 계속 으르렁거리고 공격적인 모습을 보입니다. 두 고양이가 잘 지낼 수 있도록 도와주세요.",
        link: "/posts/cat-introduction",
        date: "2025-04-19",
        status: "답변 대기중",
        petType: "고양이",
        petBreed: "러시안 블루, 아메리칸 숏헤어",
        petAge: "3살, 1살"
    }
];

// 탭별 현재 페이지 상태 관리
const tabStates = {
    profile: { currentPage: 1 },
    mypost: { currentPage: 1 },
    review: { currentPage: 1 },
    liked: { currentPage: 1 },
    advice: { currentPage: 1 }
};

let currentPage = 1;
const itemsPerPage = 5;
let currentTab = 'profile';

// DOM이 완전히 로드된 후 실행
document.addEventListener('DOMContentLoaded', function() {
    // 탭 이벤트 리스너 설정
    document.getElementById('tab-profile').addEventListener('click', function(e) {
        e.preventDefault();
        switchTab('profile');
    });

    document.getElementById('tab-mypost').addEventListener('click', function(e) {
        e.preventDefault();
        currentPage = 1;
        switchTab('mypost');
    });

    document.getElementById('tab-review').addEventListener('click', function(e) {
        e.preventDefault();
        currentPage = 1;
        switchTab('review');
    });

    document.getElementById('tab-liked').addEventListener('click', function(e) {
        e.preventDefault();
        currentPage = 1;
        switchTab('liked');
    });

    document.getElementById('tab-advice').addEventListener('click', function(e) {
        e.preventDefault();
        currentPage = 1;
        switchTab('advice');
    });

    // 검색 버튼 이벤트 설정
    document.getElementById('search-button').addEventListener('click', function() {
        const searchTerm = document.getElementById('search-input').value.trim().toLowerCase();
        searchContent(searchTerm);
    });

    // 엔터 키 검색 지원
    document.getElementById('search-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const searchTerm = this.value.trim().toLowerCase();
            searchContent(searchTerm);
        }
    });

    // 초기 탭 로딩
    switchTab('profile');
});

// 탭 전환 함수
function switchTab(tabName) {
    // 현재 탭 업데이트
    currentTab = tabName;

    // 검색창 관리 (프로필 탭에서는 숨김)
    const searchContainer = document.querySelector('.search-bar');
    const paginationcontainer = document.querySelector('.pagination-container');

    if (tabName === 'profile') {
        if (searchContainer) searchContainer.style.display = 'none';
        if (paginationcontainer) paginationcontainer.style.display = 'none';
    } else {
        if (searchContainer) searchContainer.style.display = 'flex';
        if (paginationcontainer) paginationcontainer.style.display = 'flex';
        // 탭 변경 시 검색창 초기화
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.value = '';
    }

    // 모든 탭 링크에서 active 클래스 제거
    document.querySelectorAll('.tab-menu .nav-link').forEach(link => {
        link.classList.remove('active');
    });

    // 선택된 탭에 active 클래스 추가
    document.getElementById(`tab-${tabName}`).classList.add('active');

    // 탭에 따라 컨텐츠 표시
    switch(tabName) {
        case 'profile':
            showProfile();
            break;
        case 'mypost':
            showMyPosts();
            break;
        case 'review':
            showMyReviews();
            break;
        case 'liked':
            showLikedPosts();
            break;
        case 'advice':
            showMyAdvices();
            break;
    }
}

// 프로필 표시 함수
function showProfile() {
    // 프로필 영역 보이게 설정
    document.getElementById('profile-section').style.display = 'block';
    // 게시글 목록 숨기기
    document.getElementById('post-container').style.display = 'none';
    // 리뷰 섹션 숨기기
    document.getElementById('review-section').style.display = 'none';
    // 페이지네이션 숨기기
    document.querySelector('.pagination-container').style.display = 'none';

    // 프로필 데이터 렌더링
    const profileHTML = `
        <div class="profile-info">
            <div class="profile-image d-flex flex-column align-items-center">
              <img src="${profileData.profileImage}" alt="프로필 이미지" class="rounded-circle">
              <button class="btn btn-warning btn-sm mt-2">사진 추가</button>
            </div>
            <div class="profile-details">
              <div class="info-row d-flex align-items-center mb-3">
                <label class="label col-form-label me-3">닉네임</label>
                <input
                  type="text"
                  name="nickname"
                  class="form-control form-control-sm"
                  value="${profileData.nickname}"
                >
              </div>
              <div class="info-row d-flex align-items-center mb-3">
                <label class="label col-form-label me-3">이름</label>
                <input
                  type="text"
                  name="name"
                  class="form-control form-control-sm"
                  value="${profileData.name}"
                >
              </div>
              <div class="info-row d-flex align-items-center mb-3">
                <label class="label col-form-label me-3">이메일</label>
                <input
                  type="email"
                  name="email"
                  class="form-control form-control-sm"
                  value="${profileData.email}"
                >
              </div>
              <div class="info-row d-flex align-items-center mb-3">
                <label class="label col-form-label me-3">중앙 센터</label>
                <input
                  type="text"
                  name="center"
                  class="form-control form-control-sm"
                  value="${profileData.center}"
                >
              </div>
            </div>

        </div>
        <div class="cert-images">
            <h5>자격증</h5>
            <div class="cert-container">
                ${profileData.certifications.map((cert, index) => `
                    <div class="cert-item">
                        <img src="${cert.image}" alt="${cert.label}">
                        <div class="cert-label">${cert.label}</div>
                    </div>
                `).join('')}
                <div class="cert-add">
                    <button class="btn btn-outline-secondary rounded-circle">+</button>
                </div>
            </div>
            <button class="btn btn-warning mt-3 mx-auto d-block">수정하기</button>
        </div>
    `;

    document.getElementById('profile-section').innerHTML = profileHTML;
}

// 내가 쓴 글 표시 함수
function showMyPosts() {
    // 프로필 영역 숨기기
    document.getElementById('profile-section').style.display = 'none';
    // 게시글 목록 보이게 설정
    document.getElementById('post-container').style.display = 'block';
    // 리뷰 섹션 숨기기
    document.getElementById('review-section').style.display = 'none';
    // 페이지네이션 보이게 설정
    document.querySelector('.pagination-container').style.display = 'block';

    // 데이터가 비어있는 경우
    if (posts.length === 0) {
        document.getElementById('post-container').innerHTML = '<p class="no-results">검색 결과가 없습니다.</p>';
        document.querySelector('.pagination').innerHTML = '';
        return;
    }

    // 페이징 처리
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, posts.length);
    const currentPagePosts = posts.slice(startIndex, endIndex);

    // 게시글 렌더링
    const postsHTML = currentPagePosts.map(post => `
        <div class="post-item">
            <div class="post-info">
                <h3 class="post-category">${post.category}</h3>
                <h4>${post.title}</h4>
                <p class="post-content">${post.content}</p>
                <div class="post-meta">
                        ${post.date} &nbsp;&nbsp; 좋아요 수: ${post.likeCount} &nbsp;&nbsp; 댓글 수: ${post.commentCount}
                </div>
            </div>
            <div class="post-image">
                <img src="${post.image}" alt="게시글 이미지">
            </div>
        </div>
    `).join('');

    document.getElementById('post-container').innerHTML = postsHTML;

    // 페이지네이션 생성
    generatePagination(posts.length);
}

// 내가 받은 후기 표시 함수
function showMyReviews() {
    // 프로필 영역 숨기기
    document.getElementById('profile-section').style.display = 'none';
    // 게시글 목록 숨기기
    document.getElementById('post-container').style.display = 'none';
    // 리뷰 섹션 보이게 설정
    document.getElementById('review-section').style.display = 'block';

    // 데이터가 비어있는 경우
    if (myReviews.length === 0) {
        document.getElementById('review-container').innerHTML = '<p class="no-results">검색 결과가 없습니다.</p>';
        document.querySelector('.pagination').innerHTML = '';
        return;
    }

    // 페이징 처리
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, myReviews.length);
    const currentPageReviews = myReviews.slice(startIndex, endIndex);

    // 후기 렌더링 - 레이아웃 개선
    const reviewsHTML = currentPageReviews.map(review => `
        <li class="review-item">
            <div class="review-top">
                <div class="review-author-info">
                    <div class="review-image">
                        <img src="${review.image}" alt="게시글 이미지">
                    </div>
                    <div class="author-details">
                        <h5 class="author-name">작성자 : ${review.author}</h5>
                        <div class="review-date">${review.date}</div>
                    </div>
                </div>
                <div class="review-rating">
                    ${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}
                </div>
            </div>
            <div class="review-body">
                <p class="review-content">${review.content}</p>
            </div>
        </li>
    `).join('');

    document.getElementById('review-container').innerHTML = reviewsHTML;

    // 페이지네이션 생성
    generatePagination(myReviews.length);
}

// 좋아요한 글 표시 함수
function showLikedPosts() {
    // 프로필 영역 숨기기
    document.getElementById('profile-section').style.display = 'none';
    // 게시글 목록 보이게 설정
    document.getElementById('post-container').style.display = 'block';
    // 리뷰 섹션 숨기기
    document.getElementById('review-section').style.display = 'none';

    // 데이터가 비어있는 경우
    if (posts.length === 0) {
        document.getElementById('post-container').innerHTML = '<p class="no-results">검색 결과가 없습니다.</p>';
        document.querySelector('.pagination').innerHTML = '';
        return;
    }

    // 좋아요한 글 렌더링
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, posts.length);
    const currentPageLiked = posts.slice(startIndex, endIndex);

    const likedHTML = currentPageLiked.map(post => `
        <div class="post-item">
            <div class="post-info">
                <h3 class="post-category">${post.category}</h3>
                <h4>${post.title}</h4>
                <p class="post-content">${post.content}</p>
                <div class="post-author">작성자: ${post.author}</div>
                <div class="post-meta">
                        ${post.date} &nbsp;&nbsp; 좋아요 수: ${post.likeCount} &nbsp;&nbsp; 댓글 수: ${post.commentCount}
                </div>
            </div>
            <div class="post-image">
                <img src="${post.image}" alt="게시글 이미지">
            </div>
        </div>
    `).join('');

    document.getElementById('post-container').innerHTML = likedHTML;

    // 페이지네이션 생성
    generatePagination(posts.length);
}

// 내가 쓴 상담신청내역 표시 함수
function showMyAdvices() {
    // 프로필 영역 숨기기
    document.getElementById('profile-section').style.display = 'none';
    // 게시글 목록 보이게 설정
    document.getElementById('post-container').style.display = 'block';
    // 리뷰 섹션 숨기기
    document.getElementById('review-section').style.display = 'none';

    // 데이터가 비어있는 경우
    if (adviceRequests.length === 0) {
        document.getElementById('post-container').innerHTML = '<p class="no-results">검색 결과가 없습니다.</p>';
        document.querySelector('.pagination').innerHTML = '';
        return;
    }

    // 상태에 따라 정렬 (대기중 > 진행중 > 완료 순)
    const sortedAdviceRequests = [...adviceRequests].sort((a, b) => {
        // 우선순위 점수 부여
        const getPriorityScore = (status) => {
            if (status.includes('대기')) return 2;
            return 1; // 완료
        };

        return getPriorityScore(b.status) - getPriorityScore(a.status);
    });

    // 페이징 처리
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, sortedAdviceRequests.length);
    const currentPageAdvices = sortedAdviceRequests.slice(startIndex, endIndex);

    // 상담신청내역 렌더링
    const advicesHTML = currentPageAdvices.map(advice => `
        <div class="advice-item">
            <div class="advice-header">
                <div class="advice-title-section">
                    <h5 class="advice-title">${advice.postTitle}</h5>
                    <span class="advice-status ${advice.status.includes('대기') ? 'status-pending' :
        advice.status.includes('진행') ? 'status-progress' :
            'status-completed'}">${advice.status}</span>
                </div>
                <div class="advice-meta">
                    <span class="advice-author">${advice.author}</span>
                    <span class="advice-date">${advice.date}</span>
                </div>
            </div>
            <div class="advice-details">
                <div class="pet-info">
                    <span class="pet-type">${advice.petType}</span>
                    <span class="pet-breed">${advice.petBreed}</span>
                    <span class="pet-age">${advice.petAge}</span>
                </div>
            </div>
            <div class="advice-body">
                <p class="advice-content">${advice.comment}</p>
            </div>
            <div class="advice-actions">
                <a href="${advice.link}" class="btn btn-primary btn-sm">상세보기</a>
                <button class="btn btn-warning btn-sm">수락하기</button>
                <button class="btn btn-outline-danger btn-sm">거절하기</button>
            </div>
        </div>
    `).join('');

    document.getElementById('post-container').innerHTML = advicesHTML;

    // 페이지네이션 생성 (정렬된 배열 길이 사용)
    generatePagination(sortedAdviceRequests.length);
}

// 페이지네이션 생성 함수
function generatePagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (totalPages <= 1) {
        document.querySelector('.pagination').innerHTML = '';
        return;
    }

    let paginationHTML = `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage - 1}">&laquo;</a>
        </li>
    `;

    // 페이지 번호
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
            <li class="page-item ${currentPage === i ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>
        `;
    }

    paginationHTML += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage + 1}">&raquo;</a>
        </li>
    `;

    document.querySelector('.pagination').innerHTML = paginationHTML;

    // 페이지 번호 클릭 이벤트 설정
    document.querySelectorAll('.pagination .page-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetPage = parseInt(this.getAttribute('data-page'));

            if (targetPage >= 1 && targetPage <= totalPages && targetPage !== currentPage) {
                currentPage = targetPage;
                switchTab(currentTab);
            }
        });
    });
}

// 검색 함수 개선
function searchContent(searchTerm) {
    if (!searchTerm) {
        // 검색어가 없으면 현재 탭 다시 로드
        switchTab(currentTab);
        return;
    }

    // 탭별 검색 로직 분리
    switch(currentTab) {
        case 'mypost':
            const filteredPosts = posts.filter(post =>
                post.title.toLowerCase().includes(searchTerm) ||
                post.content.toLowerCase().includes(searchTerm) ||
                post.author.toLowerCase().includes(searchTerm)
            );
            // 페이지 초기화
            tabStates.mypost.currentPage = 1;
            showMyPosts(filteredPosts);
            break;

        case 'review':
            const filteredReviews = myReviews.filter(review =>
                review.content.toLowerCase().includes(searchTerm) ||
                review.author.toLowerCase().includes(searchTerm)
            );
            // 페이지 초기화
            tabStates.review.currentPage = 1;
            showMyReviews(filteredReviews);
            break;

        case 'liked':
            const filteredLikes = posts.filter(post =>
                post.title.toLowerCase().includes(searchTerm) ||
                post.content.toLowerCase().includes(searchTerm) ||
                post.author.toLowerCase().includes(searchTerm)
            );
            // 페이지 초기화
            tabStates.liked.currentPage = 1;
            showLikedPosts(filteredLikes);
            break;

        case 'advice':
            const filteredAdvices = adviceRequests.filter(advice =>
                advice.postTitle.toLowerCase().includes(searchTerm) ||
                advice.comment.toLowerCase().includes(searchTerm) ||
                advice.author.toLowerCase().includes(searchTerm) ||
                advice.petType.toLowerCase().includes(searchTerm) ||
                advice.petBreed.toLowerCase().includes(searchTerm)
            );
            // 페이지 초기화
            tabStates.advice.currentPage = 1;
            showMyAdvices(filteredAdvices);
            break;

        case 'profile':
            // 프로필 탭에서는 검색 기능 미사용
            break;
    }
}