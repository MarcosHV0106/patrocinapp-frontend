import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CameraService {
  isSupported(): boolean {
    return Boolean(navigator.mediaDevices?.getUserMedia);
  }

  async start(video: HTMLVideoElement): Promise<MediaStream> {
    if (!this.isSupported()) throw new Error('CAMERA_UNAVAILABLE');
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' } },
      audio: false
    });
    video.srcObject = stream;
    await video.play();
    return stream;
  }

  stop(stream: MediaStream | null, video?: HTMLVideoElement): void {
    stream?.getTracks().forEach((track) => track.stop());
    if (video) video.srcObject = null;
  }

  capture(video: HTMLVideoElement): Promise<File> {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context || !canvas.width || !canvas.height) return Promise.reject(new Error('CAMERA_NOT_READY'));
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    return new Promise((resolve, reject) => canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('CAPTURE_FAILED'));
      resolve(new File([blob], `evidencia-${Date.now()}.jpg`, { type: 'image/jpeg' }));
    }, 'image/jpeg', 0.9));
  }
}
