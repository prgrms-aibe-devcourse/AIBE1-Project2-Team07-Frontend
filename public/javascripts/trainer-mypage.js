const postCategoryMap = {
    'FREE': '자유',
    'QNA': '질문',
    'TOOL': '펫 도구',
    'MYPET': '자랑하기'
};

const petCategoryMap = {
    'DOG': '강아지',
    'CAT': '고양이',
    'ETC': '기타'
};

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

// 토큰 검증 함수 (공통 함수로 추출)
function validateToken() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        throw new Error('로그인이 필요한 서비스입니다.');
    }
    return token;
}

// API 요청 함수 (공통 함수로 추출)
async function apiRequest(url, method = 'GET', body = null, isFormData = false) {
    try {
        const token = validateToken();
        const options = {
            method: method,
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`
            }
        };

        if (body) {
            if (!isFormData) {
                options.headers['Content-Type'] = 'application/json';
                options.body = JSON.stringify(body);
            } else {
                // FormData의 경우 Content-Type 헤더를 설정하지 않음 (브라우저가 자동으로 설정)
                options.body = body;
            }
        }

        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error(`API 요청 오류 (${response.status}): ${response.statusText}`);
        }

        // 응답이 비어있는지 확인
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        } else {
            return null;
        }
    } catch (error) {
        console.error('API 요청 중 오류 발생:', error);
        throw error;
    }
}

// 에러 표시 함수 (공통 함수로 추출)
function showError(element, message, isAlert = false) {
    if (element) {
        element.innerHTML = `<p class="error-message">${message}</p>`;
    }

    if (isAlert) {
        alert(message);
    }

    console.error(message);
}

// DOM이 완전히 로드된 후 실행
document.addEventListener('DOMContentLoaded', async function () {
    try {
        // 토큰 확인
        const token = localStorage.getItem('accessToken');

        const urlParams = new URLSearchParams(window.location.search);
        const tabParam = urlParams.get('tab');
        if (tabParam && ['profile', 'mypost', 'review', 'liked', 'advice'].includes(tabParam)) {
            currentTab = tabParam;
        }

        // 탭 이벤트 리스너 설정
        document.getElementById('tab-profile')?.addEventListener('click', async function (e) {
            e.preventDefault();
            await switchTab('profile');
        });

        // 탭 이벤트 리스너 설정
        document.getElementById('tab-profile')?.addEventListener('click', async function (e) {
            e.preventDefault();
            await switchTab('profile');
        });

        document.getElementById('tab-mypost')?.addEventListener('click', async function (e) {
            e.preventDefault();
            await switchTab('mypost');
        });

        document.getElementById('tab-review')?.addEventListener('click', async function (e) {
            e.preventDefault();
            await switchTab('review');
        });

        document.getElementById('tab-liked')?.addEventListener('click', async function (e) {
            e.preventDefault();
            await switchTab('liked');
        });

        document.getElementById('tab-advice')?.addEventListener('click', async function (e) {
            e.preventDefault();
            await switchTab('advice');
        });

        // 검색 기능 리스너 추가
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-button');

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
        await switchTab(currentTab || 'profile');

        window.addEventListener('popstate', async function(event) {
            if (event.state && event.state.tab) {
                await switchTab(event.state.tab, false); // URL 업데이트 없이 탭 전환
            } else {
                await switchTab('profile', false);
            }
        });
    } catch (error) {
        console.error('초기화 중 오류 발생:', error);
        alert('페이지 초기화 중 오류가 발생했습니다. 페이지를 새로고침해 주세요.');
    }
});

// 탭 전환 함수
async function switchTab(tabName, updateUrl = true) {
    try {
        // 현재 탭과 새 탭이 같은 경우, 페이지만 유지하기
        if (tabName !== currentTab) {
            tabStates[tabName].currentPage = 1;
            // 검색어도 초기화하고 싶으면 여기서:
            const searchInput = document.getElementById('search-input');
            if (searchInput) searchInput.value = '';
        }

        // 현재 탭 업데이트
        currentTab = tabName;

        if (updateUrl) {
            const url = new URL(window.location);
            url.searchParams.set('tab', tabName);
            window.history.pushState({tab: tabName}, '', url);
        }

        // 검색창 및 UI 관리
        const searchContainer = document.querySelector('.search-bar');
        const paginationContainer = document.querySelector('.pagination-container');

        if (!searchContainer || !paginationContainer) {
            console.warn('검색창 또는 페이지네이션 컨테이너를 찾을 수 없습니다.');
        } else {
            // 탭에 따른 UI 설정
            if (tabName === 'profile') {
                searchContainer.style.display = 'none';
                paginationContainer.style.display = 'none';
            } else {
                searchContainer.style.display = 'flex';
                paginationContainer.style.display = 'flex';
                const searchInput = document.getElementById('search-input');
                if (searchInput) searchInput.value = '';
            }
        }

        // 모든 탭 링크에서 active 클래스 제거
        document.querySelectorAll('.tab-menu .nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // 선택된 탭에 active 클래스 추가
        const tabElement = document.getElementById(`tab-${tabName}`);
        if (tabElement) {
            tabElement.classList.add('active');
        } else {
            console.warn(`탭 요소를 찾을 수 없습니다: #tab-${tabName}`);
        }

        // 탭에 따라 컨텐츠 표시
        try {
            switch (tabName) {
                case 'profile':
                    await showProfile();
                    break;
                case 'mypost':
                    await showMyPosts();
                    break;
                case 'review':
                    await showMyReviews();
                    break;
                case 'liked':
                    await showLikedPosts();
                    break;
                case 'advice':
                    await showMyAdvices();
                    break;
                default:
                    console.warn(`알 수 없는 탭: ${tabName}`);
                    await showProfile(); // 기본값으로 프로필 보여주기
            }
        } catch (error) {
            console.error(`${tabName} 탭 로딩 중 오류 발생:`, error);
            // 각 탭별 오류 처리는 해당 함수 내에서 수행
            showError(document.getElementById('post-container'), `${tabName} 탭 로딩 중 오류가 발생했습니다.`);
        }
    } catch (error) {
        console.error('탭 전환 중 오류 발생:', error);
        alert('페이지 로딩 중 오류가 발생했습니다. 다시 시도해주세요.');
    }

}

// 프로필 표시 함수
async function showProfile() {
    try {
        // UI 초기화
        document.getElementById('profile-section').style.display = 'block';
        document.getElementById('post-container').style.display = 'none';
        document.getElementById('review-section').style.display = 'none';

        const paginationContainer = document.querySelector('.pagination-container');
        if (paginationContainer) {
            paginationContainer.style.display = 'none';
        }

        let userData;
        let certifications = [];

        try {
            userData = await apiRequest('https://dev.tuituiworld.store/api/v1/users/me');
            // certifications = await apiRequest('https://dev.tuituiworld.store/api/v1/certifications/users/me');
        } catch (error) {
            if (error.message.includes('로그인이 필요한 서비스입니다')) {
                document.getElementById('profile-section').innerHTML = '<p class="no-results">로그인이 필요한 서비스입니다.</p>';
                return;
            }
            throw error; // 다른 오류는 상위 catch 블록으로 전달
        }

        // 응답 데이터 유효성 검사
        if (!userData) {
            throw new Error('사용자 정보를 불러올 수 없습니다.');
        }

        // 프로필 데이터 렌더링
        const profileHTML = `
            <div class="profile-info">
                <div class="d-flex flex-column align-items-center">
                  <img src="${userData.profileImageUrl || './images/profile-placeholder.jpg'}" alt="프로필 이미지" class="rounded-circle profile-image">
                  <div class="profile-image-overlay">
                    <img src="images/icons/camera.svg" alt="사진 아이콘" class="camera-icon">
                  </div>
                </div>
                <div class="profile-details align-self-center ms-4">
                    <div class="info-row d-flex align-items-center mb-3">
                    <label class="label col-form-label me-3">이름</label>
                    <input
                      type="text"
                      name="name"
                      class="form-control form-control-sm"
                      value="${userData.name || ''}"
                    >
                  </div>
                  <div class="info-row d-flex align-items-center mb-3">
                    <label class="label col-form-label me-3">닉네임</label>
                    <input
                      type="text"
                      name="nickname"
                      class="form-control form-control-sm"
                      value="${userData.nickname || ''}"
                    >
                  </div>
                  <div class="info-row d-flex align-items-center mb-3">
                    <label class="label col-form-label me-3">이메일</label>
                    <input
                      type="email"
                      name="email"
                      class="form-control form-control-sm"
                      value="${userData.email || ''}"
                      ${userData.email ? 'readonly' : ''}
                    >
                  </div>
                </div>
            </div>
            <button class="btn btn-warning mt-3 mx-auto d-block" id="profile-edit-btn">수정하기</button>
            <div class="cert-images">
                <h5>자격증</h5>
                <div class="cert-container">
                    ${certifications && certifications.length > 0 ?
            certifications.map((cert, index) => `
                        <div class="cert-item">
                            <img src="${cert.imageUrl || 'https://placehold.co/210x297'}" alt="${cert.name}">
                            <div class="cert-label">${cert.name || '자격증 이름 없음'}</div>
                        </div>
                    `).join('') :
            '<p style="display: flex; align-items: center; justify-content: center">등록된 자격증이 없습니다.</p>'}
                    <div class="cert-add">
                        <button type="button" class="btn edit-button" id="add-cert-btn">+</button>
                    </div>
                </div>
                
            </div>
        `;

        document.getElementById('profile-section').innerHTML = profileHTML;

        // 이벤트 리스너 연결
        attachProfileEventListeners();

    } catch (error) {
        console.error('프로필 불러오기 중 오류 발생:', error);
        showError(document.getElementById('profile-section'), '프로필 정보를 불러오는 중 오류가 발생했습니다.', true);
    }
}

// 프로필 관련 이벤트 리스너 연결
function attachProfileEventListeners() {
    // 프로필 이미지 및 오버레이에 클릭 핸들러 연결
    const imgEl = document.querySelector('#profile-section .profile-image');
    const overlayEl = document.querySelector('#profile-section .profile-image-overlay');

    if (imgEl && overlayEl) {
        [imgEl, overlayEl].forEach(el => {
            el.style.cursor = 'pointer';
            el.addEventListener('click', updateProfileImage);
        });
    }

    // 자격증 추가 버튼 이벤트 연결
    const addCertBtn = document.getElementById('add-cert-btn');
    if (addCertBtn) {
        addCertBtn.addEventListener('click', function() {
            try {
                const modalElement = document.getElementById('trainerApplicationModal');
                if (!modalElement) {
                    throw new Error('자격증 등록 모달을 찾을 수 없습니다.');
                }
                const modal = new bootstrap.Modal(modalElement);
                modal.show();
            } catch (error) {
                console.error('자격증 모달 표시 중 오류 발생:', error);
                alert('자격증 등록 화면을 표시할 수 없습니다. 페이지를 새로고침해 주세요.');
            }
        });
    }

    // 프로필 수정 버튼 이벤트 연결
    const editProfileBtn = document.getElementById('profile-edit-btn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', async function() {
            try {
                await updateProfileData();
            } catch (error) {
                console.error('프로필 수정 중 오류 발생:', error);
                alert('프로필 수정 중 오류가 발생했습니다: ' + error.message);
            }
        });
    }
}

// 내가 쓴 게시글 표시 함수
async function showMyPosts(filteredPosts = null) {
    try {
        let postData;

        // UI 초기화
        document.getElementById('profile-section').style.display = 'none';
        document.getElementById('post-container').style.display = 'block';
        document.getElementById('review-section').style.display = 'none';

        const paginationContainer = document.querySelector('.pagination-container');
        if (paginationContainer) {
            paginationContainer.style.display = 'flex';
        }

        // 만약 필터링된 데이터가 있으면 그것을 사용하고, 없으면 API 호출
        if (filteredPosts) {
            postData = filteredPosts;
        } else {
            try {
                postData = await apiRequest('https://dev.tuituiworld.store/api/v1/posts/users/me');
            } catch (error) {
                if (error.message.includes('로그인이 필요한 서비스입니다')) {
                    document.getElementById('post-container').innerHTML = '<p class="no-results">로그인이 필요한 서비스입니다.</p>';
                    document.querySelector('.pagination').innerHTML = '';
                    return;
                }
                throw error;
            }
        }
        // 데이터 유효성 검증
        if (!postData || !Array.isArray(postData) || postData.length === 0) {
            document.getElementById('post-container').innerHTML = '<p class="no-results">게시글이 없습니다.</p>';
            document.querySelector('.pagination').innerHTML = '';
            return;
        }

        // 페이징 처리
        const startIndex = (tabStates.mypost.currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, postData.length);
        const currentPagePosts = postData.slice(startIndex, endIndex);

        // 게시글 렌더링
        const postsHTML = currentPagePosts.map(post => {
            try {
                // API 응답 구조에 맞게 필드 접근 (안전하게 속성 확인)
                const postCategory = post.postCategory ? (postCategoryMap[post.postCategory] || post.postCategory) : '카테고리 없음';
                const petCategory = post.petCategory ? (petCategoryMap[post.petCategory] || post.petCategory) : '';
                const imageUrl = post.imageUrls && post.imageUrls.length > 0 ? "check" : null;
                const createdAt = post.createdAt || '날짜 없음';
                const title = post.title || '제목 없음';
                const content = post.content || '내용 없음';
                const likeCount = post.likeCount !== undefined ? post.likeCount : 0;
                const commentCount = post.commentCount !== undefined ? post.commentCount : 0;

                // 태그 표시
                const tagsHtml = post.tags && post.tags.length > 0
                    ? `<div class="post-tags">${post.tags.map(tag => `<span class="tag">#${tag}</span>`).join(' ')}</div>`
                    : '';

                return `
                <div class="post-item" onclick="window.location.href='/community/post/${post.postId}';" style="cursor: pointer;">
                    <div class="post-info">
                        <div class="post-categories">
                            <span class="post-category">${postCategory}</span>
                            ${petCategory ? `<span class="pet-category">${petCategory}</span>` : ''}
                        </div>
                        <h4 class="post-title">${title}</h4>
                        <p class="post-content">${content}</p>
                        ${tagsHtml}
                        <div class="post-meta">
                            ${createdAt} &nbsp;&nbsp; 
                            <span class="like-count">♥ ${likeCount}</span> &nbsp;&nbsp; 
                            <span class="comment-count">💬 ${commentCount}</span>
                        </div>
                    </div>
                    <div class="post-image">
<!--                        <img src="${imageUrl}" alt="게시글 이미지">-->
                    </div>
                </div>
                `;
            } catch (error) {
                console.error('게시글 렌더링 중 오류 발생:', error, post);
                return `<div class="post-item error">게시글을 표시할 수 없습니다.</div>`;
            }
        }).join('');

        document.getElementById('post-container').innerHTML = postsHTML;

        // 페이지네이션 생성
        generatePagination(postData.length, 'mypost');
    } catch (error) {
        console.error('showMyPosts 함수 실행 중 오류 발생:', error);
        showError(document.getElementById('post-container'), '게시글을 불러오는 중 오류가 발생했습니다.', true);
        document.querySelector('.pagination').innerHTML = '';
    }
}

// 내가 받은 후기 표시 함수
async function showMyReviews(filteredReviews = null) {
    try {
        let reviewData;

        // UI 초기화
        document.getElementById('profile-section').style.display = 'none';
        document.getElementById('post-container').style.display = 'none';
        document.getElementById('review-section').style.display = 'block';

        const paginationContainer = document.querySelector('.pagination-container');
        if (paginationContainer) {
            paginationContainer.style.display = 'flex';
        }

        // 만약 필터링된 데이터가 있으면 그것을 사용하고, 없으면 API 호출
        if (filteredReviews) {
            reviewData = filteredReviews;
        } else {
            try {
                reviewData = await apiRequest('https://dev.tuituiworld.store/api/v1/reviews/users/trainer');
            } catch (error) {
                if (error.message.includes('로그인이 필요한 서비스입니다')) {
                    document.getElementById('review-section').innerHTML = '<p class="no-results">로그인이 필요한 서비스입니다.</p>';
                    document.querySelector('.pagination').innerHTML = '';
                    return;
                }
                throw error;
            }
        }

        // 데이터 유효성 검증
        if (!reviewData || !Array.isArray(reviewData) || reviewData.length === 0) {
            document.getElementById('review-section').innerHTML = '<p class="no-results">후기가 없습니다.</p>';
            document.querySelector('.pagination').innerHTML = '';
            return;
        }

        // 페이징 처리
        const startIndex = (tabStates.review.currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, reviewData.length);
        const currentPageReviews = reviewData.slice(startIndex, endIndex);

        // 후기 렌더링
        const reviewsHTML = `
            <ul id="review-container" class="review-list">
                ${currentPageReviews.map(review => {
            try {
                // API 응답 구조에 맞게 필드 접근 (안전하게 속성 확인)
                const profileImage = review.profileImageUrl || 'https://placedog.net/80/80?random=1';
                const nickname = review.userNickname;
                const rating = review.rating || 5; // API에 별점 필드가 있다면 해당 값 사용
                const content = review.comment || '내용 없음';
                const createdAt = review.createdAt || '날짜 없음';

                return `
                            <li class="review-item">
                                <div class="review-top">
                                    <div class="review-author-info">
                                        <div class="review-image">
                                            <img src="${profileImage}" alt="프로필 이미지" onerror="this.src='https://placehold.co/80x80?text=이미지+없음'">
                                        </div>
                                        <div class="author-details">
                                            <h5 class="author-name">작성자 : ${nickname}</h5>
                                            <div class="review-date">${createdAt}</div>
                                        </div>
                                    </div>
                                    <div class="review-rating">
                                        ${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}
                                    </div>
                                </div>
                                <div class="review-body">
                                    <p class="review-content">${content}</p>
                                </div>
                            </li>
                        `;
            } catch (error) {
                console.error('후기 렌더링 중 오류 발생:', error, review);
                return `<li class="review-item error">후기를 표시할 수 없습니다.</li>`;
            }
        }).join('')}
            </ul>
        `;

        document.getElementById('review-section').innerHTML = reviewsHTML;

        // 페이지네이션 생성
        generatePagination(reviewData.length, 'review');

    } catch (error) {
        console.error('showMyReviews 함수 실행 중 오류 발생:', error);
        showError(document.getElementById('review-section'), '후기를 불러오는 중 오류가 발생했습니다.', true);
        document.querySelector('.pagination').innerHTML = '';
    }
}

// 좋아요한 글 표시 함수
async function showLikedPosts(filteredLikes = null) {
    try {
        let postData;

        // UI 초기화
        document.getElementById('profile-section').style.display = 'none';
        document.getElementById('post-container').style.display = 'block';
        document.getElementById('review-section').style.display = 'none';

        const paginationContainer = document.querySelector('.pagination-container');
        if (paginationContainer) {
            paginationContainer.style.display = 'flex';
        }

        // 만약 필터링된 데이터가 있으면 그것을 사용하고, 없으면 API 호출
        if (filteredLikes) {
            postData = filteredLikes;
        } else {
            try {
                postData = await apiRequest('https://dev.tuituiworld.store/api/v1/posts/users/liked');
            } catch (error) {
                if (error.message.includes('로그인이 필요한 서비스입니다')) {
                    document.getElementById('post-container').innerHTML = '<p class="no-results">로그인이 필요한 서비스입니다.</p>';
                    document.querySelector('.pagination').innerHTML = '';
                    return;
                }
                throw error;
            }
        }

        // 데이터 유효성 검증
        if (!postData || !Array.isArray(postData) || postData.length === 0) {
            document.getElementById('post-container').innerHTML = '<p class="no-results">좋아요한 게시글이 없습니다.</p>';
            document.querySelector('.pagination').innerHTML = '';
            return;
        }

        // 페이징 처리
        const startIndex = (tabStates.liked.currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, postData.length);
        const currentPageLiked = postData.slice(startIndex, endIndex);

        // 게시글 렌더링
        const likedHTML = currentPageLiked.map(post => {
            try {
                // API 응답 구조에 맞게 필드 접근 (안전하게 속성 확인)
                const postCategory = post.postCategory ? (postCategoryMap[post.postCategory] || post.postCategory) : '카테고리 없음';
                const petCategory = post.petCategory ? (petCategoryMap[post.petCategory] || post.petCategory) : '';
                const imageUrl = post.imageUrls && post.imageUrls.length > 0 ? post.imageUrls[0] : 'https://placedog.net/80/80?random=1';
                const createdAt = post.createdAt || '날짜 없음';
                const title = post.title || '제목 없음';
                const content = post.content || '내용 없음';
                const likeCount = post.likeCount !== undefined ? post.likeCount : 0;
                const commentCount = post.commentCount !== undefined ? post.commentCount : 0;
                const author = post.userNickname || '작성자 미상';

                // 태그 표시
                const tagsHtml = post.tags && post.tags.length > 0
                    ? `<div class="post-tags">${post.tags.map(tag => `<span class="tag">#${tag}</span>`).join(' ')}</div>`
                    : '';

                return `
                <div class="post-item" onclick="window.location.href='/community/post/${post.postId}';" style="cursor: pointer;">
                    <div class="post-info">
                        <div class="post-categories">
                            <span class="post-category">${postCategory}</span>
                            ${petCategory ? `<span class="pet-category">${petCategory}</span>` : ''}
                        </div>
                        <h4 class="post-title">${title}</h4>
                        <p class="post-content">${content}</p>
                        ${tagsHtml}
                        <div class="post-meta">
                            <strong>${author}</strong> &nbsp;&nbsp;
                            ${createdAt} &nbsp;&nbsp;
                            <span class="like-count">♥ ${likeCount}</span> &nbsp;&nbsp;
                            <span class="comment-count">💬 ${commentCount}</span>
                        </div>
                    </div>
                    <div class="post-image">
<!--                        <img src="${imageUrl}" alt="게시글 이미지" onerror="this.src='https://placehold.co/200x200?text=이미지+없음'">-->
                    </div>
                </div>
                `;
            } catch (error) {
                console.error('좋아요한 게시글 렌더링 중 오류 발생:', error, post);
                return `<div class="post-item error">게시글을 표시할 수 없습니다.</div>`;
            }
        }).join('');

        document.getElementById('post-container').innerHTML = likedHTML;

        // 페이지네이션 생성
        generatePagination(postData.length, 'liked');

    } catch (error) {
        console.error('showLikedPosts 함수 실행 중 오류 발생:', error);
        showError(document.getElementById('post-container'), '좋아요한 게시글을 불러오는 중 오류가 발생했습니다.', true);
        document.querySelector('.pagination').innerHTML = '';
    }
}

// 상담신청내역 표시 함수
// 상담신청내역 표시 함수
async function showMyAdvices(filteredAdvices = null) {
    try {
        // 프로필 영역 숨기기
        document.getElementById('profile-section').style.display = 'none';
        // 게시글 목록 보이게 설정
        document.getElementById('post-container').style.display = 'block';
        // 리뷰 섹션 숨기기
        document.getElementById('review-section').style.display = 'none';

        // 페이지네이션 보이게 설정
        const paginationContainer = document.querySelector('.pagination-container');
        if (paginationContainer) {
            paginationContainer.style.display = 'flex';
        }

        let adviceData;

        // 만약 필터링된 데이터가 있으면 그것을 사용하고, 없으면 API 호출
        if (filteredAdvices) {
            adviceData = filteredAdvices;
        } else {
            try {
                const response = await apiRequest('https://dev.tuituiworld.store/api/v1/match/trainer');
                adviceData = response.data || [];

                // API 응답 데이터를 모달에서 사용하는 형식으로 변환
                adviceData = adviceData.map(item => ({
                    id: item.applyId,
                    author: item.userNickname || '익명 사용자',
                    date: item.createdAt || '날짜 미상',
                    postTitle: item.serviceType || '상담 유형 미상',
                    petType: item.petType || '반려동물 종류 미상',
                    petBreed: item.petBreed || '품종 미상',
                    petAge: item.petMonthAge ? `${Math.floor(item.petMonthAge/12)}년 ${item.petMonthAge%12}개월` : '나이 미상',
                    comment: item.content || '내용 미상',
                    status: item.applyStatus === 'PENDING' ? '상담 대기중' :
                        item.applyStatus === 'APPROVED' ? '상담 진행중' : '상담 완료',
                    chats: item.chats || [],
                    hasReviewed: item.hasReviewed,
                    applyStatus: item.applyStatus
                }));

                // 전역 변수로 저장 (모달에서 접근 가능하도록)
                window.adviceRequests = adviceData;
            } catch (error) {
                if (error.message.includes('로그인이 필요한 서비스입니다')) {
                    document.getElementById('post-container').innerHTML = '<p class="no-results">로그인이 필요한 서비스입니다.</p>';
                    document.querySelector('.pagination').innerHTML = '';
                    return;
                }
                throw error;
            }
        }

        // 데이터 유효성 검증
        if (!adviceData || !Array.isArray(adviceData) || adviceData.length === 0) {
            document.getElementById('post-container').innerHTML = '<p class="no-results">상담 신청 내역이 없습니다.</p>';
            document.querySelector('.pagination').innerHTML = '';
            return;
        }

        // 상태에 따라 정렬 (PENDING > APPROVED > REJECTED 순)
        if (!filteredAdvices) {
            adviceData = adviceData.sort((a, b) => {
                // 우선순위 점수 부여
                const getPriorityScore = (status) => {
                    if (status === 'PENDING') return 3;
                    if (status === 'APPROVED') return 2;
                    return 1; // 'REJECTED'
                };
                return getPriorityScore(b.applyStatus) - getPriorityScore(a.applyStatus);
            });
        }

        // 페이징 처리
        const startIndex = (tabStates.advice.currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, adviceData.length);
        const currentPageAdvices = adviceData.slice(startIndex, endIndex);

        // 상태 표시용 매핑 객체
        const statusMap = {
            'PENDING': '대기중',
            'APPROVED': '수락됨',
            'REJECTED': '거절됨'
        };

        const statusClass = {
            'PENDING': 'status-pending',
            'APPROVED': 'status-approved',
            'REJECTED': 'status-rejected'
        };

        // 상담신청내역 렌더링
        const advicesHTML = currentPageAdvices.map(advice => `
            <div class="advice-item">
                <div class="advice-header">
                    <div class="advice-title-section">
                        <h5 class="advice-title">${advice.postTitle || '상담 유형 미상'}</h5>
                        <span class="advice-status ${statusClass[advice.applyStatus] || ''}">${statusMap[advice.applyStatus] || '상태 미상'}</span>
                    </div>
                    <div class="advice-meta">
                        <span class="advice-author">신청자: ${advice.author || '사용자 미상'}</span>
                        <span class="advice-date">${advice.date || '날짜 미상'}</span>
                    </div>
                </div>
                <div class="advice-details">
                    <div class="pet-info">
                        <span class="pet-type">${advice.petType || '반려동물 종류 미상'}</span>
                        <span class="pet-breed">${advice.petBreed || '품종 미상'}</span>
                        <span class="pet-age">${advice.petAge || '나이 미상'}</span>
                    </div>
                </div>
                <div class="advice-body">
                    <p class="advice-content">${advice.comment || '내용 미상'}</p>
                </div>
                <div class="advice-actions">
                    <button data-id="${advice.id}" class="btn btn-primary btn-sm view-detail-btn">상세보기</button>
                    ${advice.applyStatus === 'PENDING' ? `
                    <button data-id="${advice.id}" class="btn btn-warning btn-sm accept-btn">수락하기</button>
                    <button data-id="${advice.id}" class="btn btn-outline-danger btn-sm reject-btn">거절하기</button>
                    ` : ''}
                    ${advice.applyStatus === 'APPROVED' && advice.hasReviewed ? `
                    <button data-id="${advice.id}" class="btn btn-outline-secondary btn-sm view-review-btn">작성된 리뷰 보기</button>
                    ` : ''}
                </div>
            </div>
        `).join('');

        document.getElementById('post-container').innerHTML = advicesHTML;

        // 페이지네이션 생성
        generatePagination(adviceData.length, 'advice');

        // 버튼 이벤트 연결
        attachAdviceEventListeners(adviceData);

    } catch (error) {
        console.error('showMyAdvices 함수 실행 중 오류 발생:', error);
        showError(document.getElementById('post-container'), '상담 내역을 불러오는 중 오류가 발생했습니다.', true);
        document.querySelector('.pagination').innerHTML = '';
    }
}

// 상담 상세 정보 표시 함수
function showAdviceDetail(adviceId, adviceData) {
    try {
        const advice = adviceData.find(item => item.applyId == adviceId);
        if (!advice) {
            throw new Error('해당 상담 정보를 찾을 수 없습니다.');
        }

        const modalElement = document.getElementById('detailModal');
        if (!modalElement) {
            throw new Error('상담 상세 모달을 찾을 수 없습니다.');
        }

        // 모달 데이터 설정
        modalElement.querySelector('.advice-author').textContent = `작성자: ${advice.userNickname || '미상'}`;
        modalElement.querySelector('.advice-date').textContent = `신청일: ${advice.createdAt || '미상'}`;
        modalElement.querySelector('.advice-title').textContent = advice.serviceType || '제목 미상';
        modalElement.querySelector('.pet-type').textContent = advice.petType || '반려동물 종류 미상';
        modalElement.querySelector('.pet-breed').textContent = advice.petBreed || '품종 미상';
        modalElement.querySelector('.pet-age').textContent = advice.petMonthAge ?
            `${Math.floor(advice.petMonthAge/12)}년 ${advice.petMonthAge%12}개월` : '나이 미상';
        modalElement.querySelector('.advice-content').textContent = advice.content || '내용 미상';

        // 상담 내역 표시
        const chatMessages = modalElement.querySelector('.chat-messages');
        chatMessages.innerHTML = '<p>채팅 내역이 없습니다.</p>';

        // 모달 표시
        const bsModal = new bootstrap.Modal(modalElement);
        bsModal.show();

        // 답변 등록 버튼 이벤트
        const replyBtn = modalElement.querySelector('.reply-btn');
        if (replyBtn) {
            replyBtn.onclick = async function() {
                const messageElement = modalElement.querySelector('#replyMessage');
                if (!messageElement) return;

                const message = messageElement.value.trim();
                if (!message) {
                    alert('답변 내용을 입력해주세요.');
                    return;
                }

                try {
                    await sendAdviceReply(adviceId, message);
                    alert('답변이 성공적으로 등록되었습니다.');
                    bsModal.hide();
                    showMyAdvices();
                } catch (error) {
                    alert('답변 등록 중 오류가 발생했습니다.');
                }
            };
        }

    } catch (error) {
        console.error('상담 상세 정보 표시 중 오류 발생:', error);
        alert('상담 정보를 불러오는 중 오류가 발생했습니다.');
    }
}

// 상담 수락 모달 표시
function showAcceptModal(adviceId, adviceData) {
    try {
        const advice = adviceData.find(item => item.applyId == adviceId);
        if (!advice) {
            throw new Error('해당 상담 정보를 찾을 수 없습니다.');
        }

        const modalElement = document.getElementById('acceptModal');
        if (!modalElement) {
            throw new Error('상담 수락 모달을 찾을 수 없습니다.');
        }

        // 모달 데이터 설정
        modalElement.querySelector('.advice-author').textContent = `작성자: ${advice.userNickname || '미상'}`;
        modalElement.querySelector('.advice-date').textContent = `신청일: ${advice.createdAt || '미상'}`;
        modalElement.querySelector('.advice-title').textContent = advice.serviceType || '제목 미상';
        modalElement.querySelector('.pet-type').textContent = advice.petType || '반려동물 종류 미상';
        modalElement.querySelector('.pet-breed').textContent = advice.petBreed || '품종 미상';
        modalElement.querySelector('.pet-age').textContent = advice.petMonthAge ?
            `${Math.floor(advice.petMonthAge/12)}년 ${advice.petMonthAge%12}개월` : '나이 미상';
        modalElement.querySelector('.advice-content').textContent = advice.content || '내용 미상';

        // 모달 표시
        const bsModal = new bootstrap.Modal(modalElement);
        bsModal.show();

        // 수락 버튼 이벤트
        const acceptBtn = modalElement.querySelector('.accept-confirm-btn');
        if (acceptBtn) {
            acceptBtn.onclick = async function() {
                const messageElement = modalElement.querySelector('#acceptMessage');
                if (!messageElement) return;

                const message = messageElement.value.trim();
                if (!message) {
                    alert('수락 메시지를 입력해주세요.');
                    return;
                }

                try {
                    await acceptAdvice(adviceId, message);
                    alert('상담이 성공적으로 수락되었습니다.');
                    bsModal.hide();
                    showMyAdvices();
                } catch (error) {
                    alert('상담 수락 중 오류가 발생했습니다.');
                }
            };
        }

    } catch (error) {
        console.error('상담 수락 모달 표시 중 오류 발생:', error);
        alert('상담 수락 화면을 불러오는 중 오류가 발생했습니다.');
    }
}

// 상담 거절 모달 표시
function showRejectModal(adviceId, adviceData) {
    try {
        const advice = adviceData.find(item => item.applyId == adviceId);
        if (!advice) {
            throw new Error('해당 상담 정보를 찾을 수 없습니다.');
        }

        const modalElement = document.getElementById('rejectModal');
        if (!modalElement) {
            throw new Error('상담 거절 모달을 찾을 수 없습니다.');
        }

        // 모달 데이터 설정
        modalElement.querySelector('.advice-author').textContent = `작성자: ${advice.userNickname || '미상'}`;
        modalElement.querySelector('.advice-date').textContent = `신청일: ${advice.createdAt || '미상'}`;
        modalElement.querySelector('.advice-title').textContent = advice.serviceType || '제목 미상';
        modalElement.querySelector('.pet-type').textContent = advice.petType || '반려동물 종류 미상';
        modalElement.querySelector('.pet-breed').textContent = advice.petBreed || '품종 미상';
        modalElement.querySelector('.pet-age').textContent = advice.petMonthAge ?
            `${Math.floor(advice.petMonthAge/12)}년 ${advice.petMonthAge%12}개월` : '나이 미상';
        modalElement.querySelector('.advice-content').textContent = advice.content || '내용 미상';

        // 모달 표시
        const bsModal = new bootstrap.Modal(modalElement);
        bsModal.show();

        // 거절 버튼 이벤트
        const rejectBtn = modalElement.querySelector('.reject-confirm-btn');
        if (rejectBtn) {
            rejectBtn.onclick = async function() {
                const reasonSelect = modalElement.querySelector('#rejectReason');
                const messageElement = modalElement.querySelector('#rejectMessage');
                if (!reasonSelect || !messageElement) return;

                const reason = reasonSelect.value;
                const message = messageElement.value.trim();

                if (!reason) {
                    alert('거절 사유를 선택해주세요.');
                    return;
                }

                if (!message) {
                    alert('거절 메시지를 입력해주세요.');
                    return;
                }

                try {
                    await rejectAdvice(adviceId, reason, message);
                    alert('상담이 성공적으로 거절되었습니다.');
                    bsModal.hide();
                    showMyAdvices();
                } catch (error) {
                    alert('상담 거절 중 오류가 발생했습니다.');
                }
            };
        }

    } catch (error) {
        console.error('상담 거절 모달 표시 중 오류 발생:', error);
        alert('상담 거절 화면을 불러오는 중 오류가 발생했습니다.');
    }
}

// 후기 조회 함수
async function viewAdviceReview(adviceId) {
    try {
        // 후기 정보 API 호출
        const reviewData = await apiRequest(`https://dev.tuituiworld.store/api/v1/reviews/advice/${adviceId}`);

        // 후기 정보 알림 (실제로는 모달로 표시하는 것이 좋음)
        alert(`별점: ${reviewData.rating}점\n내용: ${reviewData.content}`);

    } catch (error) {
        console.error('후기 조회 중 오류 발생:', error);
        alert('후기 정보를 불러오는 중 오류가 발생했습니다.');
    }
}

// API 함수들
async function acceptAdvice(adviceId, message) {
    return await apiRequest(`https://dev.tuituiworld.store/api/v1/match/trainer/${adviceId}/accept`, 'POST', {
        message: message
    });
}

async function rejectAdvice(adviceId, reason, message) {
    return await apiRequest(`https://dev.tuituiworld.store/api/v1/match/trainer/${adviceId}/reject`, 'POST', {
        reason: reason,
        message: message
    });
}

async function sendAdviceReply(adviceId, message) {
    return await apiRequest(`https://dev.tuituiworld.store/api/v1/match/trainer/${adviceId}/message`, 'POST', {
        content: message
    });
}

// 페이지네이션 생성 함수
function generatePagination(totalItems, tabName) {
    try {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        const currentTabState = tabStates[tabName];

        const paginationElement = document.querySelector('.pagination');
        if (!paginationElement) {
            console.error('페이지네이션 요소를 찾을 수 없습니다.');
            return;
        }

        if (totalPages <= 1) {
            paginationElement.innerHTML = '';
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
                <a class="page-link" href="javascript:void(0)" data-page="${currentTabState.currentPage + 1}">&raquo;</a>
            </li>
        `;

        paginationElement.innerHTML = paginationHTML;

        // 페이지 번호 클릭 이벤트 설정
        document.querySelectorAll('.pagination .page-link').forEach(link => {
            link.addEventListener('click', async function (e) {
                e.preventDefault();
                const targetPage = parseInt(this.getAttribute('data-page'));

                if (targetPage >= 1 && targetPage <= totalPages && targetPage !== currentTabState.currentPage) {
                    currentTabState.currentPage = targetPage;
                    await switchTab(tabName);
                }
            });
        });
    } catch (error) {
        console.error('페이지네이션 생성 중 오류 발생:', error);
        document.querySelector('.pagination').innerHTML = '';
    }
}

// 검색 함수
function searchContent(searchTerm) {
    try {
        if (!searchTerm) {
            // 검색어가 없으면 현재 탭 다시 로드
            switchTab(currentTab);
            return;
        }

        // 탭별 검색 로직
        switch (currentTab) {
            case 'mypost':
                // API로부터 데이터를 다시 로드하고 클라이언트 측에서 필터링
                // 실제 구현에서는 API에 검색 파라미터를 전달하는 것이 더 효율적
                apiRequest('https://dev.tuituiworld.store/api/v1/posts/users/me')
                    .then(posts => {
                        const filteredPosts = posts.filter(post =>
                            (post.title && post.title.toLowerCase().includes(searchTerm)) ||
                            (post.content && post.content.toLowerCase().includes(searchTerm)) ||
                            (post.userNickname && post.userNickname.toLowerCase().includes(searchTerm))
                        );
                        // 페이지 초기화
                        tabStates.mypost.currentPage = 1;
                        showMyPosts(filteredPosts);
                    })
                    .catch(error => {
                        console.error('게시글 검색 중 오류 발생:', error);
                        alert('게시글 검색 중 오류가 발생했습니다.');
                    });
                break;

            case 'review':
                apiRequest('https://dev.tuituiworld.store/api/v1/reviews/users/me')
                    .then(reviews => {
                        const filteredReviews = reviews.filter(review =>
                            (review.content && review.content.toLowerCase().includes(searchTerm)) ||
                            (review.nickname && review.nickname.toLowerCase().includes(searchTerm))
                        );
                        // 페이지 초기화
                        tabStates.review.currentPage = 1;
                        showMyReviews(filteredReviews);
                    })
                    .catch(error => {
                        console.error('후기 검색 중 오류 발생:', error);
                        alert('후기 검색 중 오류가 발생했습니다.');
                    });
                break;

            case 'liked':
                apiRequest('https://dev.tuituiworld.store/api/v1/posts/users/liked')
                    .then(posts => {
                        const filteredLikes = posts.filter(post =>
                            (post.title && post.title.toLowerCase().includes(searchTerm)) ||
                            (post.content && post.content.toLowerCase().includes(searchTerm)) ||
                            (post.userNickname && post.userNickname.toLowerCase().includes(searchTerm))
                        );
                        // 페이지 초기화
                        tabStates.liked.currentPage = 1;
                        showLikedPosts(filteredLikes);
                    })
                    .catch(error => {
                        console.error('좋아요 게시글 검색 중 오류 발생:', error);
                        alert('좋아요 게시글 검색 중 오류가 발생했습니다.');
                    });
                break;

            case 'advice':
                apiRequest('https://dev.tuituiworld.store/api/v1/consultations/trainers/me')
                    .then(advices => {
                        const filteredAdvices = advices.filter(advice =>
                            (advice.serviceType && advice.serviceType.toLowerCase().includes(searchTerm)) ||
                            (advice.content && advice.content.toLowerCase().includes(searchTerm)) ||
                            (advice.trainerName && advice.trainerName.toLowerCase().includes(searchTerm)) ||
                            (advice.petType && advice.petType.toLowerCase().includes(searchTerm)) ||
                            (advice.petBreed && advice.petBreed.toLowerCase().includes(searchTerm))
                        );
                        // 페이지 초기화
                        tabStates.advice.currentPage = 1;
                        showMyAdvices(filteredAdvices);
                    })
                    .catch(error => {
                        console.error('상담 내역 검색 중 오류 발생:', error);
                        alert('상담 내역 검색 중 오류가 발생했습니다.');
                    });
                break;

            case 'profile':
                // 프로필 탭에서는 검색 기능 미사용
                break;
        }
    } catch (error) {
        console.error('검색 중 오류 발생:', error);
        alert('검색 중 오류가 발생했습니다.');
    }
}

// 프로필 이미지 업데이트 함수
async function updateProfileImage() {
    try {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';

        document.body.appendChild(fileInput);
        fileInput.click();

        fileInput.addEventListener('change', async function() {
            try {
                const file = fileInput.files[0];
                if (!file) {
                    return; // 파일 선택이 취소된 경우
                }

                // 토큰 확인
                const token = validateToken();

                // 이미지 미리보기 설정
                const reader = new FileReader();
                reader.onload = function(e) {
                    const profileImage = document.querySelector('.profile-image');
                    if (profileImage) {
                        profileImage.src = e.target.result;
                    }
                };
                reader.readAsDataURL(file);

                // 이미지 업로드 API 호출
                const formData = new FormData();
                formData.append('file', file);

                const uploadResponse = await fetch('https://dev.tuituiworld.store/api/v1/users/updateImage', {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                if (!uploadResponse.ok) {

                }

            } catch (error) {
                console.error('프로필 이미지 업데이트 중 오류 발생:', error);
                alert('이미지 업로드 중 오류가 발생했습니다. 다시 시도해주세요.');
            } finally {
                // 임시 input 요소 제거
                document.body.removeChild(fileInput);
            }
        });
    } catch (error) {
        console.error('프로필 이미지 업데이트 중 오류 발생:', error);
        alert('이미지 업로드 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
}

// 프로필 데이터 업데이트 함수
async function updateProfileData() {
    try {
        const token = validateToken();

        const nameInput = document.querySelector('input[name="name"]');
        const nicknameInput = document.querySelector('input[name="nickname"]');

        if (!nicknameInput || !nameInput) {
            throw new Error('필수 입력 필드를 찾을 수 없습니다.');
        }

        const name = nameInput.value.trim();
        const nickname = nicknameInput.value.trim();

        if (!name) {
            alert('이름을 입력해주세요.');
            return;
        }
        if (!nickname) {
            alert('닉네임을 입력해주세요.');
            return;
        }

        // 프로필 업데이트 API 호출
        const response = await fetch('https://dev.tuituiworld.store/api/v1/users/update', {
            method: 'PUT',
            headers: {
                'accept': '*/*',
                'content-type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: name,
                nickname: nickname
            })
        });

        if (!response.ok) {
            throw new Error(`프로필 업데이트 실패: ${response.status}`);
        }

        alert('프로필이 성공적으로 업데이트되었습니다.');
        // 업데이트 후 프로필 다시 로드
        await showProfile();

    } catch (error) {
        console.error('프로필 업데이트 중 오류 발생:', error);
        alert('프로필 업데이트 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
}

// 자격증 제출 함수
async function submitCertification() {
    try {
        const token = validateToken();

        const certName = document.getElementById('certificateName')?.value.trim();
        const certOrg = document.getElementById('certificateOrg')?.value.trim();
        const certDate = document.getElementById('certificateDate')?.value;
        const certFile = document.getElementById('certificateImage')?.files[0];

        if (!certName || !certOrg || !certDate || !certFile) {
            alert('모든 필드를 채워주세요.');
            return;
        }

        // 자격증 이미지 업로드
        const formData = new FormData();
        formData.append('file', certFile);

        const uploadResponse = await fetch('https://dev.tuituiworld.store/api/v1/files/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!uploadResponse.ok) {
            throw new Error(`이미지 업로드 실패: ${uploadResponse.status}`);
        }

        const uploadResult = await uploadResponse.json();
        const imageUrl = uploadResult.url; // API 응답에서 이미지 URL 추출

        // 자격증 데이터 제출
        const certData = {
            name: certName,
            organization: certOrg,
            issueDate: certDate,
            imageUrl: imageUrl
        };

        const certResponse = await fetch('https://dev.tuituiworld.store/api/v1/certifications', {
            method: 'POST',
            headers: {
                'accept': '*/*',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(certData)
        });

        if (!certResponse.ok) {
            throw new Error(`자격증 등록 실패: ${certResponse.status}`);
        }

        alert('자격증이 성공적으로 등록되었습니다.');
        // 모달 닫기
        const modalElement = document.getElementById('trainerApplicationModal');
        if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) {
                modal.hide();
            }
        }
        // 프로필 다시 로드
        await showProfile();

    } catch (error) {
        console.error('자격증 등록 중 오류 발생:', error);
        alert('자격증 등록 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
}

// 상담 관련 이벤트 리스너 연결
function attachAdviceEventListeners(adviceData) {
    try {
        // 상세보기 버튼 이벤트
        document.querySelectorAll('.view-detail-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                try {
                    const adviceId = this.getAttribute('data-id');
                    if (!adviceId) {
                        throw new Error('상담 ID를 찾을 수 없습니다.');
                    }
                    showAdviceDetail(adviceId, adviceData);
                } catch (error) {
                    console.error('상담 상세 보기 버튼 클릭 처리 중 오류 발생:', error);
                    alert('상담 상세 정보를 불러올 수 없습니다.');
                }
            });
        });

        // 수락하기 버튼 이벤트
        document.querySelectorAll('.accept-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                try {
                    const adviceId = this.getAttribute('data-id');
                    if (!adviceId) {
                        throw new Error('상담 ID를 찾을 수 없습니다.');
                    }
                    showAcceptModal(adviceId, adviceData);
                } catch (error) {
                    console.error('상담 수락 버튼 클릭 처리 중 오류 발생:', error);
                    alert('상담 수락 화면을 불러올 수 없습니다.');
                }
            });
        });

        // 거절하기 버튼 이벤트
        document.querySelectorAll('.reject-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                try {
                    const adviceId = this.getAttribute('data-id');
                    if (!adviceId) {
                        throw new Error('상담 ID를 찾을 수 없습니다.');
                    }
                    showRejectModal(adviceId, adviceData);
                } catch (error) {
                    console.error('상담 거절 버튼 클릭 처리 중 오류 발생:', error);
                    alert('상담 거절 화면을 불러올 수 없습니다.');
                }
            });
        });
    } catch (error) {
        console.error('상담 이벤트 리스너 연결 중 오류 발생:', error);
    }
}