export const injectedJS = `
(function() {
  document.documentElement.style.userSelect = 'none';
  
  document.body.style.overflowY = 'scroll'; 
  document.documentElement.style.scrollBehavior = 'smooth';

  let headerVisible = false;
  let touchStartTime = 0;
  let touchStartY = 0;
  let touchEndY = 0;
  let isScrolling = false;
  
  
  function toggleHeader() {
    headerVisible = !headerVisible;
    document.getElementById("floating-header").style.opacity = headerVisible ? "1" : "0";
    document.getElementById("bottom-nav").style.opacity = headerVisible ? "1" : "0";
  }

  document.addEventListener("touchstart", (e) => {
    touchStartTime = Date.now();
    touchStartY = e.touches[0].clientY;
    isScrolling = false;
  });

  document.addEventListener("touchmove", () => {
    isScrolling = true;  // If touch moves significantly, it's a scroll
  });

document.addEventListener("touchend", (e) => {
  touchEndY = e.changedTouches[0].clientY;
  const touchDuration = Date.now() - touchStartTime;
  
  if (touchDuration < 200 && Math.abs(touchStartY - touchEndY) < 100 ) {
    // toggleHeader();
    window.ReactNativeWebView.postMessage("toggleHeader"); // Send message to RN
  }else{
  const scrollPercentage = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
  window.ReactNativeWebView.postMessage(JSON.stringify({ type: "scroll", value: scrollPercentage }));
}
});


  const style = document.createElement("style");
  style.innerHTML = \`
    #floating-header {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 10px;
      text-align: center;
      font-size: 18px;
      opacity: 0;
      transition: opacity 0.1s ease-in-out;
    }
    
    #bottom-nav {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 20px;
      opacity: 0;
      transition: opacity 0.1s ease-in-out;
    }

    .nav-button {
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 10px 15px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 16px;
    }
  \`;
  document.head.appendChild(style);

  const header = document.createElement("div");
  header.id = "floating-header";
  header.innerHTML = "Floating Header";
  document.body.appendChild(header);

  const bottomNav = document.createElement("div");
  bottomNav.id = "bottom-nav";
  bottomNav.innerHTML = \`
    <div class="nav-button" onclick="window.ReactNativeWebView.postMessage('prev')">Prev</div>
    <div class="nav-button" onclick="window.ReactNativeWebView.postMessage('next')">Next</div>
  \`;
  document.body.appendChild(bottomNav);
})();
`;
