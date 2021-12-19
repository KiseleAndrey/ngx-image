import { DrawService } from '../../services/draw.service';
import {
	AfterViewInit,
	Component,
	ElementRef,
	Input,
	OnChanges,
	SimpleChanges,
	ViewChild,
} from '@angular/core';

@Component({
	selector: 'app-image',
	templateUrl: './image.component.html',
	styleUrls: ['./image.component.scss'],
	providers: [DrawService],
})
export class ImageComponent implements AfterViewInit, OnChanges {
	@ViewChild('canvas', { static: false })
	canvas: ElementRef<HTMLCanvasElement>;

	@Input() src: string;
	@Input() width: number;
	@Input() height: number;
	@Input() container: HTMLElement;
	@Input() scale = 0.1;
	@Input() blur = 'none';
	@Input() maxZoomOut = 2;
	@Input() maxZoomIn = 5;
	@Input() disabled = false;

	constructor(private canvasDrawService: DrawService) {}

	ngOnChanges(changes: SimpleChanges): void {
		if (
			(changes?.width && !changes.width.firstChange) ||
			(changes?.height && !changes.height.firstChange)
		) {
			this.canvasDrawService.setSize(this.width, this.height);
		}
		if (changes?.src && !changes.src.firstChange) {
			this.canvasDrawService.setSrc(this.src);
		}
		if (changes.disabled !== undefined && !changes.disabled.firstChange) {
			this.canvasDrawService.setDisabled(this.disabled);
		}
		if (changes?.blur && !changes.blur.firstChange) {
			this.canvasDrawService.setBlur(this.blur);
		}
	}

	ngAfterViewInit(): void {
		this.canvasDrawService.initialize(
			this.width,
			this.height,
			this.canvas.nativeElement,
			this.scale,
			this.container,
			this.src,
			this.maxZoomIn,
			this.maxZoomOut,
			this.disabled,
			this.blur
		);
	}

	//Api
	reset() {
		this.canvasDrawService.reset();
	}
}
