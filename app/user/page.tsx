import { Claims, getSession } from '@auth0/nextjs-auth0';

export default async function Header() {
    const userResponse = await getSession();
    let user: Claims | null = null;
    if (userResponse) {
        user = userResponse.user
    }

    return <div className='flex justify-center'>
        <div className='customContainer'>{
            user ? <div>
                42 братуха 42 БРАТУХАНЧИК😎🤟🤟🤟🤙🤙🤙 КЕМЕРОВО ЭУУУ🤙🤙😎😎
            </div> :
                <div>
                    {"авторизируйся, 41 амиго("}
                </div>
        }</div>
    </div>
}