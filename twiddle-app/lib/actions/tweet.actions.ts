'use server'

import { revalidatePath } from "next/cache";
import Tweet from "../models/tweet.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import Group from "../models/group.model";

interface TweetParams {
    text: string;
    author: string;
    path: string;
    retweetOf?: string;
    groupId: string | null
}

export const createTweet = async ({
    text,
    author,
    path,
    retweetOf,
    groupId
}: TweetParams) => {
    try {
        connectToDB()
        const groupIdObject = await Group.findOne({ id: groupId }, { _id: 1 });
        const createdTweet = await Tweet.create({
            text,
            author,
            path,
            group: groupIdObject,
            retweetOf
        })

        await User.findByIdAndUpdate(author, {
            $push: { tweets: createdTweet._id },
          });

        if(retweetOf) {
        await User.findByIdAndUpdate(author, {
            $push: { retweets: createdTweet._id },
        });
        }

        if (groupIdObject) {
            await Group.findByIdAndUpdate(groupIdObject, {
              $push: { tweets: createdTweet._id },
            });
          }

        revalidatePath(path)

    } catch(err: any) {
        throw new Error(`Failed to create tweet ${err.message}`)
    }
}

export const fetchTweets = async (pageNumber = 1, pageSize = 20) => {
    connectToDB();
  
    const skipAmount = (pageNumber - 1) * pageSize;
  
    const TweetsQuery = Tweet.find({ parentId: { $in: [null, undefined] } })
      .sort({ createdAt: 'desc' })
      .skip(skipAmount)
      .limit(pageSize)
      .populate({
        path: 'author',
        model: User,
      })
      .populate({
        path: 'group',
        model: Group,
      })
      .populate({
        path: 'children',
        populate: {
          path: 'author',
          model: User,
          select: '_id name parentId image',
        },
      })
      .populate({
        path: 'retweetOf', // Populate the retweetOf field
        populate: {
          path: 'author',
          model: User,
          select: '_id name image',
        },
      });
  
    const totalPostsCount = await Tweet.countDocuments({
      parentId: { $in: [null, undefined] },
    });
  
    const posts = await TweetsQuery.exec();
  
    const isNext = totalPostsCount > skipAmount + posts.length;
  
    return { posts, isNext };
  };

  interface RetweetParams {
    userId: string;
    tweetId: string;
    path: string,
    groupId: string | null;
  }

  export const retweetTweet = async ({
    userId, 
    tweetId,
    path,
    groupId,
  }: RetweetParams) => {
    try {
      connectToDB();
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found:');
  
      
  
      const originalTweet = await Tweet.findById(tweetId);
      if (!originalTweet) throw new Error('Original tweet not found');
  
      if (user.retweets.includes(tweetId)) {
        throw new Error('You have already retweeted this tweet');
      }
  
      await createTweet({
        text: originalTweet.text,
        retweetOf: tweetId,
        author: userId,
        path,
        groupId
      })
  
      user.retweets.push(tweetId)
      await user.save();
  
      revalidatePath(path)
  
    } catch (error: any) {
      throw new Error(`Failed to retweet: ${error.message}`);
    }
  }