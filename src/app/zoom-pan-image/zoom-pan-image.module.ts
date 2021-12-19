import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageComponent } from './components/image/image.component';

@NgModule({
	declarations: [ImageComponent],
	exports: [ImageComponent],
	imports: [CommonModule],
})
export class ZoomPanImageModule {}
