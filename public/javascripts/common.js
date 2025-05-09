(function () {
    const refreshToken = localStorage.getItem("refreshToken");
    const loginBtn = document.getElementById("loginBtn");
    const myProfile = document.getElementById("myProfile");

    // 로그인 상태 체크 후 버튼 숨기기/보이기
    if (loginBtn) {
        if (refreshToken) {
            // 로그인 상태일 때 버튼 숨기기
            loginBtn.style.display = "none";
            myProfile.style.display = "block";
        } else {
            // 로그인 상태가 아닐 때 버튼 보이기
            loginBtn.style.display = "block";
            myProfile.style.display = "none";
        }
    }
})();

document.addEventListener("DOMContentLoaded", function () {
    // 모달 기능 초기화
    initModals();
    initKakaoLogin();
    initNaverLogin();
});

/**
 * 모달 기능을 초기화하는 함수
 */
function initModals() {
    const loginBtn = document.getElementById("loginBtn");

    if (loginBtn) {
        const loginModalElement = document.getElementById("loginModal");
        if (loginModalElement) {
            const loginModal = new bootstrap.Modal(loginModalElement);

            // 로그인 버튼 클릭 시 모달 표시
            loginBtn.addEventListener("click", function (e) {
                e.preventDefault();
                loginModal.show();
            });

            loginModalElement.addEventListener("hidden.bs.modal", function () {
                document.getElementById("loginBtn").focus();
            });
        } else {
            console.warn('로그인 모달(id="loginModal")을 찾을 수 없습니다.');
        }
    }
}

function initKakaoLogin() {
    const kakaoLoginBtn = document.querySelector(".btn-kakao");

    kakaoLoginBtn.addEventListener("click", function (e) {
        e.preventDefault();
        window.location.href = `/auth/kakao`;
    });
}

function initNaverLogin() {
    const naverLoginBtn = document.querySelector(".btn-naver");

    naverLoginBtn.addEventListener("click", function (e) {
        e.preventDefault();
        window.location.href = `/auth/naver`;
    });
}
