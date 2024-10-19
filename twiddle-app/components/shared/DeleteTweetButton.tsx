'use client'

import { deleteTweet } from "@/lib/actions/tweet.actions";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface Props {
    userId: string;
    tweetId: string;
}

const DeleteTweetButton = ({
    userId,
    tweetId
}: Props) => {
    const path = usePathname()
    const handleDeleteTweet = async () => {
        await deleteTweet(userId, tweetId, path)
    }
    return (
        <button onClick={handleDeleteTweet}>
            <Image
                    src='/assets/delete.svg' 
                    alt="repost" 
                    width={24} 
                    height={24} 
                    className="cursor-pointer object-contain"
                />
        </button>
    )
}

export default DeleteTweetButton