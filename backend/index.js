import express from 'express';
import { auth } from 'express-oauth2-jwt-bearer';
import dotenv from 'dotenv';
import cors from 'cors';
import userRouter from './route/user.route.js';
import connectToDb from './db.js';
import basicUserInfo from './middelware/basicUserInfo.js';
import { userOnboarding } from './controller/user.controller.js';

dotenv.config();
const app = express();
app.use(cors({
    origin : '*'
}));
app.use(express.json());

connectToDb();

const checkJwt = auth({
    audience: process.env.AUTH0_AUDIENCE,
    issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
    tokenSigningAlg: 'RS256'
});
  
app.use(checkJwt);

app.post('/api/user/onboarding', userOnboarding);

app.use(basicUserInfo);

app.use('/api/user', userRouter);

app.listen(process.env.PORT || 3001, () => console.log(`Server running on port ${process.env.PORT || 3001}`));
