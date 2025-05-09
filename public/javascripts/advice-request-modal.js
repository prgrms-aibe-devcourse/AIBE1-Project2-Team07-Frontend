window.API_BASE_URL = "http://localhost:8444";

let selectedFile = null; // 선택된 단일 파일을 저장할 변수
let isFileHandlerInitialized = false; // 파일 핸들러 초기화 여부 확인 플래그

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
    if (profileContainer) {
        observer.observe(profileContainer, config);
    }

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

    // 파일 첨부 기능 관련 전역 변수
    let selectedFile = null; // 선택된 단일 파일을 저장할 변수

    // 파일 목록 화면 갱신 함수
    function updateFileListDisplay() {
        const fileList = document.getElementById('fileList');
        if (!fileList) return;

        fileList.innerHTML = '';

        if (!selectedFile) {
            fileList.innerHTML = '<div>선택된 파일이 없습니다.</div>';
            return;
        }

        const div = document.createElement('div');
        div.className = 'file-item';
        div.style.margin = '8px 0';
        div.style.padding = '8px 12px';
        div.style.borderRadius = '4px';
        div.style.backgroundColor = '#f8f9fa';
        div.style.border = '1px solid #dee2e6';
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'center';

        // 파일 이름과 크기 표시
        const fileSize = selectedFile.size < 1024 * 1024
            ? (selectedFile.size / 1024).toFixed(1) + ' KB'
            : (selectedFile.size / (1024 * 1024)).toFixed(1) + ' MB';

        const nameSpan = document.createElement('span');
        nameSpan.style.overflow = 'hidden';
        nameSpan.style.textOverflow = 'ellipsis';
        nameSpan.style.whiteSpace = 'nowrap';
        nameSpan.style.maxWidth = 'calc(100% - 50px)';
        nameSpan.textContent = selectedFile.name;

        const sizeSpan = document.createElement('span');
        sizeSpan.style.marginLeft = '10px';
        sizeSpan.style.color = '#6c757d';
        sizeSpan.style.fontSize = '0.875em';
        sizeSpan.textContent = fileSize;

        const infoDiv = document.createElement('div');
        infoDiv.style.display = 'flex';
        infoDiv.style.alignItems = 'center';
        infoDiv.style.overflow = 'hidden';
        infoDiv.appendChild(nameSpan);
        infoDiv.appendChild(sizeSpan);

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'file-remove';
        removeBtn.style.background = 'none';
        removeBtn.style.border = 'none';
        removeBtn.style.color = '#dc3545';
        removeBtn.style.fontSize = '1.2em';
        removeBtn.style.cursor = 'pointer';
        removeBtn.style.padding = '0 5px';
        removeBtn.innerHTML = '&times;';

        div.appendChild(infoDiv);
        div.appendChild(removeBtn);
        fileList.appendChild(div);

        // 파일 삭제 버튼 이벤트
        removeBtn.addEventListener('click', function() {
            selectedFile = null;
            updateFileListDisplay();
            // 파일 입력 초기화
            const fileInput = document.getElementById('inquiryFileInput');
            if (fileInput) fileInput.value = '';
        });
    }

    // 파일 클릭 핸들러
    function fileClickHandler(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('파일 첨부 버튼 클릭됨');

        const fileInput = document.getElementById('inquiryFileInput');
        if (fileInput) fileInput.click();
    }

    // 파일 변경 핸들러
    function fileChangeHandler(e) {
        console.log('파일 변경 이벤트 발생');
        const files = e.target.files;
        console.log('파일 선택됨:', files.length, '개');

        if (files.length === 0) {
            console.log('선택된 파일 없음');
            selectedFile = null;
            updateFileListDisplay();
            return;
        }

        const file = files[0]; // 첫 번째 파일만 사용

        // 용량 검사 (≤500MB)
        if (file.size > 500 * 1024 * 1024) {
            alert(`${file.name} 파일이 500MB를 초과합니다.`);
            selectedFile = null;
        } else {
            selectedFile = file;
        }

        // 화면에 파일명 표시
        updateFileListDisplay();
        console.log('파일 목록 업데이트 완료');
    }

    // 파일 첨부 기능 설정 - 한 번만 실행되도록 수정
    function setupFileAttachment() {
        const fileAttachmentBtn = document.getElementById('fileAttachmentBtn');
        const fileInput = document.getElementById('inquiryFileInput');

        if (!fileAttachmentBtn || !fileInput) {
            console.error('파일 첨부 관련 요소를 찾을 수 없습니다.');
            return;
        }

        // 기존 이벤트 리스너 제거 전에 클론 생성
        const newFileAttachmentBtn = fileAttachmentBtn.cloneNode(true);
        const newFileInput = fileInput.cloneNode(true);

        // 부모 노드 참조
        const fileAttachmentBtnParent = fileAttachmentBtn.parentNode;
        const fileInputParent = fileInput.parentNode;

        // 이전 요소 제거
        fileAttachmentBtnParent.removeChild(fileAttachmentBtn);
        fileInputParent.removeChild(fileInput);

        // 새 요소 추가
        fileAttachmentBtnParent.appendChild(newFileAttachmentBtn);
        fileInputParent.appendChild(newFileInput);

        // 단일 파일만 선택 가능하도록 설정
        newFileInput.multiple = false;

        // 새 이벤트 리스너 추가
        newFileAttachmentBtn.addEventListener('click', fileClickHandler);
        newFileInput.addEventListener('change', fileChangeHandler);

        console.log('파일 첨부 핸들러 새로 설정 완료');
    }

    // 모달이 열릴 때마다 파일 첨부 기능 설정 (이전 리스너 제거 후 새로 설정)
    document.addEventListener('shown.bs.modal', function(e) {
        if (e.target && e.target.id === 'inquiryModal') {
            console.log('모달 표시됨');
            // 파일 목록 초기화
            selectedFile = null;
            updateFileListDisplay();
            // 파일 첨부 핸들러 설정
            setupFileAttachment();
        }
    });

    // 문의하기 버튼 기능 - 파일과 데이터를 분리해서 전송
    const submitInquiry = document.getElementById('submitInquiry');
    if (submitInquiry) {
        submitInquiry.addEventListener('click', async function() {
            // 1) 유효성 재검사
            const messageText = document.getElementById('inquiryMessage')?.value.trim();
            const petTypeValue = document.getElementById('petType')?.value.trim();
            const petBreedValue = document.getElementById('petBreed')?.value.trim();
            const petYearsValue = document.getElementById('petAgeYears')?.value.trim() || '0';
            const petMonthsValue = document.getElementById('petAgeMonths')?.value.trim() || '0';
            const serviceTypeEl = document.querySelector('input[name="serviceType"]:checked');

            if (!serviceTypeEl) { alert('서비스 종류를 선택해주세요.'); return; }
            if (!messageText || messageText.length < 20) {
                alert('내용은 최소 20자 이상 입력해주세요.');
                return;
            }
            if (!petTypeValue) { alert('반려동물 종을 입력해주세요.'); return; }
            if (!petBreedValue) { alert('반려동물 품종을 입력해주세요.'); return; }
            if (petYearsValue === '0' && petMonthsValue === '0') {
                alert('반려동물 나이를 입력해주세요.'); return;
            }

            // JWT 토큰 확인
            const token = localStorage.getItem('accessToken');
            if (!token) { alert('로그인이 필요합니다.'); return; }

            try {
                const trainerNickname = window.nickname;
                const years = parseInt(petYearsValue, 10) || 0;
                const months = parseInt(petMonthsValue, 10) || 0;
                const totalMonths = years * 12 + months;

                // 서비스 타입 매핑 - ServiceType enum과 일치하도록 수정
                const serviceTypeMap = {
                    'visit': 'VISIT_TRAINING',
                    'video': 'VIDEO_TRAINING'
                };

                const serviceType = serviceTypeMap[serviceTypeEl.value] || serviceTypeEl.value;

                // DTO 형식에 맞게 데이터 구성
                const requestData = {
                    trainerNickName: trainerNickname || '',
                    serviceType: serviceType,
                    petType: petTypeValue,
                    petBreed: petBreedValue,
                    petMonthAge: totalMonths,
                    content: messageText
                };

                console.log('전송 데이터:', requestData);

                // 1단계: 기본 데이터 전송 (파일 없이)
                // 컨트롤러 코드 확인 결과 정확한 API 엔드포인트는 '/api/v1/match'
                const res = await fetch(`${window.API_BASE_URL}/api/v1/match`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestData)
                });

                console.log('응답 상태:', res.status, res.statusText);

                // 응답 처리
                if (!res.ok) {
                    // 오류 응답 처리
                    let errorData = {};
                    try {
                        errorData = await res.json();
                        console.error('오류 응답:', errorData);
                    } catch (e) {
                        console.error('응답 파싱 실패:', e);
                    }

                    handleErrorResponse(res, errorData);
                    return;
                }

                // 응답 데이터 파싱
                let data;
                try {
                    data = await res.json();
                    console.log('응답 데이터:', data);
                } catch (e) {
                    console.error('응답 파싱 실패:', e);
                    data = {};
                }

                // 기본 데이터 전송 성공
                const matchId = data.id || data.matchId; // 백엔드 응답에 따라 조정
                console.log('매칭 ID:', matchId);

                // 2단계: 파일이 있는 경우에만 파일 업로드 수행
                if (selectedFile && matchId) {
                    // UserApplyController에 파일 업로드 엔드포인트가 없으므로
                    // 올바른 파일 업로드 엔드포인트를 확인해야 함
                    const uploadSuccess = await uploadFileForMatch(selectedFile, matchId, token);
                    if (!uploadSuccess) {
                        console.warn('파일 업로드는 실패했지만, 기본 매칭 신청은 완료되었습니다.');
                    }
                }

                // 성공 처리
                alert('매칭 신청이 완료되었습니다!');
                closeAndResetForm();

            } catch (e) {
                console.error('신청 실패:', e);
                alert(`신청 실패: ${e.message}`);
            }
        });
    }

    // 파일 업로드 함수
    async function uploadFileForMatch(file, matchId, token) {
        if (!file || !matchId || !token) {
            console.error('파일 업로드에 필요한 정보가 부족합니다.');
            return false;
        }

        try {
            const fileFormData = new FormData();
            fileFormData.append('file', file);
            fileFormData.append('matchId', matchId);

            // 참고: 컨트롤러에 파일 업로드 엔드포인트가 명시되어 있지 않으므로
            // 서버 로그를 확인하거나 백엔드 개발자에게 정확한 엔드포인트 확인 필요
            const uploadRes = await fetch(`${window.API_BASE_URL}/api/v1/match/upload-file`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: fileFormData
            });

            if (!uploadRes.ok) {
                let errorData = {};
                try {
                    errorData = await uploadRes.json();
                    console.error('파일 업로드 응답:', errorData);
                } catch (e) {
                    console.error('파일 업로드 응답 파싱 실패:', e);
                }

                console.error('파일 업로드 실패:', errorData);
                alert(`파일 업로드에 실패했습니다: ${errorData.message || uploadRes.statusText}`);
                return false;
            }

            console.log('파일 업로드 성공');
            return true;
        } catch (e) {
            console.error('파일 업로드 중 오류 발생:', e);
            alert(`파일 업로드 중 오류가 발생했습니다: ${e.message}`);
            return false;
        }
    }

    // 에러 처리 함수
    function handleErrorResponse(response, data) {
        if (Array.isArray(data.errors)) {
            const messages = data.errors
                .map(err => {
                    const field = err.field || err.objectName || 'unknown';
                    return `${field}: ${err.defaultMessage}`;
                })
                .join('\n');
            alert(`신청 실패:\n${messages}`);
        } else {
            alert(`신청 실패: ${data.message || response.statusText}`);
        }
        console.error('Validation Errors:', data.errors || data);
    }

    // 모달 닫고 폼 초기화
    function closeAndResetForm() {
        const modal = bootstrap.Modal.getInstance(document.getElementById('inquiryModal'));
        if (modal) modal.hide();

        // 폼 리셋
        document.getElementById('inquiryMessage').value = '';
        document.getElementById('charCount').textContent = '0';
        document.getElementById('petType').value = '';
        document.getElementById('petBreed').value = '';
        document.getElementById('petAgeYears').value = '';
        document.getElementById('petAgeMonths').value = '';

        const serviceTypeEl = document.querySelector('input[name="serviceType"]:checked');
        if (serviceTypeEl) serviceTypeEl.checked = false;

        document.getElementById('inquiryFileInput').value = '';
        document.getElementById('fileList').innerHTML = '';
        selectedFile = null;
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