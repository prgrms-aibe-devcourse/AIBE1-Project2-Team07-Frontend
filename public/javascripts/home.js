document.addEventListener('DOMContentLoaded', function () {
    // --- 채팅 인터페이스 관련 변수 ---
    let messages = []; // 채팅 기록 저장용
    let waitingForResponse = false; // 응답 대기 중 상태 플래그 (중복 요청 방지)

    // 카테고리 박스 이벤트 리스너 추가 (채팅 메시지 전송용)
    initCategoryBoxesForChat(); // 이름 변경 및 기능 수정

    // 검색창 기능 초기화 (채팅 메시지 전송용)
    initSearchForChat(); // 이름 변경 및 기능 수정

    // adjustCarouselItems(); // TODO: 백엔드 API 개발되면 해제 후 개발 필요

    // 트레이너 카드 클릭 등 다른 기능 초기화
    initTrainerCardClicks();

    // 메시지 입력창 관련 기능 초기화 (자동 높이 조절, 전송 버튼 활성화 등)
    initMessageInput();

    /**
     * 카테고리 박스 클릭 시 채팅 메시지를 전송하도록 초기화하는 함수
     */
    function initCategoryBoxesForChat() {
        const categoryBoxes = document.querySelectorAll('.category-box');
        const messageInput = document.getElementById('messageInput');

        if (!messageInput) {
            console.warn('카테고리 박스 기능을 위한 메시지 입력창(id="messageInput")을 찾을 수 없습니다.');
            return;
        }

        categoryBoxes.forEach(box => {
            box.addEventListener('click', function () {
                messageInput.value = this.querySelector('p')?.innerText || '';
                messageInput.dispatchEvent(new Event('input', {bubbles: true}));
                sendMessage();
            });
        });
    }

    /**
     * 검색창 (채팅 입력창) 기능을 초기화하는 함수
     */
    function initSearchForChat() {
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');

        if (messageInput && sendBtn) {
            messageInput.addEventListener('keypress', function (e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });

            sendBtn.addEventListener('click', function () {
                sendMessage();
            });
        } else {
            console.warn('메시지 입력창(id="messageInput") 또는 전송 버튼(id="sendBtn")을 찾을 수 없습니다.');
        }
    }

    /**
     * 메시지 입력창의 자동 높이 조절 및 전송 버튼 상태 관리 기능을 초기화하는 함수
     */
    function initMessageInput() {
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');

        if (messageInput && sendBtn) {
            // 입력 내용에 따라 textarea 높이 자동 조절
            messageInput.addEventListener('input', function () {
                // 내용이 있을 때만 전송 버튼 활성화
                sendBtn.disabled = this.value.trim() === '';
            });

            sendBtn.disabled = messageInput.value.trim() === '';
        }
    }


    /**
     * 사용자 메시지를 전송하고 봇의 응답을 받아오는 함수
     */
    function sendMessage() {
        const messageInput = document.getElementById('messageInput');
        const messagesContainer = document.getElementById('messagesContainer');

        if (!messageInput || !messagesContainer) {
            console.error("메시지 입력창 또는 메시지 컨테이너를 찾을 수 없습니다.");
            return;
        }

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
        fetchBotResponse(message);
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
     * 백엔드 AI 서비스로부터 응답을 가져오는 비동기 함수
     * @param {string} userMessage - 사용자가 입력한 메시지
     */
    async function fetchBotResponse(userMessage) {
        console.log("봇 응답 요청:", userMessage);

        await new Promise(resolve => setTimeout(resolve, 1500));

        try {
            /* --- 실제 API 호출 예시 ---
            // TODO: 백엔드 API 완료되면 수정하기
            // GET 방식 예시
            // const response = await fetch(`/api/llm/chat?prompt=${encodeURIComponent(userMessage)}`, {
            //     method: 'GET',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         // 필요한 경우 인증 헤더 추가
            //         // 'Authorization': 'Bearer ' + localStorage.getItem('token')
            //     }
            // });

            // POST 방식 예시
            // const response = await fetch('/api/llm/chat', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         // 'Authorization': 'Bearer ' + localStorage.getItem('token')
            //     },
            //     body: JSON.stringify({ prompt: userMessage }) // 요청 본문에 메시지 포함
            // });

            // if (!response.ok) { // 응답 상태 코드가 200-299 범위가 아닌 경우
            //     // 서버에서 보낸 오류 메시지를 포함하여 에러 객체 생성
            //     const errorData = await response.json().catch(() => ({})); // 오류 응답 본문 파싱 시도
            //     throw new Error(`API 오류: ${response.status} ${response.statusText}. ${errorData.message || ''}`);
            // }

            // const data = await response.json(); // 성공적인 응답 본문 파싱
            // const botMessage = data.message || '응답 데이터를 찾을 수 없습니다.';
            */

            // 임시값
            const botMessage = `"${userMessage}"에 대한 임시 답변입니다.   
        [네이버](https://www.naver.com)  
        [유튜브](https://www.youtube.com)  
        [구글쓰](https://www.google.com)  
        Markdown **지원** *테스트*. \n\`\`\`javascript\nconsole.log('코드 블록 테스트');\n\`\`\``;

            removeTypingIndicator();
            appendMessage('assistant', botMessage);

            // 메시지 기록 저장
            messages.push({role: 'assistant', content: botMessage, timestamp: Date.now()});

        } catch (error) {
            console.error('봇 응답 처리 중 오류 발생:', error);
            removeTypingIndicator(); // "입력 중..." 표시 제거
            appendMessage('assistant', `죄송합니다. 응답을 처리하는 중 오류가 발생했습니다.\n오류: ${error.message || '알 수 없는 오류'}`);
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

// 화면 크기에 따라 카드 표시 형태 조정
// TODO: 백엔드 API 개발되면 카드 동적으로 추가하게 구현 필요
    function adjustCarouselItems() {
        const windowWidth = window.innerWidth;
        const reviewCards = document.querySelectorAll('.review-card');

        if (windowWidth >= 992) {
            // 데스크탑: 3개씩 표시
            reviewCards.forEach(card => {
                card.style.display = 'flex';
            });
        } else if (windowWidth >= 768) {
            // 태블릿: 2개씩 표시
            document.querySelectorAll('.carousel-item').forEach(item => {
                const cards = item.querySelectorAll('.review-card');
                cards.forEach((card, index) => {
                    if (index < 2) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        } else {
            // 모바일: 1개씩 표시
            document.querySelectorAll('.carousel-item').forEach(item => {
                const cards = item.querySelectorAll('.review-card');
                cards.forEach((card, index) => {
                    if (index === 0) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        }
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
});