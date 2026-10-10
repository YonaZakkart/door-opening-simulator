// ===== 全局状态 =====
let 意图 = null;          // 意图
let 已确认次数 = 0;       // 已确认次数
let 尝试开门次数 = 0;     // 尝试开门次数
let 门已打开 = false;     // 门已打开
let 当前阶段 = 0;         // 当前阶段

// ===== DOM 元素 =====
const 门 = document.getElementById("门");
const 开门按钮 = document.getElementById("开门按钮");
const 提示 = document.getElementById("提示");


// 生成随机整数 [最小, 最大]
function 随机整数(最小, 最大) {
    return Math.floor(Math.random() * (最大 - 最小 + 1)) + 最小;
}

// 从数组中随机选一个
function 随机选(数组) {
    return 数组[随机整数(0, 数组.length - 1)];
}

// 设置提示文字 (带打字机效果的感觉)
function 设置提示(文字) {
    提示.textContent = 文字;
}

// 摇晃门 (表示拒绝)
function 摇晃门() {
    门.style.animation = "无";
    setTimeout(() => {
        门.style.animation = "摇晃 0.5s ease";
    }, 10);
}

// 添加摇晃关键帧 (用 JS 动态添加, 因为 CSS 里没定义)
const 样式表 = document.styleSheets[0];
样式表.insertRule(`
    @keyframes 摇晃 {
        0%, 100% { transform: rotate(0deg); }
        20% { transform: rotate(-3deg); }
        40% { transform: rotate(3deg); }
        60% { transform: rotate(-2deg); }
        80% { transform: rotate(2deg); }
    }
`, 样式表.cssRules.length);

function 问(问题) {
    return confirm(问题);
}

function 要理由(问题) {
    return prompt(问题);
}

// ===== 阶段数据 =====
// 每个阶段: { 问题, 是回复, 否回复 }

const 确认阶段 = [
    { 问题: "你想开门吗?",                 是回复: "很好。",             否回复: "那你点它干嘛? 🤨" },
    { 问题: "你真的想开门吗?",             是回复: "确定? 我不信。",      否回复: "我就知道。" },
    { 问题: "你确定你真的想开门吗?",        是回复: "行吧, 继续。",        否回复: "回去想想吧。" },
    { 问题: "你百分百确定吗?",             是回复: "嗯......",            否回复: "看吧, 犹豫了。" },
    { 问题: "如果没有门, 你会怎么办?",      是回复: "哲学。继续。",        否回复: "深刻的问题, 继续吧。" },
    { 问题: "你上次开门是什么时候?",        是回复: "太久了。继续。",      否回复: "对, 你该反省一下。" },
    { 问题: "你觉得门有感情吗?",           是回复: "别想太多。继续。",     否回复: "冷漠。继续。" },
    { 问题: "最后一个问题: 你真的确定吗?",   是回复: "好。",               否回复: "我们回到原点。" },
];

// ===== 主流程 =====

async function 开始开门() {
    if (门已打开) {
        设置提示("门已经开了。你还想干嘛? 😐");
        return;
    }

    尝试开门次数++;
    开门按钮.disabled = true;
    开门按钮.textContent = "处理中...";

    // 第 1 阶段: 意图
    await 询问意图();
    if (意图 === null) {
        重置();
        return;
    }

    // 第 2 阶段: 连锁确认
    const 通过 = await 连锁确认();
    if (!通过) {
        设置提示("你放弃了。门松了一口气");
        重置();
        return;
    }

    // 第 3 阶段: 理由
    const 理由通过 = await 询问理由();
    if (!理由通过) {
        设置提示("理由不充分。门拒绝了你。");
        重置();
        return;
    }

    // 第 4 阶段: 开门方式
    const 方式通过 = await 选择开门方式();
    if (!方式通过) {
        设置提示("你没能选择开门方式。门感到失望。😔");
        重置();
        return;
    }

    // 第 5 阶段: 最终确认
    const 最终 = await 最终确认();
    if (!最终) {
        设置提示("在最后一刻, 你退缩了。😰");
        重置();
        return;
    }

    // 🎉 开门!
    真正开门();
}

// ===== 阶段 1: 意图 =====

async function 询问意图() {
    await 等待(300);
    if (问("你确定要开门吗?")) {
        意图 = "开门";
        设置提示("意图已记录。继续。");
        await 等待(800);
    } else {
        意图 = null;
        设置提示("你取消了。门很困惑。❓");
    }
}

// ===== 阶段 2: 连锁确认 =====

async function 连锁确认() {
    for (let i = 0; i < 确认阶段.length; i++) {
        await 等待(400);
        const 阶段 = 确认阶段[i];
        const 回答 = 问(`[${i + 1}/${确认阶段.length}] ${阶段.问题}`);

        if (回答) {
            设置提示(阶段.是回复);
        } else {
            设置提示(阶段.否回复);
            await 等待(800);
            // 50% 概率重新开始 (pero solo una vez, para no ser cruel)
            if (i > 2 && Math.random() < 0.3) {
                设置提示("我们从头再来一次吧。");
                await 等待(1500);
                return await 连锁确认();
            }
            return false;
        }
        await 等待(500);
    }
    return true;
}

// ===== 阶段 3: 理由 =====

async function 询问理由() {
    await 等待(400);
    const 理由 = 要理由("请输入开门理由:");

    if (理由 === null || 理由.trim() === "") {
        设置提示("你没有提供理由。门感到被冒犯。");
        return false;
    }

    // 理由越短, 门越生气
    if (理由.length < 3) {
        设置提示(`"${理由}"... 这也算理由? 重新想想。`);
        await 等待(1500);
        return await 询问理由();  // 递归, 但用户可以在 prompt 取消
    }

    // 特殊彩蛋: 如果有人输入"因为我愿意"
    if (理由.includes("愿意") || 理由.includes("想开") || 理由.includes("因为")) {
        设置提示(`"${理由}"。有道理。门接受了。`);
    } else {
        设置提示(`"${理由}"...... 行吧, 勉强接受。`);
    }

    await 等待(1200);
    return true;
}

// ===== 阶段 4: 开门方式 =====

async function 选择开门方式() {
    await 等待(400);
    const 方式 = 要理由(
        "请选择开门方式:\n" +
        "1 - 慢慢开\n" +
        "2 - 快点开\n" +
        "3 - 用脚开\n" +
        "4 - 用眼神开\n" +
        "5 - 用意念开"
    );

    if (方式 === null) {
        设置提示("你没有选择开门方式。门不知所措。");
        return false;
    }

    const 合法选项 = ["1", "2", "3", "4", "5"];
    if (!合法选项.includes(方式.trim())) {
        设置提示(`"${方式}" 不是合法选项。门不会读心术。`);
        await 等待(1500);
        return await 选择开门方式();
    }

    // 特殊处理各种方式
    switch (方式.trim()) {
        case "1":
            设置提示("慢慢开? 好的, 但你可能要等一会儿。");
            await 等待(2000);
            break;
        case "2":
            设置提示("快点开? 但门不喜欢被催。⏱");
            await 等待(1500);
            break;
        case "3":
            设置提示("用脚开? 门的尊严呢?! ");
            await 等待(2000);
            break;
        case "4":
            设置提示("眼神开锁功能需要付费解锁。 但这次免费。");
            await 等待(2500);
            break;
        case "5":
            设置提示("用意念? 你试了。什么都没发生。继续。");
            await 等待(2000);
            break;
    }

    return true;
}

// ===== 阶段 5: 最终确认 =====

async function 最终确认() {
    await 等待(400);
    // 双重确认
    const 一 = 问("最后一步: 你真的真的要开门吗?");
    if (!一) return false;

    await 等待(300);
    const 二 = 问("开弓没有回头箭。真的确定?");
    if (!二) return false;

    await 等待(300);
    const 三 = 问("(最后一次) 确定吗?");
    return 三;
}

// ===== 真正开门! =====

async function 真正开门() {
    设置提示("正在开门......");
    await 等待(600);

    门.classList.add("打开");
    门已打开 = true;

    await 等待(900);
    设置提示("🎉 门开了。恭喜你。");
    开门按钮.textContent = "门已打开";
    开门按钮.disabled = true;
    开门按钮.style.background = "linear-gradient(135deg, #27ae60, #229954)";
    开门按钮.style.cursor = "default";

    // 显示统计
    await 等待(1200);
    设置提示(
        `恭喜! 你用了 ${尝试开门次数} 次尝试、` +
        `回答了 12 个问题, 才打开这扇门。 ` +
        `门很感动。 ❤️`
    );
}

// ===== 重置 =====

function 重置() {
    意图 = null;
    已确认次数 = 0;
    开门按钮.disabled = false;
    开门按钮.textContent = "🚪 再试一次";
    开门按钮.style.background = "linear-gradient(135deg, #e74c3c, #c0392b)";
}

// ===== 工具: 等待 =====

function 等待(毫秒) {
    return new Promise(解决 => setTimeout(解决, 毫秒));
}

// ===== 绑定事件 =====

开门按钮.addEventListener("click", 开始开门);

// 点击门本身也能触发 (但没有按钮那么正式)
门.addEventListener("click", () => {
    if (!门已打开) {
        设置提示("别急着推门。用按钮。😤");
        摇晃门();
    }
});

// ===== 启动 =====

设置提示("门就在那里。它在等你。");

// ===== FASE 4.1: 网站乱七八糟的功能 =====

// 一个什么也不做的按钮
function noHaceNada() {
    const 废话 = [
        "这个按钮什么也不做。",
        "你期待什么?",
        "🎉 恭喜! 你成功地点了一个没用的按钮。",
        "门不在这里。",
        "请开门, 不要点按钮。",
        "这个按钮已经被点击 " + Math.floor(Math.random() * 9999) + " 次。",
        "404: 功能未找到。",
        "你在找什么?",
        "再点一次试试。",
        "不。"
    ];
    alert(随机选(废话));
}

// Popup 广告
function 显示Popup() {
    document.getElementById("弹出广告").classList.add("显示");
}

function cerrarPopup() {
    document.getElementById("弹出广告").classList.remove("显示");
}

// 随机弹出 (每 15-30 秒)
setTimeout(function 循环弹出() {
    if (!门已打开) {
        显示Popup();
    }
    setTimeout(循环弹出, 随机整数(15000, 30000));
}, 随机整数(8000, 15000));

// 随机时钟 (时间不停地跳动, 没有意义)
function 更新时钟() {
    const 时 = String(随机整数(0, 23)).padStart(2, "0");
    const 分 = String(随机整数(0, 59)).padStart(2, "0");
    const 秒 = String(随机整数(0, 59)).padStart(2, "0");
    document.getElementById("随机时钟").textContent = `🕐 ${时}:${分}:${秒}`;
}
setInterval(更新时钟, 1000);

// 访客计数器 (ridículo, siempre el mismo rango)
document.getElementById("访客数").textContent = 
    (999000 + 随机整数(0, 999)).toLocaleString();

// Chat de soporte
function toggleChat() {
    document.getElementById("chatSoporte").classList.toggle("最小化");
}

// Chat: responder a mensajes con frases absurdas
document.getElementById("chatInput").addEventListener("keypress", function(e) {
    if (e.key === "Enter" && this.value.trim() !== "") {
        const 用户消息 = this.value.trim();
        this.value = "";
        
        // Añadir mensaje del usuario
        const 消息区 = document.getElementById("chatMensajes");
        const 用户消息元素 = document.createElement("div");
        用户消息元素.className = "mensaje 用户";
        用户消息元素.textContent = 用户消息;
        用户消息元素.style.background = "#cce5ff";
        用户消息元素.style.marginLeft = "auto";
        用户消息元素.style.border = "2px solid #000";
        消息区.appendChild(用户消息元素);
        消息区.scrollTop = 消息区.scrollHeight;
        
        // Respuesta del "soporte" después de un delay
        setTimeout(function() {
            const 回复 = 随机选([
                "请开门。",
                "好的, 已记录。",
                "这个问题需要付费咨询。",
                "门正在处理你的请求。",
                "😊 还有什么可以帮您?",
                "我也想知道。",
                "请重新描述问题。",
                "感谢您的反馈!",
                "这个功能正在开发中。",
                "请开门。",
                "你说得对。",
                "抱歉, 我不太明白。",
                "请再试一次。",
                "您的问题已提交至相关部门。",
                "请开门。"
            ]);
            const 机器人消息 = document.createElement("div");
            机器人消息.className = "mensaje bot";
            机器人消息.textContent = 回复;
            机器人消息.style.border = "2px solid #000";
            消息区.appendChild(机器人消息);
            消息区.scrollTop = 消息区.scrollHeight;
        }, 800 + Math.random() * 1000);
    }
});