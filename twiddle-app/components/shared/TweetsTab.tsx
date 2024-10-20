import { fetchGroupPosts } from "@/lib/actions/group.actions";
import { isTweetByUser } from "@/lib/actions/tweet.actions";
import { fetchUser, fetchUserPosts } from "@/lib/actions/user.actions"
import TweetCard from "../cards/TweetCard";

interface Props {
    currentUserId: string,
    accountId: string,
    accountType: string,
    user: {
      id: string
    }
}

interface Result {
    name: string;
    image: string;
    id: string;
    tweets: {
      _id: string;
      text: string;
      parentId: string | null;
      author: {
        name: string;
        image: string;
        id: string;
      };

      group: {
        id: string;
        name: string;
        image: string;
      } | null;
      createdAt: string;
      children: {
        author: {
          id: string;
          image: string;
        };
      }[];
      retweetOf?: {
        _id: string;
        text: string;
        parentId: string | null;
        author: {
          name: string;
          image: string;
          id: string;
        };
        group: {
          id: string;
          name: string;
          image: string;
        } | null;
        createdAt: string;
        children: {
          author: {
            id: string;
            image: string;
          };
        };
      } | null;
      likes: number;
    }[];
  }


const TweetsTab = async ({ currentUserId, accountId, accountType, user }: Props) => {
    const userInfo = await fetchUser(user.id)
    let result: Result;
    if (accountType === "Group") {
        result = await fetchGroupPosts(accountId);
      } else {
        result = await fetchUserPosts(accountId);
      }

      return (
        <>
            <section className='mt-9 flex flex-col gap-10'>
                {result.tweets.map(async (tweet) =>
                
                {
                    const isOwner = await isTweetByUser(userInfo?._id, tweet?._id)
                    return (
                    <TweetCard
                        key={tweet._id}
                        id={tweet._id}
                        currentUserId={currentUserId}
                        DB_userID={userInfo._id}
                        retweetOf={tweet.retweetOf}
                        parentId={tweet.parentId}
                        content={tweet.text}
                        owner = { isOwner }
                        author={
                        accountType === "User"
                            ? { name: result.name, image: result.image, id: result.id }
                            : {
                                name: tweet.author.name,
                                image: tweet.author.image,
                                id: tweet.author.id,
                            }
                        }
                        group={
                        accountType === "Group"
                            ? { name: result.name, id: result.id, image: result.image }
                            : tweet.group
                        }
                        createdAt={tweet.createdAt}
                        comments={tweet.children}
                        likes={tweet.likes}
                        liked={ userInfo.likedTweets.includes(tweet._id) }
                    />
                    )
                }
                )}
                </section>
        </>
      )

}

export default TweetsTab

