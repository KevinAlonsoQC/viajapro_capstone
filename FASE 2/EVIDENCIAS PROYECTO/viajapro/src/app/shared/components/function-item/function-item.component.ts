import { Component,Input ,OnInit } from '@angular/core';

@Component({
  selector: 'app-function-item',
  templateUrl: './function-item.component.html',
  styleUrls: ['./function-item.component.scss'],
})
export class FunctionItemComponent  implements OnInit {

  @Input()titulo:string;
  @Input()descripcion:string;
  @Input()icono:string;
  constructor() { }

  ngOnInit() {}

}
