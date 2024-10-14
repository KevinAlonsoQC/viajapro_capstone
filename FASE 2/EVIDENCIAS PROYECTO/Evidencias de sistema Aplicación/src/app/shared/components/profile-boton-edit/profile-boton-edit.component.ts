import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-profile-boton-edit',
  templateUrl: './profile-boton-edit.component.html',
  styleUrls: ['./profile-boton-edit.component.scss'],
})
export class ProfileBotonEditComponent  implements OnInit {
  @Input() name:string;
  constructor() { }

  ngOnInit() {}

}
