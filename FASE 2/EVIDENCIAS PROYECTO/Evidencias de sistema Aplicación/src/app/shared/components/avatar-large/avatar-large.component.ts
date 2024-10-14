import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-avatar-large',
  templateUrl: './avatar-large.component.html',
  styleUrls: ['./avatar-large.component.scss'],
})
export class AvatarLargeComponent  implements OnInit {
  @Input() img!: string;
  constructor() { }

  ngOnInit() {}

}
