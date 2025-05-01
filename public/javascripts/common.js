document.addEventListener('DOMContentLoaded', function () {
    // 모달 기능 초기화
    initModals();

    /**
     * 모달 기능을 초기화하는 함수
     */
    function initModals() {
        const loginBtn = document.getElementById('loginBtn');

        if (loginBtn) {
            const loginModalElement = document.getElementById('loginModal');
            if (loginModalElement) {
                const loginModal = new bootstrap.Modal(loginModalElement);

                // 로그인 버튼 클릭 시 모달 표시
                loginBtn.addEventListener('click', function (e) {
                    e.preventDefault();
                    loginModal.show();
                });

                loginModalElement.addEventListener('hidden.bs.modal', function () {
                    document.getElementById('loginBtn').focus();
                });

            } else {
                console.warn('로그인 모달(id="loginModal")을 찾을 수 없습니다.');
            }
        }
    }
})