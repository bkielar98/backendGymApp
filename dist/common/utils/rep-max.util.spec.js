"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const rep_max_util_1 = require("./rep-max.util");
(0, globals_1.describe)('calculateBrzyckiRepMax', () => {
    (0, globals_1.it)('uses the Brzycki formula for one rep max', () => {
        (0, globals_1.expect)((0, rep_max_util_1.calculateBrzyckiRepMax)(80, 5)).toBe(90);
        (0, globals_1.expect)((0, rep_max_util_1.calculateBrzyckiRepMax)(90, 8)).toBe(111.72);
    });
    (0, globals_1.it)('returns null for invalid or unsupported values', () => {
        (0, globals_1.expect)((0, rep_max_util_1.calculateBrzyckiRepMax)(0, 5)).toBeNull();
        (0, globals_1.expect)((0, rep_max_util_1.calculateBrzyckiRepMax)(80, 0)).toBeNull();
        (0, globals_1.expect)((0, rep_max_util_1.calculateBrzyckiRepMax)(80, 37)).toBeNull();
        (0, globals_1.expect)((0, rep_max_util_1.calculateBrzyckiRepMax)(80, 50)).toBeNull();
    });
});
//# sourceMappingURL=rep-max.util.spec.js.map