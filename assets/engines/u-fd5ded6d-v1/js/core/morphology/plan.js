import getWeightedOption from "../../utils/getWeightedOption.js";
export const MIN_AFFIXED_ROOT_PHONEMES = 3;
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function pickWeighted(items, getWeight, rand) {
    const options = items.map(item => [item, getWeight(item)]);
    return getWeightedOption(options, rand);
}
function pickTemplate(config, mode, rand) {
    const w = config.templateWeights[mode];
    return getWeightedOption([
        ["bare", w.bare],
        ["suffixed", w.suffixed],
        ["prefixed", w.prefixed],
        ["both", w.both],
    ], rand);
}
function getConservativeAffixBudget(affix) {
    if (!affix) {
        return { phonemes: 0, syllables: 0 };
    }
    let phonemes = affix.phonemes.length;
    let syllables = affix.syllableCount;
    for (const variant of affix.allomorphs ?? []) {
        phonemes = Math.max(phonemes, variant.phonemes.length);
        syllables = Math.max(syllables, variant.syllableCount);
    }
    return { phonemes, syllables };
}
function getSyllableReduction(plan) {
    return (plan.prefix?.syllableCount ?? 0) + (plan.suffix?.syllableCount ?? 0);
}
export function getConservativeMorphologyBudget(plan) {
    const prefixBudget = getConservativeAffixBudget(plan?.prefix);
    const suffixBudget = getConservativeAffixBudget(plan?.suffix);
    return {
        phonemes: prefixBudget.phonemes + suffixBudget.phonemes,
        syllables: prefixBudget.syllables + suffixBudget.syllables,
    };
}
function toSelection(plan) {
    return {
        plan,
        syllableReduction: getSyllableReduction(plan),
    };
}
function evaluateSelectionBudget(selection, sampledFinalTarget, evaluateSelection) {
    if (evaluateSelection) {
        return evaluateSelection(selection);
    }
    const conservativeBudget = getConservativeMorphologyBudget(selection.plan);
    return {
        finalTarget: sampledFinalTarget,
        rootTarget: sampledFinalTarget - conservativeBudget.phonemes,
    };
}
// ---------------------------------------------------------------------------
// Main API
// ---------------------------------------------------------------------------
/**
 * Plan morphology BEFORE root generation — picks template and affixes,
 * returns the plan and the syllable count adjustment.
 */
export function planMorphology(config, mode, rand) {
    const template = pickTemplate(config, mode, rand);
    if (template === "bare") {
        return { plan: { template }, syllableReduction: 0 };
    }
    const plan = { template };
    let reduction = 0;
    if (template === "prefixed" || template === "both") {
        plan.prefix = pickWeighted(config.prefixes, a => a.frequency, rand);
        reduction += plan.prefix.syllableCount;
    }
    if (template === "suffixed" || template === "both") {
        plan.suffix = pickWeighted(config.suffixes, a => a.frequency, rand);
        reduction += plan.suffix.syllableCount;
    }
    return { plan, syllableReduction: reduction };
}
export function guardMorphologyPlan(selection, sampledFinalTarget, minRootPhonemesOrEvaluate = MIN_AFFIXED_ROOT_PHONEMES, maybeEvaluate) {
    const minRootPhonemes = typeof minRootPhonemesOrEvaluate === "number"
        ? minRootPhonemesOrEvaluate
        : MIN_AFFIXED_ROOT_PHONEMES;
    const evaluateSelection = typeof minRootPhonemesOrEvaluate === "function"
        ? minRootPhonemesOrEvaluate
        : maybeEvaluate;
    const originalPlan = selection.plan;
    if (originalPlan.template === "bare") {
        return { selection };
    }
    const originalBudget = evaluateSelectionBudget(selection, sampledFinalTarget, evaluateSelection);
    const rootPhonemesBefore = originalBudget.rootTarget;
    if (rootPhonemesBefore >= minRootPhonemes) {
        return { selection };
    }
    let adjustedSelection = toSelection({ template: "bare" });
    let adjustedBudget = evaluateSelectionBudget(adjustedSelection, sampledFinalTarget, evaluateSelection);
    if (originalPlan.template === "both") {
        const candidates = [];
        if (originalPlan.suffix) {
            candidates.push(toSelection({ template: "suffixed", suffix: originalPlan.suffix }));
        }
        if (originalPlan.prefix) {
            candidates.push(toSelection({ template: "prefixed", prefix: originalPlan.prefix }));
        }
        for (const candidate of candidates) {
            const candidateBudget = evaluateSelectionBudget(candidate, sampledFinalTarget, evaluateSelection);
            if (candidateBudget.rootTarget >= minRootPhonemes) {
                adjustedSelection = candidate;
                adjustedBudget = candidateBudget;
                break;
            }
        }
    }
    const rootPhonemesAfter = adjustedBudget.rootTarget;
    return {
        selection: adjustedSelection,
        decision: {
            originalTemplate: originalPlan.template,
            adjustedTemplate: adjustedSelection.plan.template,
            sampledFinalTarget: originalBudget.finalTarget,
            minRootPhonemes,
            rootPhonemesBefore,
            rootPhonemesAfter,
        },
    };
}
