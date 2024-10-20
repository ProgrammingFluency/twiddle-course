import TweetCard from "@/components/cards/TweetCard"
import Comment from "@/components/forms/Comment"
import { fetchTweetById, isTweetByUser } from "@/lib/actions/tweet.actions"
import { fetchUser } from "@/lib/actions/user.actions"
import { currentUser } from "@clerk/nextjs/server"
import Image from "next/image"
import { redirect } from "next/navigation"

const Page = async ({params}: {params: {id: string}}) => {
    const user = await currentUser()
    if(!user) return null
    
    const userInfo = await fetchUser(user.id)
    if(!userInfo?.onboarded) redirect('/onboarding')

    const tweet = await fetchTweetById(params.id)

    if(!tweet) {
        return (
            <div className=" flex flex-col items-center text-light-1">
                <h1 className="mt-10 mb-10 text-heading1-bold" >Sorry, tweet doesn't exist anymore</h1>
                <Image
                    src='/assets/oops.svg'
                    alt="opps"
                    width={200}
                    height={200}
                />
            </div>
        )
    }

    {
        const isOwner = await isTweetByUser(userInfo?._id, tweet?._id)
    
        return(
            <section className="relative">
                <div>
                    
                <TweetCard
                    key={tweet._id}
                    id={tweet._id}
                    DB_userID={userInfo?._id}
                    retweetOf={tweet.retweetOf}
                    currentUserId={user?.id || ''}
                    parentId={tweet.parentId}
                    content={tweet.text}
                    author={tweet.author}
                    group={tweet.group}
                    createdAt={tweet.createdAt}
                    comments={tweet.children}
                    likes={tweet.likes}
                    liked={ userInfo.likedTweets.includes(tweet._id) }
                    owner = { isOwner }
                  />
                </div>
    
                <div className="mt-7">
                    <Comment
                        tweetId = {tweet.id}
                        currentUserImg = {userInfo.image}
                        currentUserId = {JSON.stringify(userInfo._id)}
                    />
                </div>
    
                <div className="mt-10">
                    {tweet.children.map(async (child: any) =>
                    {
                    const isOwner = await isTweetByUser(userInfo?._id, child?._id)
                    return (
                        <TweetCard
                        key={child._id}
                        id={child._id}
                        DB_userID={userInfo?._id}
                        currentUserId={user?.id || ''}
                        parentId={child.parentId}
                        content={child.text}
                        author={child.author}
                        group={child.group}
                        createdAt={child.createdAt}
                        comments={child.children}
                        isComment
                        owner = { isOwner }
                        likes={child.likes}
                        liked={ userInfo.likedTweets.includes(child._id) }   
                      />
                    ) 
                }
                        
                    )}
                </div>
            </section>
        )
    }

}

export default Page
