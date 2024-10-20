import { currentUser } from "@clerk/nextjs/server";

const Page = async ( { params }: { params: { id: string } } ) => {
    const user = await currentUser();
    if (!user) return null;

    const groupDetails = await fetchGroupDetails(params.id);

}

export default Page