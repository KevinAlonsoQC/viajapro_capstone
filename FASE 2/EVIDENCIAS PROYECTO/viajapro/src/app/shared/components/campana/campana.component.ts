import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-campana',
  templateUrl: './campana.component.html',
  styleUrls: ['./campana.component.scss'],
})
export class CampanaComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

  @Input() notifica:boolean;

}
