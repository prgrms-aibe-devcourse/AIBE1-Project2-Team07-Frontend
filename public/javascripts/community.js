// --- 전역 변수 ---
let currentPage = 0;
const postsPerPage = 5;
let currentCategory = '';
let currentPetCategory = '';
let currentSort = 'LATEST';
let currentSearch = '';
let totalPages = 0;

const PostCategory = {
    ALL: '',
    FREE: 'FREE',
    REVIEW: 'TOOL',
    QNA: 'QNA',
    MYPET: 'MYPET'
};

const PetCategory = {
    ALL: '',
    DOG: 'DOG',
    CAT: 'CAT',
    ETC: 'ETC'
};

const SortType = {
    LATEST: 'LATEST',
    OLDEST: 'OLDEST',
    COMMENTS: "COMMENTS",
    LIKES: "LIKES"
}

document.addEventListener('DOMContentLoaded', function () {
    // URL에서 파라미터 읽어오기
    loadStateFromURL();

    // --- 페이지 초기화 ---
    initBackToTopButton();
    initCategoryItems();
    initPetCategoryFilter();
    initSortItems();
    initSearchFunctionality();
    initWriteButton();
    initPostInteractions();
    initRandomAd();
    fetchAndRenderPosts();
});

// URL에서 상태 파라미터 로드하는 함수
function loadStateFromURL() {
    const urlParams = new URLSearchParams(window.location.search);

    // 카테고리 파라미터 로드
    if (urlParams.has('category')) {
        currentCategory = urlParams.get('category');
    }

    // 반려동물 카테고리 파라미터 로드
    if (urlParams.has('petCategory')) {
        currentPetCategory = urlParams.get('petCategory');
    }

    // 정렬 방식 파라미터 로드
    if (urlParams.has('sort')) {
        currentSort = urlParams.get('sort');
    }

    // 검색어 파라미터 로드
    if (urlParams.has('search')) {
        currentSearch = urlParams.get('search');
        // 검색창에 검색어 설정
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = currentSearch;
        }
    }

    // 페이지 번호 파라미터 로드
    if (urlParams.has('page')) {
        currentPage = parseInt(urlParams.get('page')) || 0;
    }

    // UI 업데이트
    updateUIFromState();
}

// 현재 상태를 URL에 업데이트하는 함수
function updateURLFromState(pushState = true) {
    const urlParams = new URLSearchParams();

    // 상태 파라미터 추가
    if (currentCategory !== '' && currentCategory !== '') {
        urlParams.set('category', currentCategory);
    }

    if (currentPetCategory !== '' && currentPetCategory !== '') {
        urlParams.set('petCategory', currentPetCategory);
    }

    if (currentSort !== 'LATEST') {
        urlParams.set('sort', currentSort);
    }

    if (currentSearch) {
        urlParams.set('search', currentSearch);
    }

    if (currentPage > 0) {
        urlParams.set('page', currentPage);
    }

    // URL 업데이트
    const newURL = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');

    if (pushState) {
        // 브라우저 히스토리에 상태 추가
        window.history.pushState({
            category: currentCategory,
            petCategory: currentPetCategory,
            sort: currentSort,
            search: currentSearch,
            page: currentPage
        }, '', newURL);
    } else {
        // 히스토리 상태 수정 (페이지네이션 등에서 사용)
        window.history.replaceState({
            category: currentCategory,
            petCategory: currentPetCategory,
            sort: currentSort,
            search: currentSearch,
            page: currentPage
        }, '', newURL);
    }
}

// 브라우저 뒤로가기/앞으로가기 처리
window.addEventListener('popstate', function (event) {
    if (event.state) {
        // 상태 복원
        currentCategory = event.state.category || '';
        currentPetCategory = event.state.petCategory || '';
        currentSort = event.state.sort || 'LATEST';
        currentSearch = event.state.search || '';
        currentPage = event.state.page || 0;

        // UI 업데이트
        updateUIFromState();

        // 게시글 다시 가져오기
        fetchAndRenderPosts();
    } else {
        // 초기 상태로 복원
        loadStateFromURL();
        fetchAndRenderPosts();
    }
});

// 현재 상태에 따라 UI 업데이트
function updateUIFromState() {
    // 카테고리 UI 업데이트
    const categoryItems = document.querySelectorAll('.category-item');
    categoryItems.forEach(item => {
        const categoryLink = item.querySelector('.category-link');
        let categoryValue = '';

        switch (categoryLink.textContent.trim()) {
            case '자유게시판':
                categoryValue = PostCategory.FREE;
                break;
            case '펫 도구 후기':
                categoryValue = PostCategory.REVIEW;
                break;
            case '질문하기':
                categoryValue = PostCategory.QNA;
                break;
            case '자랑하기':
                categoryValue = PostCategory.MYPET;
                break;
            default:
                categoryValue = PostCategory.ALL;
        }

        if (categoryValue === currentCategory) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // 반려동물 카테고리 UI 업데이트
    const petFilterItems = document.querySelectorAll('.pet-filter-item');
    petFilterItems.forEach(item => {
        const petFilterLink = item.querySelector('.pet-filter-link');
        let petCategoryValue = '';

        switch (petFilterLink.textContent.trim()) {
            case '강아지':
                petCategoryValue = PetCategory.DOG;
                break;
            case '고양이':
                petCategoryValue = PetCategory.CAT;
                break;
            case '기타':
                petCategoryValue = PetCategory.ETC;
                break;
            default:
                petCategoryValue = PetCategory.ALL;
        }

        if (petCategoryValue === currentPetCategory) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // 정렬 UI 업데이트
    const sortItems = document.querySelectorAll('.sort-item');
    sortItems.forEach(item => {
        const sortLink = item.querySelector('.sort-link');
        let sortValue = '';

        switch (sortLink.textContent.trim()) {
            case '오래된순':
                sortValue = SortType.OLDEST;
                break;
            case '답변많은순':
                sortValue = SortType.COMMENTS;
                break;
            case '좋아요순':
                sortValue = SortType.LIKES;
                break;
            default:
                sortValue = SortType.LATEST;
        }

        if (sortValue === currentSort) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // 검색어 UI 업데이트
    const searchInput = document.getElementById('searchInput');
    if (searchInput && currentSearch) {
        searchInput.value = currentSearch;
    }
}

function initRandomAd() {
    const adImage = document.getElementById('adImage');
    if (!adImage) return;

    // 광고 이미지 목록
    const adImages = [
        './images/ad.png',
        './images/ad2.jfif',
        './images/ad3.jfif',
        './images/ad4.jfif',
        './images/ad5.jfif'
    ];

    // 랜덤으로 이미지 선택
    const randomIndex = Math.floor(Math.random() * adImages.length);
    adImage.src = adImages[randomIndex];
}

function initPetCategoryFilter() {
    const petFilterItems = document.querySelectorAll('.pet-filter-item');

    petFilterItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();

            // 활성화 클래스 제거
            petFilterItems.forEach(i => i.classList.remove('active'));

            // 클릭한 아이템 활성화
            this.classList.add('active');

            // 선택한 펫 카테고리 이름 가져오기
            const petCategoryText = this.querySelector('.pet-filter-link').textContent.trim();

            // 펫 카테고리 매핑 (UI 표시용 텍스트 -> API 값)
            switch (petCategoryText) {
                case '강아지':
                    currentPetCategory = PetCategory.DOG;
                    break;
                case '고양이':
                    currentPetCategory = PetCategory.CAT;
                    break;
                case '기타':
                    currentPetCategory = PetCategory.ETC;
                    break;
                default:
                    currentPetCategory = PetCategory.ALL;
            }


            // 페이지 초기화 및 URL 업데이트
            currentPage = 0;
            updateURLFromState();
            fetchAndRenderPosts();
        });
    });
}

async function fetchAndRenderPosts() {
    try {
        const posts = await fetchPosts();
        renderPosts(posts.postList);
        renderPagination(posts.pageNo, posts.totalPages);
    } catch (error) {
        console.error('게시글을 가져오는 중 오류 발생:', error);
        showErrorMessage('게시글을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
    }
}

async function fetchPosts() {
    // API 요청 URL 구성
    let url = `/api/v1/posts/open?page=${currentPage}`;

    // 검색어가 있으면 추가
    if (currentSearch) {
        url += `&keyword=${encodeURIComponent(currentSearch)}`;
    }

    // 카테고리 필터링
    if (currentCategory !== '') {
        url += `&postCategory=${encodeURIComponent(currentCategory)}`;
    }

    // 반려동물 카테고리 필터링
    if (currentPetCategory !== '') {
        url += `&petCategory=${encodeURIComponent(currentPetCategory)}`;
    }

    // 정렬 타입
    url += `&sortType=${encodeURIComponent(currentSort)}`;

    // API 호출
    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    });


    if (!response.ok) {
        throw new Error('API 요청 실패: ' + response.status);
    }

    return await response.json();
}

/**
 * 오류 메시지를 표시하는 함수
 * @param {string} message - 표시할 오류 메시지
 */
function showErrorMessage(message) {
    const postContainer = document.querySelector('.post-container');
    if (!postContainer) return;

    postContainer.innerHTML = `
        <div class="error-message">
            <p>${message}</p>
        </div>
    `;
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
            const categoryText = this.querySelector('.category-link').textContent.trim();

            // 카테고리 매핑 (UI 표시용 텍스트 -> API 값)
            switch (categoryText) {
                case '자유게시판':
                    currentCategory = PostCategory.FREE;
                    break;
                case '펫 도구 후기':
                    currentCategory = PostCategory.REVIEW;
                    break;
                case '질문하기':
                    currentCategory = PostCategory.QNA;
                    break;
                case '자랑하기':
                    currentCategory = PostCategory.MYPET;
                    break;
                default:
                    currentCategory = PostCategory.ALL;
            }


            // 페이지 초기화 및 URL 업데이트
            currentPage = 0;
            updateURLFromState();
            fetchAndRenderPosts();
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
            const sortText = this.querySelector('.sort-link').textContent.trim();

            // 정렬 타입 매핑 (UI 표시용 텍스트 -> API 값)
            switch (sortText) {
                case '오래된순':
                    currentSort = SortType.OLDEST;
                    break;
                case '답변많은순':
                    currentSort = SortType.COMMENTS;
                    break;
                case '좋아요순':
                    currentSort = SortType.LIKES;
                    break;
                default:
                    currentSort = SortType.LATEST;
            }


            // 페이지 초기화 및 URL 업데이트
            currentPage = 0;
            updateURLFromState();
            fetchAndRenderPosts();
        });
    });
}

/**
 * 검색 기능 초기화 함수
 */
function initSearchFunctionality() {
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');

    if (!searchBtn || !searchInput) return;

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

        if (searchTerm) {
            currentSearch = searchTerm;

            // 페이지 초기화 및 URL 업데이트
            currentPage = 0;
            updateURLFromState();
            fetchAndRenderPosts();
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
    document.addEventListener('click', function (e) {
        // 게시글 클릭 처리
        const postItem = e.target.closest('.post-item');
        if (postItem) {
            // 좋아요나 댓글 버튼 클릭 시에는 이벤트 무시
            if (e.target.closest('.like-count') || e.target.closest('.comment-count')) {
                return;
            }

            // 게시글 상세 페이지로 이동
            const postId = postItem.dataset.postId;
            navigateToPostDetail(postId);
        }

        // 좋아요 버튼 클릭 처리
        const likeBtn = e.target.closest('.like-count');
        if (likeBtn) {
            e.preventDefault();
            const postId = likeBtn.closest('.post-item').dataset.postId;
            toggleLike(postId, likeBtn);
        }
    });
}

function getAuthToken() {
    // 실제 구현에서는 로컬 스토리지나 쿠키에서 토큰을 가져옴
    return localStorage.getItem('accessToken') || '';
}

/**
 * 게시글 상세 페이지로 이동하는 함수
 * @param {string} postId - 게시글 ID
 */
function navigateToPostDetail(postId) {

    // 실제 애플리케이션에서는 해당 게시글의 상세 페이지로 이동
    const url = `/community/post/${postId}`;

    window.location.href = url;
}

/**
 * 좋아요 토글 함수
 * @param {string} postId - 게시글 ID
 * @param {HTMLElement} likeBtn - 좋아요 버튼 요소
 */
async function toggleLike(postId, likeBtn) {
    try {
        // 로그인 상태 확인
        if (!checkUserLoggedIn()) {
            const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
            loginModal.show();
            return;
        }

        // API 호출 (실제 구현 시 수정 필요)
        const isLiked = likeBtn.classList.contains('liked');
        const method = isLiked ? 'DELETE' : 'POST';
        const url = `/api/v1/posts/${postId}/likes/toggle`;

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('좋아요 처리 실패');
        }

        // UI 업데이트
        let likeCount = parseInt(likeBtn.textContent);
        if (isLiked) {
            likeCount--;
            likeBtn.classList.remove('liked');
        } else {
            likeCount++;
            likeBtn.classList.add('liked');
        }
        likeBtn.textContent = likeCount;

    } catch (error) {
        console.error('좋아요 처리 중 오류 발생:', error);
        alert('좋아요 처리에 실패했습니다. 다시 시도해주세요.');
    }
}

/**
 * 게시글 렌더링 함수
 */
function renderPosts(posts) {
    const postContainer = document.querySelector('.post-container');
    if (!postContainer) return;

    // 컨테이너 비우기
    postContainer.innerHTML = '';

    if (!posts || posts.length === 0) {
        // 게시글이 없을 경우 메시지 표시
        postContainer.innerHTML = `
            <div class="no-posts-message">
                <p>게시글이 없습니다.</p>
            </div>
        `;
        return;
    }

    // 게시글 렌더링
    posts.forEach(post => {
        const postElement = createPostElement(post);
        postContainer.appendChild(postElement);
    });
}

/**
 * 게시글 요소 생성 함수
 * @param {Object} post - 게시글 객체f
 * @returns {HTMLElement} - 게시글 HTML 요소
 */
function createPostElement(post) {
    const postElement = document.createElement('div');
    postElement.className = 'post-item';
    postElement.dataset.postId = post.postId;

    // 게시글 작성 시간 포맷팅
    const postDate = formatDate(post.createdAt);

    // 게시글 카테고리 변환
    let postCategoryText = '';
    switch (post.postCategory) {
        case 'FREE':
            postCategoryText = '자유게시판';
            break;
        case 'REVIEW':
            postCategoryText = '펫 도구 후기';
            break;
        case 'QNA':
            postCategoryText = '질문하기';
            break;
        case 'MYPET':
            postCategoryText = '자랑하기';
            break;
        default:
            postCategoryText = post.postCategory;
    }

    // 펫 카테고리 변환
    let petCategoryText = '';
    let petCategoryClass = '';
    switch (post.petCategory) {
        case 'DOG':
            petCategoryText = '강아지';
            petCategoryClass = 'pet-dog';
            break;
        case 'CAT':
            petCategoryText = '고양이';
            petCategoryClass = 'pet-cat';
            break;
        case 'ETC':
            petCategoryText = '기타';
            petCategoryClass = 'pet-etc';
            break;
        default:
            petCategoryText = '';
            petCategoryClass = '';
    }

    // 펫 카테고리 태그 HTML (카테고리가 있을 경우에만 표시)
    let petCategoryHTML = '';
    if (petCategoryText) {
        petCategoryHTML = `<span class="pet-category-tag ${petCategoryClass}">${petCategoryText}</span>`;
    }

    let imagesHTML = '';
    if (post.imageUrls && post.imageUrls.length > 0) {
        imagesHTML = `
            <div class="post-images">
                ${post.imageUrls.map(url => `<img src="${url}" alt="게시글 이미지" class="post-image">`).join('')}
            </div>
        `;
    }

    let videoHTML = '';
    if (post.videoUrl) {
        videoHTML = `
            <div class="post-video">
                <video src="${post.videoUrl}" controls class="post-video-player"></video>
            </div>
        `;
    }

    postElement.innerHTML = `
        <div class="post-header">
            <div class="user-info">
                <img src="${post.profileImageUrl || './images/default-avatar.jpg'}" alt="${post.userNickname}" class="user-avatar">
                <div class="post-meta">
                    <div class="user-name">
                        ${post.userNickname} 
                        <span class="board-tag">${postCategoryText}</span>
                        ${petCategoryHTML}
                    </div>
                    <div class="post-date">${postDate}</div>
                </div>
            </div>
        </div>
        <div class="post-title">
            <h3>${post.title}</h3>
        </div>
        <div class="post-content">
            <p>${post.content}</p>
        </div>
        <div class="post-footer">
            <div class="post-tag-list">
                ${(post.tags || []).map(tag => `<span class="board-tag">#${tag}</span>`).join('')}
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
 * @param {number} totalPages - 총 페이지 수
 */
function renderPagination(page, totalPages) {
    const paginationContainer = document.querySelector('.pagination');
    if (!paginationContainer) return;

    // 컨테이너 비우기
    paginationContainer.innerHTML = '';

    // API는 0부터 시작하는 페이지 번호를 사용하지만, UI는 1부터 시작하는 페이지 번호를 표시
    const displayPageNo = page + 1;

    // 이전 페이지 버튼
    const prevLi = document.createElement('li');
    prevLi.className = 'page-item' + (page === 0 ? ' disabled' : '');
    prevLi.innerHTML = `
        <a class="page-link" href="#" aria-label="Previous">
            <span aria-hidden="true">&laquo;</span>
        </a>
    `;
    paginationContainer.appendChild(prevLi);

    // 이전 페이지 버튼 이벤트
    if (page > 0) {
        prevLi.addEventListener('click', function (e) {
            e.preventDefault();
            currentPage--;
            updateURLFromState(false); // replaceState 사용
            fetchAndRenderPosts();
            window.scrollTo(0, 0);
        });
    }

    // 페이지 번호 버튼 생성
    // 화면에 표시할 페이지 번호의 범위 계산 (최대 5개)
    let startPage = Math.max(0, Math.min(page - 2, totalPages - 5));
    let endPage = Math.min(startPage + 4, totalPages - 1);

    // 페이지 수가 적으면 모든 페이지를 표시
    if (totalPages <= 5) {
        startPage = 0;
        endPage = totalPages - 1;
    }

    // 페이지 번호 버튼 생성
    for (let i = startPage; i <= endPage; i++) {
        const pageLi = document.createElement('li');
        pageLi.className = 'page-item' + (i === page ? ' active' : '');
        pageLi.innerHTML = `<a class="page-link" href="#">${i + 1}</a>`;
        paginationContainer.appendChild(pageLi);

        // 페이지 번호 버튼 이벤트
        pageLi.addEventListener('click', function (e) {
            e.preventDefault();
            if (i !== page) {
                currentPage = i;
                updateURLFromState(false);
                fetchAndRenderPosts();
                window.scrollTo(0, 0);
            }
        });
    }

    // 다음 페이지 버튼
    const nextLi = document.createElement('li');
    nextLi.className = 'page-item' + (page >= totalPages - 1 ? ' disabled' : '');
    nextLi.innerHTML = `
        <a class="page-link" href="#" aria-label="Next">
            <span aria-hidden="true">&raquo;</span>
        </a>
    `;
    paginationContainer.appendChild(nextLi);

    // 다음 페이지 버튼 이벤트
    if (page < totalPages - 1) {
        nextLi.addEventListener('click', function (e) {
            e.preventDefault();
            currentPage++;
            updateURLFromState(false);
            fetchAndRenderPosts();
            window.scrollTo(0, 0);
        });
    }
}

/**
 * 사용자 로그인 상태 확인 함수 (임시)
 * @returns {boolean} - 로그인 여부
 */
function checkUserLoggedIn() {
    // 실제 구현에서는 토큰이나 세션을 확인
    return localStorage.getItem('accessToken') !== null;
}