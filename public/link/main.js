window.onload = function () {
  // 현재 URL 가져오기
  const currentUrl = new URL(window.location.href);

  // URL의 Path와 Query 추출
  const path = currentUrl.pathname.replace("/api/", ""); // '/api/' 제거
  const query = currentUrl.search; // Query 그대로 사용

  // Custom Scheme URL 생성
  const customSchemeUrl = `roomix://${path}${query}`;

  // 플랫폼 및 디바이스 확인
  const userAgent = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isAndroid = /android/.test(userAgent);
  const isMacOS = /macintosh/.test(userAgent) && !isIOS; // macOS 확인

  const appStoreUrl = "https://apps.apple.com/app/6478477325";
  const playStoreUrl =
    "https://play.google.com/store/apps/details?id=xyz.rarement.roomix";

  if (isIOS || isAndroid) {
    // 모바일: 앱 스킴으로 리다이렉트
    window.location.href = customSchemeUrl;

    // Fallback 처리
    setTimeout(function () {
      if (isIOS) {
        window.location.href = appStoreUrl;
      } else if (isAndroid) {
        window.location.href = playStoreUrl;
      }
    }, 2000); // 앱이 설치되지 않았다고 가정하는 대기 시간
  } else if (isMacOS) {
    // 데스크탑: macOS인 경우 App Store로 리다이렉트
    window.location.href = appStoreUrl;
  } else {
    // 데스크탑: macOS가 아닌 경우 Play Store로 리다이렉트
    window.location.href = playStoreUrl;
  }
};

// Fallback 링크 설정
const userAgent = navigator.userAgent.toLowerCase();
const isIOS = /iphone|ipad|ipod/.test(userAgent);
const isMacOS = /macintosh/.test(userAgent) && !isIOS;
const appStoreUrl = "https://apps.apple.com/app/6478477325";
const playStoreUrl =
  "https://play.google.com/store/apps/details?id=xyz.rarement.roomix";

// 적절한 Fallback 링크 설정
document.getElementById("store-link").href =
  isIOS || isMacOS ? appStoreUrl : playStoreUrl;
