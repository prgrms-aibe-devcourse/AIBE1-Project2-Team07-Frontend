// 로컬스토리지에서 user 정보
const userJSON = localStorage.getItem('user');
const accessToken = localStorage.getItem('accessToken');
let storedUser = null;

try {
    storedUser = JSON.parse(userJSON);
} catch (e) {
    console.error('로컬스토리지 사용자 정보 파싱 실패:', e);
}

document.addEventListener('DOMContentLoaded', function() {
    // Show loading initially
    document.getElementById('loader').classList.remove('hidden');
    document.getElementById('certListContainer').classList.add('hidden');

    fetchCertifications()
        .finally(() => {
            // Hide loader when done
            document.getElementById('loader').classList.add('hidden');
            document.getElementById('certListContainer').classList.remove('hidden');
        });

    // Close modal when clicking the close button
    document.getElementById('closeModal').addEventListener('click', function() {
        document.getElementById('imageModal').classList.add('hidden');
    });

    // Close modal when clicking outside of it
    document.addEventListener('mouseup', function(e) {
        const modal = document.querySelector("#imageModal .bg-white");
        if (!modal.contains(e.target)) {
            document.getElementById('imageModal').classList.add('hidden');
        }
    });
});

async function fetchCertifications() {
    try {
        if (!accessToken) {
            throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.');
        }

        const res = await fetch(`/api/v1/admin/certifications`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(`신청 목록 조회 실패 (${res.status}): ${errorData.message || res.statusText}`);
        }

        const data = await res.json();
        console.log('신청 목록:', data);
        renderCertifications(data);
        return data;
    } catch (err) {
        console.error('인증 목록 조회 오류:', err);
        showStatus(`인증 목록 조회 실패: ${err.message}`, 'error');
        renderCertifications([]);
        return [];
    }
}

function renderCertifications(certifications) {
    certifications.sort((a, b) => {
        const aPending = !a.approved && !a.rejected;
        const bPending = !b.approved && !b.rejected;
        if (aPending && !bPending) return -1;
        if (!aPending && bPending) return 1;
        return 0;
    });

    const container = document.getElementById('certificationList');
    container.innerHTML = '';

    if (!certifications.length) {
        document.getElementById('noCertificationsMessage').classList.remove('hidden');
        return;
    }
    document.getElementById('noCertificationsMessage').classList.add('hidden');

    certifications.forEach(cert => {
        const isApproved = cert.approved === true;
        const isRejected = cert.rejected === true;

        // 상태 텍스트·스타일 결정
        let statusText, statusClass;
        if (isRejected) {
            statusText  = '거절됨';
            statusClass = 'bg-red-100 text-red-800';
        } else if (isApproved) {
            statusText  = '승인됨';
            statusClass = 'bg-green-100 text-green-800';
        } else {
            statusText  = '대기중';
            statusClass = 'bg-yellow-100 text-yellow-800';
        }

        // 버튼 비활성화 여부
        const disabledAttr = (isApproved || isRejected)
            ? 'disabled style="opacity:0.5;cursor:not-allowed;"'
            : '';

        const row = document.createElement('tr');
        row.className = 'border-b border-gray-200 hover:bg-gray-100';
        row.innerHTML = `
          <td class="py-4 px-6">
            <div class="font-medium">${cert.trainerName} (${cert.trainerNickname})</div>
            <div class="text-xs text-gray-500">${cert.trainerId}</div>
          </td>
          <td class="py-4 px-6"><div class="font-medium">${cert.certName}</div></td>
          <td class="py-4 px-6">
            <div>${cert.issuingBody}</div>
            <div class="text-xs text-gray-500">발급일: ${cert.issueDate}</div>
          </td>
          <td class="py-4 px-6">
            ${cert.fileUrl
            ? `<button class="bg-blue-100 text-blue-800 py-1 px-3 rounded hover:bg-blue-200 focus:ring-2 focus:ring-blue-300"
                        onclick="showImagePreview('${cert.fileUrl}','${cert.certName}')">파일 보기</button>`
            : '<span class="text-gray-400">파일 없음</span>'}
          </td>
          <td class="py-4 px-6 text-center">
            <span class="${statusClass} py-1 px-3 rounded-full text-xs">${statusText}</span>
          </td>
          <td class="py-4 px-6 text-center">
            <div class="flex justify-center space-x-2">
              <button class="bg-green-500 text-white py-1 px-4 rounded hover:bg-green-600 focus:ring-2 focus:ring-green-300"
                      onclick="approveCertification('${cert.certId}')" ${disabledAttr}>승인</button>
              <button class="bg-red-500 text-white py-1 px-4 rounded hover:bg-red-600 focus:ring-2 focus:ring-red-300"
                      onclick="rejectCertification('${cert.certId}')" ${disabledAttr}>거절</button>
            </div>
          </td>
        `;
        container.appendChild(row);
    });
}


function showImagePreview(imageUrl, certName) {
    if (!imageUrl) {
        showStatus('이미지 URL이 없습니다', 'error');
        return;
    }

    document.getElementById('modalTitle').textContent = (certName || '자격증') + ' 이미지';

    // Show loading indicator
    document.getElementById('previewImage').setAttribute('src', '');
    document.getElementById('previewImageLoading').classList.remove('hidden');
    document.getElementById('previewImageContainer').classList.add('hidden');

    // Open modal
    document.getElementById('imageModal').classList.remove('hidden');

    // Load image
    const img = new Image();
    img.onload = function() {
        document.getElementById('previewImage').setAttribute('src', imageUrl);
        document.getElementById('previewImageLoading').classList.add('hidden');
        document.getElementById('previewImageContainer').classList.remove('hidden');
    };

    img.onerror = function() {
        document.getElementById('previewImageLoading').classList.add('hidden');
        document.getElementById('previewImageError').classList.remove('hidden');
        showStatus('이미지를 불러오는데 실패했습니다', 'error');
    };

    img.src = imageUrl;
}

function approveCertification(certId) {
    processCertification(certId, 'approve', '승인');
}

function rejectCertification(certId) {
    processCertification(certId, 'reject', '거절');
}

function processCertification(certId, action, actionText) {
    if (!confirm(`정말 이 인증 요청을 ${actionText}하시겠습니까?`)) return;

    showStatus(`${actionText} 처리 중...`, 'loading');

    fetch(`/api/v1/admin/certifications/${action}/${certId}`, {
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
            showStatus(`인증 요청이 성공적으로 ${actionText}되었습니다.`, 'success');
            fetchCertifications();
        })
        .catch(error => {
            console.error('처리 오류:', error);
            showStatus(`인증 요청 ${actionText} 중 오류가 발생했습니다: ${error.message}`, 'error');
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