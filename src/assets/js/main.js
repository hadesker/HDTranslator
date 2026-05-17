const $word = $('#word');
let audios = [];
let enterPress = false;
let is_auto_selected = false;
const chromeApi = typeof chrome !== 'undefined' ? chrome : null;
const browserApi = typeof browser !== 'undefined' ? browser : null;
let appLanguage = getDefaultLanguage();

const domain = 'https://dictionary.faster.asia';

const i18n = {
    en: {
        appTitle: 'Translator',
        appSubtitle: 'English - Vietnamese dictionary',
        languageLabel: 'Interface language',
        englishLanguage: 'English',
        vietnameseLanguage: 'Vietnamese',
        autoSelection: 'Auto selection',
        autoTitle: 'Automatically translate selected text on the current page',
        autoTooltip: 'Auto selection: automatically translates the text you highlight on the current page and shows a small translation popup beside the selection.',
        searchPlaceholder: '.ve. / .ev. for sentence translation',
        search: 'Search',
        pasteSelected: 'Paste selected text',
        clear: 'Clear',
        translationEyebrow: 'Translation',
        translationTitle: 'Meaning in English-Vietnamese',
        dictionaryEyebrow: 'Dictionary',
        dictionaryTitle: 'English definitions',
        lexiconEyebrow: 'Lexicon',
        synonymTitle: 'Synonyms in English',
        viewMore: 'View more',
        emptyState: 'The result will be displayed in here...',
        audioUnsupported: 'Your browser does not support the audio format.'
    },
    vi: {
        appTitle: 'Từ điển',
        appSubtitle: 'Từ điển Anh - Việt',
        languageLabel: 'Ngôn ngữ giao diện',
        englishLanguage: 'Tiếng Anh',
        vietnameseLanguage: 'Tiếng Việt',
        autoSelection: 'Tự động chọn',
        autoTitle: 'Tự động dịch văn bản được bôi chọn trên trang hiện tại',
        autoTooltip: 'Tự động chọn: tự động dịch đoạn văn bản bạn bôi chọn trên trang hiện tại và hiển thị popup dịch nhỏ cạnh vùng chọn.',
        searchPlaceholder: 'Nhập từ hoặc dùng .ve. / .ev. để dịch câu',
        search: 'Tìm kiếm',
        pasteSelected: 'Dán văn bản đã chọn',
        clear: 'Xóa',
        translationEyebrow: 'Dịch',
        translationTitle: 'Nghĩa Anh - Việt',
        dictionaryEyebrow: 'Từ điển',
        dictionaryTitle: 'Định nghĩa tiếng Anh',
        lexiconEyebrow: 'Từ đồng nghĩa',
        synonymTitle: 'Từ đồng nghĩa tiếng Anh',
        viewMore: 'Xem thêm',
        emptyState: 'Kết quả sẽ hiển thị tại đây...',
        audioUnsupported: 'Trình duyệt của bạn không hỗ trợ định dạng âm thanh.'
    }
};

function normalizeLanguage(language) {
    return language === 'vi' ? 'vi' : 'en';
}

function getDefaultLanguage() {
    return normalizeLanguage((navigator.language || '').toLowerCase().startsWith('vi') ? 'vi' : 'en');
}

function t(key) {
    return (i18n[appLanguage] && i18n[appLanguage][key]) || i18n.en[key] || key;
}

function applyLanguage(language) {
    appLanguage = normalizeLanguage(language);
    document.documentElement.lang = appLanguage;
    $('[data-i18n]').each(function () {
        $(this).text(t($(this).attr('data-i18n')));
    });
    $('[data-i18n-placeholder]').each(function () {
        $(this).attr('placeholder', t($(this).attr('data-i18n-placeholder')));
    });
    $('[data-i18n-title]').each(function () {
        $(this).attr('title', t($(this).attr('data-i18n-title')));
    });
    $('[data-i18n-aria]').each(function () {
        $(this).attr('aria-label', t($(this).attr('data-i18n-aria')));
    });
    $('[data-i18n-tooltip]').each(function () {
        $(this).attr('data-tooltip', t($(this).attr('data-i18n-tooltip')));
    });
    $('.language-option').toggleClass('is-active', false).attr('aria-pressed', 'false');
    $(`.language-option[data-language="${appLanguage}"]`).toggleClass('is-active', true).attr('aria-pressed', 'true');
}

applyLanguage(appLanguage);

function storageGet(keys, callback) {
    if(!chromeApi && !browserApi){
        return callback({});
    }
    if(chromeApi && chromeApi.storage && chromeApi.storage.local){
        return chromeApi.storage.local.get(keys, callback);
    }
    return browserApi.storage.local.get(keys).then(callback).catch(() => callback({}));
}

function storageSet(data, callback) {
    if(!chromeApi && !browserApi){
        return callback && callback();
    }
    if(chromeApi && chromeApi.storage && chromeApi.storage.local){
        return chromeApi.storage.local.set(data, callback);
    }
    return browserApi.storage.local.set(data).then(callback).catch(() => callback && callback());
}

function runtimeSendMessage(message, callback) {
    if(!chromeApi && !browserApi){
        return callback && callback();
    }
    if(chromeApi && chromeApi.runtime){
        return chromeApi.runtime.sendMessage(message, callback);
    }
    return browserApi.runtime.sendMessage(message).then(callback).catch(() => callback && callback());
}

function tabsQuery(query, callback) {
    if(!chromeApi && !browserApi){
        return callback([]);
    }
    if(chromeApi && chromeApi.tabs){
        return chromeApi.tabs.query(query, callback);
    }
    return browserApi.tabs.query(query).then(callback).catch(() => callback([]));
}

function tabsSendMessage(tabId, message, callback) {
    if(!tabId){
        return callback && callback();
    }
    if(chromeApi && chromeApi.tabs){
        return chromeApi.tabs.sendMessage(tabId, message, callback);
    }
    return browserApi.tabs.sendMessage(tabId, message).then(callback).catch(() => callback && callback());
}

function isVietnamese(text){
    return /[ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễếệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ]/g.test(text);
}

function checkToAddPLayButton(text, audio_mp3) {
    if(audio_mp3){
        return `<span class="btn-pronounce" data-audio="${audio_mp3}"><i class="fa fa-volume-up"></i></span>`;
    }
    if(isVietnamese(text)){
        return '';
    }
    return `<span class="btn-pronounce"><i class="fa fa-volume-up"></i></span>`;
}

function getMeaning(word, meaning_index = 1) {
    return $.get(`${domain}/mean-${meaning_index}?word=${encodeURI(word)}`).then(({success, data}) => {
        let englishContent = '';
        let illustration = data ? data.illustration : null;
        if(!illustration && word){
            $.get(`${domain}/illustration?word=${encodeURI(word)}`).then(({ data }) => {
                if(data && !$('.card-body#english-content-1 .illustration').length){
                    $('.card-body#english-content-1').prepend(`<div><img class="illustration" height="150px" width="230px" src="${domain}${data}" alt=""></div>`);
                }
            });
        }
        if(data && data.english && data.english.length){
            if(meaning_index === 1){
                audios = data.english[0].regions.map(re => re.audio_mp3);
            }
            englishContent = (data.illustration ? `<div><img class="illustration" height="150px" width="230px" src="${domain}${data.illustration}" alt=""></div>` : '') + data.english.map(group => {
                let regions = group.regions.map(region => `<div class="region">
                                <span class="reg-sym">${region.region}</span>
                                <div class="reg-volume" data-audio="${region.audio_mp3}"><i class="fa fa-volume-up" aria-hidden="true"></i></div>
                                <div class="ipa">${region.ipa}</div>
                            </div>`).join('');
                let meanings = group.meanings.map(mean => `<div class="mean">
                                <div class="group-title">${mean.cefr ? `<span class="cefr">${mean.cefr}</span>` : ''}
                                <span class="title">${mean.title} <span class="btn-copy"><i class="fa fa-copy"></i></span> <span class="btn-pronounce"><i class="fa fa-volume-up"></i></span></span></div>
                                <div class="examples">${mean.examples.map(ex => `<span class="example">${ex.text} <span class="btn-copy"><i class="fa fa-copy"></i></span> ${checkToAddPLayButton(ex.text, ex.audio_mp3)}</span>`).join('')}</div>
                            </div>`).join('');
                return `<div class="group">
                        <div class="type">
                            <span>${group.type}</span>
                        </div>
                        <div class="regions flex-sm-row">${regions}</div>
                        <div class="meanings">${meanings}</div>
                    </div>`;
            }).join('');

        }
        $(`#english-content-${meaning_index}`).html(englishContent);
    });
}

function getSynonym(word) {
    return $.get(`${domain}/synonym?word=${encodeURI(word)}`).then(({success, data}) => {
        let englishContent = '';
        if(data && data.length){
            englishContent = data.map(group => {
                let regions = group.examples.map(region => `<div class="">
                                <div class="type">${region}</div>
                            </div>`).join('');
                let meanings = group.synonyms.map(mean => `<div class="mean">
                                <div class="group-title">
                                <span class="title">${mean.word} <span class="btn-copy"><i class="fa fa-copy"></i></span> <span class="btn-pronounce"><i class="fa fa-volume-up"></i></span></span></div>
                                <div class="examples"><span class="example">${mean.example} <span class="btn-copy"><i class="fa fa-copy"></i></span> ${checkToAddPLayButton(mean.example)}</span></div>
                            </div>`).join('');
                return `<div class="group">
                        <div class="">
                            <span class="font-weight-bold">${group.title}</span>
                        </div>
                        <div class="regions flex-sm-row">${regions}</div>
                        <div class="meanings">${meanings}</div>
                    </div>`;
            }).join('');
        }
        $(`#synonym`).html(englishContent);
    });
}

function onTranslate(word) {
    $('a.view-more').attr('href', `https://dictionary.faster.asia/?word=${word}`);
    audios = [];
    $('#english-content-1').html('<div class="loadersmall"></div>');
    $('#translate-content').html('<div class="loadersmall"></div>');
    if(!isVietnamese(word)){
        getMeaning(word, 1);
        getSynonym(word);
    }

    $.get(`${domain}/translate?word=${encodeURI(word)}`).then(({success, data}) => {
        let englishContent = '';
        if(data && data.length){
            if(isVietnamese(word) && data[0].meanings && data[0].meanings.length && data[0].meanings[0].translated && !data[0].meanings[0].translated.includes(' ')){
                getMeaning(data[0].meanings[0].translated, 1);
                getSynonym(word);
            }
            englishContent = data.map(group => {
                let meanings = group.meanings.map(mean => `<div class="mean">
                                <div class="title">${mean.title} <span class="btn-copy"><i class="fa fa-copy"></i></span> ${checkToAddPLayButton(mean.title)}</div>
                                <div class="translated">${mean.translated} <span class="btn-copy"><i class="fa fa-copy"></i></span> ${checkToAddPLayButton(mean.translated)}</div>
                                <div class="examples">${mean.examples.map(ex => `<span class="example">${ex} <span class="btn-copy"><i class="fa fa-copy"></i></span> ${checkToAddPLayButton(ex)}</span>`).join('')}</div>
                            </div>`).join('');
                return `<div class="group">
                        <div class="type">
                            <span>${group.type}</span>
                        </div>
                        <div class="meanings">${meanings}</div>
                    </div>`;
            }).join('');
        }
        $('#translate-content').html(englishContent);
    }).catch(e => {

    }).always(e => {
        enterPress = false;
    });
}

function resetResults() {
    audios = [];
    $('a.view-more').attr('href', 'https://dictionary.faster.asia/');
    $('#translate-content').html(`<div class="empty-state" data-i18n="emptyState">${t('emptyState')}</div>`);
    $('#english-content-1').html(`<div class="empty-state" data-i18n="emptyState">${t('emptyState')}</div>`);
    $('#synonym').html(`<div class="empty-state" data-i18n="emptyState">${t('emptyState')}</div>`);
    $('i.playing').removeClass('playing');
    $('.copying').removeClass('copying');
}

function getSearchTerm() {
    return ($word.val() || '').trim();
}

function updateSearchState() {
    $('.btn-search').prop('disabled', !getSearchTerm());
}

function submitSearch() {
    const word = getSearchTerm();
    if(!word){
        updateSearchState();
        return false;
    }
    onTranslate(word);
    return true;
}

$word.autocomplete && $word.autocomplete({
    source: function( request, response ) {
        if(enterPress){
            return response(null);
        }
        $.ajax({
            url: `${domain}/search`,
            dataType: "json",
            data: {
                q: request.term
            },
            success: function( data ) {
                response( data.data );
            }
        });
    },
    minLength: 1,
    select: function( event, ui ) {
        onTranslate(ui.item.value);
    },
    autoFocus: true
});

const wordInputElement = document.getElementById('word');
if(wordInputElement){
    wordInputElement.addEventListener('keydown', function (event) {
        if((event.key !== 'Enter' && event.which !== 13) || event.isComposing){
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        enterPress = true;
        try {
            $word.autocomplete && $word.autocomplete('close');
        } catch (e) {}
        submitSearch();
    }, true);
}

var timeoutCopying= null;
var timeoutPlaying= null;
$(function () {
    var synth = window.speechSynthesis;
    var utterThis = new SpeechSynthesisUtterance(' ');
    utterThis.onend = function(event) {
        $('.card-body').find('i.playing').removeClass('playing');
    }
    function playGoogleVoice(text) {
        text = (text || '').trim();
        if(!text){
            return false;
        }
        $(this).find('i').addClass('playing');
        var voices = synth.getVoices();
        utterThis.voice = voices.find(v => v.name.includes('US')) || voices.find(v => v.lang === 'en-US') || voices[4];
        utterThis.text = text;
        synth.speak(utterThis);
    }

    var audio = document.getElementById('audio');
    var source = document.getElementById('audioSource');
    var audioPlayRequest = 0;
    function playAudio(url) {
        if(!url){
            return;
        }
        if(!url.startsWith('http')){
            url = `${domain}${url}`;
        }
        const requestId = ++audioPlayRequest;
        clearTimeout(timeoutPlaying);
        $('.card-body').find(`[data-audio="${url}"]>i`).addClass('playing');
        timeoutPlaying = setTimeout(() => {
            $('i.playing').removeClass('playing');
        }, 2000);
        if(!(source.src || '').includes(url)){
            audio.pause();
            source.src = url;
            audio.load();
        }
        const playPromise = audio.play();
        if(playPromise && typeof playPromise.catch === 'function'){
            playPromise.catch((error) => {
                if(requestId !== audioPlayRequest || error.name === 'AbortError'){
                    return;
                }
                $('i.playing').removeClass('playing');
                console.warn('Unable to play pronunciation audio', error);
            });
        }
    }

    $('.card-body').on('click', '.reg-volume', function () {
        let url = $(this).attr('data-audio');
        playAudio(url);
    }).on('click', '.btn-copy', function () {
        navigator.clipboard.writeText($(this).parent().text()).then(f => f);
        $(this).addClass('copying');
        timeoutCopying = setTimeout(() => {
            $('.copying').removeClass('copying');
        }, 1000);
    }).on('click', '.btn-pronounce', function () {
        let audio_mp3 = $(this).attr('data-audio');
        if(audio_mp3){
            return playAudio(audio_mp3);
        }
        let text = $(this).parent().text().trim();
        playGoogleVoice.call(this, text);
    })
    $(document).keydown(function(event){
        switch (event.which){
            case 17: {
                if(audios && audios.length)
                {
                    if(event.code === "ControlLeft"){
                        playAudio(audios[0]);
                    }
                    if(event.code === "ControlRight" && audios.length > 1){
                        playAudio(audios[1]);
                    }
                }
            } break;
            case 13:{
                enterPress = true;
                $('.btn-search').click();
            }break;
            case 8:{
                $word.focus();
            } break;
            case 46: {
                $('.btn-clear').click();
            } break;
        }
    });
    $word.on('input', updateSearchState);
    updateSearchState();
    $('.btn-clear').click(function () {
        $word.val('');
        resetResults();
        updateSearchState();
        $word.focus();
    });
    $('.btn-search').click(function () {
        submitSearch();
    });
    $('.btn-paste').click(function () {
        tabsQuery({active: true, currentWindow: true}, function(tabs) {
            tabsSendMessage(tabs[0] && tabs[0].id, {from: "popup", action: 'get-text'}, function(response) {
                let { text } = response || {};
                if(text){
                    $word.val(text);
                    updateSearchState();
                    submitSearch();
                }
            });
        });
    });
    $('#toTop').click(function () {
        $('body,html').animate({
            scrollTop: 0
        }, 700);
    });

    storageGet(['is_auto_selected', 'app_language'], function (data) {
        applyLanguage(data.app_language || appLanguage);
        is_auto_selected = !!data.is_auto_selected;
        $('.btn-auto-translation>input').prop('checked', is_auto_selected);
    });
    $('.language-option').on('click', function () {
        const language = normalizeLanguage($(this).attr('data-language'));
        applyLanguage(language);
        storageSet({ app_language: language });
    });
    $('.btn-auto-translation>input').on('change', function () {
        is_auto_selected = $(this).is(':checked');
        runtimeSendMessage({from: "popup", action: 'update', data: { is_auto_selected }}, f => f);
        return storageSet({ is_auto_selected: is_auto_selected });
    });
});
