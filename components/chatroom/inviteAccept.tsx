import styles from "./layout.module.css";

type PropValues = {
  sentBy: any;
  handleAccept:any;
};

export default function InviteAccept({ sentBy ,handleAccept}: PropValues) {

  return (
    <div className={styles.inviteAccept}>
      <div className={styles.content}>
        <p>{sentBy?.username || "user"} sent you an invite!</p>
        <div className={styles.buttonFlex}>
          <button type="button" onClick={() => handleAccept('isAccept')}>
            Accept
          </button>
          <button type="button" onClick={() => handleAccept('isBlocked')}>
            Block
          </button>
        </div>
      </div>
    </div>
  );
}
