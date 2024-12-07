import { Claims, getSession } from "@auth0/nextjs-auth0";
import ProfilePictureForm from "../../components/ProfilePictureForm";

export default async function Header() {
    const userResponse = await getSession();
    let user: Claims | null = null;
    if (userResponse) {
        user = userResponse.user;
    }

    return (
        <div className="flex justify-center">
            <div className="customContainer">
                {
                    <div>
                        <div className="text-[38px] font-bold mb-10">
                            Налаштування
                        </div>
                        <div className="flex justify-start">
                            <ProfilePictureForm imgUrl={user!.picture} />
                        </div>
                    </div>
                }
            </div>
        </div>
    );
}
