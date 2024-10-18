'use client'

import { useForm } from "react-hook-form";
import * as z from 'zod'
import { zodResolver } from "@hookform/resolvers/zod";

import { 
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
 } from "../ui/form";
 import { Button } from '@/components/ui/button'
import { Textarea } from "@/components/ui/textarea";
import { TweetValidation } from "@/lib/validations/tweet";
import { usePathname, useRouter } from "next/navigation";
import { createTweet } from "@/lib/actions/tweet.actions";
import { useOrganization } from "@clerk/nextjs";

interface Props {
    userId: string
}

const PostTweet = ( { userId }: Props ) => {
    const pathname = usePathname()
    const router = useRouter()
    const { organization } = useOrganization()


    const form = useForm< z.infer< typeof TweetValidation> >({
        resolver: zodResolver(TweetValidation),
        defaultValues: {
            tweet: '',
            accountId: userId
        }
    })

    const onSubmit = async ( values: z.infer< typeof TweetValidation> ) => {
        await createTweet({
            text: values.tweet,
            author: userId,
            path: pathname,
            groupId: organization ? organization.id : null
        })

        router.push('/')

    }
    return (
        <>
            <Form {...form}>
            <form
                        className='mt-10 flex flex-col justify-start gap-10'
                        onSubmit= { form.handleSubmit(onSubmit) }
                    >
                        <FormField
                            control={form.control}
                            name="tweet"
                            render={ ( { field } ) => (
                                <FormItem className='flex w-full flex-col gap-3'>
                                    <FormLabel className='text-base-semibold text-light-2'>
                                        Content
                                    </FormLabel>
                                    <FormControl className="no-focus border border-dark-4 bg-dark-3 text-light-1">
                                        <Textarea
                                            rows={15}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                                ) }
                        />
                        

                        <Button type="submit" className="bg-primary-500">
                            Post Tweet
                        </Button>

                    </form>
            </Form>
        </>
    )
}

export default PostTweet