import LandingPage from '@/components/shared/LandingPage'
import { fetchTweets } from '@/lib/actions/tweet.actions';
import { fetchUser } from '@/lib/actions/user.actions'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const user = await currentUser()
  if(!user) {
    return(
      <>
        <LandingPage/>
      </>
    )
  }

  const userInfo = await fetchUser(user.id)
  if(!userInfo?.onboarded) redirect('/onboarding')
  
    const result = await fetchTweets( 
      searchParams.page ? +searchParams.page : 1,
      3
    );

    


  return (
    <>
      
    </>
  )
}
