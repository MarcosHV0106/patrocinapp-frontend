import { CameraService } from './camera.service';

describe('CameraService', () => {
  const service = new CameraService();

  it('solicita la cámara posterior y detiene todos los tracks', async () => {
    const stopA = vi.fn();
    const stopB = vi.fn();
    const stream = { getTracks: () => [{ stop: stopA }, { stop: stopB }] } as unknown as MediaStream;
    const getUserMedia = vi.fn().mockResolvedValue(stream);
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia } });
    const video = document.createElement('video');
    video.play = vi.fn().mockResolvedValue(undefined);

    await expect(service.start(video)).resolves.toBe(stream);
    expect(getUserMedia).toHaveBeenCalledWith({ video: { facingMode: { ideal: 'environment' } }, audio: false });
    service.stop(stream, video);
    expect(stopA).toHaveBeenCalledOnce();
    expect(stopB).toHaveBeenCalledOnce();
    expect(video.srcObject).toBeNull();
  });

  it('convierte una captura del video en un archivo JPEG', async () => {
    const drawImage = vi.fn();
    const canvas = {
      width: 0, height: 0,
      getContext: () => ({ drawImage }),
      toBlob: (callback: BlobCallback) => callback(new Blob(['foto'], { type: 'image/jpeg' }))
    } as unknown as HTMLCanvasElement;
    const createElement = vi.spyOn(document, 'createElement').mockReturnValue(canvas);
    const video = { videoWidth: 640, videoHeight: 480 } as HTMLVideoElement;

    const file = await service.capture(video);
    expect(file.type).toBe('image/jpeg');
    expect(file.name).toMatch(/^evidencia-/);
    expect(drawImage).toHaveBeenCalled();
    createElement.mockRestore();
  });
});
