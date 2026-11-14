/* ==========================================================================
   FIXORA — COMPLETE INTERACTIVE JS WITH DYNAMIC ARIA ACCESSIBILITY (100% QUALITY)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* =========================================================
       0.1 API CLIENT, I18N, SESSION & SHARED HELPERS
       ========================================================= */
    const API_BASE = '/api';
    const TOKEN_KEY = 'fixora_token';
    const USER_KEY = 'fixora_user';
    const I18N = window.FixoraI18n || null;
    let currentLang = I18N ? I18N.getLang() : 'ar';

    function t(key) {
        return I18N ? I18N.t(key, currentLang) : key;
    }

    let cachedServices = [];
    let cachedProviders = [];
    let cachedReviews = [];
    let cachedProfileData = null;
    let cachedGovernorates = (I18N && Array.isArray(I18N.GOVERNORATES)) ? I18N.GOVERNORATES : [];
    let isBrowsingMarketplace = false;
    let activeClientTab = 'ws-client-orders';
    let clientOrderFilter = 'all';
    let activeProviderTab = 'ws-pro-feed';
    let providerFeedFilter = 'all';

    function getGovInfo(city) {
        if (I18N && typeof I18N.getGovernoratePricing === 'function') {
            return I18N.getGovernoratePricing(city, cachedGovernorates);
        }
        return { key: 'القاهرة', nameAr: 'القاهرة', nameEn: 'Cairo', multiplier: 1, deltaPercent: 0, badgeAr: 'السعر الأساسي', badgeEn: 'Base Rate' };
    }

    function applyGovPrice(basePrice, city) {
        if (I18N && typeof I18N.applyGovernoratePrice === 'function') {
            return I18N.applyGovernoratePrice(basePrice, city, cachedGovernorates);
        }
        const gov = getGovInfo(city);
        return Math.max(50, Math.round((Number(basePrice) || 200) * (gov.multiplier || 1)));
    }

    function formatGovDeltaText(gov) {
        if (!gov) return '';
        const delta = Number(gov.deltaPercent) || 0;
        if (delta === 0) return currentLang === 'en' ? (gov.badgeEn || 'Base Rate') : (gov.badgeAr || 'السعر الأساسي');
        const sign = delta > 0 ? '+' : '';
        return currentLang === 'en'
            ? (gov.badgeEn || `${sign}${delta}% vs base`)
            : (gov.badgeAr || `${sign}${delta}% عن الأساسي`);
    }

    function formatGovLabel(gov, withDelta = false) {
        const name = currentLang === 'en' ? (gov.nameEn || gov.key) : (gov.nameAr || gov.key);
        if (!withDelta) return name;
        const delta = Number(gov.deltaPercent) || 0;
        if (delta === 0) {
            const baseWord = currentLang === 'en' ? 'Base' : 'السعر الأساسي';
            return `${name} — ${baseWord}`;
        }
        const sign = delta > 0 ? '+' : '';
        return `${name} (${sign}${delta}%)`;
    }

    function populateGovernorateSelects() {
        const list = cachedGovernorates.length ? cachedGovernorates : (I18N ? I18N.GOVERNORATES : []);
        if (!list.length) return;

        const withDeltaIds = ['calc-city', 'booking-city', 'ws-client-explore-city'];
        const plainCityIds = ['reg-city', 'user-prof-city-input', 'ws-client-city', 'ws-pro-city'];

        [...withDeltaIds, ...plainCityIds].forEach((id) => {
            const sel = document.getElementById(id);
            if (!sel) return;
            const prev = sel.value;
            const showDelta = withDeltaIds.includes(id);
            sel.innerHTML = list
                .map((g) => `<option value="${escapeHtml(g.key)}">${escapeHtml(formatGovLabel(g, showDelta))}</option>`)
                .join('');
            if (prev && list.some((g) => g.key === prev)) {
                sel.value = prev;
            } else if (list[0]) {
                sel.value = list[0].key;
            }
        });
    }

    function getToken() {
        try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
    }

    function getCachedUser() {
        try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); } catch { return null; }
    }

    function setSession(token, user) {
        try {
            if (token) localStorage.setItem(TOKEN_KEY, token);
            else localStorage.removeItem(TOKEN_KEY);
            if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
            else localStorage.removeItem(USER_KEY);
        } catch { /* storage unavailable */ }
    }

    async function api(path, { method = 'GET', body } = {}) {
        const headers = {};
        if (body !== undefined) headers['Content-Type'] = 'application/json';
        const token = getToken();
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(API_BASE + path, {
            method,
            headers,
            body: body !== undefined ? JSON.stringify(body) : undefined
        });

        let data = null;
        try { data = await res.json(); } catch { /* empty body */ }

        if (!res.ok) {
            throw new Error((data && data.error) || (currentLang === 'en' ? 'Unable to connect to server.' : 'تعذر الاتصال بالخادم.'));
        }
        return data;
    }

    function escapeHtml(value) {
        return String(value ?? '').replace(/[&<>"']/g, (c) => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[c]));
    }

    function starsMarkup(rating) {
        const r = Math.max(0, Math.min(5, Number(rating) || 0));
        let html = '';
        for (let i = 1; i <= 5; i++) {
            if (r >= i) html += '<i class="fa-solid fa-star" aria-hidden="true"></i>';
            else if (r >= i - 0.5) html += '<i class="fa-solid fa-star-half-stroke" aria-hidden="true"></i>';
            else html += '<i class="fa-regular fa-star" aria-hidden="true"></i>';
        }
        return html;
    }

    function relativeDate(value) {
        const nowLabel = currentLang === 'en' ? 'Just now' : 'الآن';
        if (!value) return nowLabel;
        const d = new Date(String(value).includes('T') ? value : String(value).replace(' ', 'T') + 'Z');
        if (Number.isNaN(d.getTime())) return nowLabel;
        const diff = Math.max(0, Date.now() - d.getTime());
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return nowLabel;
        if (mins < 60) return currentLang === 'en' ? `${mins}m ago` : `منذ ${mins} دقيقة`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return currentLang === 'en' ? `${hours}h ago` : `منذ ${hours} ساعة`;
        const days = Math.floor(hours / 24);
        if (days < 30) return currentLang === 'en' ? `${days}d ago` : `منذ ${days} يوم`;
        return d.toLocaleDateString(currentLang === 'en' ? 'en-US' : 'ar-EG');
    }

    function debounce(fn, wait = 250) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), wait);
        };
    }

    /* ----------------------- Render helpers --------------------------- */

    const serviceColors = ['', 'icon-cyan', 'icon-green', 'icon-amber', 'icon-rose', 'icon-violet', 'icon-teal', 'icon-red', 'icon-indigo', 'icon-orange', 'icon-lime', 'icon-sky'];
    const tagColors = ['tag-blue', 'tag-cyan', 'tag-amber', 'tag-green', 'tag-rose', 'tag-violet', 'tag-orange'];
    const avatarColors = ['', 'avatar-cyan', 'avatar-amber', 'avatar-green', 'avatar-violet', 'avatar-rose', 'avatar-orange', 'avatar-red'];

    function reviewTagIcon(tag) {
        const tagText = String(tag || '');
        if (tagText.includes('كهرب')) return 'fa-bolt';
        if (tagText.includes('سباك')) return 'fa-faucet-drip';
        if (tagText.includes('تكييف')) return 'fa-snowflake';
        if (tagText.includes('نجار')) return 'fa-hammer';
        if (tagText.includes('دهان')) return 'fa-paint-roller';
        if (tagText.includes('تنظيف')) return 'fa-house';
        if (tagText.includes('كاميرا')) return 'fa-video';
        if (tagText.includes('قفل') || tagText.includes('أقفال')) return 'fa-key';
        if (tagText.includes('ألوميتال')) return 'fa-door-open';
        if (tagText.includes('شبك')) return 'fa-wifi';
        if (tagText.includes('حشر')) return 'fa-broom';
        return 'fa-star';
    }

    function serviceCardHtml(service, index) {
        const localizedTitle = I18N ? I18N.translateServiceTitle(service.title, currentLang) : service.title;
        const localizedDesc = I18N ? I18N.translateServiceDesc(service.title, service.description, currentLang) : service.description;
        const arrowClass = currentLang === 'en' ? 'fa-arrow-right' : 'fa-arrow-left';

        return `
            <div class="service-card reveal" data-category="${escapeHtml(service.category)}" data-name="${escapeHtml(service.title)}" data-name-alt="${escapeHtml(localizedTitle)}">
                <div class="service-icon ${serviceColors[index % serviceColors.length]}"><i class="${escapeHtml(service.iconClass)}" aria-hidden="true"></i></div>
                <h3>${escapeHtml(localizedTitle)}</h3>
                <p>${escapeHtml(localizedDesc)}</p>
                <button class="service-request-btn" data-service="${escapeHtml(service.title)}">${escapeHtml(t('services.request_now'))} <i class="fa-solid ${arrowClass} dir-arrow" aria-hidden="true"></i></button>
            </div>`;
    }

    function providerCardHtml(provider) {
        const available = provider.isAvailable !== false;
        const statusClass = available ? 'online' : 'busy';
        const statusText = available ? t('providers.status_online') : t('providers.status_busy');
        const img = provider.avatar || 'images/provider-1.webp';
        const price = provider.price != null ? provider.price : 200;
        const rating = Number(provider.rating || 5);
        const reviews = provider.reviewsCount || 0;
        const localized = I18N ? I18N.translateProvider(provider, currentLang) : provider;
        const skillsAttr = Array.isArray(localized.skills) ? localized.skills.join('|') : '';
        const priceLabel = `${price} ${t('providers.price_unit')}`;

        return `
            <article class="provider-card reveal"
                data-city="${escapeHtml(provider.city || '')}"
                data-location="${escapeHtml(localized.location || provider.city || '')}"
                data-status="${statusClass}"
                data-name="${escapeHtml(localized.fullname)}"
                data-name-raw="${escapeHtml(provider.fullname)}"
                data-job="${escapeHtml(localized.jobTitle || '')}"
                data-job-raw="${escapeHtml(provider.jobTitle || '')}"
                data-rate="${rating.toFixed(1)}"
                data-reviews="${reviews}"
                data-img="${escapeHtml(img)}"
                data-exp="${escapeHtml(localized.experience || '')}"
                data-price="${escapeHtml(priceLabel)}"
                data-price-num="${escapeHtml(price)}"
                data-bio="${escapeHtml(localized.bio || '')}"
                data-skills="${escapeHtml(skillsAttr)}">
                <div class="provider-image">
                    <img src="${escapeHtml(img)}" alt="${escapeHtml(localized.fullname)}" width="640" height="640" loading="lazy" decoding="async">
                    <span class="status ${statusClass}">${escapeHtml(statusText)}</span>
                    <span class="provider-price-tag"><i class="fa-solid fa-tag" aria-hidden="true"></i> ${escapeHtml(priceLabel)}</span>
                </div>
                <div class="provider-info">
                    <h3>${escapeHtml(localized.fullname)} <i class="fa-solid fa-circle-check verified-badge" title="${currentLang === 'en' ? 'Verified Technician' : 'فني معتمد وموثق'}" aria-hidden="true"></i></h3>
                    <span class="job">${escapeHtml(localized.jobTitle || '')}</span>
                    <div class="rating" aria-label="${rating.toFixed(1)} / 5 (${reviews})">
                        <div class="stars" aria-hidden="true">${starsMarkup(rating)}</div>
                        <span class="rate-num">${rating.toFixed(1)}</span>
                        <small>(${reviews} ${escapeHtml(t('providers.reviews_word'))})</small>
                    </div>
                    <div class="location">
                        <i class="fa-solid fa-location-dot" aria-hidden="true"></i> ${escapeHtml(localized.location || provider.city || '')}
                    </div>
                    <div class="provider-actions">
                        <button class="provider-btn view-profile-btn">${escapeHtml(t('providers.view_profile'))}</button>
                        <button class="provider-direct-btn direct-book-btn"><i class="fa-solid fa-calendar-check" aria-hidden="true"></i> ${escapeHtml(t('providers.book_now'))}</button>
                    </div>
                </div>
            </article>`;
    }

    function reviewCardHtml(review, index) {
        const rating = Number(review.rating) || 5;
        const rawTag = review.tag || 'خدمة منزلية';
        const tag = I18N ? I18N.translateReviewTag(rawTag, currentLang) : rawTag;
        const city = I18N ? I18N.translateCity(review.city || 'مصر', currentLang) : (review.city || 'مصر');
        const initial = String(review.authorName || 'ع').trim().charAt(0) || 'ع';

        return `
            <article class="review-card reveal">
                <div class="review-card-top">
                    <div class="review-stars" aria-label="${rating} / 5">
                        ${starsMarkup(rating)}
                        <span class="review-score">${rating.toFixed(1)}</span>
                    </div>
                    <span class="review-tag ${tagColors[index % tagColors.length]}"><i class="fa-solid ${reviewTagIcon(rawTag)}" aria-hidden="true"></i> ${escapeHtml(tag)}</span>
                </div>
                <p class="review-text">"${escapeHtml(review.comment)}"</p>
                <div class="review-author">
                    <div class="author-avatar ${avatarColors[index % avatarColors.length]}" aria-hidden="true">${escapeHtml(initial)}</div>
                    <div class="author-info-text">
                        <h4>${escapeHtml(review.authorName)} <i class="fa-solid fa-circle-check verified-client" title="${escapeHtml(t('reviews.client_label'))}" aria-hidden="true"></i></h4>
                        <span>${escapeHtml(t('reviews.client_label'))} — ${escapeHtml(city)}</span>
                    </div>
                    <span class="review-date">${escapeHtml(currentLang === 'en' ? relativeDate(review.createdAt) : (review.displayDate || relativeDate(review.createdAt)))}</span>
                </div>
            </article>`;
    }

    function observeReveals(root = document) {
        root.querySelectorAll('.reveal:not(.active)').forEach((el, i) => {
            el.style.transitionDelay = (i % 4) * 0.08 + 's';
            revealObserver.observe(el);
        });
    }

    /* ----------------------- Data loaders ----------------------------- */

    function renderServices() {
        const grid = document.getElementById('services-grid');
        if (grid && cachedServices.length) {
            grid.innerHTML = cachedServices.map(serviceCardHtml).join('');
            observeReveals(grid);
        }
        populateBookingServices(cachedServices);
        populateCalculatorServices(cachedServices);
        if (typeof renderClientGovernorateExplorer === 'function') {
            renderClientGovernorateExplorer();
        }
    }

    function renderProviders() {
        const grid = document.getElementById('providers-grid');
        if (grid && cachedProviders.length) {
            grid.querySelectorAll('.provider-card:not(.view-more-card)').forEach((el) => el.remove());
            const html = cachedProviders.map(providerCardHtml).join('');
            const viewMore = document.getElementById('view-more-providers-card');
            if (viewMore) viewMore.insertAdjacentHTML('beforebegin', html);
            else grid.insertAdjacentHTML('beforeend', html);
            observeReveals(grid);
            filterProvidersByCity(activeProviderFilter);
        }
    }

    function renderReviews() {
        const grid = document.getElementById('reviews-grid');
        if (grid && cachedReviews.length) {
            grid.innerHTML = cachedReviews.map(reviewCardHtml).join('');
            observeReveals(grid);
            setupMarquee();
        }
    }

    async function loadServices() {
        const grid = document.getElementById('services-grid');
        if (grid) grid.setAttribute('aria-busy', 'true');
        try {
            const data = await api('/services');
            cachedServices = data.services || [];
            renderServices();
            return cachedServices;
        } catch (err) {
            showToast(
                currentLang === 'en' ? 'Could not load services' : 'تعذر تحميل الخدمات',
                currentLang === 'en' ? 'Showing cached data for now.' : 'يتم عرض البيانات المحفوظة حالياً.',
                'error'
            );
            return [];
        } finally {
            if (grid) grid.removeAttribute('aria-busy');
        }
    }

    function populateBookingServices(services) {
        const select = document.getElementById('booking-service-select');
        if (!select || !services.length) return;
        const previousVal = select.value;
        const cityEl = document.getElementById('booking-city');
        const activeCity = (cityEl && cityEl.value) ? cityEl.value : 'القاهرة';
        select.innerHTML = services
            .map((s) => {
                const localizedTitle = I18N ? I18N.translateServiceTitle(s.title, currentLang) : s.title;
                const cityPrice = applyGovPrice(s.basePrice, activeCity);
                return `<option value="${escapeHtml(s.title)}" data-price="${s.basePrice}" data-name="${escapeHtml(s.title)}">${escapeHtml(localizedTitle)} — ${cityPrice} ${escapeHtml(t('providers.price_unit'))}</option>`;
            })
            .join('');
        if (previousVal && Array.from(select.options).some((o) => o.value === previousVal)) {
            select.value = previousVal;
        }
        if (typeof updateBookingPriceDisplay === 'function') {
            updateBookingPriceDisplay();
        }
    }

    function populateCalculatorServices(services) {
        const select = document.getElementById('calc-service-type');
        if (!select || !services.length) return;
        const prevIndex = select.selectedIndex;
        select.innerHTML = services
            .map((s) => {
                const localizedTitle = I18N ? I18N.translateServiceTitle(s.title, currentLang) : s.title;
                return `<option value="${s.basePrice}" data-name="${escapeHtml(s.title)}">${escapeHtml(localizedTitle)}</option>`;
            })
            .join('');
        if (prevIndex >= 0 && prevIndex < select.options.length) {
            select.selectedIndex = prevIndex;
        }
        if (typeof updateCalculatedPrice === 'function') {
            updateCalculatedPrice();
        }
    }

    async function loadProviders() {
        const grid = document.getElementById('providers-grid');
        if (grid) grid.setAttribute('aria-busy', 'true');
        try {
            const data = await api('/providers');
            cachedProviders = data.providers || [];
            renderProviders();
            return cachedProviders;
        } catch (err) {
            showToast(
                currentLang === 'en' ? 'Could not load technicians' : 'تعذر تحميل الفنيين',
                currentLang === 'en' ? 'Showing cached data for now.' : 'يتم عرض البيانات المحفوظة حالياً.',
                'error'
            );
            return [];
        } finally {
            if (grid) grid.removeAttribute('aria-busy');
        }
    }

    async function loadReviews() {
        const grid = document.getElementById('reviews-grid');
        if (grid) grid.setAttribute('aria-busy', 'true');
        try {
            const data = await api('/reviews?limit=20');
            cachedReviews = data.reviews || [];
            renderReviews();
            return cachedReviews;
        } catch (err) {
            showToast(
                currentLang === 'en' ? 'Could not load reviews' : 'تعذر تحميل التقييمات',
                currentLang === 'en' ? 'Showing cached data for now.' : 'يتم عرض البيانات المحفوظة حالياً.',
                'error'
            );
            return [];
        } finally {
            if (grid) grid.removeAttribute('aria-busy');
        }
    }

    /* ----------------------- Auth UI ---------------------------------- */

    function syncWorkspaceNavLabels(user) {
        const isPro = Boolean(user && user.role === 'PROVIDER');
        const wsLabelKey = isPro ? 'nav.provider_workspace' : 'nav.client_workspace';
        const bannerKey = isPro ? 'banner.return_provider' : 'banner.return_client';
        const menuWsLabel = document.getElementById('menu-workspace-label');
        const mobileWsLabel = document.getElementById('mobile-workspace-label');
        const returnBannerText = document.getElementById('marketplace-return-text');
        if (menuWsLabel) menuWsLabel.textContent = t(wsLabelKey);
        if (mobileWsLabel) mobileWsLabel.textContent = t(wsLabelKey);
        if (returnBannerText) returnBannerText.textContent = t(bannerKey);
    }

    function setAuthUI(user) {
        const guest = document.getElementById('auth-guest');
        const userBox = document.getElementById('auth-user');
        const nameEl = document.getElementById('auth-user-name');
        const mobileAuth = document.getElementById('mobile-nav-auth');
        const mobileUser = document.getElementById('mobile-nav-user');
        if (!guest || !userBox) return;

        syncWorkspaceNavLabels(user);

        if (user) {
            guest.classList.add('hidden');
            if (mobileAuth) mobileAuth.classList.add('hidden');
            if (mobileUser) mobileUser.classList.remove('hidden');
            userBox.classList.remove('hidden');
            if (nameEl) nameEl.textContent = user.fullname || (currentLang === 'en' ? 'My Profile' : 'حسابي');
        } else {
            guest.classList.remove('hidden');
            if (mobileAuth) mobileAuth.classList.remove('hidden');
            if (mobileUser) mobileUser.classList.add('hidden');
            userBox.classList.add('hidden');
        }
    }

    async function loadGovernorates() {
        try {
            const data = await api('/governorates');
            if (data && Array.isArray(data.governorates) && data.governorates.length) {
                cachedGovernorates = data.governorates;
            }
        } catch { /* fallback to I18N.GOVERNORATES */ }
        populateGovernorateSelects();
    }

    async function loadSession() {
        const cached = getCachedUser();
        if (cached) setAuthUI(cached);

        if (!getToken()) {
            setAuthUI(null);
            if (typeof exitWorkspace === 'function') exitWorkspace({ keepBannerHidden: true });
            return;
        }

        try {
            const data = await api('/auth/me');
            setSession(getToken(), data.user);
            setAuthUI(data.user);
            if (!isBrowsingMarketplace && typeof enterWorkspace === 'function') {
                enterWorkspace({ refresh: true, skipScroll: true });
            }
        } catch {
            setSession(null, null);
            setAuthUI(null);
            if (typeof exitWorkspace === 'function') exitWorkspace({ keepBannerHidden: true });
        }
    }

    async function initData() {
        populateGovernorateSelects();
        await Promise.allSettled([loadGovernorates(), loadServices(), loadProviders(), loadReviews(), loadSession()]);
    }

    /* =========================================================
       0. DARK MODE / NIGHT THEME SYSTEM WITH PERSISTENCE
       ========================================================= */
    const themeToggleBtn = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('fixora_theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    function applyTheme(isDark, silent = false) {
        document.body.classList.toggle('dark-mode', isDark);
        if (themeToggleBtn) {
            const icon = themeToggleBtn.querySelector('i');
            if (icon) {
                icon.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
            }
            themeToggleBtn.setAttribute('title', isDark ? t('nav.theme_title_dark') : t('nav.theme_title_light'));
        }
        localStorage.setItem('fixora_theme', isDark ? 'dark' : 'light');
        if (!silent && typeof showToast === 'function') {
            showToast(
                isDark ? t('toast.theme_dark_title') : t('toast.theme_light_title'),
                isDark ? t('toast.theme_dark_msg') : t('toast.theme_light_msg'),
                'info',
                3000
            );
        }
    }

    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        applyTheme(true, true);
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const isCurrentlyDark = document.body.classList.contains('dark-mode');
            applyTheme(!isCurrentlyDark);
        });
    }

    /* =========================================================
       0.2 BILINGUAL LANGUAGE SWITCHER (ARABIC / ENGLISH)
       ========================================================= */
    const langToggleBtn = document.getElementById('lang-toggle');
    const langToggleLabel = document.getElementById('lang-toggle-label');
    const tickerControls = [];

    function applyLanguage(lang, notify = false) {
        currentLang = lang === 'en' ? 'en' : 'ar';
        try { localStorage.setItem('fixora_lang', currentLang); } catch { /* ignore */ }

        document.documentElement.lang = currentLang;
        document.documentElement.dir = currentLang === 'en' ? 'ltr' : 'rtl';
        document.title = t('meta.title');

        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', t('meta.description'));

        if (langToggleLabel) langToggleLabel.textContent = t('nav.lang_btn');
        if (langToggleBtn) {
            langToggleBtn.setAttribute('title', t('nav.lang_title'));
            langToggleBtn.setAttribute('aria-label', t('nav.lang_title'));
        }

        if (themeToggleBtn) {
            const isDark = document.body.classList.contains('dark-mode');
            themeToggleBtn.setAttribute('title', isDark ? t('nav.theme_title_dark') : t('nav.theme_title_light'));
        }

        const closeAnnBtn = document.getElementById('close-announcement-btn');
        if (closeAnnBtn) {
            closeAnnBtn.setAttribute('aria-label', t('announcement.close_aria'));
        }

        document.querySelectorAll('[data-i18n]').forEach((el) => {
            const key = el.getAttribute('data-i18n');
            if (key) el.textContent = t(key);
        });

        document.querySelectorAll('[data-i18n-html]').forEach((el) => {
            const key = el.getAttribute('data-i18n-html');
            if (key) el.innerHTML = t(key);
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (key) el.setAttribute('placeholder', t(key));
        });

        document.querySelectorAll('[data-city-value]').forEach((opt) => {
            const rawCity = opt.getAttribute('data-city-value');
            if (rawCity && I18N) {
                opt.textContent = I18N.translateCity(rawCity, currentLang);
            }
        });

        document.querySelectorAll('.dir-arrow').forEach((icon) => {
            icon.classList.remove('fa-arrow-left', 'fa-arrow-right');
            icon.classList.add(currentLang === 'en' ? 'fa-arrow-right' : 'fa-arrow-left');
        });

        populateGovernorateSelects();
        renderServices();
        renderProviders();
        renderReviews();
        setAuthUI(getCachedUser());
        tickerControls.forEach((ctrl) => ctrl.sync());

        if (typeof updateBookingPriceDisplay === 'function') {
            updateBookingPriceDisplay();
        }
        if (typeof updateCalculatedPrice === 'function') {
            updateCalculatedPrice();
        }
        if (cachedProfileData) {
            renderUserProfileModal(cachedProfileData);
            if (typeof renderWorkspace === 'function') {
                renderWorkspace(cachedProfileData);
            }
        }

        if (notify && typeof showToast === 'function') {
            showToast(t('toast.lang_title'), t('toast.lang_msg'), 'info', 3000);
        }
    }

    if (langToggleBtn) {
        langToggleBtn.addEventListener('click', () => {
            applyLanguage(currentLang === 'en' ? 'ar' : 'en', true);
        });
    }

    /* =========================================================
       1. GLOBAL TOAST NOTIFICATION SYSTEM
       ========================================================= */
    const toastContainer = document.getElementById('toast-container');

    function showToast(title, message, type = 'success', duration = 4000) {
        if (!toastContainer) return;
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.setAttribute('role', 'alert');

        const iconClass = type === 'success' ? 'fa-circle-check' : (type === 'error' ? 'fa-circle-xmark' : 'fa-circle-info');

        toast.innerHTML = `
            <i class="fa-solid ${iconClass} toast-icon" aria-hidden="true"></i>
            <div class="toast-content">
                <strong>${escapeHtml(title)}</strong>
                <span>${escapeHtml(message)}</span>
            </div>
        `;

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-30px)';
            toast.style.transition = 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
            setTimeout(() => toast.remove(), 350);
        }, duration);
    }

    /* =========================================================
       2. MODAL MANAGER & ACCESSIBILITY FOCUS TRAP
       ========================================================= */
    let lastActiveElement = null;

    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            lastActiveElement = document.activeElement;
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            modal.setAttribute('aria-hidden', 'false');

            // Focus on first input or close button
            const firstFocusable = modal.querySelector('input, select, textarea, button:not(.modal-close)');
            if (firstFocusable) firstFocusable.focus();
        }
    }

    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
            modal.setAttribute('aria-hidden', 'true');

            if (lastActiveElement) {
                lastActiveElement.focus();
            }
        }
    }

    // Close modal triggers
    document.querySelectorAll('[data-close]').forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.getAttribute('data-close');
            closeModal(modalId);
        });
    });

    // Close on overlay backdrop click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeModal(overlay.id);
            }
        });
    });

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay:not(.hidden)').forEach(modal => {
                closeModal(modal.id);
            });
        }
    });

    /* =========================================================
       3. NAVIGATION & HEADER SCROLL CONTROLLER
       ========================================================= */
    const header = document.getElementById('header');
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    // Overlay element for mobile menu
    const menuOverlay = document.createElement('div');
    menuOverlay.className = 'overlay';
    menuOverlay.setAttribute('aria-hidden', 'true');
    document.body.appendChild(menuOverlay);

    function toggleMobileMenu(show) {
        const isOpen = show !== undefined ? show : !navMenu.classList.contains('open');
        navMenu.classList.toggle('open', isOpen);
        menuOverlay.classList.toggle('show', isOpen);

        if (menuToggle) {
            menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            const icon = menuToggle.querySelector('i');
            if (icon) {
                icon.className = isOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
            }
        }
    }

    if (menuToggle) {
        menuToggle.addEventListener('click', () => toggleMobileMenu());
    }
    menuOverlay.addEventListener('click', () => toggleMobileMenu(false));
    navLinks.forEach(link => link.addEventListener('click', (e) => {
        toggleMobileMenu(false);
        const href = link.getAttribute('href') || '';
        if (document.body.classList.contains('workspace-active') && href.startsWith('#')) {
            e.preventDefault();
            exitWorkspace({ scrollTargetId: href.slice(1) });
        }
    }));

    document.querySelectorAll('a.logo, .footer-logo, .footer-col a[href^="#"]').forEach((link) => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href') || '';
            if (document.body.classList.contains('workspace-active') && href.startsWith('#')) {
                e.preventDefault();
                exitWorkspace({ scrollTargetId: href.slice(1) });
            }
        });
    });

    // Header Shrink & Active Nav Highlight
    function handleScroll() {
        if (header) {
            header.classList.toggle('scrolled', window.scrollY > 60);
        }

        // Back-to-top button state
        const backTop = document.querySelector('.back-to-top');
        if (backTop) {
            backTop.classList.toggle('show', window.scrollY > 450);
        }

        // Active link detection
        let currentSectionId = '';
        sections.forEach(sec => {
            if (window.scrollY >= sec.offsetTop - 200) {
                currentSectionId = sec.id;
            }
        });

        navLinks.forEach(link => {
            const isCurrent = link.getAttribute('href') === '#' + currentSectionId;
            link.classList.toggle('active-link', isCurrent);
            if (isCurrent) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    }

    let scrollTicking = false;
    function onScroll() {
        if (scrollTicking) return;
        scrollTicking = true;
        requestAnimationFrame(() => {
            scrollTicking = false;
            handleScroll();
        });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    handleScroll();

    /* =========================================================
       4. BACK TO TOP BUTTON
       ========================================================= */
    const backTopBtn = document.createElement('button');
    backTopBtn.className = 'back-to-top';
    backTopBtn.setAttribute('aria-label', 'العودة إلى أعلى الصفحة');
    backTopBtn.innerHTML = '<i class="fa-solid fa-chevron-up" aria-hidden="true"></i>';
    document.body.appendChild(backTopBtn);

    backTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    /* =========================================================
       5. INTERACTIVE LIVE SEARCH & FILTERING SYSTEM
       ========================================================= */
    const heroSearchForm = document.getElementById('hero-search-form');
    const searchInput = document.getElementById('search-input');
    const searchCitySelect = document.getElementById('search-city');
    const noServicesMsg = document.getElementById('no-services-msg');

    function getServiceCards() {
        return document.querySelectorAll('#services-grid .service-card');
    }

    function performSearch({ scroll = false, notify = false } = {}) {
        const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        const selectedCity = searchCitySelect ? searchCitySelect.value : '';

        if (query) {
            serviceFilterBtns.forEach(b => {
                const isAll = b.getAttribute('data-category') === 'all';
                b.classList.toggle('active', isAll);
                b.setAttribute('aria-selected', isAll ? 'true' : 'false');
            });
        }

        let visibleCount = 0;

        getServiceCards().forEach(card => {
            const serviceName = (card.getAttribute('data-name') || '').toLowerCase();
            const serviceNameAlt = (card.getAttribute('data-name-alt') || '').toLowerCase();
            const serviceCategory = (card.getAttribute('data-category') || '').toLowerCase();
            const cardText = card.textContent.toLowerCase();

            const matchesQuery = !query || serviceName.includes(query) || serviceNameAlt.includes(query) || serviceCategory.includes(query) || cardText.includes(query);

            if (matchesQuery) {
                card.style.display = '';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        if (noServicesMsg) {
            noServicesMsg.classList.toggle('hidden', visibleCount > 0);
        }

        if (selectedCity) {
            filterProvidersByCity(selectedCity);
        } else if (scroll && !query) {
            filterProvidersByCity('all');
        }

        if (scroll && (query || selectedCity)) {
            const targetId = query ? 'services' : 'providers';
            const targetSec = document.getElementById(targetId);
            if (targetSec) {
                window.scrollTo({
                    top: targetSec.offsetTop - 90,
                    behavior: 'smooth'
                });
            }
        }

        if (notify && (query || selectedCity)) {
            if (query) {
                showToast(
                    currentLang === 'en' ? 'Search Results' : 'نتائج البحث',
                    currentLang === 'en' ? `Found ${visibleCount} matching services` : `تم العثور على ${visibleCount} خدمة مطابقة لبحثك`,
                    'info'
                );
            } else {
                const cityMatches = Array.from(getProviderCards()).filter(
                    c => !c.classList.contains('view-more-card') && c.style.display !== 'none'
                ).length;
                const cityLabel = I18N ? I18N.translateCity(selectedCity, currentLang) : selectedCity;
                showToast(
                    currentLang === 'en' ? 'Governorate Filter' : 'تصفية المحافظة',
                    currentLang === 'en' ? `Showing ${cityMatches} technicians in ${cityLabel}` : `تم عرض ${cityMatches} فني متاح في ${cityLabel}`,
                    'info'
                );
            }
        }
    }

    if (heroSearchForm) {
        heroSearchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            performSearch({ scroll: true, notify: true });
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => performSearch(), 250));
    }

    // Live filter for Services Tabs
    const serviceFilterBtns = document.querySelectorAll('#services-filter .filter-btn');
    serviceFilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            serviceFilterBtns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');

            const category = btn.getAttribute('data-category');

            let visibleCount = 0;
            getServiceCards().forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                if (category === 'all' || cardCategory === category) {
                    card.style.display = '';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });

            if (noServicesMsg) {
                noServicesMsg.classList.toggle('hidden', visibleCount > 0);
            }
        });
    });

    // Providers Filter Tabs
    let activeProviderFilter = 'all';
    const providerFilterBtns = document.querySelectorAll('#providers-filter .filter-btn');

    function getProviderCards() {
        return document.querySelectorAll('#providers-grid .provider-card');
    }

    function filterProvidersByCity(filterVal) {
        activeProviderFilter = filterVal || 'all';

        providerFilterBtns.forEach(b => {
            const isActive = b.getAttribute('data-filter') === activeProviderFilter;
            b.classList.toggle('active', isActive);
            b.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        getProviderCards().forEach(card => {
            if (card.classList.contains('view-more-card')) {
                card.style.display = activeProviderFilter === 'all' ? '' : 'none';
                return;
            }
            const status = card.getAttribute('data-status') || '';
            const city = card.getAttribute('data-city') || '';

            if (activeProviderFilter === 'all') {
                card.style.display = '';
            } else if (activeProviderFilter === 'online') {
                card.style.display = status === 'online' ? '' : 'none';
            } else if (city === activeProviderFilter || city.includes(activeProviderFilter)) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    }

    providerFilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filterVal = btn.getAttribute('data-filter');
            filterProvidersByCity(filterVal);
        });
    });

    // Provider Horizontal Slider Navigation Controls
    const providerSlider = document.getElementById('providers-grid');
    const slidePrevBtn = document.getElementById('slide-prev-providers');
    const slideNextBtn = document.getElementById('slide-next-providers');
    const viewAllProvidersBtn = document.getElementById('view-all-providers-btn');

    if (providerSlider && slidePrevBtn && slideNextBtn) {
        slidePrevBtn.addEventListener('click', () => {
            providerSlider.scrollBy({ left: 360, behavior: 'smooth' });
        });
        slideNextBtn.addEventListener('click', () => {
            providerSlider.scrollBy({ left: -360, behavior: 'smooth' });
        });
    }

    if (viewAllProvidersBtn) {
        viewAllProvidersBtn.addEventListener('click', () => {
            triggerBooking();
        });
    }

    // Footer filter links
    document.querySelectorAll('[data-filter-link]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = link.getAttribute('data-filter-link');
            const targetBtn = document.querySelector(`#services-filter .filter-btn[data-category="${category}"]`);
            if (targetBtn) {
                targetBtn.click();
            }
            const servicesSec = document.getElementById('services');
            if (servicesSec) {
                window.scrollTo({
                    top: servicesSec.offsetTop - 90,
                    behavior: 'smooth'
                });
            }
        });
    });

    /* =========================================================
       6. BOOKING / SERVICE REQUEST ENGINE + LIVE PRICE CARD
       ========================================================= */
    const bookingForm = document.getElementById('booking-form');
    const bookingServiceSelect = document.getElementById('booking-service-select');
    const bookingCitySelect = document.getElementById('booking-city');
    const bookingModalTitle = document.getElementById('booking-modal-title');
    const bookingPromoInput = document.getElementById('booking-promo-input');
    const bookingPriceServiceName = document.getElementById('booking-price-service-name');
    const bookingPriceAmount = document.getElementById('booking-price-amount');
    const bookingPriceOriginal = document.getElementById('booking-price-original');
    const bookingPromoBadge = document.getElementById('booking-promo-badge');
    const bookingGovBadge = document.getElementById('booking-gov-badge');

    let pendingProviderName = '';
    let pendingProviderDisplayName = '';
    let pendingProviderPrice = null;
    let pendingProviderBaseService = '';

    function resolveServiceTitle(rawName) {
        const text = String(rawName || '').trim();
        if (!text) return '';
        const keywordMap = [
            ['كهرب', 'كهرباء'],
            ['سباك', 'سباكة'],
            ['تكييف', 'تكييف وتبريد'],
            ['نجار', 'نجارة وأثاث'],
            ['دهان', 'دهانات وديكور'],
            ['تنظيف', 'تنظيف المنازل'],
            ['ألوميتال', 'ألوميتال وزجاج'],
            ['كاميرا', 'كاميرات مراقبة'],
            ['شبك', 'شبكات وإنترنت'],
            ['أقفال', 'مفاتيح وأقفال طوارئ'],
            ['مفاتيح', 'مفاتيح وأقفال طوارئ'],
            ['حشر', 'مكافحة الحشرات'],
            ['أجهزة', 'صيانة منزلية شاملة'],
            ['شاملة', 'صيانة منزلية شاملة']
        ];
        for (const [stem, title] of keywordMap) {
            if (text.includes(stem)) return title;
        }
        return text;
    }

    function updateBookingPriceDisplay() {
        if (!bookingServiceSelect || !bookingPriceAmount) return;
        const selectedOpt = bookingServiceSelect.options[bookingServiceSelect.selectedIndex];
        const serviceKey = bookingServiceSelect.value || 'كهرباء';
        const optionPrice = selectedOpt ? Number(selectedOpt.getAttribute('data-price')) : 200;

        const useProviderRate = pendingProviderPrice && pendingProviderPrice > 0 && pendingProviderBaseService === serviceKey;
        const rawBasePrice = useProviderRate ? pendingProviderPrice : (optionPrice > 0 ? optionPrice : 200);
        const city = bookingCitySelect ? bookingCitySelect.value : 'القاهرة';
        const gov = getGovInfo(city);
        const govAdjustedBase = applyGovPrice(rawBasePrice, city);

        const promoVal = bookingPromoInput ? bookingPromoInput.value.trim().toUpperCase() : '';
        const promoApplied = promoVal === 'FIX20';
        const finalPrice = promoApplied ? Math.max(0, govAdjustedBase - Math.round(govAdjustedBase * 0.2)) : govAdjustedBase;

        if (bookingPriceServiceName) {
            const localizedService = I18N ? I18N.translateServiceTitle(serviceKey, currentLang) : serviceKey;
            bookingPriceServiceName.textContent = (useProviderRate && pendingProviderDisplayName)
                ? `${localizedService} — ${pendingProviderDisplayName}`
                : localizedService;
        }

        bookingPriceAmount.textContent = String(finalPrice);

        if (bookingGovBadge) {
            const cityLabel = currentLang === 'en' ? (gov.nameEn || city) : (gov.nameAr || city);
            bookingGovBadge.textContent = `${t('booking.gov_rate_label')} ${cityLabel} · ${formatGovDeltaText(gov)}`;
        }

        if (bookingPriceOriginal) {
            bookingPriceOriginal.textContent = String(govAdjustedBase);
            bookingPriceOriginal.classList.toggle('hidden', !promoApplied);
        }
        if (bookingPromoBadge) {
            bookingPromoBadge.textContent = t('booking.promo_applied');
            bookingPromoBadge.classList.toggle('hidden', !promoApplied);
        }
    }

    if (bookingServiceSelect) {
        bookingServiceSelect.addEventListener('change', () => {
            if (pendingProviderBaseService && bookingServiceSelect.value !== pendingProviderBaseService) {
                pendingProviderPrice = null;
                pendingProviderName = '';
                pendingProviderDisplayName = '';
                pendingProviderBaseService = '';
                if (bookingModalTitle) bookingModalTitle.textContent = t('booking.title');
            }
            updateBookingPriceDisplay();
        });
    }

    if (bookingCitySelect) {
        bookingCitySelect.addEventListener('change', () => {
            populateBookingServices(cachedServices);
            updateBookingPriceDisplay();
        });
    }

    if (bookingPromoInput) {
        bookingPromoInput.addEventListener('input', updateBookingPriceDisplay);
    }

    function triggerBooking(serviceName = '', providerName = '', providerPrice = null, providerDisplayName = '', preferredCity = '') {
        pendingProviderName = providerName || '';
        pendingProviderDisplayName = providerDisplayName || providerName || '';
        pendingProviderPrice = (providerPrice && Number(providerPrice) > 0) ? Number(providerPrice) : null;

        // Pre-fill city before rendering service option prices so dropdown matches selected governorate
        const user = getCachedUser();
        const cityInput = document.getElementById('booking-city');
        if (cityInput) {
            const desiredCity = preferredCity || (user && user.city) || 'القاهرة';
            if (Array.from(cityInput.options).some((o) => o.value === desiredCity)) {
                cityInput.value = desiredCity;
            }
        }
        populateBookingServices(cachedServices);

        if (bookingServiceSelect && serviceName) {
            const target = resolveServiceTitle(serviceName);
            let matched = false;
            for (const option of bookingServiceSelect.options) {
                const value = (option.value || '').trim();
                const text = (option.textContent || '').trim();
                const dataName = (option.getAttribute('data-name') || '').trim();
                if (value === target || text === target || dataName === target ||
                    (target && (value.includes(target) || target.includes(value)))) {
                    option.selected = true;
                    matched = true;
                    break;
                }
            }
            if (!matched && bookingServiceSelect.options.length) {
                bookingServiceSelect.selectedIndex = 0;
            }
        }

        pendingProviderBaseService = pendingProviderPrice && bookingServiceSelect ? bookingServiceSelect.value : '';

        if (bookingModalTitle) {
            bookingModalTitle.textContent = pendingProviderDisplayName
                ? `${t('booking.title_provider')} ${pendingProviderDisplayName}`
                : t('booking.title');
        }

        // Pre-fill authenticated user profile defaults when available
        if (user) {
            const nameInput = document.getElementById('booking-name');
            const phoneInput = document.getElementById('booking-phone');
            const emailInput = document.getElementById('booking-email');
            const addressInput = document.getElementById('booking-address');
            if (nameInput && !nameInput.value) nameInput.value = user.fullname || '';
            if (phoneInput && !phoneInput.value) phoneInput.value = user.phone || '';
            if (emailInput && !emailInput.value) emailInput.value = user.email || '';
            if (addressInput && !addressInput.value && user.address) addressInput.value = user.address;
        }

        const datetimeInput = document.getElementById('booking-datetime');
        if (datetimeInput) {
            const now = new Date();
            now.setDate(now.getDate() + 1);
            const pad = (n) => String(n).padStart(2, '0');
            datetimeInput.value = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T10:00`;
        }

        updateBookingPriceDisplay();
        openModal('modal-booking');
    }

    const heroReqBtn = document.getElementById('hero-request-btn');
    if (heroReqBtn) {
        heroReqBtn.addEventListener('click', () => triggerBooking());
    }

    // Delegated actions (work for both static fallback cards and API-rendered cards)
    document.addEventListener('click', (e) => {
        const serviceBtn = e.target.closest('.service-request-btn');
        if (serviceBtn) {
            triggerBooking(serviceBtn.getAttribute('data-service') || '');
            return;
        }

        const bookBtn = e.target.closest('.direct-book-btn');
        if (bookBtn) {
            const card = bookBtn.closest('.provider-card');
            const rawPrice = card ? (card.getAttribute('data-price-num') || card.getAttribute('data-price') || '') : '';
            const numPrice = parseInt(String(rawPrice).replace(/[^0-9]/g, ''), 10) || null;
            triggerBooking(
                card ? (card.getAttribute('data-job-raw') || card.getAttribute('data-job') || '') : '',
                card ? (card.getAttribute('data-name-raw') || card.getAttribute('data-name') || '') : '',
                numPrice,
                card ? (card.getAttribute('data-name') || '') : ''
            );
            return;
        }

        const profileBtn = e.target.closest('.view-profile-btn');
        if (profileBtn) {
            const card = profileBtn.closest('.provider-card');
            if (card) openProfileFromCard(card);
        }
    });

    if (bookingForm) {
        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = bookingForm.querySelector('button[type="submit"]');
            const originalBtn = submitBtn ? submitBtn.innerHTML : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> ${escapeHtml(t('booking.submitting'))}`;
            }

            const name = document.getElementById('booking-name').value.trim();
            const phone = document.getElementById('booking-phone').value.trim();
            const email = (document.getElementById('booking-email') || {}).value || '';
            const service = bookingServiceSelect ? bookingServiceSelect.value : '';
            const city = document.getElementById('booking-city').value;
            const scheduledAt = document.getElementById('booking-datetime').value;
            const address = (document.getElementById('booking-address') || {}).value || '';
            const notes = document.getElementById('booking-notes').value.trim();
            const promoCode = bookingPromoInput ? bookingPromoInput.value.trim() : '';

            try {
                /* Save to service_requests (main table) */
                const srRes = await api('/service-requests', {
                    method: 'POST',
                    body: {
                        clientName: name,
                        clientPhone: phone,
                        clientEmail: email || undefined,
                        serviceTitle: service,
                        providerName: pendingProviderName || undefined,
                        promoCode: promoCode || undefined,
                        city,
                        address: address || undefined,
                        scheduledAt,
                        notes
                    }
                });

                /* Also save to bookings for backward compatibility */
                await api('/bookings', {
                    method: 'POST',
                    body: {
                        serviceTitle: service,
                        providerName: pendingProviderName || undefined,
                        promoCode: promoCode || undefined,
                        clientName: name,
                        clientPhone: phone,
                        city,
                        scheduledAt,
                        notes
                    }
                }).catch(() => { /* bookings is secondary, don't block */ });

                const finalPrice = srRes && srRes.request ? srRes.request.estimatedPrice : (bookingPriceAmount ? bookingPriceAmount.textContent : '');
                const localizedService = I18N ? I18N.translateServiceTitle(service, currentLang) : service;
                const localizedCity = I18N ? I18N.translateCity(city, currentLang) : city;

                closeModal('modal-booking');
                bookingForm.reset();
                populateGovernorateSelects();
                populateBookingServices(cachedServices);
                pendingProviderName = '';
                pendingProviderDisplayName = '';
                pendingProviderPrice = null;
                pendingProviderBaseService = '';
                updateBookingPriceDisplay();

                if (getToken() && typeof loadWorkspaceProfile === 'function') {
                    loadWorkspaceProfile();
                }

                const msg = currentLang === 'en'
                    ? `Thank you ${name}! Your request for (${localizedService}) in ${localizedCity} (${finalPrice} EGP) has been received. A technician will contact (${phone}) shortly.`
                    : `أهلاً بك يا ${name}، تم استلام طلبك لخدمة (${localizedService}) في ${localizedCity} بتكلفة تقديرية ${finalPrice} جنيه. سيتواصل معك الفني برقم (${phone}) خلال دقائق لتأكيد الموعد.`;

                showToast(t('toast.booking_ok_title'), msg, 'success', 6000);
            } catch (err) {
                showToast(t('toast.booking_err_title'), err.message, 'error', 5000);
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtn;
                }
            }
        });
    }

    /* =========================================================
       7. AUTHENTICATION SYSTEM & TAB SWITCHING
       ========================================================= */
    const openLoginBtn = document.getElementById('open-login-btn');
    const openRegisterBtn = document.getElementById('open-register-btn');
    const heroJoinBtn = document.getElementById('hero-join-btn');
    const ctaJoinBtn = document.getElementById('cta-join-btn');
    const authTabBtns = document.querySelectorAll('.auth-tab-btn');
    const authTabContents = document.querySelectorAll('.auth-tab-content');

    function openAuthModal(tabName = 'tab-login') {
        authTabBtns.forEach(b => {
            const isActive = b.getAttribute('data-tab') === tabName;
            b.classList.toggle('active', isActive);
            b.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });
        authTabContents.forEach(c => {
            c.classList.toggle('active', c.id === tabName);
        });
        openModal('modal-auth');
    }

    if (openLoginBtn) openLoginBtn.addEventListener('click', () => openAuthModal('tab-login'));
    if (openRegisterBtn) openRegisterBtn.addEventListener('click', () => openAuthModal('tab-register'));
    if (heroJoinBtn) heroJoinBtn.addEventListener('click', () => openAuthModal('tab-register'));
    if (ctaJoinBtn) ctaJoinBtn.addEventListener('click', () => openAuthModal('tab-register'));

    const mobileLoginBtn = document.getElementById('mobile-login-btn');
    const mobileRegisterBtn = document.getElementById('mobile-register-btn');
    if (mobileLoginBtn) mobileLoginBtn.addEventListener('click', () => { toggleMobileMenu(false); openAuthModal('tab-login'); });
    if (mobileRegisterBtn) mobileRegisterBtn.addEventListener('click', () => { toggleMobileMenu(false); openAuthModal('tab-register'); });

    authTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            authTabBtns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            authTabContents.forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');
            const targetContent = document.getElementById(targetTab);
            if (targetContent) targetContent.classList.add('active');
        });
    });

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const original = submitBtn ? submitBtn.innerHTML : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> ${escapeHtml(t('auth.logging_in'))}`;
            }

            try {
                const data = await api('/auth/login', {
                    method: 'POST',
                    body: {
                        identifier: document.getElementById('login-identifier').value.trim(),
                        password: document.getElementById('login-password').value
                    }
                });

                setSession(data.token, data.user);
                setAuthUI(data.user);
                closeModal('modal-auth');
                loginForm.reset();
                enterWorkspace({ refresh: true });
                showToast(
                    currentLang === 'en' ? 'Signed In Successfully' : 'تم تسجيل الدخول بنجاح',
                    currentLang === 'en' ? `Welcome back ${data.user.fullname} to Fixora!` : `مرحباً بك مجدداً ${data.user.fullname} في Fixora!`,
                    'success'
                );
            } catch (err) {
                showToast(currentLang === 'en' ? 'Sign In Failed' : 'تعذر تسجيل الدخول', err.message, 'error');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = original;
                }
            }
        });
    }

    async function performQuickDemoLogin(email, password, btnEl) {
        const original = btnEl ? btnEl.innerHTML : '';
        if (btnEl) btnEl.disabled = true;
        try {
            const data = await api('/auth/login', {
                method: 'POST',
                body: { identifier: email, password }
            });
            setSession(data.token, data.user);
            setAuthUI(data.user);
            closeModal('modal-auth');
            if (loginForm) loginForm.reset();
            enterWorkspace({ refresh: true });
            showToast(
                currentLang === 'en' ? 'Demo Workspace Ready' : 'تم الدخول إلى الواجهة بنجاح',
                currentLang === 'en' ? `Welcome ${data.user.fullname}` : `مرحباً بك ${data.user.fullname}`,
                'success'
            );
        } catch (err) {
            showToast(currentLang === 'en' ? 'Demo Login Failed' : 'تعذر الدخول التجريبي', err.message, 'error');
        } finally {
            if (btnEl) {
                btnEl.disabled = false;
                if (original) btnEl.innerHTML = original;
            }
        }
    }

    const demoClientBtn = document.getElementById('demo-login-client-btn');
    const demoProviderBtn = document.getElementById('demo-login-provider-btn');
    if (demoClientBtn) {
        demoClientBtn.addEventListener('click', () => performQuickDemoLogin('client@fixora.eg', '123456', demoClientBtn));
    }
    if (demoProviderBtn) {
        demoProviderBtn.addEventListener('click', () => performQuickDemoLogin('pro@fixora.eg', '123456', demoProviderBtn));
    }

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = registerForm.querySelector('button[type="submit"]');
            const original = submitBtn ? submitBtn.innerHTML : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> ${escapeHtml(t('auth.registering'))}`;
            }

            const type = document.getElementById('reg-account-type').value;
            const isProvider = type === 'provider';

            try {
                const data = await api('/auth/register', {
                    method: 'POST',
                    body: {
                        fullname: document.getElementById('reg-fullname').value.trim(),
                        phone: document.getElementById('reg-phone').value.trim(),
                        email: document.getElementById('reg-email').value.trim(),
                        password: document.getElementById('reg-password').value,
                        role: isProvider ? 'PROVIDER' : 'CLIENT',
                        city: document.getElementById('reg-city') ? document.getElementById('reg-city').value : null,
                        jobTitle: isProvider ? 'فني صيانة منزلية' : undefined
                    }
                });

                setSession(data.token, data.user);
                setAuthUI(data.user);
                closeModal('modal-auth');
                registerForm.reset();
                populateGovernorateSelects();
                enterWorkspace({ refresh: true });

                if (isProvider) {
                    showToast(
                        currentLang === 'en' ? 'Application Under Review 🛠️' : 'طلب الانضمام قيد المراجعة 🛠️',
                        currentLang === 'en'
                            ? 'Your technician profile is ready. Explore available requests and set your rates!'
                            : 'تم إنشاء واجهة مقدم الخدمة الخاصة بك! يمكنك الآن مراجعة الطلبات وضبط أسعارك.',
                        'success',
                        6000
                    );
                } else {
                    showToast(
                        currentLang === 'en' ? 'Account Created 🥳' : 'تم إنشاء الحساب بنجاح 🥳',
                        currentLang === 'en'
                            ? 'Welcome to Fixora! Your personal customer workspace is ready.'
                            : 'مرحباً بك كعميل في منصة Fixora. واجهتك الخاصة جاهزة الآن!',
                        'success',
                        5000
                    );
                }
            } catch (err) {
                showToast(currentLang === 'en' ? 'Registration Failed' : 'تعذر إنشاء الحساب', err.message, 'error');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = original;
                }
            }
        });
    }

    const authUserBox = document.getElementById('auth-user');
    const authUserDropdown = document.getElementById('auth-user-dropdown');
    const openUserProfileBtn = document.getElementById('open-user-profile-btn');
    const menuOpenWorkspaceBtn = document.getElementById('menu-open-workspace-btn');
    const mobileWorkspaceBtn = document.getElementById('mobile-workspace-btn');
    const menuOpenProfileBtn = document.getElementById('menu-open-profile-btn');
    const menuOpenRequestsBtn = document.getElementById('menu-open-requests-btn');
    const mobileProfileBtn = document.getElementById('mobile-profile-btn');
    const userTabBtns = document.querySelectorAll('.user-tab-btn');
    const userTabContents = document.querySelectorAll('.user-tab-content');
    const userProfileForm = document.getElementById('user-profile-form');
    const userRequestsList = document.getElementById('user-requests-list');

    function setUserDropdownOpen(isOpen) {
        if (!authUserDropdown || !openUserProfileBtn) return;
        authUserDropdown.classList.toggle('hidden', !isOpen);
        openUserProfileBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }

    async function handleLogout() {
        setUserDropdownOpen(false);
        try {
            await api('/auth/logout', { method: 'POST' });
        } catch { /* session may already be expired */ }
        setSession(null, null);
        cachedProfileData = null;
        isBrowsingMarketplace = false;
        setAuthUI(null);
        exitWorkspace({ keepBannerHidden: true });
        closeModal('modal-user-profile');
        showToast(t('toast.logout_title'), t('toast.logout_msg'), 'info');
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

    const mobileLogoutBtn = document.getElementById('mobile-logout-btn');
    if (mobileLogoutBtn) {
        mobileLogoutBtn.addEventListener('click', () => {
            toggleMobileMenu(false);
            handleLogout();
        });
    }

    /* =========================================================
       7.0 ROLE-BASED WORKSPACES (CUSTOMER UI VS PROVIDER UI)
       ========================================================= */
    const roleWorkspaceSection = document.getElementById('role-workspace');
    const marketplaceReturnBar = document.getElementById('marketplace-return-bar');
    const clientWorkspaceView = document.getElementById('client-workspace-view');
    const providerWorkspaceView = document.getElementById('provider-workspace-view');

    function switchClientWorkspaceTab(tabId) {
        activeClientTab = tabId || 'ws-client-orders';
        document.querySelectorAll('[data-ws-client-tab]').forEach((btn) => {
            const isActive = btn.getAttribute('data-ws-client-tab') === activeClientTab;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });
        ['ws-client-orders', 'ws-client-explore', 'ws-client-profile'].forEach((id) => {
            const panel = document.getElementById(id);
            if (panel) panel.classList.toggle('active', id === activeClientTab);
        });
    }

    function switchProviderWorkspaceTab(tabId) {
        activeProviderTab = tabId || 'ws-pro-feed';
        document.querySelectorAll('[data-ws-pro-tab]').forEach((btn) => {
            const isActive = btn.getAttribute('data-ws-pro-tab') === activeProviderTab;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });
        ['ws-pro-feed', 'ws-pro-jobs', 'ws-pro-settings'].forEach((id) => {
            const panel = document.getElementById(id);
            if (panel) panel.classList.toggle('active', id === activeProviderTab);
        });
    }

    function renderGovRatePreviewChips(baseRateInput) {
        const container = document.getElementById('ws-pro-gov-preview');
        if (!container) return;
        const rawRate = Number(baseRateInput);
        const safeRate = Number.isFinite(rawRate) && rawRate >= 50 ? rawRate : 200;
        const list = cachedGovernorates.length ? cachedGovernorates : (I18N ? I18N.GOVERNORATES : []);
        const unit = t('booking.price_currency');
        container.innerHTML = list
            .map((g) => {
                const name = currentLang === 'en' ? g.nameEn : g.nameAr;
                const price = applyGovPrice(safeRate, g.key);
                return `<span class="gov-rate-chip">${escapeHtml(name)}: <strong class="tabular-nums">${price} ${escapeHtml(unit)}</strong></span>`;
            })
            .join('');
    }

    function renderClientGovernorateExplorer() {
        const grid = document.getElementById('ws-client-gov-services');
        const citySel = document.getElementById('ws-client-explore-city');
        if (!grid) return;
        const city = (citySel && citySel.value) ? citySel.value : 'القاهرة';
        const gov = getGovInfo(city);
        const unit = t('booking.price_currency');
        const btnLabel = currentLang === 'en' ? 'Request in this Governorate' : 'اطلب بهذا السعر';
        const deltaLabel = formatGovDeltaText(gov);

        if (!cachedServices.length) {
            grid.innerHTML = '';
            return;
        }

        grid.innerHTML = cachedServices
            .map((s) => {
                const localizedTitle = I18N ? I18N.translateServiceTitle(s.title, currentLang) : s.title;
                const price = applyGovPrice(s.basePrice, city);
                return `
                    <div class="gov-service-card">
                        <div class="gov-service-top">
                            <div class="gov-service-title-wrap">
                                <div class="gov-service-icon"><i class="${escapeHtml(s.iconClass || 'fa-solid fa-wrench')}" aria-hidden="true"></i></div>
                                <h3>${escapeHtml(localizedTitle)}</h3>
                            </div>
                        </div>
                        <div class="gov-service-price-row">
                            <span class="gov-service-price tabular-nums">${price} ${escapeHtml(unit)}</span>
                            <span class="gov-service-delta">${escapeHtml(deltaLabel)}</span>
                        </div>
                        <button type="button" class="gov-service-book-btn" data-gov-book-service="${escapeHtml(s.title)}" data-gov-book-city="${escapeHtml(city)}">
                            <i class="fa-solid fa-paper-plane" aria-hidden="true"></i> ${escapeHtml(btnLabel)}
                        </button>
                    </div>`;
            })
            .join('');
    }

    function renderClientWorkspace(profileData) {
        const user = (profileData && profileData.user) || getCachedUser();
        if (!user) return;
        const requests = Array.isArray(profileData && profileData.requests) ? profileData.requests : [];
        const stats = (profileData && profileData.stats) || {};
        const currency = t('booking.price_currency');

        const avatarEl = document.getElementById('ws-client-avatar');
        const cityMetaEl = document.getElementById('ws-client-city-meta');
        const greetEl = document.getElementById('ws-client-greeting');
        if (avatarEl) avatarEl.textContent = String(user.fullname || 'C').trim().charAt(0).toUpperCase() || 'C';
        if (cityMetaEl) cityMetaEl.textContent = I18N ? I18N.translateCity(user.city || 'القاهرة', currentLang) : (user.city || 'القاهرة');
        if (greetEl) {
            greetEl.textContent = currentLang === 'en' ? `Welcome, ${user.fullname}` : `مرحباً، ${user.fullname}`;
        }

        const totalEl = document.getElementById('ws-client-kpi-total');
        const activeEl = document.getElementById('ws-client-kpi-active');
        const doneEl = document.getElementById('ws-client-kpi-done');
        const spendEl = document.getElementById('ws-client-kpi-spend');
        if (totalEl) totalEl.textContent = String(stats.totalRequests ?? requests.length);
        if (activeEl) activeEl.textContent = String(stats.activeRequests ?? requests.filter((r) => r.status === 'NEW' || r.status === 'PENDING').length);
        if (doneEl) doneEl.textContent = String(stats.completedRequests ?? requests.filter((r) => r.status === 'COMPLETED').length);
        const totalSpend = stats.totalEstimatedSpend ?? requests.filter((r) => r.status !== 'CANCELLED').reduce((sum, r) => sum + (Number(r.estimatedPrice) || 0), 0);
        if (spendEl) spendEl.textContent = `${totalSpend} ${currency}`;

        // Orders grid
        const listEl = document.getElementById('ws-client-orders-list');
        if (listEl) {
            const filtered = requests.filter((r) => {
                const st = String(r.status || 'NEW').toUpperCase();
                if (clientOrderFilter === 'active') return st === 'NEW' || st === 'PENDING';
                if (clientOrderFilter === 'completed') return st === 'COMPLETED';
                if (clientOrderFilter === 'cancelled') return st === 'CANCELLED';
                return true;
            });

            if (!filtered.length) {
                listEl.innerHTML = `
                    <div class="ws-empty-state">
                        <i class="fa-solid fa-clipboard-list" aria-hidden="true"></i>
                        <p>${escapeHtml(t('userprof.empty_requests'))}</p>
                        <button type="button" class="ws-btn-primary" id="ws-client-empty-new-btn">
                            <i class="fa-solid fa-plus" aria-hidden="true"></i> ${escapeHtml(t('ws.client_cta'))}
                        </button>
                    </div>`;
            } else {
                listEl.innerHTML = filtered
                    .map((req) => {
                        const statusKey = String(req.status || 'NEW').toUpperCase();
                        const statusLabel = t(`userprof.req_status_${statusKey}`);
                        const localizedService = I18N ? I18N.translateServiceTitle(req.serviceTitle, currentLang) : req.serviceTitle;
                        const localizedCity = I18N ? I18N.translateCity(req.city, currentLang) : req.city;
                        const dateText = req.scheduledAt ? String(req.scheduledAt).replace('T', ' ') : relativeDate(req.createdAt);
                        const canCancel = statusKey === 'NEW' || statusKey === 'PENDING';
                        const isDone = statusKey === 'COMPLETED';
                        const priceText = req.estimatedPrice > 0 ? `${req.estimatedPrice} ${currency}` : '';

                        return `
                            <article class="ws-order-card" data-ws-order-id="${req.id}">
                                <div class="ws-order-head">
                                    <div class="ws-order-title">
                                        <i class="fa-solid fa-wrench" aria-hidden="true"></i>
                                        <span>${escapeHtml(localizedService)}</span>
                                    </div>
                                    ${priceText ? `<span class="ws-order-price tabular-nums">${escapeHtml(priceText)}</span>` : ''}
                                </div>
                                <div class="ws-order-meta">
                                    <span><i class="fa-solid fa-location-dot" aria-hidden="true"></i> ${escapeHtml(localizedCity)}</span>
                                    ${req.providerName ? `<span><i class="fa-solid fa-user-gear" aria-hidden="true"></i> ${escapeHtml(t('userprof.req_provider'))} ${escapeHtml(req.providerName)}</span>` : ''}
                                    <span><i class="fa-regular fa-clock" aria-hidden="true"></i> ${escapeHtml(dateText)}</span>
                                    ${req.address ? `<span><i class="fa-solid fa-map-pin" aria-hidden="true"></i> ${escapeHtml(req.address)}</span>` : ''}
                                </div>
                                ${req.notes ? `<p class="ws-order-notes">${escapeHtml(req.notes)}</p>` : ''}
                                <div class="ws-order-footer">
                                    <span class="req-status-pill req-status-${statusKey}">${escapeHtml(statusLabel)}</span>
                                    <div class="ws-order-actions">
                                        <button type="button" class="ws-action-btn" data-ws-rebook-service="${escapeHtml(req.serviceTitle)}" data-ws-rebook-city="${escapeHtml(req.city)}">
                                            <i class="fa-solid fa-rotate-right" aria-hidden="true"></i> ${escapeHtml(t('ws.client_rebook'))}
                                        </button>
                                        ${isDone ? `
                                            <button type="button" class="ws-action-btn ws-action-primary" data-ws-rate-city="${escapeHtml(req.city)}">
                                                <i class="fa-solid fa-star" aria-hidden="true"></i> ${escapeHtml(t('ws.client_rate'))}
                                            </button>` : ''}
                                        ${canCancel ? `
                                            <button type="button" class="ws-action-btn ws-action-danger" data-ws-cancel-id="${req.id}">
                                                <i class="fa-solid fa-xmark" aria-hidden="true"></i> ${escapeHtml(t('userprof.cancel_btn'))}
                                            </button>` : ''}
                                    </div>
                                </div>
                            </article>`;
                    })
                    .join('');
            }
        }

        // Governorate pricing explorer
        const exploreCitySel = document.getElementById('ws-client-explore-city');
        if (exploreCitySel && user.city && !exploreCitySel.dataset.userInitialized) {
            if (Array.from(exploreCitySel.options).some((o) => o.value === user.city)) {
                exploreCitySel.value = user.city;
            }
            exploreCitySel.dataset.userInitialized = '1';
        }
        renderClientGovernorateExplorer();

        // Client inline profile form
        const fnEl = document.getElementById('ws-client-fullname');
        const phEl = document.getElementById('ws-client-phone');
        const emEl = document.getElementById('ws-client-email');
        const ctEl = document.getElementById('ws-client-city');
        const adEl = document.getElementById('ws-client-address');
        const bioEl = document.getElementById('ws-client-bio');
        if (fnEl) fnEl.value = user.fullname || '';
        if (phEl) phEl.value = user.phone || '';
        if (emEl) emEl.value = user.email || '';
        if (ctEl && user.city) ctEl.value = user.city;
        if (adEl) adEl.value = user.address || '';
        if (bioEl) bioEl.value = user.bio || '';
    }

    function renderProviderWorkspace(profileData) {
        const user = (profileData && profileData.user) || getCachedUser();
        if (!user) return;
        const availableRequests = Array.isArray(profileData && profileData.availableRequests) ? profileData.availableRequests : [];
        const assignedRequests = Array.isArray(profileData && profileData.assignedRequests) ? profileData.assignedRequests : [];
        const stats = (profileData && profileData.stats) || {};
        const currency = t('booking.price_currency');

        const avatarEl = document.getElementById('ws-pro-avatar');
        const jobMetaEl = document.getElementById('ws-pro-job-meta');
        const cityMetaEl = document.getElementById('ws-pro-city-meta');
        const greetEl = document.getElementById('ws-pro-greeting');
        if (avatarEl) avatarEl.textContent = String(user.fullname || 'P').trim().charAt(0).toUpperCase() || 'P';
        if (jobMetaEl) jobMetaEl.textContent = user.jobTitle || (currentLang === 'en' ? 'Certified Technician' : 'فني صيانة معتمد');
        if (cityMetaEl) cityMetaEl.textContent = I18N ? I18N.translateCity(user.city || 'القاهرة', currentLang) : (user.city || 'القاهرة');
        if (greetEl) {
            greetEl.textContent = currentLang === 'en' ? `Pro Workspace — ${user.fullname}` : `لوحة الفني — ${user.fullname}`;
        }

        const availBtn = document.getElementById('ws-pro-avail-btn');
        const availLabel = document.getElementById('ws-pro-avail-label');
        const isAvailable = user.isAvailable !== false;
        if (availBtn) {
            availBtn.classList.toggle('is-busy', !isAvailable);
            availBtn.setAttribute('aria-pressed', isAvailable ? 'true' : 'false');
        }
        if (availLabel) {
            availLabel.textContent = isAvailable ? t('ws.pro_avail_on') : t('ws.pro_avail_off');
        }

        const kpiOpen = document.getElementById('ws-pro-kpi-open');
        const kpiActive = document.getElementById('ws-pro-kpi-active');
        const kpiDone = document.getElementById('ws-pro-kpi-done');
        const kpiEarn = document.getElementById('ws-pro-kpi-earnings');
        if (kpiOpen) kpiOpen.textContent = String(stats.availableCount ?? availableRequests.length);
        if (kpiActive) kpiActive.textContent = String(stats.activeJobsCount ?? assignedRequests.filter((r) => r.status === 'NEW' || r.status === 'PENDING').length);
        if (kpiDone) kpiDone.textContent = String(stats.completedJobsCount ?? assignedRequests.filter((r) => r.status === 'COMPLETED').length);
        const earnings = stats.totalEarnings ?? assignedRequests.filter((r) => r.status === 'COMPLETED').reduce((s, r) => s + (Number(r.estimatedPrice) || 0), 0);
        if (kpiEarn) kpiEarn.textContent = `${earnings} ${currency}`;

        // Available Requests Feed
        const feedEl = document.getElementById('ws-pro-feed-list');
        if (feedEl) {
            const visibleFeed = availableRequests.filter((r) => {
                if (providerFeedFilter === 'city' && user.city) {
                    return r.city === user.city;
                }
                return true;
            });

            if (!visibleFeed.length) {
                feedEl.innerHTML = `
                    <div class="ws-empty-state">
                        <i class="fa-solid fa-inbox" aria-hidden="true"></i>
                        <p>${escapeHtml(t('ws.pro_empty_feed'))}</p>
                    </div>`;
            } else {
                feedEl.innerHTML = visibleFeed
                    .map((req) => {
                        const localizedService = I18N ? I18N.translateServiceTitle(req.serviceTitle, currentLang) : req.serviceTitle;
                        const localizedCity = I18N ? I18N.translateCity(req.city, currentLang) : req.city;
                        const dateText = req.scheduledAt ? String(req.scheduledAt).replace('T', ' ') : relativeDate(req.createdAt);
                        const priceText = req.estimatedPrice > 0 ? `${req.estimatedPrice} ${currency}` : '';

                        return `
                            <article class="ws-order-card" data-ws-feed-id="${req.id}">
                                <div class="ws-order-head">
                                    <div class="ws-order-title">
                                        <i class="fa-solid fa-bolt" aria-hidden="true"></i>
                                        <span>${escapeHtml(localizedService)}</span>
                                    </div>
                                    ${priceText ? `<span class="ws-order-price tabular-nums">${escapeHtml(priceText)}</span>` : ''}
                                </div>
                                <div class="ws-order-meta">
                                    <span><i class="fa-solid fa-location-dot" aria-hidden="true"></i> ${escapeHtml(localizedCity)}</span>
                                    <span><i class="fa-regular fa-user" aria-hidden="true"></i> ${escapeHtml(t('ws.pro_client_label'))} ${escapeHtml(req.clientName)}</span>
                                    <span><i class="fa-solid fa-phone" aria-hidden="true"></i> ${escapeHtml(req.clientPhone)}</span>
                                    <span><i class="fa-regular fa-clock" aria-hidden="true"></i> ${escapeHtml(dateText)}</span>
                                    ${req.address ? `<span><i class="fa-solid fa-map-pin" aria-hidden="true"></i> ${escapeHtml(req.address)}</span>` : ''}
                                </div>
                                ${req.notes ? `<p class="ws-order-notes">${escapeHtml(req.notes)}</p>` : ''}
                                <div class="ws-order-footer">
                                    <span class="req-status-pill req-status-NEW">${escapeHtml(t('userprof.req_status_NEW'))}</span>
                                    <div class="ws-order-actions">
                                        <button type="button" class="ws-action-btn ws-action-success" data-ws-accept-id="${req.id}">
                                            <i class="fa-solid fa-check" aria-hidden="true"></i> ${escapeHtml(t('ws.pro_accept_btn'))}
                                        </button>
                                    </div>
                                </div>
                            </article>`;
                    })
                    .join('');
            }
        }

        // Provider Assigned & Completed Jobs
        const jobsEl = document.getElementById('ws-pro-jobs-list');
        if (jobsEl) {
            if (!assignedRequests.length) {
                jobsEl.innerHTML = `
                    <div class="ws-empty-state">
                        <i class="fa-solid fa-briefcase" aria-hidden="true"></i>
                        <p>${escapeHtml(t('ws.pro_empty_jobs'))}</p>
                    </div>`;
            } else {
                jobsEl.innerHTML = assignedRequests
                    .map((req) => {
                        const statusKey = String(req.status || 'PENDING').toUpperCase();
                        const statusLabel = t(`userprof.req_status_${statusKey}`);
                        const localizedService = I18N ? I18N.translateServiceTitle(req.serviceTitle, currentLang) : req.serviceTitle;
                        const localizedCity = I18N ? I18N.translateCity(req.city, currentLang) : req.city;
                        const dateText = req.scheduledAt ? String(req.scheduledAt).replace('T', ' ') : relativeDate(req.createdAt);
                        const priceText = req.estimatedPrice > 0 ? `${req.estimatedPrice} ${currency}` : '';
                        const canComplete = statusKey === 'PENDING' || statusKey === 'NEW';

                        return `
                            <article class="ws-order-card" data-ws-job-id="${req.id}">
                                <div class="ws-order-head">
                                    <div class="ws-order-title">
                                        <i class="fa-solid fa-screwdriver-wrench" aria-hidden="true"></i>
                                        <span>${escapeHtml(localizedService)}</span>
                                    </div>
                                    ${priceText ? `<span class="ws-order-price tabular-nums">${escapeHtml(priceText)}</span>` : ''}
                                </div>
                                <div class="ws-order-meta">
                                    <span><i class="fa-solid fa-location-dot" aria-hidden="true"></i> ${escapeHtml(localizedCity)}</span>
                                    <span><i class="fa-regular fa-user" aria-hidden="true"></i> ${escapeHtml(t('ws.pro_client_label'))} ${escapeHtml(req.clientName)}</span>
                                    <span><i class="fa-solid fa-phone" aria-hidden="true"></i> ${escapeHtml(req.clientPhone)}</span>
                                    <span><i class="fa-regular fa-clock" aria-hidden="true"></i> ${escapeHtml(dateText)}</span>
                                    ${req.address ? `<span><i class="fa-solid fa-map-pin" aria-hidden="true"></i> ${escapeHtml(req.address)}</span>` : ''}
                                </div>
                                ${req.notes ? `<p class="ws-order-notes">${escapeHtml(req.notes)}</p>` : ''}
                                <div class="ws-order-footer">
                                    <span class="req-status-pill req-status-${statusKey}">${escapeHtml(statusLabel)}</span>
                                    <div class="ws-order-actions">
                                        ${canComplete ? `
                                            <button type="button" class="ws-action-btn ws-action-primary" data-ws-complete-id="${req.id}">
                                                <i class="fa-solid fa-circle-check" aria-hidden="true"></i> ${escapeHtml(t('ws.pro_complete_btn'))}
                                            </button>` : ''}
                                    </div>
                                </div>
                            </article>`;
                    })
                    .join('');
            }
        }

        // Provider Settings Form & Live Governorate Rate Chips
        const fnEl = document.getElementById('ws-pro-fullname');
        const phEl = document.getElementById('ws-pro-phone');
        const jobEl = document.getElementById('ws-pro-job');
        const ctEl = document.getElementById('ws-pro-city');
        const prEl = document.getElementById('ws-pro-price');
        const expEl = document.getElementById('ws-pro-exp');
        const skEl = document.getElementById('ws-pro-skills');
        const bioEl = document.getElementById('ws-pro-bio');

        if (fnEl) fnEl.value = user.fullname || '';
        if (phEl) phEl.value = user.phone || '';
        if (jobEl) jobEl.value = user.jobTitle || '';
        if (ctEl && user.city) ctEl.value = user.city;
        if (prEl) prEl.value = user.servicePrice || 200;
        if (expEl) expEl.value = user.experience || '';
        if (skEl) skEl.value = Array.isArray(user.skills) ? user.skills.join('، ') : '';
        if (bioEl) bioEl.value = user.bio || '';
        renderGovRatePreviewChips(user.servicePrice || 200);
    }

    function renderWorkspace(profileData) {
        const user = (profileData && profileData.user) || getCachedUser();
        if (!user) return;
        syncWorkspaceNavLabels(user);
        const isPro = user.role === 'PROVIDER';
        if (clientWorkspaceView) clientWorkspaceView.classList.toggle('hidden', isPro);
        if (providerWorkspaceView) providerWorkspaceView.classList.toggle('hidden', !isPro);
        if (isPro) {
            renderProviderWorkspace(profileData);
        } else {
            renderClientWorkspace(profileData);
        }
    }

    async function loadWorkspaceProfile() {
        if (!getToken()) return null;
        try {
            const data = await api('/auth/profile');
            if (data && data.user) {
                cachedProfileData = data;
                setSession(getToken(), data.user);
                setAuthUI(data.user);
                renderWorkspace(data);
            }
            return data;
        } catch {
            return null;
        }
    }

    function enterWorkspace({ refresh = true, defaultTab = null, skipScroll = false } = {}) {
        const user = getCachedUser();
        if (!getToken() || !user) {
            openAuthModal('tab-login');
            return;
        }
        isBrowsingMarketplace = false;
        document.body.classList.add('workspace-active');
        if (roleWorkspaceSection) roleWorkspaceSection.classList.remove('hidden');
        if (marketplaceReturnBar) marketplaceReturnBar.classList.add('hidden');

        if (defaultTab) {
            if (user.role === 'PROVIDER') switchProviderWorkspaceTab(defaultTab);
            else switchClientWorkspaceTab(defaultTab);
        }

        renderWorkspace(cachedProfileData || { user, requests: [], availableRequests: [], assignedRequests: [], stats: {} });
        if (refresh) loadWorkspaceProfile();
        if (!skipScroll) window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function exitWorkspace({ scrollTargetId = null, keepBannerHidden = false } = {}) {
        const loggedIn = Boolean(getToken() && getCachedUser());
        isBrowsingMarketplace = loggedIn && !keepBannerHidden;
        document.body.classList.remove('workspace-active');
        if (roleWorkspaceSection) roleWorkspaceSection.classList.add('hidden');
        if (marketplaceReturnBar) {
            marketplaceReturnBar.classList.toggle('hidden', !loggedIn || keepBannerHidden);
        }
        if (scrollTargetId) {
            const target = document.getElementById(scrollTargetId);
            if (target) {
                requestAnimationFrame(() => {
                    window.scrollTo({ top: Math.max(0, target.offsetTop - 84), behavior: 'smooth' });
                });
            }
        }
    }

    // Workspace navigation buttons & tabs
    const wsClientBrowseBtn = document.getElementById('ws-client-browse-btn');
    const wsProBrowseBtn = document.getElementById('ws-pro-browse-btn');
    const returnToWorkspaceBtn = document.getElementById('return-to-workspace-btn');
    const wsClientNewReqBtn = document.getElementById('ws-client-new-req-btn');

    if (wsClientBrowseBtn) wsClientBrowseBtn.addEventListener('click', () => exitWorkspace());
    if (wsProBrowseBtn) wsProBrowseBtn.addEventListener('click', () => exitWorkspace());
    if (returnToWorkspaceBtn) returnToWorkspaceBtn.addEventListener('click', () => enterWorkspace({ refresh: true }));
    if (wsClientNewReqBtn) wsClientNewReqBtn.addEventListener('click', () => triggerBooking());

    if (menuOpenWorkspaceBtn) {
        menuOpenWorkspaceBtn.addEventListener('click', () => {
            setUserDropdownOpen(false);
            enterWorkspace({ refresh: true });
        });
    }
    if (mobileWorkspaceBtn) {
        mobileWorkspaceBtn.addEventListener('click', () => {
            toggleMobileMenu(false);
            enterWorkspace({ refresh: true });
        });
    }

    document.querySelectorAll('[data-ws-client-tab]').forEach((btn) => {
        btn.addEventListener('click', () => switchClientWorkspaceTab(btn.getAttribute('data-ws-client-tab')));
    });

    document.querySelectorAll('[data-ws-pro-tab]').forEach((btn) => {
        btn.addEventListener('click', () => switchProviderWorkspaceTab(btn.getAttribute('data-ws-pro-tab')));
    });

    document.querySelectorAll('#ws-client-order-filters .ws-seg-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            clientOrderFilter = btn.getAttribute('data-order-filter') || 'all';
            document.querySelectorAll('#ws-client-order-filters .ws-seg-btn').forEach((b) => b.classList.toggle('active', b === btn));
            if (cachedProfileData) renderClientWorkspace(cachedProfileData);
        });
    });

    document.querySelectorAll('#ws-pro-feed-filters .ws-seg-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            providerFeedFilter = btn.getAttribute('data-feed-filter') || 'all';
            document.querySelectorAll('#ws-pro-feed-filters .ws-seg-btn').forEach((b) => b.classList.toggle('active', b === btn));
            if (cachedProfileData) renderProviderWorkspace(cachedProfileData);
        });
    });

    const wsClientExploreCity = document.getElementById('ws-client-explore-city');
    if (wsClientExploreCity) {
        wsClientExploreCity.addEventListener('change', renderClientGovernorateExplorer);
    }

    const wsProPriceInput = document.getElementById('ws-pro-price');
    if (wsProPriceInput) {
        wsProPriceInput.addEventListener('input', () => renderGovRatePreviewChips(wsProPriceInput.value));
    }

    // Customer Workspace Delegated Clicks (cancel, rebook, review, governorate quick book)
    if (clientWorkspaceView) {
        clientWorkspaceView.addEventListener('click', async (e) => {
            const emptyBtn = e.target.closest('#ws-client-empty-new-btn');
            if (emptyBtn) {
                triggerBooking();
                return;
            }

            const govBookBtn = e.target.closest('[data-gov-book-service]');
            if (govBookBtn) {
                triggerBooking(
                    govBookBtn.getAttribute('data-gov-book-service') || '',
                    '',
                    null,
                    '',
                    govBookBtn.getAttribute('data-gov-book-city') || ''
                );
                return;
            }

            const rebookBtn = e.target.closest('[data-ws-rebook-service]');
            if (rebookBtn) {
                triggerBooking(
                    rebookBtn.getAttribute('data-ws-rebook-service') || '',
                    '',
                    null,
                    '',
                    rebookBtn.getAttribute('data-ws-rebook-city') || ''
                );
                return;
            }

            const rateBtn = e.target.closest('[data-ws-rate-city]');
            if (rateBtn) {
                const user = getCachedUser();
                const revName = document.getElementById('rev-name');
                const revCity = document.getElementById('rev-city');
                if (revName && user) revName.value = user.fullname || '';
                if (revCity) revCity.value = rateBtn.getAttribute('data-ws-rate-city') || (user && user.city) || '';
                openModal('modal-review');
                return;
            }

            const cancelBtn = e.target.closest('[data-ws-cancel-id]');
            if (cancelBtn) {
                const reqId = cancelBtn.getAttribute('data-ws-cancel-id');
                cancelBtn.disabled = true;
                try {
                    await api(`/service-requests/${reqId}/cancel`, { method: 'PATCH' });
                    showToast(t('userprof.cancelled_toast'), '', 'info');
                    await loadWorkspaceProfile();
                } catch (err) {
                    cancelBtn.disabled = false;
                    showToast(currentLang === 'en' ? 'Error' : 'تعذر الإلغاء', err.message, 'error');
                }
            }
        });
    }

    // Customer Inline Profile Save
    const wsClientProfileForm = document.getElementById('ws-client-profile-form');
    if (wsClientProfileForm) {
        wsClientProfileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const saveBtn = document.getElementById('ws-client-save-btn');
            const original = saveBtn ? saveBtn.innerHTML : '';
            if (saveBtn) {
                saveBtn.disabled = true;
                saveBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> ${escapeHtml(t('userprof.saving'))}`;
            }
            try {
                const payload = {
                    fullname: document.getElementById('ws-client-fullname').value.trim(),
                    phone: document.getElementById('ws-client-phone').value.trim(),
                    city: document.getElementById('ws-client-city').value,
                    address: document.getElementById('ws-client-address').value.trim(),
                    bio: document.getElementById('ws-client-bio').value.trim()
                };
                const data = await api('/auth/profile', { method: 'PATCH', body: payload });
                setSession(getToken(), data.user);
                setAuthUI(data.user);
                await loadWorkspaceProfile();
                showToast(t('userprof.saved_title'), t('userprof.saved_msg'), 'success');
            } catch (err) {
                showToast(currentLang === 'en' ? 'Update Failed' : 'تعذر حفظ التعديلات', err.message, 'error');
            } finally {
                if (saveBtn) {
                    saveBtn.disabled = false;
                    saveBtn.innerHTML = original;
                }
            }
        });
    }

    // Provider Availability Toggle & Request Actions (Accept / Complete)
    const wsProAvailBtn = document.getElementById('ws-pro-avail-btn');
    if (wsProAvailBtn) {
        wsProAvailBtn.addEventListener('click', async () => {
            const current = (cachedProfileData && cachedProfileData.user) || getCachedUser();
            if (!current) return;
            const nextAvail = current.isAvailable === false;
            wsProAvailBtn.disabled = true;
            try {
                const data = await api('/auth/profile', { method: 'PATCH', body: { isAvailable: nextAvail } });
                setSession(getToken(), data.user);
                if (cachedProfileData) cachedProfileData.user = data.user;
                renderProviderWorkspace(cachedProfileData || { user: data.user });
                loadProviders();
            } catch (err) {
                showToast(currentLang === 'en' ? 'Update Failed' : 'تعذر تحديث الحالة', err.message, 'error');
            } finally {
                wsProAvailBtn.disabled = false;
            }
        });
    }

    if (providerWorkspaceView) {
        providerWorkspaceView.addEventListener('click', async (e) => {
            const acceptBtn = e.target.closest('[data-ws-accept-id]');
            if (acceptBtn) {
                const reqId = acceptBtn.getAttribute('data-ws-accept-id');
                acceptBtn.disabled = true;
                try {
                    await api(`/service-requests/${reqId}/accept`, { method: 'PATCH' });
                    showToast(t('ws.pro_accepted_ok'), '', 'success');
                    await loadWorkspaceProfile();
                    switchProviderWorkspaceTab('ws-pro-jobs');
                } catch (err) {
                    acceptBtn.disabled = false;
                    showToast(currentLang === 'en' ? 'Could not accept' : 'تعذر قبول الطلب', err.message, 'error');
                }
                return;
            }

            const completeBtn = e.target.closest('[data-ws-complete-id]');
            if (completeBtn) {
                const reqId = completeBtn.getAttribute('data-ws-complete-id');
                completeBtn.disabled = true;
                try {
                    await api(`/service-requests/${reqId}/complete`, { method: 'PATCH' });
                    showToast(t('ws.pro_completed_ok'), '', 'success');
                    await loadWorkspaceProfile();
                } catch (err) {
                    completeBtn.disabled = false;
                    showToast(currentLang === 'en' ? 'Could not complete' : 'تعذر إتمام الطلب', err.message, 'error');
                }
            }
        });
    }

    // Provider Inline Settings & Pricing Save
    const wsProSettingsForm = document.getElementById('ws-pro-settings-form');
    if (wsProSettingsForm) {
        wsProSettingsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const saveBtn = document.getElementById('ws-pro-save-btn');
            const original = saveBtn ? saveBtn.innerHTML : '';
            if (saveBtn) {
                saveBtn.disabled = true;
                saveBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> ${escapeHtml(t('userprof.saving'))}`;
            }
            try {
                const payload = {
                    fullname: document.getElementById('ws-pro-fullname').value.trim(),
                    phone: document.getElementById('ws-pro-phone').value.trim(),
                    jobTitle: document.getElementById('ws-pro-job').value.trim(),
                    city: document.getElementById('ws-pro-city').value,
                    servicePrice: Number(document.getElementById('ws-pro-price').value) || 200,
                    experience: document.getElementById('ws-pro-exp').value.trim(),
                    skills: document.getElementById('ws-pro-skills').value.trim(),
                    bio: document.getElementById('ws-pro-bio').value.trim()
                };
                const data = await api('/auth/profile', { method: 'PATCH', body: payload });
                setSession(getToken(), data.user);
                setAuthUI(data.user);
                await Promise.allSettled([loadWorkspaceProfile(), loadProviders()]);
                showToast(t('userprof.saved_title'), t('userprof.saved_msg'), 'success');
            } catch (err) {
                showToast(currentLang === 'en' ? 'Update Failed' : 'تعذر حفظ التعديلات', err.message, 'error');
            } finally {
                if (saveBtn) {
                    saveBtn.disabled = false;
                    saveBtn.innerHTML = original;
                }
            }
        });
    }

    /* =========================================================
       7.1 PERSONAL USER PROFILE MODAL & REQUEST HISTORY
       ========================================================= */

    function switchUserProfileTab(tabName) {
        userTabBtns.forEach((b) => {
            const isActive = b.getAttribute('data-user-tab') === tabName;
            b.classList.toggle('active', isActive);
            b.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });
        userTabContents.forEach((c) => {
            c.classList.toggle('active', c.id === tabName);
        });
    }

    userTabBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            switchUserProfileTab(btn.getAttribute('data-user-tab'));
        });
    });

    function renderUserProfileModal(profileData) {
        if (!profileData || !profileData.user) return;
        cachedProfileData = profileData;
        const { user, requests = [], stats = {} } = profileData;
        const isProvider = user.role === 'PROVIDER';
        const isActive = user.status === 'ACTIVE';

        const avatarEl = document.getElementById('user-prof-avatar');
        const statusEl = document.getElementById('user-prof-status');
        const roleEl = document.getElementById('user-prof-role');
        const nameEl = document.getElementById('user-prof-name');
        const emailEl = document.getElementById('user-prof-email');
        const metaEl = document.getElementById('user-prof-meta');

        if (avatarEl) avatarEl.textContent = String(user.fullname || 'U').trim().charAt(0).toUpperCase() || 'U';
        if (statusEl) {
            statusEl.textContent = isActive ? t('userprof.status_active') : t('userprof.status_pending');
            statusEl.style.background = isActive ? 'var(--secondary)' : '#f59e0b';
        }
        if (roleEl) roleEl.textContent = isProvider ? t('userprof.role_provider') : t('userprof.role_client');
        if (nameEl) nameEl.textContent = user.fullname || '';
        if (emailEl) emailEl.textContent = user.email || '';

        if (metaEl) {
            const cityLabel = I18N ? I18N.translateCity(user.city || 'القاهرة', currentLang) : (user.city || 'القاهرة');
            const joined = user.createdAt
                ? new Date(String(user.createdAt).includes('T') ? user.createdAt : String(user.createdAt).replace(' ', 'T') + 'Z')
                    .toLocaleDateString(currentLang === 'en' ? 'en-US' : 'ar-EG', { year: 'numeric', month: 'short' })
                : '';
            metaEl.innerHTML = `<i class="fa-solid fa-location-dot" aria-hidden="true"></i> ${escapeHtml(cityLabel)}${joined ? ` · ${escapeHtml(t('userprof.member_since'))} ${escapeHtml(joined)}` : ''}`;
        }

        const totalEl = document.getElementById('user-prof-total');
        const activeEl = document.getElementById('user-prof-active');
        const roleStatEl = document.getElementById('user-prof-role-stat');
        if (totalEl) totalEl.textContent = String(stats.totalRequests ?? requests.length);
        if (activeEl) activeEl.textContent = String(stats.activeRequests ?? 0);
        if (roleStatEl) roleStatEl.textContent = isProvider ? t('userprof.role_provider') : t('userprof.role_client');

        const fullnameInput = document.getElementById('user-prof-fullname-input');
        const phoneInput = document.getElementById('user-prof-phone-input');
        const emailInput = document.getElementById('user-prof-email-input');
        const cityInput = document.getElementById('user-prof-city-input');
        const jobGroup = document.getElementById('user-prof-job-group');
        const jobInput = document.getElementById('user-prof-job-input');
        const addressInput = document.getElementById('user-prof-address-input');
        const bioInput = document.getElementById('user-prof-bio-input');

        if (fullnameInput) fullnameInput.value = user.fullname || '';
        if (phoneInput) phoneInput.value = user.phone || '';
        if (emailInput) emailInput.value = user.email || '';
        if (cityInput && user.city) cityInput.value = user.city;
        if (jobGroup) jobGroup.classList.toggle('hidden', !isProvider);
        if (jobInput) jobInput.value = user.jobTitle || '';
        if (addressInput) addressInput.value = user.address || '';
        if (bioInput) bioInput.value = user.bio || '';

        if (userRequestsList) {
            if (!requests.length) {
                userRequestsList.innerHTML = `
                    <div class="user-requests-empty">
                        <i class="fa-solid fa-clipboard-list" aria-hidden="true"></i>
                        <p>${escapeHtml(t('userprof.empty_requests'))}</p>
                        <button type="button" class="btn-primary-sm" id="user-empty-request-btn">
                            <i class="fa-solid fa-plus" aria-hidden="true"></i> ${escapeHtml(t('userprof.new_request_btn'))}
                        </button>
                    </div>`;
            } else {
                userRequestsList.innerHTML = requests.map((req) => {
                    const statusKey = String(req.status || 'NEW').toUpperCase();
                    const statusLabel = t(`userprof.req_status_${statusKey}`);
                    const statusClass = `req-status-${statusKey}`;
                    const localizedService = I18N ? I18N.translateServiceTitle(req.serviceTitle, currentLang) : req.serviceTitle;
                    const localizedCity = I18N ? I18N.translateCity(req.city, currentLang) : req.city;
                    const priceText = req.estimatedPrice > 0 ? `${req.estimatedPrice} ${t('booking.price_currency')}` : '';
                    const dateText = req.scheduledAt ? String(req.scheduledAt).replace('T', ' ') : relativeDate(req.createdAt);
                    const canCancel = statusKey === 'NEW' || statusKey === 'PENDING';

                    return `
                        <div class="user-request-item" data-request-id="${req.id}">
                            <div class="user-request-head">
                                <div class="user-request-title">
                                    <i class="fa-solid fa-wrench" aria-hidden="true"></i>
                                    <span>${escapeHtml(localizedService)}</span>
                                </div>
                                ${priceText ? `<span class="user-request-price">${escapeHtml(priceText)}</span>` : ''}
                            </div>
                            <div class="user-request-meta">
                                <span><i class="fa-solid fa-location-dot" aria-hidden="true"></i> ${escapeHtml(localizedCity)}</span>
                                ${req.providerName ? `<span><i class="fa-solid fa-user-gear" aria-hidden="true"></i> ${escapeHtml(t('userprof.req_provider'))} ${escapeHtml(req.providerName)}</span>` : ''}
                                <span><i class="fa-regular fa-clock" aria-hidden="true"></i> ${escapeHtml(t('userprof.req_date'))} ${escapeHtml(dateText)}</span>
                            </div>
                            ${req.notes ? `<p class="user-request-notes">${escapeHtml(req.notes)}</p>` : ''}
                            <div class="user-request-footer">
                                <span class="req-status-pill ${statusClass}">${escapeHtml(statusLabel)}</span>
                                ${canCancel ? `
                                    <button type="button" class="req-cancel-btn" data-cancel-req-id="${req.id}">
                                        <i class="fa-solid fa-xmark" aria-hidden="true"></i> ${escapeHtml(t('userprof.cancel_btn'))}
                                    </button>` : ''}
                            </div>
                        </div>`;
                }).join('');
            }
        }
    }

    async function openUserProfileModal(defaultTab = 'user-tab-info') {
        if (!getToken()) {
            openAuthModal('tab-login');
            return;
        }
        switchUserProfileTab(defaultTab);
        const cached = getCachedUser();
        if (cached) renderUserProfileModal({ user: cached, requests: cachedProfileData ? cachedProfileData.requests : [], stats: cachedProfileData ? cachedProfileData.stats : {} });
        openModal('modal-user-profile');

        try {
            const data = await api('/auth/profile');
            if (data && data.user) {
                setSession(getToken(), data.user);
                setAuthUI(data.user);
                renderUserProfileModal(data);
            }
        } catch (err) {
            showToast(currentLang === 'en' ? 'Profile Error' : 'تعذر تحميل الملف الشخصي', err.message, 'error');
        }
    }

    if (openUserProfileBtn) {
        openUserProfileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!getToken()) {
                openAuthModal('tab-login');
                return;
            }
            const isCurrentlyOpen = authUserDropdown && !authUserDropdown.classList.contains('hidden');
            setUserDropdownOpen(!isCurrentlyOpen);
        });
    }
    if (menuOpenProfileBtn) {
        menuOpenProfileBtn.addEventListener('click', () => {
            setUserDropdownOpen(false);
            openUserProfileModal('user-tab-info');
        });
    }
    if (menuOpenRequestsBtn) {
        menuOpenRequestsBtn.addEventListener('click', () => {
            setUserDropdownOpen(false);
            openUserProfileModal('user-tab-requests');
        });
    }
    document.addEventListener('click', (e) => {
        if (authUserBox && !authUserBox.contains(e.target)) {
            setUserDropdownOpen(false);
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            setUserDropdownOpen(false);
        }
    });
    if (mobileProfileBtn) {
        mobileProfileBtn.addEventListener('click', () => {
            toggleMobileMenu(false);
            openUserProfileModal('user-tab-info');
        });
    }

    if (userProfileForm) {
        userProfileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const saveBtn = document.getElementById('user-prof-save-btn');
            const original = saveBtn ? saveBtn.innerHTML : '';
            if (saveBtn) {
                saveBtn.disabled = true;
                saveBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> ${escapeHtml(t('userprof.saving'))}`;
            }

            try {
                const payload = {
                    fullname: document.getElementById('user-prof-fullname-input').value.trim(),
                    phone: document.getElementById('user-prof-phone-input').value.trim(),
                    city: document.getElementById('user-prof-city-input').value,
                    address: document.getElementById('user-prof-address-input').value.trim(),
                    bio: document.getElementById('user-prof-bio-input').value.trim()
                };
                const jobGroup = document.getElementById('user-prof-job-group');
                if (jobGroup && !jobGroup.classList.contains('hidden')) {
                    payload.jobTitle = document.getElementById('user-prof-job-input').value.trim();
                }

                const data = await api('/auth/profile', { method: 'PATCH', body: payload });
                setSession(getToken(), data.user);
                setAuthUI(data.user);
                if (cachedProfileData) {
                    cachedProfileData.user = data.user;
                    renderUserProfileModal(cachedProfileData);
                }
                showToast(t('userprof.saved_title'), t('userprof.saved_msg'), 'success');
            } catch (err) {
                showToast(currentLang === 'en' ? 'Update Failed' : 'تعذر حفظ التعديلات', err.message, 'error');
            } finally {
                if (saveBtn) {
                    saveBtn.disabled = false;
                    saveBtn.innerHTML = original;
                }
            }
        });
    }

    if (userRequestsList) {
        userRequestsList.addEventListener('click', async (e) => {
            const newReqBtn = e.target.closest('#user-empty-request-btn');
            if (newReqBtn) {
                closeModal('modal-user-profile');
                triggerBooking();
                return;
            }

            const cancelBtn = e.target.closest('[data-cancel-req-id]');
            if (cancelBtn) {
                const reqId = cancelBtn.getAttribute('data-cancel-req-id');
                cancelBtn.disabled = true;
                try {
                    await api(`/service-requests/${reqId}/cancel`, { method: 'PATCH' });
                    showToast(t('userprof.cancelled_toast'), '', 'info');
                    const refreshed = await api('/auth/profile');
                    if (refreshed) renderUserProfileModal(refreshed);
                } catch (err) {
                    cancelBtn.disabled = false;
                    showToast(currentLang === 'en' ? 'Error' : 'تعذر الإلغاء', err.message, 'error');
                }
            }
        });
    }

    /* =========================================================
       8. PROVIDER PROFILE MODAL VIEWER
       ========================================================= */
    let currentModalProviderName = '';
    let currentModalProviderDisplayName = '';
    let currentModalProviderJob = '';
    let currentModalProviderPrice = null;

    function openProfileFromCard(card) {
        if (!card) return;

        const name = card.getAttribute('data-name') || (currentLang === 'en' ? 'Certified Pro' : 'فني محترف');
        const rawName = card.getAttribute('data-name-raw') || name;
        const job = card.getAttribute('data-job') || (currentLang === 'en' ? 'General Maintenance' : 'صيانة عامة');
        const rawJob = card.getAttribute('data-job-raw') || job;
        const rate = card.getAttribute('data-rate') || '4.9';
        const reviews = card.getAttribute('data-reviews') || '300';
        const img = card.getAttribute('data-img') || 'images/provider-1.webp';
        const exp = card.getAttribute('data-exp') || (currentLang === 'en' ? '5 years' : '5 سنوات');
        const price = card.getAttribute('data-price') || `200 ${t('providers.price_unit')}`;
        const priceNum = parseInt(String(card.getAttribute('data-price-num') || price).replace(/[^0-9]/g, ''), 10) || 200;
        const locationText = card.getAttribute('data-location') || card.getAttribute('data-city') || (currentLang === 'en' ? 'Cairo' : 'القاهرة');
        const bio = card.getAttribute('data-bio') || (currentLang === 'en'
            ? `Certified ${job} with ${exp} of experience in maintenance and installations backed by a 30-day warranty.`
            : `فني ${job} معتمد بخبرة ${exp} في كافة أعمال الصيانة والتركيبات مع ضمان شامل 30 يوماً.`);
        const rawSkills = card.getAttribute('data-skills') || '';
        const skills = rawSkills ? rawSkills.split('|').filter(Boolean) : (currentLang === 'en'
            ? [job, 'Detailed inspection', '30-day warranty', 'Fast response']
            : [job, 'معاينة وفحص دقيق', 'ضمان 30 يوماً', 'استجابة سريعة']);
        const isOnline = card.getAttribute('data-status') === 'online';
        const status = isOnline ? t('providers.status_online') : t('providers.status_busy');

        currentModalProviderName = rawName;
        currentModalProviderDisplayName = name;
        currentModalProviderJob = rawJob;
        currentModalProviderPrice = priceNum;

        document.getElementById('prof-modal-img').src = img;
        document.getElementById('prof-modal-name').textContent = name;
        document.getElementById('prof-modal-job').textContent = job;
        document.getElementById('prof-modal-status').textContent = status;
        document.getElementById('prof-modal-status').style.background = isOnline ? 'var(--secondary)' : '#ef4444';
        document.getElementById('prof-modal-loc').innerHTML = `<i class="fa-solid fa-location-dot" aria-hidden="true"></i> ${escapeHtml(locationText)}`;
        document.getElementById('prof-modal-rate').textContent = rate;
        document.getElementById('prof-modal-reviews').textContent = reviews;
        document.getElementById('prof-modal-exp').textContent = exp;
        document.getElementById('prof-modal-price').textContent = price;

        const bioEl = document.getElementById('prof-modal-bio');
        if (bioEl) bioEl.textContent = bio;

        const skillsContainer = document.querySelector('#modal-profile .skills-tags');
        if (skillsContainer) {
            skillsContainer.innerHTML = skills.map((s) => `<span class="skill-tag">${escapeHtml(s)}</span>`).join('');
        }

        openModal('modal-profile');
    }

    const forgotLink = document.querySelector('.forgot-link');
    if (forgotLink) {
        forgotLink.addEventListener('click', (e) => {
            e.preventDefault();
            showToast(
                currentLang === 'en' ? 'Reset Password' : 'استعادة كلمة المرور',
                currentLang === 'en'
                    ? 'Please contact our support hotline 19870 to reset your password.'
                    : 'يرجى التواصل مع فريق الدعم الفني على الرقم المختصر 19870 لإعادة تعيين كلمة المرور.',
                'info',
                5000
            );
        });
    }

    const profBookDirectBtn = document.getElementById('prof-book-direct-btn');
    if (profBookDirectBtn) {
        profBookDirectBtn.addEventListener('click', () => {
            closeModal('modal-profile');
            triggerBooking(currentModalProviderJob, currentModalProviderName, currentModalProviderPrice, currentModalProviderDisplayName);
        });
    }

    /* =========================================================
       9. DYNAMIC REVIEWS & STAR RATING SYSTEM
       ========================================================= */
    const openAddReviewBtn = document.getElementById('open-add-review-btn');
    const reviewForm = document.getElementById('review-form');
    const starPicks = document.querySelectorAll('#star-rating-selector .star-pick');
    const reviewStarInput = document.getElementById('review-star-input');

    if (openAddReviewBtn) {
        openAddReviewBtn.addEventListener('click', () => {
            openModal('modal-review');
        });
    }

    starPicks.forEach(star => {
        star.addEventListener('click', () => {
            const val = parseInt(star.getAttribute('data-value'));
            reviewStarInput.value = val;

            starPicks.forEach(s => {
                const sVal = parseInt(s.getAttribute('data-value'));
                const isActive = sVal <= val;
                s.classList.toggle('active', isActive);
                s.setAttribute('aria-checked', isActive ? 'true' : 'false');
            });
        });
    });

    if (reviewForm) {
        reviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = reviewForm.querySelector('button[type="submit"]');
            const original = submitBtn ? submitBtn.innerHTML : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> ${escapeHtml(t('rev.submitting'))}`;
            }

            const name = document.getElementById('rev-name').value.trim();
            const city = document.getElementById('rev-city').value.trim();
            const comment = document.getElementById('rev-comment').value.trim();
            const starCount = parseInt(reviewStarInput.value, 10) || 5;

            try {
                await api('/reviews', {
                    method: 'POST',
                    body: {
                        authorName: name,
                        city,
                        rating: starCount,
                        comment,
                        tag: 'تجربة عميل'
                    }
                });

                closeModal('modal-review');
                reviewForm.reset();
                await loadReviews();
                showToast(
                    currentLang === 'en' ? 'Thank you for sharing! ⭐' : 'شكراً لمشاركتك! ⭐',
                    currentLang === 'en' ? 'Your review has been published.' : 'تم نشر تقييمك بنجاح وسيظهر لجميع زوار المنصة.',
                    'success'
                );
            } catch (err) {
                showToast(currentLang === 'en' ? 'Could not publish review' : 'تعذر نشر التقييم', err.message, 'error');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = original;
                }
            }
        });
    }

    /* =========================================================
       9.1. SEAMLESS INFINITE MARQUEE CLONING
       ========================================================= */
    let marqueeVisible = false;

    function setupMarquee() {
        const marqueeTrack = document.getElementById('marquee-track');
        const reviewsGrid = document.getElementById('reviews-grid');
        if (!marqueeTrack || !reviewsGrid) return;

        const oldClone = marqueeTrack.querySelector('.marquee-clone');
        if (oldClone) oldClone.remove();

        if (!reviewsGrid.children.length) return;

        const clone = reviewsGrid.cloneNode(true);
        clone.removeAttribute('id');
        clone.classList.add('marquee-clone');
        clone.setAttribute('aria-hidden', 'true');
        clone.querySelectorAll('.reveal').forEach((el) => el.classList.add('active'));
        marqueeTrack.appendChild(clone);
        setupMarqueePause();
    }

    function setupMarqueePause() {
        const track = document.getElementById('marquee-track');
        if (!track || setupMarqueePause.done) return;
        setupMarqueePause.done = true;

        const sync = () => track.classList.toggle('paused', !marqueeVisible || document.hidden);
        new IntersectionObserver(([entry]) => {
            marqueeVisible = entry.isIntersecting;
            sync();
        }, { threshold: 0 }).observe(track);
        document.addEventListener('visibilitychange', sync);
        sync();
    }

    setupMarquee();

    /* =========================================================
       10. ACCESSIBLE SCROLL REVEAL & ANIMATED COUNTERS
       ========================================================= */
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach((el, i) => {
        el.style.transitionDelay = (i % 4) * 0.08 + 's';
        revealObserver.observe(el);
    });

    // Fetch live data once the UI scaffolding is ready.
    initData();

    const counters = document.querySelectorAll('.counter');
    let countersStarted = false;

    function animateCounters() {
        counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            if (!target) return;

            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;

            const tick = () => {
                current += step;
                if (current < target) {
                    counter.textContent = Math.floor(current).toLocaleString('en-US');
                    requestAnimationFrame(tick);
                } else {
                    counter.textContent = target.toLocaleString('en-US') + '+';
                }
            };
            requestAnimationFrame(tick);
        });
    }

    const statsSection = document.getElementById('statistics');
    if (statsSection) {
        const statsObs = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && !countersStarted) {
                countersStarted = true;
                animateCounters();
            }
        }, { threshold: 0.25 });
        statsObs.observe(statsSection);
    }

    /* =========================================================
       11. INTERACTIVE PRICE CALCULATOR
       ========================================================= */
    const calcServiceSelect = document.getElementById('calc-service-type');
    const calcCitySelect = document.getElementById('calc-city');
    const calcScopeSelect = document.getElementById('calc-work-scope');
    const calcUrgencySelect = document.getElementById('calc-urgency');
    const calcPriceDisplay = document.getElementById('calc-price-number');
    const calcGovBreakdown = document.getElementById('calc-gov-breakdown');
    const calcBookNowBtn = document.getElementById('calc-book-now-btn');

    async function updateCalculatedPrice() {
        if (!calcServiceSelect || !calcScopeSelect || !calcUrgencySelect || !calcPriceDisplay) return;
        const basePrice = parseFloat(calcServiceSelect.value) || 200;
        const scopeMult = parseFloat(calcScopeSelect.value) || 1;
        const urgencyExtra = parseFloat(calcUrgencySelect.value) || 0;
        const city = calcCitySelect ? calcCitySelect.value : 'القاهرة';
        const gov = getGovInfo(city);

        // Instant local feedback, then confirm with the server.
        const govBase = applyGovPrice(basePrice, city);
        calcPriceDisplay.textContent = Math.max(50, Math.round(govBase * scopeMult) + urgencyExtra);

        if (calcGovBreakdown) {
            const cityLabel = currentLang === 'en' ? (gov.nameEn || city) : (gov.nameAr || city);
            calcGovBreakdown.textContent = `${t('calc.gov_base_note')} ${cityLabel} · ${formatGovDeltaText(gov)}`;
        }

        try {
            const data = await api('/estimate', {
                method: 'POST',
                body: { basePrice, scope: scopeMult, urgency: urgencyExtra, city }
            });
            if (data && data.totalPrice != null) {
                calcPriceDisplay.textContent = data.totalPrice;
            }
        } catch { /* keep the local estimate */ }
    }

    const updateCalculatedPriceDebounced = debounce(updateCalculatedPrice, 150);

    if (calcServiceSelect) calcServiceSelect.addEventListener('change', updateCalculatedPriceDebounced);
    if (calcCitySelect) calcCitySelect.addEventListener('change', updateCalculatedPriceDebounced);
    if (calcScopeSelect) calcScopeSelect.addEventListener('change', updateCalculatedPriceDebounced);
    if (calcUrgencySelect) calcUrgencySelect.addEventListener('change', updateCalculatedPriceDebounced);

    if (calcBookNowBtn && calcServiceSelect) {
        calcBookNowBtn.addEventListener('click', () => {
            const selectedOpt = calcServiceSelect.options[calcServiceSelect.selectedIndex];
            const serviceName = selectedOpt ? selectedOpt.getAttribute('data-name') || 'كهرباء' : 'كهرباء';
            const selectedCity = calcCitySelect ? calcCitySelect.value : '';
            triggerBooking(serviceName, '', null, '', selectedCity);
        });
    }

    /* =========================================================
       12. INTERACTIVE FAQ ACCORDION
       ========================================================= */
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const questionBtn = item.querySelector('.faq-question');
        if (questionBtn) {
            questionBtn.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                faqItems.forEach(otherItem => otherItem.classList.remove('active'));
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        }
    });

    /* =========================================================
       13. ANNOUNCEMENT BAR PROMO BUTTON & CLOSE DISMISS
       ========================================================= */
    const claimDiscountBtn = document.getElementById('claim-discount-btn');
    const closeAnnouncementBtn = document.getElementById('close-announcement-btn');
    const announcementBar = document.getElementById('announcement-bar');

    if (claimDiscountBtn) {
        claimDiscountBtn.addEventListener('click', () => {
            if (bookingPromoInput) bookingPromoInput.value = 'FIX20';
            triggerBooking();
            updateBookingPriceDisplay();
            showToast(t('toast.promo_title'), t('toast.promo_msg'), 'success');
        });
    }

    if (closeAnnouncementBtn && announcementBar) {
        closeAnnouncementBtn.addEventListener('click', () => {
            announcementBar.classList.add('closed');
        });
    }

    /* =========================================================
       14. DYNAMIC HERO FLOATING BADGE TICKERS (ALL 3 CARDS)
       ========================================================= */
    function setupBadgeTicker(containerId, intervalMs) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const iconEl = container.querySelector('i');
        const textEl = container.querySelector('.badge-text');
        if (!iconEl || !textEl) return;

        let idx = 0;
        const getItems = () => {
            if (I18N) {
                return currentLang === 'en' ? I18N.TICKERS_EN[containerId] : I18N.TICKERS_AR[containerId];
            }
            return [];
        };

        const sync = () => {
            const items = getItems();
            if (!items || !items.length) return;
            const current = items[idx % items.length];
            iconEl.className = `fa-solid ${current.icon}`;
            textEl.textContent = current.text;
        };

        tickerControls.push({ sync });
        sync();

        setInterval(() => {
            if (document.hidden) return;
            const items = getItems();
            if (!items || !items.length) return;
            textEl.classList.add('fade-out');
            setTimeout(() => {
                idx = (idx + 1) % items.length;
                const next = items[idx];
                iconEl.className = `fa-solid ${next.icon}`;
                textEl.textContent = next.text;
                textEl.classList.remove('fade-out');
                textEl.classList.add('fade-in');
                setTimeout(() => textEl.classList.remove('fade-in'), 200);
            }, 180);
        }, intervalMs);
    }

    setupBadgeTicker('hero-dynamic-badge', 2800);
    setupBadgeTicker('hero-dynamic-rating', 3400);
    setupBadgeTicker('hero-dynamic-trust', 4000);

    // Apply persisted language on startup
    applyLanguage(currentLang, false);

});
