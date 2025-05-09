document.addEventListener('DOMContentLoaded', function () {
    // API 기본 URL (실제 백엔드 URL로 변경 필요)
    const API_BASE_URL = 'https://dev.tuituiworld.store/api/v1/';

    // 페이지네이션 설정
    const ITEMS_PER_PAGE = 5;
    let currentPage = 1;
    let totalPages = 1;
    let allTrainers = [];

    // 샘플 데이터 (백엔드 연동 전 테스트용)
    const sampleTrainersData = [
        {
            id: 1,
            name: '김구 훈련사',
            certification: 'KKC 훈련사',
            description: '반려견의 마음을 깊이 이해하고, 보호자님과의 신뢰를 바탕으로 즐겁고 효과적인 훈련을 제공합니다.',
            rating: '4.0/5.0점',
            tags: ['#훈련전문견', '#분리불안해결', '#사회성향상'],
            mainImage: 'images/cat.png',
            profileImage: 'images/cat.png',
            consultationPrice: '50,000',
            visitPrice: '70,000',
        },
        {
            id: 2,
            name: '박훈 훈련사',
            certification: 'KKC 훈련사',
            description: '일대일 맞춤형 훈련으로 반려견이 스스로 성장할 수 있도록 돕습니다.',
            rating: '4.0/5.0점',
            tags: ['#기초명령어', '#가정방문훈련'],
            mainImage: 'images/cat.png',
            profileImage: 'images/cat.png',
            consultationPrice: '50,000',
            visitPrice: '70,000',
        },
        {
            id: 3,
            name: '이민 훈련사',
            certification: 'KKC 훈련사',
            description: '분리불안, 공격성 교정 등 행동 문제 해결에 풍부한 경험을 보유하고 있습니다.',
            rating: '4.0/5.0점',
            tags: ['#행동교정', '#분리불안전문'],
            mainImage: 'images/cat.png',
            profileImage: 'images/cat.png',
            consultationPrice: '50,000',
            visitPrice: '70,000',
        },
        {
            id: 4,
            name: '최훈 훈련사',
            certification: 'KKC 훈련사',
            description: '산책 매너부터 사회성 훈련까지, 일상에 바로 적용 가능한 실용적인 노하우를 전합니다.',
            rating: '4.0/5.0점',
            tags: ['#산책매너', '#사회성향상'],
            mainImage: 'images/cat.png',
            profileImage: 'images/cat.png',
            consultationPrice: '50,000',
            visitPrice: '70,000',
        },
        {
            id: 5,
            name: '정경 훈련사',
            certification: 'KKC 훈련사',
            description: '반려견과 보호자님의 라이프스타일에 맞춘 훈련 계획을 세워드립니다.',
            rating: '4.0/5.0점',
            tags: ['#맞춤훈련', '#가족친화적'],
            mainImage: 'images/cat.png',
            profileImage: 'images/cat.png',
            consultationPrice: '50,000',
            visitPrice: '70,000',
        },
        {
            id: 6,
            name: '문재 훈련사',
            certification: 'KKC 훈련사',
            description: '소형견 전문으로, 세심하고 부드러운 접근으로 신뢰를 쌓아갑니다.',
            rating: '4.5/5.0점',
            tags: ['#소형견전문', '#긍정강화'],
            mainImage: 'images/cat.png',
            profileImage: 'images/cat.png',
            consultationPrice: '55,000',
            visitPrice: '75,000',
        },
        {
            id: 7,
            name: '윤석 훈련사',
            certification: 'KKC 전문 훈련사',
            description: '대형견 훈련과 행동 문제 교정에 대한 깊은 이해와 풍부한 현장 경험을 자랑합니다.',
            rating: '4.7/5.0점',
            tags: ['#대형견전문', '#공격성교정'],
            mainImage: 'images/cat.png',
            profileImage: 'images/cat.png',
            consultationPrice: '60,000',
            visitPrice: '80,000',
        },
    ];

    // TODO: 카드 템플릿이 좀 다름
    // 트레이너 카드 렌더링 함수
    function renderTrainerCards(trainers) {
        const container = document.querySelector('.trainer-cards-container');
        const template = document.getElementById('trainer-card-template');

        // 컨테이너 초기화
        container.innerHTML = '';

        // 각 트레이너 데이터로 카드 생성
        trainers.forEach(trainer => {
            // 템플릿 복제
            const cardClone = document.importNode(template.content, true);

            // 카드 최상위 요소 (예: .trainer-card)
            const cardEl = cardClone.querySelector('.trainer-card');
            // 클릭 가능한 커서
            cardEl.style.cursor = 'pointer';
            // 클릭 시 상세 페이지로 이동
            cardEl.addEventListener('click', () => {
                window.location.href = `/trainers/profile/${trainer.nickname}`;
            });

            // 이미지 설정
            cardClone.querySelector('.trainer-image img').src = trainer.photos?.[0]?.fileUrl || 'images/cat.png';
            cardClone.querySelector('.profile-img').src = trainer.profileImageUrl || 'images/basic_profile.png';

            // 텍스트 데이터 설정
            const certName = trainer.certifications[0]?.certName;
            cardClone.querySelector('.trainer-name').textContent = `${trainer.name}${certName ? ' · ' + certName : ''}`;
            cardClone.querySelector('.trainer-description').textContent = trainer.introduction;
            cardClone.querySelector('.rating').textContent = `평점: ${trainer.averageRating || '0'}/5점`;
            cardClone.querySelector('.trainer-tags').textContent = Array.isArray(trainer.specializations)
                ? trainer.specializations.map(tag => `#${tag}`).join(' ')
                : '';


            // 가격 설정
            const priceElements = cardClone.querySelectorAll('.price-value');
            const serviceFees = trainer.serviceFees || [];

            // 각 서비스 타입에 맞는 요금 찾기
            const visitFee = serviceFees.find(fee => fee.serviceType === 'VISIT_TRAINING')?.feeAmount || 0;
            const videoFee = serviceFees.find(fee => fee.serviceType === 'VIDEO_TRAINING')?.feeAmount || 0;

            priceElements[0].textContent = `${visitFee.toLocaleString()}원`;  // 방문 훈련
            priceElements[1].textContent = `${videoFee.toLocaleString()}원`;  // 화상 훈련


            // 버튼 이벤트 설정
            const consultBtn = cardClone.querySelector('.consultation-btn');
            const visitBtn = cardClone.querySelector('.visit-btn');

            // 상담 버튼
            consultBtn.addEventListener('click', e => {
                e.stopPropagation();
                window.location.href = `/trainers/profile/${trainer.nickname}?serviceType=video`;
            });

            // 방문 버튼
            visitBtn.addEventListener('click', e => {
                e.stopPropagation();
                window.location.href = `/trainers/profile/${trainer.nickname}?serviceType=visit`;
            });

            // 컨테이너에 카드 추가
            container.appendChild(cardClone);
        });
    }

    // 페이지네이션 렌더링 함수
    function renderPagination() {
        const paginationContainer = document.getElementById('pagination-container');
        paginationContainer.innerHTML = '';

        // 페이지 버튼 수 (이전, 다음 버튼 제외)
        const maxButtonCount = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxButtonCount / 2));
        let endPage = Math.min(totalPages, startPage + maxButtonCount - 1);

        // 시작 페이지 조정
        if (endPage - startPage + 1 < maxButtonCount) {
            startPage = Math.max(1, endPage - maxButtonCount + 1);
        }

        // 이전 페이지 버튼
        if (currentPage > 1) {
            const prevBtn = document.createElement('li');
            prevBtn.className = 'page-item';
            prevBtn.innerHTML = '<a class="page-link" href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a>';
            prevBtn.addEventListener('click', async function (e) {
                e.preventDefault();
                await fetchTrainers(currentPage - 2);
                goToPage(currentPage - 1);
            });
            paginationContainer.appendChild(prevBtn);
        }

        // 페이지 번호 버튼
        for (let i = startPage; i <= endPage; i++) {
            const pageItem = document.createElement('li');
            pageItem.className = `page-item ${i === currentPage ? 'active' : ''}`;
            pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            pageItem.addEventListener('click', async function (e) {
                e.preventDefault();
                await fetchTrainers(i - 1);
                goToPage(i);
            });
            paginationContainer.appendChild(pageItem);
        }

        // 다음 페이지 버튼
        if (currentPage < totalPages) {
            const nextBtn = document.createElement('li');
            nextBtn.className = 'page-item';
            nextBtn.innerHTML = '<a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a>';
            nextBtn.addEventListener('click', async function (e) {
                e.preventDefault();
                await fetchTrainers(currentPage);
                goToPage(currentPage + 1);
            });
            paginationContainer.appendChild(nextBtn);
        }
    }

    // 특정 페이지로 이동하는 함수
    function goToPage(page) {
        currentPage = page;
        displayTrainers();
    }

    // 현재 페이지에 표시할 트레이너 필터링 및 표시
    function displayTrainers() {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const pageTrainers = allTrainers;
        console.log('pageTrainers:', pageTrainers);

        renderTrainerCards(pageTrainers);
        renderPagination();
    }

    // 서비스 선택 처리 함수
    function handleServiceSelection(trainer, serviceType) {
        const serviceTypeText = serviceType === 'consultation' ? '상담' : '방문';
        const price = serviceType === 'consultation' ? trainer.consultationPrice : trainer.visitPrice;

        // // 로그인 상태 확인
        // if (!isLoggedIn()) {
        //     alert('서비스 예약을 위해 로그인이 필요합니다.');
        //     // 로그인 페이지로 리디렉션하거나 로그인 모달 표시
        //     // window.location.href = '/login';
        //     return;
        // }

        // 알림 표시
        alert(`${trainer.name} 선생님의 ${serviceTypeText} 서비스가 선택되었습니다. 가격: ${price}원`);

        // 실제 서비스 예약 요청 처리 (백엔드 연동 시 주석 해제)
        // bookTrainerService(trainer.id, serviceType, {
        //     date: new Date().toISOString().split('T')[0], // 오늘 날짜
        //     message: '예약 요청 메시지'
        // })
        // .then(result => {
        //     alert('예약이 완료되었습니다.');
        //     console.log('예약 결과:', result);
        // })
        // .catch(error => {
        //     alert(`예약 실패: ${error.message}`);
        // });

        window.location.href = `/trainer-profile.html?id=${trainer.id}&serviceType=${serviceType}`;
    }


    // 트레이너 데이터 로드 함수
    async function loadTrainerData() {
        try {
            // 로딩 표시 (선택사항)
            // document.querySelector('.loading-spinner').style.display = 'block';

            // 백엔드 API에서 트레이너 데이터 가져오기
            // 실제 구현 시 주석 해제
            await fetchTrainers(0);

            // 트레이너 카드 렌더링
            displayTrainers();
        } catch (error) {
            console.error('트레이너 데이터를 가져오는 중 오류 발생:', error);
            // 오류 메시지 표시
            document.querySelector('.trainer-cards-container').innerHTML = `
                <div class="alert alert-danger" role="alert">
                    트레이너 정보를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
                </div>
            `;
        } finally {
            // 로딩 표시 숨기기 (선택사항)
            // document.querySelector('.loading-spinner').style.display = 'none';
        }
    }

    async function fetchTrainers(pageNo) {
        console.log(`pageNo: ${pageNo}`);
        const response = await fetch(`/trainers/users?page=${pageNo}`);
        if (!response.ok) {
            throw new Error(`API 오류: ${response.status}`);
        }

        const data = await response.json();
        const trainers = data.trainerList || [];

        if (trainers.length === 0) {
            throw new Error(`API 오류: ${response.status}`);
        }

        allTrainers = data.trainerList || [];
        totalPages = data.totalPages;

        console.log('allTrainers:', allTrainers);
        console.log(`currentPage: ${currentPage}`);
        console.log('totalPages:', totalPages);
    }

    // 트레이너 상세 정보 가져오기
    async function fetchTrainerDetails(trainerId) {
        try {
            // 실제 구현 시 주석 해제
            // const response = await fetch(`${API_BASE_URL}/trainers/${trainerId}`);
            // if (!response.ok) {
            //     throw new Error(`API 오류: ${response.status}`);
            // }
            // return await response.json();

            // 샘플 데이터에서 해당 트레이너 찾기 (백엔드 연동 시 제거)
            return sampleTrainersData.find(trainer => trainer.id === trainerId) || null;
        } catch (error) {
            console.error(`트레이너 ID ${trainerId}의 상세 정보를 가져오는 중 오류 발생:`, error);
            return null;
        }
    }

    // 트레이너 서비스 예약 요청
    async function bookTrainerService(trainerId, serviceType, bookingDetails) {
        try {
            // 실제 구현 시 주석 해제
            // const response = await fetch(`${API_BASE_URL}/bookings`, {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'Authorization': `Bearer ${getAuthToken()}`
            //     },
            //     body: JSON.stringify({
            //         trainer_id: trainerId,
            //         service_type: serviceType,
            //         ...bookingDetails
            //     })
            // });
            //
            // if (!response.ok) {
            //     const errorData = await response.json();
            //     throw new Error(errorData.message || `API 오류: ${response.status}`);
            // }
            //
            // return await response.json();

            // 백엔드 연동 없이 성공 시뮬레이션 (백엔드 연동 시 제거)
            console.log('예약 요청:', {trainerId, serviceType, ...bookingDetails});
            return {success: true, message: '예약이 완료되었습니다.'};
        } catch (error) {
            console.error('예약 요청 중 오류 발생:', error);
            throw error;
        }
    }

    // 트레이너 필터링 함수
    function filterTrainers(filters = {}) {
        // 실제 구현 시에는 백엔드에 필터링된 데이터 요청
        // 지금은 클라이언트 측에서 샘플 데이터 필터링
        let filteredTrainers = [...sampleTrainersData];

        // 검색어 필터링
        if (filters.searchTerm) {
            const searchTerm = filters.searchTerm.toLowerCase();
            filteredTrainers = filteredTrainers.filter(trainer =>
                trainer.name.toLowerCase().includes(searchTerm) ||
                trainer.description.toLowerCase().includes(searchTerm) ||
                trainer.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        }

        // 필터링된 결과 적용
        allTrainers = filteredTrainers;

        // 총 페이지 수 재계산
        totalPages = Math.ceil(allTrainers.length / ITEMS_PER_PAGE);

        // 현재 페이지가 총 페이지 수를 초과하면 첫 페이지로
        if (currentPage > totalPages) {
            currentPage = 1;
        }

        // 페이지 표시
        displayTrainers();
    }

    // 검색창 이벤트 리스너 설정 (HTML에 검색창이 있는 경우)
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function (e) {
            const searchTerm = e.target.value.trim();
            filterTrainers({searchTerm});
        }, 300));
    }

    // 디바운스 함수 (검색 입력 최적화)
    function debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // 로그인 폼 이벤트 리스너 설정 (HTML에 로그인 폼이 있는 경우)
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                await login(email, password);
                // 로그인 성공 시 처리 (예: 모달 닫기, 페이지 새로고침 등)
                window.location.reload();
            } catch (error) {
                alert(`로그인 실패: ${error.message}`);
            }
        });
    }

    // 페이지 로드 시 트레이너 데이터 로드
    loadTrainerData();
});