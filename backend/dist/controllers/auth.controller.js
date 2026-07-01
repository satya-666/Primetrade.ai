"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.refresh = refresh;
exports.logout = logout;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = __importDefault(require("../utils/prisma"));
const jwt_1 = require("../utils/jwt");
const BCRYPT_ROUNDS = 10;
async function register(req, res) {
    const { email, password } = req.body;
    const existing = await prisma_1.default.user.findUnique({ where: { email } });
    if (existing) {
        res.status(409).json({ success: false, message: 'Email already registered', errors: [{ field: 'email', message: 'Email already in use' }] });
        return;
    }
    const passwordHash = await bcryptjs_1.default.hash(password, BCRYPT_ROUNDS);
    const user = await prisma_1.default.user.create({
        data: { email, passwordHash, role: 'user' },
    });
    const payload = { userId: user.id, role: user.role };
    const accessToken = (0, jwt_1.signAccessToken)(payload);
    const refreshToken = (0, jwt_1.signRefreshToken)(payload);
    res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: { accessToken, refreshToken, user: { id: user.id, email: user.email, role: user.role } },
    });
}
async function login(req, res) {
    const { email, password } = req.body;
    const user = await prisma_1.default.user.findUnique({ where: { email } });
    if (!user) {
        res.status(401).json({ success: false, message: 'Invalid credentials', errors: [{ message: 'Invalid email or password' }] });
        return;
    }
    const valid = await bcryptjs_1.default.compare(password, user.passwordHash);
    if (!valid) {
        res.status(401).json({ success: false, message: 'Invalid credentials', errors: [{ message: 'Invalid email or password' }] });
        return;
    }
    const payload = { userId: user.id, role: user.role };
    const accessToken = (0, jwt_1.signAccessToken)(payload);
    const refreshToken = (0, jwt_1.signRefreshToken)(payload);
    res.json({
        success: true,
        message: 'Login successful',
        data: { accessToken, refreshToken, user: { id: user.id, email: user.email, role: user.role } },
    });
}
async function refresh(req, res) {
    const { refreshToken } = req.body;
    try {
        const payload = (0, jwt_1.verifyToken)(refreshToken);
        const user = await prisma_1.default.user.findUnique({ where: { id: payload.userId } });
        if (!user) {
            res.status(401).json({ success: false, message: 'User not found', errors: [] });
            return;
        }
        const newPayload = { userId: user.id, role: user.role };
        const newAccessToken = (0, jwt_1.signAccessToken)(newPayload);
        const newRefreshToken = (0, jwt_1.signRefreshToken)(newPayload);
        res.json({
            success: true,
            message: 'Token refreshed',
            data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
        });
    }
    catch {
        res.status(401).json({ success: false, message: 'Invalid refresh token', errors: [] });
    }
}
async function logout(_req, res) {
    res.json({ success: true, message: 'Logged out successfully', data: null });
}
//# sourceMappingURL=auth.controller.js.map