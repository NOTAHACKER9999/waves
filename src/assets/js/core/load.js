try {
  if (localStorage.getItem('backend') !== 'ultraviolet' && typeof window['$scramjetLoadController'] === 'function') {
    const controllerFactory = window['$scramjetLoadController']();
    const ScramjetControllerRef = controllerFactory['ScramjetController'];
    const scramjet = new ScramjetControllerRef({
      prefix: "/b/s/",
      files: {
        wasm: "/b/s/scramjet.wasm.wasm",
        all: "/b/s/scramjet.all.js",
        sync: "/b/s/scramjet.sync.js"
      },
      flags: {
        rewriterLogs: true
      }
    });
    window.scramjetReady = scramjet.init();
  } else {
    window.scramjetReady = Promise.resolve();
  }
} catch(e) {
  console.warn("Could not initialize Scramjet, which is expected if you are on Ultraviolet.");
  window.scramjetReady = Promise.resolve();
}

document.addEventListener('DOMContentLoaded', function () {
  const searchBar = document.querySelector('.search-bar');
  if (searchBar) {
    const lightBg = searchBar.querySelector('.light');
    const lightBorder = searchBar.querySelector('.light-border');
    const lightSize = 400;

    let targetX = 0, currentX = 0, lastX = 0, velocityX = 0;
    let targetY = 0, currentY = 0, lastY = 0, velocityY = 0;
    let raf;

    function animate() {
      currentX += (targetX - currentX) * 0.15;
      currentY += (targetY - currentY) * 0.15;

      const elasticX = Math.min(Math.max(velocityX * 0.5, -20), 20);
      const elasticY = Math.min(Math.max(velocityY * 0.5, -20), 20);

      const bgX = `${currentX - lightSize / 2 + elasticX}px`;
      const bgY = `${currentY - lightSize / 2 + elasticY}px`;

      lightBg.style.setProperty('--bg-x', bgX);
      lightBg.style.setProperty('--bg-y', bgY);
      lightBorder.style.setProperty('--bg-x', bgX);
      lightBorder.style.setProperty('--bg-y', bgY);

      raf = requestAnimationFrame(animate);
    }

    searchBar.addEventListener('mouseenter', () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(animate);
      lightBg.style.opacity = 1;
      lightBorder.style.opacity = 1;
      lightBg.style.transition = "opacity 0.4s ease, transform 0.4s ease, filter 0.6s ease";
      lightBorder.style.transition = "opacity 0.4s ease, transform 0.4s ease, filter 0.6s ease";
      lightBg.style.filter = "blur(20px)";
      lightBorder.style.filter = "blur(6px)";

      setTimeout(() => {
        lightBg.style.transform = "scale(1)";
        lightBg.style.filter = "blur(12px)";
        lightBorder.style.transform = "scale(1)";
        lightBorder.style.filter = "blur(4px)";
      }, 300);
    });

    searchBar.addEventListener('mouseleave', () => {
      cancelAnimationFrame(raf);
      lightBg.style.transition = "opacity 0.6s ease, transform 0.6s ease, filter 0.6s ease";
      lightBorder.style.transition = "opacity 0.6s ease, transform 0.6s ease, filter 0.6s ease";
      lightBg.style.opacity = 0;
      lightBorder.style.opacity = 0;
      lightBg.style.transform = "scale(0.95)";
      lightBorder.style.transform = "scale(0.95)";
      lightBg.style.filter = "blur(30px)";
      lightBorder.style.filter = "blur(12px)";
    });

    searchBar.addEventListener('mousemove', (e) => {
      const rect = searchBar.getBoundingClientRect();
      targetX = e.clientX - rect.left;
      targetY = e.clientY - rect.top;
      velocityX = targetX - lastX;
      velocityY = targetY - lastY;
      lastX = targetX;
      lastY = targetY;
      const glowStrength = Math.min(1.2, 1.2 + targetX / rect.width * 0.4);
      lightBg.style.transform = `scale(${glowStrength})`;
    });
  }

  window.xinUpdater.init();
  window.SharePromoter.init();

  const erudaBtn = document.getElementById('erudaBtn');
  if (erudaBtn) {
    erudaBtn.addEventListener('click', toggleEruda);
  }

  if (window.NProgress) {
    NProgress.configure({ showSpinner: false });
  }

  const titleElement = document.querySelector(".search-title");
  const phrases = ["hihihi", "<33", "Uhh....", "Hello!"];
  if (titleElement) {
    titleElement.textContent = phrases[Math.floor(Math.random() * phrases.length)];
  }
});

// All ad-related functions removed: loadBannerAdsSequentially, loadAdScriptWithRetry, and window.load event blocks
