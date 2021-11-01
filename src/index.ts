import "dotenv/config";
import "reflect-metadata";
import {createConnection} from "typeorm";
import express from "express";
import {ApolloServer} from "apollo-server-express";
import {buildSchema} from "type-graphql";
import {UserResolver} from "./useCases/userUseCases/UserResolver";
import cookie_parser from "cookie-parser";
import cors from "cors";
import {User} from "./entity/User";
import {verify} from "jsonwebtoken";
import {ObjectId} from "mongodb";
import {generateAuthToken, generateRefreshToken, refreshToken} from "./utils/services";

(async () => {

    await createConnection();

    const app = express();
    app.use(cors({
        origin: "http://localhost:3000",
        credentials: true
    }));
    app.use(cookie_parser());

    app.get('/', (_req, res) => {
        res.send('route working :) ')
    })

    // handle refresh token
    app.post("/refresh_token_handler", async (req, res) => {

        const token = req.cookies.skojpc

        if(!token){
            return res.send({
                error: true,
                message: "not a valid token",
                authToken: "" 
            });
        }

        let payload: any = null;

        try {
            payload = verify(token, process.env.REFRESH_TOKEN_SECRET_KEY!);
        } catch (error) {
            console.log(error);
            return res.send({
                error: true,
                message: "couldn't mount payload data",
                authToken: "" 
            });
        }

        const userId = payload.skojp;
        const user = await User.findOne({
                        _id: new ObjectId(userId)
                    });

        if(!user){
            return res.send({
                error: true,
                message: "couldn't find user",
                authToken: "" 
            });   
        }

        refreshToken(res, generateRefreshToken(user));

        return res.send({
            authToken: generateAuthToken(user)
        });

    })

    const schema = await buildSchema({
        resolvers: [UserResolver]
    })

    const apolloServer = new ApolloServer({
        schema: schema,
        context: ({ 
            req, 
            res 
        }) => ({ 
            req, 
            res  
    })
    })

    await apolloServer.start();
    apolloServer.applyMiddleware({ app, cors: false });

    app.listen(4000, () => {
        console.log('server up and running ...')
    })

})()