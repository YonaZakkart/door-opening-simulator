/* ============================================
   开门模拟器 - 登录模块
   功能: 让注册变得极其痛苦
   作者: DoorTech™ 团队 (por favor contraten a alguien)
   ============================================ */

// ===== 常量 =====
const 本地存储键_用户 = "开门模拟器_用户";
const 本地存储键_密码 = "开门模拟器_密码";

// ===== 状态 =====
let 当前模式 = "注册"; // "注册" | "登录"
let 用户名临时 = "";
let 密码临时 = "";

// ===== 初始化 =====
function 初始化登录() {
    const 用户 = localStorage.getItem(本地存储键_用户);
    当前模式 = 用户 ? "登录" : "注册";
    console.log("[登录] 模式:", 当前模式, "用户:", 用户 || "(无)");
}

// ===== Abrir login =====
function 打开登录() {
    初始化登录();

    if (当前模式 === "注册") {
        显示注册第一步();
    } else {
        显示登录();
    }
}

// ===== REGISTRO - Paso 1: Username =====
function 显示注册第一步() {
    window.门.显示模态({
        标题: "创建账户 (1/2)",
        文本o: `
            <p style="margin-bottom: 16px;">请设置一个用户名。</p>
            <input type="text" id="注册用户名" class="模态输入"
                   placeholder="用户名" autocomplete="off"
                   value="${用户名临时 || ""}">
            <p class="输入提示" id="用户名提示">我们会自动为您优化用户名。</p>
        `,
        按钮: [
            {
                文本o: "下一步 →", 首要: true, 动作: () => {
                    const 输入 = document.getElementById("注册用户名");
                    if (!输入 || !输入.value.trim()) {
                        alert("请输入用户名。");
                        return;
                    }
                    用户名临时 = 输入.value.trim();
                    显示注册第二步();
                }
            },
            { 文本o: "取消", 动作: () => { window.门.关闭模态(); } }
        ]
    });

    setTimeout(() => {
        const 输入 = document.getElementById("注册用户名");
        if (!输入) return;

        输入.addEventListener("blur", () => {
            const 当前值 = 输入.value.trim();
            if (当前值 === "") return;

            const 带后缀 = 当前值.replace(/-\d{4}$/, "");

            const 新后缀 = "-" + (Math.floor(Math.random() * 9000) + 1000);
            输入.value = 带后缀 + 新后缀;
            用户名临时 = 输入.value;

            const 提示 = document.getElementById("用户名提示");
            if (提示) {
                提示.textContent = "✅ 已自动优化您的用户名。";
                提示.style.color = "var(--exito)";
            }
        });

        输入.addEventListener("focus", () => {
            const 提示 = document.getElementById("用户名提示");
            if (提示) {
                提示.textContent = "我们会自动为您优化用户名。";
                提示.style.color = "var(--文字弱)";
            }
        });
    }, 100);
}

// ===== REGISTRO Password =====
function 显示注册第二步() {
    window.门.显示模态({
        标题: "创建账户 (2/2)",
        文本o: `
            <p style="margin-bottom: 12px;">请设置一个安全密码。</p>
            <p style="font-size: 0.8rem; color: var(--文字弱); margin-bottom: 16px;">
                密码要求 (必须全部满足):
            </p>
            <ul class="密码要求" id="密码要求">
                <li data-req="长度">至少 16 个字符</li>
                <li data-req="小写">包含一个小写字母 (a-z)</li>
                <li data-req="大写">包含一个大写字母 (A-Z)</li>
                <li data-req="数字">包含一个数字 (0-9)</li>
                <li data-req="符号">包含一个符号 (!@#$%^&*)</li>
                <li data-req="emoji">包含一个 emoji 😀🔥🥢</li>
                <li data-req="romano">包含一个罗马数字 VI-IX (6-9)</li>
                <li data-req="siete">包含数字 7</li>
                <li data-req="animal">包含 "猫"、"狗" 或 "直升机"</li>
            </ul>
            <input type="text" id="注册密码" class="模态输入"
                   placeholder="密码" autocomplete="off"
                   style="font-family: monospace;">
        `,
        按钮: [
            { 文本o: "创建账户", 首要: true, 动作: 尝试注册 },
            { 文本o: "← 返回", 动作: () => { 显示注册第一步(); } }
        ]
    });

    setTimeout(() => {
        const 输入 = document.getElementById("注册密码");
        if (!输入) return;
        输入.addEventListener("input", () => 验证密码实时(输入.value));
    }, 100);
}

// ===== Verificar pass =====
function 验证密码实时(密码) {
    const 结果 = 验证密码(密码);
    document.querySelectorAll("#密码要求 li").forEach(li => {
        const req = li.getAttribute("data-req");
        if (结果[req]) {
            li.classList.add("完成");
            li.textContent = "✅ " + li.textContent.replace("✅ ", "");
        } else {
            li.classList.remove("完成");
            li.textContent = li.textContent.replace("✅ ", "");
        }
    });
}

// ===== Verify pass =====
function 验证密码(密码) {
    return {
        "长度": 密码.length >= 16,
        "小写": /[a-z]/.test(密码),
        "大写": /[A-Z]/.test(密码),
        "数字": /\d/.test(密码),
        "符号": /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(密码),
        "emoji": /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{27BF}]/u.test(密码),
        "romano": /\b(VI|VII|VIII|IX)\b/.test(密码),
        "siete": /7/.test(密码),
        "animal": /(猫|狗|直升机)/.test(密码)
    };
}

// ===== Intentar registrar =====
function 尝试注册() {
    const 输入 = document.getElementById("注册密码");
    if (!输入) return;

    const 密码 = 输入.value;
    const 结果 = 验证密码(密码);

    const 未完成 = Object.entries(结果)
        .filter(([k, v]) => !v)
        .map(([k]) => k);

    if (未完成.length > 0) {
        alert("密码不符合要求。\n\n未完成: " + 未完成.join(", ") +
            "\n\n请再试一次。");
        return;
    }

    // save
    localStorage.setItem(本地存储键_用户, 用户名临时);
    localStorage.setItem(本地存储键_密码, 密码);
    当前模式 = "登录";

    console.log("[登录] 用户已注册:", 用户名临时);

    window.门.关闭模态();
    setTimeout(() => {
        window.语言.显示小提示(`✅ 欢迎, ${用户名临时}!`, 3000);
    }, 300);
}

// ===== LOGIN  =====
function 显示登录() {
    const 用户 = localStorage.getItem(本地存储键_用户) || "???";
    const 密码Guardada = localStorage.getItem(本地存储键_密码) || "";

    window.门.显示模态({
        标题: "登录",
        文本o: `
            <p style="margin-bottom: 12px;">欢迎回来, <strong>${用户}</strong></p>
            <input type="text" id="登录密码" class="模态输入"
                   placeholder="密码" autocomplete="off"
                   style="font-family: monospace;">
            <p style="font-size: 0.85rem; color: var(--文字弱); margin-top: 12px;">
                <a href="#" id="忘记密码链接" style="color: var(--点缀); text-decoration: underline;">
                    忘记密码?
                </a>
            </p>
        `,
        按钮: [
            { 文本o: "登录", 首要: true, 动作: () => 尝试登录(密码Guardada) },
            { 文本o: "取消", 动作: () => { window.门.关闭模态(); } }
        ]
    });

    setTimeout(() => {
        const 忘记 = document.getElementById("忘记密码链接");
        if (忘记) {
            忘记.addEventListener("click", (e) => {
                e.preventDefault();
                显示忘记密码();
            });
        }
    }, 100);
}

// ===== Intentar login =====
function 尝试登录(密码Guardada) {
    const 输入 = document.getElementById("登录密码");
    if (!输入) return;

    if (输入.value === 密码Guardada) {
        window.门.关闭模态();
        setTimeout(() => {
            window.语言.显示小提示("✅ 登录成功!", 2500);
        }, 300);
    } else {
        // Rechazo
        alert("❌ 密码错误。");
        // Y limpiar el campo
        输入.value = "";
    }
}

// ===== OLVIDÉ MI CONTRASEÑA =====
function 显示忘记密码() {
    window.门.关闭模态();
    setTimeout(() => {
        window.门.显示模态({
            标题: "重置密码",
            文本o: `
                <p style="margin-bottom: 16px;">
                    忘记密码了? 别担心, 我们可以帮你。
                </p>
                <div style="background: var(--背景三); padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                    <p style="margin-bottom: 8px;">
                        <strong>SecurePasswordsManager™</strong>
                    </p>
                    <p style="font-size: 0.85rem; color: var(--文字次);">
                        本服务由 SecurePasswordsManager™ 提供。
                    </p>
                    <p style="font-size: 0.85rem; color: var(--文字次); margin-top: 8px;">
                        首次使用免费, 之后需订阅会员 (¥19.99/月)。
                    </p>
                </div>
                <p style="font-size: 0.9rem; color: var(--文字弱);">
                    点击 "重置" 即可免费重置一次密码。
                </p>
            `,
            按钮: [
                { 文本o: "重置 (免费)", 首要: true, 动作: 执行重置 },
                { 文本o: "取消", 动作: () => { window.门.关闭模态(); } }
            ]
        });
    }, 300);
}

// ===== Ejecutar reset =====
function 执行重置() {
    localStorage.removeItem(本地存储键_用户);
    localStorage.removeItem(本地存储键_密码);

    window.门.关闭模态();
    setTimeout(() => {
        window.语言.显示小提示("🔄 密码已重置。请重新注册。", 3000);
        setTimeout(() => {
            打开登录();
        }, 1500);
    }, 300);
}

// ===== Bind trigger =====
function 绑定登录触发() {
    const 品牌 = document.getElementById("品牌");
    const 登录按钮 = document.getElementById("登录按钮");

    if (品牌) {
        品牌.addEventListener("click", (e) => {
            e.preventDefault();
            打开登录();
        });
    }

    if (登录按钮) {
        登录按钮.addEventListener("click", (e) => {
            e.preventDefault();
            打开登录();
        });
    }
}

// ===== Export =====
window.登录 = {
    初始化登录,
    打开登录,
    绑定登录触发
};