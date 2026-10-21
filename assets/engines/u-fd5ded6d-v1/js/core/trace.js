function snapshotSyllables(syllables) {
    return syllables.map(s => ({
        onset: s.onset.map(p => p.sound),
        nucleus: s.nucleus.map(p => p.sound),
        coda: s.coda.map(p => p.sound),
    }));
}
export class TraceCollector {
    stages = [];
    graphemeSelections = [];
    orthographyTrace;
    repairs = [];
    structural = [];
    morphologyTrace;
    currentBefore = new Map();
    beforeStage(name, syllables) {
        this.currentBefore.set(name, snapshotSyllables(syllables));
    }
    afterStage(name, syllables) {
        const before = this.currentBefore.get(name) ?? [];
        this.currentBefore.delete(name);
        this.stages.push({ name, before, after: snapshotSyllables(syllables) });
    }
    recordGraphemeSelection(entry) {
        this.graphemeSelections.push(entry);
    }
    recordStructural(entry) {
        this.structural.push(entry);
    }
    recordRepair(rule, before, after, detail) {
        if (before !== after) {
            this.repairs.push({ rule, before, after, detail });
        }
    }
    syllableCount = 0;
    targetPhonemeCount;
    syllablePlans;
    attempts = 0;
    toTrace(morphApplied) {
        return {
            syllableCount: this.syllableCount,
            targetPhonemeCount: this.targetPhonemeCount,
            syllablePlans: this.syllablePlans,
            attempts: this.attempts,
            morphology: this.morphologyTrace,
            structural: this.structural,
            stages: this.stages,
            graphemeSelections: this.graphemeSelections,
            orthography: this.orthographyTrace,
            repairs: this.repairs,
            summary: {
                totalDecisions: this.graphemeSelections.length,
                repairCount: this.repairs.length,
                morphologyApplied: morphApplied,
            },
        };
    }
}
