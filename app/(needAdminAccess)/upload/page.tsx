"use client";
import { useState } from "react";

export default function UploadPage() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [sku, setSku] = useState<string>("");
    const [uploadResult, setUploadResult] = useState<string | null>(null);

    // Обработка выбора файла
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        setSelectedFile(file);
    };

    // Обработка отправки формы
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        setUploadResult("loading...");
        event.preventDefault();

        if (!selectedFile || !sku) {
            alert("Please select a file and enter SKU.");
            return;
        }

        // Создаем FormData для отправки файла и SKU
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("path", "upload-products-img/" + sku);

        try {
            // Отправляем файл на сервер
            const uploadResponse = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!uploadResponse.ok) {
                throw new Error("Error uploading file");
            }

            const uploadData = await uploadResponse.json();
            const uploadedImageUrl = uploadData.uploadedImageUrl;
            // Отправляем путь к файлу и SKU на сервер для сохранения в базе данных
            const savePathResponse = await fetch(
                process.env.NEXT_PUBLIC_API_URL + "/api/products/upload-img",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        sku_code: sku,
                        filePath: uploadedImageUrl,
                    }),
                }
            );

            if (!savePathResponse.ok) {
                throw new Error(
                    "Error saving file path" +
                        (await savePathResponse.json()).error
                );
            }

            setUploadResult("File uploaded and path saved successfully!");
        } catch (error) {
            console.error("Error:", error);
            setUploadResult("Error uploading file.");
        }
    };

    return (
        <div className="flex flex-col items-center p-4">
            <h1 className="text-2xl font-bold mb-4">Upload a File with SKU</h1>
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                {/* Поле для ввода SKU */}
                <div className="flex flex-col">
                    <label htmlFor="sku" className="font-medium">
                        Enter SKU:
                    </label>
                    <input
                        type="text"
                        id="sku"
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        className="p-2 border rounded"
                        required
                    />
                </div>
                {/* Поле для выбора файла */}
                <div className="flex flex-col">
                    <label htmlFor="file" className="font-medium">
                        Choose a file:
                    </label>
                    <input
                        type="file"
                        id="file"
                        onChange={handleFileChange}
                        className="p-2 border rounded"
                    />
                </div>
                {/* Кнопка для отправки формы */}
                <button
                    type="submit"
                    className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                >
                    Upload
                </button>
            </form>
            {/* Отображение результата загрузки */}
            {uploadResult && (
                <p
                    className={`mt-4 ${
                        uploadResult ===
                        "File uploaded and path saved successfully!"
                            ? " text-green-500"
                            : "text-red-500"
                    }`}
                >
                    {uploadResult}
                </p>
            )}
        </div>
    );
}
