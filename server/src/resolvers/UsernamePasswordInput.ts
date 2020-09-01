import { InputType, Field } from 'type-graphql';
// For arguments
@InputType()
export class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  email: string;
  @Field()
  password: string;
}
