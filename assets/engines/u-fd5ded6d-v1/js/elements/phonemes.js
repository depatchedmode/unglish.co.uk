import { VOICED_BONUS, TENSE_BONUS } from "../config/weights.js";
export const sonorityToMannerOfArticulation = {
    "highVowel": 9,
    "midVowel": 8.5,
    "lowVowel": 8,
    "glide": 7,
    "liquid": 6,
    "nasal": 5,
    "lateralApproximant": 6,
    "sibilant": 4,
    "fricative": 3,
    "affricate": 2,
    "stop": 1,
};
export const sonorityToPlaceOfArticulation = {
    // Vowel places of articulation
    "front": 0.25,
    "central": 0,
    "back": -0.25,
    // Consonants:
    "bilabial": -0.5,
    "labiodental": -0.3,
    "dental": -0.2,
    "alveolar": 0,
    "velar": 0.1,
    "postalveolar": 0.2,
    "labial-velar": 0.2,
    "palatal": 0.3,
    "glottal": 0.5, // H sounds
};
export const forwardnessToPlaceOfArticulation = {
    // Vowel places of articulation
    "front": 9,
    "central": 5,
    "back": 2,
    // Consonants:
    "bilabial": 8,
    "labiodental": 7,
    "dental": 6,
    "alveolar": 5,
    "postalveolar": 4,
    "palatal": 3,
    "labial-velar": 4,
    "velar": 2,
    "glottal": 1, // Lowest forwardness, involving the glottis in the throat
};
export const phonemes = [
    // High Vowels
    { sound: "i:", mannerOfArticulation: "highVowel", tense: true, nucleus: 133, startWord: 3, midWord: 1, endWord: 9, voiced: true, placeOfArticulation: "front" },
    { sound: "ɪ", mannerOfArticulation: "highVowel", tense: false, nucleus: 330, startWord: 3, midWord: 15, endWord: 1, voiced: true, placeOfArticulation: "front" },
    // Mid Vowels
    { sound: "ɛ", mannerOfArticulation: "midVowel", tense: false, nucleus: 331, startWord: 4, midWord: 3, endWord: 1, voiced: true, placeOfArticulation: "front" },
    { sound: "ə", mannerOfArticulation: "midVowel", tense: false, nucleus: 457, startWord: 5, midWord: 11, endWord: 1, voiced: true, placeOfArticulation: "central" },
    { sound: "ɜ", mannerOfArticulation: "midVowel", tense: false, nucleus: 41, startWord: 4, midWord: 1, endWord: 1, voiced: true, placeOfArticulation: "central" },
    { sound: "ɚ", mannerOfArticulation: "midVowel", tense: false, nucleus: 131, startWord: 1, midWord: 2, endWord: 6, voiced: true, placeOfArticulation: "central" },
    // Low Vowels
    { sound: "æ", mannerOfArticulation: "lowVowel", tense: false, nucleus: 121, startWord: 11, midWord: 6, endWord: 1, voiced: true, placeOfArticulation: "front" },
    { sound: "ɑ", mannerOfArticulation: "lowVowel", tense: true, nucleus: 187, startWord: 7, midWord: 3, endWord: 1, voiced: true, placeOfArticulation: "back" },
    { sound: "ɔ", mannerOfArticulation: "lowVowel", tense: true, nucleus: 97, startWord: 6, midWord: 2, endWord: 1, voiced: true, placeOfArticulation: "back" },
    { sound: "ʊ", mannerOfArticulation: "highVowel", tense: true, nucleus: 57, startWord: 2, midWord: 2, endWord: 0, voiced: true, placeOfArticulation: "back" },
    { sound: "u", mannerOfArticulation: "highVowel", tense: true, nucleus: 80, startWord: 4, midWord: 2, endWord: 2, voiced: true, placeOfArticulation: "back" },
    { sound: "ʌ", mannerOfArticulation: "midVowel", tense: false, nucleus: 150, startWord: 5, midWord: 2, endWord: 1, voiced: true, placeOfArticulation: "central" },
    // Diphthongs (typically treated as mid or low vowels)
    { sound: "eɪ", mannerOfArticulation: "midVowel", tense: true, nucleus: 139, startWord: 4, midWord: 2, endWord: 1, voiced: true, placeOfArticulation: "front" },
    { sound: "aɪ", mannerOfArticulation: "midVowel", tense: true, nucleus: 127, startWord: 3, midWord: 2, endWord: 1, voiced: true, placeOfArticulation: "front" },
    { sound: "əʊ", mannerOfArticulation: "midVowel", tense: true, nucleus: 90, startWord: 2, midWord: 2, endWord: 8, voiced: true, placeOfArticulation: "back" },
    { sound: "ɔɪ", mannerOfArticulation: "midVowel", tense: true, nucleus: 12, startWord: 2, midWord: 2, endWord: 2, voiced: true, placeOfArticulation: "front" },
    { sound: "aʊ", mannerOfArticulation: "midVowel", tense: true, nucleus: 18, startWord: 1, midWord: 1, endWord: 6, voiced: true, placeOfArticulation: "back" },
    // Triphthongs
    // Triphthongs removed — they decompose naturally into diphthong + /ə/
    // across syllable boundaries (e.g. "fire" = /faɪ.ə/, "hour" = /aʊ.ə/).
    // Glides
    { sound: "j", mannerOfArticulation: "glide", onset: 62, coda: 0, startWord: 14, midWord: 4, endWord: 1, voiced: true, placeOfArticulation: "palatal" },
    { sound: "w", mannerOfArticulation: "glide", onset: 120, coda: 0, startWord: 10, midWord: 2, endWord: 2, voiced: true, placeOfArticulation: "labial-velar" },
    // Liquids
    { sound: "l", mannerOfArticulation: "liquid", onset: 200, coda: 200, startWord: 5, midWord: 5, endWord: 8, voiced: true, placeOfArticulation: "alveolar" },
    { sound: "r", mannerOfArticulation: "liquid", onset: 330, coda: 155, startWord: 5, midWord: 3, endWord: 10, voiced: true, placeOfArticulation: "postalveolar" },
    // Nasals
    { sound: "m", mannerOfArticulation: "nasal", onset: 109, coda: 193, startWord: 14, midWord: 3, endWord: 9, voiced: true, placeOfArticulation: "bilabial" },
    { sound: "n", mannerOfArticulation: "nasal", onset: 400, coda: 450, startWord: 3, midWord: 2, endWord: 10, voiced: true, placeOfArticulation: "alveolar" },
    { sound: "ŋ", mannerOfArticulation: "nasal", onset: 0, coda: 48, startWord: 0, midWord: 2, endWord: 36, voiced: true, placeOfArticulation: "velar" },
    // Voiceless Fricatives
    { sound: "f", mannerOfArticulation: "fricative", onset: 92, coda: 92, startWord: 13, midWord: 2, endWord: 3, voiced: false, placeOfArticulation: "labiodental" },
    { sound: "θ", mannerOfArticulation: "fricative", onset: 30, coda: 30, startWord: 2, midWord: 2, endWord: 2, voiced: false, placeOfArticulation: "dental" },
    { sound: "h", mannerOfArticulation: "fricative", onset: 188, coda: 0, startWord: 9, midWord: 1, endWord: 0, voiced: false, placeOfArticulation: "glottal" },
    // Voiced Fricatives
    { sound: "v", mannerOfArticulation: "fricative", onset: 191, coda: 17, startWord: 5, midWord: 2, endWord: 6, voiced: true, placeOfArticulation: "labiodental" },
    // /ð/ is common in function words ("the", "this") but relatively sparse in
    // lexicon-style type distributions. Downweight to reduce "the" trigram bias.
    { sound: "ð", mannerOfArticulation: "fricative", onset: 25, coda: 10, startWord: 1, midWord: 1, endWord: 1, voiced: true, placeOfArticulation: "dental" },
    // Sibilants
    { sound: "z", mannerOfArticulation: "sibilant", onset: 55, coda: 92, startWord: 3, midWord: 7, endWord: 7, voiced: true, placeOfArticulation: "alveolar" },
    { sound: "ʒ", mannerOfArticulation: "sibilant", onset: 5, coda: 3, startWord: 0, midWord: 6, endWord: 0, voiced: true, placeOfArticulation: "postalveolar" },
    { sound: "s", mannerOfArticulation: "sibilant", onset: 259, coda: 110, startWord: 13, midWord: 2, endWord: 13, voiced: false, placeOfArticulation: "alveolar" },
    { sound: "ʃ", mannerOfArticulation: "sibilant", onset: 50, coda: 97, startWord: 5, midWord: 2, endWord: 7, voiced: false, placeOfArticulation: "postalveolar" },
    // Affricates
    { sound: "tʃ", voiced: false, placeOfArticulation: "postalveolar", mannerOfArticulation: "affricate", onset: 51, coda: 51, startWord: 6, midWord: 2, endWord: 2 },
    { sound: "dʒ", voiced: true, placeOfArticulation: "postalveolar", mannerOfArticulation: "affricate", onset: 56, coda: 37, startWord: 7, midWord: 3, endWord: 3 },
    // Voiceless Stops
    { sound: "p", voiced: false, placeOfArticulation: "bilabial", mannerOfArticulation: "stop", onset: 83, coda: 41, startWord: 7, midWord: 9, endWord: 5 },
    { sound: "t", voiced: false, placeOfArticulation: "alveolar", mannerOfArticulation: "stop", onset: 220, coda: 75, startWord: 4, midWord: 8, endWord: 8 },
    { sound: "k", voiced: false, placeOfArticulation: "velar", mannerOfArticulation: "stop", onset: 152, coda: 95, startWord: 4, midWord: 10, endWord: 10 },
    // Voiced Stops
    { sound: "b", voiced: true, placeOfArticulation: "bilabial", mannerOfArticulation: "stop", onset: 140, coda: 100, startWord: 14, midWord: 3, endWord: 3 },
    { sound: "d", voiced: true, placeOfArticulation: "alveolar", mannerOfArticulation: "stop", onset: 221, coda: 145, startWord: 5, midWord: 3, endWord: 8 },
    { sound: "g", voiced: true, placeOfArticulation: "velar", mannerOfArticulation: "stop", onset: 119, coda: 70, startWord: 5, midWord: 4, endWord: 4 }, // go
];
export const phonemeMaps = {
    onset: new Map(),
    nucleus: new Map(),
    coda: new Map()
};
for (const position of ["onset", "nucleus", "coda"]) {
    for (const phoneme of phonemes) {
        // @ts-expect-error — Phoneme has optional position keys (onset/nucleus/coda) not in the interface
        if (phoneme[position] !== undefined && phoneme[position] > 0) {
            if (!phonemeMaps[position].has(phoneme.sound)) {
                phonemeMaps[position].set(phoneme.sound, []);
            }
            phonemeMaps[position].get(phoneme.sound).push(phoneme);
        }
    }
}
// Pre-compute sonority levels
export const sonorityLevels = new Map(phonemes.map(p => [
    p,
    sonorityToMannerOfArticulation[p.mannerOfArticulation] +
        (sonorityToPlaceOfArticulation[p.placeOfArticulation] ?? 0) +
        (p.voiced ? VOICED_BONUS : 0) +
        (p.tense ? TENSE_BONUS : 0)
]));
export const invalidBoundaryClusters = [
    /rɜ/,
    /ɜr/,
    /ʃh/,
    /sʃ/,
    /ʒs/,
];
const invalidGeneralClusters = [
    ...invalidBoundaryClusters,
    /fn/,
    /t[ðn]/,
    /[θð]n/,
    /mw/,
    /k[nbf]/,
    /d[tpnmg]/,
    /pb/,
    /[ʒl]r/,
    /^.*.?[ðŋhʃ].?.*$/, // invalid in any position of a string at least 2 characters long
];
export const invalidOnsetClusters = [
    ...invalidGeneralClusters,
    /^[wrlvznmjhʃ].{1,2}/,
    /^.[wzgdbθhvʃsf]/,
    /[^s]k/,
    /t[θd]/,
    /dl/,
    /dʒ./,
    /pn/,
    /^sr/,
];
export const invalidCodaClusters = [
    ...invalidGeneralClusters,
    /vsk$/,
    /.?[kθð](?![szd])$/,
    /lv(?![zd])$/,
    /[fʃ](?![zdt])/,
    /m[tvg]/,
    /[vlstd]g/,
    /.*sp/,
    /t[pb]/,
    /pk/,
    /n[bmp]/,
    /td/,
    /nzt/,
    /lnd/,
    /dʒt/,
    /sn/,
    /.*.?v$/,
    /.*.?mp$/,
    /.*.?b$/,
    /.*?[jw]$/,
    /[szʒ]l$/,
    /[wðf]r$/,
    /[θðf]rl$/,
];
