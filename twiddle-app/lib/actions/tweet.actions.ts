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