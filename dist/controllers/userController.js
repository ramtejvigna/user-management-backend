var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Controller, Get, Post, Put, Delete, Middleware } from "@overnightjs/core";
import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import { jwt_secret } from '../config.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
let UserController = class UserController {
    async register(req, res) {
        const { username, email, password, userType } = req.body;
        try {
            const newUser = new User({ username, email, password, userType });
            await newUser.save();
            res.status(201).json({ message: "User registration successful" });
        }
        catch (err) {
            res.status(500).json({ message: 'Registration failed', error: err });
        }
    }
    async login(req, res) {
        const { email, password, userType } = req.body;
        console.log('Login request:', { email, password, userType });
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        try {
            const user = await User.findOne({ email });
            console.log(user);
            if (!user) {
                return res.status(401).json({ error: 'Invalid username or password' });
            }
            const isValidPassword = await user.comparePassword(password);
            if (!isValidPassword) {
                return res.status(401).json({ error: 'Invalid username or password' });
            }
            if (user.userType !== userType) {
                return res.status(401).json({ error: 'Invalid user type' });
            }
            const token = jwt.sign({ userId: user._id }, jwt_secret, { expiresIn: '1h' });
            res.status(200).json({ token, userId: user._id });
        }
        catch (err) {
            console.log("Error logging in", err);
            res.status(500).json({ error: 'Error logging in' });
        }
    }
    async getProfile(req, res) {
        try {
            const user = await User.findById(req.userId);
            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
            res.status(200).json(user);
        }
        catch (error) {
            res.status(500).json({ error: 'Error fetching profile' });
        }
    }
    async updateProfile(req, res) {
        const { username, email } = req.body;
        try {
            const user = await User.findByIdAndUpdate(req.userId, { username, email }, { new: true });
            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
            res.status(200).json(user);
        }
        catch (err) {
            res.status(500).json({ error: "Error updating Profile" });
        }
    }
    async getUsers(req, res) {
        try {
            const users = await User.find({ userType: 'User' });
            if (!users) {
                res.status(404).json({ error: 'No users found' });
            }
            res.status(200).json(users);
        }
        catch (err) {
            res.status(500).json({ error: "Error fetching users" });
        }
    }
    async deleteUser(req, res) {
        try {
            const user = await User.findByIdAndDelete(req.params.id);
            if (!user) {
                res.status(404).json({ error: 'User not found' });
            }
            res.status(200).json({ message: 'User deleted successfully' });
        }
        catch (err) {
            res.status(500).json({ error: "Error deleting user" });
        }
    }
};
__decorate([
    Post('register'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "register", null);
__decorate([
    Post('login'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "login", null);
__decorate([
    Get('my-profile'),
    Middleware(authMiddleware),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getProfile", null);
__decorate([
    Put('update-profile'),
    Middleware(authMiddleware),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateProfile", null);
__decorate([
    Get('get-users'),
    Middleware(authMiddleware),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUsers", null);
__decorate([
    Delete('delete-user/:id'),
    Middleware(authMiddleware),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "deleteUser", null);
UserController = __decorate([
    Controller('users')
], UserController);
export { UserController };
