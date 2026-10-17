/* ============================================
   开门模拟器 - 奖品模块
   功能: 用"你赢了!"的消息骗取用户数据
   作者: DoorTech™ 团队 (por favor, no nos demanden)
   ============================================ */

// ===== 常量 =====
const 本地存储键_奖品进度 = "开门模拟器_奖品进度";
const 本地存储键_奖品完成 = "开门模拟器_奖品完成";

// ===== 状态 =====
let 奖品状态 = {
    当前步骤: 0,          // 0 = no iniciado, 1-6 = pasos, 7 = completado
    数据: {
        姓名: "",
        国家: "",
        地区: "",
        电话: "",
        邮箱: "",
        卡号: "",
        有效期: "",
        cvv: ""
    },
    时间戳: null
};

// ===== 初始化 =====
function 初始化奖品() {
    const 保存 = localStorage.getItem(本地存储键_奖品进度);
    if (保存) {
        try {
            奖品状态 = JSON.parse(保存);
        } catch (e) {
            console.warn("[奖品] 状态恢复失败");
        }
    }

    const 完成 = localStorage.getItem(本地存储键_奖品完成);
    if (完成 === "真") {
        console.log("[奖品] El usuario ya 'ganó' el premio antes.");
    }

    console.log("[奖品] 初始化完成. 步骤:", 奖品状态.当前步骤);
}

// ===== Guardar estado =====
function 保存奖品状态() {
    奖品状态.时间戳 = Date.now();
    localStorage.setItem(本地存储键_奖品进度, JSON.stringify(奖品状态));
}

// ===== Iniciar flujo (llamado desde 登录 callback) =====
function 开始奖品流程() {
    // Si ya completó el premio
    if (localStorage.getItem(本地存储键_奖品完成) === "真") {
        window.门.显示模态({
            标题: "🎁 你已经领过了",
            文本o: `
                <p>你已经领取过奖品了。</p>
                <p style="margin-top: 12px; color: var(--文字弱); font-size: 0.9rem;">
                    但是! 我们有一个新的机会:
                </p>
                <p style="margin-top: 8px; padding: 12px; background: var(--背景三); border-radius: 8px;">
                    <strong>MacBook Pro 2026</strong><br>
                    <span style="font-size: 0.85rem; color: var(--文字次);">
                        只需再填一次表即可参与!
                    </span>
                </p>
            `,
            按钮: [
                {
                    文本o: "🎉 参与新抽奖", 首要: true, 动作: () => {
                        // Reset silencioso para que vuelva a empezar
                        localStorage.removeItem(本地存储键_奖品完成);
                        奖品状态.当前步骤 = 0;
                        奖品状态.数据 = {};
                        保存奖品状态();
                        window.门.关闭模态();
                        setTimeout(() => 显示步骤_姓名(), 300);
                    }
                },
                { 文本o: "😑 不了", 动作: () => { window.门.关闭模态(); } }
            ]
        });
        return;
    }

    // Si hay progreso guardado, preguntar si continuar
    if (奖品状态.当前步骤 > 0 && 奖品状态.当前步骤 < 7) {
        window.门.显示模态({
            标题: "🎁 继续领奖?",
            文本o: `
                <p>你有未完成的奖品领取进度。</p>
                <p style="margin-top: 12px; color: var(--文字弱); font-size: 0.9rem;">
                    上次保存于: ${new Date(奖品状态.时间戳).toLocaleString()}
                </p>
            `,
            按钮: [
                {
                    文本o: "▶️ 继续", 首要: true, 动作: () => {
                        window.门.关闭模态();
                        setTimeout(() => 恢复步骤(奖品状态.当前步骤), 300);
                    }
                },
                {
                    文本o: "🔄 重新开始", 动作: () => {
                        奖品状态.当前步骤 = 0;
                        奖品状态.数据 = {};
                        保存奖品状态();
                        window.门.关闭模态();
                        setTimeout(() => 显示步骤_姓名(), 300);
                    }
                },
                { 文本o: "❌ 取消", 动作: () => { window.门.关闭模态(); } }
            ]
        });
        return;
    }

    // Empezar de cero
    显示步骤_姓名();
}

// ===== Restaurar según paso =====
function 恢复步骤(步骤) {
    switch (步骤) {
        case 1: 显示步骤_姓名(); break;
        case 2: 显示步骤_国家(); break;
        case 3: 显示步骤_地区(); break;
        case 4: 显示步骤_电话(); break;
        case 5: 显示步骤_邮箱(); break;
        case 6: 显示步骤_信用卡(); break;
        default: 显示步骤_姓名();
    }
}

// ===== Utilidades =====
function 等待(毫秒) {
    return new Promise(解决 => setTimeout(解决, 毫秒));
}

function 进度指示器(步骤) {
    const 总步骤 = 6;
    let html = '<div style="display: flex; gap: 6px; margin-bottom: 20px; justify-content: center;">';
    for (let i = 1; i <= 总步骤; i++) {
        const 完成 = i < 步骤;
        const 当前 = i === 步骤;
        const 颜色 = 完成 ? "var(--exito)" : (当前 ? "var(--点缀)" : "var(--背景三)");
        html += `<div style="
            width: 32px; height: 32px;
            border-radius: 50%;
            background: ${颜色};
            color: ${完成 || 当前 ? "#0f172a" : "var(--文字弱)"};
            display: flex; align-items: center; justify-content: center;
            font-weight: 700; font-size: 0.85rem;
            transition: all 0.3s;
        ">${完成 ? "✓" : i}</div>`;
    }
    html += '</div>';
    return html;
}

function 验证指示器(文本o) {
    return `
        <div class="验证动画" style="
            display: flex; align-items: center; gap: 10px;
            padding: 12px; background: var(--背景三);
            border-radius: 8px; margin-top: 12px;
            font-size: 0.85rem; color: var(--文字次);
        ">
            <div class="spinner" style="
                width: 16px; height: 16px;
                border: 2px solid var(--文字弱);
                border-top-color: var(--点缀);
                border-radius: 50%;
                animation: 旋转 0.8s linear infinite;
            "></div>
            <span>${文本o}</span>
        </div>
    `;
}

// ===== PASO 1: Nombre =====
function 显示步骤_姓名() {
    奖品状态.当前步骤 = 1;
    保存奖品状态();

    window.门.显示模态({
        标题: "🎁 领取 iPhone 17 Pro Max",
        文本o: `
            ${进度指示器(1)}
            <p style="margin-bottom: 16px;">首先, 告诉我们你的名字。</p>
            <input type="text" id="奖品姓名" class="模态输入"
                   placeholder="姓名" autocomplete="off"
                   value="${奖品状态.数据.姓名 || ""}">
            <p class="输入提示">我们会严格保密 (不, 其实不会)。</p>
        `,
        按钮: [
            { 文本o: "下一步 →", 首要: true, 动作: 提交姓名 },
            { 文本o: "取消", 动作: () => { window.门.关闭模态(); } }
        ]
    });
}

async function 提交姓名() {
    const 输入 = document.getElementById("奖品姓名");
    if (!输入 || !输入.value.trim()) {
        alert("请输入姓名。");
        return;
    }
    if (输入.value.trim().length < 2) {
        alert("姓名太短了。");
        return;
    }

    奖品状态.数据.姓名 = 输入.value.trim();
    保存奖品状态();

    // 🐛 "Verificación" falsa
    window.门.显示模态({
        标题: "验证中...",
        文本o: `
            ${进度指示器(1)}
            ${验证指示器("正在验证您的姓名...")}
        `,
        按钮: []
    });

    await 等待(2000);

    显示步骤_国家();
}

// ===== PASO 2: País =====
function 显示步骤_国家() {
    奖品状态.当前步骤 = 2;
    保存奖品状态();

    const 国家列表 = [
        "中国", "美国", "墨西哥", "西班牙", "阿根廷", "哥伦比亚",
        "秘鲁", "智利", "委内瑞拉", "厄瓜多尔", "危地马拉", "古巴",
        "玻利维亚", "洪都拉斯", "巴拉圭", "萨尔瓦多", "尼加拉瓜",
        "哥斯达黎加", "巴拿马", "乌拉圭", "波多黎各", "República Dominicana"
    ];

    window.门.显示模态({
        标题: "🎁 领取 iPhone 17 Pro Max",
        文本o: `
            ${进度指示器(2)}
            <p style="margin-bottom: 16px;">你在哪个国家?</p>
            <select id="奖品国家" class="模态输入" style="cursor: pointer;">
                <option value="">-- 请选择 --</option>
                ${国家列表.map(国 => `<option value="${国}" ${奖品状态.数据.国家 === 国 ? "selected" : ""}>${国}</option>`).join("")}
            </select>
            <p class="输入提示">我们支持全球发货 (仅限部分地区)。</p>
        `,
        按钮: [
            { 文本o: "下一步 →", 首要: true, 动作: 提交国家 },
            { 文本o: "← 返回", 动作: () => { 显示步骤_姓名(); } }
        ]
    });
}

async function 提交国家() {
    const 输入 = document.getElementById("奖品国家");
    if (!输入 || !输入.value) {
        alert("请选择国家。");
        return;
    }

    奖品状态.数据.国家 = 输入.value;
    保存奖品状态();

    window.门.显示模态({
        标题: "验证中...",
        文本o: `
            ${进度指示器(2)}
            ${验证指示器("正在确认该地区的配送可行性...")}
        `,
        按钮: []
    });

    await 等待(1800);
    显示步骤_地区();
}

// ===== PASO 3: Región =====
function 显示步骤_地区() {
    奖品状态.当前步骤 = 3;
    保存奖品状态();

    window.门.显示模态({
        标题: "🎁 领取 iPhone 17 Pro Max",
        文本o: `
            ${进度指示器(3)}
            <p style="margin-bottom: 16px;">你在哪个地区/省份?</p>
            <input type="text" id="奖品地区" class="模态输入"
                   placeholder="例如: 北京市, CDMX, Madrid..." autocomplete="off"
                   value="${奖品状态.数据.地区 || ""}">
            <p class="输入提示">必须精确到街道 (其实不需要)。</p>
        `,
        按钮: [
            { 文本o: "下一步 →", 首要: true, 动作: 提交地区 },
            { 文本o: "← 返回", 动作: () => { 显示步骤_国家(); } }
        ]
    });
}

async function 提交地区() {
    const 输入 = document.getElementById("奖品地区");
    if (!输入 || !输入.value.trim()) {
        alert("请输入地区。");
        return;
    }

    奖品状态.数据.地区 = 输入.value.trim();
    保存奖品状态();

    window.门.显示模态({
        标题: "验证中...",
        文本o: `
            ${进度指示器(3)}
            ${验证指示器("正在与当地政府核实地址...")}
        `,
        按钮: []
    });

    await 等待(2500);
    显示步骤_电话();
}

// ===== PASO 4: Teléfono =====
function 显示步骤_电话() {
    奖品状态.当前步骤 = 4;
    保存奖品状态();

    window.门.显示模态({
        标题: "🎁 领取 iPhone 17 Pro Max",
        文本o: `
            ${进度指示器(4)}
            <p style="margin-bottom: 16px;">你的电话号码?</p>
            <input type="tel" id="奖品电话" class="模态输入"
                   placeholder="电话号码" autocomplete="off"
                   value="${奖品状态.数据.电话 || ""}"
                   style="font-family: monospace;">
            <p class="输入提示">必须包含 11 位数字, 必须以 1 开头。</p>
        `,
        按钮: [
            { 文本o: "下一步 →", 首要: true, 动作: 提交电话 },
            { 文本o: "← 返回", 动作: () => { 显示步骤_地区(); } }
        ]
    });
}

async function 提交电话() {
    const 输入 = document.getElementById("奖品电话");
    if (!输入) return;

    const 值 = 输入.value.trim().replace(/\s/g, "");

    // Validación absurda pero "realista"
    if (!/^1\d{10}$/.test(值)) {
        alert("❌ 电话号码格式错误。\n\n必须: 11 位数字, 以 1 开头。\n例如: 13812345678");
        return;
    }

    奖品状态.数据.电话 = 值;
    保存奖品状态();

    window.门.显示模态({
        标题: "验证中...",
        文本o: `
            ${进度指示器(4)}
            ${验证指示器("正在发送验证码到 " + 值 + "...")}
        `,
        按钮: []
    });

    await 等待(2500);

    // 🐛 Segundo paso: "verificación de código" falsa
    显示验证码电话();
}

function 显示验证码电话() {
    window.门.显示模态({
        标题: "验证手机号",
        文本o: `
            ${进度指示器(4)}
            <p style="margin-bottom: 16px;">
                我们已向 <strong>${奖品状态.数据.电话}</strong> 发送了验证码。
            </p>
            <input type="text" id="奖品验证码" class="模态输入"
                   placeholder="6 位验证码" maxlength="6"
                   style="font-family: monospace; font-size: 1.5rem; text-align: center; letter-spacing: 8px;">
            <p class="输入提示">验证码已过期。(但你可以随便输)</p>
        `,
        按钮: [
            { 文本o: "验证 →", 首要: true, 动作: 提交验证码 },
            { 文本o: "← 返回", 动作: () => { 显示步骤_电话(); } }
        ]
    });
}

async function 提交验证码() {
    const 输入 = document.getElementById("奖品验证码");
    if (!输入) return;

    const 值 = 输入.value.trim();
    if (值.length !== 6) {
        alert("验证码必须是 6 位。");
        return;
    }

    // 🐛 Acepta CUALQUIER cosa de 6 dígitos
    window.门.显示模态({
        标题: "验证中...",
        文本o: `
            ${进度指示器(4)}
            ${验证指示器("正在确认验证码...")}
        `,
        按钮: []
    });

    await 等待(1800);
    显示步骤_邮箱();
}

// ===== PASO 5: Email =====
function 显示步骤_邮箱() {
    奖品状态.当前步骤 = 5;
    保存奖品状态();

    window.门.显示模态({
        标题: "🎁 领取 iPhone 17 Pro Max",
        文本o: `
            ${进度指示器(5)}
            <p style="margin-bottom: 16px;">你的邮箱地址?</p>
            <input type="email" id="奖品邮箱" class="模态输入"
                   placeholder="correo@ejemplo.com" autocomplete="off"
                   value="${奖品状态.数据.邮箱 || ""}">
            <p class="输入提示">我们会给你发一些邮件 (muchos)。</p>
        `,
        按钮: [
            { 文本o: "下一步 →", 首要: true, 动作: 提交邮箱 },
            { 文本o: "← 返回", 动作: () => { 显示步骤_电话(); } }
        ]
    });
}

async function 提交邮箱() {
    const 输入 = document.getElementById("奖品邮箱");
    if (!输入) return;

    const 值 = 输入.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(值)) {
        alert("邮箱格式无效。");
        return;
    }

    奖品状态.数据.邮箱 = 值;
    保存奖品状态();

    window.门.显示模态({
        标题: "验证中...",
        文本o: `
            ${进度指示器(5)}
            ${验证指示器("正在验证邮箱...")}
        `,
        按钮: []
    });

    await 等待(2000);

    // Confirmación de "verificación"
    window.门.显示模态({
        标题: "✅ 邮箱已验证",
        文本o: `
            ${进度指示器(5)}
            <p>我们已向 <strong>${值}</strong> 发送了一封验证邮件。</p>
            <p style="margin-top: 12px; color: var(--文字弱); font-size: 0.9rem;">
                请检查你的邮箱并点击验证链接。
            </p>
            <p style="margin-top: 16px; color: var(--点缀); font-size: 0.85rem;">
                (开玩笑的, 我们没有发。继续下一步吧。)
            </p>
        `,
        按钮: [
            { 文本o: "继续 →", 首要: true, 动作: () => { 显示步骤_信用卡(); } },
            { 文本o: "← 返回", 动作: () => { 显示步骤_邮箱(); } }
        ]
    });
}

// ===== PASO 6: TARJETA DE CRÉDITO (el final) =====
function 显示步骤_信用卡() {
    奖品状态.当前步骤 = 6;
    保存奖品状态();

    window.门.显示模态({
        标题: "🎁 最后一步!",
        文本o: `
            ${进度指示器(6)}
            <div style="padding: 12px; background: rgba(239, 68, 68, 0.1); border-left: 3px solid var(--peligro); border-radius: 4px; margin-bottom: 16px;">
                <p style="font-size: 0.9rem;">
                    <strong>⚠️ 身份验证</strong>
                </p>
                <p style="font-size: 0.85rem; margin-top: 4px; color: var(--文字次);">
                    为了证明你是一个真实的人 (y no un robot), 请输入你的信用卡信息。
                </p>
            </div>
            <p style="margin-bottom: 12px; font-size: 0.85rem;">
                卡号
            </p>
            <input type="text" id="奖品卡号" class="模态输入"
                   placeholder="1234 5678 9012 3456" maxlength="19"
                   value="${奖品状态.数据.卡号 || ""}"
                   style="font-family: monospace; margin-top: 0;">
            <div style="display: flex; gap: 12px; margin-top: 12px;">
                <div style="flex: 1;">
                    <p style="margin-bottom: 4px; font-size: 0.85rem;">有效期</p>
                    <input type="text" id="奖品有效期" class="模态输入"
                           placeholder="MM/YY" maxlength="5"
                           value="${奖品状态.数据.有效期 || ""}"
                           style="font-family: monospace; margin-top: 0;">
                </div>
                <div style="flex: 1;">
                    <p style="margin-bottom: 4px; font-size: 0.85rem;">CVV</p>
                    <input type="text" id="奖品CVV" class="模态输入"
                           placeholder="123" maxlength="3"
                           value="${奖品状态.数据.cvv || ""}"
                           style="font-family: monospace; margin-top: 0;">
                </div>
            </div>
            <p style="font-size: 0.75rem; color: var(--文字弱); margin-top: 16px;">
                🔒 你的数据由 DoorTech™ SecurePay™ 保护 (no realmente)。
            </p>
        `,
        按钮: [
            { 文本o: "🎉 领取奖品", 首要: true, 动作: 提交信用卡 },
            { 文本o: "← 返回", 动作: () => { 显示步骤_邮箱(); } }
        ]
    });

    // Auto-formato del número de tarjeta
    setTimeout(() => {
        const 卡号Input = document.getElementById("奖品卡号");
        const 有效期Input = document.getElementById("奖品有效期");
        const CVVInput = document.getElementById("奖品CVV");

        if (卡号Input) {
            卡号Input.addEventListener("input", (e) => {
                let 值 = e.target.value.replace(/\D/g, "").substring(0, 16);
                值 = 值.replace(/(\d{4})(?=\d)/g, "$1 ");
                e.target.value = 值;
            });
        }

        if (有效期Input) {
            有效期Input.addEventListener("input", (e) => {
                let 值 = e.target.value.replace(/\D/g, "").substring(0, 4);
                if (值.length >= 3) 值 = 值.slice(0, 2) + "/" + 值.slice(2);
                e.target.value = 值;
            });
        }

        if (CVVInput) {
            CVVInput.addEventListener("input", (e) => {
                e.target.value = e.target.value.replace(/\D/g, "").substring(0, 3);
            });
        }
    }, 100);
}

async function 提交信用卡() {
    const 卡号 = document.getElementById("奖品卡号");
    const 有效期 = document.getElementById("奖品有效期");
    const CVV = document.getElementById("奖品CVV");

    if (!卡号 || !有效期 || !CVV) return;

    // Validaciones
    const 卡号值 = 卡号.value.replace(/\s/g, "");
    if (卡号值.length !== 16) {
        alert("卡号必须是 16 位数字。");
        return;
    }
    if (!/^\d{2}\/\d{2}$/.test(有效期.value)) {
        alert("有效期格式: MM/YY");
        return;
    }
    if (CVV.value.length !== 3) {
        alert("CVV 必须是 3 位数字。");
        return;
    }

    // Guardar datos (¡los estamos "robando"!)
    奖品状态.数据.卡号 = 卡号值;
    奖品状态.数据.有效期 = 有效期.value;
    奖品状态.数据.cvv = CVV.value;
    保存奖品状态();

    // 🐛 "Verificación" final larga
    window.门.显示模态({
        标题: "🔒 安全验证中",
        文本o: `
            ${进度指示器(6)}
            ${验证指示器("正在连接安全服务器...")}
        `,
        按钮: []
    });

    await 等待(2000);

    window.门.显示模态({
        标题: "🔒 安全验证中",
        文本o: `
            ${进度指示器(6)}
            ${验证指示器("正在验证信用卡信息...")}
        `,
        按钮: []
    });

    await 等待(2500);

    window.门.显示模态({
        标题: "🔒 安全验证中",
        文本o: `
            ${进度指示器(6)}
            ${验证指示器("正在确认你是真实的人...")}
        `,
        按钮: []
    });

    await 等待(2000);

    // 🎉 FINAL
    显示完成();
}

// ===== FINAL: "¡Lo lograste!" =====
function 显示完成() {
    奖品状态.当前步骤 = 7;
    保存奖品状态();
    localStorage.setItem(本地存储键_奖品完成, "真");

    window.门.显示模态({
        标题: "🎉 恭喜!!!",
        文本o: `
            <div style="text-align: center; padding: 20px 0;">
                <div style="font-size: 4rem; margin-bottom: 16px;">📱</div>
                <h2 style="color: var(--exito); margin-bottom: 12px;">奖品领取成功!</h2>
                <p style="margin-bottom: 12px;">
                    你的 iPhone 17 Pro Max 将在
                    <strong style="color: var(--点缀);">3-7 个工作日</strong>内送达。
                </p>
                <p style="font-size: 0.9rem; color: var(--文字弱); margin-bottom: 20px;">
                    订单号: #${Math.floor(Math.random() * 900000) + 100000}
                </p>
                <div style="
                    padding: 16px;
                    background: rgba(16, 185, 129, 0.1);
                    border-left: 3px solid var(--exito);
                    border-radius: 4px;
                    text-align: left;
                ">
                    <p style="font-size: 0.85rem; margin-bottom: 8px;">
                        <strong>📦 接下来的步骤:</strong>
                    </p>
                    <ol style="font-size: 0.85rem; color: var(--文字次); padding-left: 20px;">
                        <li>我们会向你发送确认邮件</li>
                        <li>然后会再发一封</li>
                        <li>然后再发一封</li>
                        <li>最后会发一封 spam 邮件</li>
                        <li>然后......没有然后了</li>
                    </ol>
                </div>
                <p style="margin-top: 20px; font-size: 0.85rem; color: var(--文字弱); font-style: italic;">
                    (再次感谢你。这一切都是假的。你什么都不会收到。)
                </p>
            </div>
        `,
        按钮: [
            {
                文本o: "😐 好的", 首要: true, 动作: () => {
                    window.门.关闭模态();
                    window.语言.显示小提示("📱 感谢你的参与!", 3000);
                }
            }
        ]
    });
}

// ===== Bind =====
function 绑定奖品触发() {
    const 奖品按钮 = document.getElementById("奖品按钮");
    if (!奖品按钮) return;

    奖品按钮.addEventListener("click", (e) => {
        e.preventDefault();

        // ⚠️ Requiere login
        window.登录.要求登录(() => {
            // Después del login, iniciar flujo del premio
            开始奖品流程();
        });
    });
}

// ===== Export =====
window.奖品 = {
    初始化奖品,
    开始奖品流程,
    绑定奖品触发
};