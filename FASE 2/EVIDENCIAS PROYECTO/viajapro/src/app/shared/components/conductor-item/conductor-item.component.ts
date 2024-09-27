import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-conductor-item',
  templateUrl: './conductor-item.component.html',
  styleUrls: ['./conductor-item.component.scss'],
})
export class ConductorItemComponent  implements OnInit {

  @Input() nombre:string;
  @Input() patente:string;
  @Output() botonModal: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() botonModal2: EventEmitter<boolean> = new EventEmitter<boolean>();
  
  constructor() { }

  ngOnInit() {}

  setOpen() {
    const isOpen = true;
    this.botonModal.emit(isOpen);
  }

  setOpen2() {
    const isOpen = true;
    this.botonModal2.emit(isOpen);
  }

}
