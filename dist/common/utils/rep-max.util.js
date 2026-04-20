"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateBrzyckiRepMax = calculateBrzyckiRepMax;
function calculateBrzyckiRepMax(weight, reps) {
    if (typeof weight !== 'number' ||
        typeof reps !== 'number' ||
        weight <= 0 ||
        reps <= 0 ||
        reps >= 37) {
        return null;
    }
    const repMax = weight * (36 / (37 - reps));
    return Math.round(repMax * 100) / 100;
}
//# sourceMappingURL=rep-max.util.js.map