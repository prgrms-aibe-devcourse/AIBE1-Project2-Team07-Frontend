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

            // 필드 유효성 검사 호출
            validateInquiryForm();
        });
    }

    // 펫 나이 입력 필드 제한 (숫자만 입력)
    const petAgeYears = document.getElementById('petAgeYears');
    const petAgeMonths = document.getElementById('petAgeMonths');

    if (petAgeYears) {
        petAgeYears.addEventListener('input', function() {
            // 숫자만 허용
            this.value = this.value.replace(/[^0-9]/g, '');
            // 두 자리까지만 허용
            if (this.value.length > 2) {
                this.value = this.value.slice(0, 2);
            }
            validateInquiryForm();
        });
    }

    if (petAgeMonths) {
        petAgeMonths.addEventListener('input', function() {
            // 숫자만 허용
            this.value = this.value.replace(/[^0-9]/g, '');
            // 두 자리까지만 허용
            if (this.value.length > 2) {
                this.value = this.value.slice(0, 2);
            }
            // 11개월까지만 허용
            if (parseInt(this.value) > 11) {
                this.value = '11';
            }
            validateInquiryForm();
        });
    }

    // 펫 타입과 품종 입력 필드 이벤트
    const petType = document.getElementById('petType');
    const petBreed = document.getElementById('petBreed');

    if (petType) {
        petType.addEventListener('input', validateInquiryForm);
    }

    if (petBreed) {
        petBreed.addEventListener('input', validateInquiryForm);
    }

    // 모든 필수 필드 검증 함수
    function validateInquiryForm() {
        const submitButton = document.getElementById('submitInquiry');
        if (!submitButton) return;

        const messageText = textarea ? textarea.value : '';
        const petTypeValue = petType ? petType.value.trim() : '';
        const petBreedValue = petBreed ? petBreed.value.trim() : '';
        const petYearsValue = petAgeYears ? petAgeYears.value.trim() : '';
        const petMonthsValue = petAgeMonths ? petAgeMonths.value.trim() : '';

        // 모든 필드 유효성 검사
        const isMessageValid = messageText.length >= 20;
        const isPetTypeValid = petTypeValue.length > 0;
        const isPetBreedValid = petBreedValue.length > 0;
        const isPetAgeValid = (petYearsValue.length > 0 || petMonthsValue.length > 0);

        // 모든 필수 조건이 충족되면 버튼 활성화
        submitButton.disabled = !(isMessageValid && isPetTypeValid && isPetBreedValid && isPetAgeValid);
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
            const petTypeValue = petType.value.trim();
            const petBreedValue = petBreed.value.trim();
            const petYearsValue = petAgeYears.value.trim() || '0';
            const petMonthsValue = petAgeMonths.value.trim() || '0';

            if (messageText.length < 20) {
                alert('내용은 최소 20자 이상 입력해주세요.');
                return;
            }

            if (!petTypeValue) {
                alert('반려동물 종류를 입력해주세요.');
                return;
            }

            if (!petBreedValue) {
                alert('반려동물 품종을 입력해주세요.');
                return;
            }

            if (petYearsValue === '0' && petMonthsValue === '0') {
                alert('반려동물 나이를 입력해주세요.');
                return;
            }

            // 문의 데이터 수집
            const inquiryData = {
                message: messageText,
                petType: petTypeValue,
                petBreed: petBreedValue,
                petAge: `${petYearsValue}년 ${petMonthsValue}개월`
            };

            console.log('제출된 문의 데이터:', inquiryData);

            // 문의 제출 처리 로직
            alert('문의가 성공적으로 제출되었습니다.');
            const inquiryModal = bootstrap.Modal.getInstance(document.getElementById('inquiryModal'));
            inquiryModal.hide();

            // 폼 초기화
            textarea.value = '';
            charCount.textContent = '0';
            petType.value = '';
            petBreed.value = '';
            petAgeYears.value = '';
            petAgeMonths.value = '';
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