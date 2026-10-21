export function attachSpeech(root, getSpecimen) {
  const controls = root.querySelector('[data-speech-controls]');
  const listen = root.querySelector('[data-listen]');
  const sing = root.querySelector('[data-sing]');
  const stop = root.querySelector('[data-stop]');
  const voice = root.querySelector('[data-voice]');
  const rate = root.querySelector('[data-rate]');
  const pitch = root.querySelector('[data-pitch]');
  const status = root.querySelector('[data-speech-status]');
  if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
    status.textContent = 'Speech is unavailable in this browser. You can still generate and share words.';
    return { stop() {} };
  }
  const synth = window.speechSynthesis;
  let voices = [];
  let sequence = 0;
  let timer;
  let active = false;
  let utterance;

  function stopSpeech(message = '') {
    sequence += 1;
    clearInterval(timer);
    if (active) synth.cancel();
    active = false;
    utterance = undefined;
    stop.disabled = true;
    listen.disabled = !getSpecimen();
    if (sing) sing.disabled = !getSpecimen();
    status.textContent = message;
  }
  function refreshVoices() {
    const selected = voice.value;
    voices = synth.getVoices();
    voice.replaceChildren(new Option('Browser default', ''));
    for (const item of voices) voice.add(new Option(`${item.name} (${item.lang})`, item.voiceURI));
    if (voices.some(item => item.voiceURI === selected)) voice.value = selected;
  }
  function speak(singing) {
    stopSpeech();
    const specimen = getSpecimen();
    if (!specimen) return;
    const run = sequence;
    let note = 0;
    active = true;
    stop.disabled = false;
    listen.disabled = true;
    if (sing) sing.disabled = true;
    status.textContent = singing ? 'Singing in a loop. Stop ends playback.' : 'Preparing speech…';
    function playNote() {
      if (run !== sequence) return;
      if (singing) {
        utterance = undefined;
        synth.cancel();
      }
      const melody = singing ? specimen.melody[note++ % specimen.melody.length] : { pitch: 1, rate: 1 };
      const spoken = new SpeechSynthesisUtterance(specimen.word);
      utterance = spoken;
      const selected = voices.find(item => item.voiceURI === voice.value);
      if (selected) spoken.voice = selected;
      spoken.lang = selected?.lang || 'en-GB';
      spoken.rate = Math.min(10, Math.max(0.1, Number(rate.value) * melody.rate));
      spoken.pitch = Math.min(2, Math.max(0, Number(pitch.value) * melody.pitch));
      spoken.onstart = () => { if (run === sequence && !singing) status.textContent = 'Speaking…'; };
      spoken.onend = () => { if (run === sequence && !singing) stopSpeech('Finished.'); };
      spoken.onerror = event => {
        if (run !== sequence || spoken !== utterance) return;
        if (['interrupted', 'canceled'].includes(event.error)) {
          stopSpeech('Stopped.');
          return;
        }
        stopSpeech('Speech could not play. Try another voice or press Listen again.');
      };
      try { synth.speak(spoken); }
      catch { stopSpeech('Speech could not start. Try another voice or press Listen again.'); }
    }
    playNote();
    if (singing && active) timer = setInterval(playNote, 500);
  }
  refreshVoices();
  synth.addEventListener('voiceschanged', refreshVoices);
  controls.disabled = false;
  listen.disabled = false;
  if (sing) sing.disabled = false;
  listen.addEventListener('click', () => speak(false));
  sing?.addEventListener('click', () => speak(true));
  stop.addEventListener('click', () => stopSpeech('Stopped.'));
  for (const input of [voice, rate, pitch]) {
    input.addEventListener('input', () => {
      if (input === rate || input === pitch) input.nextElementSibling.value = `${Number(input.value).toFixed(2)}×`;
      stopSpeech('Voice settings changed. Press Listen to hear them.');
    });
  }
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && active) stopSpeech('Stopped.'); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopSpeech(); });
  window.addEventListener('pagehide', () => stopSpeech());
  return { stop: stopSpeech };
}
