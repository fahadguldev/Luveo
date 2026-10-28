import jwt from 'jsonwebtoken';

export const verifyAdmin = (req, res, next) => {
    try {
        const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        if (!process.env.JWT_SECRET) {
            console.error("⛔ JWT_SECRET not configured");
            return res.status(500).json({ message: "Server configuration error" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role !== "admin") {
            return res.status(403).json({ message: "Forbidden: Admin access required" });
        }

        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({
            message: "Unauthorized: Invalid or expired token",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

export const verifyAuth = (req, res, next) => {
    try {
        const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Unauthorized: Please log in" });
        }

        if (!process.env.JWT_SECRET) {
            console.error("⛔ JWT_SECRET not configured");
            return res.status(500).json({ message: "Server configuration error" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({
            message: "Unauthorized: Invalid or expired token",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

export default verifyAdmin;
