export default class SetCoverer {
    private universeSize: number;
    private sets: number[][];
    private setWeights: number[];
    private isUniverseCoverable: boolean;

    constructor(universeSize: number, sets: number[][], setWeights: number[]) {
        this.universeSize = universeSize;
        this.sets = sets;
        this.setWeights = setWeights;
        this.isUniverseCoverable = this.checkIfUniverseCoverable();
    }


    /**
     * Checks if the entire universe can be covered by the given sets.
     * @returns {boolean} - True if the entire universe can be covered, false otherwise.
     */
    private checkIfUniverseCoverable(): boolean {
        const covered = new Array(this.universeSize).fill(false);

        for (const set of this.sets) {
            for (const element of set) {
                covered[element] = true;
            }
        }

        return covered.every(c => c);
    }

    /**
     * Getter for the isUniverseCoverable property.
     * @returns {boolean} - True if the entire universe can be covered, false otherwise.
     */
    public getUniverseCoverable(): boolean {
        return this.isUniverseCoverable;
    }

    /**
     * Finds the minimum set cover using dynamic programming or greedy approach based on heuristic.
     * @returns {{ minSetWeight: number, selectedSets: number[][] }} - The minimum set weight and selected sets.
     */
    public findMinSetCover(): { minSetWeight: number, selectedSets: number[][] } {
        const { universeSize, sets, setWeights } = this;
        const m = sets.length;
        const n = universeSize;
        
        // Heuristic threshold
        const threshold = 1e7; // Adjust the threshold as needed
        if (m * (1 << n) > threshold) {
            return this.findMinSetCoverGreedy();
        } else {
            return this.findMinSetCoverDP();
        }
    }

    /**
     * Finds the minimum set cover using dynamic programming.
     * @returns {{ minSetWeight: number, selectedSets: number[][] }} - The minimum set weight and selected sets.
     */
    public findMinSetCoverDP(): { minSetWeight: number, selectedSets: number[][] } {
        const { universeSize, sets, setWeights } = this;
        const m = sets.length;
        const dp: number[] = new Array(1 << universeSize).fill(Infinity); // dp[mask] = minimum weight to cover the elements at positions represented by mask
        const parent: number[] = new Array(1 << universeSize).fill(-1);
        const setUsed: number[] = new Array(1 << universeSize).fill(-1);

        dp[0] = 0;
            
        for (let mask = 0; mask < (1 << universeSize); mask++) {
            if (dp[mask] === Infinity) continue;

            for (let i = 0; i < sets.length; i++) {
                const s = sets[i];
                let newMask = mask;
                for (const element of s) {
                    newMask |= (1 << element);
                }

                if (dp[newMask] > dp[mask] + setWeights[i]) { // This selection is better
                    dp[newMask] = dp[mask] + setWeights[i];
                    parent[newMask] = mask;
                    setUsed[newMask] = i;
                }
            }
        }

        const minSetWeight = dp[(1 << universeSize) - 1];
        let selectedSets: number[][] = [];
        let mask = (1 << universeSize) - 1;

        while (mask !== 0) {
            const setIndex = setUsed[mask];
            if (setIndex === -1) break;
            selectedSets.push(sets[setIndex]);
            mask = parent[mask];
        }

        return { minSetWeight, selectedSets };
    }

    /**
     * Finds the minimum set cover using a greedy approach.
     * @returns {{ minSetWeight: number, selectedSets: number[][] }} - The minimum set weight and selected sets.
     */
    public findMinSetCoverGreedy(): { minSetWeight: number, selectedSets: number[][] } {
        const { universeSize, sets, setWeights } = this;
        const covered = new Array(universeSize).fill(false);
        let totalWeight = 0;
        const selectedSets: number[][] = [];

        while (covered.some(c => !c)) {
            let bestSetIndex = -1;
            let bestCostEffectiveness = Infinity;

            for (let i = 0; i < sets.length; i++) {
                const s = sets[i];
                let uncoveredCount = 0;

                for (const element of s) {
                    if (!covered[element]) {
                        uncoveredCount++;
                    }
                }

                const costEffectiveness = setWeights[i] / uncoveredCount;

                if (costEffectiveness < bestCostEffectiveness) {
                    bestCostEffectiveness = costEffectiveness;
                    bestSetIndex = i;
                }
            }

            if (bestSetIndex === -1) break;

            selectedSets.push(sets[bestSetIndex]);
            totalWeight += setWeights[bestSetIndex];

            for (const element of sets[bestSetIndex]) {
                covered[element] = true;
            }
        }

        return { minSetWeight: totalWeight, selectedSets };
    }
}
