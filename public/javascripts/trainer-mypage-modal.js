// DOMContentLoaded 시 모달 이벤트용 함수 등록
document.addEventListener('DOMContentLoaded', () => {
    // 모든 모달의 확인 버튼에 이벤트 바인딩
    document.querySelector('#detailModal .btn-close').addEventListener('click', () => {
        const modal = bootstrap.Modal.getInstance(document.getElementById('detailModal'));
        if (modal) modal.hide();
    });

    document.querySelector('#acceptModal .accept-confirm-btn').addEventListener('click', () => {
        handleAcceptConfirm();
    });

    document.querySelector('#rejectModal .reject-confirm-btn').addEventListener('click', () => {
        handleRejectConfirm();
    });
});

// 리스트 버튼에 바인딩
function attachAdviceEventListeners(adviceData) {
    document.querySelectorAll('.view-detail-btn').forEach(btn => {
        btn.onclick = () => {
            const id = +btn.dataset.id;
            const item = adviceData.find(a => a.id === id);
            if (item) showDetailModal(item);
        };
    });

    document.querySelectorAll('.accept-btn').forEach(btn => {
        btn.onclick = () => {
            const id = +btn.dataset.id;
            const item = adviceData.find(a => a.id === id);
            if (item) showAcceptModal(item);
        };
    });

    document.querySelectorAll('.reject-btn').forEach(btn => {
        btn.onclick = () => {
            const id = +btn.dataset.id;
            const item = adviceData.find(a => a.id === id);
            if (item) showRejectModal(item);
        };
    });
}

// 1) 상세보기 모달 - 답변 등록 기능 제거
function showDetailModal(item) {
    const M = document.getElementById('detailModal');
    M.dataset.adviceId = item.id;
    const badgeClass = item.status.includes('대기') ? 'status-pending'
        : item.status.includes('진행') ? 'status-progress'
            : 'status-completed';

    M.querySelector('.modal-title').innerHTML = `
    상담 신청 상세 내용
    <span class="status-badge ${badgeClass}">${item.status}</span>
  `;
    M.querySelector('.advice-meta').innerHTML = `
    <div class="d-flex justify-content-between">
      <span><strong>작성자:</strong> ${item.author}</span>
      <span class="ms-3"><strong>신청일:</strong> ${item.date}</span>
    </div>
  `;
    M.querySelector('.advice-title').textContent = item.postTitle;
    M.querySelector('.pet-info').innerHTML = `
    <span class="pet-type">${item.petType}</span>
    <span class="pet-breed">${item.petBreed}</span>
    <span class="pet-age">${item.petAge}</span>
  `;
    M.querySelector('.advice-content').textContent = item.comment;

    let historyHTML = '';
    if (item.chats && item.chats.length) {
        item.chats.forEach(c => {
            historyHTML += `
        <div class="advice-chat-item advice-${c.type}">
          <div>${c.message}</div>
          <span class="chat-time">${c.time}</span>
        </div>
      `;
        });
    } else {
        historyHTML = '<p class="text-muted">아직 상담 내역이 없습니다.</p>';
    }
    M.querySelector('.chat-messages').innerHTML = historyHTML;

    // 답변 폼과 버튼 숨기기 (항상 숨김 처리)
    M.querySelector('.reply-form').style.display = 'none';
    M.querySelector('.reply-btn').style.display = 'none';

    new bootstrap.Modal(M).show();
}

// 2) 수락하기 모달 수정
function showAcceptModal(item) {
    const M = document.getElementById('acceptModal');
    M.dataset.adviceId = item.id; // ID 저장 추가

    M.querySelector('.advice-meta').innerHTML = `
    <span><strong>작성자:</strong> ${item.author}</span>
    <span class="ms-3"><strong>신청일:</strong> ${item.date}</span>
  `;
    M.querySelector('.advice-title').textContent = item.postTitle;
    M.querySelector('.pet-info').innerHTML = `
    <span class="pet-type">${item.petType}</span>
    <span class="pet-breed">${item.petBreed}</span>
    <span class="pet-age">${item.petAge}</span>
  `;
    M.querySelector('.advice-content').textContent = item.comment;
    M.querySelector('#acceptMessage').value = '';

    new bootstrap.Modal(M).show();
}

// 2-1) 수락 확인 처리 함수
function handleAcceptConfirm() {
    const M = document.getElementById('acceptModal');
    const id = +M.dataset.adviceId;
    const item = adviceRequests.find(a => a.id === id);

    if (!item) {
        alert('상담 정보를 찾을 수 없습니다.');
        return;
    }

    const msg = M.querySelector('#acceptMessage').value.trim();
    if (!msg) {
        alert('메시지를 입력해주세요.');
        return;
    }

    const time = new Date().toISOString().replace('T',' ').slice(0,16);
    item.chats = item.chats || [];
    item.chats.push({ type: 'trainer', message: msg, time });
    item.status = '상담 진행중';

    bootstrap.Modal.getInstance(M).hide();
    showMyAdvices();
}

// 3) 거절하기 모달
function showRejectModal(item) {
    const M = document.getElementById('rejectModal');
    M.dataset.adviceId = item.id; // ID 저장 추가

    M.querySelector('.advice-meta').innerHTML = `
    <span><strong>작성자:</strong> ${item.author}</span>
    <span class="ms-3"><strong>신청일:</strong> ${item.date}</span>
  `;
    M.querySelector('.advice-title').textContent = item.postTitle;
    M.querySelector('.pet-info').innerHTML = `
    <span class="pet-type">${item.petType}</span>
    <span class="pet-breed">${item.petBreed}</span>
    <span class="pet-age">${item.petAge}</span>
  `;
    M.querySelector('.advice-content').textContent = item.comment;
    M.querySelector('#rejectReason').value = '';
    M.querySelector('#rejectMessage').value = '';

    new bootstrap.Modal(M).show();
}

// 3-1) 거절 확인 처리 함수
function handleRejectConfirm() {
    const M = document.getElementById('rejectModal');
    const id = +M.dataset.adviceId;

    const reason = M.querySelector('#rejectReason').value;
    const msg = M.querySelector('#rejectMessage').value.trim();

    if (!reason) {
        alert('사유를 선택해주세요.');
        return;
    }
    if (!msg) {
        alert('메시지를 입력해주세요.');
        return;
    }

    const idx = adviceRequests.findIndex(a => a.id === id);
    if (idx > -1) adviceRequests.splice(idx, 1);

    bootstrap.Modal.getInstance(M).hide();
    showMyAdvices();
}