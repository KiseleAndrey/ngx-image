import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { image } from './image';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements AfterViewInit {
  private canvasDimValue = { width: 10, height: 10 };

  @ViewChild('imageWrapper', { static: false })
  wrapper: ElementRef;

  get canvasDim() {
    return this.canvasDimValue;
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.updateCanvasDim();
  }

  get src() {
    return image;
  }

  ngAfterViewInit(): void {
    this.updateCanvasDim();
  }

  private updateCanvasDim() {
    const el = this.wrapper && this.wrapper.nativeElement ? this.wrapper.nativeElement : null;
    if (
      el &&
      (el.offsetWidth !== this.canvasDimValue.width ||
        el.offsetHeight !== this.canvasDimValue.height)
    ) {
      const newDim = { width: (el.offsetWidth - 2), height: el.offsetHeight - 2 };
      setTimeout(() => (this.canvasDimValue = newDim), 0);
    }
  }

}
