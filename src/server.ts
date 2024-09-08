import { Server } from "@overnightjs/core";
import mongoose from "mongoose";
import { UserController } from "./controllers/userController.js";
import bodyParser from "body-parser";
import cors from "cors";
import { mongo_uri } from "./config.js";

class MainServer extends Server {
    constructor() {
        super(true);
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        // Specify allowed origins
        this.app.use(cors({
            origin: ['https://user-management-one-delta.vercel.app'], // Add more origins if needed
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            allowedHeaders: ['Content-Type', 'Authorization']
        }));
        this.setupControllers();
    }

    private setupControllers(): void {
        const userController = new UserController();
        this.addControllers([userController]);
    }

    public start(port: number): void {
        this.app.listen(port, () => {
            console.log(`Server is listening at ${port}`);
        });
    }
}

mongoose.connect(mongo_uri)
    .then(() => console.log('Connected to MongoDB database'))
    .catch(err => console.log(err));

const server = new MainServer();
const PORT: number = 3000;
server.start(PORT);