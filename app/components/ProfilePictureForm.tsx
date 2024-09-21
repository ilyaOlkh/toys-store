"use client";

import { SetStateAction, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { setUserPicture } from "../redux/userSlice";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";

export default function ProfilePictureForm({ imgUrl }: { imgUrl: string }) {
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.user.user);

    const [file, setFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(imgUrl);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isHovered, setIsHovered] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        onFileChange(e, setFile, setImageUrl);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const uploadedImageUrl = await uploadImage(file);
            await updateProfilePicture(uploadedImageUrl);
            dispatch(setUserPicture(uploadedImageUrl));
            setSuccess("Аватар успішно оновлено!");
        } catch (err) {
            setError("Помилка при оновленні аватара");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    withPageAuthRequired;
    return (
        <div className="border border-lightGray1 p-5 rounded-2xl flex flex-col gap-2">
            <div className=" text-[18px] font-bold">Змінити аватар:</div>
            <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-2 items-center max-w-44"
            >
                <label
                    className="relative"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    style={{
                        display: "inline-block",
                        position: "relative",
                        cursor: "pointer",
                    }}
                >
                    <img
                        src={imageUrl || "default-avatar.png"}
                        alt="Попередній перегляд профілю"
                        style={{
                            width: "150px",
                            height: "150px",
                            borderRadius: "50%",
                            objectFit: "cover",
                            filter: isHovered ? "brightness(50%)" : "none",
                            transition: "filter 0.3s ease",
                        }}
                    />

                    {isHovered && (
                        <div
                            style={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                fontSize: "24px",
                                color: "white",
                            }}
                        >
                            <AddIcon fontSize="large" />
                        </div>
                    )}

                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                        id="file-input"
                    />
                </label>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        marginTop: "10px",
                        padding: "10px 20px",
                        backgroundColor: loading ? "#ccc" : "#0F83B2",
                        color: "#fff",
                        border: "none",
                        borderRadius: "5px",
                        cursor: loading ? "not-allowed" : "pointer",
                        transition: "background-color 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                        if (!loading)
                            e.currentTarget.style.backgroundColor = "#0C698E";
                    }}
                    onMouseLeave={(e) => {
                        if (!loading)
                            e.currentTarget.style.backgroundColor = "#0F83B2";
                    }}
                >
                    {loading ? "Завантаження..." : "Завантажити зображення"}
                </button>

                {(error || success) && (
                    <div>
                        {error && (
                            <p style={{ color: "red", marginTop: "10px" }}>
                                {error}
                            </p>
                        )}
                        {success && (
                            <p style={{ color: "green", marginTop: "10px" }}>
                                {success}
                            </p>
                        )}
                    </div>
                )}
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
        body: JSON.stringify({ newPictureUrl: uploadedImageUrl }),
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error("Не вдалося оновити аватар");
    }
};
