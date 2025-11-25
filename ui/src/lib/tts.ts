/**
 * Text-to-Speech utility using Web Speech API
 * Converts text to speech in Turkish language
 */

let currentUtterance: SpeechSynthesisUtterance | null = null

/**
 * Speaks the given text using Web Speech API
 * @param text - The text to speak
 * @param options - Optional TTS configuration
 */
export function speakText(
    text: string,
    options?: {
        lang?: string
        rate?: number
        pitch?: number
        volume?: number
    }
): void {
    // Stop any ongoing speech
    stopSpeaking()

    // Create utterance
    currentUtterance = new SpeechSynthesisUtterance(text)

    // Set Turkish language by default
    currentUtterance.lang = options?.lang || 'tr-TR'
    currentUtterance.rate = options?.rate || 1.0
    currentUtterance.pitch = options?.pitch || 1.0
    currentUtterance.volume = options?.volume || 1.0

    // Error handling
    currentUtterance.onerror = (event) => {
        console.error('TTS Error:', event.error)
    }

    // Speak
    window.speechSynthesis.speak(currentUtterance)
}

/**
 * Stops the current speech
 */
export function stopSpeaking(): void {
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel()
    }
    currentUtterance = null
}

/**
 * Checks if speech is currently active
 */
export function isSpeaking(): boolean {
    return window.speechSynthesis.speaking
}

/**
 * Gets available voices for the specified language
 */
export function getVoices(lang: string = 'tr-TR'): SpeechSynthesisVoice[] {
    const voices = window.speechSynthesis.getVoices()
    return voices.filter(voice => voice.lang.startsWith(lang.split('-')[0]))
}
