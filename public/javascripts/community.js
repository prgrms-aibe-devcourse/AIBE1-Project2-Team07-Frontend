// --- 전역 변수 ---
let currentPage = 1;
const postsPerPage = 5;
let currentCategory = '전체';
let currentSort = '최신순';
let currentSearch = '';
let currentSearchCategory = '전체';

const PostCategory = {
    ALL: '전체',
    FREE: '자유게시판',
    REVIEW: '펫 도구 후기',
    QUESTION: '질문하기',
    MYPET: '자랑하기'
};

// --- 더미 데이터 생성 ---
const posts = generateDummyPosts(30);

document.addEventListener('DOMContentLoaded', function () {
    // --- 페이지 초기화 ---
    initBackToTopButton();
    initCategoryItems();
    initSortItems();
    initSearchFunctionality();
    initWriteButton();
    initPostInteractions();
    renderPosts();
    renderPagination();
});

/**
 * 더미 게시글 데이터를 생성하는 함수
 * @param {number} count - 생성할 게시글 수
 * @returns {Array} - PostResponseDTO 형식의 게시글 배열
 */
function generateDummyPosts(count) {
    const posts = [];
    const categories = [
        PostCategory.FREE,
        PostCategory.REVIEW,
        PostCategory.QUESTION,
        PostCategory.MYPET
    ];
    const userNames = ['강형욱', '이경규', '정형돈', '유재석', '박명수', '김종국'];
    const profileImages = ['./images/temp.jpg'];
    const tags = [
        ['#강아지', '#훈련', '#산책'],
        ['#고양이', '#장난감', '#사료'],
        ['#햄스터', '#케이지', '#휠'],
        ['#새', '#앵무새', '#모이'],
        ['#토끼', '#당근', '#토끼장'],
        ['#강아지', '#고양이', '#반려동물'],
        ['#귀여운', '#애완동물', '#펫스타그램'],
        ['#펫', '#꿀팁', '#육아'],
        ['#동물', '#사진', '#일상'],
        ['#펫톡', '#커뮤니티', '#질문']
    ];

    const contents = [
        '요즘 우리 집 강아지가 새로 산 인형을 너무 좋아하네요! 🐶✨ 매일 품고 잘 정도니까요 진짜야 벌써 낡아가네요ㅋㅋ 어디서 반려동물용 어떤 장난감을 제일 추천하시나요? 잘하면 추천요!',
        '고양이 사료 추천 부탁드려요. 제가 사료를 몇 개 사봤는데, 우리 고양이가 잘 안 먹네요. 이런 까다로운 애들을 위한 맛있는 사료 있을까요?',
        '햄스터 케이지를 새로 바꿀까 생각중인데요. 어떤 케이지가 햄스터 건강에 좋을까요? 추천 부탁드립니다.',
        '반려견 교육 방법 공유합니다! 제가 3달 동안 훈련을 시켜봤는데, 앉아, 기다려, 죽은척 이렇게 3가지를 가르쳤어요. 어떻게 했는지 궁금하신 분들 댓글 달아주세요.',
        '고양이 화장실 냄새 해결 꿀팁! 제가 이것저것 다 써봤는데 이 방법이 제일 좋더라고요. 다른 분들도 한번 시도해보세요!',
        '강아지 목욕 주기는 어떻게 되시나요? 저는 보통 2주에 한 번 씻기는데, 너무 자주 하는 건가 싶어서요. 다른 분들은 어떻게 하시나요?',
        '새로 입양한 고양이가 계속 집안을 어지럽히네요 ㅠㅠ 어떻게 해야 할까요? 다른 분들은 어떻게 고양이 훈련을 시키시나요?',
        '이번에 구매한 애견 장난감 리뷰입니다. 확실히 내구성이 좋고 우리 강아지가 너무 좋아해요! 사진도 첨부해봅니다.',
        '반려동물 외출 시 필수품 공유합니다. 이것만 챙기면 어디든 문제없이 다녀올 수 있어요!',
        '다른 고양이 집사님들, 츄르 중독 어떻게 해결하시나요? 우리 고양이가 츄르만 찾아서 걱정이에요.'
    ];

    const titles = [
        '반려견 장난감 추천해주세요',
        '고양이 사료 추천받아요',
        '햄스터 케이지 어떤게 좋을까요?',
        '강아지 훈련 방법 공유합니다',
        '고양이 화장실 냄새 해결 꿀팁',
        '강아지 목욕 주기 질문드려요',
        '새로 입양한 고양이 적응 문제',
        '[리뷰] 이 애견 장난감 강추합니다!',
        '반려동물 외출 필수품 공유',
        '고양이 츄르 중독 해결법 구합니다'
    ];

    // 오늘 날짜 기준으로 최대 30일 이내의 랜덤한 날짜 생성
    function getRandomDate() {
        const now = new Date();
        const daysPast = Math.floor(Math.random() * 30);
        const randomDate = new Date(now.getTime() - daysPast * 24 * 60 * 60 * 1000);
        return randomDate.toISOString();
    }

    for (let i = 0; i < count; i++) {
        const createdAt = getRandomDate();
        const randomTitleIndex = Math.floor(Math.random() * titles.length);
        const randomContentIndex = Math.floor(Math.random() * contents.length);
        const randomTagIndex = Math.floor(Math.random() * tags.length);

        posts.push({
            postId: i + 1,
            userName: `user${i + 1}`,
            userNickname: userNames[i % userNames.length],
            profileImageUrl: profileImages[0],
            postCategory: categories[i % categories.length],
            title: titles[randomTitleIndex],
            content: contents[randomContentIndex],
            likeCount: Math.floor(Math.random() * 50),
            commentCount: Math.floor(Math.random() * 20),
            hasLiked: false,
            tags: tags[randomTagIndex],
            createdAt: createdAt,
            updatedAt: createdAt
        });
    }

    // 최신순으로 정렬
    return posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/**
 * 맨 위로 버튼 초기화 함수
 */
function initBackToTopButton() {
    const backToTopBtn = document.getElementById('backToTopBtn');
    if (!backToTopBtn) return;

    // 스크롤 위치에 따라 버튼 표시/숨김
    window.addEventListener('scroll', function () {
        if (window.pageYOffset > 300) {
            backToTopBtn.style.display = 'flex';
        } else {
            backToTopBtn.style.display = 'none';
        }
    });

    // 버튼 클릭 시 맨 위로 스크롤
    backToTopBtn.addEventListener('click', function () {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // 초기 상태는 숨김
    backToTopBtn.style.display = 'none';
}

/**
 * 카테고리 아이템 클릭 이벤트 초기화 함수
 */
function initCategoryItems() {
    const categoryItems = document.querySelectorAll('.category-item');

    categoryItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();

            // 활성화 클래스 제거
            categoryItems.forEach(i => i.classList.remove('active'));

            // 클릭한 아이템 활성화
            this.classList.add('active');

            // 선택한 카테고리 이름 가져오기
            currentCategory = this.querySelector('.category-link').textContent.trim();
            console.log('선택한 카테고리:', currentCategory);

            // 페이지 초기화 및 게시글 렌더링
            currentPage = 1;
            renderPosts();
            renderPagination();
        });
    });
}

/**
 * 정렬 아이템 클릭 이벤트 초기화 함수
 */
function initSortItems() {
    const sortItems = document.querySelectorAll('.sort-item');

    sortItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();

            // 활성화 클래스 제거
            sortItems.forEach(i => i.classList.remove('active'));

            // 클릭한 아이템 활성화
            this.classList.add('active');

            // 선택한 정렬 타입 가져오기
            currentSort = this.querySelector('.sort-link').textContent.trim();
            console.log('선택한 정렬:', currentSort);

            // 페이지 초기화 및 게시글 렌더링
            currentPage = 1;
            renderPosts();
            renderPagination();
        });
    });
}

/**
 * 검색 기능 초기화 함수
 */
function initSearchFunctionality() {
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    // const searchCategory = document.getElementById('searchCategory');

    // if (!searchBtn || !searchInput || !searchCategory) return;

    searchBtn.addEventListener('click', function () {
        performSearch();
    });

    // 엔터키 검색 기능
    searchInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    function performSearch() {
        const searchTerm = searchInput.value.trim();
        // const category = searchCategory.value;

        if (searchTerm) {
            // console.log('검색어:', searchTerm, '카테고리:', category);
            currentSearch = searchTerm;
            // currentSearchCategory = category;

            // 페이지 초기화 및 게시글 렌더링
            currentPage = 1;
            renderPosts();
            renderPagination();
        }
    }
}

/**
 * 글쓰기 버튼 기능 초기화 함수
 */
function initWriteButton() {
    const writeBtn = document.getElementById('writeBtn');
    if (!writeBtn) return;

    writeBtn.addEventListener('click', function (e) {
        e.preventDefault();

        // 로그인 상태 확인
        const isLoggedIn = checkUserLoggedIn();

        if (isLoggedIn) {
            // 글쓰기 페이지로 이동
            console.log('글쓰기 페이지로 이동...');
            window.location.href = '/community/write';
        } else {
            // 로그인 모달 표시
            const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
            loginModal.show();
        }
    });
}

/**
 * 게시글 상호작용 기능 초기화 함수
 */
function initPostInteractions() {
    // 이 함수는 게시글이 렌더링된 후에 호출됨
    // 게시글 클릭 이벤트
    document.querySelectorAll('.post-item').forEach(post => {
        post.addEventListener('click', function (e) {
            // 좋아요나 댓글 버튼 클릭 시에는 이벤트 무시
            if (e.target.closest('.like-count') || e.target.closest('.comment-count')) {
                return;
            }

            // 게시글 상세 페이지로 이동
            const postId = this.dataset.postId;
            navigateToPostDetail(postId);
        });
    });
}

/**
 * 게시글 상세 페이지로 이동하는 함수
 * @param {string} postId - 게시글 ID
 */
function navigateToPostDetail(postId) {
    console.log(`게시글 상세 보기: ${postId}`);

    // 실제 애플리케이션에서는 해당 게시글의 상세 페이지로 이동
    const url = `/community/post/${postId}`;

    // 데모용 알림
    alert(`게시글 ${postId}번의 상세 페이지로 이동합니다.`);

    // 실제 구현 시 활성화
    // window.location.href = url;
}

/**
 * 게시글 필터링 함수
 * @returns {Array} - 필터링된 게시글 배열
 */
function filterPosts() {
    let filteredPosts = [...posts];

    // 카테고리 필터링
    console.log("currentCategory: ", currentCategory);
    if (currentCategory !== PostCategory.ALL) {
        console.log("filterPosts: ", filteredPosts.filter(post => post.postCategory === currentCategory))
        filteredPosts = filteredPosts.filter(post => post.postCategory === currentCategory);
    }

    // 검색어 필터링
    // if (currentSearch) {
    filteredPosts = filteredPosts.filter(post => {
        return post.content.includes(currentSearch) ||
            post.tags.some(tag => tag.includes(currentSearch));
    });
    console.log("filteredPosts: ", filteredPosts);
    // }

    // 정렬
    filteredPosts = sortPosts(filteredPosts, currentSort);

    return filteredPosts;
}


/**
 * 게시글 정렬 함수
 * @param {Array} posts - 정렬할 게시글 배열
 * @param {string} sortType - 정렬 타입
 * @returns {Array} - 정렬된 게시글 배열
 */
function sortPosts(posts, sortType) {
    switch (sortType) {
        case '최신순':
            return posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        case '오래된순':
            return posts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        case '답변많은순':
            return posts.sort((a, b) => b.commentCount - a.commentCount);
        case '좋아요순':
            return posts.sort((a, b) => b.likeCount - a.likeCount);
        default:
            return posts;
    }
}

/**
 * 게시글 렌더링 함수
 */
function renderPosts() {
    const postContainer = document.querySelector('.post-container');
    if (!postContainer) return;

    // 필터링된 게시글 가져오기
    const filteredPosts = filterPosts();

    // 페이징 처리
    const startIndex = (currentPage - 1) * postsPerPage;
    const paginatedPosts = filteredPosts.slice(startIndex, startIndex + postsPerPage);

    // 컨테이너 비우기
    postContainer.innerHTML = '';

    if (paginatedPosts.length === 0) {
        // 게시글이 없을 경우 메시지 표시
        postContainer.innerHTML = `
                <div class="no-posts-message">
                    <p>게시글이 없습니다.</p>
                </div>
            `;
        return;
    }

    // 게시글 렌더링
    paginatedPosts.forEach(post => {
        const postElement = createPostElement(post);
        postContainer.appendChild(postElement);
    });

    // 게시글 상호작용 초기화
    initPostInteractions();
}

/**
 * 게시글 요소 생성 함수
 * @param {Object} post - 게시글 객체
 * @returns {HTMLElement} - 게시글 HTML 요소
 */
function createPostElement(post) {
    const postElement = document.createElement('div');
    postElement.className = 'post-item';
    postElement.dataset.postId = post.postId;

    // 게시글 작성 시간 포맷팅
    const postDate = formatDate(post.createdAt);

    postElement.innerHTML = `
            <div class="post-header">
                <div class="user-info">
                    <img src="${post.profileImageUrl}" alt="${post.userNickname}" class="user-avatar">
                    <div class="post-meta">
                        <div class="user-name">${post.userNickname} <span class="board-tag">${post.postCategory}</span></div>
                        <div class="post-date">${postDate}</div>
                    </div>
                </div>
            </div>
            <div class="post-content">
                <p>${post.content}</p>
            </div>
            <div class="post-footer">
                <div class="post-tag-list">
                    ${post.tags.map(tag => `<span class="board-tag">${tag}</span>`).join('')}
                </div>
                <div class="reaction-count">
                    <span class="like-count ${post.hasLiked ? 'liked' : ''}">${post.likeCount}</span>
                    <span class="comment-count">${post.commentCount}</span>
                </div>
            </div>
        `;

    return postElement;
}

/**
 * 날짜 포맷팅 함수
 * @param {string} dateString - ISO 형식의 날짜 문자열
 * @returns {string} - 포맷팅된 날짜 문자열
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        // 오늘
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        if (diffHours === 0) {
            const diffMinutes = Math.floor(diffTime / (1000 * 60));
            return `${diffMinutes}분 전`;
        }
        return `${diffHours}시간 전`;
    } else if (diffDays === 1) {
        return '어제';
    } else if (diffDays < 7) {
        return `${diffDays}일 전`;
    } else {
        // 년-월-일 형식
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }
}

/**
 * 페이지네이션 렌더링 함수
 */
function renderPagination() {
    const paginationContainer = document.querySelector('.pagination');
    if (!paginationContainer) return;

    // 필터링된 게시글 가져오기
    const filteredPosts = filterPosts();

    // 총 페이지 수 계산
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

    // 컨테이너 비우기
    paginationContainer.innerHTML = '';

    // 이전 페이지 버튼
    const prevLi = document.createElement('li');
    prevLi.className = 'page-item' + (currentPage === 1 ? ' disabled' : '');
    prevLi.innerHTML = `
        <a class="page-link" href="#" aria-label="Previous">
            <span aria-hidden="true">&laquo;</span>
        </a>
    `;
    paginationContainer.appendChild(prevLi);

    // 이전 페이지 버튼 이벤트
    if (currentPage > 1) {
        prevLi.addEventListener('click', function (e) {
            e.preventDefault();
            currentPage--;
            renderPosts();
            renderPagination();
            window.scrollTo(0, 0);
        });
    }

    // 페이지 번호
    const maxVisiblePages = 5; // 한 번에 보이는 페이지 수
    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    for (let i = startPage; i <= endPage; i++) {
        const pageLi = document.createElement('li');
        pageLi.className = 'page-item' + (i === currentPage ? ' active' : '');
        pageLi.innerHTML = `<a class="page-link" href="#">${i}</a>`;

        // 페이지 번호 클릭 이벤트
        pageLi.addEventListener('click', function (e) {
            e.preventDefault();
            currentPage = i;
            renderPosts();
            renderPagination();
            window.scrollTo(0, 0);
        });

        paginationContainer.appendChild(pageLi);
    }

    // 다음 페이지 버튼
    const nextLi = document.createElement('li');
    nextLi.className = 'page-item' + (currentPage === totalPages || totalPages === 0 ? ' disabled' : '');
    nextLi.innerHTML = `
        <a class="page-link" href="#" aria-label="Next">
            <span aria-hidden="true">&raquo;</span>
        </a>
    `;
    paginationContainer.appendChild(nextLi);

    // 다음 페이지 버튼 이벤트
    if (currentPage < totalPages) {
        nextLi.addEventListener('click', function (e) {
            e.preventDefault();
            currentPage++;
            renderPosts();
            renderPagination();
            window.scrollTo(0, 0);
        });
    }
}

/**
 * 사용자 로그인 상태 확인 함수 (임시)
 * @returns {boolean} - 로그인 여부
 */
function checkUserLoggedIn() {
    return true;
}