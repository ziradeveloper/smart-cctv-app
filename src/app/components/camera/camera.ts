import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/authservice/auth';
import { DeviceService, StreamingSession } from '../../services/deviceservice/device';

@Component({
  selector: 'app-camera',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './camera.html',
  styleUrls: ['./camera.scss']
})
export class Camera implements OnInit, OnDestroy {
  @ViewChild('cameraPreview', { static: true }) cameraPreview!: ElementRef<HTMLVideoElement>;

  isStreaming = false;
  devices: any[] = [];
  selectedMonitorDeviceId: string = '';
  currentSession: StreamingSession | null = null;
  private mediaStream: MediaStream | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private context: CanvasRenderingContext2D | null = null;
  private frameInterval: any;
  hasCameraAccess = false;

  constructor(
    private deviceService: DeviceService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    await this.initializeCamera();
    this.loadUserDevices();
    
    // Listen for session updates
    this.deviceService.streamingSession$.subscribe(session => {
      this.currentSession = session;
      this.isStreaming = !!session;
    });
  }

  ngOnDestroy() {
    this.stopStreaming();
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
    }
    if (this.frameInterval) {
      clearInterval(this.frameInterval);
    }
  }

  private async initializeCamera() {
    try {
      // Check if browser supports media devices
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported in this browser');
      }

      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 },
          facingMode: 'environment'
        },
        audio: false
      });
      
      // Set the video stream to the video element
      this.cameraPreview.nativeElement.srcObject = this.mediaStream;
      
      // Setup canvas for frame capture
      this.canvas = document.createElement('canvas');
      this.context = this.canvas.getContext('2d');
      this.canvas.width = 640;
      this.canvas.height = 480;
      
      this.hasCameraAccess = true;
      
    } catch (error: any) {
      console.error('Error accessing camera:', error);
      this.hasCameraAccess = false;
      alert(`Cannot access camera: ${error.message}. Please check permissions.`);
    }
  }

  private loadUserDevices() {
    this.deviceService.getUserDevices().subscribe({
      next: (devices) => {
        this.devices = devices.filter(device => 
          device.deviceType === 'monitor' && device.isOnline
        );
      },
      error: (error) => {
        console.error('Error loading devices:', error);
      }
    });
  }

  async startStreaming() {
    if (!this.selectedMonitorDeviceId) {
      alert('Please select a monitor device');
      return;
    }

    if (!this.hasCameraAccess) {
      alert('Camera access is required for streaming');
      return;
    }

    try {
      // Register as camera device if not already
      await this.deviceService.registerDevice('Camera Device', 'camera').toPromise();
      
      // Start capturing and sending frames
      this.startFrameCapture();
      this.isStreaming = true;
      
    } catch (error: any) {
      console.error('Error starting stream:', error);
      alert(`Failed to start streaming: ${error.message}`);
    }
  }

  stopStreaming() {
    if (this.frameInterval) {
      clearInterval(this.frameInterval);
      this.frameInterval = null;
    }
    
    if (this.currentSession) {
      this.deviceService.stopStreaming(this.currentSession.sessionId);
    }
    
    this.isStreaming = false;
  }

  private startFrameCapture() {
    this.frameInterval = setInterval(() => {
      this.captureAndSendFrame();
    }, 100); // 10 FPS
  }

  private captureAndSendFrame() {
    if (!this.mediaStream || !this.canvas || !this.context || !this.cameraPreview) return;

    try {
      // Draw current video frame to canvas
      this.context.drawImage(
        this.cameraPreview.nativeElement, 
        0, 0, 
        this.canvas.width, 
        this.canvas.height
      );
      
      // Convert to base64 for transmission (lower quality for performance)
      const frameData = this.canvas.toDataURL('image/jpeg', 0.3);
      this.deviceService.sendVideoFrame(frameData);
      
    } catch (error: any) {
      console.error('Error capturing frame:', error);
    }
  }

  // Alternative method using ImageCapture API (if supported)
  private async captureFrameWithImageCapture() {
    if (!this.mediaStream) return;

    const videoTrack = this.mediaStream.getVideoTracks()[0];
    
    // Check if ImageCapture is supported
    if ('ImageCapture' in window) {
      try {
        const imageCapture = new (window as any).ImageCapture(videoTrack);
        const bitmap = await imageCapture.grabFrame();
        
        if (this.context && this.canvas) {
          this.context.drawImage(bitmap, 0, 0, this.canvas.width, this.canvas.height);
          const frameData = this.canvas.toDataURL('image/jpeg', 0.5);
          this.deviceService.sendVideoFrame(frameData);
        }
      } catch (error: any) {
        console.error('Error with ImageCapture:', error);
        // Fallback to canvas method
        this.captureAndSendFrame();
      }
    } else {
      // Fallback to canvas method
      this.captureAndSendFrame();
    }
  }

  // Request camera permission again if denied
  async retryCameraAccess() {
    try {
      await this.initializeCamera();
      if (this.hasCameraAccess) {
        alert('Camera access granted!');
      }
    } catch (error: any) {
      alert(`Failed to access camera: ${error.message}`);
    }
  }
}