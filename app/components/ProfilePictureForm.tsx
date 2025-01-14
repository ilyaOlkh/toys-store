"use client";
import { SetStateAction, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import { useAppDispatch } from "../redux/hooks";
import { setUserPicture } from "../redux/userSlice";
import { CircularProgress } from "@mui/material";
import { useNotifications } from "@toolpad/core/useNotifications";

export default function ProfilePictureForm({ imgUrl }: { imgUrl: string }) {
    const dispatch = useAppDispatch();
    const notifications = useNotifications();

    const [file, setFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(imgUrl);
    const [loading, setLoading] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        onFileChange(e, setFile, setImageUrl);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setLoading(true);

        try {
            const uploadedImageUrl = await uploadImage(file);
            await updateProfilePicture(uploadedImageUrl);
            dispatch(setUserPicture(uploadedImageUrl));
            notifications.show("Аватар успішно оновлено", {
                severity: "success",
                autoHideDuration: 5000,
            });
        } catch (err) {
            console.error(err);
            notifications.show("Помилка при оновленні аватара", {
                severity: "error",
                autoHideDuration: 5000,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="border border-lightGray1 p-5 rounded-2xl flex flex-col gap-2 justify-between shrink-0">
            <div className="text-lg font-bold">Змінити аватар</div>
            <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-2 items-center"
            >
                <label
                    className="relative cursor-pointer"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <img
                        src={imageUrl || "default-avatar.png"}
                        alt="Попередній перегляд профілю"
                        className="w-[175px] h-[175px] rounded-full object-cover transition-all duration-300"
                        style={{
                            filter: isHovered ? "brightness(50%)" : "none",
                        }}
                    />

                    {isHovered && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl text-white">
                            <AddIcon fontSize="large" />
                        </div>
                    )}

                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-input"
                    />
                </label>

                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue1 text-white py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {loading && (
                        <CircularProgress size={20} className="text-white" />
                    )}
                    {loading ? "Збереження..." : "Завантажити"}
                </button>
            </form>
        </div>
    );
}

function onFileChange(
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (value: SetStateAction<File | null>) => void,
    setImageUrl: (value: SetStateAction<string | null>) => void
) {
    if (e.target.files && e.target.files[0]) {
        setFile(e.target.files[0]);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImageUrl(reader.result as string);
        };
        reader.readAsDataURL(e.target.files[0]);
    }
}

const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", "avatars/");

    const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        throw new Error("Не вдалося завантажити зображення в хмару");
    }

    const { uploadedImageUrl } = await response.json();
    return uploadedImageUrl;
};

const updateProfilePicture = async (uploadedImageUrl: string) => {
    const response = await fetch("/api/user/update-profile", {
        method: "PATCH",
        body: JSON.stringify({ picture: uploadedImageUrl }),
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error("Не вдалося оновити аватар");
    }
};
