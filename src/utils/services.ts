import {User} from "./../entity/User";
import {sign} from "jsonwebtoken";
import { Response } from "express";

export const generateAuthToken = ( user: User ) => {
    return sign({ 
        skojp:user._id,
    }, process.env.AUTH_TOKEN_SECRET_KEY!, {
        expiresIn: "15m"
    })
}

export const generateRefreshToken = (user: User) => {
    return sign({ 
        skojp:user._id,
    }, process.env.REFRESH_TOKEN_SECRET_KEY!, {
        expiresIn: "5d"
    })
}

export const refreshToken = ( res: Response, token: string ) => {
    return res.cookie('skojpc', token, {
                    httpOnly: true
                }
            );
}