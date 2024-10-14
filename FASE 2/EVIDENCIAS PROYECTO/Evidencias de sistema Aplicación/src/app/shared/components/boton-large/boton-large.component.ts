import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-boton-large',
  templateUrl: './boton-large.component.html',
  styleUrls: ['./boton-large.component.scss'],
})
export class BotonLargeComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

  @Input() color:string;
  @Input() texto:string;
}
