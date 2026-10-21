export function pearson(xs, ys) {
    if (xs.length !== ys.length || xs.length < 2)
        return 0;
    const n = xs.length;
    const mx = xs.reduce((a, b) => a + b, 0) / n;
    const my = ys.reduce((a, b) => a + b, 0) / n;
    let num = 0;
    let dx2 = 0;
    let dy2 = 0;
    for (let i = 0; i < n; i++) {
        const dx = xs[i] - mx;
        const dy = ys[i] - my;
        num += dx * dy;
        dx2 += dx * dx;
        dy2 += dy * dy;
    }
    if (dx2 === 0 || dy2 === 0)
        return 0;
    return num / Math.sqrt(dx2 * dy2);
}
export function toPercentMap(rawCounts) {
    const total = Object.values(rawCounts).reduce((a, b) => a + b, 0);
    const out = {};
    for (const [k, count] of Object.entries(rawCounts)) {
        out[k] = total > 0 ? (count / total) * 100 : 0;
    }
    return out;
}
export function computePhonemeQualityMetrics(generatedCounts, baselineCounts, minCommonBaselinePct) {
    const generatedPct = toPercentMap(generatedCounts);
    const baselinePct = toPercentMap(baselineCounts);
    const generatedKeys = new Set(Object.keys(generatedPct));
    const baselineKeys = new Set(Object.keys(baselinePct));
    const sharedKeys = [...generatedKeys].filter(k => baselineKeys.has(k));
    const generatedOnlyKeys = [...generatedKeys].filter(k => !baselineKeys.has(k));
    const nonCmuMassPct = generatedOnlyKeys.reduce((sum, k) => sum + generatedPct[k], 0);
    const sharedPearsonR = sharedKeys.length > 1
        ? pearson(sharedKeys.map(k => generatedPct[k]), sharedKeys.map(k => baselinePct[k]))
        : 0;
    const coverageAdjustedR = sharedPearsonR * (1 - nonCmuMassPct / 100);
    const commonShared = sharedKeys.filter(k => baselinePct[k] >= minCommonBaselinePct);
    const rows = commonShared.map((phoneme) => {
        const gen = generatedPct[phoneme] || 0;
        const base = baselinePct[phoneme] || 0;
        return {
            phoneme,
            generatedPct: gen,
            baselinePct: base,
            ratio: base > 0 ? gen / base : 0,
            gapPct: gen - base,
            absGapPct: Math.abs(gen - base),
        };
    });
    const generatedOnlyPhonemes = generatedOnlyKeys
        .map(phoneme => ({ phoneme, generatedPct: generatedPct[phoneme] }))
        .sort((a, b) => b.generatedPct - a.generatedPct);
    return {
        sharedKeyCount: sharedKeys.length,
        sharedPearsonR,
        nonCmuMassPct,
        coverageAdjustedR,
        generatedOnlyPhonemes,
        topOverRepresented: [...rows].sort((a, b) => b.ratio - a.ratio),
        topUnderRepresented: [...rows].sort((a, b) => a.ratio - b.ratio),
        topAbsoluteGap: [...rows].sort((a, b) => b.absGapPct - a.absGapPct),
    };
}
