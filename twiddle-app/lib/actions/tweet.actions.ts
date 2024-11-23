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

  export const isTweetByUser = async (userId: string, tweetId: string) => {
  
    try {
      connectToDB();
  
      const tweet = await Tweet.findById(tweetId);
      if (!tweet) throw new Error('Tweet not found');
  
      return tweet?.author.toString() === userId?.toString();
    } catch (error: any) {
      throw new Error(`Failed to check tweet ownership: ${error.message}`);
    }
  }

  export const deleteTweet = async (userId: string, tweetId: string, path: string) => {
    try {
      connectToDB();
  
      // Check if the tweet exists and if the user is the author
      const tweet = await Tweet.findById(tweetId);
      if (!tweet) throw new Error('Tweet not found');
  
      // Check if the tweet belongs to the user
      const isAuthor = await isTweetByUser(userId, tweetId);
      if (!isAuthor) throw new Error('You are not authorized to delete this tweet');
  
      // Remove tweet reference from the user's tweets array
      await User.findByIdAndUpdate(userId, {
        $pull: { tweets: tweetId }
      });

  
      // If the tweet is a retweet, remove it from the user's retweets array
      if (tweet.retweetOf) {
        await User.findByIdAndUpdate(userId, {
          $pull: { retweets:  tweet.retweetOf}
        });
      }

      if (tweet.parentId) {
        await User.findByIdAndUpdate(userId, {
          $pull: { replies: tweetId }
        });

        await Tweet.findByIdAndUpdate(tweet.parentId, {
          $pull: { children: tweetId }
        });
      }
  
      
  
      // Remove tweet reference from any group collections it might belong to
      await Group.updateMany(
        { tweets: tweetId },
        { $pull: { tweets: tweetId } }
      );
  
      // Find and delete all retweets of the tweet
      const retweets = await Tweet.find({ retweetOf: tweetId });
  
      for (const retweet of retweets) {
        // Remove retweet reference from the user's tweets array
        await User.findByIdAndUpdate(retweet.author, {
          $pull: { tweets: retweet._id }
        });
  
        // Remove retweet reference from the user's retweets array
        await User.findByIdAndUpdate(retweet.author, {
          $pull: { retweets: retweet._id }
        });
  
        
  
        // Remove retweet reference from any group collections it might belong to
        await Group.updateMany(
          { tweets: retweet._id },
          { $pull: { tweets: retweet._id } }
        );
  
      //   // Delete the retweet
        await Tweet.findByIdAndDelete(retweet._id);
      }
  
      // Remove the tweet from all users' retweets arrays
      await User.updateMany(
        { retweets: tweetId },
        { $pull: { retweets: tweetId } }
      );
  
      // Delete the original tweet
      await Tweet.findByIdAndDelete(tweetId);
  
      revalidatePath(path);
      
    } catch (error: any) {
      throw new Error(`Failed to delete tweet: ${error.message}`);
    }
  
  };

  export const fetchTweetById = async (id: string) => {
    connectToDB();
  
    try {
      const tweet = await Tweet.findById(id)
        .populate({
          path: 'author',
          model: User,
          select: '_id id name image',
        })
        .populate({
          path: 'children',
          populate: [
            {
              path: 'author',
              model: User,
              select: '_id id name image',
            },
            {
              path: 'children',
              model: Tweet,
              populate: {
                path: 'author',
                model: User,
                select: '_id id name image',
              },
            },
          ],
        })
        .populate({
          path: 'retweetOf', // Populate the retweetOf field
          populate: {
            path: 'author',
            model: User,
            select: '_id id name image',
          },
        })
        .populate({
          path: 'group',
          model: Group,
        })
        .exec();
  
      return tweet;
    } catch (err: any) {
      throw new Error(`Error fetching tweet: ${err.message}`);
    }
  };


  export const addCommentToTweet = async (
    tweetId: string,
    commentText: string,
    userId: string,
    path: string
  ) => {
    connectToDB();
    try {
      const originalTweet = await Tweet.findById(tweetId);
      if (!originalTweet) throw new Error('Tweet Not Found!!!');
  
      const commentTweet = new Tweet({
        text: commentText,
        author: userId,
        parentId: tweetId,
      });
  
      const savedCommentTweet = await commentTweet.save();
  
      // Update user's replies
      await User.findByIdAndUpdate(userId, {
        $push: { replies: savedCommentTweet._id },
      });
  
      originalTweet.children.push(savedCommentTweet._id);
      await originalTweet.save();
      revalidatePath(path);
    } catch (err: any) {
      throw new Error(`Error adding comment to tweet: ${err.message}`);
    }
  };