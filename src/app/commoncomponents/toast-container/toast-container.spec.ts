import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { ToastContainer } from './toast-container';
import { ToastService } from '../../services/toastservice/toast';

describe('ToastContainer', () => {
  let component: ToastContainer;
  let fixture: ComponentFixture<ToastContainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, ToastContainer],
      providers: [ToastService],
    }).compileComponents();

    fixture = TestBed.createComponent(ToastContainer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});