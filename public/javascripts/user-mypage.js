const API_BASE_URL = "http://localhost:8444";

// 로컬스토리지에서 user 정보
const userJSON = localStorage.getItem('user');
const accessToken = localStorage.getItem('accessToken');
if (!userJSON) {
    // 로그인 정보가 없으면 로그인 페이지로 이동
    window.location.href = '/';
}
const storedUser = JSON.parse(userJSON);
const imgUrl = storedUser.profileImageUrl && storedUser.profileImageUrl.trim()
    ? storedUser.profileImageUrl
    : 'https://placehold.co/180x180';
console.log(storedUser);

// 전역 변수로 현재 페이지와 페이지당 아이템 개수 설정
let currentPage = 1;
const itemsPerPage = 5;
// 현재 로드된 게시물을 전역 변수로 저장 (검색에 사용)
let currentPosts = [];
let searchQuery = '';

async function setupSearchButton() {
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('search-input');

    if (searchButton && searchInput) {
        searchButton.addEventListener('click', async function () {
            const query = searchInput.value.trim().toLowerCase();
            searchQuery = query;

            if (query) {
                const activeTab = document.querySelector('.tab-menu .nav-link.active').id;
                let searchResults = [];

                // 현재 로드된 게시물에서 검색
                if (currentPosts && currentPosts.length > 0) {
                    searchResults = currentPosts.filter(post =>
                        (post.title && post.title.toLowerCase().includes(query)) ||
                        (post.content && post.content.toLowerCase().includes(query))
                    );

                    currentPage = 1;
                    renderPosts(searchResults, currentPage);
                } else {
                    // 검색할 데이터가 없는 경우
                    alert('검색할 데이터가 없습니다. 먼저 게시물을 불러와주세요.');
                }

                if (searchResults.length === 0) {
                    alert(`'${query}'에 해당하는 결과가 없습니다.`);
                }
            } else {
                // 검색어가 비었을 경우 전체 목록 표시
                const activeTab = document.querySelector('.tab-menu .nav-link.active').id;

                if (activeTab === 'tab-mypost') {
                    const myPosts = await fetchMyPosts();
                    currentPosts = myPosts;
                    renderPosts(myPosts, 1);
                } else if (activeTab === 'tab-liked') {
                    const likedPosts = await fetchLikedPosts();
                    currentPosts = likedPosts;
                    renderPosts(likedPosts, 1);
                }
            }
        });

        // 엔터키로도 검색 가능
        searchInput.addEventListener('keyup', function (e) {
            if (e.key === 'Enter') {
                searchButton.click();
            }
        });
    }
}

// 프로필 정보 렌더링 함수
function renderProfile() {
    let profileSection = document.querySelector('.profile-section');

    // 모든 컨텐츠 영역 숨기기 (검색바도 여기서 숨겨짐)
    hideAllContent();

    if (!profileSection) {
        profileSection = document.createElement('div');
        profileSection.className = 'profile-section';

        profileSection.innerHTML = `
            <div class="profile-image-container">
                <img src="${imgUrl}" alt="프로필 이미지" class="profile-image">
                <div class="profile-image-overlay">
                    <img src="images/icons/camera.svg" alt="사진 아이콘" class="camera-icon">
                </div>
            </div>
            
            <div class="profile-info">
                <div class="profile-info-row">
                    <div class="profile-info-label">닉네임</div>
                    <div class="profile-info-value">
                        <input type="text" class="profile-input" name="nickname" value="${storedUser.nickname}">
                    </div>
                </div>
                <div class="profile-info-row">
                    <div class="profile-info-label">이름</div>
                    <div class="profile-info-value">
                        <input type="text" class="profile-input" name="name" value="${storedUser.name}">
                    </div>
                </div>
                <div class="profile-info-row">
                    <div class="profile-info-label">이메일</div>
                    <div class="profile-info-value">
                        <input type="email" class="profile-input" name="email" value="${storedUser.email}">
                    </div>
                </div>
            </div>
            
            <div class="profile-button-group">
                <button class="profile-button save-button">저장하기</button>
                <button class="profile-button edit-button">훈련사 신청</button>
            </div>
        `;

        const contentWrapper = document.querySelector('.content-wrapper');
        if (contentWrapper) {
            contentWrapper.appendChild(profileSection); // 위치에 상관없이 항상 추가
        }
    }

    // 프로필 섹션만 보이게 설정
    profileSection.style.display = 'block';
}

async function fetchMyPosts() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/v1/posts/users/me`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        if (!res.ok) throw new Error('내 게시물 조회 실패');
        const data = await res.json();
        console.log('내 게시물:', data);
        return data;
    } catch (err) {
        console.error(err);
        alert('내 게시물을 불러오는데 실패했습니다.');
        return [];
    }
}

async function fetchLikedPosts() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/v1/posts/users/liked`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        if (!res.ok) throw new Error('내가 좋아요한 게시물 조회 실패');
        const data = await res.json();
        console.log('좋아요한 게시물:', data);
        return data;
    } catch (err) {
        console.error(err);
        alert('내가 좋아요한 게시물을 불러오는데 실패했습니다.');
        return [];
    }
}

async function fetchMyAdvice() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/v1/match/user`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        if (!res.ok) throw new Error('내가 신청한 상담 조회 실패');
        const result = await res.json();
        console.log(result.data);
        return result.data || [];
    } catch (err) {
        console.error(err);
        alert('내가 신청한 상담을 불러오는데 실패했습니다.');
        return [];
    }
}

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

        // 이미지 URL 확인 및 기본값 설정
        const imageUrl = post.imageUrls && post.imageUrls.length > 0
            ? post.imageUrls[0]
            : 'https://placehold.co/300x200';

        postElement.innerHTML = `
            <div class="post-info">
                <h3 class="post-title">${post.postCategory || '카테고리 없음'}</h3>
                <h4>${post.title || '제목 없음'}</h4>
                <p class="post-content">${post.content || '내용 없음'}</p>
                <div class="post-meta">
                    좋아요 수: ${post.likeCount || 0} &nbsp;&nbsp; 댓글 수: ${post.commentCount || 0}
                </div>
            </div>
            <div class="post-image">
                <img src="${imageUrl}" alt="게시글 이미지">
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
        link.addEventListener('click', function (e) {
            e.preventDefault();

            const text = this.textContent;

            if (text === '«') {
                if (currentPage > 1) {
                    currentPage--;
                    renderPosts(currentPosts, currentPage);
                }
            } else if (text === '»') {
                const totalPages = Math.ceil(currentPosts.length / itemsPerPage);
                if (currentPage < totalPages) {
                    currentPage++;
                    renderPosts(currentPosts, currentPage);
                }
            } else {
                currentPage = parseInt(text);
                renderPosts(currentPosts, currentPage);
            }
        });
    });
}

// 모든 컨텐츠 영역 숨기기
function hideAllContent() {
    // 게시글 컨테이너 숨기기
    const postContainer = document.getElementById('post-container');
    if (postContainer) postContainer.style.display = 'none';

    // 리뷰 섹션 숨기기
    const reviewSection = document.getElementById('review-section');
    if (reviewSection) reviewSection.style.display = 'none';

    // 프로필 섹션 숨기기
    const profileSection = document.querySelector('.profile-section');
    if (profileSection) profileSection.style.display = 'none';

    // 검색바 숨기기
    const searchBar = document.querySelector('.search-bar');
    if (searchBar) searchBar.style.display = 'none';

    // 페이지네이션 숨기기
    const pagination = document.querySelector('.pagination');
    if (pagination && pagination.parentElement) pagination.parentElement.style.display = 'none';
}

// 게시물 관련 컨텐츠 표시 함수
function showPostContent() {
    // 1) 기존 콘텐츠 숨기기
    hideAllContent();

    // 2) 게시글 영역 표시
    const postContainer = document.getElementById('post-container');
    if (postContainer) postContainer.style.display = 'block';

    // 3) 페이지네이션 표시
    const pagination = document.querySelector('.pagination');
    if (pagination) pagination.parentElement.style.display = 'block';

    // 4) 검색바 표시 (flex로 복원)
    const searchBar = document.querySelector('.search-bar');
    if (searchBar) searchBar.style.display = 'flex';
}

// 탭 메뉴 활성화 처리 및 필터링
function setupTabEvents() {
    document.querySelectorAll('.tab-menu .nav-link').forEach(tab => {
        tab.addEventListener('click', async function (e) {
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

            // 검색어 초기화
            const searchInput = document.getElementById('search-input');
            if (searchInput) searchInput.value = '';
            searchQuery = '';

            // 필터링 적용
            switch (tabId) {
                case 'tab-profile':
                    renderProfile();
                    break;
                case 'tab-mypost':
                    showPostContent();
                    const myPosts = await fetchMyPosts();
                    currentPosts = myPosts; // 현재 로드된 게시물 저장
                    renderPosts(myPosts, currentPage);
                    break;
                case 'tab-liked':
                    showPostContent();
                    const likedPosts = await fetchLikedPosts();
                    currentPosts = likedPosts; // 현재 로드된 게시물 저장
                    renderPosts(likedPosts, currentPage);
                    break;
                case 'tab-advice':
                    const myAdvices = await fetchMyAdvice();
                    currentPosts = myAdvices; // 현재 로드된 게시물 저장
                    showUserAdvices(myAdvices, currentPage);
                    break;
                default:
                    showPostContent();
            }

            console.log(`탭 ${this.textContent} 클릭됨 - ${currentPosts.length}개 게시글 로드됨`);
        });
    });
}

// 프로필 버튼 이벤트 설정
function setupProfileButtons() {
    document.addEventListener('click', function (e) {
        // 수정하기 버튼
        if (e.target.classList.contains('save-button')) {
            alert('프로필 수정 기능은 백엔드 연동 후 사용 가능합니다.');
        }
    });
}

// 프로필 이미지 변경 이벤트 설정
function setupProfileImage() {
    document.addEventListener('click', function(e) {
        // 이미지나 오버레이를 클릭했을 때만 작동하도록
        if (e.target.classList.contains('profile-image') ||
            e.target.classList.contains('profile-image-overlay') ||
            e.target.classList.contains('camera-icon')) {

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
                        const profileImage = document.querySelector('.profile-image');
                        if (profileImage) {
                            profileImage.src = e.target.result;
                        }
                    };
                    reader.readAsDataURL(file);
                }
                // 사용 후 제거
                document.body.removeChild(fileInput);
            });
        }
    });
}

// 페이지 로드 시 초기화
window.addEventListener('DOMContentLoaded', () => {
    // 이벤트 리스너 설정
    setupTabEvents();
    setupProfileButtons();
    setupSearchButton();
    setupProfileImage();

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
    }
});