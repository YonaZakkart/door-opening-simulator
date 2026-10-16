/* ============================================
   开门模拟器 - 语言模块
   功能: 只允许切换一次语言, 之后收费
   作者: DoorTech™ 团队 (其实就一个人)
   ============================================ */

// ===== 全局状态 =====
let 当前语言代码 = "中文";           // 当前语言
let 语言数据 = {};                    // 加载的翻译数据
let 免费切换已使用 = false;           // 是否已用掉免费切换

// ===== 常量 =====
const 本地存储键_语言 = "开门模拟器_语言";
const 本地存储键_已切换 = "开门模拟器_语言已切换";
const 支持的语言 = ["中文", "Español", "English"];

// ===== 初始化: 从 localStorage 恢复状态 =====
function 初始化语言系统() {
    // 恢复已保存的语言
    const 保存的语言 = localStorage.getItem(本地存储键_语言);
    if (保存的语言 && 支持的语言.includes(保存的语言)) {
        当前语言代码 = 保存的语言;
    }

    // 恢复"是否已用免费切换"的状态
    const 已切换标记 = localStorage.getItem(本地存储键_已切换);
    免费切换已使用 = 已切换标记 === "真";

    // 更新 UI 上的语言显示
    更新当前语言显示();
}

// ===== 加载翻译文件 =====
async function 加载翻译() {
    try {
        const 响应 = await fetch("数据/语言.json");
        if (!响应.ok) {
            throw new Error("翻译文件加载失败: " + 响应.status);
        }
        语言数据 = await 响应.json();
        console.log("[语言] 翻译已加载, 可用语言:", Object.keys(语言数据));
    } catch (错误) {
        console.error("[语言] 无法加载翻译:", 错误);
        // 如果加载失败, 至少让页面能用中文默认值
        语言数据 = { "中文": {} };
    }
}

// ===== 应用翻译到页面 =====
function 应用翻译(语言代码) {
    const 翻译 = 语言数据[语言代码];
    if (!翻译) {
        console.warn("[语言] 找不到语言:", 语言代码);
        return;
    }

    // 遍历所有带 data-i18n 属性的元素
    document.querySelectorAll("[data-i18n]").forEach(元素 => {
        const 键 = 元素.getAttribute("data-i18n");
        if (翻译[键]) {
            元素.textContent = 翻译[键];
        }
    });

    // 遍历所有带 data-i18n-placeholder 属性的元素
    document.querySelectorAll("[data-i18n-placeholder]").forEach(元素 => {
        const 键 = 元素.getAttribute("data-i18n-placeholder");
        if (翻译[键]) {
            元素.placeholder = 翻译[键];
        }
    });

    // 更新 HTML lang 属性
    const 语言代码映射 = {
        "中文": "zh-CN",
        "Español": "es",
        "English": "en"
    };
    document.documentElement.lang = 语言代码映射[语言代码] || "zh-CN";

    // 更新页面标题
    document.title = 翻译.marca + " · DoorTech™";

    console.log("[语言] 已应用语言:", 语言代码);
}

// ===== 更新按钮上显示的语言 =====
function 更新当前语言显示() {
    const 显示元素 = document.getElementById("当前语言");
    if (显示元素) {
        显示元素.textContent = 当前语言代码;
    }
}

// ===== 尝试切换语言 (核心逻辑) =====
function 尝试切换语言(目标语言) {
    // 如果选的是同一个语言, 什么都不做
    if (目标语言 === 当前语言代码) {
        return;
    }

    // 如果目标语言不是免费支持的
    if (!支持的语言.includes(目标语言)) {
        显示付费弹窗("该语言需要高级会员");
        return;
    }

    // 关键: 检查是否已经用过免费切换
    if (免费切换已使用) {
        console.log("[语言] 免费切换已用完, 弹出付费窗口");
        显示付费弹窗();
        return;
    }

    // 执行切换
    真正切换语言(目标语言);

    // 标记已用掉免费切换
    免费切换已使用 = true;
    localStorage.setItem(本地存储键_已切换, "真");
    localStorage.setItem(本地存储键_语言, 目标语言);

    // 提示用户这是他唯一一次免费切换
    setTimeout(() => {
        const 提示词 = 语言数据[目标语言]?.idiomaCambiado
            || "Language switched! This was your only free switch.";
        显示小提示(提示词);
    }, 500);
}

// ===== 执行真正的切换 =====
function 真正切换语言(目标语言) {
    当前语言代码 = 目标语言;
    应用翻译(目标语言);
    更新当前语言显示();
    console.log("[语言] 已切换到:", 目标语言);
}

// ===== 显示付费弹窗 =====
function 显示付费弹窗(自定义消息) {
    const 翻译 = 语言数据[当前语言代码] || 语言数据["中文"];

    const 标题 = 自定义消息 || 翻译.modalIdiomaTitulo || "免费试用已结束";
    const 文本o = 自定义消息
        ? "该语言需要高级会员才能使用。"
        : (翻译.modalIdiomaTexto || "您已经使用过免费的语言切换。");
    const 价格 = 翻译.modalIdiomaPrecio || "¥ 9.99 / 月";
    const 按钮购买 = 翻译.modalIdiomaComprar || "立即购买";
    const 按钮取消 = 翻译.modalIdiomaCancelar || "以后再说";
    const 感谢语 = 翻译.modalIdiomaGracias || "感谢您的兴趣! 但是暂时无法购买。";

    // 构建弹窗 HTML
    const 弹窗HTML = `
        <div class="模态">
            <div class="模态标题">${标题}</div>
            <div class="模态文本o">
                <p>${文本o}</p>
                <p style="margin-top: 16px; font-size: 1.4rem; font-weight: 700; color: var(--点缀);">
                    ${价格}
                </p>
                <p style="margin-top: 12px; font-size: 0.85rem; color: var(--文字弱);">
                    🔒 Русский · 日本語 · Português · 文言文 · Klingon · Dothraki
                </p>
            </div>
            <div class="模态按钮组">
                <button class="模态按钮" id="模态取消">${按钮取消}</button>
                <button class="模态按钮 首要" id="模态购买">${按钮购买}</button>
            </div>
        </div>
    `;

    // 显示模态
    打开模态(弹窗HTML);

    // 绑定按钮
    document.getElementById("模态购买").addEventListener("click", () => {
        关闭模态();
        setTimeout(() => {
            显示小提示(感谢语, 4000);
        }, 200);
    });

    document.getElementById("模态取消").addEventListener("click", () => {
        关闭模态();
    });
}

// ===== 模态控制 (基础版, 之后会增强) =====
function 打开模态(html内容) {
    const 覆盖 = document.getElementById("模态覆盖");
    const 容器 = document.getElementById("模态容器");
    容器.innerHTML = html内容;
    覆盖.classList.add("显示");
    容器.classList.add("显示");
    document.body.style.overflow = "hidden";
}

function 关闭模态() {
    const 覆盖 = document.getElementById("模态覆盖");
    const 容器 = document.getElementById("模态容器");
    覆盖.classList.remove("显示");
    容器.classList.remove("显示");
    document.body.style.overflow = "";
    容器.innerHTML = "";
}

// ===== 显示小提示 (toast) =====
function 显示小提示(文本o, 时长 = 3000) {
    // 移除已有的提示
    const 旧提示 = document.getElementById("全局提示");
    if (旧提示) 旧提示.remove();

    const 提示 = document.createElement("div");
    提示.id = "全局提示";
    提示.textContent = 文本o;
    提示.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        background: var(--背景次);
        color: var(--文字主);
        padding: 14px 24px;
        border: 1px solid var(--点缀);
        border-radius: var(--radioPeq);
        font-size: 0.9rem;
        font-weight: 500;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        z-index: 2000;
        opacity: 0;
        transition: all 0.3s ease;
        max-width: 90vw;
        text-align: center;
        font-family: inherit;
    `;

    document.body.appendChild(提示);

    // 动画入场
    requestAnimationFrame(() => {
        提示.style.opacity = "1";
        提示.style.transform = "translateX(-50%) translateY(0)";
    });

    // 自动移除
    setTimeout(() => {
        提示.style.opacity = "0";
        提示.style.transform = "translateX(-50%) translateY(20px)";
        setTimeout(() => 提示.remove(), 300);
    }, 时长);
}

// ===== 绑定事件 =====
function 绑定语言事件() {
    // 打开/关闭语言菜单
    const 语言按钮 = document.getElementById("语言按钮");
    const 语言菜单 = document.getElementById("语言菜单");

    语言按钮.addEventListener("click", (事件) => {
        事件.stopPropagation();
        语言菜单.classList.toggle("显示");
    });

    // 点击选项切换语言
    document.querySelectorAll(".语言选项").forEach(选项 => {
        选项.addEventListener("click", (事件) => {
            事件.stopPropagation();

            // Si está deshabilitado (idiomas premium bloqueados), no hacer nada
            if (选项.disabled) return;

            const 目标语言 = 选项.getAttribute("data-lang");
            // 映射 data-lang 到语言名称
            const 映射 = {
                "zh": "中文",
                "es": "Español",
                "en": "English"
            };
            尝试切换语言(映射[目标语言]);
            语言菜单.classList.remove("显示");
        });
    });

    // 点击外部关闭菜单
    document.addEventListener("click", () => {
        语言菜单.classList.remove("显示");
    });
}

// ===== 导出给其他模块用 =====
window.语言 = {
    初始化语言系统,
    加载翻译,
    应用翻译,
    尝试切换语言,
    显示小提示,
    打开模态,
    关闭模态,
    获取当前语言: () => 当前语言代码,
    获取翻译: () => 语言数据[当前语言代码] || 语言数据["中文"]
};