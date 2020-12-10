import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { InputPaneComponent } from './input-pane.component';

describe('InputPaneComponent', () => {
  let component: InputPaneComponent;
  let fixture: ComponentFixture<InputPaneComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InputPaneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InputPaneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
