import * as tmImage from "@teachablemachine/image";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
interface Prediction {
  className: string;
  probability: number;
}

export default function ImageRecognition(): JSX.Element {
  const [predictions, setPredictions] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [url, setUrl] = useState<any>();

  const onDrop = async (acceptedFiles: File[]) => {
    setIsLoading(true);
    setPredictions([]);

    const image = new Image() as HTMLImageElement;
    const reader = new FileReader();
    reader.onload = async () => {
      image.src = reader.result as string;
      await image.decode();

      const URL = "traningmodel/"; // Thay thế URL_MODEL_XUAT_TU_TEACHABLE_MACHINE bằng URL tới file model đã xuất từ Teachable Machine
      const modelURL = URL + "model.json";
      const metadataURL = URL + "metadata.json";

      const model = await tmImage.load(modelURL, metadataURL);
      const maxPredictions = model.getTotalClasses();

      const prediction = await model.predict(image);

      setPredictions(prediction);
    };
    reader.readAsDataURL(acceptedFiles[0]);
    setUrl(URL.createObjectURL(acceptedFiles[0]));
    setIsLoading(false);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div>
      <div
        {...getRootProps()}
        style={{
          cursor: "pointer",
          border: "2px dashed gray",
          padding: "16px",
          textAlign: "center",
        }}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Thả ảnh vào đây...</p>
        ) : (
          <p>Kéo và thả ảnh vào đây, hoặc nhấp để chọn ảnh</p>
        )}
      </div>
      {isLoading && <p>Đang nhận dạng...</p>}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "20px 0",
        }}
      >
        {predictions.length > 0 ? (
          <img
            src={url}
            alt=""
            style={{
              width: "300px",
              height: "auto",
              objectFit: "contain",
            }}
          />
        ) : (
          <img
            src="/placeholder-image.jpg"
            alt=""
            style={{
              width: "300px",
              height: "auto",
            }}
          />
        )}
      </div>

      {predictions.length > 0 && (
        <div>
          <h2>Kết quả nhận dạng:</h2>

          <ul>
            {predictions.map((prediction: any, index: any) => (
              <li key={index}>{`${prediction.className} (${Math.round(
                prediction.probability * 100
              )}%)`}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
