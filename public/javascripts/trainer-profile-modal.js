// 교육문의하기 모달 기능
document.addEventListener('DOMContentLoaded', function() {
    // 프로필 컨테이너가 로드된 후에 이벤트 리스너 추가
    const profileContainer = document.getElementById('trainer-profile-container');
    const config = { attributes: true, childList: true, subtree: true };

    // 프로필 컨테이너의 변화를 관찰하는 MutationObserver
    const observer = new MutationObserver((mutationsList, observer) => {
        for(const mutation of mutationsList) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // 프로필이 로드되면 교육문의 버튼에 이벤트 리스너 추가
                const inquiryButton = document.getElementById('inquiry-button');
                if (inquiryButton) {
                    inquiryButton.addEventListener('click', function() {
                        // 현재 로드된 트레이너 이름을 모달 제목에 설정
                        const trainerNameElement = document.getElementById('trainer-name');
                        const modalTitle = document.getElementById('inquiryModalLabel');
                        if (trainerNameElement && modalTitle) {
                            modalTitle.textContent = trainerNameElement.textContent;
                        }

                        const inquiryModal = new bootstrap.Modal(document.getElementById('inquiryModal'));
                        inquiryModal.show();
                    });

                    // 이벤트 리스너 추가 후 관찰 중단
                    observer.disconnect();
                    break;
                }
            }
        }
    });

    // 프로필 컨테이너 관찰 시작
    observer.observe(profileContainer, config);

    // 또는 직접 버튼에 이벤트 리스너 추가 시도
    document.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'inquiry-button') {
            // 현재 로드된 트레이너 이름을 모달 제목에 설정
            const trainerNameElement = document.getElementById('trainer-name');
            const modalTitle = document.getElementById('inquiryModalLabel');
            if (trainerNameElement && modalTitle) {
                modalTitle.textContent = trainerNameElement.textContent;
            }

            const inquiryModal = new bootstrap.Modal(document.getElementById('inquiryModal'));
            inquiryModal.show();
        }
    });

    // 문자 수 카운터 기능
    const textarea = document.getElementById('inquiryMessage');
    const charCount = document.getElementById('charCount');

    if (textarea && charCount) {
        textarea.addEventListener('input', function() {
            const count = this.value.length;
            charCount.textContent = count;

            // 1000자 제한
            if (count > 1000) {
                this.value = this.value.substring(0, 1000);
                charCount.textContent = 1000;
            }

            // 20자 이상일 때 문의하기 버튼 활성화
            const submitButton = document.getElementById('submitInquiry');
            if (submitButton) {
                if (count >= 20) {
                    submitButton.disabled = false;
                } else {
                    submitButton.disabled = true;
                }
            }
        });
    }

    // 파일 첨부 버튼 기능
    const fileAttachmentBtn = document.getElementById('fileAttachmentBtn');
    if (fileAttachmentBtn) {
        fileAttachmentBtn.addEventListener('click', function() {
            // 파일 선택 기능 구현
            // 실제로는 <input type="file"> 엘리먼트를 생성하고 클릭하는 로직 필요
            alert('파일 첨부 기능은 아직 구현되지 않았습니다.');
        });
    }

    // 문의하기 버튼 기능
    const submitInquiry = document.getElementById('submitInquiry');
    if (submitInquiry) {
        submitInquiry.addEventListener('click', function() {
            const messageText = textarea.value;
            if (messageText.length < 20) {
                alert('최소 20자 이상 입력해주세요.');
                return;
            }

            // 문의 제출 처리 로직
            alert('문의가 성공적으로 제출되었습니다.');
            const inquiryModal = bootstrap.Modal.getInstance(document.getElementById('inquiryModal'));
            inquiryModal.hide();
            textarea.value = '';
            charCount.textContent = '0';
        });
    }

    // 모달이 닫힐 때 배경을 함께 제거하기 위한 이벤트 리스너
    const modalElement = document.getElementById('inquiryModal');
    if (modalElement) {
        modalElement.addEventListener('hidden.bs.modal', function() {
            // 모달 배경 요소 찾기
            const modalBackdrops = document.getElementsByClassName('modal-backdrop');
            // 모든 모달 배경 요소 제거
            while(modalBackdrops.length > 0) {
                modalBackdrops[0].parentNode.removeChild(modalBackdrops[0]);
            }
            // body에서 modal-open 클래스 제거
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        });
    }
});