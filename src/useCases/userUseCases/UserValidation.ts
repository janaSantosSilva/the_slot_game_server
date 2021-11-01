import Joi from "joi";

export const UserSchema = Joi.object({
    username: 
        Joi.string()
        .email({minDomainSegments: 2})
        .required(),
    password: 
        Joi.string()
        .min(8)
        .pattern(new RegExp('[A-Z][0-9]+')),
    birthdate: 
        Joi.string()
        .required()
})  .with('username','username')
    .with('password','password')
    .with('birthdate','birthdate');