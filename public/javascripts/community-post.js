/**
 * 댓글 수정 폼 표시 함수
 * @param {string} commentId - 댓글 ID
 * @param {HTMLElement} commentElement - 댓글 요소
 */
function showEditCommentForm(commentId, commentElement) {
    // 기존 내용 가져오기
    const contentElement = commentElement.querySelector('.comment-text p') ||
        commentElement.querySelector('.reply-text p');

    if (!contentElement) return;

    const originalContent = contentElement.textContent;

    // 수정 폼 생성
    const editForm = document.createElement('div');
    editForm.className = 'edit-comment-form mt-2';
    editForm.innerHTML = `
        <textarea class="form-control mb-2" rows="2">${originalContent}</textarea>
        <div class="d-flex justify-content-end gap-2">
            <button class="btn btn-sm btn-secondary btn-cancel-edit">취소</button>
            <button class="btn btn-sm btn-warning btn-save-edit">저장</button>
        </div>
    `;

    // 내용 요소에 수정 폼 추가
    contentElement.parentElement.appendChild(editForm);
    contentElement.style.display = 'none';

    // 이벤트 리스너 추가
    const cancelBtn = editForm.querySelector('.btn-cancel-edit');
    const saveBtn = editForm.querySelector('.btn-save-edit');
    const textarea = editForm.querySelector('textarea');

    cancelBtn.addEventListener('click', function () {
        contentElement.style.display = 'block';
        editForm.remove();
    });

    saveBtn.addEventListener('click', function () {
        const newContent = textarea.value.trim();
        if (!newContent) {
            alert('댓글 내용을 입력해주세요.');
            return;
        }

        updateComment(commentId, newContent, contentElement, editForm);
    });

    // 포커스
    textarea.focus();
}

/**
 * 댓글 수정 함수
 * @param {string} commentId - 댓글 ID
 * @param {string} content - 새 댓글 내용
 */
async function submitComment(content, parentCommentId = null) {
    try {
        const url = `/api/v1/posts/${postId}/comments`;

        const commentData = {
            content: content,
            parentCommentId: parentCommentId
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(commentData)
        });

        if (!response.ok) {
            throw new Error('댓글 작성 실패');
        }

        // 응답 받기 (형식에 따라 조정 필요)
        const responseData = await response.json();

        // 댓글 입력창 초기화
        if (!parentCommentId) {
            const textarea = document.querySelector('.comment-form textarea');
            if (textarea) {
                textarea.value = '';
            }

            // 댓글 목록 새로고침
            fetchComments();
        } else {
            // 대댓글인 경우
            // 대댓글 폼 제거
            removeReplyForm();

            // 해당 댓글의 대댓글 목록 새로고침 또는 부분 업데이트
            // 원댓글에 첫 번째 대댓글이면 새로 만들고, 아니면 기존 대댓글 목록에 추가
            const commentElement = document.querySelector(`.comment[data-comment-id="${parentCommentId}"]`);
            if (commentElement) {
                // 새 대댓글 요소 생성
                const replyElement = createReplyElement(responseData);

                // 이 댓글의 마지막 대댓글 찾기
                let lastReplyElement = null;
                let nextElement = commentElement.nextElementSibling;

                while (nextElement && nextElement.classList.contains('reply')) {
                    lastReplyElement = nextElement;
                    nextElement = nextElement.nextElementSibling;
                }

                // 마지막 대댓글 뒤에 새 대댓글 추가
                if (lastReplyElement) {
                    lastReplyElement.after(replyElement);
                } else {
                    commentElement.after(replyElement);
                }
            }
        }

    } catch (error) {
        console.error('댓글 작성 중 오류 발생:', error);
        alert('댓글 작성에 실패했습니다. 다시 시도해주세요.');
    }
}

/**
 * 댓글 수정 함수
 * @param {string} commentId - 댓글 ID
 * @param {string} content - 새 댓글 내용
 * @param {HTMLElement} contentElement - 내용 요소
 * @param {HTMLElement} editForm - 수정 폼 요소
 */
async function updateComment(commentId, content, contentElement, editForm) {
    try {
        const url = `/api/v1/comments/${commentId}`;

        const commentData = {
            content: content
        };

        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(commentData)
        });

        if (!response.ok) {
            throw new Error('댓글 수정 실패');
        }

        // UI 업데이트
        contentElement.textContent = content;
        contentElement.style.display = 'block';
        editForm.remove();

        // 작성일 옆에 수정됨 표시 추가
        const dateElement = contentElement.closest('.comment') ?
            contentElement.closest('.comment').querySelector('.comment-date') :
            contentElement.closest('.reply').querySelector('.reply-date');

        if (dateElement && !dateElement.textContent.includes('(수정됨)')) {
            dateElement.textContent += ' (수정됨)';
        }

    } catch (error) {
        console.error('댓글 수정 중 오류 발생:', error);
        alert('댓글 수정에 실패했습니다. 다시 시도해주세요.');
    }
}

/**
 * 댓글 삭제 함수
 * @param {string} commentId - 댓글 ID
 */
async function deleteComment(commentId) {
    try {
        const url = `/api/v1/comments/${commentId}`;

        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('댓글 삭제 실패');
        }

        // 댓글 삭제 성공 시 UI 업데이트
        const commentElement = document.querySelector(`.comment[data-comment-id="${commentId}"]`);
        const replyElement = document.querySelector(`.reply[data-comment-id="${commentId}"]`);

        if (commentElement) {
            // 원댓글인 경우, 대댓글도 함께 삭제
            let nextElement = commentElement.nextElementSibling;

            while (nextElement && nextElement.classList.contains('reply')) {
                const temp = nextElement.nextElementSibling;
                nextElement.remove();
                nextElement = temp;
            }

            // 대댓글 더보기 버튼도 삭제
            const loadMoreBtn = document.querySelector(`.load-more-replies[data-comment-id="${commentId}"]`);
            if (loadMoreBtn) {
                loadMoreBtn.closest('.load-more-replies-container').remove();
            }

            commentElement.remove();
        } else if (replyElement) {
            // 대댓글인 경우
            replyElement.remove();
        }

    } catch (error) {
        console.error('댓글 삭제 중 오류 발생:', error);
        alert('댓글 삭제에 실패했습니다. 다시 시도해주세요.');
    }
}

/**
 * 댓글 관련 이벤트 초기화 함수
 */
function initCommentEvents() {
    // 이벤트 위임을 사용하여 동적으로 생성되는 요소에 이벤트 연결
    document.addEventListener('click', async function (e) {
        // 댓글 답글 버튼 클릭
        if (e.target.closest('.btn-reply')) {
            e.preventDefault();

            // 로그인 확인
            if (!await checkUserLoggedIn()) {
                showLoginModal();
                return;
            }

            // 댓글 ID 가져오기
            const commentElement = e.target.closest('.comment') || e.target.closest('.reply');
            const commentId = commentElement ? commentElement.dataset.commentId : null;

            if (commentId) {
                showReplyForm(commentId);
            }
        }

        // 댓글 좋아요 버튼 클릭
        if (e.target.closest('.btn-like')) {
            e.preventDefault();

            // 로그인 확인
            if (!await checkUserLoggedIn()) {
                showLoginModal();
                return;
            }

            // 댓글 ID 가져오기
            const commentElement = e.target.closest('.comment') || e.target.closest('.reply');
            const commentId = commentElement ? commentElement.dataset.commentId : null;

            if (commentId) {
                toggleCommentLike(commentId, e.target.closest('.btn-like'));
            }
        }

        // 댓글 수정 버튼 클릭
        if (e.target.closest('.btn-edit-comment')) {
            e.preventDefault();

            // 댓글 ID 가져오기
            const commentElement = e.target.closest('.comment') || e.target.closest('.reply');
            const commentId = commentElement ? commentElement.dataset.commentId : null;

            if (commentId) {
                showEditCommentForm(commentId, commentElement);
            }
        }

        // 댓글 삭제 버튼 클릭
        if (e.target.closest('.btn-delete-comment')) {
            e.preventDefault();

            // 댓글 ID 가져오기
            const commentElement = e.target.closest('.comment') || e.target.closest('.reply');
            const commentId = commentElement ? commentElement.dataset.commentId : null;

            if (commentId && confirm('댓글을 삭제하시겠습니까?')) {
                deleteComment(commentId);
            }
        }

        // 대댓글 더보기 버튼 클릭
        if (e.target.closest('.load-more-replies')) {
            e.preventDefault();

            const loadMoreBtn = e.target.closest('.load-more-replies');
            const commentId = loadMoreBtn.dataset.commentId;
            const cursor = loadMoreBtn.dataset.cursor;

            if (commentId) {
                const commentElement = document.querySelector(`.comment[data-comment-id="${commentId}"]`);
                fetchMoreReplies(commentId, commentElement, cursor);
            }
        }
    });
}// --- 전역 변수 ---
let postId = null;
let isLiked = false;
let commentNextCursor = null;
let hasMoreComments = false;
let loadingComments = false;

const API_BASE_URL = 'https://dev.tuituiworld.store/api/v1';

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function () {
    // 현재 URL에서 게시글 ID 추출
    postId = extractPostIdFromUrl();

    if (!postId) {
        showErrorMessage('게시글을 찾을 수 없습니다.');
        return;
    }

    // 초기화 함수들 호출
    initButtons();
    initCommentForm();
    initCommentEvents();
    initRandomAd();
    fetchPostDetail();
});

function initRandomAd() {
    const adImage1 = document.getElementById('adImage1');
    const adImage2 = document.getElementById('adImage2');

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
    const randomIndex2 = Math.floor(Math.random() * adImages.length);

    adImage1.src = adImages[randomIndex];
    adImage2.src = adImages[randomIndex2];
}

/**
 * URL에서 게시글 ID를 추출하는 함수
 * @returns {string|null} - 게시글 ID 또는 null
 */
function extractPostIdFromUrl() {
    // URL 형식: /community/post/{postId}
    const pathParts = window.location.pathname.split('/');
    const postIdIndex = pathParts.indexOf('post') + 1;

    if (pathParts.length > postIdIndex) {
        return pathParts[postIdIndex];
    }

    return null;
}

/**
 * 버튼 이벤트 초기화 함수
 */
function initButtons() {
    // 좋아요 버튼 이벤트
    const likeBtn = document.querySelector('.like-btn');
    if (likeBtn) {
        likeBtn.addEventListener('click', function () {
            toggleLike();
        });
    }

    // 수정 버튼 이벤트
    const editBtn = document.querySelector('.edit-btn');
    if (editBtn) {
        editBtn.addEventListener('click', async function (e) {
            e.preventDefault();

            // 로그인 확인
            if (!await checkUserLoggedIn()) {
                showLoginModal();
                return;
            }

            // 작성자 확인은 서버에서 처리
            window.location.href = `/community/edit/${postId}`;
        });
    }

    // 삭제 버튼 이벤트
    const deleteBtn = document.querySelector('.delete-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', async function (e) {
            e.preventDefault();

            // 로그인 확인
            if (!await checkUserLoggedIn()) {
                showLoginModal();
                return;
            }

            // 삭제 확인 대화상자
            if (confirm('정말로 이 게시글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
                deletePost();
            }
        });
    }
}

async function deletePost() {
    try {
        const url = `/api/v1/posts/${postId}`;

        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('게시글 삭제 실패');
        }

        // 삭제 성공 - 목록 페이지로 이동
        alert('게시글이 삭제되었습니다.');
        window.location.href = '/community';

    } catch (error) {
        console.error('게시글 삭제 중 오류 발생:', error);
        alert('게시글 삭제에 실패했습니다. 다시 시도해주세요.');
    }
}

/**
 * 댓글 폼 초기화 함수
 */
function initCommentForm() {
    const commentForm = document.querySelector('.comment-form');
    const submitBtn = commentForm?.querySelector('.btn-submit');
    const textarea = commentForm?.querySelector('textarea');

    if (submitBtn && textarea) {
        submitBtn.addEventListener('click', async function () {
            // 로그인 확인
            if (!await checkUserLoggedIn()) {
                showLoginModal();
                return;
            }

            const content = textarea.value.trim();
            if (!content) {
                alert('댓글 내용을 입력해주세요.');
                return;
            }

            submitComment(content);
        });
    }
}

/**
 * 게시글 상세 정보를 가져오는 함수
 */
async function fetchPostDetail() {
    try {
        const url = `/api/v1/posts/${postId}/open`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('게시글을 불러오는 데 실패했습니다.');
        }

        const post = await response.json();

        await renderPostDetail(post);
        await fetchComments();

    } catch (error) {
        console.error('게시글 상세 정보를 가져오는 중 오류 발생:', error);
        showErrorMessage('게시글을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
    }
}

/**
 * 댓글 목록을 가져오는 함수
 * @param {boolean} loadMore - 더 불러오기 여부
 */
async function fetchComments(loadMore = false) {
    try {
        if (loadingComments) return;
        loadingComments = true;

        let url = `/api/v1/posts/${postId}/comments/open`;

        // 더 불러오기인 경우 커서 추가
        if (loadMore && commentNextCursor) {
            url += `?cursor=${commentNextCursor}`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('댓글을 불러오는 데 실패했습니다.');
        }

        const commentsData = await response.json();


        // 다음 커서와 더 불러오기 여부 저장
        commentNextCursor = commentsData.nextCursor;
        hasMoreComments = commentsData.hasMore;

        renderComments(commentsData.comments, loadMore);

    } catch (error) {
        console.error('댓글을 가져오는 중 오류 발생:', error);
        // 댓글 로딩 실패 시 조용히 실패 (UI에 영향 최소화)
    } finally {
        loadingComments = false;
    }
}

/**
 * 특정 댓글의 대댓글을 더 불러오는 함수
 * @param {string} commentId - 댓글 ID
 * @param {Element} commentElement - 댓글 요소
 * @param {string} cursor - 다음 커서
 */
async function fetchMoreReplies(commentId, commentElement, cursor) {
    try {
        const loadMoreBtn = document.querySelector(`.load-more-replies[data-comment-id="${commentId}"]`);
        if (loadMoreBtn) {
            loadMoreBtn.disabled = true;
            loadMoreBtn.textContent = '로딩 중...';
        }

        const url = `/api/v1/comments/${commentId}/replies/open${cursor ? `?cursor=${cursor}` : ''}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('대댓글을 불러오는 데 실패했습니다.');
        }

        // CommentsResponseDTO 형식으로 응답이 온다고 가정
        const repliesData = await response.json();
        const replies = repliesData.comments; // 댓글 목록
        const nextCursor = repliesData.nextCursor; // 다음 페이지 커서
        const hasMore = repliesData.hasMore; // 더 불러올 데이터가 있는지 여부

        // 대댓글이 없는 경우
        if (!replies || replies.length === 0) {
            if (loadMoreBtn) {
                loadMoreBtn.closest('.load-more-replies-container').remove();
            }
            return;
        }

        // 대댓글 추가 렌더링
        if (replies && replies.length > 0) {
            // 마지막 대댓글 찾기
            let lastReplyElement = null;
            let nextElement = commentElement.nextElementSibling;

            while (nextElement && nextElement.classList.contains('reply')) {
                lastReplyElement = nextElement;
                nextElement = nextElement.nextElementSibling;
            }

            // 새 대댓글 추가
            replies.forEach(reply => {
                const replyElement = createReplyElement(reply);
                if (lastReplyElement) {
                    lastReplyElement.after(replyElement);
                    lastReplyElement = replyElement;
                } else {
                    commentElement.after(replyElement);
                    lastReplyElement = replyElement;
                }
            });

            // 더 불러올 대댓글이 있는 경우에만 더보기 버튼 추가
            if (hasMore && lastReplyElement) {
                const loadMoreBtnContainer = document.createElement('div');
                loadMoreBtnContainer.className = 'load-more-replies-container ps-5 mt-2';
                loadMoreBtnContainer.innerHTML = `
                    <button class="btn btn-sm btn-outline-secondary load-more-replies" 
                            data-comment-id="${commentId}" 
                            data-cursor="${nextCursor}">
                        대댓글 더보기
                    </button>
                `;
                lastReplyElement.after(loadMoreBtnContainer);
            }
        }

        // 기존 더보기 버튼 제거
        if (loadMoreBtn) {
            loadMoreBtn.closest('.load-more-replies-container').remove();
        }

    } catch (error) {
        console.error('대댓글을 더 불러오는 중 오류 발생:', error);
        alert('대댓글을 불러오지 못했습니다. 다시 시도해주세요.');

        // 버튼 상태 복구
        const loadMoreBtn = document.querySelector(`.load-more-replies[data-comment-id="${commentId}"]`);
        if (loadMoreBtn) {
            loadMoreBtn.disabled = false;
            loadMoreBtn.textContent = '대댓글 더보기';
        }
    }
}

/**
 * 게시글 상세 정보를 렌더링하는 함수
 * @param {Object} post - 게시글 객체
 */
async function renderPostDetail(post) {
    // 제목 업데이트
    const titleElement = document.querySelector('.post-title');
    if (titleElement) {
        titleElement.textContent = post.title || '제목 없음';
    }

    // 카테고리 업데이트
    const categoryElement = document.querySelector('.post-category');
    if (categoryElement) {
        let categoryText = '자유 게시판'; // 기본값

        switch (post.postCategory) {
            case 'FREE':
                categoryText = '자유 게시판';
                break;
            case 'REVIEW':
                categoryText = '펫 도구 후기';
                break;
            case 'QNA':
                categoryText = '질문하기';
                break;
            case 'MYPET':
                categoryText = '자랑하기';
                break;
        }

        categoryElement.textContent = categoryText;
    }

    const petCategoryElement = document.querySelector('.pet-category');
    if (petCategoryElement && post.petCategory) {
        let petCategoryText = '';
        let petCategoryColor = 'bg-warning'; // 기본 색상

        switch (post.petCategory) {
            case 'DOG':
                petCategoryText = '강아지';
                break;
            case 'CAT':
                petCategoryText = '고양이';
                break;
            case 'ETC':
                petCategoryText = '기타';
                break;
            default:
                petCategoryText = post.petCategory || '전체';
                break;
        }

        petCategoryElement.textContent = petCategoryText;
        petCategoryElement.className = `pet-category badge px-3 py-2 rounded-pill ${petCategoryColor}`;
    } else if (petCategoryElement) {
        // 펫 카테고리가 없는 경우 숨김
        petCategoryElement.style.display = 'none';
    }


    // 내용 업데이트
    const contentElement = document.querySelector('.post-content');
    if (contentElement) {
        // 기존 내용 초기화 (이미지는 제외)
        const paragraphElement = contentElement.querySelector('p');
        if (paragraphElement) {
            const contentWithLineBreaks = (post.content || '').replace(/\n/g, '<br>');
            paragraphElement.innerHTML = contentWithLineBreaks || '';
        }

        // 이미지 처리
        if (post.imageUrls && post.imageUrls.length > 0) {
            // 기존 이미지 제거
            const existingImages = contentElement.querySelectorAll('img');
            existingImages.forEach(img => img.remove());

            // 새 이미지 추가
            post.imageUrls.forEach(imageUrl => {
                const imgElement = document.createElement('img');
                imgElement.src = imageUrl;
                imgElement.alt = '게시글 이미지';
                imgElement.className = 'img-fluid my-3';
                contentElement.appendChild(imgElement);
            });
        }
    }

    const authorSection = document.querySelector('.d-flex.pb-3');
    const postFooter = document.querySelector('.post-footer');

    if (authorSection && postFooter && post.tags && post.tags.length > 0) {
        // 기존 태그 컨테이너 제거
        const existingTagContainer = document.querySelector('.post-tags-container');
        if (existingTagContainer) {
            existingTagContainer.remove();
        }

        // 새 태그 컨테이너 생성
        const tagContainer = document.createElement('div');
        tagContainer.className = 'post-tags-container';

        // 작성자 정보 섹션과 좋아요 버튼 사이에 삽입
        authorSection.parentNode.insertBefore(tagContainer, postFooter);

        // 새 태그 요소 추가
        post.tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'post-tag';

            // #기호와 태그 내용을 분리하여 스타일 적용
            const hashSpan = document.createElement('span');
            hashSpan.className = 'post-tag-hash';
            hashSpan.textContent = '#';

            tagElement.appendChild(hashSpan);
            tagElement.appendChild(document.createTextNode(tag));

            tagContainer.appendChild(tagElement);
        });
    }

    if (post.videoUrl && post.videoUrl.trim() !== '') {
        const videoElement = document.createElement('div');
        videoElement.className = 'video-container my-3';
        videoElement.innerHTML = `
        <video controls class="img-fluid" width="100%">
            <source src="${post.videoUrl}" type="video/mp4">
            귀하의 브라우저는 비디오 태그를 지원하지 않습니다.
        </video>
    `;
        contentElement.appendChild(videoElement);
    }

    const commentsTitleElement = document.querySelector('.comments-title');

    // 댓글 수 업데이트 (처음 불러올 때만)
    if (commentsTitleElement) {
        // API에서 총 댓글 수를 제공한다면 그 값을 사용하는 것이 좋습니다.
        // 현재는 화면에 보이는 댓글 수만 표시
        commentsTitleElement.textContent = `댓글 ${post.commentCount || 0}`;
    }

    // 작성자 정보 업데이트
    const authorNameElement = document.querySelector('.author-name');
    if (authorNameElement) {
        authorNameElement.textContent = post.userNickname || '익명';
    }

    await checkPostOwnership(post.userName);

    // 작성일 업데이트
    const dateElement = document.querySelector('.post-header .text-muted');
    if (dateElement) {
        dateElement.textContent = formatDate(post.createdAt) || '';
    }

    // 작성자 아바타 업데이트
    const avatarElement = document.querySelector('.author-avatar');
    if (avatarElement) {
        avatarElement.src = post.profileImageUrl || 'https://placehold.co/50x50?text=Author+Avatar';
    }

    // 좋아요 수 업데이트
    const likeCountElement = document.querySelector('.like-count');
    if (likeCountElement) {
        likeCountElement.textContent = post.likeCount || 0;
    }

    // 좋아요 상태 업데이트
    isLiked = post.hasLiked || false;
    updateLikeButtonState();
}

/**
 * 댓글 목록을 렌더링하는 함수
 * @param {Array} comments - 댓글 배열
 * @param {boolean} loadMore - 더 불러오기 여부
 */
function renderComments(comments, loadMore = false) {
    const commentListElement = document.querySelector('.comment-list');


    if (!commentListElement) return;

    // 처음 불러오는 경우에만 초기화
    if (!loadMore) {
        commentListElement.innerHTML = '';
    } else {
        // 더보기 버튼이 있으면 제거
        const loadMoreBtn = document.querySelector('.load-more-comments');
        if (loadMoreBtn) {
            loadMoreBtn.closest('.load-more-container').remove();
        }
    }

    if (!comments || comments.length === 0) {
        if (!loadMore) {
            commentListElement.innerHTML = '<div class="no-comments">아직 댓글이 없습니다.</div>';
        }
        return;
    }

    // 댓글 렌더링
    comments.forEach(comment => {
        // 원댓글만 처리 (대댓글은 별도로 처리)
        if (!comment.parentCommentId) {
            const commentElement = createCommentElement(comment);
            commentListElement.appendChild(commentElement);

            // 대댓글 렌더링
            if (comment.replies && comment.replies.length > 0) {
                comment.replies.forEach(reply => {
                    const replyElement = createReplyElement(reply);
                    commentListElement.appendChild(replyElement);
                });

                // 대댓글이 3개 이상이고 더 있을 가능성이 있으면 더보기 버튼 추가
                if (comment.replyCount > comment.replies.length) {
                    const loadMoreBtn = document.createElement('div');
                    loadMoreBtn.className = 'load-more-replies-container ps-5 mt-2';
                    loadMoreBtn.innerHTML = `
                        <button class="btn btn-sm btn-outline-secondary load-more-replies" 
                                data-comment-id="${comment.commentId}" 
                                data-cursor="${comment.replies[comment.replies.length - 1].commentId}">
                            대댓글 더보기 (${comment.replyCount - comment.replies.length}개)
                        </button>
                    `;
                    commentListElement.appendChild(loadMoreBtn);
                }
            }
        }
    });

    // 더 불러올 댓글이 있으면 더보기 버튼 추가
    if (hasMoreComments) {
        const loadMoreContainer = document.createElement('div');
        loadMoreContainer.className = 'load-more-container text-center my-4';
        loadMoreContainer.innerHTML = `
            <button class="btn btn-outline-secondary load-more-comments">
                댓글 더보기
            </button>
        `;
        commentListElement.appendChild(loadMoreContainer);

        // 더보기 버튼 이벤트 리스너
        const loadMoreBtn = loadMoreContainer.querySelector('.load-more-comments');
        loadMoreBtn.addEventListener('click', function () {
            fetchComments(true);
        });
    }
}

/**
 * 댓글 요소 생성 함수
 * @param {Object} comment - 댓글 객체
 * @returns {HTMLElement} - 댓글 HTML 요소
 */
function createCommentElement(comment) {
    const commentElement = document.createElement('div');
    commentElement.className = 'comment';
    commentElement.dataset.commentId = comment.commentId;

    // 댓글 시간 표시 (createdAt과 updatedAt이 다르면 수정됨 표시)
    const isEdited = comment.createdAt !== comment.updatedAt;
    const dateText = `${formatDate(comment.createdAt)}${isEdited ? ' (수정됨)' : ''}`;

    commentElement.innerHTML = `
        <div class="d-flex mb-3 pb-3 border-bottom">
            <img src="${comment.profileImageUrl || 'https://placehold.co/40x40?text=Avatar'}" alt="Commenter Avatar"
                 class="rounded-circle me-3 comment-avatar">
            <div class="comment-content-wrapper flex-grow-1">
                <div class="comment-meta d-flex justify-content-between align-items-center">
                    <span class="comment-author fw-bold">${comment.userNickname || '익명'}</span>
                    <span class="comment-date text-muted small">${dateText}</span>
                </div>
                <div class="comment-text mt-1">
                    <p class="mb-1">${comment.content}</p>
                </div>
                <div class="d-flex gap-3 mt-1">
                    <button class="btn btn-sm btn-warning btn-reply px-3 py-1 rounded-pill">답글
                    </button>
                    ${comment.userName === getUserName() ?
        `<button class="btn btn-sm btn-outline-secondary btn-edit-comment px-3 py-1 rounded-pill">수정</button>
                         <button class="btn btn-sm btn-outline-danger btn-delete-comment px-3 py-1 rounded-pill">삭제</button>`
        : ''}
                </div>
            </div>
        </div>
    `;

    return commentElement;
}

/**
 * 게시글 작성자 확인 함수
 * @param {string} postAuthor - 게시글 작성자 이름 또는 식별자
 */
async function checkPostOwnership(postAuthor) {
    const currentUser = getUserName(); // 현재 로그인한 사용자
    const postActionsElement = document.querySelector('.post-actions');

    // 로그인 상태이고 게시글 작성자와 현재 사용자가 일치하는 경우
    if (await checkUserLoggedIn() && currentUser === postAuthor) {
        if (postActionsElement) {
            postActionsElement.style.display = 'flex';
        }
    } else {
        if (postActionsElement) {
            postActionsElement.style.display = 'none';
        }
    }
}

/**
 * 대댓글 요소 생성 함수
 * @param {Object} reply - 대댓글 객체
 * @returns {HTMLElement} - 대댓글 HTML 요소
 */
function createReplyElement(reply) {
    const replyElement = document.createElement('div');
    replyElement.className = 'reply d-flex mt-3 ps-5';
    replyElement.dataset.commentId = reply.commentId;

    // 댓글 시간 표시 (createdAt과 updatedAt이 다르면 수정됨 표시)
    const isEdited = reply.createdAt !== reply.updatedAt;
    const dateText = `${formatDate(reply.createdAt)}${isEdited ? ' (수정됨)' : ''}`;

    replyElement.innerHTML = `
        <img src="${reply.profileImageUrl || './images/temp.jpg'}" alt="Replyer Avatar"
             class="rounded-circle me-3 comment-avatar">
        <div class="reply-content-wrapper flex-grow-1">
            <div class="reply-meta d-flex justify-content-between align-items-center">
                <span class="reply-author fw-bold">${reply.userNickname || '익명'}</span>
                <span class="reply-date text-muted small">${dateText}</span>
            </div>
            <div class="reply-text mt-1">
                <p class="mb-1">${reply.content}</p>
            </div>
            <div class="d-flex gap-3 mt-1">
                ${reply.userName === getUserName() ?
        `<button class="btn btn-sm btn-outline-secondary btn-edit-comment px-3 py-1 rounded-pill">수정</button>
                     <button class="btn btn-sm btn-outline-danger btn-delete-comment px-3 py-1 rounded-pill">삭제</button>`
        : ''}
            </div>
        </div>
    `;

    return replyElement;
}

/**
 * 좋아요 상태 업데이트 함수
 */
function updateLikeButtonState() {
    const likeBtn = document.querySelector('.like-btn');

    if (likeBtn) {
        if (isLiked) {
            likeBtn.classList.add('active');
        } else {
            likeBtn.classList.remove('active');
        }
    }
}

/**
 * 게시글 좋아요 토글 함수
 */
async function toggleLike() {
    try {
        // 로그인 확인
        if (!await checkUserLoggedIn()) {
            showLoginModal();
            return;
        }

        const url = `/api/v1/posts/${postId}/likes/toggle`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('좋아요 처리 실패');
        }

        // 좋아요 상태 토글
        isLiked = !isLiked;

        // UI 업데이트
        const likeCountElement = document.querySelector('.like-count');
        if (likeCountElement) {
            let count = parseInt(likeCountElement.textContent) || 0;
            count = isLiked ? count + 1 : Math.max(0, count - 1);
            likeCountElement.textContent = count;
        }

        updateLikeButtonState();

    } catch (error) {
        console.error('좋아요 처리 중 오류 발생:', error);
        alert('좋아요 처리에 실패했습니다. 다시 시도해주세요.');
    }
}

/**
 * 대댓글 폼 표시 함수
 * @param {string} commentId - 부모 댓글 ID
 */
function showReplyForm(commentId) {
    // 기존 대댓글 폼 제거
    removeReplyForm();

    // 부모 댓글 요소 찾기
    const commentElement = document.querySelector(`.comment[data-comment-id="${commentId}"]`) ||
        document.querySelector(`.reply[data-comment-id="${commentId}"]`);

    if (!commentElement) return;

    // 대댓글 폼 생성
    const replyFormElement = document.createElement('div');
    replyFormElement.className = 'reply-form mt-3 ps-5';
    replyFormElement.innerHTML = `
        <div class="d-flex">
            <img src="${getUserProfileImage()}" alt="Your Avatar" class="rounded-circle me-3 comment-avatar" style="width: 40px; height: 40px;">
            <div class="reply-form-content flex-grow-1">
                <textarea class="form-control mb-2" rows="2" placeholder="답글을 입력해주세요."></textarea>
                <div class="d-flex justify-content-end gap-2">
                    <button class="btn btn-sm btn-secondary btn-cancel-reply">취소</button>
                    <button class="btn btn-sm btn-warning btn-submit-reply">등록</button>
                </div>
            </div>
        </div>
    `;

    // 폼 삽입
    commentElement.after(replyFormElement);

    // 이벤트 리스너 추가
    const cancelBtn = replyFormElement.querySelector('.btn-cancel-reply');
    const submitBtn = replyFormElement.querySelector('.btn-submit-reply');
    const textarea = replyFormElement.querySelector('textarea');

    cancelBtn.addEventListener('click', function () {
        removeReplyForm();
    });

    submitBtn.addEventListener('click', function () {
        const content = textarea.value.trim();
        if (!content) {
            alert('답글 내용을 입력해주세요.');
            return;
        }

        submitComment(content, commentId);
    });

    // 포커스
    textarea.focus();
}

/**
 * 대댓글 폼 제거 함수
 */
function removeReplyForm() {
    const replyForm = document.querySelector('.reply-form');
    if (replyForm) {
        replyForm.remove();
    }
}

/**
 * 사용자 프로필 이미지 가져오기 함수
 * @returns {string} - 프로필 이미지 URL
 */
function getUserProfileImage() {
    // 실제 구현에서는 로컬 스토리지나 사용자 세션에서 가져옴
    return localStorage.getItem('profileImageUrl') || 'https://placehold.co/40x40?text=You';
}

/**
 * 사용자 이름 가져오기 함수
 * @returns {string} - 사용자 이름
 */
function getUserName() {
    // 실제 구현에서는 로컬 스토리지나 사용자 세션에서 가져옴
    const localuser = localStorage.getItem('user');
    if (!localuser)
        return '';

    const user = JSON.parse(localuser);

    return user.name;
}

/**
 * 로그인 모달 표시 함수
 */
function showLoginModal() {
    displayLoginModal();
}

/**
 * 오류 메시지 표시 함수
 * @param {string} message - 오류 메시지
 */
function showErrorMessage(message) {
    const postDetail = document.querySelector('.post-detail');
    if (postDetail) {
        postDetail.innerHTML = `
            <div class="error-message p-5 text-center">
                <p>${message}</p>
                <button class="btn btn-warning mt-3" onclick="window.location.href='/community'">
                    커뮤니티로 돌아가기
                </button>
            </div>
        `;
    }
}

/**
 * 사용자 로그인 상태 확인 함수
 * @returns {boolean} - 로그인 여부
 */
async function checkUserLoggedIn() {
    try {
        const response = await fetch('/auth/status', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('로그인 상태 확인 실패');
        }

        return true;
    } catch (error) {
        console.error('로그인 상태 확인 중 오류 발생:', error);
        return false;
    }
}


/**
 * 날짜 포맷팅 함수
 * @param {string} dateString - ISO 형식의 날짜 문자열
 * @returns {string} - 포맷팅된 날짜 문자열
 */
function formatDate(dateString) {
    if (!dateString) return '';

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