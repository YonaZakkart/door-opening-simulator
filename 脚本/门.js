/* ============================================
   开门模拟器 - 门模块 v2
   功能: 用状态机折磨用户
   作者: DoorTech™ 团队 (sigue siendo uno)
   ============================================ */

// ===== 常量 =====
const 本地存储键_门状态 = "开门模拟器_门状态";
const 本地存储键_门解锁时间 = "开门模拟器_门解锁时间";

// ===== 状态 =====
let 门状态 = {
    当前问题: "开始",
    已尝试次数: 0,
    说谎次数: 0,
    历史: [],
    是否已打开: false,
    是否已封锁: false,
    封锁解除时间: null
};

// ===== 初始化 =====
function 初始化门() {
    // 从 localStorage 恢复
    const 保存的状态 = localStorage.getItem(本地存储键_门状态);
    if (保存的状态) {
        try {
            门状态 = JSON.parse(保存的状态);
        } catch (e) {
            console.warn("[门] 状态恢复失败, 使用默认");
        }
    }

    const 解锁时间 = localStorage.getItem(本地存储键_门解锁时间);
    if (解锁时间) {
        const 剩余 = parseInt(解锁时间) - Date.now();
        if (剩余 > 0) {
            门状态.是否已封锁 = true;
            门状态.封锁解除时间 = parseInt(解锁时间);
            显示封锁状态(剩余);
            return;
        } else {
            localStorage.removeItem(本地存储键_门解锁时间);
            门状态.是否已封锁 = false;
        }
    }

    if (门状态.是否已打开) {
        门.classList.add("打开");
        开门按钮.textContent = "✅ 门已打开";
        开门按钮.disabled = true;
        设置提示("门已经开了。你还在等什么? 😐");
    }

    绑定门事件();
    console.log("[门] 初始化完成. 状态:", 门状态.当前问题);
}

// ===== save =====
function 保存门状态() {
    localStorage.setItem(本地存储键_门状态, JSON.stringify(门状态));
}

// ===== Reset =====
function 重置门状态() {
    门状态 = {
        当前问题: "开始",
        已尝试次数: 0,
        说谎次数: 0,
        历史: [],
        是否已打开: false,
        是否已封锁: false,
        封锁解除时间: null
    };
    localStorage.removeItem(本地存储键_门状态);
    localStorage.removeItem(本地存储键_门解锁时间);
    门.classList.remove("打开");
    开门按钮.disabled = false;
    开门按钮.textContent = "🚪 再试一次";
    设置提示("门就在那里。它在等你。");
}

// ===== show =====
function 显示封锁状态(剩余毫秒) {
    const 分钟 = Math.ceil(剩余毫秒 / 60000);

    门.classList.add("已封锁");
    开门按钮.disabled = true;
    开门按钮.textContent = "🚫 门已封锁";
    设置提示(`你把它惹生气了。门将在 ${分钟} 分钟后冷静下来。`);

    // Añadir botón de reintentar debajo
    const 提示元素 = document.getElementById("提示文字");
    if (!document.getElementById("重试按钮")) {
        const 重试 = document.createElement("button");
        重试.id = "重试按钮";
        重试.className = "主按钮";
        重试.textContent = "🔄 重试";
        重试.style.marginTop = "12px";
        重试.style.background = "var(--背景三)";
        重试.style.color = "var(--文字主)";
        重试.addEventListener("click", () => {
            // 😈 Redirigir al repo y luego resetear
            window.open("https://github.com/YonaZakkart/door-opening-simulator", "_blank");
            setTimeout(() => {
                重置门状态();
                重试.remove();
                显示模态({
                    标题: "门想要再试一次",
                    文本o: "好吧。它决定再给你一次机会。别浪费。",
                    按钮: [{
                        文本o: "开始", 首要: true, 动作: () => {
                            关闭模态();
                            开始开门流程();
                        }
                    }]
                });
            }, 800);
        });
        提示元素.parentNode.insertBefore(重试, 提示元素.nextSibling);
    }
}

// ===== 封锁 la puerta =====
function 封锁门(分钟数, 原因) {
    门状态.是否已封锁 = true;
    const 解锁时间 = Date.now() + 分钟数 * 60 * 1000;
    门状态.封锁解除时间 = 解锁时间;
    localStorage.setItem(本地存储键_门解锁时间, 解锁时间.toString());
    保存门状态();

    console.log(`[门] 已封锁 ${分钟数} 分钟. 原因: ${原因}`);

    // Mostrar modal de "te bloqueaste"
    const 翻译 = 语言.获取翻译();
    显示模态({
        标题: "🚫 门封锁了",
        文本o: `${原因}\n\n门需要冷静 ${分钟数} 分钟。`,
        按钮: [
            {
                文本o: "😭 我错了", 首要: true, 动作: () => {
                    关闭模态();
                    显示封锁状态(分钟数 * 60 * 1000);
                }
            },
            {
                文本o: "🔄 重试", 动作: () => {
                    window.open("https://github.com/YonaZakkart/door-opening-simulator", "_blank");
                    setTimeout(() => {
                        关闭模态();
                        重置门状态();
                        开始开门流程();
                    }, 800);
                }
            }
        ]
    });
}

// ===== 系统 de modales (core) =====
function 显示模态({ 标题, 文本o, 选项, 按钮 }) {
    const 覆盖 = document.getElementById("模态覆盖");
    const 容器 = document.getElementById("模态容器");

    let 选项HTML = "";
    let 按钮HTML = "";

    if (选项 && 选项.length > 0) {
        选项HTML = `<div class="模态选项">` +
            选项.map((op, i) => `
                <button class="模态选项按钮" data-opcion="${i}">
                    ${op.文本o}
                </button>
            `).join("") + `</div>`;
    }

    if (按钮 && 按钮.length > 0) {
        按钮HTML = `<div class="模态按钮组">` +
            按钮.map((b, i) => `
                <button class="模态按钮 ${b.首要 ? "首要" : ""} ${b.peligro ? "危险" : ""}" data-btn="${i}">
                    ${b.文本o}
                </button>
            `).join("") + `</div>`;
    }

    const html = `
        <div class="模态">
            <div class="模态标题">${标题}</div>
            <div class="模态文本o">${文本o}</div>
            ${选项HTML}
            ${按钮HTML}
        </div>
    `;

    容器.innerHTML = html;
    覆盖.classList.add("显示");
    容器.classList.add("显示");
    document.body.style.overflow = "hidden";

    // Bind de opciones (para decisiones múltiples)
    if (选项) {
        容器.querySelectorAll(".模态选项按钮").forEach(btn => {
            btn.addEventListener("click", () => {
                const i = parseInt(btn.getAttribute("data-opcion"));
                if (选项[i].动作) 选项[i].动作();
            });
        });
    }

    // Bind de botones (para acciones finales)
    if (按钮) {
        容器.querySelectorAll(".模态按钮").forEach(btn => {
            btn.addEventListener("click", () => {
                const i = parseInt(btn.getAttribute("data-btn"));
                if (按钮[i].动作) 按钮[i].动作();
            });
        });
    }

    // Guardar referencia
    window._模态 = { 关闭: () => 关闭模态() };
}

function 关闭模态() {
    document.getElementById("模态覆盖").classList.remove("显示");
    document.getElementById("模态容器").classList.remove("显示");
    document.body.style.overflow = "";
    document.getElementById("模态容器").innerHTML = "";
}

// ===== 开始 el flujo =====
function 开始开门流程() {
    if (门状态.是否已打开) {
        设置提示("门已经开了。你还想干嘛? 😐");
        return;
    }
    if (门状态.是否已封锁) {
        设置提示("门还在生你的气。等等吧。");
        return;
    }

    门状态.已尝试次数++;
    保存门状态();

    问题_开始();
}

// ===== PROBLEMA: Inicio =====
function 问题_开始() {
    显示模态({
        标题: "开门模拟器",
        文本o: "你确定要开门吗?",
        选项: [
            { 文本o: "✅ 是的", 动作: () => { 问题_确认(); } },
            {
                文本o: "❌ 算了", 动作: () => {
                    关闭模态();
                    设置提示("你放弃了。门松了一口气。");
                }
            },
            { 文本o: "🤔 为什么?", 动作: () => { 问题_哲学(); } }
        ]
    });
}

// ===== PROBLEMA: Filosófico =====
function 问题_哲学() {
    显示模态({
        标题: "好问题",
        文本o: "为什么想开门? 因为门就在那里。因为你想出去。因为你不想被困住。\n\n......但其实, 你真的需要出去吗?",
        选项: [
            { 文本o: "🫡 深刻的", 动作: () => { 问题_确认(); } },
            { 文本o: "😐 我只是想开门", 动作: () => { 问题_确认(); } },
            {
                文本o: "🧘 我需要想想", 动作: () => {
                    关闭模态();
                    设置提示("你去思考人生了。门在等你。");
                }
            }
        ]
    });
}

// ===== PROBLEMA: Confirmación =====
function 问题_确认() {
    显示模态({
        标题: "确认",
        文本o: "你100%确定吗?",
        选项: [
            { 文本o: "✅ 确定", 动作: () => { 问题_钥匙(); } },
            {
                文本o: "🤨 有点动摇", 动作: () => {
                    门状态.说谎次数++;
                    保存门状态();
                    if (门状态.说谎次数 >= 3) {
                        封锁门(15, "门觉得你不真诚。");
                    } else {
                        关闭模态();
                        设置提示("门感觉到了你的犹豫。它有点失望。");
                    }
                }
            },
            {
                文本o: "😤 快点!", 动作: () => {
                    封锁门(5, "催门是不礼貌的。");
                }
            }
        ]
    });
}

// ===== PROBLEMA: Llave =====
function 问题_钥匙() {
    显示模态({
        标题: "钥匙",
        文本o: "你有钥匙吗?",
        选项: [
            { 文本o: "🔑 有", 动作: () => { 问题_选择方法(); } },
            { 文本o: "🚪 没有", 动作: () => { 问题_没有Llave(); } },
            {
                文本o: "❓ 什么钥匙?", 动作: () => {
                    显示模态({
                        标题: "什么钥匙?",
                        文本o: "就是开门的钥匙啊。你没有吗?\n\n......你是怎么活到现在的?",
                        按钮: [
                            {
                                文本o: "😅 抱歉", 首要: true, 动作: () => {
                                    关闭模态();
                                    问题_没有Llave();
                                }
                            }
                        ]
                    });
                }
            }
        ]
    });
}

// ===== PROBLEMA: Sin llave =====
function 问题_没有Llave() {
    显示模态({
        标题: "没钥匙啊...",
        文本o: "好吧。没有钥匙的话, 门有点难办。\n\n但也不是不可能。你想怎么做?",
        选项: [
            {
                文本o: "🔨 撬开", 动作: () => {
                    封锁门(60, "你试图撬门。门报警了。");
                }
            },
            {
                文本o: "🚪 用蛮力推", 动作: () => {
                    封锁门(30, "你试图推门。门受伤了。");
                }
            },
            {
                文本o: "🥺 求它开", 动作: () => {
                    显示模态({
                        标题: "门在考虑",
                        文本o: "门有点感动。它决定给你一次机会。",
                        按钮: [
                            {
                                文本o: "🙏 谢谢", 首要: true, 动作: () => {
                                    关闭模态();
                                    问题_选择方法();
                                }
                            }
                        ]
                    });
                }
            }
        ]
    });
}

// ===== PROBLEM =====
function 问题_选择方法() {
    显示模态({
        标题: "选择开门方式",
        文本o: "你要怎么开?",
        选项: [
            { 文本o: "✋ 轻轻推", 动作: () => { 问题_最终(); } },
            { 文本o: "🔄 转门把手", 动作: () => { 问题_最终(); } },
            {
                文本o: "🦵 用脚踢", 动作: () => {
                    封锁门(120, "你踢了门。门很痛。门记住了。");
                }
            },
            {
                文本o: "🚪 用眼神", 动作: () => {
                    显示模态({
                        标题: "眼神开门?",
                        文本o: "你盯着门看了 30 秒。\n\n什么都没发生。\n\n门有点尴尬。",
                        按钮: [
                            {
                                文本o: "😳 好吧", 首要: true, 动作: () => {
                                    关闭模态();
                                    问题_选择方法();
                                }
                            }
                        ]
                    });
                }
            }
        ]
    });
}

// ===== PROBLEMA: Final =====
function 问题_最终() {
    显示模态({
        标题: "最后一步",
        文本o: "准备好了吗?",
        选项: [
            { 文本o: "✅ 是的!", 动作: () => { 开门成功(); } },
            {
                文本o: "😰 等等...", 动作: () => {
                    显示模态({
                        标题: "等等",
                        文本o: "你等了 5 秒。\n\n门也在等。",
                        按钮: [
                            {
                                文本o: "😤 好吧, 开", 首要: true, 动作: () => {
                                    关闭模态();
                                    开门成功();
                                }
                            },
                            {
                                文本o: "🚶 我不开了", 动作: () => {
                                    关闭模态();
                                    设置提示("你走了。门有点难过。");
                                }
                            }
                        ]
                    });
                }
            }
        ]
    });
}

// ===== ¡ÉXITO! =====
async function 开门成功() {
    关闭模态();
    设置提示("正在开门......🔓");

    await 等待(600);
    门.classList.add("打开");
    门状态.是否已打开 = true;
    保存门状态();

    await 等待(900);
    设置提示("🎉 门开了。恭喜你。");
    开门按钮.textContent = "✅ 门已打开";
    开门按钮.disabled = true;
    开门按钮.style.background = "var(--exito)";
    开门按钮.style.color = "#fff";

    await 等待(1200);
    设置提示(
        `恭喜! 你用了 ${门状态.已尝试次数} 次尝试才打开这扇门。` +
        ` 门很感动。 🚪❤️`
    );
}

// ===== Util =====
function 等待(毫秒) {
    return new Promise(解决 => setTimeout(解决, 毫秒));
}

function 设置提示(文字) {
    const 元素 = document.getElementById("提示文字");
    if (元素) 元素.textContent = 文字;
}

// ===== Bind =====
function 绑定门事件() {
    const 开门按钮 = document.getElementById("开门按钮");
    const 门 = document.getElementById("门");
    const 品牌 = document.getElementById("品牌");

    if (开门按钮) {
        开门按钮.onclick = 开始开门流程;
    }

    if (门 && !门状态.是否已打开) {
        门.onclick = () => {
            设置提示("别急着推门。用按钮。😤");
            门.style.animation = "摇晃 0.5s ease";
            setTimeout(() => { 门.style.animation = ""; }, 500);
        };
    }

    if (品牌) {
        品牌.addEventListener("click", (e) => {
            e.preventDefault();
            console.log("[门] Logo clickeado - login vendrá en Fase 4");
        });
    }
}

// ===== Export =====
window.门 = {
    初始化门,
    重置门状态,
    开始开门流程,
    显示模态,
    关闭模态
};