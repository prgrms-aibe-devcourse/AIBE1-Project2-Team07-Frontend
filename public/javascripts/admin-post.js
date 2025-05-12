// 로컬스토리지에서 user 정보
const userJSON = localStorage.getItem('user');
const accessToken = localStorage.getItem('accessToken');
let storedUser = null;

try {
    storedUser = JSON.parse(userJSON);
    console.log(storedUser);
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
    // Show loading initially
    document.getElementById('loader').classList.remove('hidden');
    document.getElementById('postsListContainer').classList.add('hidden');

    fetchPosts()
        .finally(() => {
            // Hide loader when done
            document.getElementById('loader').classList.add('hidden');
            document.getElementById('postsListContainer').classList.remove('hidden');
        });

    // 검색 기능 이벤트 리스너
    document.getElementById('searchBtn').addEventListener('click', function() {
        currentSearch = document.getElementById('searchInput').value.trim();
        currentPage = 1;
        fetchPosts();
    });

    // 검색 필드에서 엔터키 입력 처리
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            currentSearch = document.getElementById('searchInput').value.trim();
            currentPage = 1;
            fetchPosts();
        }
    });

    // 카테고리 필터 변경 이벤트 리스너
    document.getElementById('categoryFilter').addEventListener('change', function() {
        currentCategory = this.value;
        currentPage = 1;
        fetchPosts();
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

        if (currentCategory) {
            params.append('category', currentCategory);
        }

        if (currentSearch) {
            params.append('search', currentSearch);
        }

        const res = await fetch(`/api/v1/admin/posts`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(`게시물 목록 조회 실패 (${res.status}): ${errorData.message || res.statusText}`);
        }

        const data = await res.json();
        console.log('게시물 목록:', data);

        // 데이터 구조에 따라 조정 필요
        renderPosts(data.posts);
        updatePagination(data.totalPosts, data.totalPages);
        document.getElementById('totalPostsCount').textContent = data.totalPosts || 0;

        return data;
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
        switch(post.category) {
            case 'QUESTION':
                categoryClass = 'bg-blue-100 text-blue-800';
                categoryText = '질문';
                break;
            case 'FREE':
                categoryClass = 'bg-green-100 text-green-800';
                categoryText = '자유게시판';
                break;
            case 'MYPET':
                categoryClass = 'bg-green-100 text-green-800';
                categoryText = '자랑하기';
                break;
            case 'TOOL':
                categoryClass = 'bg-yellow-100 text-yellow-800';
                categoryText = '펫 도구 사용 후기';
                break;
            default:
                categoryClass = 'bg-gray-100 text-gray-800';
                categoryText = '기타';
        }

        // 날짜 포맷팅
        const createdAt = new Date(post.createdAt);
        const formattedDate = `${createdAt.getFullYear()}-${(createdAt.getMonth()+1).toString().padStart(2, '0')}-${createdAt.getDate().toString().padStart(2, '0')}`;

        const row = document.createElement('tr');
        row.className = 'border-b border-gray-200 hover:bg-gray-100';
        row.innerHTML = `
          <td class="py-3 px-4">${post.id}</td>
          <td class="py-3 px-4">
            <span class="${categoryClass} text-xs py-1 px-2 rounded-full">${categoryText}</span>
          </td>
          <td class="py-3 px-4">
            <div class="font-medium truncate-2 w-48">${post.title}</div>
          </td>
          <td class="py-3 px-4">
            <div class="flex items-center">
              ${post.authorProfileImage ?
            `<img src="${post.authorProfileImage}" alt="프로필" class="w-6 h-6 rounded-full mr-2">` :
            '<div class="w-6 h-6 rounded-full bg-gray-300 mr-2"></div>'}
              <span>${post.authorNickname}</span>
            </div>
          </td>
          <td class="py-3 px-3 text-center">${post.viewCount || 0}</td>
          <td class="py-3 px-3 text-center">${post.likeCount || 0}</td>
          <td class="py-3 px-3 text-center">${post.commentCount || 0}</td>
          <td class="py-3 px-3 text-center">${formattedDate}</td>
          <td class="py-3 px-6 text-center">
            <div class="flex justify-center space-x-2">
              <button class="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600 focus:ring-2 focus:ring-blue-300"
                      onclick="viewPostDetail('${post.id}')">보기</button>
              <button class="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600 focus:ring-2 focus:ring-red-300"
                      onclick="deletePost('${post.id}')">삭제</button>
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

        const res = await fetch(`/api/v1/admin/posts`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(`게시물 상세 조회 실패 (${res.status}): ${errorData.message || res.statusText}`);
        }

        const post = await res.json();

        // 카테고리 표시 텍스트
        let categoryText;
        switch(post.category) {
            case 'question': categoryText = '질문'; break;
            case 'story': categoryText = '일상'; break;
            case 'info': categoryText = '정보공유'; break;
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
                        <span>조회수 ${post.viewCount || 0}</span>
                        <span>좋아요 ${post.likeCount || 0}</span>
                        <span>댓글 ${post.commentCount || 0}</span>
                    </div>
                </div>
                <h2 class="text-xl font-bold mb-2">${post.title}</h2>
                <div class="flex items-center">
                    ${post.authorProfileImage ?
            `<img src="${post.authorProfileImage}" alt="프로필" class="w-8 h-8 rounded-full mr-2">` :
            '<div class="w-8 h-8 rounded-full bg-gray-300 mr-2"></div>'}
                    <span class="font-medium">${post.authorNickname}</span>
                </div>
            </div>
            <div class="mt-4 whitespace-pre-wrap">${post.content}</div>

            ${post.images && post.images.length > 0 ? `
                <div class="mt-4 grid grid-cols-2 gap-2">
                    ${post.images.map(img => `
                        <div class="border rounded overflow-hidden">
                            <img src="${img}" alt="게시물 이미지" class="w-full h-auto">
                        </div>
                    `).join('')}
                </div>
            ` : ''}
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

        const res = await fetch(`/api/v1/admin/posts/delete/${postId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
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