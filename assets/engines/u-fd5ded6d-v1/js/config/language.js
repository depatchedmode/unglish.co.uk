/** Shared default fallback bridge onsets used to repair vowel hiatus. */
export function defaultFallbackBridgeOnsets() {
    return [["h", 100]];
}
const REGEX_LITERAL_META = /[\\.*+?()[\]{}|]/;
export function isWholeWordAnchoredSpellingRule(rule) {
    const scope = rule.scope ?? "both";
    const isLiteralPattern = (() => {
        if (!rule.pattern.startsWith("^") || !rule.pattern.endsWith("$"))
            return false;
        const inner = rule.pattern.slice(1, -1);
        return inner.length > 0 && !REGEX_LITERAL_META.test(inner);
    })();
    const isLiteralReplacement = !rule.replacement.includes("$");
    return (scope === "word" || scope === "both") && isLiteralPattern && isLiteralReplacement;
}
// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------
const DEFAULT_STRESS_RULES = {
    primary: {
        type: "weight-sensitive",
        disyllabicWeights: [70, 30],
        polysyllabicWeights: {
            heavyPenult: 70,
            lightPenult: 30,
            antepenultHeavy: 20,
            antepenultLight: 60,
            initial: 10,
        },
    },
    secondary: {
        enabled: true,
        probability: 40,
        heavyWeight: 70,
        lightWeight: 30,
        candidateWindow: "first-three",
    },
    rhythmic: {
        enabled: true,
        probability: 40,
        requireUnstressedNeighbors: true,
    },
    nucleus: {},
};
const DEFAULT_ASPIRATION_RULES = {
    enabled: true,
    targets: [
        {
            segment: "onset",
            index: 0,
            manner: ["stop"],
            voiced: false,
        },
    ],
    rules: [
        { id: "post-s", when: { previousCodaSounds: ["s"] }, probability: 5 },
        { id: "word-initial", when: { wordInitial: true }, probability: 95 },
        { id: "stressed-onset", when: { stressed: true }, probability: 90 },
        { id: "post-stressed", when: { postStressed: true }, probability: 50 },
    ],
    fallbackProbability: 30,
};
export function resolveStressRules(rules) {
    return {
        primary: rules.primary,
        secondary: {
            enabled: rules.secondary.enabled ?? DEFAULT_STRESS_RULES.secondary.enabled,
            probability: rules.secondary.probability ?? DEFAULT_STRESS_RULES.secondary.probability,
            heavyWeight: rules.secondary.heavyWeight ?? DEFAULT_STRESS_RULES.secondary.heavyWeight,
            lightWeight: rules.secondary.lightWeight ?? DEFAULT_STRESS_RULES.secondary.lightWeight,
            candidateWindow: rules.secondary.candidateWindow ?? DEFAULT_STRESS_RULES.secondary.candidateWindow,
        },
        rhythmic: {
            enabled: rules.rhythmic.enabled ?? DEFAULT_STRESS_RULES.rhythmic.enabled,
            probability: rules.rhythmic.probability ?? DEFAULT_STRESS_RULES.rhythmic.probability,
            requireUnstressedNeighbors: rules.rhythmic.requireUnstressedNeighbors
                ?? DEFAULT_STRESS_RULES.rhythmic.requireUnstressedNeighbors,
        },
        nucleus: {
            stressedNucleusBan: rules.nucleus.stressedNucleusBan
                ? [...rules.nucleus.stressedNucleusBan]
                : undefined,
            unstressedNucleusBoost: rules.nucleus.unstressedNucleusBoost
                ? { ...rules.nucleus.unstressedNucleusBoost }
                : undefined,
        },
    };
}
/**
 * Resolve aspiration config into fully-populated deterministic rules.
 */
export function resolveAspirationRules(rules) {
    if (!rules) {
        return {
            enabled: DEFAULT_ASPIRATION_RULES.enabled,
            targets: DEFAULT_ASPIRATION_RULES.targets.map((t) => ({ ...t, sounds: t.sounds ? [...t.sounds] : undefined, manner: t.manner ? [...t.manner] : undefined, place: t.place ? [...t.place] : undefined })),
            rules: DEFAULT_ASPIRATION_RULES.rules.map((r) => ({
                id: r.id,
                probability: r.probability,
                when: {
                    ...r.when,
                    previousCodaSounds: r.when.previousCodaSounds ? [...r.when.previousCodaSounds] : undefined,
                },
            })),
            fallbackProbability: DEFAULT_ASPIRATION_RULES.fallbackProbability,
        };
    }
    return {
        enabled: rules.enabled ?? DEFAULT_ASPIRATION_RULES.enabled,
        targets: (rules.targets && rules.targets.length > 0 ? rules.targets : DEFAULT_ASPIRATION_RULES.targets)
            .map((target) => ({
            ...target,
            sounds: target.sounds ? [...target.sounds] : undefined,
            manner: target.manner ? [...target.manner] : undefined,
            place: target.place ? [...target.place] : undefined,
        })),
        rules: (rules.rules && rules.rules.length > 0 ? rules.rules : DEFAULT_ASPIRATION_RULES.rules)
            .map((rule) => ({
            id: rule.id,
            probability: rule.probability,
            when: {
                ...rule.when,
                previousCodaSounds: rule.when.previousCodaSounds ? [...rule.when.previousCodaSounds] : undefined,
            },
        })),
        fallbackProbability: rules.fallbackProbability ?? DEFAULT_ASPIRATION_RULES.fallbackProbability,
    };
}
function toBoundaryPairKey(codaSound, onsetSound) {
    return `${codaSound}|${onsetSound}`;
}
function splitBoundaryPairKey(key) {
    const [coda, onset] = key.split("|");
    return [coda, onset];
}
function matchesBoundarySelector(phoneme, selector) {
    if (selector.sounds && !selector.sounds.includes(phoneme.sound))
        return false;
    if (selector.manner && !selector.manner.includes(phoneme.mannerOfArticulation))
        return false;
    if (selector.place && !selector.place.includes(phoneme.placeOfArticulation))
        return false;
    if (selector.voiced !== undefined && selector.voiced !== phoneme.voiced)
        return false;
    return true;
}
function matchesBoundaryRelation(coda, onset, relation) {
    if (!relation)
        return true;
    if (relation.place) {
        const isSamePlace = coda.placeOfArticulation === onset.placeOfArticulation;
        if ((relation.place === "same" && !isSamePlace) || (relation.place === "different" && isSamePlace)) {
            return false;
        }
    }
    if (relation.voiced) {
        const isSameVoicing = coda.voiced === onset.voiced;
        if ((relation.voiced === "same" && !isSameVoicing) || (relation.voiced === "different" && isSameVoicing)) {
            return false;
        }
    }
    return true;
}
function uniquePositionPhonemes(positionMap) {
    return Array.from(positionMap.values())
        .flat()
        .filter((phoneme, idx, phonemes) => idx === phonemes.findIndex(p => p.sound === phoneme.sound &&
        p.mannerOfArticulation === phoneme.mannerOfArticulation &&
        p.placeOfArticulation === phoneme.placeOfArticulation &&
        p.voiced === phoneme.voiced));
}
function expandBoundaryRule(rule, codaInventory, onsetInventory) {
    const matchedCodas = codaInventory.filter(p => matchesBoundarySelector(p, rule.coda));
    const matchedOnsets = onsetInventory.filter(p => matchesBoundarySelector(p, rule.onset));
    const expanded = new Set();
    if (rule.mode === "ban") {
        for (const coda of matchedCodas) {
            for (const onset of matchedOnsets) {
                if (!matchesBoundaryRelation(coda, onset, rule.relation))
                    continue;
                expanded.add(toBoundaryPairKey(coda.sound, onset.sound));
            }
        }
    }
    else {
        const allowed = new Set();
        for (const coda of matchedCodas) {
            for (const onset of matchedOnsets) {
                if (!matchesBoundaryRelation(coda, onset, rule.relation))
                    continue;
                allowed.add(toBoundaryPairKey(coda.sound, onset.sound));
            }
        }
        for (const coda of matchedCodas) {
            for (const onset of onsetInventory) {
                const key = toBoundaryPairKey(coda.sound, onset.sound);
                if (!allowed.has(key))
                    expanded.add(key);
            }
        }
    }
    for (const [codaSound, onsetSound] of rule.except ?? []) {
        expanded.delete(toBoundaryPairKey(codaSound, onsetSound));
    }
    return expanded;
}
/**
 * Expand cluster-constraint rules into concrete [coda, onset] banned pairs.
 *
 * This is done at runtime build time, so rules naturally pick up newly added
 * onset/coda phonemes without manually editing pair lists.
 */
export function expandClusterConstraintBans(config) {
    const constraint = config.clusterConstraint;
    if (!constraint)
        return [];
    const expanded = new Set();
    for (const [codaSound, onsetSound] of constraint.banned ?? []) {
        expanded.add(toBoundaryPairKey(codaSound, onsetSound));
    }
    if (constraint.rules && constraint.rules.length > 0) {
        const codaInventory = uniquePositionPhonemes(config.phonemeMaps.coda);
        const onsetInventory = uniquePositionPhonemes(config.phonemeMaps.onset);
        for (const rule of constraint.rules) {
            const rulePairs = expandBoundaryRule(rule, codaInventory, onsetInventory);
            for (const pairKey of rulePairs)
                expanded.add(pairKey);
        }
    }
    return Array.from(expanded)
        .map(splitBoundaryPairKey)
        .sort(([codaA, onsetA], [codaB, onsetB]) => {
        if (codaA < codaB)
            return -1;
        if (codaA > codaB)
            return 1;
        if (onsetA < onsetB)
            return -1;
        if (onsetA > onsetB)
            return 1;
        return 0;
    });
}
/**
 * Validate a LanguageConfig, throwing on any detected inconsistency.
 *
 * Checks:
 * - `phonemes[]` contains every phoneme reachable through `phonemeMaps`
 * - `graphemes[]` contains every grapheme reachable through `graphemeMaps`
 * - All probability values in `generationWeights` are in [0, 100]
 *
 * Call this during development or at startup to catch config errors early.
 */
export function validateConfig(config) {
    // Check phonemes ⊇ phonemeMaps values
    const phonemeSet = new Set(config.phonemes);
    for (const position of ["onset", "nucleus", "coda"]) {
        for (const [sound, list] of config.phonemeMaps[position]) {
            for (const p of list) {
                if (!phonemeSet.has(p)) {
                    throw new Error(`phonemeMaps.${position} contains phoneme "${p.sound}" (key "${sound}") not found in phonemes[]`);
                }
            }
        }
    }
    // Check graphemes ⊇ graphemeMaps values
    const graphemeSet = new Set(config.graphemes);
    for (const position of ["onset", "nucleus", "coda"]) {
        for (const [sound, list] of config.graphemeMaps[position]) {
            for (const g of list) {
                if (!graphemeSet.has(g)) {
                    throw new Error(`graphemeMaps.${position} contains grapheme "${g.form}" (key "${sound}") not found in graphemes[]`);
                }
            }
        }
    }
    // Check probability values in range
    const { probability } = config.generationWeights;
    for (const [key, value] of Object.entries(probability)) {
        if (value < 0 || value > 100) {
            throw new Error(`generationWeights.probability.${key} is ${value}, must be in [0, 100]`);
        }
    }
    for (const [key, value] of Object.entries(config.generationWeights.boundaryPolicy)) {
        if (value < 0 || value > 100) {
            throw new Error(`generationWeights.boundaryPolicy.${key} is ${value}, must be in [0, 100]`);
        }
    }
    if (!config.pronunciation) {
        throw new Error("pronunciation config is required");
    }
    if (!config.pronunciation.stress) {
        throw new Error("pronunciation.stress is required");
    }
    const assertProbability = (value, label) => {
        if (!Number.isFinite(value) || value < 0 || value > 100) {
            throw new Error(`${label} is ${String(value)}, must be in [0, 100]`);
        }
    };
    const assertAllowedKeys = (obj, allowed, label) => {
        for (const key of Object.keys(obj)) {
            if (!allowed.includes(key)) {
                throw new Error(`${label} has unsupported field "${key}"`);
            }
        }
    };
    const stress = config.pronunciation.stress;
    const primary = stress.primary;
    const primaryType = primary.type;
    if (primaryType !== "fixed"
        && primaryType !== "initial"
        && primaryType !== "penultimate"
        && primaryType !== "weight-sensitive"
        && primaryType !== "ot") {
        throw new Error(`pronunciation.stress.primary.type has invalid value "${String(primaryType)}"`);
    }
    if (primaryType === "fixed") {
        assertAllowedKeys(primary, ["type", "fixedPosition"], "pronunciation.stress.primary");
        const fixedPosition = primary.fixedPosition;
        if (!Number.isInteger(fixedPosition) || fixedPosition < 0) {
            throw new Error("pronunciation.stress.primary.fixedPosition must be an integer >= 0");
        }
    }
    else if (primaryType === "initial" || primaryType === "penultimate") {
        assertAllowedKeys(primary, ["type"], "pronunciation.stress.primary");
    }
    else if (primaryType === "weight-sensitive") {
        assertAllowedKeys(primary, ["type", "disyllabicWeights", "polysyllabicWeights"], "pronunciation.stress.primary");
        const disyllabic = primary.disyllabicWeights;
        if (!Array.isArray(disyllabic) || disyllabic.length !== 2) {
            throw new Error("pronunciation.stress.primary.disyllabicWeights must be a [number, number] tuple");
        }
        for (let i = 0; i < disyllabic.length; i++) {
            const weight = disyllabic[i];
            if (typeof weight !== "number") {
                throw new Error(`pronunciation.stress.primary.disyllabicWeights[${i}] must be a number`);
            }
        }
        const poly = primary.polysyllabicWeights;
        if (!poly) {
            throw new Error("pronunciation.stress.primary.polysyllabicWeights is required for weight-sensitive");
        }
        assertAllowedKeys(poly, ["heavyPenult", "lightPenult", "antepenultHeavy", "antepenultLight", "initial"], "pronunciation.stress.primary.polysyllabicWeights");
        for (const key of ["heavyPenult", "lightPenult", "antepenultHeavy", "antepenultLight", "initial"]) {
            const weight = poly[key];
            if (typeof weight !== "number") {
                throw new Error(`pronunciation.stress.primary.polysyllabicWeights.${key} must be a number`);
            }
        }
    }
    else if (primaryType === "ot") {
        assertAllowedKeys(primary, ["type", "otConfig"], "pronunciation.stress.primary");
        if (!primary.otConfig || typeof primary.otConfig !== "object") {
            throw new Error("pronunciation.stress.primary.otConfig is required for ot strategy");
        }
    }
    if (!stress.secondary || typeof stress.secondary !== "object") {
        throw new Error("pronunciation.stress.secondary is required");
    }
    if (!stress.rhythmic || typeof stress.rhythmic !== "object") {
        throw new Error("pronunciation.stress.rhythmic is required");
    }
    if (!stress.nucleus || typeof stress.nucleus !== "object") {
        throw new Error("pronunciation.stress.nucleus is required");
    }
    assertAllowedKeys(stress.secondary, ["enabled", "probability", "heavyWeight", "lightWeight", "candidateWindow"], "pronunciation.stress.secondary");
    assertAllowedKeys(stress.rhythmic, ["enabled", "probability", "requireUnstressedNeighbors"], "pronunciation.stress.rhythmic");
    assertAllowedKeys(stress.nucleus, ["stressedNucleusBan", "unstressedNucleusBoost"], "pronunciation.stress.nucleus");
    assertProbability(stress.secondary.probability, "pronunciation.stress.secondary.probability");
    assertProbability(stress.rhythmic.probability, "pronunciation.stress.rhythmic.probability");
    if (stress.secondary.candidateWindow !== "first-three"
        && stress.secondary.candidateWindow !== "all-nonprimary") {
        throw new Error(`pronunciation.stress.secondary.candidateWindow has invalid value "${String(stress.secondary.candidateWindow)}"`);
    }
    if (stress.nucleus.stressedNucleusBan) {
        for (const [idx, sound] of stress.nucleus.stressedNucleusBan.entries()) {
            if (!sound) {
                throw new Error(`pronunciation.stress.nucleus.stressedNucleusBan[${idx}] must be non-empty`);
            }
        }
    }
    if (stress.nucleus.unstressedNucleusBoost) {
        for (const [sound, boost] of Object.entries(stress.nucleus.unstressedNucleusBoost)) {
            if (!sound) {
                throw new Error("pronunciation.stress.nucleus.unstressedNucleusBoost has an empty sound key");
            }
            if (!Number.isFinite(boost) || boost < 0) {
                throw new Error(`pronunciation.stress.nucleus.unstressedNucleusBoost.${sound} must be >= 0`);
            }
        }
    }
    const aspiration = config.pronunciation.aspiration;
    if (aspiration) {
        assertAllowedKeys(aspiration, ["enabled", "targets", "rules", "fallbackProbability"], "pronunciation.aspiration");
        assertProbability(aspiration.fallbackProbability, "pronunciation.aspiration.fallbackProbability");
        if (!Array.isArray(aspiration.targets) || aspiration.targets.length === 0) {
            throw new Error("pronunciation.aspiration.targets must contain at least one selector");
        }
        aspiration.targets.forEach((target, targetIndex) => {
            assertAllowedKeys(target, ["segment", "index", "sounds", "manner", "place", "voiced"], `pronunciation.aspiration.targets[${targetIndex}]`);
            if (!["onset", "nucleus", "coda"].includes(target.segment)) {
                throw new Error(`pronunciation.aspiration.targets[${targetIndex}].segment has invalid value "${String(target.segment)}"`);
            }
            if (target.index != null && (!Number.isInteger(target.index) || target.index < 0)) {
                throw new Error(`pronunciation.aspiration.targets[${targetIndex}].index must be an integer >= 0`);
            }
            if (target.sounds && target.sounds.some((sound) => !sound)) {
                throw new Error(`pronunciation.aspiration.targets[${targetIndex}].sounds must not contain empty values`);
            }
        });
        if (!Array.isArray(aspiration.rules) || aspiration.rules.length === 0) {
            throw new Error("pronunciation.aspiration.rules must contain at least one rule");
        }
        const seenRuleIds = new Set();
        aspiration.rules.forEach((rule, ruleIndex) => {
            assertAllowedKeys(rule, ["id", "when", "probability"], `pronunciation.aspiration.rules[${ruleIndex}]`);
            if (!rule.id || typeof rule.id !== "string") {
                throw new Error(`pronunciation.aspiration.rules[${ruleIndex}].id must be a non-empty string`);
            }
            if (seenRuleIds.has(rule.id)) {
                throw new Error(`pronunciation.aspiration.rules has duplicate id "${rule.id}"`);
            }
            seenRuleIds.add(rule.id);
            assertProbability(rule.probability, `pronunciation.aspiration.rules[${ruleIndex}].probability`);
            assertAllowedKeys(rule.when, ["wordInitial", "stressed", "postStressed", "syllableIndexClass", "previousCodaSounds"], `pronunciation.aspiration.rules[${ruleIndex}].when`);
            if (rule.when.syllableIndexClass != null
                && !["initial", "medial", "final"].includes(rule.when.syllableIndexClass)) {
                throw new Error(`pronunciation.aspiration.rules[${ruleIndex}].when.syllableIndexClass has invalid value "${String(rule.when.syllableIndexClass)}"`);
            }
            if (rule.when.previousCodaSounds) {
                if (rule.when.previousCodaSounds.length === 0) {
                    throw new Error(`pronunciation.aspiration.rules[${ruleIndex}].when.previousCodaSounds must not be empty`);
                }
                if (rule.when.previousCodaSounds.some((sound) => !sound)) {
                    throw new Error(`pronunciation.aspiration.rules[${ruleIndex}].when.previousCodaSounds must not contain empty values`);
                }
            }
        });
    }
    const phonemeSounds = new Set(config.phonemes.map(p => p.sound));
    const onsetSounds = new Set(config.phonemeMaps.onset.keys());
    const nucleusSounds = new Set(config.phonemeMaps.nucleus.keys());
    const codaSounds = new Set(config.phonemeMaps.coda.keys());
    const gapSpellingVariantKeys = new Set();
    for (let i = 0; i < (config.gapSpellings?.length ?? 0); i++) {
        const gapSpelling = config.gapSpellings[i];
        if (!gapSpelling.name || typeof gapSpelling.name !== "string") {
            throw new Error(`gapSpellings[${i}].name must be a non-empty string`);
        }
        if (!Array.isArray(gapSpelling.phonemes) || gapSpelling.phonemes.length === 0) {
            throw new Error(`gapSpellings[${i}].phonemes must be a non-empty array`);
        }
        for (let j = 0; j < gapSpelling.phonemes.length; j++) {
            const sound = gapSpelling.phonemes[j];
            if (!sound) {
                throw new Error(`gapSpellings[${i}].phonemes[${j}] must be non-empty`);
            }
            if (!phonemeSounds.has(sound)) {
                throw new Error(`gapSpellings[${i}].phonemes[${j}] contains unknown phoneme "${sound}"`);
            }
        }
        if (!gapSpelling.replacement || typeof gapSpelling.replacement !== "string") {
            throw new Error(`gapSpellings[${i}].replacement must be a non-empty string`);
        }
        if (gapSpelling.weight !== undefined && (!Number.isFinite(gapSpelling.weight) || gapSpelling.weight <= 0)) {
            throw new Error(`gapSpellings[${i}].weight must be a finite number > 0`);
        }
        if (gapSpelling.targetLayer !== "grapheme"
            && gapSpelling.targetLayer !== "spellingRule"
            && gapSpelling.targetLayer !== "phonotactics"
            && gapSpelling.targetLayer !== "morphology"
            && gapSpelling.targetLayer !== "unknown") {
            throw new Error(`gapSpellings[${i}].targetLayer must be one of grapheme|spellingRule|phonotactics|morphology|unknown`);
        }
        const gapKey = gapSpelling.phonemes.join("\u0001");
        const variantKey = [
            gapKey,
            gapSpelling.replacement,
        ].join("\u0001");
        if (gapSpellingVariantKeys.has(variantKey)) {
            throw new Error(`gapSpellings has duplicate variant for "${gapSpelling.name}"`);
        }
        gapSpellingVariantKeys.add(variantKey);
    }
    for (let i = 0; i < (config.spellingRules?.length ?? 0); i++) {
        const rule = config.spellingRules[i];
        if (isWholeWordAnchoredSpellingRule(rule)) {
            throw new Error(`spellingRules[${i}] (${rule.name}) must not use whole-word anchored patterns; move lexical rewrites to gapSpellings`);
        }
    }
    const assertKnownPositionSound = (sound, position, label) => {
        const lookup = position === "onset"
            ? onsetSounds
            : position === "nucleus"
                ? nucleusSounds
                : codaSounds;
        if (!lookup.has(sound)) {
            throw new Error(`${label} contains unknown ${position} phoneme "${sound}"`);
        }
    };
    if (aspiration) {
        aspiration.targets.forEach((target, targetIndex) => {
            if (!target.sounds)
                return;
            if (target.sounds.length === 0) {
                throw new Error(`pronunciation.aspiration.targets[${targetIndex}].sounds must not be empty`);
            }
            for (const sound of target.sounds) {
                assertKnownPositionSound(sound, target.segment, `pronunciation.aspiration.targets[${targetIndex}].sounds`);
            }
        });
        aspiration.rules.forEach((rule, ruleIndex) => {
            for (const sound of rule.when.previousCodaSounds ?? []) {
                assertKnownPositionSound(sound, "coda", `pronunciation.aspiration.rules[${ruleIndex}].when.previousCodaSounds`);
            }
        });
    }
    const validateBridgeOnsets = (pairs, label) => {
        for (const [sound, weight] of pairs) {
            if (!sound) {
                throw new Error(`${label} contains an empty sound`);
            }
            if (!phonemeSounds.has(sound)) {
                throw new Error(`${label} contains unknown phoneme "${sound}"`);
            }
            if (!Number.isFinite(weight) || weight <= 0) {
                throw new Error(`${label} has invalid weight ${String(weight)} for "${sound}" (must be > 0)`);
            }
        }
    };
    if (config.hiatusPolicy) {
        const guard = config.hiatusPolicy.planGuardProbability;
        if (guard < 0 || guard > 100) {
            throw new Error(`hiatusPolicy.planGuardProbability is ${guard}, must be in [0, 100]`);
        }
        const glideMultiplier = config.hiatusPolicy.postVowelGlideMultiplier;
        if (!Number.isFinite(glideMultiplier) || glideMultiplier < 0) {
            throw new Error(`hiatusPolicy.postVowelGlideMultiplier is ${String(glideMultiplier)}, must be a finite number >= 0`);
        }
        validateBridgeOnsets(config.hiatusPolicy.fallbackBridgeOnsets, "hiatusPolicy.fallbackBridgeOnsets");
    }
    if (config.morphology?.boundaryPolicy?.fallbackBridgeOnsets) {
        validateBridgeOnsets(config.morphology.boundaryPolicy.fallbackBridgeOnsets, "morphology.boundaryPolicy.fallbackBridgeOnsets");
    }
    const validatePhonologicalCondition = (condition, label) => {
        if (condition.position !== "preceding" && condition.position !== "following") {
            throw new Error(`${label}.position has invalid value "${String(condition.position)}"`);
        }
        if (condition.sounds) {
            if (condition.sounds.length === 0) {
                throw new Error(`${label}.sounds must not be empty`);
            }
            for (const sound of condition.sounds) {
                if (!sound) {
                    throw new Error(`${label}.sounds must not contain empty values`);
                }
                if (!phonemeSounds.has(sound)) {
                    throw new Error(`${label}.sounds contains unknown phoneme "${sound}"`);
                }
            }
        }
        if (condition.manner && condition.manner.length === 0) {
            throw new Error(`${label}.manner must not be empty`);
        }
        if (condition.place && condition.place.length === 0) {
            throw new Error(`${label}.place must not be empty`);
        }
    };
    const validateMorphophonemicRule = (affix, rule, label) => {
        if (!rule.name || typeof rule.name !== "string") {
            throw new Error(`${label}.name must be a non-empty string`);
        }
        if (rule.priority != null && (!Number.isFinite(rule.priority) || rule.priority < 0)) {
            throw new Error(`${label}.priority must be a finite number >= 0`);
        }
        if (rule.target != null && rule.target !== "edge" && rule.target !== "nucleus") {
            throw new Error(`${label}.target has invalid value "${String(rule.target)}"`);
        }
        if (rule.replaceSound && !phonemeSounds.has(rule.replaceSound)) {
            throw new Error(`${label}.replaceSound contains unknown phoneme "${rule.replaceSound}"`);
        }
        const hasWrittenMatch = rule.writtenMatch instanceof RegExp;
        const hasWrittenReplace = typeof rule.writtenReplace === "string";
        if (hasWrittenMatch !== hasWrittenReplace) {
            throw new Error(`${label} must provide both writtenMatch and writtenReplace together`);
        }
        if (!rule.replaceSound && !hasWrittenMatch) {
            throw new Error(`${label} must define at least one action (replaceSound or written rewrite)`);
        }
        if (rule.phonologicalCondition) {
            validatePhonologicalCondition(rule.phonologicalCondition, `${label}.phonologicalCondition`);
            const expectedPosition = affix.type === "suffix" ? "preceding" : "following";
            if (rule.phonologicalCondition.position !== expectedPosition) {
                throw new Error(`${label}.phonologicalCondition.position must be "${expectedPosition}" for ${affix.type} rules`);
            }
        }
    };
    if (config.morphology) {
        if (config.morphology.enabled) {
            for (const mode of ["text", "lexicon"]) {
                const weights = config.morphology.templateWeights[mode];
                const entries = [
                    ["bare", weights.bare],
                    ["suffixed", weights.suffixed],
                    ["prefixed", weights.prefixed],
                    ["both", weights.both],
                ];
                let totalWeight = 0;
                for (const [template, weight] of entries) {
                    if (!Number.isFinite(weight) || weight < 0) {
                        throw new Error(`morphology.templateWeights.${mode}.${template} must be a finite number >= 0`);
                    }
                    totalWeight += weight;
                }
                if (!Number.isFinite(totalWeight) || totalWeight <= 0) {
                    throw new Error(`morphology.templateWeights.${mode} must have positive total weight`);
                }
                if (weights.prefixed > 0 && config.morphology.prefixes.length === 0) {
                    throw new Error(`morphology.templateWeights.${mode}.prefixed requires at least one morphology.prefixes entry`);
                }
                if (weights.suffixed > 0 && config.morphology.suffixes.length === 0) {
                    throw new Error(`morphology.templateWeights.${mode}.suffixed requires at least one morphology.suffixes entry`);
                }
                if (weights.both > 0 && config.morphology.prefixes.length === 0) {
                    throw new Error(`morphology.templateWeights.${mode}.both requires at least one morphology.prefixes entry`);
                }
                if (weights.both > 0 && config.morphology.suffixes.length === 0) {
                    throw new Error(`morphology.templateWeights.${mode}.both requires at least one morphology.suffixes entry`);
                }
            }
        }
        for (let i = 0; i < config.morphology.prefixes.length; i++) {
            const affix = config.morphology.prefixes[i];
            if (!affix.morphophonemicRules)
                continue;
            for (let j = 0; j < affix.morphophonemicRules.length; j++) {
                validateMorphophonemicRule(affix, affix.morphophonemicRules[j], `morphology.prefixes[${i}].morphophonemicRules[${j}]`);
            }
        }
        for (let i = 0; i < config.morphology.suffixes.length; i++) {
            const affix = config.morphology.suffixes[i];
            if (!affix.morphophonemicRules)
                continue;
            for (let j = 0; j < affix.morphophonemicRules.length; j++) {
                validateMorphophonemicRule(affix, affix.morphophonemicRules[j], `morphology.suffixes[${i}].morphophonemicRules[${j}]`);
            }
        }
    }
    if (config.clusterConstraint?.banned) {
        for (const [codaSound, onsetSound] of config.clusterConstraint.banned) {
            assertKnownPositionSound(codaSound, "coda", "clusterConstraint.banned");
            assertKnownPositionSound(onsetSound, "onset", "clusterConstraint.banned");
        }
    }
    if (config.clusterConstraint?.rules) {
        config.clusterConstraint.rules.forEach((rule, index) => {
            for (const sound of rule.coda.sounds ?? []) {
                assertKnownPositionSound(sound, "coda", `clusterConstraint.rules[${index}].coda.sounds`);
            }
            for (const sound of rule.onset.sounds ?? []) {
                assertKnownPositionSound(sound, "onset", `clusterConstraint.rules[${index}].onset.sounds`);
            }
            for (const [codaSound, onsetSound] of rule.except ?? []) {
                assertKnownPositionSound(codaSound, "coda", `clusterConstraint.rules[${index}].except`);
                assertKnownPositionSound(onsetSound, "onset", `clusterConstraint.rules[${index}].except`);
            }
        });
    }
    // Top-down phoneme length weights are required for both modes.
    if (!config.phonemeLengthWeights?.text?.length) {
        throw new Error("phonemeLengthWeights.text is required and must be non-empty");
    }
    if (!config.phonemeLengthWeights?.lexicon?.length) {
        throw new Error("phonemeLengthWeights.lexicon is required and must be non-empty");
    }
    if (!config.phonemeToSyllableWeights?.text || Object.keys(config.phonemeToSyllableWeights.text).length === 0) {
        throw new Error("phonemeToSyllableWeights.text is required and must be non-empty");
    }
    if (!config.phonemeToSyllableWeights?.lexicon || Object.keys(config.phonemeToSyllableWeights.lexicon).length === 0) {
        throw new Error("phonemeToSyllableWeights.lexicon is required and must be non-empty");
    }
    const validateWeightedPairs = (pairs, label, keyType = "phoneme") => {
        let total = 0;
        for (const [value, weight] of pairs) {
            if (!Number.isFinite(value) || !Number.isInteger(value) || value < 1) {
                throw new Error(`${label} has invalid ${keyType} key "${value}" (must be integer >= 1)`);
            }
            if (!Number.isFinite(weight) || weight <= 0) {
                throw new Error(`${label} has invalid weight "${weight}" for ${value} (must be > 0)`);
            }
            total += weight;
        }
        if (total <= 0) {
            throw new Error(`${label} has zero total weight`);
        }
    };
    validateWeightedPairs(config.phonemeLengthWeights.text, "phonemeLengthWeights.text");
    validateWeightedPairs(config.phonemeLengthWeights.lexicon, "phonemeLengthWeights.lexicon");
    for (const mode of ["text", "lexicon"]) {
        const phonemeLengthSet = new Set(config.phonemeLengthWeights[mode].map(([phonemeCount]) => phonemeCount));
        for (const [phonemeCountStr, weights] of Object.entries(config.phonemeToSyllableWeights[mode])) {
            const phonemeCount = Number(phonemeCountStr);
            if (!Number.isInteger(phonemeCount) || phonemeCount < 1) {
                throw new Error(`phonemeToSyllableWeights.${mode} has invalid phoneme length key "${phonemeCountStr}"`);
            }
            if (!Array.isArray(weights) || weights.length === 0) {
                throw new Error(`phonemeToSyllableWeights.${mode}.${phonemeCount} must be a non-empty array`);
            }
            validateWeightedPairs(weights, `phonemeToSyllableWeights.${mode}.${phonemeCount}`, "syllable");
        }
        for (const phonemeCount of phonemeLengthSet) {
            if (!config.phonemeToSyllableWeights[mode][phonemeCount]) {
                throw new Error(`phonemeToSyllableWeights.${mode}.${phonemeCount} is required because phonemeLengthWeights.${mode} includes ${phonemeCount}`);
            }
        }
    }
}
/**
 * Compute sonority levels for every phoneme from the language config's
 * sonority hierarchy. This guarantees levels stay consistent with the
 * hierarchy — no stale cache possible.
 */
export function computeSonorityLevels(config) {
    const { mannerOfArticulation, placeOfArticulation, voicedBonus, tenseBonus } = config.sonorityHierarchy;
    return new Map(config.phonemes.map((p) => [
        p,
        (mannerOfArticulation[p.mannerOfArticulation] ?? 0) +
            (placeOfArticulation[p.placeOfArticulation] ?? 0) +
            (p.voiced ? voicedBonus : 0) +
            (p.tense ? tenseBonus : 0),
    ]));
}
/**
 * Coarse manner-only sonority rank for a phoneme.
 *
 * Returns the manner-of-articulation component from the language config's
 * sonority hierarchy, without place/voicing/tense adjustments. This groups
 * all stops together, all fricatives together, etc.
 *
 * Used for SSP validation at syllable boundaries where manner *class* matters
 * more than fine-grained place distinctions. (All stops are equally bad in a
 * three-stop cluster like /kt.p/, regardless of which places are involved.)
 */
export function sonorityClass(p, config) {
    return config.sonorityHierarchy.mannerOfArticulation[p.mannerOfArticulation] ?? 0;
}
