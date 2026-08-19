import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ThemeToggleComponent } from './theme-toggle.component';
import { ThemeService } from '../../services/theme.service';

describe('ThemeToggleComponent', () => {
  let component: ThemeToggleComponent;
  let fixture: ComponentFixture<ThemeToggleComponent>;
  let themeService: ThemeService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThemeToggleComponent],
      providers: [ThemeService],
    }).compileComponents();

    fixture = TestBed.createComponent(ThemeToggleComponent);
    component = fixture.componentInstance;
    themeService = TestBed.inject(ThemeService);
    fixture.detectChanges();
  });

  it('should create theme toggle component', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle theme when toggleTheme is called or button clicked', () => {
    themeService.setDarkMode(true);
    expect(themeService.isDarkMode()).toBe(true);

    component.toggleTheme();
    expect(themeService.isDarkMode()).toBe(false);

    const button = fixture.nativeElement.querySelector('button');
    expect(button).toBeTruthy();
    button.click();
    expect(themeService.isDarkMode()).toBe(true);
  });

  it('should update aria-label when theme changes', () => {
    themeService.setDarkMode(true);
    fixture.detectChanges();
    let button = fixture.nativeElement.querySelector('button');
    expect(button.getAttribute('aria-label')).toBe('Switch to light mode');

    themeService.setDarkMode(false);
    fixture.detectChanges();
    button = fixture.nativeElement.querySelector('button');
    expect(button.getAttribute('aria-label')).toBe('Switch to dark mode');
  });
});
