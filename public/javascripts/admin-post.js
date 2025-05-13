// 로컬스토리지에서 user 정보
const userJSON = localStorage.getItem('user');
const accessToken = localStorage.getItem('accessToken');
let storedUser = null;

try {
    storedUser = JSON.parse(userJSON);
} catch (e) {
    console.error('로컬스토리지 사용자 정보 파싱 실패:', e);
}

// 페이지네이션 변수
let currentPage = 1;
let totalPages = 1;
let postsPerPage = 10;
let currentCategory = '';
let currentSearch = '';

document.addEventListener('DOMContentLoaded', function() {
    // 로그인 여부 확인
    if (!accessToken) {
        showStatus('로그인이 필요합니다. 로그인 후 이용해주세요.', 'error');
        document.getElementById('loader').classList.add('hidden');
        return;
    }

    fetchPosts()
        .finally(() => {
            // Hide loader when done
            document.getElementById('loader').classList.add('hidden');
            document.getElementById('postsListContainer').classList.remove('hidden');
        });

    // 모달 닫기 버튼 이벤트 리스너
    document.getElementById('closePostModal').addEventListener('click', function() {
        document.getElementById('postDetailModal').classList.add('hidden');
    });

    document.getElementById('closeDetailBtn').addEventListener('click', function() {
        document.getElementById('postDetailModal').classList.add('hidden');
    });

    // 모달 외부 클릭 시 닫기
    document.addEventListener('mouseup', function(e) {
        const modal = document.querySelector("#postDetailModal .bg-white");
        if (modal && !modal.contains(e.target)) {
            document.getElementById('postDetailModal').classList.add('hidden');
        }
    });
});

async function fetchPosts() {
    try {
        if (!accessToken) {
            throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.');
        }

        document.getElementById('loader').classList.remove('hidden');
        document.getElementById('postsListContainer').classList.add('hidden');

        // URL 파라미터 구성
        const params = new URLSearchParams({
            page: currentPage,
            limit: postsPerPage
        });

        // 카테고리 필터 값을 대문자로 변환 (API가 대문자 예상할 경우)
        if (currentCategory) {
            const categoryValue = currentCategory.toUpperCase();
            console.log('API 요청 카테고리:', categoryValue);
            params.append('category', categoryValue);
        }

        if (currentSearch && currentSearch !== '') {
            console.log('API 요청 검색어:', currentSearch);
            params.append('search', currentSearch);
        }

        // URL에 파라미터 추가
        const url = `/api/v1/admin/posts?${params.toString()}`;
        console.log('요청 URL:', url);

        const res = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(`게시물 목록 조회 실패 (${res.status}): ${errorData.message || res.statusText}`);
        }

        const data = await res.json();
        console.log('게시물 목록 응답:', data);

        // 응답 구조 확인 및 데이터 추출
        let posts = [];
        let totalPosts = 0;

        if (Array.isArray(data)) {
            // 응답이 배열인 경우
            posts = data;
            totalPosts = data.length;
        } else if (data && typeof data === 'object') {
            // 응답이 객체인 경우
            posts = data.posts || data.content || data.data || [];
            totalPosts = data.totalPosts || data.totalElements || posts.length;
            totalPages = data.totalPages || Math.ceil(totalPosts / postsPerPage);
        }

        console.log(`총 ${totalPosts}개의 게시물, ${totalPages} 페이지`);

        renderPosts(posts);
        updatePagination(totalPosts, totalPages);
        document.getElementById('totalPostsCount').textContent = totalPosts || 0;

        return { posts, totalPosts, totalPages };
    } catch (err) {
        console.error('게시물 목록 조회 오류:', err);
        showStatus(`게시물 목록 조회 실패: ${err.message}`, 'error');
        renderPosts([]);
        return { posts: [], totalPosts: 0, totalPages: 1 };
    } finally {
        document.getElementById('loader').classList.add('hidden');
        document.getElementById('postsListContainer').classList.remove('hidden');
    }
}

function renderPosts(posts) {
    const container = document.getElementById('postsList');
    container.innerHTML = '';

    if (!posts || !posts.length) {
        document.getElementById('noPostsMessage').classList.remove('hidden');
        return;
    }
    document.getElementById('noPostsMessage').classList.add('hidden');

    posts.forEach(post => {
        // 카테고리 표시 스타일
        let categoryClass, categoryText;
        let petCategoryClass, petCategoryText;

        // 카테고리 값 정규화 (대소문자 구분 없이 처리)
        const postCategory = post.postCategory?.toUpperCase() || '';
        const petCategory = post.petCategory?.toUpperCase() || '';

        switch(postCategory) {
            case 'QUESTION':
                categoryClass = 'bg-blue-100 text-blue-800';
                categoryText = '질문';
                break;
            case 'FREE':
                categoryClass = 'bg-green-100 text-green-800';
                categoryText = '자유게시판';
                break;
            case 'MYPET':
                categoryClass = 'bg-purple-100 text-purple-800';
                categoryText = '반려동물 자랑';
                break;
            case 'TOOL':
                categoryClass = 'bg-yellow-100 text-yellow-800';
                categoryText = '정보공유';
                break;
            default:
                categoryClass = 'bg-gray-100 text-gray-800';
                categoryText = '기타';
        }

        switch(petCategory) {
            case 'CAT':
                petCategoryClass = 'bg-green-100 text-green-800';
                petCategoryText = '고양이';
                break;
            case 'DOG':
                petCategoryClass = 'bg-yellow-100 text-yellow-800';
                petCategoryText = '강아지';
                break;
            case 'ETC':
                petCategoryClass = 'bg-green-100 text-gray-800';
                petCategoryText = '기타';
                break;
            default:
                petCategoryClass = 'bg-gray-100 text-gray-800';
                petCategoryText = '없음';
        }

        // 날짜 포맷팅
        const createdAt = new Date(post.createdAt);
        const formattedDate = `${createdAt.getFullYear()}-${(createdAt.getMonth()+1).toString().padStart(2, '0')}-${createdAt.getDate().toString().padStart(2, '0')}`;

        const row = document.createElement('tr');
        row.className = 'border-b border-gray-200 hover:bg-gray-100';
        row.innerHTML = `
          <td class="py-3 px-4">${post.postId}</td>
          <td class="py-3 px-4">
            <span class="${categoryClass} text-xs py-1 px-2 rounded-full">${categoryText}</span>
          </td>
          <td class="py-3 px-4">
            <span class="${petCategoryClass} text-xs py-1 px-2 rounded-full">${petCategoryText}</span>
          </td>
          <td class="py-3 px-4">
            <div class="font-medium truncate-2 w-48">${post.title}</div>
          </td>
          <td class="py-3 px-4">
            <div class="flex items-center">
              <span>${post.userNickname || '알 수 없음'}${post.userName ? `(이름: ${post.userName})` : ''}</span>
            </div>
          </td>
          <td class="py-4 px-6 text-center">
            <div class="flex justify-center space-x-4">
              <span class="flex items-center">
                <svg class="w-4 h-4 text-red-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path>
                </svg>
                ${post.likeCount || 0}
              </span>
              <span class="flex items-center">
                <svg class="w-4 h-4 text-blue-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd"></path>
                </svg>
                ${post.commentCount || 0}
              </span>
            </div>
          </td>
          
          <td class="py-3 px-3 text-center">${formattedDate}</td>
          <td class="py-3 px-6 text-center">
            <div class="flex justify-center space-x-2">
              <button class="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600 focus:ring-2 focus:ring-blue-300"
                      onclick="viewPostDetail('${post.postId}')">보기</button>
              <button class="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600 focus:ring-2 focus:ring-red-300"
                      onclick="deletePost('${post.postId}')">삭제</button>
            </div>
          </td>
        `;
        container.appendChild(row);
    });
}

function updatePagination(totalPosts, totalPages) {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    if (!totalPages || totalPages <= 1) return;

    // 이전 페이지 버튼
    const prevButton = document.createElement('button');
    prevButton.classList.add('bg-gray-200', 'text-gray-800', 'py-2', 'px-3', 'rounded', 'hover:bg-gray-300');
    prevButton.disabled = currentPage === 1;
    prevButton.textContent = '이전';
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            fetchPosts();
        }
    });
    paginationContainer.appendChild(prevButton);

    // 페이지 숫자 버튼
    const maxPageButtons = 5;
    const halfMaxButtons = Math.floor(maxPageButtons / 2);
    let startPage = Math.max(1, currentPage - halfMaxButtons);
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

    if (endPage - startPage + 1 < maxPageButtons) {
        startPage = Math.max(1, endPage - maxPageButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        if (i === currentPage) {
            pageButton.classList.add('bg-blue-500', 'text-white', 'py-2', 'px-3', 'rounded');
        } else {
            pageButton.classList.add('bg-gray-200', 'text-gray-800', 'py-2', 'px-3', 'rounded', 'hover:bg-gray-300');
        }
        pageButton.textContent = i;
        pageButton.addEventListener('click', () => {
            currentPage = i;
            fetchPosts();
        });
        paginationContainer.appendChild(pageButton);
    }

    // 다음 페이지 버튼
    const nextButton = document.createElement('button');
    nextButton.classList.add('bg-gray-200', 'text-gray-800', 'py-2', 'px-3', 'rounded', 'hover:bg-gray-300');
    nextButton.disabled = currentPage === totalPages;
    nextButton.textContent = '다음';
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            fetchPosts();
        }
    });
    paginationContainer.appendChild(nextButton);
}

async function viewPostDetail(postId) {
    try {
        showStatus('게시물 상세 정보를 불러오는 중...', 'loading');

        const res = await fetch(`/api/v1/posts/${postId}/open`, {
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(`게시물 상세 조회 실패 (${res.status}): ${errorData.message || res.statusText}`);
        }

        const post = await res.json();
        console.log('게시물 상세:', post);

        // 카테고리 표시 텍스트
        let categoryText;
        const postCategory = post.postCategory?.toUpperCase() || '';

        switch(postCategory) {
            case 'QUESTION': categoryText = '질문'; break;
            case 'FREE': categoryText = '자유'; break;
            case 'TOOL': categoryText = '정보공유'; break;
            case 'MYPET': categoryText = '반려동물 자랑'; break;
            default: categoryText = '기타';
        }

        // 날짜 포맷팅
        const createdAt = new Date(post.createdAt);
        const formattedDate = `${createdAt.getFullYear()}-${(createdAt.getMonth()+1).toString().padStart(2, '0')}-${createdAt.getDate().toString().padStart(2, '0')} ${createdAt.getHours().toString().padStart(2, '0')}:${createdAt.getMinutes().toString().padStart(2, '0')}`;

        document.getElementById('postDetailContent').innerHTML = `
          <div class="border-b pb-4 mb-4">
            <div class="flex justify-between items-center mb-2">
              <div>
                <span class="bg-gray-100 text-gray-800 text-xs py-1 px-2 rounded-full mr-2">${categoryText}</span>
                <span class="text-gray-500 text-sm">${formattedDate}</span>
              </div>
              <div class="flex items-center space-x-4 text-sm text-gray-500">
                <span>좋아요 ${post.likeCount || 0}</span>
                <span>댓글 ${post.commentCount || 0}</span>
              </div>
            </div>
            <h2 class="text-xl font-bold mb-2">${post.title}</h2>
            <div class="flex items-center mb-4">
              <div class="w-8 h-8 rounded-full bg-gray-300 mr-2"></div>
              <span class="font-medium">
                ${post.userNickname || '알 수 없음'}${post.userName ? `(${post.userName})` : ''}
              </span>
            </div>
          </div>
        
          <div class="mt-4 whitespace-pre-wrap mb-4">${post.content}</div>
        
          ${
            // imageUrls 배열에 값이 있을 때만 첫 번째 이미지를 '추가 사진'으로 보여줍니다
            Array.isArray(post.imageUrls) && post.imageUrls.length > 0
                ? `<div class="mb-4">
           <h6 class="font-medium mb-2">추가 사진</h6>
           <img
             src="${post.imageUrls[0]}"
             alt="첨부 사진"
             class="w-full max-w-md rounded shadow"
             onerror="this.remove()"
           />
         </div>`
                : ''
        }

  ${
            // post.videoUrl 이 있고 빈 문자열이 아닐 때만 동영상을 보여줍니다
            post.videoUrl && post.videoUrl.trim() !== ''
                ? `<div class="mb-4">
           <h6 class="font-medium mb-2">첨부 동영상</h6>
           <video
             controls
             class="w-full max-w-md rounded shadow"
             onerror="this.remove()"
           >
             <source src="${post.videoUrl}" type="video/mp4" />
             동영상을 지원하지 않는 브라우저입니다.
           </video>
         </div>`
                : ''
        }

  ${
            Array.isArray(post.images) && post.images.length > 0
                ? `<div class="mt-4 grid grid-cols-2 gap-2">
           ${post.images.map(img => `
             <div class="border rounded overflow-hidden">
               <img
                 src="${img}"
                 alt="게시물 이미지"
                 class="w-full h-auto"
                 onerror="this.remove()"
               />
             </div>
           `).join('')}
         </div>`
                : ''
        }
`;

        document.getElementById('postDetailModal').classList.remove('hidden');
        document.getElementById('statusMessage').classList.add('hidden');
    } catch (err) {
        console.error('게시물 상세 조회 오류:', err);
        showStatus(`게시물 상세 조회 실패: ${err.message}`, 'error');
    }
}

async function deletePost(postId) {
    if (!confirm('정말 이 게시물을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;

    try {
        showStatus('게시물 삭제 중...', 'loading');

        const res = await fetch(`/api/v1/admin/posts/${postId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(`게시물 삭제 실패 (${res.status}): ${errorData.message || res.statusText}`);
        }

        showStatus('게시물이 성공적으로 삭제되었습니다.', 'success');
        fetchPosts(); // 목록 새로고침
    } catch (err) {
        console.error('게시물 삭제 오류:', err);
        showStatus(`게시물 삭제 실패: ${err.message}`, 'error');
    }
}

function showStatus(message, type) {
    const statusDiv = document.getElementById('statusMessage');
    statusDiv.classList.remove('hidden', 'bg-green-100', 'bg-red-100', 'bg-blue-100', 'text-green-800', 'text-red-800', 'text-blue-800');

    if (type === 'success') {
        statusDiv.classList.add('bg-green-100', 'text-green-800');
    } else if (type === 'error') {
        statusDiv.classList.add('bg-red-100', 'text-red-800');
    } else if (type === 'loading') {
        statusDiv.classList.add('bg-blue-100', 'text-blue-800');
    }

    statusDiv.textContent = message;
    statusDiv.classList.remove('hidden');

    // Auto hide after 5 seconds for success and error messages
    if (type !== 'loading') {
        setTimeout(function() {
            statusDiv.classList.add('hidden');
        }, 5000);
    }
}

// 전역 함수로 등록 (HTML 이벤트에서 호출 가능하도록)
window.viewPostDetail = viewPostDetail;
window.deletePost = deletePost;