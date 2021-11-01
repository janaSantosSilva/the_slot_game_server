import {User} from "./../../entity/User";
import {hash, compare} from "bcryptjs";
import {Arg, Ctx, Mutation, Query, Resolver, UseMiddleware} from "type-graphql";
import {LoginResponse} from "../../utils/LoginResponse";
import {MyContext} from "./../../interfaces/MyContext";
import {generateAuthToken, generateRefreshToken, refreshToken} from "./../../utils/services";
import {auth} from "./../../auth/auth";
import { UserSchema } from "./UserValidation";
import { err as apiResponse } from "./../../error/Errors";

@Resolver()
export class UserResolver {

    @Query(() => String)
    testFrontEnd(){
        return apiResponse(
            "route system is working",
            true,
            null
        );
    }

    @Query(() => [User])
    async users(): Promise<User[]> { 
        return await User.find()
    }

    @Query(() => String)
    @UseMiddleware(auth)
    testingAuth(
        @Ctx() {payload}: MyContext
    ){
        console.log(payload);
        return `you are allowed to see this because you are connected: welcome ${payload!.skojp}`;
    }

    @Mutation(() => String || Boolean)
    async register(
        @Arg("username") username: string,
        @Arg("birthdate") birthdate: string,
        @Arg("password") password: string,
    ){

        try{

            await UserSchema.validateAsync({
                username: username,
                password: password,
                birthdate: birthdate
            });

        }catch(error){

            const err = error.details;
            const message = err[0]['message'];
            const data = err[0]['context']['key'];
            
            return apiResponse(
                message,
                false,
                data
            );
        }

        const userExists = await User.find({
            username: username
        })

        if(userExists.length > 0){
            return apiResponse(
                "You are already registered. Please login to continue",
                false,
                null
            );
        }

        const passwordHash = await hash(password, 12);
       
        try{

            await User.insert({
                username,
                birthdate,
                password: passwordHash,
            });

        }catch(error){
            return apiResponse(
                "Error attempting to insert user data to database",
                false,
                null
            );
        }

        return apiResponse(
            "Congratulations, you have successfully registered. Please login to continue.",
            true,
            null
        );
    }

    @Mutation(() => LoginResponse)
    async login(
        @Arg("username") username: string,
        @Arg("password") password: string,
        @Ctx() {res}: MyContext
    ): Promise<LoginResponse>{

        const user = await User.findOne({
            where:{
                username
            }
        });

        if(!user){
            throw new Error(
                apiResponse(
                    "Invalid username or password",
                    false,
                    null
                )
            );
        }

        const verifyPassword = await compare(password, user.password);

        if(!verifyPassword){
            throw new Error(
                apiResponse(
                    "Invalid username or password",
                    false,
                    null
                )
            );
        }

        refreshToken(res, generateRefreshToken(user));

        return {
            authToken: generateAuthToken(user)
        };
    }

}