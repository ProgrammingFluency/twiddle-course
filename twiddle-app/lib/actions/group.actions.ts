'use server'

import Group from "../models/group.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";

interface createGroupParams {
    id: string,
    name  : string;
    username: string;
    image: string;
    createdById: string;
}
export const createGroup = async (
    {
      id,
      name,
      username,
      image,
      createdById,
    }: createGroupParams 
  ) =>  {
    try {
      connectToDB();
  
      // Find the user with the provided unique id
      const user = await User.findOne({ id: createdById });
  
      if (!user) {
        throw new Error("User not found"); // Handle the case if the user with the id is not found
      }
  
      const newGroup = new Group({
        id,
        name,
        username,
        image,
        createdBy: user._id, 
      });
  
      const createdGroup = await newGroup.save();
  
      // Update User model
      user.groups.push(createdGroup._id);
      await user.save();
  
    } catch (error) {
      // Handle any errors
      console.error("Error creating group:", error);
      throw error;
    }
  }
