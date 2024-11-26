import express from "express";
import { showChatApp } from "../controllers/chatController.js";

const chatRoute = express.Router();

chatRoute
.get('/', showChatApp);


export default chatRoute;