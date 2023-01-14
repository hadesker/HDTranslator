const $word = $('#word');
let audios = [];
let enterPress = false;
let is_auto_selected = false;

const domain = 'https://dictionary.faster.asia';

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
    function playAudio(url) {
        if(!url){
            return;
        }
        if(!url.startsWith('http')){
            url = `${domain}${url}`;
        }
        clearTimeout(timeoutPlaying);
        $('.card-body').find(`[data-audio="${url}"]>i`).addClass('playing');
        timeoutPlaying = setTimeout(() => {
            $('i.playing').removeClass('playing');
        }, 2000);
        if(!(source.src || '').includes(url)){
            source.src = url;
            audio.load();
        }
        audio.play();
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
    $('.btn-clear').click(function () {
        $word.val('');
        $word.focus();
    });
    $('.btn-search').click(function () {
        onTranslate($word.val());
    });
    $('.btn-paste').click(function () {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {from: "popup", action: 'get-text'}, function(response) {
                let { text } = response || {};
                if(text){
                    $word.val(text);
                    $('.btn-search').click();
                }
            });
        });
    });
    $('#toTop').click(function () {
        $('body,html').animate({
            scrollTop: 0
        }, 700);
    });

    chrome.storage.local.get(['is_auto_selected'], function (data) {
        is_auto_selected = !!data.is_auto_selected;
        $('.btn-auto-translation>input').prop('checked', is_auto_selected);
    });
    $('.btn-auto-translation>input').on('change', function () {
        is_auto_selected = $(this).is(':checked');
        chrome.runtime.sendMessage({from: "popup", action: 'update', data: { is_auto_selected }}, f => f);
        return chrome.storage.local.set({ is_auto_selected: is_auto_selected });
    });
});
