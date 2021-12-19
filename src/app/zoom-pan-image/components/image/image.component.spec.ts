import { DrawService } from '../../services/draw.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageComponent } from './image.component';
import { SimpleChange } from '@angular/core';

describe('ImageComponent', () => {
	let component: ImageComponent;
	let fixture: ComponentFixture<ImageComponent>;
	let service: DrawService;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ImageComponent],
			providers: [
				{
					provide: DrawService,
					useValue: {
						reset: () => {},
						init: () => {},
						setSrc: (src: string) => {},
						setDisabled: (disabled: boolean) => {},
						setSize: (width: number, height: number) => {},
					},
				},
			],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ImageComponent);
		component = fixture.componentInstance;
		service = fixture.debugElement.injector.get(DrawService);
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should be call reset', () => {
		spyOn(service, 'reset').and.callThrough();
		component.reset();
		expect(service.reset).toHaveBeenCalled();
	});

	it('should be call initialize', () => {
		spyOn(service, 'initialize').and.callThrough();
		component.ngAfterViewInit();
		expect(service.initialize).toHaveBeenCalled();
	});

	it('should be call zoomIn', () => {
		spyOn(service, 'zoomIn').and.callThrough();
		component.zoomIn();
		expect(service.zoomIn).toHaveBeenCalled();
	});

	it('should be call zoomOut', () => {
		spyOn(service, 'zoomOut').and.callThrough();
		component.zoomOut();
		expect(service.zoomOut).toHaveBeenCalled();
	});

	it('should NOT be call zoomOut', () => {
		component.disabled = true;
		fixture.detectChanges();
		spyOn(service, 'zoomOut').and.callThrough();
		component.zoomOut();
		expect(service.zoomOut).not.toHaveBeenCalled();
	});

	it('should NOT be call zoomIn', () => {
		component.disabled = true;
		fixture.detectChanges();
		spyOn(service, 'zoomIn').and.callThrough();
		component.zoomIn();
		expect(service.zoomIn).not.toHaveBeenCalled();
	});

	it('should  be call setDisabled', () => {
		spyOn(service, 'setDisabled').and.callThrough();
		component.disabled = true;
		component.ngOnChanges({ disabled: new SimpleChange(null, component.disabled, false) });
		fixture.detectChanges();
		expect(service.setDisabled).toHaveBeenCalled();
	});

	it('should  be call setSrc', () => {
		spyOn(service, 'setSrc').and.callThrough();
		component.src = 'fff';
		component.ngOnChanges({ src: new SimpleChange(null, component.src, false) });
		fixture.detectChanges();
		expect(service.setSrc).toHaveBeenCalled();
	});

	it('should  be call setSize', () => {
		spyOn(service, 'setSize').and.callThrough();
		component.height = 500;
		component.ngOnChanges({ height: new SimpleChange(null, component.height, false) });
		fixture.detectChanges();
		expect(service.setSize).toHaveBeenCalled();
	});

	it('should be call setBlur', () => {
		spyOn(service, 'setBlur').and.callThrough();
		component.blur = 'blur(4px)';
		component.ngOnChanges({ blur: new SimpleChange(null, component.blur, false) });
		fixture.detectChanges();
		expect(service.setBlur).toHaveBeenCalled();
	});
});
