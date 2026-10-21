import getWeightedOption from "../utils/getWeightedOption.js";
import { rewriteOrthographyTraceSurface } from "./write.js";
function serializePhonemeSequence(phonemes) {
    return phonemes.join("\u0001");
}
export function buildWordPhonemeKey(syllables) {
    return serializePhonemeSequence(syllables.flatMap((syllable) => [
        ...syllable.onset.map((phoneme) => phoneme.sound),
        ...syllable.nucleus.map((phoneme) => phoneme.sound),
        ...syllable.coda.map((phoneme) => phoneme.sound),
    ]));
}
function compileGapSpellings(gapSpellings) {
    const compiled = new Map();
    for (const gapSpelling of gapSpellings) {
        const key = serializePhonemeSequence(gapSpelling.phonemes);
        const variants = compiled.get(key) ?? [];
        variants.push({
            name: gapSpelling.name,
            replacement: gapSpelling.replacement,
            hyphenated: gapSpelling.hyphenated ?? gapSpelling.replacement,
            weight: gapSpelling.weight ?? 100,
            targetLayer: gapSpelling.targetLayer,
        });
        compiled.set(key, variants);
    }
    return compiled;
}
function selectGapSpelling(variants, context) {
    if (!variants || variants.length === 0)
        return undefined;
    if (variants.length === 1)
        return variants[0];
    return getWeightedOption(variants.map((variant) => [variant, variant.weight]), context.rand);
}
export function createGapSpellingApplicator(config) {
    const gapSpellingMap = compileGapSpellings(config.gapSpellings ?? []);
    return (context) => {
        if (context.word.syllables.length === 0 || gapSpellingMap.size === 0)
            return;
        const selected = selectGapSpelling(gapSpellingMap.get(buildWordPhonemeKey(context.word.syllables)), context);
        if (!selected)
            return;
        const before = context.word.written.clean;
        context.word.written.clean = selected.replacement;
        context.word.written.hyphenated = selected.hyphenated;
        context.trace?.recordRepair(`gapSpelling:${selected.name}`, before, selected.replacement, `targetLayer:${selected.targetLayer}`);
        if (context.trace?.orthographyTrace) {
            rewriteOrthographyTraceSurface(context.trace, selected.replacement);
        }
    };
}
export function buildGapSpellingWordIndex(gapSpellings) {
    const byWord = new Map();
    for (const gapSpelling of gapSpellings) {
        const key = gapSpelling.replacement.toLowerCase();
        const existing = byWord.get(key);
        if (existing) {
            if (!existing.names.includes(gapSpelling.name))
                existing.names.push(gapSpelling.name);
            if (!existing.targetLayers.includes(gapSpelling.targetLayer)) {
                existing.targetLayers.push(gapSpelling.targetLayer);
            }
            continue;
        }
        byWord.set(key, {
            replacement: key,
            names: [gapSpelling.name],
            targetLayers: [gapSpelling.targetLayer],
        });
    }
    return byWord;
}
export function groupGapSpellingsByTargetLayer(gapSpellings) {
    const grouped = new Map();
    for (const gapSpelling of gapSpellings) {
        const entries = grouped.get(gapSpelling.targetLayer) ?? [];
        entries.push(gapSpelling);
        grouped.set(gapSpelling.targetLayer, entries);
    }
    return grouped;
}
