"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const jwt_1 = require("../utils/jwt");
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ success: false, message: 'Authentication required', errors: [] });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const payload = (0, jwt_1.verifyToken)(token);
        req.user = { userId: payload.userId, role: payload.role };
        next();
    }
    catch {
        res.status(401).json({ success: false, message: 'Invalid or expired token', errors: [] });
    }
}
//# sourceMappingURL=authenticate.js.map