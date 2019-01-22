import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MusicCatalogComponent } from './music-catalog.component';

describe('MusicCatalogComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      declarations: [
        MusicCatalogComponent
      ],
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(MusicCatalogComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'MediaManager'`, () => {
    const fixture = TestBed.createComponent(MusicCatalogComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('MediaManager');
  });

  it('should render title in a h1 tag', () => {
    const fixture = TestBed.createComponent(MusicCatalogComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('MediaManager');
  });
});
