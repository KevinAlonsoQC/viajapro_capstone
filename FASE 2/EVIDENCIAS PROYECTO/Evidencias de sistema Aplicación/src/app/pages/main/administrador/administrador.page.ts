import { Component, OnInit, inject } from '@angular/core';
import { User } from 'src/app/models/user';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { Chart, registerables } from 'chart.js';  // Para versiones 3.x y superiores
import { CentralColectivo } from 'src/app/models/central-colectivo';

@Component({
  selector: 'app-administrador',
  templateUrl: './administrador.page.html',
  styleUrls: ['./administrador.page.scss'],
})
export class AdministradorPage implements OnInit {
  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  usuario: User;
  userId: string;
  isMobile: boolean;

  centrales!: CentralColectivo[];
  empleados: any;
  finanzas: any;

  constructor() { }


  ngOnInit() {
    // Suscribirse al observable del usuario
    this.utilsSvc.getDataObservable('usuario')?.subscribe(user => {
      this.usuario = user;
      // Aquí puedes realizar más acciones si es necesario
    });

    // Cargar el usuario inicialmente
    this.utilsSvc.getFromLocalStorage('usuario');
  }

  async ionViewWillEnter() {
    Chart.register(...registerables);
    //Realiza el get info para ver el tipo de cuenta
    await this.getInfoAndTipoCuenta();
    await this.getData();
  }

  async getInfoAndTipoCuenta() {
    const loading = await this.utilsSvc.loading();
    await loading.present();

    try {
      const tipo_cuenta = this.usuario.tipo_usuario;

      if (tipo_cuenta == "0") {
        this.utilsSvc.routerLink('/main/owner');
      } else if (tipo_cuenta == "1") {
        this.utilsSvc.routerLink('/main/administrador');
      } else if (tipo_cuenta == "2") {
        this.utilsSvc.routerLink('/main/chofer');
      } else if (tipo_cuenta == "3") {
        this.utilsSvc.routerLink('/main/pasajero');
      } else {
        this.utilsSvc.presentToast({
          message: 'No se pudo reconocer los datos de tu cuenta. Informa a soporte por favor.',
          duration: 5000,
          color: 'primary',
          position: 'middle',
          icon: 'alert-circle-outline'
        });
      }

    } catch (error) {
      console.log(error);
      this.utilsSvc.presentToast({
        message: 'No se pudo cargar el tipo de usuario',
        duration: 1500,
        color: 'primary',
        position: 'middle',
        icon: 'alert-circle-outline'
      });
    } finally {
      loading.dismiss();
    }
  }

  async getData() {
    const loading = await this.utilsSvc.loading();
    await loading.present();
    const urlPath = 'central_colectivo';
    const urlPath2 = 'usuario';
    const urlPath3 = 'historial_pago';

    try {
      const [central, users, finanzas] = await Promise.all([
        this.firebaseSvc.getCollectionDocuments(urlPath) as Promise<CentralColectivo[]>,
        this.firebaseSvc.getCollectionDocuments(urlPath2) as Promise<any>,
        this.firebaseSvc.getCollectionDocuments(urlPath3) as Promise<any>,
      ]);

      this.centrales = central.filter(detalles => {
        return detalles.id == this.usuario.central && detalles.presidente == this.usuario.uid
      });
      this.empleados = users.filter(usuario => usuario.tipo_usuario == '2' && usuario.central == this.usuario.central);
      this.finanzas = finanzas.filter(detalles => {
        return detalles.central == this.usuario.central
      });
      
      this.createSalesCharts();
      this.createAnnualSalesChart();

      if (this.centrales.length <= 0) {
        this.utilsSvc.presentToast({
          message: 'No hay Centrales Creadas',
          duration: 1500,
          color: 'warning',
          position: 'middle',
          icon: 'alert-circle-outline'
        });
      }

    } catch (error) {
      console.log(error);
      this.utilsSvc.presentToast({
        message: 'No se pudo obtener los datos :(',
        duration: 1500,
        color: 'primary',
        position: 'middle',
        icon: 'alert-circle-outline'
      });
    } finally {
      loading.dismiss();
    }
  }

  createAnnualSalesChart() {
    const hoy = new Date();
    const ventasAnuales = [];
    const anos = [];
    for (let i = 0; i < 6; i++) {
      const anio = hoy.getFullYear() - i;
      anos.push(anio.toString());

      const ventarxAnio = this.finanzas.filter(venta => {
        const fecha = new Date(venta.fecha_pago.split(', ')[0].split('/').reverse().join('-'));
        return fecha.getFullYear() === anio;
      });

      const totalVentasAnuales = ventarxAnio.reduce((acc, venta) => acc + parseFloat(venta.amount), 0);
      ventasAnuales.push(totalVentasAnuales);
    }

    new Chart('sales-annual-chart-admin', {
      type: 'bar',
      data: {
        labels: anos,
        datasets: [{
          label: 'Ventas Anuales',
          data: ventasAnuales,
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }

  createSalesCharts() {
    const hoy = new Date();
    const ventasDiarias = [];
    for (let i = 1; i <= 31; i++) {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth(), i);
      const ventasDelDia = this.finanzas.filter(venta => new Date(venta.fecha_pago.split(', ')[0].split('/').reverse().join('-')).toDateString() === fecha.toDateString());
      ventasDiarias.push(ventasDelDia.reduce((acc, venta) => acc + parseFloat(venta.amount), 0));
    }

    new Chart('sales-daily-chart-admin', {
      type: 'bar',
      data: {
        labels: Array.from({ length: 31 }, (_, i) => `${i + 1}/${hoy.getMonth() + 1}`),
        datasets: [{
          label: 'Ventas Diarias',
          data: ventasDiarias,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });

    const ventasSemanales = [];
    const semanas = [];
    for (let i = 0; i < 4; i++) {
      const inicioSemana = new Date(hoy.getFullYear(), hoy.getMonth(), i * 7);
      const finSemana = new Date(hoy.getFullYear(), hoy.getMonth(), (i + 1) * 7);
      semanas.push(`${inicioSemana.getDate()}/${inicioSemana.getMonth() + 1} - ${finSemana.getDate()}/${finSemana.getMonth() + 1}`);
      const ventasSemana = this.finanzas.filter(venta => {
        const fecha = new Date(venta.fecha_pago.split(', ')[0].split('/').reverse().join('-'));
        return fecha >= inicioSemana && fecha <= finSemana;
      });
      ventasSemanales.push(ventasSemana.reduce((acc, venta) => acc + parseFloat(venta.amount), 0));
    }

    new Chart('sales-weekly-chart-admin', {
      type: 'bar',
      data: {
        labels: semanas,
        datasets: [{
          label: 'Ventas Semanales',
          data: ventasSemanales,
          backgroundColor: 'rgba(153, 102, 255, 0.2)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });

    const ventasMensuales = [];
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    for (let i = 0; i < 12; i++) {
      const ventasMes = this.finanzas.filter(venta => new Date(venta.fecha_pago.split(', ')[0].split('/').reverse().join('-')).getMonth() === i);
      ventasMensuales.push(ventasMes.reduce((acc, venta) => acc + parseFloat(venta.amount), 0));
    }

    new Chart('sales-monthly-chart-admin', {
      type: 'bar',
      data: {
        labels: meses,
        datasets: [{
          label: 'Ventas Mensuales',
          data: ventasMensuales,
          backgroundColor: 'rgba(255, 159, 64, 0.2)',
          borderColor: 'rgba(255, 159, 64, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }

  profile() {
    this.utilsSvc.routerLink('/main/profile-menu');
  }

  signOut() {
    this.firebaseSvc.signOut();
  }

}
