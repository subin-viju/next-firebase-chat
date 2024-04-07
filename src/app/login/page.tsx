'use client'
import { FormEvent } from "react";
import { auth } from '../../../utils/firebase'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function Login() {
    console.log(auth)
    const router = useRouter()

    async function handleLogin() {
        try {
            const user = await signInWithEmailAndPassword(auth, 'subin@gmail.com', '123456')
            console.log(user)
            if(user){
                router.push('/')
            }
        } catch (error) {
            console.log(error)
        }
    }

    async function handleCreate() {
        try {

            const user = await createUserWithEmailAndPassword(auth, 'subin@gmail.com', '123456')
            console.log(user);

        } catch (err) {
            console.log(err)
        }
    }

    async function handleSignout() {
        try {
            await auth.signOut()
        } catch (err) {
            console.log(err)
        }
    }

    return (
        <main>
            {/* <form id="form" onSubmit={onSubmit}>
                <input type="text" name="username" placeholder="Username" />
                <input type="text" name="email" placeholder="Email Address" />
                <button type="submit">Login</button>
            </form> */}
            <button onClick={handleCreate} >create user</button>
            <button onClick={handleLogin} >Login</button>
            <button onClick={handleSignout}>signout</button>
        </main>
    )
}