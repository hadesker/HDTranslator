const chromeApi = typeof chrome !== 'undefined' ? chrome : null;
const browserApi = typeof browser !== 'undefined' ? browser : null;
const extensionApi = chromeApi || browserApi;

function runtimeSendMessage(message, callback) {
    if(chromeApi && chromeApi.runtime){
        return chromeApi.runtime.sendMessage(message, callback);
    }
    return browserApi.runtime.sendMessage(message).then(callback).catch(() => callback && callback());
}

function storageGet(keys, callback) {
    if(chromeApi && chromeApi.storage && chromeApi.storage.local){
        return chromeApi.storage.local.get(keys, callback);
    }
    return browserApi.storage.local.get(keys).then(callback).catch(() => callback({}));
}

function normalizeLanguage(language) {
    return language === 'vi' ? 'vi' : 'en';
}

function getDefaultLanguage() {
    return normalizeLanguage((navigator.language || '').toLowerCase().startsWith('vi') ? 'vi' : 'en');
}

let appLanguage = getDefaultLanguage();

const selectionI18n = {
    en: {
        translation: 'Translation',
        pronounce: 'Pronounce',
        copyTranslation: 'Copy translation',
        viewMore: 'View more',
        close: 'Close'
    },
    vi: {
        translation: 'Dịch',
        pronounce: 'Phát âm',
        copyTranslation: 'Sao chép bản dịch',
        viewMore: 'Xem thêm',
        close: 'Đóng'
    }
};

function st(key) {
    return (selectionI18n[appLanguage] && selectionI18n[appLanguage][key]) || selectionI18n.en[key] || key;
}

storageGet(['app_language'], function (data) {
    appLanguage = normalizeLanguage(data.app_language || appLanguage);
});

if(extensionApi.storage && extensionApi.storage.onChanged){
    extensionApi.storage.onChanged.addListener(function (changes, areaName) {
        if(areaName === 'local' && changes.app_language){
            appLanguage = normalizeLanguage(changes.app_language.newValue);
        }
    });
}

function getSelectionText() {
    let text = "";
    if (window.getSelection) {
        text = window.getSelection().toString();
    } else if (document.selection && document.selection.type !== "Control") {
        text = document.selection.createRange().text;
    }
    return text;
}

var s = document.createElement('script');
s.src = extensionApi.runtime.getURL('src/scripts/inject.js');
s.onload = function() {
    this.remove();
};
(document.head || document.documentElement).appendChild(s);

function isVietnamese(text){
    return /[ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễếệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ]/g.test(text);
}

function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
        return ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[char];
    });
}

function ensureDictionaryPopupStyle() {
    if(document.getElementById('hd-translator-selection-style')){
        return;
    }
    const style = document.createElement('style');
    style.id = 'hd-translator-selection-style';
    style.textContent = `
        .dictionary-popup,
        .dictionary-popup * {
            box-sizing: border-box !important;
        }

        .dictionary-popup {
            all: initial !important;
            position: absolute !important;
            z-index: 2147483647 !important;
            box-sizing: border-box !important;
            width: max-content !important;
            max-width: min(320px, calc(100vw - 16px)) !important;
            max-height: min(220px, calc(100vh - 16px)) !important;
            overflow: hidden !important;
            border: 1px solid rgba(255,255,255,0.08) !important;
            border-radius: 14px !important;
            background: #141419 !important;
            color: #d4d4d8 !important;
            box-shadow: 0 18px 42px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.03) !important;
            font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
            line-height: 1.45 !important;
        }

        .dictionary-popup__header {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            gap: 10px !important;
            min-height: 32px !important;
            padding: 5px 7px 5px 9px !important;
            border-bottom: 1px solid rgba(255,255,255,0.06) !important;
            background: rgba(255,255,255,0.01) !important;
        }

        .dictionary-popup__label {
            display: inline-flex !important;
            align-items: center !important;
            height: 17px !important;
            padding: 0 5px !important;
            border: 1px solid rgba(168,85,247,0.16) !important;
            border-radius: 999px !important;
            background: rgba(168,85,247,0.12) !important;
            color: #c084fc !important;
            font-size: 8px !important;
            font-weight: 700 !important;
            letter-spacing: 0.08em !important;
            text-transform: uppercase !important;
            white-space: nowrap !important;
        }

        .dictionary-popup__actions {
            display: flex !important;
            align-items: center !important;
            gap: 4px !important;
        }

        .dictionary-popup__action {
            all: initial !important;
            display: inline-flex !important;
            box-sizing: border-box !important;
            width: 24px !important;
            height: 24px !important;
            align-items: center !important;
            justify-content: center !important;
            border: 1px solid rgba(255,255,255,0.06) !important;
            border-radius: 7px !important;
            background: rgba(255,255,255,0.02) !important;
            color: #a1a1aa !important;
            cursor: pointer !important;
            transition: background 0.18s ease, border-color 0.18s ease, color 0.18s ease !important;
        }

        .dictionary-popup__action:hover {
            border-color: rgba(255,255,255,0.12) !important;
            background: rgba(255,255,255,0.05) !important;
            color: #ffffff !important;
        }

        .dictionary-popup__action svg {
            display: block !important;
            width: 12px !important;
            height: 12px !important;
            fill: none !important;
            stroke: currentColor !important;
            stroke-linecap: round !important;
            stroke-linejoin: round !important;
            stroke-width: 2 !important;
        }

        .dictionary-popup__body {
            display: block !important;
            max-height: 178px !important;
            overflow-y: auto !important;
            padding: 8px 10px 9px !important;
            color: #ffffff !important;
            font-size: 12.5px !important;
            font-weight: 600 !important;
            overflow-wrap: anywhere !important;
        }
    `;
    (document.head || document.documentElement).appendChild(style);
}

const volumeIcon = `<svg viewBox="0 0 24 24" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>`;
const copyIcon = `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
const externalLinkIcon = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 3h6v6"></path><path d="M10 14 21 3"></path><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path></svg>`;
const closeIcon = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>`;
const selectionUtterance = new SpeechSynthesisUtterance(' ');
const selectionLookupDelay = 180;
const multiClickSelectionLookupDelay = 650;
let selectionLookupTimer = null;
let selectionLookupId = 0;

function clamp(value, min, max) {
    if(max < min){
        return min;
    }
    return Math.max(min, Math.min(value, max));
}

function getOverlapArea(a, b) {
    const width = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
    const height = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
    return width * height;
}

function normalizeSelectionRect(rect, x, y) {
    if(rect && Number.isFinite(rect.left) && Number.isFinite(rect.top)){
        return {
            left: rect.left,
            top: rect.top,
            right: rect.right,
            bottom: rect.bottom,
            width: rect.width || Math.max(1, rect.right - rect.left),
            height: rect.height || Math.max(1, rect.bottom - rect.top)
        };
    }
    return {
        left: x,
        top: y,
        right: x + 1,
        bottom: y + 1,
        width: 1,
        height: 1
    };
}

function positionDictionaryPopup(popup, selectionRect) {
    const gap = 8;
    const padding = 8;
    const viewport = {
        left: window.scrollX + padding,
        top: window.scrollY + padding,
        right: window.scrollX + window.innerWidth - padding,
        bottom: window.scrollY + window.innerHeight - padding
    };
    const popupWidth = Math.min(popup.offsetWidth, Math.max(1, viewport.right - viewport.left));
    const popupHeight = Math.min(popup.offsetHeight, Math.max(1, viewport.bottom - viewport.top));
    const centerLeft = selectionRect.left + (selectionRect.width / 2) - (popupWidth / 2);
    const centerTop = selectionRect.top + (selectionRect.height / 2) - (popupHeight / 2);
    const candidates = [
        { side: 'top', priority: 0, left: centerLeft, top: selectionRect.top - gap - popupHeight },
        { side: 'bottom', priority: 1, left: centerLeft, top: selectionRect.bottom + gap },
        { side: 'right', priority: 2, left: selectionRect.right + gap, top: centerTop },
        { side: 'left', priority: 3, left: selectionRect.left - gap - popupWidth, top: centerTop }
    ].map(candidate => {
        const left = clamp(candidate.left, viewport.left, viewport.right - popupWidth);
        const top = clamp(candidate.top, viewport.top, viewport.bottom - popupHeight);
        const box = {
            left,
            top,
            right: left + popupWidth,
            bottom: top + popupHeight
        };
        return {
            ...candidate,
            left,
            top,
            overlap: getOverlapArea(box, selectionRect),
            overflow: Math.abs(left - candidate.left) + Math.abs(top - candidate.top)
        };
    });
    const best = candidates
        .sort((a, b) => a.overlap - b.overlap || a.overflow - b.overflow || a.priority - b.priority)[0];

    popup.style.setProperty('left', `${best.left}px`, 'important');
    popup.style.setProperty('top', `${best.top}px`, 'important');
    popup.style.setProperty('visibility', 'visible', 'important');
    popup.setAttribute('data-side', best.side);
}

function copyText(text) {
    if(navigator.clipboard && navigator.clipboard.writeText){
        return navigator.clipboard.writeText(text).catch(() => fallbackCopyText(text));
    }
    fallbackCopyText(text);
}

function fallbackCopyText(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
}

function cancelSelectionVoice() {
    window.speechSynthesis.cancel();
}

function removeDictionaryPopup() {
    if($('.dictionary-popup').length){
        cancelSelectionVoice();
        $('.dictionary-popup').remove();
    }
}

function cancelPendingSelectionLookup() {
    selectionLookupId += 1;
    if(selectionLookupTimer){
        clearTimeout(selectionLookupTimer);
        selectionLookupTimer = null;
    }
}

function playSelectionVoice(text) {
    text = (text || '').trim();
    if(!text){
        return;
    }
    cancelSelectionVoice();
    const voices = window.speechSynthesis.getVoices();
    selectionUtterance.voice = voices.find(v => v.name.includes('US')) || voices.find(v => v.lang === 'en-US') || voices[4];
    selectionUtterance.text = text;
    window.speechSynthesis.speak(selectionUtterance);
}

extensionApi.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request){
        switch (request.action){
            case 'get-text': return sendResponse({ from: 'content', text: getSelectionText() });
            case 'search-result': {
                let { x, y, text, result, selectionRect, lookupId } = request.data;
                if(lookupId && lookupId !== selectionLookupId){
                    break;
                }
                const $body = $('body');
                const pronounceText = isVietnamese(text) ? result : text;
                const popup = `<div class="dictionary-popup" style="top: 0 !important; left: 0 !important; visibility: hidden !important;">
                    <div class="dictionary-popup__header">
                        <span class="dictionary-popup__label">${escapeHtml(st('translation'))}</span>
                        <div class="dictionary-popup__actions">
                            <button class="dictionary-popup__action dictionary-popup__speak" type="button" title="${escapeHtml(st('pronounce'))}" data-pronounce="${escapeHtml(pronounceText)}">${volumeIcon}</button>
                            <button class="dictionary-popup__action dictionary-popup__copy" type="button" title="${escapeHtml(st('copyTranslation'))}" data-copy="${escapeHtml(result)}">${copyIcon}</button>
                            <a class="dictionary-popup__action" title="${escapeHtml(st('viewMore'))}" target="_blank" rel="noopener noreferrer" href="https://dictionary.faster.asia/word/${encodeURIComponent(text)}">${externalLinkIcon}</a>
                            <button class="dictionary-popup__action dictionary-popup__close" type="button" title="${escapeHtml(st('close'))}">${closeIcon}</button>
                        </div>
                    </div>
                    <div class="dictionary-popup__body">${escapeHtml(result)}</div>
                </div>`;
                ensureDictionaryPopupStyle();
                if($body.find('.dictionary-popup').length){
                    cancelSelectionVoice();
                    $('body .dictionary-popup').replaceWith(popup)
                } else {
                    $body.append(popup);
                }
                positionDictionaryPopup($body.find('.dictionary-popup')[0], normalizeSelectionRect(selectionRect, x, y));
            } break;
        }
    }
    sendResponse(true);
});

$(document).on('click', '.dictionary-popup__speak', function () {
    playSelectionVoice($(this).attr('data-pronounce'));
}).on('click', '.dictionary-popup__copy', function () {
    copyText($(this).attr('data-copy'));
}).on('click', '.dictionary-popup__close', function () {
    cancelPendingSelectionLookup();
    removeDictionaryPopup();
});

function requestSelectionLookup(event, lookupId) {
    let text = (getSelectionText() || '').trim();
    if(lookupId !== selectionLookupId){
        return;
    }
    if(!text || text.length < 3){
        return removeDictionaryPopup();
    }

    const selection = window.getSelection();
    if(!selection || !selection.rangeCount){
        return removeDictionaryPopup();
    }

    const rect = selection.getRangeAt(0).getBoundingClientRect();
    const selectionRect = {
        left: window.scrollX + rect.left,
        top: window.scrollY + rect.top,
        right: window.scrollX + rect.right,
        bottom: window.scrollY + rect.bottom,
        width: rect.width,
        height: rect.height
    };
    try{
        runtimeSendMessage({
            from: "content",
            action: 'search',
            data: {
                x: selectionRect.left,
                y: selectionRect.top,
                selectionRect,
                text,
                lookupId
            }
        }, f => f);
    } catch (e) {}
}

document.onmouseup = function (event) {
    if($(event.target).closest('.dictionary-popup').length){
        return;
    }

    cancelPendingSelectionLookup();
    const lookupId = selectionLookupId;
    const delay = event.detail === 2 ? multiClickSelectionLookupDelay : selectionLookupDelay;
    selectionLookupTimer = setTimeout(function () {
        selectionLookupTimer = null;
        requestSelectionLookup(event, lookupId);
    }, delay);
};
if (!document.all){
    document.captureEvents(Event.MOUSEUP);
}
