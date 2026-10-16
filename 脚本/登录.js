/* ============================================
   开门模拟器 - 登录模块 v2
   功能: 让注册变得极其痛苦
   更新: 现在 aún más invasivo
   ============================================ */

// ===== 常量 =====
const 本地存储键_用户 = "开门模拟器_用户";
const 本地存储键_密码 = "开门模拟器_密码";
const 本地存储键_会话 = "开门模拟器_会话"; // se borra al recargar

// ===== 状态 =====
let 当前模式 = "注册"; // "注册" | "登录" | "nuevaCuenta"
let 用户名临时 = "";
let 密码临时 = "";
let 会话激活 = false;

// ===== 初始化 =====
function 初始化登录() {
    const 用户 = localStorage.getItem(本地存储键_用户);

    // ⚠️ IMPORTANTE: la "sesión" siempre empieza cerrada
    // aunque el usuario ya esté guardado. Se debe loguear cada vez.
    会话激活 = false;
    localStorage.removeItem(本地存储键_会话);

    // Determinar modo
    当前模式 = 用户 ? "登录" : "注册";

    console.log("[登录] 模式:", 当前模式, "| 用户 guardado:", 用户 || "(ninguno)");
    console.log("[登录] ⚠️ 会话 cerrada, se requiere login.");
}

// ===== Verificar si está logueado =====
function 已登录() {
    return 会话激活 === true;
}

// ===== 🔒 Interceptor: pedir login si no está logueado =====
// Devuelve true si YA está logueado (puede continuar)
// Devuelve false si NO está logueado (abrió modal y bloqueó)
function 要求登录(回调 = null) {
    if (已登录()) {
        if (回调) 回调();
        return true;
    }

    // Abrir modal de login, con callback opcional
    打开登录(回调);
    return false;
}

// ===== Abrir login =====
function 打开登录(回调 = null) {
    // Guardar callback para ejecutar al loguearse
    window._登录回调 = 回调;

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
            {
                文本o: "取消", 动作: () => {
                    window.门.关闭模态();
                    window._登录回调 = null;
                }
            }
        ]
    });

    // 🐛 Sufijo automático
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

// ===== REGISTRO - Paso 2: Password =====
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

// ===== Verificar contraseña =====
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

function 验证密码实时(密码) {
    const 结果 = 验证密码(密码);
    document.querySelectorAll("#密码要求 li").forEach(li => {
        const req = li.getAttribute("data-req");
        if (结果[req]) {
            li.classList.add("完成");
            if (!li.textContent.startsWith("✅")) {
                li.textContent = "✅ " + li.textContent;
            }
        } else {
            li.classList.remove("完成");
            li.textContent = li.textContent.replace("✅ ", "");
        }
    });
}

// ===== Registrar =====
function 尝试注册() {
    const 输入 = document.getElementById("注册密码");
    if (!输入) return;

    const 密码 = 输入.value;
    const 结果 = 验证密码(密码);
    const 未完成 = Object.entries(结果).filter(([k, v]) => !v).map(([k]) => k);

    if (未完成.length > 0) {
        alert("密码不符合要求。\n\n未完成: " + 未完成.join(", ") + "\n\n请再试一次。");
        return;
    }

    // Guardar
    localStorage.setItem(本地存储键_用户, 用户名临时);
    localStorage.setItem(本地存储键_密码, 密码);
    会话激活 = true;
    当前模式 = "登录";

    console.log("[登录] ✅ 新账户:", 用户名临时);

    window.门.关闭模态();
    setTimeout(() => {
        window.语言.显示小提示(`✅ 欢迎, ${用户名临时}!`, 3000);
        // Ejecutar callback si existía
        if (window._登录回调) {
            const cb = window._登录回调;
            window._登录回调 = null;
            setTimeout(cb, 500);
        }
    }, 300);
}

// ===== LOGIN (ya hay usuario) =====
function 显示登录() {
    const 用户 = localStorage.getItem(本地存储键_用户) || "???";

    window.门.显示模态({
        标题: "登录",
        文本o: `
            <div class="登录用户区">
                <p style="margin-bottom: 4px; font-size: 0.85rem; color: var(--文字弱);">
                    用户名
                </p>
                <div class="用户名Row">
                    <strong id="显示用户名">${用户}</strong>
                    <button id="编辑用户名" class="iconBtn" title="修改用户名">✏️</button>
                </div>
            </div>
            <div style="margin-top: 20px;">
                <p style="margin-bottom: 4px; font-size: 0.85rem; color: var(--文字弱);">
                    密码
                </p>
                <input type="password" id="登录密码" class="模态输入"
                       placeholder="输入密码" autocomplete="off"
                       style="font-family: monospace; margin-top: 0;">
            </div>
            <p style="font-size: 0.85rem; margin-top: 16px; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
                <a href="#" id="忘记密码链接" style="color: var(--点缀); text-decoration: underline;">
                    忘记密码?
                </a>
                <a href="#" id="新账户链接" style="color: var(--点缀); text-decoration: underline;">
                    ➕ 创建新账户
                </a>
            </p>
        `,
        按钮: [
            { 文本o: "登录", 首要: true, 动作: () => 尝试登录() },
            {
                文本o: "取消", 动作: () => {
                    window.门.关闭模态();
                    window._登录回调 = null;
                }
            }
        ]
    });

    setTimeout(() => {
        const 忘记 = document.getElementById("忘记密码链接");
        const 新账户 = document.getElementById("新账户链接");
        const 编辑 = document.getElementById("编辑用户名");

        if (忘记) {
            忘记.addEventListener("click", (e) => {
                e.preventDefault();
                显示忘记密码();
            });
        }

        if (新账户) {
            新账户.addEventListener("click", (e) => {
                e.preventDefault();
                确认新账户();
            });
        }

        if (编辑) {
            编辑.addEventListener("click", (e) => {
                e.preventDefault();
                显示编辑用户名();
            });
        }
    }, 100);
}

// ===== Intentar login =====
function 尝试登录() {
    const 输入 = document.getElementById("登录密码");
    if (!输入) return;

    const 密码Guardada = localStorage.getItem(本地存储键_密码) || "";

    if (输入.value === 密码Guardada) {
        会话激活 = true;
        console.log("[登录] ✅ 会话 iniciada");
        window.门.关闭模态();
        setTimeout(() => {
            window.语言.显示小提示("✅ 登录成功!", 2500);
            // Ejecutar callback
            if (window._登录回调) {
                const cb = window._登录回调;
                window._登录回调 = null;
                setTimeout(cb, 500);
            }
        }, 300);
    } else {
        alert("❌ 密码错误。");
        输入.value = "";
    }
}

// ===== CONFIRMAR NUEVA CUENTA =====
function 确认新账户() {
    window.门.关闭模态();
    setTimeout(() => {
        window.门.显示模态({
            标题: "⚠️ 创建新账户",
            文本o: `
                <p>这会删除您当前的账户:</p>
                <p style="margin: 12px 0; padding: 12px; background: var(--背景三); border-radius: 8px; font-family: monospace;">
                    <strong>${localStorage.getItem(本地存储键_用户) || "???"}</strong>
                </p>
                <p style="color: var(--peligro); font-size: 0.9rem;">
                    此操作无法撤销。
                </p>
            `,
            按钮: [
                {
                    文本o: "✅ 删除并创建新账户", 首要: true, peligro: true, 动作: () => {
                        localStorage.removeItem(本地存储键_用户);
                        localStorage.removeItem(本地存储键_密码);
                        localStorage.removeItem(本地存储键_会话);
                        会话激活 = false;
                        当前模式 = "注册";
                        用户名临时 = "";
                        密码临时 = "";

                        window.门.关闭模态();
                        setTimeout(() => {
                            window.语言.显示小提示("🗑️ 账户已删除。", 2000);
                            setTimeout(() => {
                                显示注册第一步();
                            }, 1200);
                        }, 300);
                    }
                },
                { 文本o: "取消", 动作: () => { 显示登录(); } }
            ]
        });
    }, 300);
}

// ===== EDITAR USERNAME =====
function 显示编辑用户名() {
    const 用户Actual = localStorage.getItem(本地存储键_用户) || "";
    const 带后缀 = 用户Actual.replace(/-\d{4}$/, "");
    const 后缀 = (用户Actual.match(/-\d{4}$/) || [""])[0];

    window.门.显示模态({
        标题: "修改用户名",
        文本o: `
            <p style="margin-bottom: 12px;">当前用户名:</p>
            <p style="margin-bottom: 16px; padding: 10px; background: var(--背景三); border-radius: 8px; font-family: monospace;">
                ${用户Actual}
            </p>
            <p style="margin-bottom: 8px; font-size: 0.85rem;">新用户名 (基础名):</p>
            <input type="text" id="新用户名" class="模态输入"
                   value="${带后缀}" placeholder="username" autocomplete="off">
            <p class="输入提示" id="编辑提示">后缀 <code>${后缀}</code> 会被自动保留。</p>
        `,
        按钮: [
            {
                文本o: "保存", 首要: true, 动作: () => {
                    const 输入 = document.getElementById("新用户名");
                    if (!输入 || !输入.value.trim()) {
                        alert("请输入用户名。");
                        return;
                    }
                    const 新值 = 输入.value.trim().replace(/-\d{4}$/, "") + 后缀;
                    localStorage.setItem(本地存储键_用户, 新值);
                    console.log("[登录] 用户名 cambiado a:", 新值);
                    window.门.关闭模态();
                    setTimeout(() => {
                        window.语言.显示小提示("✏️ 用户名已更新", 2500);
                        setTimeout(() => 显示登录(), 1000);
                    }, 300);
                }
            },
            { 文本o: "← 返回", 动作: () => { 显示登录(); } }
        ]
    });
}

// ===== OLVIDÉ MI CONTRASEÑA =====
function 显示忘记密码() {
    window.门.关闭模态();
    setTimeout(() => {
        window.门.显示模态({
            标题: "重置密码",
            文本o: `
                <p style="margin-bottom: 16px;">忘记密码了? 别担心, 我们可以帮你。</p>
                <div style="background: var(--背景三); padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                    <p style="margin-bottom: 8px;"><strong>SecurePasswordsManager™</strong></p>
                    <p style="font-size: 0.85rem; color: var(--文字次);">
                        本服务由 SecurePasswordsManager™ 提供。
                    </p>
                    <p style="font-size: 0.85rem; color: var(--文字次); margin-top: 8px;">
                        首次使用免费, 之后需订阅会员 (¥19.99/月)。
                    </p>
                </div>
            `,
            按钮: [
                { 文本o: "重置 (免费)", 首要: true, 动作: 执行重置 },
                { 文本o: "取消", 动作: () => { 显示登录(); } }
            ]
        });
    }, 300);
}

// ===== Reset =====
function 执行重置() {
    localStorage.removeItem(本地存储键_密码);
    // ⚠️ NO borramos el usuario, solo la contraseña
    会话激活 = false;

    window.门.关闭模态();
    setTimeout(() => {
        window.语言.显示小提示("🔄 密码已重置。请设置新密码。", 3000);
        setTimeout(() => {
            // Abrir el flujo de registro de contraseña (pero manteniendo username)
            用户名临时 = localStorage.getItem(本地存储键_用户);
            显示注册第二步();
        }, 1500);
    }, 300);
}

// ===== BIND de triggers =====
function 绑定登录触发() {
    // 1. Logo
    const 品牌 = document.getElementById("品牌");
    if (品牌) {
        品牌.addEventListener("click", (e) => {
            e.preventDefault();
            要求登录();
        });
    }

    // 2. Botón "登录"
    const 登录按钮 = document.getElementById("登录按钮");
    if (登录按钮) {
        登录按钮.addEventListener("click", (e) => {
            e.preventDefault();
            要求登录();
        });
    }

    // 3. Botón "点击开门"
    const 开门按钮 = document.getElementById("开门按钮");
    if (开门按钮) {
        开门按钮.addEventListener("click", (e) => {
            if (!已登录()) {
                e.preventDefault();
                e.stopPropagation();
                要求登录(() => {
                    // Cuando se loguee, dispara la puerta
                    window.门.开始开门流程();
                });
            }
        }, true); // captura para interceptar antes
    }

    // 4. Botón "Reclamar premio"
    const 奖品按钮 = document.getElementById("奖品按钮");
    if (奖品按钮) {
        奖品按钮.addEventListener("click", (e) => {
            e.preventDefault();
            要求登录(() => {
                // Cuando se loguee, abre el flujo del premio (Fase 5)
                console.log("[登录] callback premio (Fase 5 pendiente)");
                window.语言.显示小提示("📱 奖品功能即将上线...", 2500);
            });
        });
    }

    // 5. Chat de soporte
    const chatHeader = document.getElementById("chatHeader");
    if (chatHeader) {
        chatHeader.addEventListener("click", (e) => {
            if (!已登录()) {
                e.preventDefault();
                e.stopPropagation();
                要求登录();
            }
        }, true);
    }

    // 6. Anuncios
    document.querySelectorAll(".广告cta").forEach(cta => {
        cta.addEventListener("click", (e) => {
            e.preventDefault();
            要求登录();
        });
    });

    // 7. Scroll profundo → login después de 30s
    let 深Scrolleado = false;
    let 深ScrollTimer = null;

    window.addEventListener("scroll", () => {
        if (已登录() || 深Scrolleado) return;

        const 滚动比例 = window.scrollY / (document.body.scrollHeight - window.innerHeight);
        if (滚动比例 > 0.5) {
            深Scrolleado = true;
            深ScrollTimer = setTimeout(() => {
                if (!已登录()) {
                    console.log("[登录] Scroll profundo detectado - pidiendo login");
                    要求登录();
                }
            }, 30000); // 30 segundos después de bajar
        }
    });
}

// ===== Export =====
window.登录 = {
    初始化登录,
    打开登录,
    要求登录,
    已登录,
    绑定登录触发
};