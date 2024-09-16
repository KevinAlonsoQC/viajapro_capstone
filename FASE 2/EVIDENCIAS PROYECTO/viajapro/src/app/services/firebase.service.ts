import { inject, Injectable } from '@angular/core';

import { AngularFireAuth } from '@angular/fire/compat/auth';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { User } from '../models/user';

import { AngularFirestore } from '@angular/fire/compat/firestore';
import { getFirestore, setDoc, doc, getDoc, getDocs, collection } from '@angular/fire/firestore';
import { UtilsService } from './utils.service';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  auth = inject(AngularFireAuth);
  firestore = inject(AngularFirestore);
  utilsSvc = inject(UtilsService);

  // ========= Autenticación =========
  getAuth() {
    return getAuth();
  }

  // ========= Acceder Usuario =========
  signIn(user: User) {
    return signInWithEmailAndPassword(getAuth(), user.email, user.password)
  }

  // ========= Registrarse Usuario =========
  signUp(user: User) {
    return createUserWithEmailAndPassword(getAuth(), user.email, user.password)
  }

  // ========= Actualizar Usuario =========
  updateProfile(displayName: string) {
    return updateProfile(getAuth().currentUser, { displayName })
  }

  sendRecoveryEmail(email: string) {
    return sendPasswordResetEmail(getAuth(), email);
  }

  // ========= Cerrar Sesión Usuario =========
  signOut() {
    getAuth().signOut();
    localStorage.removeItem('usuario');
    this.utilsSvc.routerLink('auth')
  }

  // ========== Base de Datos ==========

  // ========== Setear documentos ==========
  setDocument(path: string, data: any) {
    return setDoc(doc(getFirestore(), path), data);
  }

  async getDocument(path: string) {
    return (await getDoc(doc(getFirestore(), path))).data();
  }

  // Obtener todos los documentos de una colección
  async getCollectionDocuments(collectionPath: string) {
    const querySnapshot = await getDocs(collection(getFirestore(), collectionPath));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // Obtener un documento por su ID
  async getDocumentById(collectionPath: string, documentId: string) {
    const docRef = doc(getFirestore(), collectionPath, documentId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  }

}
