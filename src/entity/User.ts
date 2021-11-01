import {Field, ObjectType, ID} from "type-graphql";
import {Entity, ObjectIdColumn, ObjectID, Column, BaseEntity} from "typeorm";

@ObjectType()
@Entity("users")
export class User extends BaseEntity{

    @Field(() => ID)
    @ObjectIdColumn()
    _id: ObjectID;

    @Field()
    @Column()
    username: string;

    @Field()
    @Column()
    birthdate: string;

    @Column()
    password: string;

}
