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

document.addEventListener('DOMContentLoaded', function() {
    // Show loading initially
    document.getElementById('loader').classList.remove('hidden');
    document.getElementById('usersListContainer').classList.add('hidden');

    fetchUsers()
        .finally(() => {
            // Hide loader when done
            document.getElementById('loader').classList.add('hidden');
            document.getElementById('usersListContainer').classList.remove('hidden');
        });

    // Role modal event listeners
    document.getElementById('closeRoleModal').addEventListener('click', function() {
        document.getElementById('roleModal').classList.add('hidden');
    });

    document.getElementById('cancelRoleChange').addEventListener('click', function() {
        document.getElementById('roleModal').classList.add('hidden');
    });

    document.getElementById('confirmRoleChange').addEventListener('click', function() {
        const userId = document.getElementById('selectedUserId').value;
        const newRole = document.getElementById('roleSelect').value;
        updateUserRole(userId, newRole);
    });

    // Close modal when clicking outside of it
    document.addEventListener('mouseup', function(e) {
        const modal = document.querySelector("#roleModal .bg-white");
        if (modal && !modal.contains(e.target)) {
            document.getElementById('roleModal').classList.add('hidden');
        }
    });
});

async function fetchUsers() {
    try {
        if (!accessToken) {
            throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.');
        }

        const res = await fetch(`/api/v1/admin/users`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(`사용자 목록 조회 실패 (${res.status}): ${errorData.message || res.statusText}`);
        }

        const data = await res.json();
        console.log('사용자 목록:', data);
        renderUsers(data);
        return data;
    } catch (err) {
        console.error('사용자 목록 조회 오류:', err);
        showStatus(`사용자 목록 조회 실패: ${err.message}`, 'error');
        renderUsers([]);
        return [];
    }
}

function renderUsers(users) {
    const container = document.getElementById('usersList');
    container.innerHTML = '';

    if (!users.length) {
        document.getElementById('noUsersMessage').classList.remove('hidden');
        return;
    }
    document.getElementById('noUsersMessage').classList.add('hidden');

    users.forEach(user => {
        // 역할에 따른 클래스 할당
        const roleClass = `role-${user.role}`;

        // 상태에 따른 클래스 할당
        const statusClass = user.status === 'ACTIVE' ? 'status-active' : 'status-inactive';
        const statusText = user.status === 'ACTIVE' ? '활성' : '비활성';

        const row = document.createElement('tr');
        row.className = 'border-b border-gray-200 hover:bg-gray-100';
        row.innerHTML = `
          <td class="py-4 px-6">
            <img src="${user.profileImageUrl || '/images/cat.png'}" alt="Profile" 
                 class="w-12 h-12 rounded-full object-cover" 
                 onerror="this.src='/images/cat.png'">
          </td>
          <td class="py-4 px-6">
            <div class="font-medium">${user.name}</div>
            <div class="text-xs text-gray-500">${user.nickname}</div>
            <div class="text-xs text-gray-400">${user.userId}</div>
          </td>
          <td class="py-4 px-6">
            <div>${user.email || '이메일 없음'}</div>
            <div class="text-xs text-gray-500">
              ${user.provider ? `${user.provider} 연동` : '직접 가입'}
            </div>
          </td>
          <td class="py-4 px-6 text-center">
            <span class="${roleClass} role-badge">${user.role}</span>
          </td>
          <td class="py-4 px-6 text-center">
            <span class="${statusClass} role-badge">${statusText}</span>
          </td>
          <td class="py-4 px-6 text-center">
            <div class="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-2">
              <button class="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600 focus:ring-2 focus:ring-blue-300 w-full sm:w-auto"
                      onclick="openRoleModal('${user.userId}', '${user.name}', '${user.nickname}', '${user.role}')">
                역할 변경
              </button>
              ${user.status === 'ACTIVE' ? `
              <button class="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600 focus:ring-2 focus:ring-red-300 w-full sm:w-auto"
                      onclick="withdrawUser('${user.userId}', '${user.name}')">
                탈퇴 처리
              </button>` : ''}
            </div>
          </td>
        `;
        container.appendChild(row);
    });
}

function openRoleModal(userId, name, nickname, currentRole) {
    document.getElementById('selectedUserId').value = userId;
    document.getElementById('roleModalUserInfo').textContent = `${name} (${nickname})`;

    // 현재 역할 선택
    const roleSelect = document.getElementById('roleSelect');
    for (let i = 0; i < roleSelect.options.length; i++) {
        if (roleSelect.options[i].value === currentRole) {
            roleSelect.selectedIndex = i;
            break;
        }
    }

    document.getElementById('roleModal').classList.remove('hidden');
}

function withdrawUser(userId, name) {
    if (!confirm(`정말 ${name} 사용자를 탈퇴 처리하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
        return;
    }

    showStatus(`사용자 탈퇴 처리 중...`, 'loading');

    fetch(`/api/v1/admin/users/withdraw/${userId}`, {
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
            showStatus(`사용자가 성공적으로 탈퇴 처리되었습니다.`, 'success');
            fetchUsers();
        })
        .catch(error => {
            console.error('처리 오류:', error);
            showStatus(`사용자 탈퇴 처리 중 오류가 발생했습니다: ${error.message}`, 'error');
        });
}

function updateUserRole(userId, newRole) {
    showStatus(`사용자 역할 변경 중...`, 'loading');

    fetch(`/api/v1/admin/users/update/${userId}?role=${newRole}&status=ACTIVE`, {
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
            try {
                return await response.json();
            } catch {
                return {};
            }
        })
        .then(() => {
            document.getElementById('roleModal').classList.add('hidden');
            showStatus(`사용자 역할이 성공적으로 변경되었습니다.`, 'success');
            fetchUsers();
        })
        .catch(error => {
            console.error('처리 오류:', error);
            showStatus(`사용자 역할 변경 중 오류가 발생했습니다: ${error.message}`, 'error');
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

    if (type !== 'loading') {
        setTimeout(function() {
            statusDiv.classList.add('hidden');
        }, 5000);
    }
}