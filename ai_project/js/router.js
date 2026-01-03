// 純原生JavaScript路由系統（無刷新跳轉）
class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;
        this.init();
    }

    // 初始化路由
    init() {
        // 監聽瀏覽器前進後退按鈕
        window.addEventListener('popstate', (event) => {
            if (event.state && event.state.route) {
                this.navigateToRoute(event.state.route, false);
            }
        });

        // 處理頁面載入時的路由
        this.handleInitialRoute();
    }

    // 添加路由
    addRoute(route, handler) {
        this.routes[route] = handler;
    }

    // 導航到指定路由
    navigate(route, addToHistory = true) {
        if (addToHistory) {
            // 添加到瀏覽器歷史記錄
            history.pushState({ route: route }, '', route);
        }
        this.navigateToRoute(route, addToHistory);
    }

    // 內部導航方法
    navigateToRoute(route, addToHistory) {
        const handler = this.routes[route];
        if (handler) {
            this.currentRoute = route;
            handler();
        } else {
            console.warn(`Route ${route} not found`);
        }
    }

    // 處理初始路由
    handleInitialRoute() {
        const path = window.location.pathname;
        const route = path === '/' ? '/index.html' : path;

        // 檢查是否是有效的路由
        if (this.routes[route]) {
            this.currentRoute = route;
            // 不添加到歷史記錄，因為這是初始載入
            this.navigateToRoute(route, false);
        }
    }

    // 獲取當前路由
    getCurrentRoute() {
        return this.currentRoute;
    }

    // 獲取端類型（從localStorage）
    getDeviceType() {
        return localStorage.getItem('deviceType') || 'pc';
    }

    // 設置端類型
    setDeviceType(deviceType) {
        localStorage.setItem('deviceType', deviceType);
        // 更新body類別用於樣式適配
        document.body.className = document.body.className.replace(/device-\w+/g, '');
        document.body.classList.add(`device-${deviceType}`);
    }
}

// 創建全局路由實例
const router = new Router();

// 路由處理函數
function handleHomeRoute() {
    // 動態載入首頁內容
    window.location.href = '/pages/home.html';
}

function handleDetectRoute() {
    // 動態載入檢測頁內容
    window.location.href = '/pages/detect.html';
}

// 添加路由
router.addRoute('/pages/home.html', handleHomeRoute);
router.addRoute('/pages/detect.html', handleDetectRoute);

// 導出路由實例
window.router = router;
