'use client'
import { useForm } from 'react-hook-form'
import styles from './profile.module.css'
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../../utils/firebase';
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
export default function Profile() {
    const router = useRouter()
    const {register,handleSubmit,formState:{errors}} = useForm()

    async function onSubmit(data:any){
        const username = data.username;
        try {
            const docRef = doc(db,'users',auth.currentUser?.uid!);
            const docSnap = await getDoc(docRef)

            if(docSnap.exists()){
                await updateDoc(docRef,{
                    username
                })

                alert('username updated!')
            }
        } catch (error) {
            
        }
    }

    async function handleSignout(){
        try{
            const docRef = doc(db,'users',auth.currentUser?.uid!);
            await updateDoc(docRef,{
                isOnline:false
            })
            auth.signOut()
        }catch(err){
        
        }
    }

    useEffect(() => {

        onAuthStateChanged(auth, user => {
            if (user) {
                console.log('user here')
            } else {
                console.log('user not logined');
                router.push('/login')
            }
        })
    }, [])

    return (
        <main className={styles.profileMain}>

            <aside className={styles.sidebar}>
                <div className={styles.profileImage}>
                    <div className={styles.propic}>
                        <img className={styles.propicImg} src="/images/user.jpg" alt="user" />
                    </div>
                    <button>Upload New Photo</button>
                </div>
            </aside>
            <section className={styles.rightSection}>
                <h6 onClick={() => router.push('/chatroom')}>Go to Chat</h6>
                <button onClick={handleSignout} className={styles.signout} type='button'>Signout</button>
                <div className={styles.rightContent}>
                    <h1>Update Profile</h1>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className={styles.formWrapper}>
                            <input className={styles.inputField} type="text" placeholder='Username...' {...register('username',{required:true})} />
                            
                        </div>
                        <button className={styles.submitBtn} type='submit'>UPDATE</button>
                    </form>
                </div>
            </section>
        </main>
    )
}