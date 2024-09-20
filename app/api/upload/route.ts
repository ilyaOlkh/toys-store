import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Конфигурация Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
    const formData = await request.formData();

    // Получаем файл и путь из формы
    const file = formData.get("file") as File | null;
    const uploadPath = formData.get("path") as string;

    if (!file || !uploadPath) {
        return NextResponse.json(
            { error: "File and path are required." },
            { status: 400 }
        );
    }

    try {
        // Преобразуем файл в base64 строку (или можно использовать путь напрямую, если доступен file.path)
        const buffer = Buffer.from(await file.arrayBuffer());
        const base64String = buffer.toString("base64");
        const dataUrl = `data:${file.type};base64,${base64String}`;

        // Загружаем изображение в Cloudinary по указанному пути
        const uploadResponse = await cloudinary.uploader.upload(dataUrl, {
            folder: uploadPath, // Сохраняем изображение в указанную папку
        });

        // Возвращаем URL загруженного изображения
        return NextResponse.json({
            uploadedImageUrl: uploadResponse.secure_url,
        });
    } catch (e) {
        console.error("Error while trying to upload a file to Cloudinary\n", e);
        return NextResponse.json(
            { error: "Something went wrong during file upload." },
            { status: 500 }
        );
    }
}
