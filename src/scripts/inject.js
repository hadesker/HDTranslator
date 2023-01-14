var synth = window.speechSynthesis;
var utterThis = new SpeechSynthesisUtterance(' ');
window.playGoogleVoice = function (text) {
    text = (text || '').trim();
    if(!text){
        return false;
    }
    let voices = synth.getVoices();
    utterThis.voice = voices.find(v => v.name.includes('US')) || voices.find(v => v.lang === 'en-US') || voices[4];
    utterThis.text = text;
    synth.speak(utterThis);
}
window.hi_tech = {
    ...window.hi_tech,
    dictionary: {
        version: 2
    }
};
