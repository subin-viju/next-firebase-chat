import Image from "next/image";
import styles from "./page.module.css";
import Chatroom from "../../components/chatroom/layout";

export default function Home() {
  return (
    <main className={styles.main}>
      <Chatroom />
    </main>
  );
}
