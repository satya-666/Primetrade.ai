"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
process.on('unhandledRejection', (reason) => {
    console.error('UNHANDLED REJECTION:', reason);
});
require("express-async-errors");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const prisma_1 = __importDefault(require("./utils/prisma"));
const swagger_1 = require("./swagger");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const task_routes_1 = __importDefault(require("./routes/task.routes"));
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/api/health', (_req, res) => res.json({ success: true, message: 'OK' }));
app.use('/api/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec));
app.get('/api/debug/db', async (_req, res) => {
    try {
        await prisma_1.default.$queryRaw `SELECT 1 AS ok`;
        const count = await prisma_1.default.task.count();
        res.json({ success: true, dbConnected: true, taskCount: count });
    }
    catch (e) {
        res.status(500).json({ success: false, message: 'DB error', error: e.message, stack: e.stack?.split('\n').slice(0, 3) });
    }
});
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1/tasks', task_routes_1.default);
app.use(errorHandler_1.errorHandler);
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Swagger docs at http://localhost:${PORT}/api/docs`);
});
exports.default = app;
//# sourceMappingURL=index.js.map