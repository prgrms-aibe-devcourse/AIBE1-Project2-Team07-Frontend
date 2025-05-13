// 로컬스토리지에서 user 정보
const userJSON = localStorage.getItem('user');
const accessToken = localStorage.getItem('accessToken');
let storedUser = null;
let currentComments = [];

try {
    storedUser = JSON.parse(userJSON);
} catch (e) {
    console.error('로컬스토리지 사용자 정보 파싱 실패:', e);
}

document.addEventListener('DOMContentLoaded', function() {
    // Show loading initially
    document.getElementById('loader').classList.remove('hidden');
    document.getElementById('commentsListContainer').classList.add('hidden');

    fetchComments()
        .finally(() => {
            // Hide loader when done
            document.getElementById('loader').classList.add('hidden');
            document.getElementById('commentsListContainer').classList.remove('hidden');
        });

    // Close modal when clicking the close button
    document.getElementById('closeModal').addEventListener('click', function() {
        document.getElementById('commentModal').classList.add('hidden');
    });

    // Close modal when clicking outside of it
    document.addEventListener('mouseup', function(e) {
        const modal = document.querySelector("#commentModal .bg-white");
        if (!modal.contains(e.target)) {
            document.getElementById('commentModal').classList.add('hidden');
        }
    });
});

async function fetchComments() {
    try {
        if (!accessToken) {
            throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.');
        }

        const res = await fetch(`/api/v1/admin/comments`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(`댓글 목록 조회 실패 (${res.status}): ${errorData.message || res.statusText}`);
        }

        const data = await res.json();
        console.log('댓글 목록:', data);
        currentComments = data;
        renderComments(data);
        return data;
    } catch (err) {
        console.error('댓글 목록 조회 오류:', err);
        showStatus(`댓글 목록 조회 실패: ${err.message}`, 'error');
        renderComments([]);
        return [];
    }
}

function renderComments(comments) {
    const container = document.getElementById('commentsList');
    container.innerHTML = '';

    if (!comments.length) {
        document.getElementById('noCommentsMessage').classList.remove('hidden');
        return;
    }
    document.getElementById('noCommentsMessage').classList.add('hidden');

    comments.forEach(comment => {
        const row = document.createElement('tr');
        row.className = 'border-b border-gray-200 hover:bg-gray-100';

        // Format date string if available
        let formattedDate = '날짜 정보 없음';
        if (comment.createdAt) {
            try {
                const date = new Date(comment.createdAt);
                formattedDate = date.toLocaleString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } catch (e) {
                console.error('날짜 포맷팅 오류:', e);
            }
        }

        row.innerHTML = `
          <td class="py-4 px-6">
            <div class="font-medium">${comment.commentId}</div>
          </td>
          <td class="py-4 px-6">
            <div class="content-preview font-medium">
              ${escapeHtml(comment.content)}
            </div>
          </td>
          <td class="py-4 px-6">
            <div class="font-medium">${comment.userName || ''} (${comment.userNickname || ''})</div>
            <div class="text-xs text-gray-500">${comment.userId || ''}</div>
          </td>
          <td class="py-4 px-6">
            <div>${formattedDate}</div>
          </td>
          <td class="py-4 px-6 text-center">
            <div class="flex justify-center space-x-2">
              <button class="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600 focus:ring-2 focus:ring-blue-300"
                      onclick="viewCommentDetail('${comment.commentId}')">상세</button>
              <button class="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600 focus:ring-2 focus:ring-red-300"
                      onclick="deleteComment('${comment.commentId}')">삭제</button>
            </div>
          </td>
        `;
        container.appendChild(row);
    });
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function viewCommentDetail(commentId) {
    const comment = currentComments.find(c => c.commentId.toString() === commentId.toString());

    if (!comment) {
        showStatus('댓글 정보를 찾을 수 없습니다.', 'error');
        return;
    }

    // Format date string if available
    let formattedDate = '날짜 정보 없음';
    if (comment.createdAt) {
        try {
            const date = new Date(comment.createdAt);
            formattedDate = date.toLocaleString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        } catch (e) {
            console.error('날짜 포맷팅 오류:', e);
        }
    }

    // Fill modal with comment data
    document.getElementById('modalUserInfo').textContent = `${comment.userName || ''} (${comment.userNickname || ''}) - ${comment.userId || ''}`;
    document.getElementById('modalCreatedAt').textContent = formattedDate;
    document.getElementById('modalContent').textContent = comment.content || '';

    // Set up delete button
    const deleteBtn = document.getElementById('modalDeleteBtn');
    deleteBtn.onclick = () => {
        document.getElementById('commentModal').classList.add('hidden');
        deleteComment(commentId);
    };

    // Show modal
    document.getElementById('commentModal').classList.remove('hidden');
}

function deleteComment(commentId) {
    if (!confirm(`정말 이 댓글을 삭제하시겠습니까? (ID: ${commentId})`)) return;

    showStatus(`댓글 삭제 중...`, 'loading');

    fetch(`/api/v1/admin/comments/delete/${commentId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(async response => {
            if (!response.ok) {
                // 에러 바디가 있으면 파싱, 없으면 상태 텍스트 사용
                let msg = response.statusText;
                try {
                    const errJson = await response.json();
                    msg = errJson.message || msg;
                } catch {}
                throw new Error(msg);
            }
            // 성공 시 빈 바디라도 에러 안 나게 처리
            try {
                return await response.json();
            } catch {
                return {};
            }
        })
        .then(() => {
            showStatus(`댓글이 성공적으로 삭제되었습니다.`, 'success');
            fetchComments();
        })
        .catch(error => {
            console.error('삭제 오류:', error);
            showStatus(`댓글 삭제 중 오류가 발생했습니다: ${error.message}`, 'error');
        });
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