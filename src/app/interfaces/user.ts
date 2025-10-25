export interface User {
    _id: number;
    email: string;
    password: string;
    fullName: string;
    createdAt: Date;
    devices: Devices[];
}

export interface Devices {
    deviceId: string;
    deviceName: string;
    deviceType: 'camera' | 'monitor';
    lastSeen: Date;
    isOnline: boolean;
}

export interface Session {
    cameraDeviceId: string;
    monitorDeviceId: string;
    startTime: Date;
    endTime?: Date;
    isActive: boolean;
}