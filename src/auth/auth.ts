import {MiddlewareFn} from "type-graphql";
import {MyContext} from "./../interfaces/MyContext";
import {verify} from "jsonwebtoken";

export const auth: MiddlewareFn<MyContext> = ({context}, next) => {
    const authorization = context.req.headers['authorization'];

    if(!authorization){
        throw new Error("authentication pending");
    }

    try {
        const token = authorization.split(" ")[1];
        const payload = verify(token, process.env.AUTH_TOKEN_SECRET_KEY!);
        context.payload = <any>payload;
    } catch (error) {
        console.log(error);
        throw new Error("authentication pending");
    }

    return next();
}