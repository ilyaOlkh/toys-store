// utils/uploadProductImage.ts

interface UploadedImage {
    id: number;
    url: string;
}

export async function uploadProductImage(
    file: File,
    productSku: string
): Promise<UploadedImage> {
    // First upload the file to cloudinary
    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", "products/");

    const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
    });

    if (!uploadResponse.ok) {
        throw new Error("Failed to upload image to cloud storage");
    }

    const { uploadedImageUrl } = await uploadResponse.json();

    // Save the image URL in the database
    const saveResponse = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/products/upload-img`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                sku_code: productSku,
                filePath: uploadedImageUrl,
            }),
        }
    );

    if (!saveResponse.ok) {
        throw new Error("Failed to save image to database");
    }

    const result = await saveResponse.json();
    return {
        id: Date.now(), // Since the API doesn't return an ID, we'll use timestamp
        url: uploadedImageUrl,
    };
}

// Helper function to upload multiple images
export async function uploadMultipleProductImages(
    files: FileList,
    productSku: string,
    onProgress?: (
        tempId: number,
        url: string,
        status: "uploading" | "success" | "error"
    ) => void
): Promise<UploadedImage[]> {
    const uploads = Array.from(files).map(async (file) => {
        const tempId = Date.now() + Math.random();
        const tempUrl = URL.createObjectURL(file);

        try {
            onProgress?.(tempId, tempUrl, "uploading");
            const result = await uploadProductImage(file, productSku);
            onProgress?.(tempId, result.url, "success");
            URL.revokeObjectURL(tempUrl); // Clean up the temporary URL
            return result;
        } catch (error) {
            onProgress?.(tempId, tempUrl, "error");
            URL.revokeObjectURL(tempUrl);
            throw error;
        }
    });

    return Promise.all(uploads);
}
