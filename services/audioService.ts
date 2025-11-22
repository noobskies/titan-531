
export const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    // Cancel any ongoing speech to prevent queue pileup
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.volume = 1.0;
    window.speechSynthesis.speak(utterance);
};

export const playBeep = (freq: number = 880, duration: number = 0.1, type: OscillatorType = 'sine') => {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.frequency.value = freq;
        osc.type = type;
        gain.gain.value = 0.1;
        
        osc.start();
        setTimeout(() => {
            // Ramp down to avoid clipping sound
            gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.04);
            osc.stop(ctx.currentTime + 0.05);
        }, duration * 1000);
        
        // Vibrate if supported
        if (navigator.vibrate) navigator.vibrate(duration * 1000);
    } catch (e) {
        console.error("Audio play failed", e);
    }
};
