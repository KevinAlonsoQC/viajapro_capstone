import { inject, Injectable } from '@angular/core';

import { AngularFireAuth } from '@angular/fire/compat/auth';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { User } from '../models/user';

import { AngularFirestore } from '@angular/fire/compat/firestore';
import { getFirestore, setDoc, doc, getDoc, getDocs, collection, updateDoc } from '@angular/fire/firestore';
import { UtilsService } from './utils.service';
import { AngularFireStorage } from '@angular/fire/compat/storage'; // Importar AngularFireStorage
import { uploadString, getDownloadURL, getStorage, ref } from 'firebase/storage';


@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  auth = inject(AngularFireAuth);
  firestore = inject(AngularFirestore);
  utilsSvc = inject(UtilsService);
  storage = inject(AngularFireStorage); // Inyectar AngularFireStorage

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

  // Añadido el método para actualizar un documento
  async updateDocument(path: string, data: any) {
    const docRef = doc(getFirestore(), path);
    return updateDoc(docRef, data);
  }

  //Obtener un documento de la colección
  async getDocument(path: string) {
    return (await getDoc(doc(getFirestore(), path))).data();
  }

  //añadir uno nuevo a la colección
  async addDocument(collectionPath: string, data: any): Promise<void> {
    const docRef = this.firestore.collection(collectionPath).doc(); // Crea un nuevo documento
    return docRef.set(data); // Guarda el documento en la colección
  }  

  //eliminar un documento de la colección
  async deleteDocument(path: string): Promise<void> {
    return this.firestore.collection(path.split('/')[0]).doc(path.split('/')[1]).delete();
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



  // ========= Subir Imagen a Firebase Storage =========
  async uploadImage(path: string, data_url: string){
    return uploadString(ref(getStorage(), path), data_url, 'data_url').then(() => {
      return getDownloadURL(ref(getStorage(), path));
    })
  }

  // ==== Obtener La ruta de la image ====
  async getFilePath(url: string){
    return ref(getStorage(), url).fullPath;
  }

}
