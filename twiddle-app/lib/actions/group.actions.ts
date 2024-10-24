'use server'

import { FilterQuery, SortOrder } from "mongoose";
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
  
      await newGroup.save();
  
      
  
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

  export const fetchGroups = async ({
    searchString = "",
    pageNumber = 1,
    pageSize = 20,
    sortBy = "desc",
  }: {
    searchString?: string;
    pageNumber?: number;
    pageSize?: number;
    sortBy?: SortOrder;
  }) => {
    try {
      connectToDB();
  
      // Calculate the number of groups to skip based on the page number and page size.
      const skipAmount = (pageNumber - 1) * pageSize;
  
      // Create a case-insensitive regular expression for the provided search string.
      const regex = new RegExp(searchString, "i");
  
      // Create an initial query object to filter groups.
      const query: FilterQuery<typeof Group> = {};
  
      // If the search string is not empty, add the $or operator to match either username or name fields.
      if (searchString.trim() !== "") {
        query.$or = [
          { username: { $regex: regex } },
          { name: { $regex: regex } },
        ];
      }
  
      // Define the sort options for the fetched groups based on createdAt field and provided sort order.
      const sortOptions = { createdAt: sortBy };
  
      // Create a query to fetch the groups based on the search and sort criteria.
      const groupsQuery = Group.find(query)
        .sort(sortOptions)
        .skip(skipAmount)
        .limit(pageSize)
        .populate("members");
  
      // Count the total number of groups that match the search criteria (without pagination).
      const totalGroupsCount = await Group.countDocuments(query);
  
      const groups = await groupsQuery.exec();
  
      // Check if there are more groups beyond the current page.
      const isNext = totalGroupsCount > skipAmount + groups.length;
  
      return { groups, isNext };
    } catch (error) {
      console.error("Error fetching groups:", error);
      throw error;
    }
  }

  export const fetchGroupPosts = async (id: string) => {
    try {
      connectToDB();
  
      const groupPosts = await Group.findById(id)
    .populate({
      path: "tweets",
      model: Tweet,
      options:  { 
        sort: { createdAt: 'desc' } 
    
    }, // Sort tweets in descending order by createdAt
      populate: [
        {
          path: "author",
          model: User,
          select: "name image id", // Select the "name" and "_id" fields from the "User" model
        },
        {
          path: 'retweetOf', // Populate the retweetOf field
          populate: {
            path: 'author',
            model: User,
            select: '_id name image',
          },
        },
        {
          path: "children",
          model: Tweet,
          populate: {
            path: "author",
            model: User,
            select: "image _id", // Select the "name" and "_id" fields from the "User" model
          },
        },
      ],
    });
  
  
      return groupPosts;
    } catch (error) {
      // Handle any errors
      console.error("Error fetching group posts:", error);
      throw error;
    }
  }

  export const fetchGroupDetails = async (id: string) => {
    try {
      connectToDB();
  
      const groupDetails = await Group.findOne({ id }).populate([
        "createdBy",
        {
          path: "members",
          model: User,
          select: "name username image _id id",
        },
      ]);
  
      return groupDetails;
    } catch (error) {
      // Handle any errors
      console.error("Error fetching group details:", error);
      throw error;
    }
  }