const express = require("express");

module.exports = function ensureAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.role === "admin") {
        return next(); 
    } else {
        res.status(403).send("Access denied"); 
    }
}