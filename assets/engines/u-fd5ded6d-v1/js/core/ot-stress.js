/**
 * Harmonic OT (Noisy Harmonic Grammar) stress assignment.
 *
 * Instead of strict constraint ranking, each constraint has a numeric weight.
 * Candidates are scored by summing (violations × weight) across all constraints.
 * Gaussian noise is optionally added to each constraint weight per evaluation,
 * producing natural stochastic variation within a dialect.
 *
 * @see https://en.wikipedia.org/wiki/Harmonic_Grammar
 * @module
 */
// ---------------------------------------------------------------------------
// Built-in constraints
// ---------------------------------------------------------------------------
/**
 * WEIGHT-TO-STRESS (WSP): penalizes stressing a light syllable when a heavy
 * syllable exists elsewhere in the word.
 *
 * A syllable is "heavy" if it has a coda or a long/diphthong nucleus.
 */
const isHeavy = (syl) => syl.coda.length > 0 || syl.nucleus.length > 1;
const WSP = {
    name: "WSP",
    evaluate(syllables, stressIndex) {
        const stressed = syllables[stressIndex];
        if (isHeavy(stressed))
            return 0;
        // One violation per unstressed heavy syllable
        return syllables.filter((s, i) => i !== stressIndex && isHeavy(s)).length;
    },
};
/**
 * ALIGN-LEFT: penalizes distance of stress from left edge.
 * Violations = number of syllables before the stressed one.
 */
const ALIGN_LEFT = {
    name: "ALIGN-LEFT",
    evaluate(_syllables, stressIndex) {
        return stressIndex;
    },
};
/**
 * ALIGN-RIGHT: penalizes distance of stress from right edge.
 * Violations = number of syllables after the stressed one.
 */
const ALIGN_RIGHT = {
    name: "ALIGN-RIGHT",
    evaluate(syllables, stressIndex) {
        return syllables.length - 1 - stressIndex;
    },
};
/**
 * NONFINALITY: penalizes stress on the final syllable.
 * Binary: 1 violation if stress is final, 0 otherwise.
 */
const NONFINALITY = {
    name: "NONFINALITY",
    evaluate(syllables, stressIndex) {
        return stressIndex === syllables.length - 1 ? 1 : 0;
    },
};
/**
 * NONINITIAL: penalizes stress on the initial syllable, scaled by
 * word length. Shorter words get stronger penalty (1.0 for disyllabic,
 * falling as 2/n for n syllables). This captures the English pattern
 * where short words have more stress variation while longer words
 * lean toward initial stress (Germanic bias).
 */
const NONINITIAL = {
    name: "NONINITIAL",
    evaluate(syllables, stressIndex) {
        if (stressIndex !== 0)
            return 0;
        // Steep falloff: full penalty for disyllabic, minimal for 3+
        const n = syllables.length;
        if (n <= 2)
            return 1;
        return 1 / (n - 1);
    },
};
/** Registry of built-in constraints by name. */
const BUILTIN_CONSTRAINTS = new Map([
    [WSP.name, WSP],
    [ALIGN_LEFT.name, ALIGN_LEFT],
    [ALIGN_RIGHT.name, ALIGN_RIGHT],
    [NONFINALITY.name, NONFINALITY],
    [NONINITIAL.name, NONINITIAL],
]);
// ---------------------------------------------------------------------------
// Gaussian noise (Box-Muller)
// ---------------------------------------------------------------------------
/**
 * Sample from a Gaussian distribution using Box-Muller transform.
 * Returns a value with mean 0 and the given standard deviation.
 */
function gaussianNoise(stddev, rand) {
    if (stddev === 0)
        return 0;
    // Box-Muller requires two uniform samples in (0, 1)
    let u1 = rand();
    const u2 = rand();
    // Guard against log(0)
    if (u1 === 0)
        u1 = 1e-10;
    return stddev * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}
// ---------------------------------------------------------------------------
// Evaluator
// ---------------------------------------------------------------------------
/**
 * Evaluate all candidate stress placements and return the winning index.
 *
 * For each candidate (stress on syllable i), we compute:
 *   harmony(i) = Σ (weight_j + noise_j) × violations_j(i)
 *
 * The candidate with the **lowest** harmony score wins.
 */
export function otEvaluate(syllables, config, rand) {
    const n = syllables.length;
    if (n <= 1)
        return 0;
    const noise = config.noise ?? 0;
    // Resolve constraint objects + perturbed weights once per evaluation
    const resolved = [];
    for (const cw of config.constraints) {
        const constraint = BUILTIN_CONSTRAINTS.get(cw.name);
        if (!constraint)
            continue; // skip unknown constraints gracefully
        const perturbedWeight = cw.weight + gaussianNoise(noise, rand);
        resolved.push({ constraint, perturbedWeight });
    }
    let bestIndex = 0;
    let bestScore = Infinity;
    for (let i = 0; i < n; i++) {
        let score = 0;
        for (const { constraint, perturbedWeight } of resolved) {
            score += perturbedWeight * constraint.evaluate(syllables, i);
        }
        if (score < bestScore) {
            bestScore = score;
            bestIndex = i;
        }
    }
    return bestIndex;
}
// ---------------------------------------------------------------------------
// Exports for testing
// ---------------------------------------------------------------------------
export const _builtinConstraints = BUILTIN_CONSTRAINTS;
export { WSP, ALIGN_LEFT, ALIGN_RIGHT, NONFINALITY, NONINITIAL };
