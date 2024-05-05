'use client'
import styles from "./page.module.css";
import {auth} from '../../utils/firebase'
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter()
  onAuthStateChanged(auth,user => {
    if(user){
      console.log('user here')
      router.push('/profile')
    }else{
      console.log('user not logined');
      router.push('/login')
    }
  })
  return (
    <main className={styles.main}>

    </main>
  );
}
