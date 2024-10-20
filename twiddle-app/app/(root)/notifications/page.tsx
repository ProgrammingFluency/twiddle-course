import { fetchUser, getActivity } from "@/lib/actions/user.actions"
import { currentUser } from "@clerk/nextjs/server"
import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"

const Page = async () => {
    const user = await currentUser()
    if(!user) return null

    const userInfo = await fetchUser(user.id)

    if(!userInfo.onboarded) redirect('/onboarding')

    const activity = await getActivity(userInfo._id)
    return(
        <>
            <section className='mt-10 flex flex-col gap-5 '>
                {activity.length > 0 ? (
                    <>
                        {activity.map(act => (
                            <Link
                                key={act._id}
                                href={`/tweet/${act.parentId}`}
                            >
                                <article className='notification-card'>
                                    <Image
                                        src={act.author.image}
                                        alt='Profile Image'
                                        width={20}
                                        height={20}
                                        className='rounded-full object-cover'
                                    />
                                    <p className='!text-small-regular text-light-1'>
                                        <span className='mr-1 text-primary-500'>
                                            {act.author.name}
                                        </span>{' '}
                                        replied to your tweet

                                    </p>
                                </article>
                            </Link>
                        ))}
                    </>
                ) : (
                    <p className='text-light-1 text-heading2-bold '>
                        No notifications yet
                    </p>
                )}
            </section>
        </>
    )
}

export default Page