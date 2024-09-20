import { Claims, getSession, updateSession } from "@auth0/nextjs-auth0";
import ProfilePictureForm from "../components/ProfilePictureForm";

export default async function Header() {
    const userResponse = await getSession();
    let user: Claims | null = null;
    if (userResponse) {
        user = userResponse.user;
    }

    return (
        <div className="flex justify-center">
            <div className="customContainer">
                {user ? (
                    <div>
                        42 братуха 42 БРАТУХАНЧИК😎🤟🤟🤟🤙🤙🤙 КЕМЕРОВО
                        ЭУУУ🤙🤙😎😎
                        <ProfilePictureForm imgUrl={user.picture} />
                    </div>
                ) : (
                    <div>{"авторизируйся, 41 амиго("}</div>
                )}
            </div>
        </div>
    );
}
