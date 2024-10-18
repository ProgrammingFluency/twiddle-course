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

  export const addMemberToGroup = async (
    groupId: string,
    memberId: string
  ) => {
    try {
      connectToDB();
  
      // Find the group by its unique id
      const group = await Group.findOne({ id: groupId });
  
      if (!group) {
        throw new Error("Group not found");
      }
  
      // Find the user by their unique id
      const user = await User.findOne({ id: memberId });
  
      if (!user) {
        throw new Error("User not found");
      }
  
      // Check if the user is already a member of the group
      if (group.members.includes(user._id)) {
        throw new Error("User is already a member of the group");
      }
  
      // Add the user's _id to the members array in the group
      group.members.push(user._id);
      await group.save();
  
      // Add the group's _id to the groups array in the user
      user.groups.push(group._id);
      await user.save();
  
      return group;
    } catch (error) {
      // Handle any errors
      console.error("Error adding member to group:", error);
      throw error;
    }
  }


  export const removeUserFromGroup = async (
    userId: string,
    groupId: string
  ) => {
    try {
      connectToDB();
  
      const userIdObject = await User.findOne({ id: userId }, { _id: 1 });
      const groupIdObject = await Group.findOne(
        { id: groupId },
        { _id: 1 }
      );
  
      if (!userIdObject) {
        throw new Error("User not found");
      }
  
      if (!groupIdObject) {
        throw new Error("Group not found");
      }
  
      // Remove the user's _id from the members array in the group
      await Group.updateOne(
        { _id: groupIdObject._id },
        { $pull: { members: userIdObject._id } }
      );
  
      // Remove the group's _id from the groups array in the user
      await User.updateOne(
        { _id: userIdObject._id },
        { $pull: { groups: groupIdObject._id } }
      );
  
      return { success: true };
    } catch (error) {
      // Handle any errors
      console.error("Error removing user from group:", error);
      throw error;
    }
  }