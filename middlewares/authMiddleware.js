const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // Récupérer le header Authorization
    const authHeader = req.header('Authorization');

    // Vérifier si le header existe avant d'essayer de le manipuler
    if (!authHeader) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Extraire le token
    const token = authHeader.replace('Bearer ', '');

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

module.exports = authMiddleware;