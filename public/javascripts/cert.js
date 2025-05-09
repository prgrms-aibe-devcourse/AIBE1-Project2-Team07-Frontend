const API_BASE_URL = "http://localhost:8444";

$(document).ready(function() {
    fetchCertifications();

    // Close modal when clicking the close button
    $('#closeModal').click(function() {
        $('#imageModal').addClass('hidden');
    });

    // Close modal when clicking outside of it
    $(document).mouseup(function(e) {
        const modal = $("#imageModal .bg-white");
        if (!modal.is(e.target) && modal.has(e.target).length === 0) {
            $('#imageModal').addClass('hidden');
        }
    });
});

function fetchCertifications() {
    $.ajax({
        url: `${API_BASE_URL}/api/v1/admin/certifications`,
        method: 'GET',
        success: function(data) {
            renderCertifications(data);
            $('#loader').hide();
            $('#certListContainer').removeClass('hidden');
        },
        error: function(xhr, status, error) {
            showStatus('데이터를 불러오는 중 오류가 발생했습니다: ' + error, 'error');
            $('#loader').hide();
        }
    });
}

function renderCertifications(certifications) {
    const container = $('#certificationList');
    container.empty();

    if (certifications.length === 0) {
        $('#noCertificationsMessage').removeClass('hidden');
        return;
    }

    certifications.forEach(function(cert) {
        const row = `
                    <tr class="border-b border-gray-200 hover:bg-gray-100">
                        <td class="py-4 px-6">
                            <div class="font-medium">${cert.trainerName} (${cert.trainerNickname})</div>
                            <div class="text-xs text-gray-500">${cert.trainerId}</div>
                        </td>
                        <td class="py-4 px-6">
                            <div class="font-medium">${cert.certName}</div>
                        </td>
                        <td class="py-4 px-6">
                            <div>${cert.issuingBody}</div>
                            <div class="text-xs text-gray-500">발급일: ${cert.issueDate}</div>
                        </td>
                        <td class="py-4 px-6">
                            <button
                                class="bg-blue-100 text-blue-800 py-1 px-3 rounded hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                onclick="showImagePreview('${cert.fileUrl}', '${cert.certName}')"
                            >
                                파일 보기
                            </button>
                        </td>
                        <td class="py-4 px-6 text-center">
                            <span class="bg-yellow-100 text-yellow-800 py-1 px-3 rounded-full text-xs">
                                ${cert.approved ? '승인됨' : '대기중'}
                            </span>
                        </td>
                        <td class="py-4 px-6 text-center">
                            <div class="flex justify-center space-x-2">
                                <button
                                    class="bg-green-500 text-white py-1 px-4 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300"
                                    onclick="approveCertification(${cert.certId})"
                                >
                                    승인
                                </button>
                                <button
                                    class="bg-red-500 text-white py-1 px-4 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
                                    onclick="rejectCertification(${cert.certId})"
                                >
                                    거절
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
        container.append(row);
    });
}

function showImagePreview(imageUrl, certName) {
    $('#modalTitle').text(certName + ' 자격증 이미지');
    $('#previewImage').attr('src', imageUrl);
    $('#imageModal').removeClass('hidden');
}

function approveCertification(certId) {
    processCertification(certId, 'approve', '승인');
}

function rejectCertification(certId) {
    processCertification(certId, 'reject', '거절');
}

function processCertification(certId, action, actionText) {
    if (!confirm(`정말 이 인증 요청을 ${actionText}하시겠습니까?`)) {
        return;
    }

    $.ajax({
        url: `${API_BASE_URL}/api/v1/admin/certifications/${action}/${certId}`,
        method: 'PUT',
        success: function(response) {
            showStatus(`인증 요청이 성공적으로 ${actionText}되었습니다.`, 'success');
            fetchCertifications();
        },
        error: function(xhr, status, error) {
            showStatus(`인증 요청 ${actionText} 중 오류가 발생했습니다: ` + error, 'error');
        }
    });
}

function showStatus(message, type) {
    const statusDiv = $('#statusMessage');
    statusDiv.removeClass('hidden bg-green-100 bg-red-100 text-green-800 text-red-800');

    if (type === 'success') {
        statusDiv.addClass('bg-green-100 text-green-800');
    } else {
        statusDiv.addClass('bg-red-100 text-red-800');
    }

    statusDiv.text(message);
    statusDiv.removeClass('hidden');

    // Auto hide after 5 seconds
    setTimeout(function() {
        statusDiv.addClass('hidden');
    }, 5000);
}