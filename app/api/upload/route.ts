// pages/api/upload-file.ts
import { NextRequest, NextResponse } from 'next/server';
import { stat, mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
    const formData = await request.formData();

    // Получаем файл и SKU код из формы
    const file = formData.get("file") as File | null;
    const sku = formData.get("sku") as string;

    if (!file || !sku) {
        return NextResponse.json(
            { error: "File and SKU are required." },
            { status: 400 }
        );
    }

    const productExists = await checkProductExists(sku);

    if (!productExists) {
        return NextResponse.json(
            { error: 'Product with the given SKU does not exist.' },
            { status: 404 }
        );
    }

    // Указываем папку для загрузки файла с добавлением SKU
    const relativeUploadDir = `/upload-products-img/${sku}`;
    const uploadDir = join(process.cwd(), "public", relativeUploadDir);

    // Проверяем существование директории и создаём её, если не существует
    try {
        await stat(uploadDir);
    } catch (e: any) {
        if (e.code === "ENOENT") {
            await mkdir(uploadDir, { recursive: true });
        } else {
            console.error("Error creating directory during file upload\n", e);
            return NextResponse.json(
                { error: "Something went wrong." },
                { status: 500 }
            );
        }
    }

    try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const filePath = join(uploadDir, file.name);
        await writeFile(filePath, buffer);

        // Возвращаем путь к загруженному файлу
        return NextResponse.json({
            filePath: `${relativeUploadDir}/${file.name}`,
        });
    } catch (e) {
        console.error("Error while trying to upload a file\n", e);
        return NextResponse.json(
            { error: "Something went wrong during file upload." },
            { status: 500 }
        );
    }
}


async function checkProductExists(sku: string): Promise<boolean> {
    try {
        const response = await fetch(process.env.NEXT_PUBLIC_API_URL + `/api/products/sku?sku=${encodeURIComponent(sku)}`);
        const data = await response.json();
        return data.exists;
    } catch (error) {
        console.error('Error checking SKU', error);
        throw new Error('Error checking SKU');
    }
}