'use server'


import { revalidatePath } from "next/cache";
import Tweet from "../models/tweet.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";

interface TweetParams {
    text: string;
    author: string;
    path: string;
    retweetOf?: string
}

export const createTweet = async ({
    text,
    author,
    path,
    retweetOf
}: TweetParams) => {
    try {
        connectToDB()
        const createdTweet = await Tweet.create({
            text,
            author,
            path,
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

        revalidatePath(path)

    } catch(err: any) {
        throw new Error(`Failed to create tweet ${err.message}`)
    }
}