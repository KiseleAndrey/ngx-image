import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MouseWheel } from '../enums/mouseWheel';
import { EventManager } from './event-manager';

describe('EventManager', () => {
	const element = document.createElement('div');
	let eventManager = new EventManager(element);
	const subject = new Subject();

	it('mouseMoveEvent should be send event', doneFn => {
		const mouseDownEvent = new MouseEvent('mousedown');
		const mouseMoveEvent = new MouseEvent('mousemove');
		eventManager.mouseMove$.pipe(takeUntil(subject)).subscribe(() => {
			expect(true).toBeTrue();
			doneFn();
		});
		element.dispatchEvent(mouseDownEvent);
		element.dispatchEvent(mouseMoveEvent);
	});

	it('mouseWheelEvent should be "Down"', doneFn => {
		const mouseWheelEvent = new MouseEvent('mousewheel');
		mouseWheelEvent['wheelDelta'] = -1;
		eventManager.mouseWheel$.pipe(takeUntil(subject)).subscribe(event => {
			expect(event).toBe(MouseWheel.Down);
			doneFn();
		});
		element.dispatchEvent(mouseWheelEvent);
	});

	it('mouseWheelEvent should be "Up"', doneFn => {
		const mouseWheelEvent = new MouseEvent('mousewheel');
		mouseWheelEvent['wheelDelta'] = 1;
		eventManager.mouseWheel$.pipe(takeUntil(subject)).subscribe(event => {
			expect(event).toBe(MouseWheel.Up);
			doneFn();
		});
		element.dispatchEvent(mouseWheelEvent);
	});

	it('touchMove should be send event', doneFn => {
		const touchStartEvent: any = document.createEvent('CustomEvent');
		const touchMoveEvent: any = document.createEvent('CustomEvent');
		touchStartEvent.initEvent('touchstart', true, true);
		touchMoveEvent.initEvent('touchmove', true, true);
		touchMoveEvent.touches = [{ clientX: 1, clientY: 1 }];
		eventManager.touchMove$.pipe(takeUntil(subject)).subscribe(() => {
			expect(true).toBeTrue();
			doneFn();
		});
		element.dispatchEvent(touchStartEvent);
		element.dispatchEvent(touchMoveEvent);
	});

	it('touchPinch should be send event', doneFn => {
		const touchStartEvent: any = document.createEvent('CustomEvent');
		const touchMoveEvent: any = document.createEvent('CustomEvent');
		touchStartEvent.initEvent('touchstart', true, true);
		touchMoveEvent.initEvent('touchmove', true, true);
		touchMoveEvent.touches = [
			{ clientX: 1, clientY: 1 },
			{ clientX: 1, clientY: 1 },
		];
		eventManager.touchPinch$.pipe(takeUntil(subject)).subscribe(() => {
			expect(true).toBeTrue();
			doneFn();
		});
		element.dispatchEvent(touchStartEvent);
		element.dispatchEvent(touchMoveEvent);
	});

	afterEach(() => {
		subject.next();
	});

	afterAll(() => {
		eventManager = null;
	});
});
