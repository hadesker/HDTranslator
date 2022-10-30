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
s.src = chrome.runtime.getURL('src/scripts/inject.js');
s.onload = function() {
    this.remove();
};
(document.head || document.documentElement).appendChild(s);

function isVietnamese(text){
    return /[ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễếệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ]/g.test(text);
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request){
        switch (request.action){
            case 'get-text': return sendResponse({ from: 'content', text: getSelectionText() });
            case 'search-result': {
                let { x, y, text, result } = request.data;
                const $body = $('body');
                let popup = `<div class="dictionary-popup" style="position: absolute; z-index: 999999; top: ${y}px; left: ${x}px; background: black;padding: 5px 8px;border-radius: 5px;border: 1px solid #89898975;"><a style="color: white !important;text-decoration: underline;font-family: sans-serif, none;" target="_blank" title='View more for "${text}"' href="https://dictionary.faster.asia/word/${text}">${result}</a> <span title='Pronounce "${isVietnamese(text) ? result : text}"' onclick="window.playGoogleVoice('${isVietnamese(text) ? result : text}')" style="cursor: pointer; font-size: 20px; margin-left: 5px">🔈</span></div>`;
                if($body.find('.dictionary-popup').length){
                    $('body .dictionary-popup').replaceWith(popup)
                } else {
                    $body.append(popup);
                }
            } break;
        }
    }
    sendResponse(true);
});

document.onmouseup = function (event) {
    let text = (getSelectionText() || '').trim();
    const $body = $('body');
    if($(event.target).closest('.dictionary-popup').length){
        return;
    }
    if(!text || text.length < 3){
        return $body.find('.dictionary-popup').remove();
    }
    let { top, left } = window.getSelection().getRangeAt(0).getBoundingClientRect();
    console.log('e', event, top, left, window.scrollY + top);
    chrome.runtime.sendMessage({from: "content", action: 'search', data: { x: left, y: window.scrollY + top - 45, text }}, f => f);
};
if (!document.all){
    document.captureEvents(Event.MOUSEUP);
}