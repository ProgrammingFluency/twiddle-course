        // @ts-ignore
    import { Webhook } from 'svix'
    import { headers } from 'next/headers'
    import { WebhookEvent } from '@clerk/nextjs/server'
    import { createUser, updateUser} from '@/lib/actions/user.actions'
import { addMemberToGroup, createGroup, deleteGroup, removeUserFromGroup, updateGroupInfo } from '@/lib/actions/group.actions'

    export async function POST(req: Request) {
    // You can find this in the Clerk Dashboard -> Webhooks -> choose the endpoint
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET

    if (!WEBHOOK_SECRET) {
        throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
    }

    // Get the headers
    const headerPayload = headers()
    const svix_id = headerPayload.get('svix-id')
    const svix_timestamp = headerPayload.get('svix-timestamp')
    const svix_signature = headerPayload.get('svix-signature')

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response('Error occured -- no svix headers', {
        status: 400,
        })
    }

    // Get the body
    const payload = await req.json()
    const body = JSON.stringify(payload)

    // Create a new Svix instance with your secret.
    const wh = new Webhook(WEBHOOK_SECRET)
    

    let evt: WebhookEvent

    // Verify the payload with the headers
    try {
        evt = wh.verify(body, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
        }) as WebhookEvent
    } catch (err) {
        console.error('Error verifying webhook:', err)
        return new Response('Error occured', {
        status: 400,
        })
    }

    // Do something with the payload
    // For this guide, you simply log the payload to the console
    if ( evt.type === 'user.created' ) {
        const user = evt.data
        await createUser({
            userId: user.id,
            email: user.email_addresses[0].email_address,
            name: `${user.first_name || ''} ${user.last_name || ''}`,
            username: user.username || '',
            image: user.image_url || '',
          });
    }  
    if( evt.type === 'user.updated' ) {
        const user = evt.data
        await updateUser({
            userId: user.id,
            email: user.email_addresses[0].email_address,
            name: `${user.first_name || ''} ${user.last_name || ''}`,
            username: user.username || '',
            image: user.image_url || '',
        })
    }

    if( evt.type === 'organization.created' ) {
        const { id, name, slug, image_url, created_by } = evt.data
        await createGroup ({
            id,
            name,
            username: slug,
            image: image_url || '',
            createdById: created_by
        })
    }

    if( evt.type === 'organizationMembership.created' ) {
        const { organization, public_user_data } = evt.data
        await addMemberToGroup(organization.id, public_user_data.user_id)
    }

    if( evt.type === 'organizationMembership.deleted' ) {
        const { organization, public_user_data } = evt.data
        await removeUserFromGroup( public_user_data.user_id, organization.id )
    }

    if( evt.type === 'organization.updated' ) {
        const { id, image_url, name, slug } = evt.data
        await updateGroupInfo( id, name, slug, ( image_url || '' ) )
    }

    if( evt.type === 'organization.deleted' ) {
        const { id } = evt.data
        // @ts-ignore
        await deleteGroup(id)
    }

    return new Response('', { status: 200 })
    }