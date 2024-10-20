'use server'

import { revalidatePath } from "next/cache";
import User from "../models/user.model"
import { connectToDB } from "../mongoose"
import { FilterQuery, SortOrder } from "mongoose";
import Tweet from "../models/tweet.model";
import Group from "../models/group.model";

interface CreateUserParams {
    userId: String;
    email: String;
    username: String;
    name: String;
    image: String
}

export const createUser = async ({
    userId,
    email,
    name,
    username,
    image
}: CreateUserParams): Promise<void> => {

    try{
        connectToDB()
        await User.create({
            id: userId,
            username: username?.toLowerCase(),
            name,
            email,
            image
        })
    } catch(err: any) {
        throw new Error(`Failed to create user: ${err.message}`)
    }

}

export const fetchUser = async (userId: string) => {
    try {
        connectToDB()

        return await User.findOne({
            id: userId
        })
    } catch(err: any) {
        throw new Error(`Failed to fetch user: ${err.message}`)
    }
}


interface updateUserParams {
    userId: string;
    email?: string;
    username?: string;
    name?: string;
    bio?: string;
    image?: string;
    path?: string;
}


export const updateUser = async ({
    userId,
    name,
    email,
    username,
    bio,
    path,
    image
}: updateUserParams): Promise<void> => {
    try{

        connectToDB()
        await User.findOneAndUpdate(
            {id: userId},
            {
                name,
                email,
                username,
                bio,
                path,
                image,
                onboarded: true
            }
        )

        if(path === '/profile/edit') revalidatePath(path)

    } catch(err: any) {
        throw new Error(`Failed to update user info: ${err.message}`)
    }
}

export const fetchUsers = async ({
    userId,
    searchString = '',
    pageNumber = 1,
    pageSize = 20,
    sortBy = 'desc'
}: {
    userId: string;
    searchString?: string;
    pageNumber?: number;
    pageSize?: number
    sortBy?: SortOrder
}) => {
    try {
        connectToDB()
        const skipAmount = (pageNumber - 1) * pageSize
        const regex = new RegExp(searchString, 'i')
        const query: FilterQuery<typeof User> = {
            id: { $ne: userId }
        }

        if(searchString.trim() !== '') {
            query.$or = [
                { username: { $regex: regex } },
                { name: { $regex: regex } }
            ]
        }

        const sortOptions = { createdAt: sortBy }

        const userQuery = User.find(query)
            .sort(sortOptions)
            .skip(skipAmount)
            .limit(pageSize)

        const totalUserCount = await User.countDocuments(query)
        const users = await userQuery.exec()
        const isNext = totalUserCount > skipAmount + users.length

        return { users, isNext }
    }  catch(err: any) {
        throw new Error(`Failed to fetch users: ${err.message}`)
    }
}


export async function likeOrDislikeTweet(userId: string, tweetId: string, path: string) {
    try {
      connectToDB();
  
  
      // Find the user and check if they have already liked the tweet
      const user = await User.findOne({ id: userId });
      if (!user) throw new Error("User not found");
  
      let tweet;
  
      if (user.likedTweets.includes(tweetId)) {
        // If the tweet is already liked, decrement its likes and remove it from the user's likedTweets
        tweet = await Tweet.findByIdAndUpdate(
          tweetId,
          { $inc: { likes: -1 } },
          { new: true } // Return the updated document
        );
  
        if (!tweet) {
          throw new Error("Tweet not found");
        }
  
        // Remove the tweet from the user's likedTweets array
        user.likedTweets = user.likedTweets.filter((id: any) => id.toString() !== tweetId);
      } else {
        // If the tweet is not liked, increment its likes and add it to the user's likedTweets
        tweet = await Tweet.findByIdAndUpdate(
          tweetId,
          { $inc: { likes: 1 } },
          { new: true } // Return the updated document
        );
  
  
        if (!tweet) {
          throw new Error("Tweet not found");
        }
  
        // Add the tweet to the user's likedTweets array
        user.likedTweets.push(tweetId);
      }
  
      await user.save();
      revalidatePath(path)
  
    } catch (error: any) {
      throw new Error(`Failed to like or dislike tweet: ${error.message}`);
    }
  }

  export const fetchUserPosts = async (userId: string) => {
    try {
      connectToDB();
  
      // Find all tweets authored by the user with the given userId
      const tweets = await User.findOne({ id: userId }).populate({
        path: "tweets",
        model: Tweet,
        options:  { 
          sort: { createdAt: 'desc' } 
      
      }, // Sort tweets in descending order by createdAt
        populate: [
          {
            path: "group",
            model: Group,
            select: "name id image _id", // Select the "name" and "_id" fields from the "Group" model
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
              select: "name image id", // Select the "name" and "_id" fields from the "User" model
            },
          },
        ],
      });
      return tweets;
    } catch (error) {
      console.error("Error fetching user tweets:", error);
      throw error;
    }
  }

  export const fetchUserReplies = async (userId: string) => {
    try {
      connectToDB();
  
      // Find all replies authored by the user with the given userId
      const replies = await User.findOne({ id: userId }).populate({
        path: "replies",
        model: Tweet,
        populate: [
          {
            path: "group",
            model: Group,
            select: "name id image _id", // Select the "name", "id", "image", and "_id" fields from the "Group" model
          },
          {
            path: "children",
            model: Tweet,
            populate: {
              path: "author",
              model: User,
              select: "name image id", // Select the "name", "image", and "id" fields from the "User" model
            },
          },
        ],
      });
      return replies
    } catch (error: any) {
      console.error("Error fetching user replies:", error);
      throw error;
    }
  }


  export const getActivity = async (userId: string) => {
    try {
      connectToDB();
  
      // Find all tweets created by the user
      const userTweets = await Tweet.find({ author: userId });
  
      // Collect all the child tweet ids (replies) from the 'children' field of each user tweet
      const childTweetIds = userTweets.reduce((acc, userTweet) => {
        return acc.concat(userTweet.children);
      }, []);
  
      // Find and return the child tweets (replies) excluding the ones created by the same user
      const replies = await Tweet.find({
        _id: { $in: childTweetIds },
        author: { $ne: userId }, // Exclude tweets authored by the same user
      }).populate({
        path: "author",
        model: User,
        select: "name image _id",
      });
  
      return replies;
    } catch (error) {
      console.error("Error fetching replies: ", error);
      throw error;
    }
  }