/**
 * 훈련사 신청 모달 관련 스크립트
 * user-mypage.js와 연동하여 사용됩니다.
 */

// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', () => {
    // 모달 요소 참조 추가
    setupTrainerModal();
});

/**
 * 훈련사 신청 모달 설정
 */
function setupTrainerModal() {
    // 훈련사 신청 버튼 이벤트 리스너 설정
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('edit-button')) {
            e.preventDefault();

            // 모달 표시
            const trainerModal = new bootstrap.Modal(document.getElementById('trainerApplicationModal'));
            trainerModal.show();
        }
    });

    // 자격증 이미지 업로드 및 미리보기
    const certificateImageInput = document.getElementById('certificateImage');
    const certificatePreview = document.getElementById('certificatePreview');
    const uploadButton = document.querySelector('.upload-btn');

    if (certificateImageInput && certificatePreview) {
        // 버튼 클릭 시 파일 선택 다이얼로그 표시
        if (uploadButton) {
            uploadButton.addEventListener('click', () => {
                certificateImageInput.click();
            });
        }

        // 파일 선택 시 미리보기 표시
        certificateImageInput.addEventListener('change', () => {
            const file = certificateImageInput.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    certificatePreview.src = e.target.result;
                    certificatePreview.classList.add('has-image');
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // 제출 버튼 이벤트 처리
    const submitButton = document.getElementById('submitTrainerApplication');
    if (submitButton) {
        submitButton.addEventListener('click', async () => {
            const form = document.getElementById('trainerApplicationForm');

            // 입력 필드 검증
            const certificateName = document.getElementById('certificateName').value;
            const certificateOrg = document.getElementById('certificateOrg').value;
            const certificateDate = document.getElementById('certificateDate').value;
            const certificateImage = document.getElementById('certificateImage').files[0];

            // 간단한 입력 검증
            if (!certificateName || !certificateOrg || !certificateDate || !certificateImage) {
                alert('모든 필드를 입력해주세요.');
                return;
            }

            // 실제 서버에 데이터를 전송하는 코드가 들어갈 자리입니다.
            // 현재는 백엔드가 연결되지 않았으므로 성공 메시지만 표시합니다.
            // alert('훈련사 신청이 완료되었습니다. 관리자 승인 후 훈련사로 활동하실 수 있습니다.');
            const certificationDTO = {
                certName: certificateName,
                issuingBody: certificateOrg,
                issueDate: certificateDate
            }

            const formData = new FormData();
            formData.append('certification', new Blob([JSON.stringify(certificationDTO)], {
                type: 'application/json'
            }));

            formData.append('file', certificateImage);


            try {
                const response = await fetch('/api/v1/trainers/apply', {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error('어플라이 데이터를 가져오는데 실패했습니다.');
                }

                data = await response.json();

                console.log(data);

            } catch (error) {
                console.error('신청 데이터 로드 오류:', error);
                alert('신청 데이터를 불러오는데 실패했습니다.');
            }



            // 모달 닫기
            const modal = bootstrap.Modal.getInstance(document.getElementById('trainerApplicationModal'));
            modal.hide();
        });
    }
}