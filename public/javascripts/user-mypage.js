// 더미 데이터 - 다양한 탭에 대응하는 데이터
const allPosts = [
    {
        id: 1,
        category: '라운지',
        title: '요즘 저희애들이 즐겨쓰는 강아지 침대에용',
        content: '[광고] 안냥하세요! 요즘 강아지 사랑하고 있는 강아지 전용 천연 치약이 있어 추천해 드리려고해요! 클폰하지 않는 한정판으로 유일한 치료소 에서 얻게 되포로 만든 몬 매트리스 N32 포인미 매트리스입니다. ※※ 국내 천연 브랜드에서는 최초로 만든 제품이라 그...',
        author: '올김올',
        commentCount: 3,
        image: './images/cat1.jpeg',
        isMyPost: true,
        isMyReview: false,
        isLiked: true,
        hasMyComment: false
    },
    {
        id: 2,
        category: '라운지',
        title: '강아지랑 산책할 때 이거 쓰시나요?',
        content: '요즘 강아지랑 산책할 때 이 하네스 사용하는데 너무 좋아요! 제가 발견한 최고의 하네스인데 혹시 다들 어떤 제품 쓰시는지 궁금해요. 저는 이 제품이 산책할 때 강아지가 끌어당기는 힘을 분산시켜서 어깨나 팔에 부담이 덜 가는 것 같아요. 특히 중대형견 키우시는 분들께 추천드려요...',
        author: '강아지맘',
        commentCount: 15,
        image: 'https://placedog.net/80/80?random=2',
        isMyPost: false,
        isMyReview: true,
        isLiked: true,
        hasMyComment: true
    },
    {
        id: 3,
        category: '질문',
        title: '고양이 화장실 모래 추천 부탁드려요',
        content: '안녕하세요, 최근에 고양이를 입양했는데 화장실 모래 추천 부탁드립니다. 지금 쓰는 모래가 너무 먼지가 많이 나서 다른 제품을 찾고 있어요. 냄새 잡는 효과가 좋으면서도 먼지가 적게 나는 제품이 있을까요? 미리 감사드립니다!',
        author: '집사초보',
        commentCount: 8,
        image: 'https://placedog.net/80/80?random=3',
        isMyPost: true,
        isMyReview: false,
        isLiked: true,
        hasMyComment: true
    },
    {
        id: 4,
        category: '자랑',
        title: '우리 강아지 생일 파티 했어요!',
        content: '어제 우리 뽀미 생일이라 작은 파티를 했어요~ 강아지용 케이크도 주문하고 친구들도 불러서 재밌게 놀았답니다. 사진 몇 장 공유해요! 다들 귀엽다고 해주셔서 너무 기분 좋았어요. 특히 저희 뽀미가 케이크 앞에서 포즈 취하는 모습이 너무 사랑스러워서...',
        author: '뽀미맘',
        commentCount: 12,
        image: 'https://placedog.net/80/80?random=4',
        isMyPost: false,
        isMyReview: true,
        isLiked: false,
        hasMyComment: true
    },
    {
        id: 5,
        category: '정보',
        title: '동물병원 비용 비교해봤어요',
        content: '동네 동물병원 5군데 다니면서 비용 비교해봤습니다. 기본 진료비부터 예방접종, 중성화수술까지 꽤 차이가 나더라고요. 표로 정리해봤으니 참고하세요! 특히 A동물병원은 진료비는 저렴한데 약값이 비싸고, C동물병원은 전체적으로 가격대가 높지만 시설이 좋았어요...',
        author: '경제적집사',
        commentCount: 23,
        image: 'https://placedog.net/80/80?random=5',
        isMyPost: true,
        isMyReview: false,
        isLiked: false,
        hasMyComment: false
    },
    {
        id: 6,
        category: '정보',
        title: '동물병원 비용 비교해봤어요',
        content: '동네 동물병원 5군데 다니면서 비용 비교해봤습니다. 기본 진료비부터 예방접종, 중성화수술까지 꽤 차이가 나더라고요. 표로 정리해봤으니 참고하세요! 특히 A동물병원은 진료비는 저렴한데 약값이 비싸고, C동물병원은 전체적으로 가격대가 높지만 시설이 좋았어요...',
        author: '경제적집사',
        commentCount: 23,
        image: 'https://placedog.net/80/80?random=5',
        isMyPost: true,
        isMyReview: false,
        isLiked: false,
        hasMyComment: false
    },
    {
        id: 7,
        category: '정보',
        title: '동물병원 비용 비교해봤어요',
        content: '동네 동물병원 5군데 다니면서 비용 비교해봤습니다. 기본 진료비부터 예방접종, 중성화수술까지 꽤 차이가 나더라고요. 표로 정리해봤으니 참고하세요! 특히 A동물병원은 진료비는 저렴한데 약값이 비싸고, C동물병원은 전체적으로 가격대가 높지만 시설이 좋았어요...',
        author: '경제적집사',
        commentCount: 23,
        image: 'https://placedog.net/80/80?random=5',
        isMyPost: true,
        isMyReview: false,
        isLiked: false,
        hasMyComment: false
    },
    {
        id: 8,
        category: '정보',
        title: '동물병원 비용 비교해봤어요',
        content: '동네 동물병원 5군데 다니면서 비용 비교해봤습니다. 기본 진료비부터 예방접종, 중성화수술까지 꽤 차이가 나더라고요. 표로 정리해봤으니 참고하세요! 특히 A동물병원은 진료비는 저렴한데 약값이 비싸고, C동물병원은 전체적으로 가격대가 높지만 시설이 좋았어요...',
        author: '경제적집사',
        commentCount: 23,
        image: 'https://placedog.net/80/80?random=5',
        isMyPost: true,
        isMyReview: false,
        isLiked: false,
        hasMyComment: false
    },
    {
        id: 9,
        category: '정보',
        title: '동물병원 비용 비교해봤어요',
        content: '동네 동물병원 5군데 다니면서 비용 비교해봤습니다. 기본 진료비부터 예방접종, 중성화수술까지 꽤 차이가 나더라고요. 표로 정리해봤으니 참고하세요! 특히 A동물병원은 진료비는 저렴한데 약값이 비싸고, C동물병원은 전체적으로 가격대가 높지만 시설이 좋았어요...',
        author: '경제적집사',
        commentCount: 23,
        image: 'https://placedog.net/80/80?random=5',
        isMyPost: true,
        isMyReview: false,
        isLiked: false,
        hasMyComment: false
    },
    {
        id: 10,
        category: '정보',
        title: '동물병원 비용 비교해봤어요',
        content: '동네 동물병원 5군데 다니면서 비용 비교해봤습니다. 기본 진료비부터 예방접종, 중성화수술까지 꽤 차이가 나더라고요. 표로 정리해봤으니 참고하세요! 특히 A동물병원은 진료비는 저렴한데 약값이 비싸고, C동물병원은 전체적으로 가격대가 높지만 시설이 좋았어요...',
        author: '경제적집사',
        commentCount: 23,
        image: 'https://placedog.net/80/80?random=5',
        isMyPost: true,
        isMyReview: false,
        isLiked: false,
        hasMyComment: false
    },
    {
        id: 11,
        category: '정보',
        title: '동물병원 비용 비교해봤어요',
        content: '동네 동물병원 5군데 다니면서 비용 비교해봤습니다. 기본 진료비부터 예방접종, 중성화수술까지 꽤 차이가 나더라고요. 표로 정리해봤으니 참고하세요! 특히 A동물병원은 진료비는 저렴한데 약값이 비싸고, C동물병원은 전체적으로 가격대가 높지만 시설이 좋았어요...',
        author: '경제적집사',
        commentCount: 23,
        image: 'https://placedog.net/80/80?random=5',
        isMyPost: true,
        isMyReview: false,
        isLiked: false,
        hasMyComment: false
    }
];

// 더미 프로필 데이터
const dummyProfile = {
    nickname: '홍길동',
    name: '홍길동',
    email: 'example.gmail.com'
};

// 전역 변수로 현재 페이지와 페이지당 아이템 개수 설정
let currentPage = 1;
const itemsPerPage = 5;
let filteredPosts = [...allPosts]; // 초기에는 모든 게시글을 표시

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

    paginatedPosts.forEach((post) => {
        const postElement = document.createElement('div');
        postElement.className = 'post-item';

        postElement.innerHTML = `
            <div class="post-info">
                <h3 class="post-title">${post.category}</h3>
                <h4>${post.title}</h4>
                <p class="post-content">${post.content}</p>
                <div class="post-meta">
                    작성자: ${post.author} &nbsp;&nbsp; 댓글: ${post.commentCount}
                </div>
            </div>
            <div class="post-image">
                <img src="${post.image}" alt="게시글 이미지">
            </div>
        `;
        postListElement.appendChild(postElement);
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
        link.addEventListener('click', function(e) {
            e.preventDefault();

            const text = this.textContent;

            if (text === '«') {
                if (currentPage > 1) {
                    currentPage--;
                    renderPosts(filteredPosts, currentPage);
                }
            } else if (text === '»') {
                const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
                if (currentPage < totalPages) {
                    currentPage++;
                    renderPosts(filteredPosts, currentPage);
                }
            } else {
                currentPage = parseInt(text);
                renderPosts(filteredPosts, currentPage);
            }
        });
    });
}

// 프로필 정보 렌더링 함수
function renderProfile() {
    // 프로필 섹션이 없으면 생성
    let profileSection = document.querySelector('.profile-section');
    if (!profileSection) {
        profileSection = document.createElement('div');
        profileSection.className = 'profile-section';

        // 프로필 섹션 HTML 구성
        profileSection.innerHTML = `
    <div class="profile-image-container">
        <img src="https://placehold.co/180x180" alt="프로필 이미지" class="profile-image">
        <button class="edit-profile-btn">사진 추가</button>
    </div>
    
    <div class="profile-info">
        <div class="profile-info-row">
            <div class="profile-info-label">닉네임</div>
            <div class="profile-info-value">
                <input type="text" class="profile-input" name="nickname" value="${dummyProfile.nickname}">
            </div>
        </div>
        <div class="profile-info-row">
            <div class="profile-info-label">이름</div>
            <div class="profile-info-value">
                <input type="text" class="profile-input" name="name" value="${dummyProfile.name}">
            </div>
        </div>
        <div class="profile-info-row">
            <div class="profile-info-label">이메일</div>
            <div class="profile-info-value">
                <input type="email" class="profile-input" name="email" value="${dummyProfile.email}">
            </div>
        </div>
    </div>
    
    <div class="profile-button-group">
        <button class="profile-button save-button">저장하기</button>
        <button class="profile-button edit-button">훈련사 신청</button>
    </div>
`;


        // 프로필 섹션을 검색바 위에 삽입
        const searchBar = document.querySelector('.search-bar');
        if (searchBar) {
            searchBar.parentNode.insertBefore(profileSection, searchBar);
        } else {
            // 검색바가 없으면 post-container 앞에 삽입
            const postContainer = document.getElementById('post-container');
            if (postContainer) {
                postContainer.parentNode.insertBefore(profileSection, postContainer);
            }
        }
    }

    // 프로필 섹션 표시
    profileSection.style.display = 'block';

    // 게시물 목록 숨기기
    hidePostList();
}

// 게시물 목록 숨기기
function hidePostList() {
    const postContainer = document.getElementById('post-container');
    if (postContainer) postContainer.style.display = 'none';

    const pagination = document.querySelector('.pagination');
    if (pagination) pagination.parentElement.style.display = 'none';

    const searchBar = document.querySelector('.search-bar');
    if (searchBar) searchBar.style.display = 'none';
}

// 게시물 목록 표시하기
function showPostList() {
    const postContainer = document.getElementById('post-container');
    if (postContainer) postContainer.style.display = 'block';

    const pagination = document.querySelector('.pagination');
    if (pagination) pagination.parentElement.style.display = 'block';

    const searchBar = document.querySelector('.search-bar');
    if (searchBar) searchBar.style.display = 'block';

    // 프로필 섹션 숨기기
    const profileSection = document.querySelector('.profile-section');
    if (profileSection) profileSection.style.display = 'none';
}

// 탭 메뉴 활성화 처리 및 필터링
function setupTabEvents() {
    document.querySelectorAll('.tab-menu .nav-link').forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            // 모든 탭에서 active 클래스 제거
            document.querySelectorAll('.tab-menu .nav-link').forEach(t => {
                t.classList.remove('active');
            });
            // 클릭된 탭에 active 클래스 추가
            this.classList.add('active');

            // 탭에 따른 게시글 필터링
            const tabId = this.id;

            // 페이지 초기화
            currentPage = 1;

            // 필터링 적용
            switch(tabId) {
                case 'tab-profile':
                    // 프로필 탭 - 프로필 정보 표시
                    renderProfile();
                    return;
                case 'tab-mypost':
                    // 내가 쓴 글 탭
                    filteredPosts = allPosts.filter(post => post.isMyPost);
                    break;
                case 'tab-review':
                    // 내가 쓴 후기 탭
                    filteredPosts = allPosts.filter(post => post.isMyReview);
                    break;
                case 'tab-liked':
                    // 좋아요한 글 탭
                    filteredPosts = allPosts.filter(post => post.isLiked);
                    break;
                case 'tab-comment':
                    // 내가 댓 달은 탭
                    filteredPosts = allPosts.filter(post => post.hasMyComment);
                    break;
                default:
                    filteredPosts = [...allPosts];
            }

            console.log(`탭 ${this.textContent} 클릭됨 - ${filteredPosts.length}개 게시글 필터링됨`);
            // 게시물 목록 표시
            showPostList();
            // 필터링된 게시글 표시
            renderPosts(filteredPosts, currentPage);
        });
    });
}

// 글쓰기 버튼 이벤트 설정
function setupWriteButton() {
    const writeButton = document.querySelector('.btn-primary');
    if (writeButton) {
        writeButton.addEventListener('click', function() {
            // 백엔드 연동 전 임시 처리
            alert('글쓰기 기능은 백엔드 연동 후 사용 가능합니다.');
        });
    }
}

// 프로필 버튼 이벤트 설정
function setupProfileButtons() {
    document.addEventListener('click', function(e) {
        // 수정하기 버튼
        if (e.target.classList.contains('save-button')) {
            alert('프로필 수정 기능은 백엔드 연동 후 사용 가능합니다.');
        }
        // 훈련사 신청 버튼
        else if (e.target.classList.contains('edit-button')) {
            alert('훈련사 신청 기능은 백엔드 연동 후 사용 가능합니다.');
        }
        // 사진 추가 버튼
        else if (e.target.classList.contains('edit-profile-btn')) {
            alert('프로필 사진 변경 기능은 백엔드 연동 후 사용 가능합니다.');
        }
    });
}

// 백엔드 API 호출 함수 (현재는 주석 처리됨)
/*
async function fetchUserProfile() {
    try {
        const response = await fetch('/api/user/profile');
        if (!response.ok) {
            throw new Error('프로필 정보를 가져오는데 실패했습니다.');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('에러 발생:', error);
        // 에러 발생 시 더미 데이터 반환
        return dummyProfile;
    }
}

async function fetchUserPosts(type) {
    try {
        const response = await fetch(`/api/user/posts?type=${type}`);
        if (!response.ok) {
            throw new Error('게시글을 가져오는데 실패했습니다.');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('에러 발생:', error);
        // 에러 발생 시 더미 데이터 반환
        return filterPostsByType(type);
    }
}

function filterPostsByType(type) {
    switch (type) {
        case 'mypost':
            return allPosts.filter(post => post.isMyPost);
        case 'review':
            return allPosts.filter(post => post.isMyReview);
        case 'liked':
            return allPosts.filter(post => post.isLiked);
        case 'comment':
            return allPosts.filter(post => post.hasMyComment);
        default:
            return allPosts;
    }
}
*/

// 페이지 로드 시 초기화
window.addEventListener('DOMContentLoaded', () => {
    // 이벤트 리스너 설정
    setupTabEvents();
    setupWriteButton();
    setupProfileButtons();

    // 기본적으로 프로필 탭을 활성화하고 프로필 정보 표시
    const profileTab = document.getElementById('tab-profile');
    if (profileTab) {
        // 다른 모든 탭에서 active 클래스 제거
        document.querySelectorAll('.tab-menu .nav-link').forEach(tab => {
            tab.classList.remove('active');
        });
        // 프로필 탭에 active 클래스 추가
        profileTab.classList.add('active');
        // 프로필 정보 표시
        renderProfile();
    } else {
        // 프로필 탭이 없으면 기본 게시글 표시
        renderPosts(allPosts, currentPage);
    }
});