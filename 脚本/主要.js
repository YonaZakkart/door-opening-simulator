/* ============================================
   开门模拟器 - 主控模块
   ============================================ */

console.log("[主要] DoorTech™ 正在启动...");
console.log("[主要] 你只是想开个门。");

async function 启动() {
    // 1. Cargar traducciones
    await 语言.加载翻译();

    // 2. Restaurar estado de idioma
    语言.初始化语言系统();

    // 3. Aplicar traducción actual
    语言.应用翻译(语言.获取当前语言());

    // 4. Inicializar puerta
    门.初始化门();

    // 5. Inicializar login
    登录.初始化登录();      // 👈 NUEVO

    // 6. Bindear eventos de idioma
    绑定语言事件();

    // 7. Bindear links del footer a las páginas fake
    绑定FooterLinks();

    // 8. Bindear login (logo + botón)
    登录.绑定登录触发();    // 👈 NUEVO

    console.log("[主要] 启动完成。当前语言:", 语言.获取当前语言());
}

function 绑定语言事件() {
    const 语言按钮 = document.getElementById("语言按钮");
    const 语言菜单 = document.getElementById("语言菜单");

    if (!语言按钮 || !语言菜单) return;

    语言按钮.addEventListener("click", (事件) => {
        事件.stopPropagation();
        语言菜单.classList.toggle("显示");
    });

    document.querySelectorAll(".语言选项").forEach(选项 => {
        选项.addEventListener("click", (事件) => {
            事件.stopPropagation();
            if (选项.disabled) return;

            const 代码 = 选项.getAttribute("data-lang");
            const 映射 = { "zh": "中文", "es": "Español", "en": "English" };
            window.语言.尝试切换语言(映射[代码]);
            语言菜单.classList.remove("显示");
        });
    });

    document.addEventListener("click", () => {
        语言菜单.classList.remove("显示");
    });
}

function 绑定FooterLinks() {
    // Changelog, Careers, Blog, Cookies → abrir "páginas"
    const 链接映射 = {
        "footerChangelog": "changelog",
        "footerCareers": "careers",
        "footerBlog": "blog",
        "footerCookies": "cookies"
    };

    Object.entries(链接映射).forEach(([键, 页面ID]) => {
        const 元素 = document.querySelector(`[data-i18n="${键}"]`);
        if (元素 && 元素.tagName === "A") {
            元素.addEventListener("click", (e) => {
                e.preventDefault();
                window.页面.打开页面(页面ID);
            });
        }
    });
}

// ===== 启动 =====
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", 启动);
} else {
    启动();
}