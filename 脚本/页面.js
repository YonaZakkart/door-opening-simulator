/* ============================================
   开门模拟器 - 页面模块
   仿真 
   ============================================ */

const 页面内容 = {
    "changelog": {
        标题: "更新日志",
        内容: `
            <h2>更新日志</h2>
            <p><strong>v2.0.0</strong> — 优化了开门体验 (门更生气了)</p>
            <p><strong>v1.9.0</strong> — 修复了一个 bug (可能是故意的)</p>
            <p><strong>v1.8.0</strong> — 添加了更多按钮 (没有人要求过)</p>
            <p><strong>v1.7.0</strong> — 移除了一个功能 (我们忘了是哪个)</p>
            <p><strong>v1.6.0</strong> — 门现在会做梦</p>
            <p><strong>v1.5.0</strong> — 添加了爱沙尼亚语支持 (没有按钮)</p>
            <p><strong>v1.0.0</strong> — 第一次开门</p>
            <p><em>感谢您一直以来的支持!</em></p>
        `
    },
    "careers": {
        标题: "招聘",
        内容: `
            <h2>加入我们</h2>
            <p>我们正在寻找充满激情的门爱好者。</p>
            <h3>当前开放职位:</h3>
            <ul>
                <li><strong>高级门把手工程师</strong> — 需要 10 年经验</li>
                <li><strong>语言包销售员</strong> — 需掌握至少 3 门语言</li>
                <li><strong>门心理学家</strong> — 了解门的情感</li>
                <li><strong>实习门童</strong> — 无薪, 但我们提供经验</li>
            </ul>
            <p><em>我们是一家重视多样性的公司。尤其是门的多样性。</em></p>
        `
    },
    "blog": {
        标题: "博客",
        内容: `
            <h2>最新文章</h2>
            <article>
                <h3>为什么门总是朝外开?</h3>
                <p>一个深刻的哲学探讨。也许门只是想看看外面的世界...</p>
                <small>2025-01-15 · 5 min</small>
            </article>
            <article>
                <h3>10个你从未注意过的门把手事实</h3>
                <p>第 3 个会让你大吃一惊。</p>
                <small>2025-01-10 · 8 min</small>
            </article>
            <article>
                <h3>门与心理学: 为什么我们害怕推不开的门?</h3>
                <p>深度分析。可能会改变你对门的看法。</p>
                <small>2025-01-05 · 12 min</small>
            </article>
        `
    },
    "cookies": {
        标题: "Cookies 政策",
        内容: `
            <h2>Cookies 政策</h2>
            <p>我们使用 cookies 来:</p>
            <ul>
                <li>🍪 记住你的语言选择 (如果你付钱的话)</li>
                <li>🍪 分析你开门的时间</li>
                <li>🍪 出售你的数据给第三方门公司</li>
                <li>🍪 记录你说"我同意"的次数</li>
                <li>🍪 只是为了好玩</li>
            </ul>
            <p><em>继续使用本网站即表示您同意所有这些。</em></p>
        `
    }
};

function 打开页面(页面ID) {
    const 页面 = 页面内容[页面ID];
    if (!页面) {
        console.warn("[页面] 未知页面:", 页面ID);
        return;
    }

    window.location.hash = 页面ID;

    const 翻译 = 语言.获取翻译();
    
    window.门.显示模态({
        标题: 页面.标题,
        文本o: 页面.内容,
        按钮: [
            { 文本o: "← 返回", 首要: true, 动作: () => {
                window.门.关闭模态();
                window.location.hash = "";
            }}
        ]
    });
}

// Export
window.页面 = {
    打开页面,
    页面内容
};