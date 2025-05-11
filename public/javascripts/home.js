// --- 채팅 인터페이스 관련 변수 ---
let messages = []; // 채팅 기록 저장용
let waitingForResponse = false; // 응답 대기 중 상태 플래그 (중복 요청 방지)

document.addEventListener('DOMContentLoaded', async function () {

    // 프롬프트 예시 카드 아이템 추가
    initPromptExampleItems();

    // 프롬프트 창 초기화
    initChatInput();

    // 트레이너 카드 클릭 등 다른 기능 초기화
    initTrainerCardClicks();

    // 후기 캐러셀 초기화
    await initReviewCarousel();

    // 훈련사 캐러셀 초기화
    initTrainerSection();

    // 자격증 초기화
    initCertificateSection();
});

/**
 * 카테고리 박스 클릭 시 채팅 메시지를 전송하도록 초기화하는 함수
 */
function initPromptExampleItems() {
    const categoryBoxes = document.querySelectorAll('.category-box');
    const messageInput = document.getElementById('messageInput');

    categoryBoxes.forEach(box => {
        box.addEventListener('click', async function () {
            messageInput.value = this.querySelector('p')?.innerText || '';
            messageInput.dispatchEvent(new Event('input', {bubbles: true}));
            await sendMessage();
        });
    });
}

/**
 * 채팅 입력창 및 전송 버튼 기능 초기화
 */
function initChatInput() {
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');

    if (!messageInput || !sendBtn) return;

    // 입력창에서 Enter 키로 전송
    messageInput.addEventListener('keypress', async function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            await sendMessage();
        }
    });

    // 입력 내용 감지하여 전송 버튼 활성화 여부 처리
    messageInput.addEventListener('input', function () {
        sendBtn.disabled = this.value.trim() === '';
    });

    // 클릭으로 전송
    sendBtn.addEventListener('click', async function () {
        await sendMessage();
    });

    // 초기 버튼 비활성화 상태 설정
    sendBtn.disabled = messageInput.value.trim() === '';
}

/**
 * 트레이너 카드 클릭 이벤트를 초기화하는 함수
 */
function initTrainerCardClicks() {
    document.querySelectorAll('.trainer-card button').forEach(button => {
        button.addEventListener('click', function () {
            const trainerName = this.closest('.trainer-card')?.querySelector('h4')?.textContent;
            if (trainerName) {
                // 실제 상세 페이지 이동 로직 (주석 처리)
                // window.location.href = `/trainer/${trainerName.replace(/\s+/g, '-').toLowerCase()}`;

                // 데모용 알림창
                alert(`${trainerName} 상세 페이지로 이동합니다.`);
            } else {
                console.warn('트레이너 카드를 찾거나 이름을 추출할 수 없습니다.');
            }
        });
    });
}

/**
 * 리뷰 캐러셀 초기화
 */
async function initReviewCarousel() {
    const reviews = await fetchReviews();
    const cardsPerSlide = getCardsPerSlide();
    renderReviewCarousel(reviews, cardsPerSlide);
}

/**
 * 훈련사 섹션 초기화 및 데이터 렌더링
 */
function initTrainerSection() {
    const trainers = fetchTrainers();
    renderTrainerCards(trainers);
    initTrainerCardClicks();
}

/**
 * 자격증 섹션 초기화 및 데이터 렌더링
 */
function initCertificateSection() {
    const certificates = fetchCertificates();
    renderCertificates(certificates);
}

/**
 * 사용자 메시지를 전송하고 봇의 응답을 받아오는 함수
 */
async function sendMessage() {
    const messageInput = document.getElementById('messageInput');

    const message = messageInput.value.trim();
    // 메시지가 비어있거나 응답 대기 중이면 전송하지 않음
    if (message === '' || waitingForResponse) {
        return;
    }

    const timestamp = Date.now();
    appendMessage('user', message);

    // 메시지 기록 저장
    messages.push({role: 'user', content: message, timestamp});

    // 입력창 비우고 높이 초기화
    messageInput.value = '';
    messageInput.style.height = 'auto';
    messageInput.dispatchEvent(new Event('input', {bubbles: true}));

    // "입력 중..." 표시 보여주기
    showTypingIndicator();
    waitingForResponse = true;
    // 봇 응답 요청 함수 호출
    await fetchBotResponse(message);
}

/**
 * 메시지를 채팅 컨테이너에 추가하는 함수
 * @param {string} role - 메시지 역할 ('user' 또는 'assistant')
 * @param {string} content - 메시지 내용 (봇 메시지의 경우 Markdown 포함 가능)
 */
function appendMessage(role, content) {
    const messagesContainer = document.getElementById('chatBoxes');
    if (!messagesContainer) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role === 'user' ? 'user-message' : 'bot-message'} px-3`;

    if (role === 'assistant') {
        if (typeof marked === 'undefined') {
            const contentDiv = document.createElement('div');
            content = content.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
                .replace(/\*(.*?)\*/g, '<i>$1</i>');
            contentDiv.innerHTML = content.replace(/\n/g, '<br>');
            messageDiv.appendChild(contentDiv);
            console.warn('marked.js 라이브러리를 찾을 수 없습니다. Markdown 렌더링이 제한됩니다.');
        } else {
            const markdownContent = document.createElement('div');
            markdownContent.className = 'markdown-content';
            markdownContent.innerHTML = marked.parse(content);
            messageDiv.appendChild(markdownContent);

            if (typeof hljs !== 'undefined') {
                messageDiv.querySelectorAll('pre code').forEach((block) => {
                    try {
                        hljs.highlightElement(block);
                    } catch (error) {
                        console.error("코드 블록 하이라이팅 중 오류 발생:", error, block);
                    }
                });
            } else {
                console.warn('highlight.js (hljs) 라이브러리를 찾을 수 없습니다. 코드 블록이 하이라이팅되지 않습니다.');
            }
        }
    } else {
        messageDiv.textContent = content;
    }

    messagesContainer.appendChild(messageDiv);
    scrollToBottom();
}

/**
 * "입력 중..." 애니메이션 표시를 보여주는 함수
 */
function showTypingIndicator() {
    const messagesContainer = document.getElementById('chatBoxes');
    if (!messagesContainer) {
        return;
    }

    removeTypingIndicator();

    const typingDiv = document.createElement('div');
    typingDiv.className = 'bot-typing';
    typingDiv.id = 'typingIndicator';
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('div');
        dot.className = 'typing-dot';
        typingDiv.appendChild(dot);
    }
    messagesContainer.appendChild(typingDiv);
    scrollToBottom();
    return typingDiv;
}

/**
 * "입력 중..." 애니메이션 표시를 제거하는 함수
 */
function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

/**
 * 백엔드 AI 서비스로부터 응답을 가져오는 함수
 * @param {string} userMessage - 사용자가 입력한 메시지
 */
async function fetchBotResponse(userMessage) {
    try {
        const response = await fetch(`/api/v1/mcp/chat?prompt=${encodeURIComponent(userMessage)}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (response.status === 401) {
            displayLoginModal();
            appendMessage('assistant', '로그인 후 사용해주세요.');
            removeTypingIndicator();
            waitingForResponse = false;
            return;
        }

        if (!response.ok) {
            throw new Error(`서버 오류: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const botMessage = data.message || '응답 데이터를 찾을 수 없습니다.';

        removeTypingIndicator();
        appendMessage('assistant', botMessage);

        // 메시지 기록 저장
        messages.push({role: 'assistant', content: botMessage, timestamp: Date.now()});

    } catch (error) {
        console.error('봇 응답 처리 중 오류 발생:', error);
        removeTypingIndicator(); // "입력 중..." 표시 제거
        appendMessage('assistant', `죄송합니다. 응답을 처리하는 중 오류가 발생했습니다.`);
    } finally {
        // 응답 처리 완료 (성공/실패 무관)
        waitingForResponse = false;
    }
}

/**
 * 메시지 컨테이너의 스크롤을 맨 아래로 이동시키는 함수
 */
function scrollToBottom() {
    const messagesContainer = document.getElementById('messagesContainer');
    if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

function getAccessToken() {
    return localStorage.getItem(`accessToken`);
}

/**
 * 리뷰 데이터를 반환
 * TODO: API 연결할 때 코드 수정 필요
 */
async function fetchReviews() {
    const response = await fetch(`/api/v1/reviews/top-liked?limit=9`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${getAccessToken()}`
        }
    });

    const data = await response.json();

    return data.map(review => ({
        trainer: review.trainerName,
        image: review.reviewImageUrl || "https://placehold.co/400x400?text=No+Image",
        text: review.comment
    }));
}

/**
 * 훈련사 데이터를 가져오는 함수 (더미 데이터)
 * TODO: API 연결할 때 코드 수정 필요
 * @returns {Array} 훈련사 객체 배열
 */
function fetchTrainers() {
    return [
        {
            id: 1,
            name: "김형욱 훈련사",
            image: "https://placehold.co/400x400?text=Trainer+Image+1",
            experience: "16년 경력",
            specialties: ["반려동물 전문", "동물행동 전문"],
            location: "의왕, 안양, 과천 주변 지역 상담가능",
            features: [
                "애견 교육 자격 코칭과정",
                "초보자도 배울 수 있는 훈련법",
                "디액션 애니멀 케어센터 대표",
                "반려동물 행동 교정 전문가",
                "국제 반려동물 관리사 1급 보유"
            ]
        },
        {
            id: 2,
            name: "이민호 훈련사",
            image: "https://placehold.co/400x400?text=Trainer+Image+2",
            experience: "10년 경력",
            specialties: ["반려견 전문", "문제행동 교정"],
            location: "강남, 서초 주변 지역 상담가능",
            features: [
                "국가공인 반려동물 훈련사 1급",
                "KKF 애견 훈련사 2급",
                "반려동물 심리상담 전문가",
                "펫케어 프리미엄 센터 소속",
                "서울대 수의학 특별과정 수료"
            ]
        },
        {
            id: 3,
            name: "박지윤 훈련사",
            image: "https://placehold.co/400x400?text=Trainer+Image+3",
            experience: "8년 경력",
            specialties: ["반려묘 전문", "행동교정 전문"],
            location: "일산, 김포 주변 지역 상담가능",
            features: [
                "고양이 행동 심리 전문가",
                "반려묘 문제행동 교정 코칭",
                "캣페어러 아카데미 수료",
                "펠린 행동학 전문 과정 이수",
                "동물매개치료사 자격증 보유"
            ]
        }
    ];
}

/**
 * 자격증 데이터를 가져오는 함수 (더미 데이터)
 * TODO: API 연결할 때 코드 수정 필요
 * @returns {Array} 자격증 객체 배열
 */
function fetchCertificates() {
    return [
        {
            id: 1,
            title: "반려동물행동교정사",
            image: "https://placehold.co/400x400?text=Certificate+Image+1",
            description: "반려견 행동 교정전문가로, 문제행동 교정과 해결을 위한 전문 지식과 경험을 갖춘 자격증입니다. 반려견의 행동과 심리를 정확히 이해하고 문제 행동을 교정하고, 행동의 원인을 파악해 해결책을 제시합니다.",
            imageRight: false
        },
        {
            id: 2,
            title: "수의 행동학 전문가",
            image: "https://placehold.co/400x400?text=Certificate+Image+2",
            description: "수의학 지식과 동물 행동학을 접목한 전문가입니다. 반려 동물의 행동적 특성과 심리적인 문제를 이해하고, 의학적인 접근과 함께 행동 치료를 할 수 있습니다. 반려견 학대와 같은 이상 행동에 수의적 관점에서 문제를 해결하는 전문가 입니다.",
            imageRight: true
        },
        {
            id: 3,
            title: "반려동물훈련사",
            image: "https://placehold.co/400x400?text=Certificate+Image+3",
            description: "강아지 훈련 전문가라는 기본적인 특성 외에도 가정에서 효과적으로 훈련할 수 있도록 지도하는 역할도 수행합니다. 견종별 특성과 개별 성향에 맞는 맞춤형 훈련 프로그램을 설계하고, 일관성 있게 훈련을 진행하는 방법을 알려드립니다.",
            imageRight: false
        }
    ];
}

/**
 * 현재 화면에 맞는 슬라이드당 카드 개수 반환
 */
function getCardsPerSlide() {
    const width = window.innerWidth;

    // 데스크탑
    if (width >= 992) {
        return 3;
    }
    // 태블릿
    if (width >= 768) {
        return 2;
    }

    // 모바일
    return 1;
}

/**
 * 리뷰 캐러셀 전체 렌더링
 */
function renderReviewCarousel(reviews, cardsPerSlide) {
    const carouselInner = document.querySelector("#reviewCarousel .carousel-inner");
    carouselInner.innerHTML = ""; // 초기화

    const chunked = chunkReviews(reviews, cardsPerSlide);

    chunked.forEach((chunk, index) => {
        const carouselItem = createCarouselItem(chunk, index === 0);
        carouselInner.appendChild(carouselItem);
    });
}

/**
 * 리뷰 배열을 슬라이드 단위로 분할
 */
function chunkReviews(reviews, size) {
    const chunks = [];
    for (let i = 0; i < reviews.length; i += size) {
        chunks.push(reviews.slice(i, i + size));
    }
    return chunks;
}

/**
 * 캐러셀 아이템 생성
 */
function createCarouselItem(reviewChunk, isActive) {
    const item = document.createElement("div");
    item.className = "carousel-item";
    if (isActive) {
        item.classList.add("active");
    }

    const wrapper = document.createElement("div");
    wrapper.className = "review-cards-wrapper";

    reviewChunk.forEach(review => {
        wrapper.appendChild(createReviewCard(review));
    });

    item.appendChild(wrapper);
    return item;
}

/**
 * 개별 리뷰 카드 생성
 */
function createReviewCard(review) {
    const card = document.createElement("div");
    card.className = "review-card";
    card.innerHTML = `
        <div class="review-img-container">
            <img src="${review.image}" alt="Review" class="review-img">
        </div>
        <div class="review-content">
            <h5>${review.trainer}</h5>
            <p>${review.text}</p>
        </div>
    `;
    return card;
}

/**
 * 훈련사 카드를 렌더링하는 함수
 * @param {Array} trainers - 훈련사 객체 배열
 */
function renderTrainerCards(trainers) {
    const container = document.querySelector('.trainer-container');

    // 기존 내용 지우기
    container.innerHTML = '';

    // 각 훈련사 카드 추가
    trainers.forEach(trainer => {
        const trainerCard = createTrainerCard(trainer);
        container.appendChild(trainerCard);
    });
}

/**
 * 개별 훈련사 카드 생성
 * @param {Object} trainer - 훈련사 객체
 * @returns {HTMLElement} - 훈련사 카드 요소
 */
function createTrainerCard(trainer) {
    const col = document.createElement('div');
    col.className = 'col-md-3';

    // 전문 분야 스팬 생성
    const specialtySpans = trainer.specialties.map(specialty =>
        `<span>${specialty}</span>`
    ).join('');

    // 특징 리스트 아이템 생성
    const featureItems = trainer.features.map(feature =>
        `<li>${feature}</li>`
    ).join('');

    col.innerHTML = `
        <div class="trainer-card" data-trainer-id="${trainer.id}">
            <div class="trainer-img-container">
                <img src="${trainer.image}" alt="${trainer.name}" class="trainer-img">
            </div>
            <h4>${trainer.name}</h4>
            <div class="trainer-specialty">
                <span>${trainer.experience}</span>
                ${specialtySpans}
            </div>
            <p class="trainer-location">${trainer.location}</p>
            <ul class="trainer-features">
                ${featureItems}
            </ul>
            <button class="btn btn-warning w-50 mx-auto d-block">자세히 보기</button>
        </div>
    `;

    return col;
}

/**
 * 자격증 섹션을 렌더링하는 함수
 * @param {Array} certificates - 자격증 객체 배열
 */
function renderCertificates(certificates) {
    const container = document.querySelector('.certificate-container');

    // 각 자격증 행 추가
    certificates.forEach((certificate, index) => {
        const certRow = createCertificateRow(certificate, index > 0);
        container.appendChild(certRow);
    });
}

/**
 * 개별 자격증 행 생성
 * @param {Object} certificate - 자격증 객체
 * @param {boolean} addMarginTop - 상단 마진 추가 여부
 * @returns {HTMLElement} - 자격증 행 요소
 */
function createCertificateRow(certificate, addMarginTop) {
    const row = document.createElement('div');
    row.className = `certificate-row${addMarginTop ? ' mt-5' : ''}`;
    row.setAttribute('data-aos', 'fade-up');
    row.setAttribute('data-aos-duration', '1000');

    if (certificate.imageRight) {
        row.innerHTML = `
            <div class="row align-items-center">
                <div class="col-md-8">
                    <h3 class="certificate-title">${certificate.title}</h3>
                    <p class="certificate-desc">${certificate.description}</p>
                </div>
                <div class="col-md-4">
                    <div class="certificate-img-container">
                        <img src="${certificate.image}" alt="${certificate.title}" class="certificate-img">
                    </div>
                </div>
            </div>
        `;
    } else {
        row.innerHTML = `
            <div class="row align-items-center">
                <div class="col-md-4">
                    <div class="certificate-img-container">
                        <img src="${certificate.image}" alt="${certificate.title}" class="certificate-img">
                    </div>
                </div>
                <div class="col-md-8">
                    <h3 class="certificate-title">${certificate.title}</h3>
                    <p class="certificate-desc">${certificate.description}</p>
                </div>
            </div>
        `;
    }

    return row;
}