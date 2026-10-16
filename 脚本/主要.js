/* ============================================
   开门模拟器 - 主控模块
   负责启动一切
   ============================================ */

console.log("[主要] DoorTech™ 正在启动...");
console.log("[主要] 你只是想开个门。");

// ===== 初始化 =====
async function 启动() {
    // 1. Cargar traducciones
    await 语言.加载翻译();

    // 2. Restaurar estado de idioma
    语言.初始化语言系统();

    // 3. Aplicar traducción actual
    语言.应用翻译(语言.获取当前语言());

    // 4. Bindear eventos de idioma
    // (esto está dentro de 语言.js, pero por claridad:)
    绑定语言事件();

    console.log("[主要] 启动完成。当前语言:", 语言.获取当前语言());
}

// ===== Eventos de idioma (por si no están dentro de 语言.js) =====
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

// ===== 启动 =====
// 等待 DOM 加载完成
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", 启动);
} else {
    启动();
}