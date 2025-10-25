import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeviceService, StreamingSession } from '../../services/deviceservice/device';

@Component({
  selector: 'app-monitor',
  imports: [CommonModule, FormsModule],
  templateUrl: './monitor.html',
  styleUrls: ['./monitor.scss']
})
export class Monitor implements OnInit, OnDestroy {
  isMonitoring = false;
  availableCameras: any[] = [];
  selectedCameraDeviceId: string = '';
  currentSession: StreamingSession | null = null;
  videoFrame: string = '';

  constructor(private deviceService: DeviceService) {}

  ngOnInit() {
    // Register as monitor device
    this.deviceService.registerDevice('Monitor Device', 'monitor').subscribe();
    
    // Listen for session updates
    this.deviceService.streamingSession$.subscribe(session => {
      this.currentSession = session;
      this.isMonitoring = !!session;
    });

    // Listen for video frames
    this.setupVideoFrameListener();
    
    this.loadAvailableCameras();
  }

  ngOnDestroy() {
    if (this.currentSession) {
      this.deviceService.stopStreaming(this.currentSession.sessionId);
    }
  }

  private setupVideoFrameListener() {
    // This would be connected to the socket service
    // For now, we'll simulate receiving frames
  }

  private loadAvailableCameras() {
    this.deviceService.getUserDevices().subscribe({
      next: (devices) => {
        this.availableCameras = devices.filter(device => 
          device.deviceType === 'camera' && device.isOnline
        );
      },
      error: (error) => {
        console.error('Error loading cameras:', error);
      }
    });
  }

  startMonitoring() {
    if (!this.selectedCameraDeviceId) {
      alert('Please select a camera device');
      return;
    }

    // In a real implementation, this would connect to the camera
    this.isMonitoring = true;
    
    // Simulate receiving video frames
    this.simulateVideoStream();
  }

  stopMonitoring() {
    this.isMonitoring = false;
    this.videoFrame = '';
    
    if (this.currentSession) {
      this.deviceService.stopStreaming(this.currentSession.sessionId);
    }
  }

  private simulateVideoStream() {
    // This would be replaced with actual socket frame reception
    const frames = [
      'assets/frame1.jpg',
      'assets/frame2.jpg',
      'assets/frame3.jpg'
    ];
    
    let currentFrame = 0;
    const frameInterval = setInterval(() => {
      if (!this.isMonitoring) {
        clearInterval(frameInterval);
        return;
      }
      
      this.videoFrame = frames[currentFrame];
      currentFrame = (currentFrame + 1) % frames.length;
    }, 100);
  }
}