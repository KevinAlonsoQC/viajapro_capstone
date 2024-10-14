import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-header-funtion',
  templateUrl: './header-funtion.component.html',
  styleUrls: ['./header-funtion.component.scss'],
})
export class HeaderFuntionComponent  implements OnInit {

  @Input() titulo:string;
  constructor() { }

  ngOnInit() {}

}
