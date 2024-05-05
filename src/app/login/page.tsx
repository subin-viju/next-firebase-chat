"use client";
import { FormEvent, useEffect, useState } from "react";
import { auth, db } from "../../../utils/firebase";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import UserCreation from "../../../components/usercreation";
import { useForm } from "react-hook-form";

export default function Login() {
  const router = useRouter();
  const [create, setCreate] = useState(false);
  const [login,setLogin] = useState(false)

  const {register,handleSubmit} = useForm()

  async function handleLogin(email:string,password:string) {
    try {
      const userRef = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      if (userRef) {
        const docRef = doc(db, "users", userRef.user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          await updateDoc(docRef, {
            isOnline: true,
          });
        } else {
          await setDoc(doc(db, "users", userRef.user.uid), {
            id: userRef.user.uid,
            username: "",
            propic: "",
            email: userRef.user.email,
            isOnline: true,
            chats: [],
          });
        }
        router.push("/profile");
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function handleCreate(email:string,password:string) {
    try {
      const user = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log(user);
    } catch (err) {
      console.log(err);
    }
  }

  async function handleSignout() {
    try {
      await auth.signOut();
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("user here");
      } else {
        console.log("user not logined");
        router.push("/login");
      }
    });
  }, []);

  function onSubmit(data:any){
    handleLogin(data.email,data.password)
  }

  return (
    <main>
        {login && (
            <form onSubmit={handleSubmit(onSubmit)}>
            <input type="text" {...register("email")} placeholder="Email ID" />
            <input type="text" placeholder="Password" {...register("password")} />
            <button type="submit">Submit</button>
          </form>
        )}
      <button onClick={() => setCreate(true)}>create user</button>
      <button onClick={() => setLogin(true)}>Login</button>
      <button onClick={handleSignout}>signout</button>

      {create && <UserCreation handleCreate={handleCreate} />}
    </main>
  );
}
