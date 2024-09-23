import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-menu-master',
  templateUrl: './menu-master.component.html',
  styleUrls: ['./menu-master.component.scss'],
})
export class MenuMasterComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}


  @Input() icon :string;
  @Input() txt_icon :string
 

}
