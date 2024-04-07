import styles from './layout.module.css'

export default function Chatroom() {
    return (
        <section className={styles.mainSection}>
            <div className={styles.leftSection}>
                <header className={styles.leftHeader}>
                    <div className={styles.headerlogo}>
                        <img src="/images/michaelscott.png" alt="" />
                    </div>
                    <div className={styles.headerlogo}>
                        <img src="/images/add-new-user.jpg" alt="" />
                    </div>
                </header>
                <div className={styles.searchbar}>
                    <input className={styles.searchinput} type="text" placeholder='Search user...' />
                </div>
                <ul className={styles.list}>
                    {[...Array(5)].map((_, idx) => (

                        <li key={idx}>
                            <div className={styles.userlogo}>
                                <img src="/images/michaelscott.png" alt="" />
                            </div>
                            <div className={styles.nameSection}>
                                <div>
                                    <h6>Clinto</h6>
                                </div>
                                <div>9:30</div>
                                <div><p>Daa</p></div>
                                <div>
                                    1
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            <div className={styles.rightSection}>
            <header className={styles.leftHeader}>
                <div>

                    <div className={styles.headerlogo}>
                        <img src="/images/michaelscott.png" alt="" />
                    <h4>Clinto</h4>
                    </div>
                </div>
                    <div className={styles.headerlogo}>
                        <img src="/images/add-new-user.jpg" alt="" />
                    </div>
                </header>
            </div>
        </section>
    )
}