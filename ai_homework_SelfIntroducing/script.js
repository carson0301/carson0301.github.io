// 漢堡菜單功能
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// 點擊導航連結時關閉手機菜單
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// 滾動時導航欄樣式變化及性能優化
let scrollTimeout;
let isScrolling = false;

window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');

    // 導航欄樣式變化
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(102, 126, 234, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        navbar.style.backdropFilter = 'none';
    }

    // 性能優化：滑動時暫停粒子動畫
    if (!isScrolling) {
        isScrolling = true;
        // 暫停粒子動畫
        document.querySelectorAll('.particle').forEach(particle => {
            particle.style.animationPlayState = 'paused';
        });
    }

    // 清除之前的timeout
    clearTimeout(scrollTimeout);

    // 設置新的timeout來恢復動畫
    scrollTimeout = setTimeout(() => {
        isScrolling = false;
        document.querySelectorAll('.particle').forEach(particle => {
            particle.style.animationPlayState = 'running';
        });
    }, 150); // 滑動停止150ms後恢復動畫
});

// 滾動動畫效果
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// 監視所有section元素
document.querySelectorAll('.section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
});

// 興趣卡片點擊效果
document.querySelectorAll('.interest-card').forEach(card => {
    card.addEventListener('click', () => {
        card.style.transform = 'scale(0.95)';
        setTimeout(() => {
            card.style.transform = 'scale(1)';
        }, 150);
    });
});

// 獲獎記錄動畫
document.querySelectorAll('.award-content li').forEach((item, index) => {
    item.style.animationDelay = `${index * 0.1}s`;
    item.style.animation = 'fadeInUp 0.6s ease forwards';
    item.style.opacity = '0';
});

// 頁面載入完成後的初始化
document.addEventListener('DOMContentLoaded', () => {
    // 添加載入動畫
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.8s ease';

    setTimeout(() => {
        document.body.style.opacity = '1';
        // 創建粒子效果
        createParticles();
    }, 200);

    // 檢查是否支援Intersection Observer
    if (!('IntersectionObserver' in window)) {
        // 對於不支援的瀏覽器，顯示所有內容
        document.querySelectorAll('.section').forEach(section => {
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        });
    }
});

// 添加鼠標互動粒子效果 - 優化性能版本
document.addEventListener('DOMContentLoaded', () => {
    const heroSection = document.querySelector('.hero-section');

    if (heroSection) {
        let mouseParticles = [];
        let lastMouseMove = 0;
        const mouseThrottle = 100; // 限制鼠標粒子生成頻率

        heroSection.addEventListener('mousemove', (e) => {
            const now = Date.now();
            if (now - lastMouseMove < mouseThrottle) return;
            lastMouseMove = now;

            // 限制粒子數量到5個
            if (mouseParticles.length > 5) {
                const oldParticle = mouseParticles.shift();
                if (oldParticle && oldParticle.parentNode) {
                    oldParticle.parentNode.removeChild(oldParticle);
                }
            }

            const rect = heroSection.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const mouseParticle = document.createElement('div');
            mouseParticle.className = 'mouse-particle';
            mouseParticle.style.cssText = `
                position: absolute;
                width: 3px;
                height: 3px;
                background: rgba(255, 255, 255, 0.6);
                border-radius: 50%;
                left: ${x - 1.5}px;
                top: ${y - 1.5}px;
                pointer-events: none;
                animation: mouseParticleFade 0.8s ease-out forwards;
                z-index: 10;
                will-change: transform, opacity;
            `;

            heroSection.appendChild(mouseParticle);
            mouseParticles.push(mouseParticle);
        });

        // 更頻繁的清理
        setInterval(() => {
            mouseParticles = mouseParticles.filter(particle => {
                if (particle && particle.parentNode) {
                    return true;
                }
                return false;
            });
        }, 500);
    }
});

// 添加鼠標粒子動畫樣式
const mouseParticleStyle = document.createElement('style');
mouseParticleStyle.textContent = `
    @keyframes mouseParticleFade {
        from {
            transform: scale(1);
            opacity: 0.8;
        }
        to {
            transform: scale(0);
            opacity: 0;
        }
    }
`;
document.head.appendChild(mouseParticleStyle);

// 組織項目懸停效果
document.querySelectorAll('.org-item').forEach(item => {
    item.addEventListener('mouseenter', () => {
        item.style.transform = 'translateX(10px)';
    });

    item.addEventListener('mouseleave', () => {
        item.style.transform = 'translateX(0)';
    });
});

// 比賽類別懸停效果
document.querySelectorAll('.competition-category').forEach(category => {
    category.addEventListener('mouseenter', () => {
        category.style.transform = 'translateY(-5px)';
    });

    category.addEventListener('mouseleave', () => {
        category.style.transform = 'translateY(0)';
    });
});

// 鍵盤導航支援
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    }
});

// 防止手機端橡皮筋效果
document.addEventListener('touchmove', (e) => {
    if (e.target.closest('.nav-menu')) {
        e.stopPropagation();
    }
}, { passive: false });

// 添加一些統計數據動畫（如果需要）
function animateNumbers() {
    const stats = [
        { element: '.competition-count', target: 25 }, // 總比賽數量
        { element: '.award-count', target: 8 } // 獲獎數量
    ];

    stats.forEach(stat => {
        const element = document.querySelector(stat.element);
        if (element) {
            let current = 0;
            const increment = stat.target / 100;
            const timer = setInterval(() => {
                current += increment;
                if (current >= stat.target) {
                    current = stat.target;
                    clearInterval(timer);
                }
                element.textContent = Math.floor(current);
            }, 20);
        }
    });
}

// 頁面載入後延遲執行動畫
setTimeout(animateNumbers, 2000);

// 性能檢測函數
function shouldEnableParticles() {
    // 檢測設備性能
    const isLowEndDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;
    const isSlowConnection = navigator.connection && (navigator.connection.effectiveType === 'slow-2g' || navigator.connection.effectiveType === '2g');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    return !isLowEndDevice && !isSlowConnection && !prefersReducedMotion;
}

// 添加粒子效果
function createParticles() {
    const heroSection = document.querySelector('.hero-section');
    if (!heroSection) return;

    // 如果不應該啟用粒子效果，則只創建基本的背景
    if (!shouldEnableParticles()) {
        console.log('粒子效果已禁用以提升性能');
        return;
    }

    // 創建閃爍星星粒子 - 減少數量以提升性能
    for (let i = 0; i < 30; i++) {
        const star = document.createElement('div');
        star.className = 'particle star-particle';
        star.style.cssText = `
            position: absolute;
            width: ${Math.random() * 3 + 1}px;
            height: ${Math.random() * 3 + 1}px;
            background: rgba(255, 255, 255, ${Math.random() * 0.8 + 0.3});
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: starTwinkle ${Math.random() * 4 + 3}s ease-in-out infinite alternate;
            animation-delay: ${Math.random() * 3}s;
            pointer-events: none;
            box-shadow: 0 0 ${Math.random() * 4 + 2}px rgba(255, 255, 255, 0.6);
            will-change: transform, opacity;
        `;
        heroSection.appendChild(star);
    }

    // 創建彩色光點粒子 - 減少數量
    for (let i = 0; i < 15; i++) {
        const colorParticle = document.createElement('div');
        colorParticle.className = 'particle color-particle';
        const colors = ['#667eea', '#764ba2', '#fa709a', '#fee140', '#4facfe', '#00f2fe'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        colorParticle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 6 + 2}px;
            height: ${Math.random() * 6 + 2}px;
            background: ${color};
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: colorFloat ${Math.random() * 20 + 15}s linear infinite;
            animation-delay: ${Math.random() * 5}s;
            pointer-events: none;
            box-shadow: 0 0 ${Math.random() * 8 + 4}px ${color}80;
            will-change: transform, opacity;
        `;
        heroSection.appendChild(colorParticle);
    }

    // 創建幾何形狀粒子 - 減少數量
    for (let i = 0; i < 8; i++) {
        const geoParticle = document.createElement('div');
        geoParticle.className = 'particle geo-particle';
        const shapes = ['square', 'triangle', 'diamond'];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        let borderRadius = '0';

        switch(shape) {
            case 'square':
                borderRadius = '0';
                break;
            case 'triangle':
                borderRadius = '0';
                geoParticle.style.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
                break;
            case 'diamond':
                borderRadius = '0';
                geoParticle.style.transform = 'rotate(45deg)';
                break;
        }

        geoParticle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 4 + 2}px;
            height: ${Math.random() * 4 + 2}px;
            background: rgba(255, 255, 255, ${Math.random() * 0.4 + 0.2});
            border-radius: ${borderRadius};
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: geoDrift ${Math.random() * 25 + 20}s linear infinite;
            animation-delay: ${Math.random() * 10}s;
            pointer-events: none;
            opacity: ${Math.random() * 0.6 + 0.3};
            will-change: transform, opacity;
        `;
        heroSection.appendChild(geoParticle);
    }

    // 創建流星效果 - 減少數量
    for (let i = 0; i < 2; i++) {
        const meteor = document.createElement('div');
        meteor.className = 'particle meteor';
        meteor.style.cssText = `
            position: absolute;
            width: ${Math.random() * 100 + 50}px;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
            left: -100px;
            top: ${Math.random() * 50}%;
            animation: meteorFall ${Math.random() * 8 + 5}s linear infinite;
            animation-delay: ${Math.random() * 15 + i * 5}s;
            pointer-events: none;
            transform: rotate(${Math.random() * 20 - 10}deg);
            will-change: transform;
        `;
        heroSection.appendChild(meteor);
    }

    // 創建發光環粒子 - 減少數量
    for (let i = 0; i < 5; i++) {
        const ringParticle = document.createElement('div');
        ringParticle.className = 'particle ring-particle';
        ringParticle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 20 + 10}px;
            height: ${Math.random() * 20 + 10}px;
            border: 1px solid rgba(255, 255, 255, ${Math.random() * 0.3 + 0.1});
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: ringExpand ${Math.random() * 6 + 4}s ease-out infinite;
            animation-delay: ${Math.random() * 4}s;
            pointer-events: none;
            will-change: transform, opacity;
        `;
        heroSection.appendChild(ringParticle);
    }
}

// 添加浮動動畫樣式 - 優化性能
const particleStyle = document.createElement('style');
particleStyle.textContent = `
    @keyframes float {
        from {
            transform: translate3d(0px, 0px, 0) rotate(0deg);
            opacity: 0;
        }
        10% { opacity: 1; }
        90% { opacity: 1; }
        to {
            transform: translate3d(0px, -100vh, 0) rotate(360deg);
            opacity: 0;
        }
    }

    @keyframes starTwinkle {
        0% {
            transform: scale3d(1, 1, 1);
            opacity: 0.3;
        }
        50% {
            transform: scale3d(1.5, 1.5, 1);
            opacity: 1;
        }
        100% {
            transform: scale3d(1, 1, 1);
            opacity: 0.3;
        }
    }

    @keyframes colorFloat {
        from {
            transform: translate3d(0px, 0px, 0) rotate(0deg);
            opacity: 0.2;
        }
        25% {
            opacity: 0.8;
        }
        50% {
            transform: translate3d(20px, -30px, 0) rotate(180deg);
            opacity: 1;
        }
        75% {
            opacity: 0.6;
        }
        to {
            transform: translate3d(-20px, -100vh, 0) rotate(360deg);
            opacity: 0;
        }
    }

    @keyframes geoDrift {
        from {
            transform: translate3d(0px, 0px, 0) rotate(0deg);
            opacity: 0.1;
        }
        20% {
            opacity: 0.7;
        }
        60% {
            transform: translate3d(30px, -40px, 0) rotate(120deg);
            opacity: 0.9;
        }
        80% {
            opacity: 0.5;
        }
        to {
            transform: translate3d(-30px, -100vh, 0) rotate(240deg);
            opacity: 0;
        }
    }

    @keyframes meteorFall {
        from {
            transform: translate3d(-100px, 0px, 0);
            opacity: 0;
        }
        10% {
            opacity: 1;
        }
        90% {
            opacity: 1;
        }
        to {
            transform: translate3d(calc(100vw + 100px), calc(100vh + 100px), 0);
            opacity: 0;
        }
    }

    @keyframes ringExpand {
        from {
            transform: scale3d(0.5, 0.5, 1);
            opacity: 0.8;
        }
        50% {
            transform: scale3d(1.5, 1.5, 1);
            opacity: 0.4;
        }
        to {
            transform: scale3d(2, 2, 1);
            opacity: 0;
        }
    }

    @keyframes cardPulse {
        0%, 100% {
            transform: translate3d(0, 0, 0);
        }
        50% {
            transform: translate3d(0, -5px, 0);
        }
    }

    @keyframes mouseParticleFade {
        from {
            transform: scale3d(1, 1, 1);
            opacity: 0.8;
        }
        to {
            transform: scale3d(0, 0, 1);
            opacity: 0;
        }
    }

    .interest-card {
        animation: cardPulse 6s ease-in-out infinite;
        will-change: transform;
    }

    .competition-category:hover {
        animation-play-state: paused;
    }

    /* 性能優化：減少濾鏡使用 */
    .star-particle {
        /* 移除模糊濾鏡以提升性能 */
    }

    .color-particle {
        /* 移除模糊濾鏡以提升性能 */
    }

    .geo-particle {
        /* 移除模糊濾鏡以提升性能 */
    }

    .meteor {
        /* 移除模糊濾鏡以提升性能 */
    }

    .ring-particle {
        /* 移除模糊濾鏡以提升性能 */
    }

    /* 硬件加速優化 */
    .particle {
        backface-visibility: hidden;
        perspective: 1000px;
    }
`;
document.head.appendChild(particleStyle);

// 添加載入進度指示器（可選）
const loadingBar = document.createElement('div');
loadingBar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 0%;
    height: 3px;
    background: linear-gradient(90deg, #667eea, #764ba2);
    z-index: 9999;
    transition: width 0.3s ease;
`;

document.body.appendChild(loadingBar);

// 監視頁面載入進度
let loadedImages = 0;
const totalImages = document.querySelectorAll('img').length;

if (totalImages > 0) {
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('load', () => {
            loadedImages++;
            loadingBar.style.width = `${(loadedImages / totalImages) * 100}%`;

            if (loadedImages === totalImages) {
                setTimeout(() => {
                    loadingBar.style.opacity = '0';
                    setTimeout(() => loadingBar.remove(), 300);
                }, 500);
            }
        });
    });
} else {
    // 如果沒有圖片，快速完成載入
    setTimeout(() => {
        loadingBar.style.width = '100%';
        setTimeout(() => {
            loadingBar.style.opacity = '0';
            setTimeout(() => loadingBar.remove(), 300);
        }, 500);
    }, 100);
}
