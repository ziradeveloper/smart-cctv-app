import { Routes } from '@angular/router';
import path from 'path';
import { Login } from './components/login/login';
import { Monitor } from './components/monitor/monitor';
import { Dashboard } from './components/dashboard/dashboard';
import { Camera } from './components/camera/camera';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: Login },
    { path: 'dashboard', component: Dashboard },
    { path: 'camera', component: Camera },
    { path: 'monitor', component: Monitor },
    { path: '**', redirectTo: '/login' }
];