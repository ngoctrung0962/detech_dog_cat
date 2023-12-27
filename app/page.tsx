"use client"
import Image from 'next/image'
import { useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as knnClassifier from '@tensorflow-models/knn-classifier';
import ImageRecognition from '@/components/ImageRecognition';

export default function Home() {
  // useEffect(() => {
  //   async function runModel() {
  //     const URL = '../public/traningmodel/'; // Thay thế URL_MODEL_XUAT_TU_TEACHABLE_MACHINE bằng URL tới file model đã xuất từ Teachable Machine
  //     const modelURL = URL + 'model.json';
  //     const metadataURL = URL + 'metadata.json';

  //     const model = await tf.loadLayersModel(modelURL)
  //     const modelmeta = await tf.loadLayersModel(metadataURL)

  //     // Sử dụng model để thực hiện dự đoán
  //   }
  //   runModel();
  // }, []);
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <ImageRecognition />
    </main>
  )
}
