import { inject, Injectable } from '@angular/core';

import { AngularFireAuth } from '@angular/fire/compat/auth';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { User } from '../models/user';

import { AngularFirestore } from '@angular/fire/compat/firestore';
import { getFirestore, setDoc, doc, getDoc } from '@angular/fire/firestore';
import { UtilsService } from './utils.service';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  auth = inject(AngularFireAuth);
  firestore = inject(AngularFirestore);
  utilsSvc = inject(UtilsService);

  // ========= Autenticación =========
  getAuth(){
    return getAuth();
  }

  // ========= Acceder Usuario =========
  signIn(user: User){
    return signInWithEmailAndPassword(getAuth(), user.email, user.password)
  }

  // ========= Registrarse Usuario =========
  signUp(user: User){
    return createUserWithEmailAndPassword(getAuth(), user.email, user.password)
  }

  // ========= Actualizar Usuario =========
  updateProfile(displayName: string){
    return updateProfile(getAuth().currentUser,{displayName})
  }

  sendRecoveryEmail(email: string){
    return sendPasswordResetEmail(getAuth(), email);
  }

  // ========= Cerrar Sesión Usuario =========
  signOut(){
    getAuth().signOut();
    localStorage.removeItem('user');
    this.utilsSvc.routerLink('/auth')
  }




  // ========== Base de Datos ==========

  // ========== Setear documentos ==========
  setDocument(path:string, data: any){
    return setDoc(doc(getFirestore(), path),data);
  }

  async getDocument(path:string){
    return (await getDoc(doc(getFirestore(), path))).data();
  }
}
