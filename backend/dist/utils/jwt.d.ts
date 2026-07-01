interface TokenPayload {
    userId: string;
    role: string;
}
export declare function signAccessToken(payload: TokenPayload): string;
export declare function signRefreshToken(payload: TokenPayload): string;
export declare function verifyToken(token: string): TokenPayload;
export {};
//# sourceMappingURL=jwt.d.ts.map