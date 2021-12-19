import { fromEvent, Observable } from 'rxjs';
import { filter, finalize, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { MouseWheel } from '../enums/mouseWheel';
import { Clientoffset } from '../interfaces/clientOffset';

export class EventManager {
	private mouseDownEvent$: Observable<MouseEvent>;
	private mouseMoveEvent$: Observable<MouseEvent>;
	private mouseWheelEvent$: Observable<MouseEvent>;
	private touchStartEvent$: Observable<TouchEvent>;
	private touchMoveEvent$: Observable<TouchEvent>;
	private readonly mouseUpEvent$ = fromEvent<MouseEvent>(document, 'mouseup');
	private readonly touchEndEvent$ = fromEvent<TouchEvent>(document, 'touchend');
	private container: HTMLElement;

	constructor(container: HTMLElement) {
		this.container = container;
		this.setTargetEvents();
	}

	get touchMove$() {
		return this.getTouchStart(this.getTouchMove());
	}

	get touchPinch$() {
		return this.getTouchStart(this.getTouchPinch());
	}

	get mouseMove$() {
		return this.getMouseMove();
	}

	get mouseWheel$() {
		return this.mouseWheelEvent$.pipe(
			tap(event => {
				event.preventDefault();
				if (event.currentTarget === this.container) {
					event.stopPropagation();
				}
			}),
			map((event: any) => {
				if (event.wheelDelta > 0) {
					return MouseWheel.Up;
				} else {
					return MouseWheel.Down;
				}
			})
		);
	}

	private getTouchPinch() {
		return this.touchMoveEvent$.pipe(
			filter(event => event.touches.length === 2),
			tap(event => event.preventDefault()),
			map(event => {
				return {
					x: event.touches[0].clientX,
					x1: event.touches[1].clientX,
					y: event.touches[0].clientY,
					y1: event.touches[1].clientY,
				};
			}),
			takeUntil(this.touchEndEvent$)
		);
	}

	private getTouchMove() {
		let lastPositionX = undefined;
		let lastPositionY = undefined;
		return this.touchMoveEvent$.pipe(
			filter(event => event.touches.length === 1),
			map(event => event.touches[0]),
			map(event => {
				return this.getClientOffset(lastPositionX, lastPositionY, event.clientX, event.clientY);
			}),
			tap(({ clientX, clientY }) => {
				lastPositionX = clientX;
				lastPositionY = clientY;
			}),
			takeUntil(this.touchEndEvent$),
			finalize(() => {
				lastPositionX = undefined;
				lastPositionY = undefined;
			})
		);
	}

	private getMouseMove() {
		let prevPositionX = undefined;
		let prevPositionY = undefined;

		const move$ = this.mouseMoveEvent$.pipe(
			map(event => {
				return this.getClientOffset(prevPositionX, prevPositionY, event.clientX, event.clientY);
			}),
			tap(({ clientX, clientY }) => {
				prevPositionX = clientX;
				prevPositionY = clientY;
			}),
			finalize(() => {
				prevPositionX = undefined;
				prevPositionY = undefined;
			}),
			takeUntil(this.mouseUpEvent$)
		);

		return this.mouseDownEvent$.pipe(
			tap(event => {
				if (event.currentTarget === this.container) {
					event.stopPropagation();
				}
			}),
			switchMap(() => move$)
		);
	}

	private getTouchStart<T>(observable: Observable<T>) {
		return this.touchStartEvent$.pipe(
			tap(event => {
				event.preventDefault();
				if (event.currentTarget === this.container) {
					event.stopPropagation();
				}
			}),
			switchMap(() => observable)
		);
	}

	private setTargetEvents() {
		const target = this.container || document;
		this.mouseWheelEvent$ = fromEvent<MouseEvent>(target, 'mousewheel', { passive: false });
		this.touchStartEvent$ = fromEvent<TouchEvent>(target, 'touchstart', { passive: false });
		this.touchMoveEvent$ = fromEvent<TouchEvent>(target, 'touchmove', { passive: false });
		this.mouseDownEvent$ = fromEvent<MouseEvent>(target, 'mousedown');
		this.mouseMoveEvent$ = fromEvent<MouseEvent>(target, 'mousemove');
	}

	private getClientOffset(
		prevPositionX: number,
		prevPositionY: number,
		currentPositionX: number,
		currentPositionY: number
	) {
		const clientOffset: Clientoffset = {
			clientX: currentPositionX,
			clientY: currentPositionY,
			offsetX: 0,
			offsetY: 0,
		};
		if (prevPositionX != undefined) {
			clientOffset.offsetX = currentPositionX - prevPositionX;
		}
		if (prevPositionY != undefined) {
			clientOffset.offsetY = currentPositionY - prevPositionY;
		}
		return clientOffset;
	}
}
