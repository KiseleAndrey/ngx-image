import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { filter, finalize, takeUntil, tap } from 'rxjs/operators';
import { MouseWheel } from '../enums/mouseWheel';
import { EventManager } from '../utils/event-manager';

@Injectable()
export class DrawService implements OnDestroy {
	private canvas: HTMLCanvasElement;
	private imagePositionX: number;
	private imagePositionY: number;
	private calculateImageWidth: number;
	private calculateImageHeight: number;
	private firstCalculateImageWidth: number;
	private firstCalculateImageHeight: number;
	private originalWidth: number;
	private originalHeight: number;
	private scale: number;
	private maxZoomOut: number;
	private maxZoomIn: number;
	private blur: string;
	private disabled: boolean;
	private image = new Image();
	private eventManager: EventManager;
	private componentAlive = new Subject();
	private readonly zoomMultiplier =300;

	constructor() { }

	initialize(
		width: number,
		height: number,
		canvas: HTMLCanvasElement,
		scale: number,
		container: HTMLElement,
		src: string,
		maxZoomIn: number,
		maxZoomOut: number,
		disabled: boolean,
		blur: string
	) {
		this.originalHeight = height;
		this.originalWidth = width;
		this.scale = scale;
		this.canvas = canvas;
		this.maxZoomIn = maxZoomIn;
		this.maxZoomOut = maxZoomOut;
		this.blur = blur;
		this.disabled = disabled;
		this.setSrc(src);
		this.eventManager = new EventManager(container);
		this.subscribeToMauseEvents();
		this.subscribeToTouchEvents();
	}

	reset() {
		this.initializeCanvas();
		this.updateCanvas();
	}


	setBlur(blur: string) {
		this.blur = blur;
		this.updateCanvas();
	}

	setDisabled(disabled: boolean) {
		this.disabled = disabled;
	}

	setSrc(src: string) {
		this.image = new Image();
		this.image.onload = () => {
			this.initializeCanvas();
			this.updateCanvas();
		};
		this.image.src = src;
	}

	setSize(width: number, height: number) {
		this.originalWidth = width;
		this.originalHeight = height;
		this.initializeCanvas();
		this.updateCanvas();
	}

	private zoomIn() {
		const canZoomIn =
			this.calculateImageHeight * this.calculateImageWidth <=
			this.firstCalculateImageHeight * this.maxZoomIn * (this.firstCalculateImageWidth * this.maxZoomIn);
		if (canZoomIn) {
			const prevWidth = this.calculateImageWidth;
			const prevHeight = this.calculateImageHeight;
			this.calculateImageWidth =
				this.calculateImageWidth + this.calculateImageWidth / (this.scale * this.zoomMultiplier);
			this.calculateImageHeight =
				this.calculateImageHeight + this.calculateImageHeight / (this.scale * this.zoomMultiplier);
			if (this.calculateImageWidth < this.originalWidth) {
				this.imagePositionX -= Math.round(
					Math.abs(this.calculateImageWidth - prevWidth) / 2
				);
				this.imagePositionY -= Math.round(
					Math.abs(this.calculateImageHeight - prevHeight) / 2
				);
			} else {
				this.imagePositionX += Math.round((prevWidth - this.calculateImageWidth) / 2);
				this.imagePositionY += Math.round((prevHeight - this.calculateImageHeight) / 2);
			}
			this.updateCanvas();
		}
	}

	private zoomOut() {
		const canZoomOut =
			this.calculateImageHeight * this.calculateImageWidth >=
			(this.firstCalculateImageHeight / this.maxZoomOut) * (this.firstCalculateImageWidth / this.maxZoomOut);
		if (canZoomOut) {
			const prevWidth = this.calculateImageWidth;
			const prevHeight = this.calculateImageHeight;
			this.calculateImageWidth =
				this.calculateImageWidth - this.calculateImageWidth / (this.scale * this.zoomMultiplier);
			this.calculateImageHeight =
				this.calculateImageHeight - this.calculateImageHeight / (this.scale * this.zoomMultiplier);
			this.imagePositionX += Math.round((prevWidth - this.calculateImageWidth) / 2);
			this.imagePositionY += Math.round((prevHeight - this.calculateImageHeight) / 2);
			this.updateCanvas();
		}
	}

	ngOnDestroy(): void {
		this.componentAlive.next();
		this.componentAlive.complete();
	}

	private initializeCanvas() {
		this.calculateImageSize();
		this.firstCalculateImageWidth = this.calculateImageWidth;
		this.firstCalculateImageHeight = this.calculateImageHeight;
		this.imagePositionX = (this.originalWidth - this.calculateImageWidth) / 2;
		this.imagePositionY = (this.originalHeight - this.calculateImageHeight) / 2;
		this.canvas.width = this.originalWidth;
		this.canvas.height = this.originalHeight;
	}

	private calculateImageSize() {
		if (this.originalWidth < this.image.naturalWidth || this.originalHeight < this.image.naturalHeight) {
			this.calculateImageWidth = this.image.naturalWidth;
			this.calculateImageHeight = this.image.naturalHeight;
			const heightDifference = this.image.naturalHeight / this.originalHeight;
			const widthDifference = this.image.naturalWidth / this.originalWidth;
			const bestDifference =
				heightDifference > widthDifference ? heightDifference : widthDifference;
			this.calculateImageHeight = this.calculateImageHeight / bestDifference;
			this.calculateImageWidth = this.calculateImageWidth / bestDifference;
		} else {
			this.calculateImageWidth = this.image.naturalWidth;
			this.calculateImageHeight = this.image.naturalHeight;
		}
	}

	private updateCanvas() {
		const context = this.canvas.getContext('2d');
		context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		context.filter = this.blur;
		if (context.imageSmoothingQuality) {
			context.imageSmoothingQuality = 'high';
		}

		context.drawImage(
			this.image,
			this.imagePositionX,
			this.imagePositionY,
			this.calculateImageWidth,
			this.calculateImageHeight
		);
	}

	private subscribeToMauseEvents() {
		this.eventManager.mouseWheel$
			.pipe(
				filter(() => !this.disabled),
				tap(event => {
					if (event === MouseWheel.Up) {
						this.zoomIn();
					} else {
						this.zoomOut();
					}
				}),
				takeUntil(this.componentAlive)
			)
			.subscribe();

		this.eventManager.mouseMove$
			.pipe(
				filter(() => !this.disabled),
				tap(({ offsetX, offsetY }) => {
					this.setImagePositions(offsetX, offsetY);
				}),
				takeUntil(this.componentAlive)
			)
			.subscribe();
	}

	private subscribeToTouchEvents() {
		this.eventManager.touchMove$
			.pipe(
				filter(() => !this.disabled),
				tap(({ offsetX, offsetY }) => {
					this.setImagePositions(offsetX, offsetY);
				}),
				takeUntil(this.componentAlive)
			)
			.subscribe();

		let lastDiffX = 0;
		let lastDiffY = 0;
		this.eventManager.touchPinch$
			.pipe(
				filter(() => !this.disabled),
				tap(({ x, x1, y, y1 }) => {
					const currentDiffX = Math.abs(x - x1);
					const currentDiffY = Math.abs(y - y1);
					if (lastDiffX && lastDiffY) {
						this.pinchZoom(lastDiffX, currentDiffX, lastDiffY, currentDiffY);
					}
					lastDiffX = currentDiffX;
					lastDiffY = currentDiffY;
				}),
				finalize(() => {
					lastDiffX = 0;
					lastDiffY = 0;
				}),
				takeUntil(this.componentAlive)
			)
			.subscribe();
	}

	private pinchZoom(
		lastDiffX: number,
		currentDiffX: number,
		lastDiffY: number,
		currentDiffY: number
	) {
		if (currentDiffY > currentDiffX) {
			if (currentDiffY < lastDiffY) {
				this.zoomOut()
			} else if (currentDiffY > lastDiffY) {
				this.zoomIn();
			}
		} else {
			if (currentDiffX < lastDiffX) {
				this.zoomOut()
			} else if (currentDiffX > lastDiffX) {
				this.zoomIn();
			}
		}
	}

	private setImagePositions(offsetX: number, offsetY: number) {
		this.imagePositionX += offsetX;
		this.imagePositionY += offsetY;
		this.updateCanvas();
	}
}
