// app/user/settings/page.tsx
import { Claims, getSession } from "@auth0/nextjs-auth0";
import ProfilePictureForm from "../../components/ProfilePictureForm";
import AccountForm from "@/app/components/settings/AccountForm";

export default async function UserSettings() {
    const userResponse = await getSession();
    let user: Claims | null = null;
    if (userResponse) {
        user = userResponse.user;
    }

    const initialData = {
        firstName: user?.given_name || "",
        lastName: user?.family_name || "",
        orderEmail: user?.user_metadata?.orderEmail || user?.email || "",
        phone: user?.user_metadata?.phone || "",
    };

    return (
        <div className="flex justify-center">
            <div className="customContainer">
                <div className="flex flex-col">
                    <div className="text-[38px] font-bold pb-8">
                        Налаштування
                    </div>
                    <div className="flex gap-8 flex-wrap sm:flex-nowrap">
                        <ProfilePictureForm imgUrl={user!.picture} />
                        <AccountForm initialData={initialData} />
                    </div>
                </div>
            </div>
        </div>
    );
}
