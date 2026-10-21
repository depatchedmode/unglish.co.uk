function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max));
}
export function computePhonemeTargetBounds(forcedRootSyllableCount, maxOnsetLength, maxCodaLength) {
    const minRoot = forcedRootSyllableCount ?? 1;
    const maxRoot = forcedRootSyllableCount
        ? forcedRootSyllableCount + forcedRootSyllableCount * (maxOnsetLength + maxCodaLength) + 1
        : Infinity;
    return { minRoot, maxRoot };
}
export function derivePhonemeTargets(sampledFinalTarget, plannedMorphologyDelta, bounds) {
    const minFinal = bounds.minRoot + plannedMorphologyDelta;
    const maxFinal = Number.isFinite(bounds.maxRoot) ? bounds.maxRoot + plannedMorphologyDelta : Infinity;
    const finalTarget = clamp(sampledFinalTarget, minFinal, maxFinal);
    const rootTarget = clamp(finalTarget - plannedMorphologyDelta, bounds.minRoot, bounds.maxRoot);
    return { finalTarget, rootTarget, bounds };
}
export function getPlannedMorphologyPhonemeDelta(plan) {
    if (!plan)
        return { planned: 0 };
    const planned = (plan.prefix?.phonemes.length ?? 0) + (plan.suffix?.phonemes.length ?? 0);
    return { planned };
}
export function resolveMorphologyPhonemeDelta(rootPhonemeCount, finalPhonemeCount, planned) {
    const plannedDelta = planned?.planned ?? 0;
    const resolved = finalPhonemeCount - rootPhonemeCount;
    return {
        planned: plannedDelta,
        resolved,
        drift: resolved - plannedDelta,
    };
}
export function resolveLetterLengthBounds(targets, syllableCount) {
    if (!targets)
        return null;
    if (targets[syllableCount])
        return targets[syllableCount];
    const keys = Object.keys(targets).map(Number).filter(Number.isFinite).sort((a, b) => a - b);
    if (keys.length === 0)
        return null;
    if (syllableCount <= keys[0])
        return targets[keys[0]];
    if (syllableCount >= keys[keys.length - 1])
        return targets[keys[keys.length - 1]];
    let nearest = keys[0];
    let nearestDist = Math.abs(syllableCount - nearest);
    for (const key of keys.slice(1)) {
        const dist = Math.abs(syllableCount - key);
        if (dist < nearestDist) {
            nearest = key;
            nearestDist = dist;
        }
    }
    return targets[nearest];
}
export function scoreLetterLength(letterLength, syllableCount, targets) {
    const bounds = resolveLetterLengthBounds(targets, syllableCount);
    if (!bounds)
        return 0;
    const [min, peakMin, peakMax, max] = bounds;
    if (letterLength >= peakMin && letterLength <= peakMax)
        return 0;
    if (letterLength >= min && letterLength <= max) {
        const edgeDistance = letterLength < peakMin ? peakMin - letterLength : letterLength - peakMax;
        return edgeDistance * 0.5;
    }
    const outsideDistance = letterLength < min ? min - letterLength : letterLength - max;
    return 1 + outsideDistance;
}
export function scoreGenerationAttempt(generatedPhonemes, targetPhonemes, generatedLetters, generatedSyllables, letterTargets) {
    const phonemeDistance = Math.abs(generatedPhonemes - targetPhonemes);
    const letterPenalty = scoreLetterLength(generatedLetters, generatedSyllables, letterTargets);
    return {
        phonemeDistance,
        letterPenalty,
        total: phonemeDistance * 2 + letterPenalty,
    };
}
