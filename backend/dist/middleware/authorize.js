"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = authorize;
function authorize(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({ success: false, message: 'Insufficient permissions', errors: [] });
            return;
        }
        next();
    };
}
//# sourceMappingURL=authorize.js.map