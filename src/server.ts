import { Server } from "@overnightjs/core";
import mongoose from "mongoose";
import { UserController } from "./controllers/userController.js";
import bodyParser from "body-parser";
import cors from "cors"
import { mongo_uri } from "./config.js";


class MainServer extends Server {
    constructor() {
        super(true);
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(cors({ origin: '*' }));
        this.app.options('*', cors());
        this.setupControllers()
    }

    private setupControllers(): void {
        const userController = new UserController();
        this.addControllers([userController]);
    }

    public start(port: number): void {
        this.app.listen(port, () => {
            console.log(`Server is listening at ${port}`)
        })
    }
}

mongoose.connect(mongo_uri)
    .then(() => console.log('Connected to MongoDB database'))
    .catch(err => console.log(err));

const server = new MainServer();
const PORT: number = 3000;
server.start(PORT)