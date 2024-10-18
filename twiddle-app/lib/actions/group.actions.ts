'use server'

import Group from "../models/group.model";
import Tweet from "../models/tweet.model";
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

  export const updateGroupInfo = async(
    groupId: string,
    name: string,
    username: string,
    image: string
  ) => {
    try {
      connectToDB();
  
      // Find the group by its _id and update the information
      const updatedGroup = await Group.findOneAndUpdate(
        { id: groupId },
        { name, username, image }
      );
  
      if (!updatedGroup) {
        throw new Error("Group not found");
      }
  
      return updatedGroup;
    } catch (error) {
      // Handle any errors
      console.error("Error updating group information:", error);
      throw error;
    }
  }

  export const deleteGroup = async (groupId: string) => {
    try {
      connectToDB();
  
      // Find the group by its ID and delete it
      const deletedGroup = await Group.findOneAndDelete({
        id: groupId,
      });
  
      if (!deletedGroup) {
        throw new Error("Group not found");
      }
  
      // Delete all tweets associated with the group
      await Tweet.deleteMany({ group: groupId });
  
      // Find all users who are part of the group
      const groupUsers = await User.find({ groups: groupId });
  
      // Remove the group from the 'groups' array for each user
      const updateUserPromises = groupUsers.map((user) => {
        user.groups.pull(groupId);
        return user.save();
      });
  
      await Promise.all(updateUserPromises);
  
      return deletedGroup;
    } catch (error) {
      console.error("Error deleting group: ", error);
      throw error;
    }
  }