import { Component, OnInit, inject } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { User } from 'src/app/models/user';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { Chart, registerables } from 'chart.js';  // Para versiones 3.x y superiores
import { CentralColectivo } from 'src/app/models/central-colectivo';

import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import * as Papa from 'papaparse'; // Para CSV
import * as XLSX from 'xlsx'; // Para Excel

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
  selectedYear: number;

  chartDaily: any;
  chartMonthly: any;
  chartAnnual: any;

  currentYear: number = new Date().getFullYear();  // Año actual

  constructor() { }


  ngOnInit() {
    this.selectedYear = new Date().getFullYear(); // Año por defecto al actual
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

      this.updateCharts(); // Actualizar los gráficos cuando los datos estén listos.


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

  // Filtrar las ventas por el año seleccionado
  getVentasPorAnio() {
    return this.finanzas.filter(venta => {
      const fecha = new Date(venta.fecha_pago.split(', ')[0].split('/').reverse().join('-'));
      return fecha.getFullYear() === this.selectedYear;
    });
  }

  async updateCharts() {
    const loading = await this.utilsSvc.loading();
    await loading.present();
    try {
      this.utilsSvc.presentToast({
        message: 'Gráficos Actualizados',
        duration: 1500,
        color: 'primary',
        position: 'middle',
        icon: 'alert-circle-outline'
      });
      this.createSalesCharts(this.selectedYear);
    } catch (error) {
      console.log(error);
      this.utilsSvc.presentToast({
        message: 'No se pudo actualizar los gráficos',
        duration: 1500,
        color: 'warning',
        position: 'middle',
        icon: 'alert-circle-outline'
      });
    } finally {
      loading.dismiss();
    }
  }

  createSalesCharts(year: number) {
    const ventasDiarias = [];
    const month = new Date().getMonth();
    const diasDelMes = new Date(year, month + 1, 0).getDate();

    for (let i = 1; i <= 31; i++) {
      if (i <= diasDelMes) {
        const fecha = new Date(year, month, i);
        const ventasDelDia = this.finanzas.filter(venta =>
          new Date(venta.fecha_pago.split(', ')[0].split('/').reverse().join('-')).toDateString() === fecha.toDateString()
        );
        ventasDiarias.push(ventasDelDia.reduce((acc, venta) => acc + parseFloat(venta.amount), 0));
      } else {
        ventasDiarias.push(0);
      }
    }

    // Destruir el gráfico anterior si existe
    if (this.chartDaily) {
      this.chartDaily.destroy();
    }

    // Crear el gráfico de ventas diarias
    this.chartDaily = new Chart('sales-daily-chart-admin', {
      type: 'bar',
      data: {
        labels: Array.from({ length: 31 }, (_, i) => `${i + 1}/${month + 1}`),
        datasets: [{
          label: 'Ventas Diarias ' + year,
          data: ventasDiarias,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            ticks: { callback: (val, index) => (index + 1 <= diasDelMes ? `${index + 1}/${month + 1}` : '') }
          },
          y: { beginAtZero: true }
        }
      }
    });

    const ventasMensuales = [];
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    // Aquí filtras las ventas del mes específico del año seleccionado
    for (let i = 0; i < 12; i++) {
      const ventasMes = this.finanzas.filter(venta => {
        const fechaVenta = new Date(venta.fecha_pago.split(', ')[0].split('/').reverse().join('-'));
        return fechaVenta.getFullYear() === year && fechaVenta.getMonth() === i;
      });
      ventasMensuales.push(ventasMes.reduce((acc, venta) => acc + parseFloat(venta.amount), 0));
    }

    // Destruir el gráfico anterior si existe
    if (this.chartMonthly) {
      this.chartMonthly.destroy();
    }

    // Crear el gráfico de ventas mensuales
    this.chartMonthly = new Chart('sales-monthly-chart-admin', {
      type: 'bar',
      data: {
        labels: meses,
        datasets: [{
          label: 'Ventas Mensuales ' + year,
          data: ventasMensuales,
          backgroundColor: 'rgba(255, 159, 64, 0.2)',
          borderColor: 'rgba(255, 159, 64, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: { y: { beginAtZero: true } }
      }
    });

    // Destruir el gráfico anterior si existe
    if (this.chartAnnual) {
      this.chartAnnual.destroy();
    }

    const ventasAnuales = [];
    const anos = [];

    // Recorrer los últimos 6 años (por ejemplo, de 2024 a 2019)
    for (let i = 0; i < 6; i++) {
      const anio = year - i;
      anos.push(anio.toString());

      // Filtrar ventas por año
      const ventarxAnio = this.finanzas.filter(venta => {
        const fecha = new Date(venta.fecha_pago.split(', ')[0].split('/').reverse().join('-'));
        return fecha.getFullYear() === anio;
      });

      // Calcular las ventas anuales
      const totalVentasAnuales = ventarxAnio.reduce((acc, venta) => acc + parseFloat(venta.amount), 0);
      ventasAnuales.push(totalVentasAnuales); // Añadir el total de ventas del año (0 si no hay ventas)
    }

    // Destruir el gráfico anterior si existe
    if (this.chartAnnual) {
      this.chartAnnual.destroy();
    }

    // Crear el gráfico de ventas anuales
    this.chartAnnual = new Chart('sales-annual-chart-admin', {
      type: 'bar',
      data: {
        labels: anos, // Etiquetas con los años
        datasets: [{
          label: 'Ventas Anuales',
          data: ventasAnuales, // Datos de las ventas anuales (con 0 si no hay ventas)
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  profile() {
    this.utilsSvc.routerLink('/main/profile-menu');
  }

  signOut() {
    this.firebaseSvc.signOut();
  }

  async downloadCSV() {
    const ventasFiltradas = this.getVentasPorAnio();

    if (ventasFiltradas.length === 0) {
      this.utilsSvc.presentToast({
        message: 'No hay ventas para el año seleccionado',
        duration: 1500,
        color: 'warning',
        position: 'middle',
        icon: 'alert-circle-outline',
      });
      return;
    }

    const data = ventasFiltradas.map(venta => ({
      ID_Transaccion: venta.payment_id,
      Fecha: venta.fecha_pago,
      Monto: Math.trunc(venta.amount),
      Nombre_Chofer: venta.nombre_chofer,
      Rut_Chofer: venta.rut_chofer,
      Nombre_Pasajero: venta.nombre_pasajero,
      Rut_Pasajero: venta.rut_pasajero,
      Razon: venta.subject,
      Modelo_Vehiculo: venta.vehiculo.modelo,
      Patente_Vehiculo: venta.vehiculo.patente,
      Banco: venta.bank,
      Comprobante: venta.receipt_url,
    }));

    const csv = Papa.unparse(data);
    const fileName = `ventas_${this.selectedYear}.csv`;

    if (Capacitor.isNativePlatform()) {
      // En plataformas nativas (Android/iOS)
      try {
        await Filesystem.writeFile({
          path: fileName,
          data: btoa(csv), // Codificar en base64 para Filesystem
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
        });

        this.utilsSvc.presentToast({
          message: `Archivo CSV guardado: ${fileName}`,
          duration: 1500,
          color: 'success',
          position: 'middle',
          icon: 'checkmark-circle-outline',
        });
      } catch (error) {
        console.error('Error al guardar el archivo:', error);
        this.utilsSvc.presentToast({
          message: 'Error al guardar el archivo:'+ error,
          duration: 1500,
          color: 'danger',
          position: 'middle',
          icon: 'close-circle-outline',
        });
      }
    } else {
      // En la web, descargar usando un enlace
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
    }
  }

  async downloadExcel() {
    const ventasFiltradas = this.getVentasPorAnio();

    if (ventasFiltradas.length === 0) {
      this.utilsSvc.presentToast({
        message: 'No hay ventas para el año seleccionado',
        duration: 1500,
        color: 'warning',
        position: 'middle',
        icon: 'alert-circle-outline',
      });
      return;
    }

    const data = ventasFiltradas.map(venta => ({
      ID_Transaccion: venta.payment_id,
      Fecha: venta.fecha_pago,
      Monto: Math.trunc(venta.amount),
      Nombre_Chofer: venta.nombre_chofer,
      Rut_Chofer: venta.rut_chofer,
      Nombre_Pasajero: venta.nombre_pasajero,
      Rut_Pasajero: venta.rut_pasajero,
      Razon: venta.subject,
      Modelo_Vehiculo: venta.vehiculo.modelo,
      Patente_Vehiculo: venta.vehiculo.patente,
      Banco: venta.bank,
      Comprobante: venta.receipt_url,
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = { Sheets: { Ventas: ws }, SheetNames: ['Ventas'] };
    const excelBuffer: ArrayBuffer = XLSX.write(wb, {
      bookType: 'xlsx',
      type: 'array',
    });
    const fileName = `ventas_${this.selectedYear}.xlsx`;

    if (Capacitor.isNativePlatform()) {
      // En plataformas nativas (Android/iOS)
      const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      try {
        await Filesystem.writeFile({
          path: fileName,
          data: await this.blobToBase64(dataBlob),
          directory: Directory.Documents,
        });

        this.utilsSvc.presentToast({
          message: `Archivo Excel guardado: ${fileName}`,
          duration: 1500,
          color: 'success',
          position: 'middle',
          icon: 'checkmark-circle-outline',
        });
      } catch (error) {
        console.error('Error al guardar el archivo:', error);
        this.utilsSvc.presentToast({
          message: 'Error al guardar el archivo:'+ error,
          duration: 1500,
          color: 'danger',
          position: 'middle',
          icon: 'close-circle-outline',
        });
      }
    } else {
      // En la web, descargar usando un enlace
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
    }
  }

  // Conversión de Blob a Base64 (requiere esta función)
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        resolve(dataUrl.split(',')[1]); // Remover el encabezado de data URL
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}
