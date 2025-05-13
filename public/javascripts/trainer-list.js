const TrainerSortType = {
    LATEST: 'LATEST',
    REVIEWS: 'REVIEWS',
    RATING: 'RATING'
};

const TrainerSearchType = {
    ALL: 'ALL',
    TITLE: 'TITLE',
    CONTENT: 'CONTENT',
    LOCATION: 'LOCATION',
    NICKNAME: 'NICKNAME',
    NAME: 'NAME'
};

let currentSort = TrainerSortType.LATEST;
let currentSearchType = TrainerSearchType.ALL;
let currentSearchKeyword = ''; // 이 부분이 누락되었습니다

document.addEventListener('DOMContentLoaded', function () {
    // 페이지네이션 설정
    const ITEMS_PER_PAGE = 5;
    let currentPage = 1;
    let totalPages = 1;
    let allTrainers = [];

    function initSearchUI() {
        // 이미 검색 UI가 존재하는지 확인
        if (document.querySelector('.trainer-search-container')) {
            return;
        }

        // 검색 컨테이너 생성
        const searchContainer = document.createElement('div');
        searchContainer.className = 'trainer-search-container mb-4';

        // 검색 폼 HTML 생성
        searchContainer.innerHTML = `
    <div class="row justify-content-center">
        <div class="col-lg-8">
            <div class="search-container">
                <div class="input-group">
                    <select class="form-select search-category" id="searchTypeSelect" style="max-width: 150px;">
                        <option value="${TrainerSearchType.ALL}">전체</option>
                        <option value="${TrainerSearchType.TITLE}">제목</option>
                        <option value="${TrainerSearchType.CONTENT}">내용</option>
                        <option value="${TrainerSearchType.LOCATION}">위치</option>
                        <option value="${TrainerSearchType.NAME}">이름</option>
                        <option value="${TrainerSearchType.NICKNAME}">닉네임</option>
                    </select>
                    <input type="text" class="form-control" placeholder="검색어를 입력해주세요" id="searchKeywordInput">
                    <button class="btn btn-warning btn-search" type="button" id="searchBtn">검색</button>
                </div>
            </div>
        </div>
    </div>
    `;

        // 컨테이너 요소 찾기 (h1의 부모 요소)
        const containerDiv = document.querySelector('.trainer-section .container');
        if (containerDiv) {
            // h1 요소 찾기
            const trainerSectionTitle = containerDiv.querySelector('h1');

            if (trainerSectionTitle) {
                // h1 요소 다음에 검색 UI 삽입
                containerDiv.insertBefore(searchContainer, trainerSectionTitle.nextSibling);
            } else {
                // h1 요소가 없는 경우 컨테이너의 첫 번째 자식으로 삽입
                containerDiv.prepend(searchContainer);
            }

            // 이벤트 핸들러 추가
            initSearchEventHandlers();
        } else {
            console.error('.trainer-section .container 요소를 찾을 수 없습니다.');
        }
    }

    function generateStars(rating) {
        const fullStar = '<i class="fas fa-star" style="color: gold;"></i>';
        const halfStar = '<i class="fas fa-star-half-alt" style="color: gold;"></i>';
        const emptyStar = '<i class="far fa-star" style="color: #ccc;"></i>';
        let stars = '';

        for (let i = 1; i <= 5; i++) {
            if (i <= Math.floor(rating)) {
                stars += fullStar;
            } else if (i - 0.5 <= rating) {
                stars += halfStar;
            } else {
                stars += emptyStar;
            }
        }

        return stars;
    }

    function initSearchEventHandlers() {
        const searchBtn = document.getElementById('searchBtn');
        const searchKeywordInput = document.getElementById('searchKeywordInput');
        const searchTypeSelect = document.getElementById('searchTypeSelect');

        if (!searchBtn || !searchKeywordInput || !searchTypeSelect) {
            return;
        }

        // 검색 버튼 클릭 이벤트
        searchBtn.addEventListener('click', function () {
            performSearch();
        });

        // 엔터 키 이벤트
        searchKeywordInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });

        // 검색 타입 변경 이벤트 (선택적)
        searchTypeSelect.addEventListener('change', function () {
            // 검색 타입만 변경하고 즉시 검색은 실행하지 않음
            currentSearchType = this.value;
        });
    }

    function performSearch() {
        const searchKeywordInput = document.getElementById('searchKeywordInput');
        const searchTypeSelect = document.getElementById('searchTypeSelect');

        if (!searchKeywordInput || !searchTypeSelect) {
            return;
        }

        const keyword = searchKeywordInput.value.trim();
        const searchType = searchTypeSelect.value;

        // 검색 상태 업데이트
        currentSearchKeyword = keyword;
        currentSearchType = searchType;

        // 페이지 초기화 및 데이터 다시 로드
        currentPage = 1;
        loadTrainerData();
    }

    function initSortOptions() {
        // 이미 정렬 옵션이 존재하는지 확인
        if (document.querySelector('.sort-options')) {
            return;
        }

        const sortContainer = document.createElement('div');
        sortContainer.className = 'sort-options mb-4';

        const sortList = document.createElement('ul');
        sortList.className = 'sort-list';

        // 정렬 옵션 생성
        const sortOptions = [
            {text: '최신순', value: TrainerSortType.LATEST},
            {text: '리뷰많은순', value: TrainerSortType.REVIEWS},
            {text: '평점높은순', value: TrainerSortType.RATING}
        ];

        // 정렬 옵션 아이템 생성 및 이벤트 연결
        sortOptions.forEach(option => {
            const sortItem = document.createElement('li');
            sortItem.className = 'sort-item';
            if (option.value === currentSort) {
                sortItem.classList.add('active');
            }

            const sortLink = document.createElement('a');
            sortLink.className = 'sort-link';
            sortLink.href = '#';
            sortLink.textContent = option.text;

            sortItem.appendChild(sortLink);
            sortList.appendChild(sortItem);

            // 클릭 이벤트 핸들러
            sortItem.addEventListener('click', function (e) {
                e.preventDefault();

                // 활성화 클래스 제거
                document.querySelectorAll('.sort-item').forEach(item => {
                    item.classList.remove('active');
                });

                // 클릭한 아이템 활성화
                this.classList.add('active');

                // 정렬 타입 변경 및 데이터 다시 로드
                currentSort = option.value;
                currentPage = 1; // 페이지 초기화
                loadTrainerData();
            });
        });

        sortContainer.appendChild(sortList);

        const trainerContainer = document.querySelector('.trainer-cards-container');
        if (trainerContainer && trainerContainer.parentNode) {
            trainerContainer.parentNode.insertBefore(sortContainer, trainerContainer);
        }
    }

    function renderTrainerCards(trainers) {
        const container = document.querySelector('.trainer-cards-container');
        const template = document.getElementById('trainer-card-template');

        // 컨테이너 초기화
        container.innerHTML = '';

        // 트레이너 데이터가 없는 경우 메시지 표시
        if (!trainers || trainers.length === 0) {
            container.innerHTML = `
                <div class="alert alert-info" role="alert">
                    트레이너 정보가 없습니다.
                </div>
            `;
            return;
        }

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
            const trainerImage = cardClone.querySelector('.trainer-image img');
            if (trainerImage) {
                trainerImage.src = trainer.photos?.[0]?.fileUrl || 'images/cat.png';
            }

            const profileImg = cardClone.querySelector('.trainer-profile-img');
            if (profileImg) {
                profileImg.src = trainer.profileImageUrl || 'images/basic_profile.png';
            }

            // 텍스트 데이터 설정
            const trainerName = cardClone.querySelector('.trainer-name');
            if (trainerName) {
                const certName = trainer.certifications?.[0]?.certName;
                trainerName.textContent = `${trainer.name}${certName ? ' · ' + certName : ''}`;
            }

            const trainerDesc = cardClone.querySelector('.trainer-description');
            if (trainerDesc) {
                trainerDesc.textContent = trainer.introduction || '';
            }

            const rating = cardClone.querySelector('.rating');
            if (rating) {
                rating.innerHTML = generateStars(trainer.averageRating) + ` ${trainer.averageRating.toFixed(1)}/5점 (${trainer.reviewCount}명)`;
            }

            const trainerTags = cardClone.querySelector('.trainer-tags');
            if (trainerTags) {
                trainerTags.textContent = Array.isArray(trainer.specializations)
                    ? trainer.specializations.map(tag => `#${tag}`).join(' ')
                    : '';
            }

            // 가격 설정
            const priceElements = cardClone.querySelectorAll('.price-value');
            const serviceFees = trainer.serviceFees || [];

            // 각 서비스 타입에 맞는 요금 찾기
            const visitFee = serviceFees.find(fee => fee.serviceType === 'VISIT_TRAINING')?.feeAmount || 0;
            const videoFee = serviceFees.find(fee => fee.serviceType === 'VIDEO_TRAINING')?.feeAmount || 0;

            if (priceElements.length >= 2) {
                priceElements[0].textContent = `${visitFee.toLocaleString()}원`;  // 방문 훈련
                priceElements[1].textContent = `${videoFee.toLocaleString()}원`;  // 화상 훈련
            }

            // 버튼 이벤트 설정
            const consultBtn = cardClone.querySelector('.consultation-btn');
            const visitBtn = cardClone.querySelector('.visit-btn');

            // 상담 버튼
            if (consultBtn) {
                consultBtn.addEventListener('click', e => {
                    e.stopPropagation();
                    window.location.href = `/trainers/profile/${trainer.nickname}?serviceType=video`;
                });
            }

            // 방문 버튼
            if (visitBtn) {
                visitBtn.addEventListener('click', e => {
                    e.stopPropagation();
                    window.location.href = `/trainers/profile/${trainer.nickname}?serviceType=visit`;
                });
            }

            // 컨테이너에 카드 추가
            container.appendChild(cardClone);
        });
    }

    // 페이지네이션 렌더링 함수
    function renderPagination() {
        const paginationContainer = document.getElementById('pagination-container');
        if (!paginationContainer) {
            console.error('pagination-container를 찾을 수 없습니다.');
            return;
        }

        paginationContainer.innerHTML = '';

        // 총 페이지가 없으면 페이지네이션 표시하지 않음
        if (totalPages <= 0) {
            return;
        }

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
            prevBtn.addEventListener('click', function (e) {
                e.preventDefault();
                goToPage(currentPage - 1);
            });
            paginationContainer.appendChild(prevBtn);
        }

        // 페이지 번호 버튼
        for (let i = startPage; i <= endPage; i++) {
            const pageItem = document.createElement('li');
            pageItem.className = `page-item ${i === currentPage ? 'active' : ''}`;
            pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            pageItem.addEventListener('click', function (e) {
                e.preventDefault();
                goToPage(i);
            });
            paginationContainer.appendChild(pageItem);
        }

        // 다음 페이지 버튼
        if (currentPage < totalPages) {
            const nextBtn = document.createElement('li');
            nextBtn.className = 'page-item';
            nextBtn.innerHTML = '<a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a>';
            nextBtn.addEventListener('click', function (e) {
                e.preventDefault();
                goToPage(currentPage + 1);
            });
            paginationContainer.appendChild(nextBtn);
        }
    }

    // 특정 페이지로 이동하는 함수
    async function goToPage(page) {
        currentPage = page;
        await fetchTrainers(page - 1); // 0-based 페이지 인덱스를 사용하므로 page - 1
        displayTrainers();
    }

    // 현재 페이지에 표시할 트레이너 필터링 및 표시
    function displayTrainers() {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;

        // 현재 페이지에 맞는 트레이너만 표시 (백엔드에서 이미 페이지네이션 처리된 데이터가 옴)
        const pageTrainers = allTrainers;
        console.log('pageTrainers:', pageTrainers);

        renderTrainerCards(pageTrainers);
        renderPagination();
    }

    // 트레이너 데이터 로드 함수
    async function loadTrainerData() {
        try {
            // 검색 UI 초기화 (한 번만 실행되도록)
            initSearchUI();

            // 정렬 옵션 초기화 (한 번만 실행되도록)
            initSortOptions();

            // 백엔드 API에서 트레이너 데이터 가져오기
            await fetchTrainers(currentPage - 1);

            // 트레이너 카드 렌더링
            displayTrainers();
        } catch (error) {
            console.error('트레이너 데이터를 가져오는 중 오류 발생:', error);
            const container = document.querySelector('.trainer-cards-container');
            if (container) {
                container.innerHTML = `
                    <div class="alert alert-danger" role="alert">
                        트레이너 정보를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
                    </div>
                `;
            }
        }
    }

    async function fetchTrainers(pageNo) {
        // API URL 구성
        let url = `/api/v1/trainers/open?page=${pageNo}&sortType=${currentSort}`;

        // 검색어가 있는 경우 검색 파라미터 추가
        if (currentSearchKeyword) {
            url += `&keyword=${encodeURIComponent(currentSearchKeyword)}&searchType=${currentSearchType}`;
        }

        console.log(`API 요청 URL: ${url}`);

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API 오류: ${response.status}`);
        }

        const data = await response.json();
        console.log('API 응답 데이터:', data);

        const trainers = data.trainerList || [];

        if (trainers.length === 0 && currentSearchKeyword) {
            // 검색 결과가 없는 경우 메시지 표시
            const container = document.querySelector('.trainer-cards-container');
            if (container) {
                container.innerHTML = `
                    <div class="alert alert-info" role="alert">
                        '${currentSearchKeyword}'에 대한 검색 결과가 없습니다.
                    </div>
                `;
            }
            allTrainers = [];
            totalPages = 0;
            return;
        }

        allTrainers = data.trainerList || [];
        totalPages = data.totalPages || 0;

        console.log('allTrainers:', allTrainers);
        console.log(`currentPage: ${currentPage}`);
        console.log('totalPages:', totalPages);
    }

    // 디바운스 함수 (검색 입력 최적화)
    function debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // 페이지 로드 시 트레이너 데이터 로드
    loadTrainerData();
});