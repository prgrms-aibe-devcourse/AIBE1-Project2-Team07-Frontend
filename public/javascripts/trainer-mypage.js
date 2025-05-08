// 더미 데이터 - 프로필 정보
const profileData = {
    profileImage: "./images/cat1.jpeg",
    nickname: "홍길동",
    email: "example.gmail.com",
    certifications: [
        {label: "1차 자격증", image: "./images/cat1.jpeg"},
        {label: "2차 자격증", image: "./images/cat1.jpeg"},
        {label: "3차 자격증", image: "./images/cat1.jpeg"},
        {label: "4차 자격증", image: "./images/cat1.jpeg"}
    ]
};

// 더미 데이터 - 내가 쓴 글, 좋아요한 글
const posts = [
    {
        id: 1,
        category: '라운지',
        title: '고양이 털 빠짐 방지 팁',
        content: '요즘 우리 집 고양이 털이 너무 많이 빠져서 고민이에요. 빗질 외에 추가로 도움이 되는 방법 있으신가요?',
        author: '냥이집사',
        date: "2025-04-25",
        likeCount: 5,
        commentCount: 3,
        image: 'https://placedog.net/80/80?random=1'
    },
    {
        id: 2,
        category: '라운지',
        title: '강아지 사회화 어떻게 하나요?',
        content: '새로 입양한 강아지가 낯을 많이 가려서요. 산책 외에 사회화에 도움이 될 만한 활동이 있을까요?',
        author: '강아지맘',
        date: "2025-04-24",
        likeCount: 8,
        commentCount: 6,
        image: 'https://placedog.net/80/80?random=2'
    },
    {
        id: 3,
        category: '라운지',
        title: '토끼 바닥재 추천해주세요',
        content: '시리안 토끼에게 좋은 바닥재가 궁금해요. 먼지 적고 발에 안전한 제품 있나요?',
        author: '토끼사랑',
        date: "2025-04-23",
        likeCount: 3,
        commentCount: 2,
        image: 'https://placedog.net/80/80?random=3'
    },
    {
        id: 4,
        category: '라운지',
        title: '햄스터 모래 목욕',
        content: '햄스터가 목욕 모래를 너무 좋아하는데, 어떤 모래가 안전할까요?',
        author: '햄스터러버',
        date: "2025-04-22",
        likeCount: 4,
        commentCount: 1,
        image: 'https://placedog.net/80/80?random=4'
    },
    {
        id: 5,
        category: '라운지',
        title: '고양이 장난감 DIY 아이디어',
        content: '집에 있는 재료로 간단하게 만들 수 있는 캣닢 장난감 레시피 공유 부탁드려요.',
        author: '집사초보',
        date: "2025-04-21",
        likeCount: 6,
        commentCount: 5,
        image: 'https://placedog.net/80/80?random=5'
    },
    {
        id: 6,
        category: '라운지',
        title: '강아지 목줄 브랜드 비교',
        content: '여러 브랜드 목줄 써보신 분 계신가요? 내구성 좋은 제품이 궁금합니다.',
        author: '멍멍이아빠',
        date: "2025-04-20",
        likeCount: 7,
        commentCount: 4,
        image: 'https://placedog.net/80/80?random=6'
    }
];

// 더미 데이터 - 내가 받은 후기
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
    },
    {
        id: 4,
        author: "최*연",
        content: "햄스터 목욕 방법 알려주셔서 도움이 많이 됐습니다!",
        date: "2025-04-26",
        rating: 4,
        image: 'https://placedog.net/80/80?random=6'
    },
    {
        id: 5,
        author: "정*호",
        content: "고양이 모래 추천 덕분에 모래 날림이 줄었어요. 감사합니다.",
        date: "2025-04-25",
        rating: 5,
        image: 'https://placedog.net/80/80?random=6'
    },
    {
        id: 6,
        author: "한*진",
        content: "새 깃털 관리 꿀팁 최고! 덕분에 예쁘게 회복했어요.",
        date: "2025-04-24",
        rating: 5,
        image: 'https://placedog.net/80/80?random=6'
    }
];

// 더미 데이터 - 내가 받은 상담 요청
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
        author: "박서연",
        postTitle: "토끼 이갈이 방법",
        comment: "네덜란드 드워프 토끼가 가구를 갉아요. 안전하게 이갈이할 방법이 있을까요?",
        link: "/posts/rabbit-teeth",
        date: "2025-04-21",
        status: "답변 대기중",
        petType: "토끼",
        petBreed: "네덜란드 드워프",
        petAge: "1살"
    },
    {
        id: 4,
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
    },
    {
        id: 5,
        author: "정민수",
        postTitle: "새 깃털 꺾음 증상",
        comment: "코카투가 스트레스 받으면 깃털을 뽑는데, 예방 방법이 궁금해요.",
        link: "/posts/bird-feather",
        date: "2025-04-19",
        status: "답변 대기중",
        petType: "새",
        petBreed: "코카투",
        petAge: "2살"
    },
    {
        id: 6,
        author: "송하은",
        postTitle: "거북이 목욕 빈도",
        comment: "반려 거북이는 얼마나 자주 목욕시켜야 하나요? 물 온도도 알려주세요.",
        link: "/posts/turtle-bath",
        date: "2025-04-18",
        status: "답변 완료",
        petType: "거북이",
        petBreed: "아프리카 사육거북",
        petAge: "5살",
        chats: [
            {
                type: "trainer",
                message: "안녕하세요, 송하은님. 아프리카 사육거북(육지거북)은 물속에서 생활하는 종이 아니라 목욕 횟수를 조절해야 합니다. 일반적으로 1~2주에 한 번 정도가 적당하며, 너무 자주 목욕시키면 오히려 해로울 수 있어요.",
                time: "2025-04-18 12:30"
            }
        ]
    }
];

// 탭별 현재 페이지 상태 관리
const tabStates = {
    profile: {currentPage: 1},
    mypost: {currentPage: 1},
    review: {currentPage: 1},
    liked: {currentPage: 1},
    advice: {currentPage: 1}
};

let currentPage = 1;
const itemsPerPage = 5;
let currentTab = 'profile';

const token = localStorage.getItem('access token');

// DOM이 완전히 로드된 후 실행
document.addEventListener('DOMContentLoaded', function () {
    // 탭 이벤트 리스너 설정
    document.getElementById('tab-profile').addEventListener('click', function (e) {
        e.preventDefault();
        switchTab('profile');
    });

    document.getElementById('tab-mypost').addEventListener('click', function (e) {
        e.preventDefault();
        switchTab('mypost');
    });

    document.getElementById('tab-review').addEventListener('click', function (e) {
        e.preventDefault();
        switchTab('review');
    });

    document.getElementById('tab-liked').addEventListener('click', function (e) {
        e.preventDefault();
        switchTab('liked');
    });

    document.getElementById('tab-advice').addEventListener('click', function (e) {
        e.preventDefault();
        switchTab('advice');
    });

    // 검색 기능 리스너 추가
    const searchInput = document.getElementById('search-input');
    const searchBtn   = document.getElementById('search-button');

    if (searchBtn && searchInput) {
        // 버튼 클릭 시
        searchBtn.addEventListener('click', () => {
            const term = searchInput.value.trim().toLowerCase();
            searchContent(term);
        });
        // Enter 키 입력 시
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                const term = searchInput.value.trim().toLowerCase();
                searchContent(term);
            }
        });
    }

    // 초기 탭 로딩
    switchTab('profile');

    document.querySelector('.profile-image').addEventListener('click', updateProfileImage);
});

// 탭 전환 함수
function switchTab(tabName) {
    if (tabName !== currentTab) {
        tabStates[tabName].currentPage = 1;
        // 검색어도 초기화하고 싶으면 여기서:
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.value = '';
    }

    // 현재 탭 업데이트
    currentTab = tabName;

    // 검색창 관리 (프로필 탭에서는 숨김)
    const searchContainer = document.querySelector('.search-bar');
    const paginationContainer = document.querySelector('.pagination-container');

    if (tabName === 'profile') {
        if (searchContainer) searchContainer.style.display = 'none';
        if (paginationContainer) paginationContainer.style.display = 'none';
    } else {
        if (searchContainer) searchContainer.style.display = 'flex';
        if (paginationContainer) paginationContainer.style.display = 'flex';
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
    switch (tabName) {
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
            <div class="d-flex flex-column align-items-center">
              <img src="${profileData.profileImage}" alt="프로필 이미지" class="rounded-circle profile-image">
              <div class="profile-image-overlay">
                <img src="images/icons/camera.svg" alt="사진 아이콘" class="camera-icon">
              </div>
            </div>
            <div class="profile-details align-self-center ms-4">
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
                <label class="label col-form-label me-3">이메일</label>
                <input
                  type="email"
                  name="email"
                  class="form-control form-control-sm"
                  value="${profileData.email}"
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
                    <button type="button" class="btn edit-button">+</button>
                </div>
            </div>
            <button class="btn btn-warning mt-3 mx-auto d-block">수정하기</button>
        </div>
    `;

    document.getElementById('profile-section').innerHTML = profileHTML;

    // 프로필 이미지와 오버레이에 클릭 핸들러 연결
    const imgEl = document.querySelector('#profile-section .profile-image');
    const overlayEl = document.querySelector('#profile-section .profile-image-overlay');
    [imgEl, overlayEl].forEach(el => {
        el.style.cursor = 'pointer';     // 마우스 포인터 표시
        el.addEventListener('click', updateProfileImage);
    });
}

// 내가 쓴 글 표시 함수
async function showMyPosts(filteredPosts = null) {
    const response = await fetch('https://dev.tuituiworld.store/api/v1/posts/users/me', {
        method: 'GET',
        headers: {
            'accept': '*/*',
            'Authorization': `Bearer ${token}`
        }
    });

    const posts = await response.json();
    console.log(posts);

    // 프로필 영역 숨기기
    document.getElementById('profile-section').style.display = 'none';
    // 게시글 목록 보이게 설정
    document.getElementById('post-container').style.display = 'block';
    // 리뷰 섹션 숨기기
    document.getElementById('review-section').style.display = 'none';
    // 페이지네이션 보이게 설정
    document.querySelector('.pagination-container').style.display = 'flex';

    // 필터링된 데이터 또는 원본 데이터 사용
    const dataToShow = filteredPosts || posts;

    // 데이터가 비어있는 경우
    if (dataToShow.length === 0) {
        document.getElementById('post-container').innerHTML = '<p class="no-results">검색 결과가 없습니다.</p>';
        document.querySelector('.pagination').innerHTML = '';
        return;
    }

    // 페이징 처리
    const startIndex = (tabStates.mypost.currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, dataToShow.length);
    const currentPagePosts = dataToShow.slice(startIndex, endIndex);

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

    // 페이지네이션 생성 (탭 상태 및 필터링된 데이터 길이 사용)
    generatePagination(dataToShow.length, 'mypost');
}

// 내가 받은 후기 표시 함수
function showMyReviews(filteredReviews = null) {
    // 프로필 영역 숨기기
    document.getElementById('profile-section').style.display = 'none';
    // 게시글 목록 숨기기
    document.getElementById('post-container').style.display = 'none';
    // 리뷰 섹션 보이게 설정
    document.getElementById('review-section').style.display = 'block';
    // 페이지네이션 보이게 설정
    document.querySelector('.pagination-container').style.display = 'flex';

    // 필터링된 데이터 또는 원본 데이터 사용
    const dataToShow = filteredReviews || myReviews;

    // 데이터가 비어있는 경우
    if (dataToShow.length === 0) {
        document.getElementById('review-section').innerHTML = '<p class="no-results">검색 결과가 없습니다.</p>';
        document.querySelector('.pagination').innerHTML = '';
        return;
    }

    // 페이징 처리
    const startIndex = (tabStates.review.currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, dataToShow.length);
    const currentPageReviews = dataToShow.slice(startIndex, endIndex);

    // 후기 렌더링 - 레이아웃 개선
    const reviewsHTML = `
        <ul id="review-container" class="review-list">
            ${currentPageReviews.map(review => `
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
                            ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
                        </div>
                    </div>
                    <div class="review-body">
                        <p class="review-content">${review.content}</p>
                    </div>
                </li>
            `).join('')}
        </ul>
    `;

    document.getElementById('review-section').innerHTML = reviewsHTML;

    // 페이지네이션 생성
    generatePagination(dataToShow.length, 'review');
}

// 좋아요한 글 표시 함수
function showLikedPosts(filteredLikes = null) {
    // 프로필 영역 숨기기
    document.getElementById('profile-section').style.display = 'none';
    // 게시글 목록 보이게 설정
    document.getElementById('post-container').style.display = 'block';
    // 리뷰 섹션 숨기기
    document.getElementById('review-section').style.display = 'none';
    // 페이지네이션 보이게 설정
    document.querySelector('.pagination-container').style.display = 'flex';

    // 필터링된 데이터 또는 원본 데이터 사용 (여기서는 원본 posts 데이터 사용)
    const dataToShow = filteredLikes || posts;

    // 데이터가 비어있는 경우
    if (dataToShow.length === 0) {
        document.getElementById('post-container').innerHTML = '<p class="no-results">검색 결과가 없습니다.</p>';
        document.querySelector('.pagination').innerHTML = '';
        return;
    }

    // 페이징 처리
    const startIndex = (tabStates.liked.currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, dataToShow.length);
    const currentPageLiked = dataToShow.slice(startIndex, endIndex);

    const likedHTML = currentPageLiked.map(post => `
        <div class="post-item">
            <div class="post-info">
                <h3 class="post-category">${post.category}</h3>
                <h4>${post.title}</h4>
                <p class="post-content">${post.content}</p>
                <div class="post-meta">
                        <strong>${post.author}</strong> &nbsp;&nbsp; ${post.date} &nbsp;&nbsp; 좋아요 수: ${post.likeCount} &nbsp;&nbsp; 댓글 수: ${post.commentCount}
                </div>
            </div>
            <div class="post-image">
                <img src="${post.image}" alt="게시글 이미지">
            </div>
        </div>
    `).join('');

    document.getElementById('post-container').innerHTML = likedHTML;

    // 페이지네이션 생성
    generatePagination(dataToShow.length, 'liked');
}

// 상담신청내역 표시 함수
function showMyAdvices(filteredAdvices = null) {
    // 프로필 영역 숨기기
    document.getElementById('profile-section').style.display = 'none';
    // 게시글 목록 보이게 설정
    document.getElementById('post-container').style.display = 'block';
    // 리뷰 섹션 숨기기
    document.getElementById('review-section').style.display = 'none';
    // 페이지네이션 보이게 설정
    document.querySelector('.pagination-container').style.display = 'flex';

    // 필터링된 데이터 또는 원본 데이터 사용
    let dataToShow = filteredAdvices || [...adviceRequests];

    // 데이터가 비어있는 경우
    if (dataToShow.length === 0) {
        document.getElementById('post-container').innerHTML = '<p class="no-results">검색 결과가 없습니다.</p>';
        document.querySelector('.pagination').innerHTML = '';
        return;
    }

    // 상태에 따라 정렬 (대기중 > 진행중 > 완료 순)
    if (!filteredAdvices) {
        dataToShow = dataToShow.sort((a, b) => {
            // 우선순위 점수 부여
            const getPriorityScore = (status) => {
                if (status.includes('대기')) return 2;
                return 1; // 완료
            };
            return getPriorityScore(b.status) - getPriorityScore(a.status);
        });
    }

    // 페이징 처리
    const startIndex = (tabStates.advice.currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, dataToShow.length);
    const currentPageAdvices = dataToShow.slice(startIndex, endIndex);

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
                <button data-id="${advice.id}" class="btn btn-primary btn-sm view-detail-btn">상세보기</button>
                ${advice.status !== "답변 완료" ? `
                <button data-id="${advice.id}" class="btn btn-warning btn-sm accept-btn">수락하기</button>
                <button data-id="${advice.id}" class="btn btn-outline-danger btn-sm reject-btn">거절하기</button>
                ` : ''}
            </div>
        </div>
    `).join('');

    document.getElementById('post-container').innerHTML = advicesHTML;

    // 페이지네이션 생성
    generatePagination(dataToShow.length, 'advice');

    attachAdviceEventListeners(dataToShow);
}

// 페이지네이션 생성 함수
function generatePagination(totalItems, tabName) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const currentTabState = tabStates[tabName];

    if (totalPages <= 1) {
        document.querySelector('.pagination').innerHTML = '';
        return;
    }

    let paginationHTML = `
        <li class="page-item ${currentTabState.currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentTabState.currentPage - 1}">&laquo;</a>
        </li>
    `;

    // 페이지 번호
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
            <li class="page-item ${currentTabState.currentPage === i ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>
        `;
    }

    paginationHTML += `
        <li class="page-item ${currentTabState.currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentTabState.currentPage + 1}">&raquo;</a>
        </li>
    `;

    document.querySelector('.pagination').innerHTML = paginationHTML;

    // 페이지 번호 클릭 이벤트 설정
    document.querySelectorAll('.pagination .page-link').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetPage = parseInt(this.getAttribute('data-page'));

            if (targetPage >= 1 && targetPage <= totalPages && targetPage !== currentTabState.currentPage) {
                currentTabState.currentPage = targetPage;
                switchTab(tabName);
            }
        });
    });
}

// 검색 함수
function searchContent(searchTerm) {
    if (!searchTerm) {
        // 검색어가 없으면 현재 탭 다시 로드
        switchTab(currentTab);
        return;
    }

    // 탭별 검색 로직 분리
    switch (currentTab) {
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

// 프로필 이미지 변경 이벤트 설정
function updateProfileImage() {
    const profileImage = document.querySelector('.profile-image');
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';

    document.body.appendChild(fileInput);
    fileInput.click();

    fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                profileImage.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
}