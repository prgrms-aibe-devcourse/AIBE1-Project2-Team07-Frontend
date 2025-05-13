(function () {
    const refreshToken = localStorage.getItem("refreshToken");
    const loginBtn = document.getElementById("loginBtn");
    const myProfile = document.getElementById("myProfile");
    const profileName = document.querySelector(".profile-name");
    const profileImg = document.querySelector(".profile-img");
    const trainerBadge = document.querySelector(".trainer-badge-img");
    const userData = JSON.parse(localStorage.getItem("user"));

    // 로그인 상태 체크 후 버튼 숨기기/보이기
    if (loginBtn) {
        if (refreshToken) {
            // 로그인 상태일 때 버튼 숨기기
            loginBtn.style.display = "none";
            myProfile.style.display = "block";
            profileName.textContent = userData.nickname;
            profileImg.src = userData.profileImageUrl;
            if (userData.userRole === "TRAINER") {
                // 트레이너일 때 배지 보이기
                trainerBadge.style.visibility = "inline";
            } else {
                // 트레이너가 아닐 때 배지 숨기기
                trainerBadge.style.display = "none";
            }
        } else {
            // 로그인 상태가 아닐 때 버튼 보이기
            loginBtn.style.display = "block";
            myProfile.style.display = "none";
            profileName.textContent = "";
        }
    }

})();

document.addEventListener("DOMContentLoaded", function () {
    // 모달 기능 초기화
    initModals();
    initKakaoLogin();
    initNaverLogin();
    initLogout();
});

/**
 * 모달 기능을 초기화하는 함수
 */
function initModals() {
    const loginBtn = document.getElementById("loginBtn");

    if (loginBtn) {
        // 로그인 버튼 클릭 시 모달 표시
        loginBtn.addEventListener("click", function (e) {
            e.preventDefault();
            displayLoginModal();
        });
    }
}

function displayLoginModal() {
    const loginModalElement = document.getElementById("loginModal");
    if (loginModalElement) {
        const loginModal = new bootstrap.Modal(loginModalElement);
        loginModal.show();
        loginModalElement.addEventListener("hidden.bs.modal", function () {
            document.getElementById("loginBtn").focus();
        });
    } else {
        console.warn('로그인 모달(id="loginModal")을 찾을 수 없습니다.');
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

function initLogout() {
    const logoutBtn = document.querySelector(".logout-btn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", async function (e) {
            e.preventDefault();
            await logout();
        });
    }
}

async function logout() {
    await fetch("/auth/logout", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    });

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    // 페이지 새로고침
    window.location.href = "/";
}

window.displayLoginModal = displayLoginModal;