let is_auto_selected = false;
let translation_service = 'google';

function getApi(endpoint, word) {
    return fetch(`https://dictionary.faster.asia/${endpoint}?word=${encodeURI(word)}`)
        .then((response) => response.json());
}

function isVietnamese(text){
    return /[ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễếệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ]/g.test(text);
}

const translation_services = {
    faster: async function (word) {
        return getApi('translate', word).then(function (response) {
            if(response.success && response.data && response.data.length && response.data[0].meanings && response.data[0].meanings[0].translated){
                return response.data[0].meanings[0].translated;
            }
            return '';
        });
    },
    google: async function(word){
        let from = 'en', to = 'vi';
        if(isVietnamese(word)){
            from = 'vi';
            to = 'en';
        }
        return fetch(`https://translate.googleapis.com/translate_a/single?ie=utf-8&oe=utf-8&client=gtx&sl=${from}&tl=${to}&dt=t&dt=bd&dj=1&source=input&tk=867945.867945&q=${encodeURI(word)}`)
            .then((response) => response.json())
            .then((data) => {
                if(data && data.sentences && data.sentences.length){
                    return (data.sentences.map(item => item.trans).join(' ') || '').trim();
                }
                return '';
            }).catch(e => {
                translation_service = 'faster';
                return '';
            });
    }
};

function sendMessage({ action, data }) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {from: "background", action: action, data}, f => f);
    });
}

chrome.storage.local.get(['is_auto_selected'], function (data) {
    is_auto_selected = !!data.is_auto_selected;
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    sendResponse(true);
    if(request && request.from === 'popup' && request.action === 'update'){
        is_auto_selected = request.data.is_auto_selected;
        return;
    }
    if(request && request.from === 'content' && request.action === 'search' && is_auto_selected){
        let { text } = request.data;
        translation_services[translation_service](text).then((result) => {
            result && sendMessage({ action: 'search-result', data: { ...request.data, result } });
        });
    }
});
