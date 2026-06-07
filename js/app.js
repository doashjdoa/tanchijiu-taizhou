// ===== 贪吃鸠 · 应用逻辑 =====

    (function () {
        'use strict';

        const $ = id => document.getElementById(id);
        const main = $('main-content');
        const banner = $('top-banner');
        const pageTitleText = $('page-title-text');
        const floatShout = $('float-shout');
        const shoutBtn = $('shout-btn');
        const shoutModal = $('shout-modal');
        const body = document.body;

    // ===== 页面标题映射 =====
    const pageTitles = {
        home: '贪吃鸠 · 台州美食账簿',
        breakfast: '早饭账簿',
        meal: '排档账簿',
        snack: '点心账簿',
        rblist: '贪吃鸠 · 红黑榜',
        crawls: '吃货路线 · 台州美食攻略'
    };

    // ===== 辅助函数 =====
    function getAreaClass(area) {
        const map = { '椒江':'jiaojiang', '临海':'linhai', '路桥':'luqiao', '黄岩':'huangyan', '温岭':'wenling', '天台':'tiantai', '全市':'quanshi' };
        return map[area] || '';
    }
    function markGlossary(text) {
        const terms = Object.keys(DATA.GLOSSARY).sort((a,b) => b.length - a.length);
        let result = text;
        if (window._touristMode) return result; // tourist mode: skip glossary
        terms.forEach(term => {
            const meaning = DATA.GLOSSARY[term];
            result = result.split(term).join(`<span class="glossary-term">${term}<span class="glossary-tip">${meaning}</span></span>`);
        });
        return result;
    }

    function renderHome() {
        main.innerHTML = `
            <div class="home-hero">
                <div class="roar-box">
                    <p class="roar-text">${DATA.home.roar}</p>
                </div>
                <nav class="nav-tabs">
                    <a href="#rblist" class="nav-tab">🗂️ 红黑榜</a>
                    <a href="#crawls" class="nav-tab">🗺️ 吃货路线</a>
                </nav>
                <div class="three-buttons">
                    <button class="btn-giant btn-breakfast" data-nav="breakfast">${DATA.categories.breakfast.label}</button>
                    <button class="btn-giant btn-meal" data-nav="meal">${DATA.categories.meal.label}</button>
                    <button class="btn-giant btn-snack" data-nav="snack">${DATA.categories.snack.label}</button>
                </div>
                <div class="random-section">
                    <p>选不来？让老天爷帮你定！</p>
                    <button class="btn-random" id="btn-random">🎲 随便咕咕</button>
                </div>
            </div>
        `;

        document.querySelectorAll('[data-nav]').forEach(btn => {
            btn.addEventListener('click', () => {
                navigate(btn.dataset.nav);
            });
        });

        $('btn-random').addEventListener('click', goRandom);
    }

    function renderBook(catKey) {
        const cat = DATA.categories[catKey];
        let cards = '';

        // Build unique area set for filters
        const areas = new Set();
        cat.list.forEach(item => {
            const info = DATA.getInfo(item.name);
            if (info) areas.add(info.area);
        });

        // Filter bar
        let filterChips = `<button class="filter-chip active" data-filter="all">全部</button>`;
        areas.forEach(area => {
            const cls = getAreaClass(area);
            filterChips += `<button class="filter-chip filter-area" data-filter="${cls}">${area}</button>`;
        });

        cat.list.forEach((item, idx) => {
            const info = DATA.getInfo(item.name);
            const area = info ? info.area : '';
            const areaCls = getAreaClass(area);
            const areaInfo = area ? DATA.getArea(area) : null;

            // Area badge
            let areaBadge = '';
            if (area && areaInfo) {
                areaBadge = `<div class="area-badge ${areaCls}">📍 ${areaInfo.label}</div>`;
            }

            // Practical bar
            let practical = '';
            if (info) {
                practical = `<div class="practical-bar">`;
                if (info.hours) practical += `<span><span class="p-icon">🕐</span>${info.hours}</span>`;
                if (info.price) practical += `<span><span class="p-icon">💰</span>${info.price}</span>`;
                if (info.wait) practical += `<span><span class="p-icon">⏳</span>${info.wait}</span>`;
                if (info.tags) {
                    practical += `<span><span class="p-icon">🏷️</span>${info.tags.slice(0,2).join(' · ')}</span>`;
                }
                practical += `</div>`;
            }

            // Transport note
            let transport = '';
            if (areaInfo && areaInfo.transport) {
                transport = `<div class="transport-note"><span class="t-icon">🚕</span>怎么去：${areaInfo.transport}</div>`;
            }

            cards += `
                <div class="rec-card" data-area="${areaCls}">
                    ${areaBadge}
                    <div class="food-name"><span class="food-highlight">${item.name}</span> —— ${item.highlight}</div>
                    ${practical}
                    <p class="roar-review">${markGlossary(item.review)}</p>
                    <div class="guide-box">${markGlossary(item.guide)}</div>
                    ${transport}
                    <a class="btn-external" href="${item.link}" target="_blank" rel="noopener">${item.linkText}</a>
                </div>
            `;
        });

        // Category nav tabs + area filter
        const catTabs = `
            <nav class="nav-tabs" role="tablist">
                <a href="#breakfast" class="nav-tab ${catKey === 'breakfast' ? 'active' : ''}" role="tab" data-nav="breakfast">🥢 早饭</a>
                <a href="#meal" class="nav-tab ${catKey === 'meal' ? 'active' : ''}" role="tab" data-nav="meal">🍚 正餐</a>
                <a href="#snack" class="nav-tab ${catKey === 'snack' ? 'active' : ''}" role="tab" data-nav="snack">🍡 点心</a>
                <button class="tourist-toggle ${window._touristMode ? 'active' : ''}" id="tourist-toggle">
                    <span class="toggle-track"><span class="toggle-knob"></span></span>
                    <span>游客模式</span>
                </button>
            </nav>
        `;

        main.innerHTML = `
            <div class="book-header">
                <a class="back-link" href="#home">← 回首页</a>
                <h2>${cat.title}</h2>
                <p class="book-desc">${cat.desc || ''}</p>
            </div>
            ${catTabs}
            <div class="filter-bar">${filterChips}</div>
            <div id="book-list">
                ${cards}
            </div>
        `;

        // Nav handlers
        document.querySelectorAll('.nav-tab[data-nav]').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                navigate(tab.dataset.nav);
            });
        });

        // Filter handlers
        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const filter = chip.dataset.filter;
                document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                document.querySelectorAll('.rec-card').forEach(card => {
                    if (filter === 'all') { card.style.display = ''; return; }
                    card.style.display = card.dataset.area === filter ? '' : 'none';
                });
            });
        });

        // Tourist mode toggle
        const toggle = $('tourist-toggle');
        if (toggle) {
            toggle.addEventListener('click', () => {
                window._touristMode = !window._touristMode;
                toggle.classList.toggle('active', window._touristMode);
                renderBook(catKey); // Re-render to apply glossary hiding
            });
        }
    }

    function renderRblist() {
        const items = DATA.rblist.items;
        let pairs = '';
        const vsLabels = ['⚔️ 黑 vs 红', '🗡️ 踩雷 vs 宝藏', '💀 避坑 vs 收藏', '🤮 假货 vs 真味', '👎 拉黑 vs 种草'];

        for (let i = 0; i < items.length; i += 2) {
            const black = items[i];
            const red = items[i + 1];
            if (!red) { pairs += cardHTML(black); break; }
            const vsIdx = Math.floor(i / 2) % vsLabels.length;
            pairs += `
                <div class="rb-pair">
                    <div class="rb-pair-inner">
                        ${cardHTML(black)}
                        ${cardHTML(red)}
                    </div>
                    <div class="rb-pair-vs"><span>${vsLabels[vsIdx]}</span></div>
                </div>
            `;
        }

        main.innerHTML = `
            <div class="rblist-header">
                <a class="back-link" href="#home">← 回首页</a>
                <h2>${DATA.rblist.title}</h2>
            </div>
            <div class="flip-control">
                <button class="btn-flip" id="btn-flip-rb">🃏 翻牌看真相</button>
            </div>
            <div id="rblist-container">
                ${pairs}
            </div>
        `;

        const allCards = document.querySelectorAll('.rblist-card');
        let allRevealed = false;

        function flipAll() {
            allRevealed = !allRevealed;
            allCards.forEach(c => c.classList.toggle('flipped', allRevealed));
            const btn = $('btn-flip-rb');
            btn.textContent = allRevealed ? '🙈 翻回去' : '🃏 翻牌看真相';
            btn.classList.toggle('revealed', allRevealed);
        }

        allCards.forEach(c => {
            c.addEventListener('click', (e) => {
                if (e.target.closest('a')) return;
                c.classList.toggle('flipped');
                const allFlipped = [...allCards].every(ca => ca.classList.contains('flipped'));
                const btn = $('btn-flip-rb');
                if (allFlipped) {
                    btn.textContent = '🙈 翻回去';
                    btn.classList.add('revealed');
                } else {
                    btn.textContent = '🃏 翻牌看真相';
                    btn.classList.remove('revealed');
                }
            });
        });

        $('btn-flip-rb').addEventListener('click', flipAll);

        function cardHTML(item) {
            return `
                <div class="rblist-card ${item.type}">
                    <div class="card-flipper">
                        <div class="card-front">
                            <div class="front-icon">${item.type === 'black' ? '💀' : '❤️'}</div>
                            <span class="rb-badge">${item.badge}</span>
                            <h3>${item.title}</h3>
                            <div class="front-click-hint">👆 点我翻牌</div>
                        </div>
                        <div class="card-back">
                            <span class="rb-badge">${item.badge}</span>
                            <h3>${item.title}</h3>
                            <p>${item.desc}</p>
                            <a class="btn-rb" href="${item.link}" target="_blank" rel="noopener">${item.linkText}</a>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    // ===== 吃货路线 =====
    function renderCrawls() {
        let html = '';
        DATA.FOOD_CRAWLS.forEach(crawl => {
            let stopsHtml = '';
            crawl.stops.forEach((stop, i) => {
                stopsHtml += `
                    <div class="crawl-stop">
                        <span class="stop-num">${i + 1}</span>
                        <span>${stop}</span>
                        ${i < crawl.stops.length - 1 ? '<span class="stop-arrow">→</span>' : ''}
                    </div>
                `;
            });
            html += `
                <div class="crawl-card">
                    <div class="crawl-icon">${crawl.emoji}</div>
                    <h3>${crawl.title}</h3>
                    <p class="crawl-desc">${crawl.desc}</p>
                    <div class="crawl-meta">
                        <span>⏱️ ${crawl.duration}</span>
                        <span>💰 ${crawl.budget}</span>
                        <span>🚕 ${crawl.fromStation}</span>
                    </div>
                    <div class="crawl-stops">${stopsHtml}</div>
                    <a class="btn-crawl-map" href="${crawl.mapLink}" target="_blank" rel="noopener">🗺️ 打开地图</a>
                </div>
            `;
        });

        main.innerHTML = `
            <div class="book-header">
                <a class="back-link" href="#home">← 回首页</a>
                <h2>🗺️ 给游客的吃货路线</h2>
                <p class="book-desc">第一次来台州？跟着这些路线走，不绕路、不踩雷。</p>
            </div>
            ${html}
        `;
    }

    let isNavigating = false;

    function navigate(hash, afterRender) {
        isNavigating = true;
        window.location.hash = hash;
        route(hash, afterRender);
    }

    function route(hash, afterRender) {
        const page = hash || 'home';

        // Body class for home binding
        body.classList.toggle('is-home', page === 'home');

        switch (page) {
            case 'home':
                renderHome();
                break;
            case 'breakfast':
            case 'meal':
            case 'snack':
                renderBook(page);
                break;
            case 'rblist':
                renderRblist();
                break;
            case 'crawls':
                renderCrawls();
                break;
            default:
                renderHome();
        }

        // 更新banner
        const title = pageTitles[page] || pageTitles.home;
        pageTitleText.textContent = title;
        banner.classList.toggle('show', page !== 'home');
        floatShout.classList.toggle('hidden', page === 'home');

        if (typeof afterRender === 'function') afterRender();
    }

    // ===== 吼一声 Modal =====
    shoutBtn.addEventListener('click', () => {
        shoutModal.classList.remove('hidden');
    });

    shoutModal.addEventListener('click', (e) => {
        if (e.target.closest('.modal-overlay') || e.target.closest('.modal-close-btn')) {
            shoutModal.classList.add('hidden');
        }
    });

    $('shout-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const food = fd.get('food');
        const people = fd.get('people') || '未知';
        const msg = encodeURIComponent(`贪吃鸠求救！想吃：${food}，人数：${people}`);
        // 引导到微信或第三方问卷
        alert(`已收到！加微信 tanchijiu_tz 私聊指路\n\n你刚才说：想吃${food}，${people}个人`);
        shoutModal.classList.add('hidden');
        e.target.reset();
    });

    // ===== 随便咕咕 Slot Machine Modal =====
    const randomModal = $('random-modal');
    const slotReel = $('slot-reel');
    const randomResult = $('random-result');
    const resultBadge = $('result-badge');
    const resultName = $('result-name');
    const resultRoar = $('result-roar');
    const btnConfirmRandom = $('btn-confirm-random');
    const btnRerollRandom = $('btn-reroll-random');

    const ROAR_LINES = [
        "老天爷说：今天你欠这口吃的！",
        "卦象显示：你这张嘴该去路桥了。",
        "咕咕咕！命运指向了——糯叽叽的东西！",
        "鸠占鹊巢？这次是鸠占饭碗！",
        "别犹豫了，贪吃鸠替你决定了。",
        "这口鲜，不吃亏一辈子。",
        "排队也是福，不排更是福，吃到就是福。",
        "台州人的胃，早就替你做好决定了。"
    ];

    function initSlotReel() {
        const all = DATA.getAllItems();
        // Create a longer reel with repeated items for visual effect
        const reelItems = [];
        for (let i = 0; i < 15; i++) {
            all.forEach(item => reelItems.push(item));
        }
        // Shuffle
        for (let i = reelItems.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [reelItems[i], reelItems[j]] = [reelItems[j], reelItems[i]];
        }
        slotReel.innerHTML = reelItems.map(item => 
            `<div class="slot-item" data-name="${item.name}" data-cat="${item.catKey}">${item.name}</div>`
        ).join('');
    }

    function goRandom() {
        initSlotReel();
        randomModal.classList.remove('hidden');
        randomResult.classList.add('hidden');
        slotReel.classList.remove('spinning');
        slotReel.style.transform = 'translateY(0)';
        
        // Trigger spin after a brief moment
        setTimeout(() => {
            const handle = document.getElementById('slot-handle');
            handle.classList.add('pulling');
            slotReel.classList.add('spinning');
            
            setTimeout(() => {
                handle.classList.remove('pulling');
                finishRandomPick();
            }, 2600);
        }, 100);
    }

    function finishRandomPick() {
        const all = DATA.getAllItems();
        const pick = all[Math.floor(Math.random() * all.length)];
        
        resultBadge.textContent = pick.catLabel;
        resultBadge.className = 'result-badge ' + pick.catKey;
        resultName.textContent = pick.name;
        resultRoar.textContent = ROAR_LINES[Math.floor(Math.random() * ROAR_LINES.length)];
        
        randomResult.classList.remove('hidden');
        
        // Store pick for confirmation
        window._lastRandomPick = pick;
    }

    btnConfirmRandom.addEventListener('click', () => {
        const pick = window._lastRandomPick;
        if (pick) {
            randomModal.classList.add('hidden');
            navigate(pick.catKey, () => {
                setTimeout(() => {
                    const cards = main.querySelectorAll('.rec-card');
                    let targetIdx = -1;
                    if (pick.name) {
                        const allItems = DATA.categories[pick.catKey].list;
                        targetIdx = allItems.findIndex(i => i.name === pick.name);
                    }
                    if (targetIdx >= 0 && cards[targetIdx]) {
                        cards[targetIdx].scrollIntoView({ behavior: 'smooth', block: 'center' });
                        cards[targetIdx].style.borderLeftColor = '#e05a3a';
                        cards[targetIdx].style.transition = 'border-left-color 0.3s';
                    }
                }, 100);
            });
        }
    });

    btnRerollRandom.addEventListener('click', () => {
        randomResult.classList.add('hidden');
        slotReel.classList.remove('spinning');
        slotReel.style.transform = 'translateY(0)';
        setTimeout(() => goRandom(), 50);
    });

    randomModal.addEventListener('click', (e) => {
        if (e.target.closest('.modal-overlay')) {
            randomModal.classList.add('hidden');
        }
    });

    // ===== Hash路由监听 =====
    window.addEventListener('hashchange', () => {
        if (isNavigating) { isNavigating = false; return; }
        route(window.location.hash.replace('#', ''));
    });

    // ===== 启动 =====
    const initialHash = window.location.hash.replace('#', '') || 'home';
    route(initialHash);

})();
