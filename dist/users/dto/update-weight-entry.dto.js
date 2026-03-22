"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateWeightEntryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_weight_entry_dto_1 = require("./create-weight-entry.dto");
class UpdateWeightEntryDto extends (0, swagger_1.PartialType)(create_weight_entry_dto_1.CreateWeightEntryDto) {
}
exports.UpdateWeightEntryDto = UpdateWeightEntryDto;
//# sourceMappingURL=update-weight-entry.dto.js.map