import { Controller, Get, Post, Put, Delete, Middleware } from "@overnightjs/core";
import { Request, Response } from 'express';
import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import { jwt_secret } from '../config.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

interface AuthenticationRequest extends Request {
    userId?: string;
}

@Controller('users')
export class UserController {
    @Post('register')
    async register(req: Request, res: Response): Promise<any> {
        const { username, email, password, userType } = req.body;
        try {
            const newUser = new User({ username, email, password, userType });
            await newUser.save();
            res.status(201).json({ message: "User registration successful" });
        } catch (err) {
            res.status(500).json({ message: 'Registration failed', error: err });
        }
    }

    @Post('login')
    async login(req: Request, res: Response): Promise<any> {
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
        } catch (err) {
            console.log("Error logging in", err);
            res.status(500).json({ error: 'Error logging in' });
        }
    }


    @Get('my-profile')
    @Middleware(authMiddleware)
    async getProfile(req: AuthenticationRequest, res: Response): Promise<void> {
        try {
            const user = await User.findById(req.userId);
            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ error: 'Error fetching profile' });
        }
    }

    @Put('update-profile')
    @Middleware(authMiddleware)
    async updateProfile(req: AuthenticationRequest, res: Response): Promise<void> {
        const { username, email } = req.body
        try {
            const user = await User.findByIdAndUpdate(
                req.userId,
                { username, email },
                { new: true }
            );

            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
            res.status(200).json(user);
        } catch (err) {
            res.status(500).json({ error: "Error updating Profile" })
        }
    }

    @Get('get-users')
    @Middleware(authMiddleware)
    async getUsers(req: AuthenticationRequest, res: Response): Promise<void> {
        try {
            const users = await User.find({ userType: 'User' });
            if (!users) {
                res.status(404).json({ error: 'No users found' });
            }
            res.status(200).json(users);
        } catch (err) {
            res.status(500).json({ error: "Error fetching users" })
        }
    }

    @Delete('delete-user/:id')
    @Middleware(authMiddleware)
    async deleteUser(req: AuthenticationRequest, res: Response): Promise<void> {
        try {
            const user = await User.findByIdAndDelete(req.params.id);
            if (!user) {
                res.status(404).json({ error: 'User not found' });
            }
            res.status(200).json({ message: 'User deleted successfully' });
        } catch (err) {
            res.status(500).json({ error: "Error deleting user" })
        }
    }
}