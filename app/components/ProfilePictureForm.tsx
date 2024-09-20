"use client";

import { updateSession } from "@auth0/nextjs-auth0";
import { useState } from "react";
import { updateUserSession } from "../service/updateSession";

export default function ProfilePictureForm({ imgUrl }: { imgUrl: string }) {
    const [file, setFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(imgUrl);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageUrl(reader.result as string);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setLoading(true);
        setError(null);

        try {
            // 1. Загружаем фото в облако
            const formData = new FormData();
            formData.append("file", file);
            formData.append("path", "avatars/");

            const uploadResponse = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!uploadResponse.ok) {
                throw new Error("Failed to upload image to cloud");
            }

            const { uploadedImageUrl } = await uploadResponse.json();
            // 2. Отправляем ссылку на изображение в API для обновления профиля
            const response = await fetch("/api/user/update-profile", {
                method: "PATCH",
                body: JSON.stringify({ newPictureUrl: uploadedImageUrl }),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to update profile picture");
            }

            const result = await response.json();
        } catch (err) {
            setError("Error updating profile picture");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                />
                <button type="submit" disabled={loading}>
                    {loading ? "Uploading..." : "Upload Picture"}
                </button>
                {error && <p>{error}</p>}
            </form>
            {imageUrl && (
                <img
                    src={imageUrl}
                    alt="Profile Preview"
                    style={{ marginTop: "10px", maxWidth: "100px" }}
                />
            )}
        </div>
    );
}
