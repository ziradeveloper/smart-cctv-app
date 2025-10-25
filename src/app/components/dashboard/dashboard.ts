import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DeviceService } from '../../services/deviceservice/device';
import { AuthService } from '../../services/authservice/auth';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit {
  user: any;
  devices: any[] = [];
  activeSessions: any[] = [];

  constructor(
    private authService: AuthService,
    private deviceService: DeviceService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });

    this.loadDevices();
  }

  private loadDevices() {
    this.deviceService.getUserDevices().subscribe({
      next: (devices) => {
        this.devices = devices;
      },
      error: (error) => {
        console.error('Error loading devices:', error);
      }
    });
  }

  navigateToCamera() {
    this.router.navigate(['/camera']);
  }

  navigateToMonitor() {
    this.router.navigate(['/monitor']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}