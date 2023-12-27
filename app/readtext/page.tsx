"use client";
import { NextApiRequest, NextApiResponse } from "next";
import Tesseract, { createWorker } from "tesseract.js";
import React, { useState } from "react";

type Props = {};

export default function ReadText({}: Props) {
  const [text, setText] = useState<string | any>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [url, setUrl] = useState<any>();
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const text = await processFile(file);
      setText(text);
    }
  };

  const ocrHandler = async (req: NextApiRequest, res: NextApiResponse) => {
    const file = req.body.file;
    const text = await processFile(file);
    res.status(200).json({ text });
  };

  const processFile = async (file: File) => {
    if (file.type.startsWith("image")) {
      return processImage(file);
    } else if (file.type === "application/pdf") {
      return processPDF(file);
    } else {
      throw new Error("Unsupported file type");
    }
  };


  const processImage = async (file: File) => {
    setLoading(true);
    const newFile = await preprocessImage(file);
    const { data } = await Tesseract.recognize(newFile, "eng");
    setLoading(false);
    setUrl(URL.createObjectURL(file));

    return data.text;
  };

  const preprocessImage = async (file: File) => {
    const image = new Image();
    const reader = new FileReader();

    const loadImage = new Promise<HTMLImageElement>((resolve, reject) => {
      reader.onload = (e) => {
        image.onload = () => resolve(image);
        image.onerror = (err) => reject(err);
        image.src = e.target?.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });

    await loadImage;

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    // Resize hình ảnh để giảm kích thước
    const maxWidth = 800;
    const maxHeight = 800;
    let width = image.width;
    let height = image.height;

    if (width > height && width > maxWidth) {
      height *= maxWidth / width;
      width = maxWidth;
    } else if (height > maxHeight) {
      width *= maxHeight / height;
      height = maxHeight;
    }

    canvas.width = width;
    canvas.height = height;

    // Vẽ hình ảnh đã thay đổi kích thước vào canvas
    context?.drawImage(image, 0, 0, width, height);

    // Cải thiện độ tương phản của hình ảnh
    const imageData = context?.getImageData(0, 0, width, height);
    const brightness = 20; // Điều chỉnh độ tương phản tại đây

    if (imageData) {
      for (let i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i] += brightness;
        imageData.data[i + 1] += brightness;
        imageData.data[i + 2] += brightness;
      }

      context?.putImageData(imageData, 0, 0);
    }

    // Chuyển đổi canvas thành đối tượng hình ảnh Blob
    return new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob as Blob);
      });
    });
  };

  const processPDF = async (file: File) => {};
  return (
    <div className="bg-white h-100 flex">
      <div
        className=" w-50"
        style={{
          width: "50%",
        }}
      >
        <div>
          <h1>OCR Hóa đơn</h1>
          <input
            type="file"
            //   accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileChange}
          />

          {loading && (
            <div className="border mt-3 border-blue-200 shadow rounded-md p-4  mx-3">
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-6 py-1">
                  <div className="h-2 bg-slate-200 rounded"></div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="h-2 bg-slate-200 rounded col-span-2"></div>
                      <div className="h-2 bg-slate-200 rounded col-span-1"></div>
                    </div>
                    <div className="h-2 bg-slate-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {text && (
            <div className="border mt-3 border-blue-200 shadow rounded-md p-4  mx-3">
              {text}
            </div>
          )}
        </div>
      </div>
      <div
        style={{
          width: "50%",
        }}
      >
        <img
          src={url}
          alt=""
          style={{
            width: "auto",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>
    </div>
  );
}
