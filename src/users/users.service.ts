import { ConflictException, HttpException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/User.schema';
import { CreateUserDto } from './dto/CreateUser.dto';
import { UpdateUserDto } from './dto/UpdateUser.dto';
import * as bcrypt from 'bcrypt';
import { AuthUserDto } from 'src/users/dto/AuthUser.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>, private jwtService: JwtService) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userModel.findOne({email: createUserDto.email}).lean();
    if (existingUser)
      throw new ConflictException("Email Already Registered")

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const newUser = new this.userModel({...createUserDto, password:hashedPassword});
    return await newUser.save();
  }

  async validateUser({ email, password}: AuthUserDto) {
    const users = this.userModel
    const findUser = await users.findOne({email});
    if (!findUser) 
      throw new UnauthorizedException("Invalid Credentials");

    const isMatch = await bcrypt.compare(password, findUser.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid Password');
    }
    return findUser;
  }

  async logIn(user: User) {
    const payload = { sub: user._id, name: user.firstname, role: user.role, email: user.email};
    return this.jwtService.sign(payload)
  }

  getUsers() {
    return this.userModel.find();
  }

  getUserById(id: string) {
    return this.userModel.findById(id).populate('orders').populate('cart','items');
  }
  updateUser(id:string, updateUserDto: UpdateUserDto) {
    return this.userModel.findByIdAndUpdate(id, updateUserDto, {new : true});
  }
  deleteUser(id: string) {
    return this.userModel.findByIdAndDelete(id);
  }
  deleteAllUsers() {
    const users = this.userModel.find()
    return users.deleteMany()
  }
}