window.API_BASE_URL = "http://localhost:8444";

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

    // 파일 첨부 기능 설정 - 전역에서 한 번만 설정
    let fileClickHandlerAdded = false;
    let fileChangeHandlerAdded = false;
    let selectedFiles = []; // 선택된 파일을 저장할 전역 배열

    function setupFileAttachment() {
        const fileAttachmentBtn = document.getElementById('fileAttachmentBtn');
        const fileInput = document.getElementById('inquiryFileInput');
        const fileList = document.getElementById('fileList');

        if (!fileAttachmentBtn || !fileInput || !fileList) {
            console.error('파일 첨부 관련 요소를 찾을 수 없습니다.');
            return;
        }

        // 이미 이벤트 핸들러가 설정되어 있는지 확인하고 중복 설정 방지
        if (!fileClickHandlerAdded) {
            // 기존 핸들러 제거 후 새로 추가
            fileAttachmentBtn.removeEventListener('click', fileClickHandler);
            fileAttachmentBtn.addEventListener('click', fileClickHandler);
            fileClickHandlerAdded = true;
            console.log('파일 버튼 클릭 핸들러 설정됨');
        }

        if (!fileChangeHandlerAdded) {
            // 기존 핸들러 제거 후 새로 추가
            fileInput.removeEventListener('change', fileChangeHandler);
            fileInput.addEventListener('change', fileChangeHandler);
            fileChangeHandlerAdded = true;
            console.log('파일 변경 핸들러 설정됨');
        }

        // 파일 클릭 핸들러 - 전역 함수로 정의
        function fileClickHandler(e) {
            e.preventDefault(); // 기본 동작 방지
            e.stopPropagation(); // 이벤트 버블링 방지
            console.log('파일 첨부 버튼 클릭됨');

            // 기존 input 요소를 제거하고 새로운 요소로 교체
            const oldInput = document.getElementById('inquiryFileInput');
            if (oldInput) {
                const newInput = document.createElement('input');
                newInput.type = 'file';
                newInput.id = 'inquiryFileInput';
                newInput.className = oldInput.className;
                newInput.style.cssText = oldInput.style.cssText;
                newInput.multiple = true;
                newInput.accept = oldInput.accept || '*/*';
                newInput.style.display = 'none'; // 숨김 처리

                // 새 요소에 이벤트 핸들러 추가
                newInput.addEventListener('change', fileChangeHandler);

                // 기존 요소를 새 요소로 교체
                oldInput.parentNode.replaceChild(newInput, oldInput);

                // 새 파일 입력 요소 클릭
                setTimeout(() => {
                    newInput.click();
                }, 10);
            } else {
                // 만약 기존 요소가 없다면 직접 클릭
                fileInput.click();
            }
        }

        // 파일 변경 핸들러 - 전역 함수로 정의
        function fileChangeHandler(e) {
            const files = Array.from(e.target.files || []);
            console.log('파일 선택됨:', files.length, '개');

            if (files.length === 0) {
                console.log('선택된 파일 없음');
                return;
            }

            // 용량 검사 (≤500MB)
            let validFiles = files.filter(file => {
                if (file.size > 500 * 1024 * 1024) {
                    alert(`${file.name} 파일이 500MB를 초과합니다.`);
                    return false;
                }
                return true;
            });

            // 파일을 추가하되, 3개까지만 가능하도록 체크
            const totalFiles = [...selectedFiles, ...validFiles];
            if (totalFiles.length > 3) {
                alert('최대 3개 파일만 첨부 가능합니다.');
                // 남은 슬롯만큼만 파일 추가
                const remainingSlots = Math.max(0, 3 - selectedFiles.length);
                validFiles = validFiles.slice(0, remainingSlots);
            }

            // 전역 배열에 파일 추가
            selectedFiles = [...selectedFiles, ...validFiles];

            // 화면에 파일명 표시 - 모든 파일을 다시 표시
            updateFileListDisplay();

            console.log('파일 목록 업데이트 완료');
        }

        // 파일 목록 화면 갱신 함수
        function updateFileListDisplay() {
            fileList.innerHTML = '';

            if (selectedFiles.length === 0) {
                fileList.innerHTML = '<div>선택된 파일이 없습니다.</div>';
                return;
            }

            selectedFiles.forEach((file, index) => {
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
                const fileSize = file.size < 1024 * 1024
                    ? (file.size / 1024).toFixed(1) + ' KB'
                    : (file.size / (1024 * 1024)).toFixed(1) + ' MB';

                const nameSpan = document.createElement('span');
                nameSpan.style.overflow = 'hidden';
                nameSpan.style.textOverflow = 'ellipsis';
                nameSpan.style.whiteSpace = 'nowrap';
                nameSpan.style.maxWidth = 'calc(100% - 50px)';
                nameSpan.textContent = file.name;

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
                removeBtn.setAttribute('data-index', index.toString());

                div.appendChild(infoDiv);
                div.appendChild(removeBtn);
                fileList.appendChild(div);

                // 파일 삭제 버튼 이벤트
                removeBtn.addEventListener('click', function() {
                    const idx = parseInt(this.getAttribute('data-index'));
                    selectedFiles.splice(idx, 1);
                    updateFileListDisplay();
                });
            });
        }
    }

    // 모달이 완전히 표시된 후 파일 첨부 설정
    document.addEventListener('shown.bs.modal', function(e) {
        if (e.target && e.target.id === 'inquiryModal') {
            console.log('모달 표시됨');
            // 파일 목록 초기화
            selectedFiles = [];
            setTimeout(() => {
                setupFileAttachment();
            }, 100); // 약간의 지연을 두고 설정
        }
    });

    // 페이지 로드 시에도 파일 첨부 설정
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            setupFileAttachment();
        }, 500); // 페이지 로드 후 약간의 지연을 두고 설정
    });

    // 문의하기 버튼 기능
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

            // FormData 생성
            const formData = new FormData();
            const trainerName = document.getElementById('trainer-name')?.textContent.trim();
            formData.append('trainerNickName', trainerName || '');
            formData.append('serviceType', serviceTypeEl.value);                    // visit | video
            formData.append('message', messageText);
            formData.append('petType', petTypeValue);
            formData.append('petBreed', petBreedValue);
            formData.append('petAge', `${petYearsValue||0}년 ${petMonthsValue||0}개월`);

            // 파일 첨부 (최대 3개)
            // 전역 배열에 저장된 파일들을 FormData에 추가
            if (selectedFiles && selectedFiles.length > 0) {
                console.log('폼 제출 시 첨부파일:', selectedFiles.length, '개');
                selectedFiles.forEach(file => {
                    formData.append('files', file);
                });
            } else {
                console.log('첨부된 파일 없음');
            }

            // JWT
            const token = localStorage.getItem('accessToken');
            if (!token) { alert('로그인이 필요합니다.'); return; }

            try {
                const res = await fetch(`${window.API_BASE_URL}/api/v1/match`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                        // 'Content-Type' 는 브라우저가 multipart boundary 와 함께 자동 생성
                    },
                    body: formData
                });
                if (!res.ok) {
                    const err = await res.json().catch(() => null);
                    throw new Error(err?.message || `HTTP ${res.status}`);
                }

                alert('매칭 신청이 완료되었습니다!');
                const modal = bootstrap.Modal.getInstance(document.getElementById('inquiryModal'));
                if (modal) modal.hide();

                // 폼 리셋
                document.getElementById('inquiryMessage').value = '';
                document.getElementById('charCount').textContent = '0';
                document.getElementById('petType').value = '';
                document.getElementById('petBreed').value = '';
                document.getElementById('petAgeYears').value = '';
                document.getElementById('petAgeMonths').value = '';
                serviceTypeEl.checked = false;
                document.getElementById('inquiryFileInput').value = '';
                document.getElementById('fileList').innerHTML = '';

            } catch (e) {
                console.error('신청 실패:', e);
                alert(`신청 실패: ${e.message}`);
            }
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