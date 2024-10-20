import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { fetchUser } from "@/lib/actions/user.actions";
import AccountInfo from "@/components/forms/AccountInfo";
import { UserProfile } from "@clerk/nextjs";
import { dark } from '@clerk/themes'



async function Page() {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const userData = {
    id: user.id,
    objectId: userInfo?._id,
    username: userInfo ? userInfo?.username : user.username,
    name: userInfo ? userInfo?.name : user.firstName ?? "",
    bio: userInfo ? userInfo?.bio : "",
    image: userInfo ? userInfo?.image : user.imageUrl,
  };

  return (
    <>
      <h1 className='head-text'>Edit Profile</h1>

      
      <div className="mt-10 " >
                <UserProfile
                    appearance={{
                    baseTheme: dark,
                    }}
                    routing="hash"
                />
        </div>

      <section className='mt-12'>
        <AccountInfo user={userData} />
      </section>
    </>
  );
}

export default Page;