import InviteAccept from "./inviteAccept";
import styles from "./layout.module.css";

export default function InputSectionView({
  chat,
  currentUser,
  handleSend,
  message,
  setMessage,
  users,
  handleInviteApproval,
}: any) {
  return (
    <>
      {
        chat?.sentTo?.some((el: any) => {
          const isCurrentUserSender = chat?.sentby === currentUser?.id;
          const isCurrentUserRecipient = el?.user === currentUser?.id;
          const isBlocked = el?.isBlocked;

          if (isBlocked) {
            return false;
          }

          if (el?.isAccept) {
            return true;
          }

          return isCurrentUserSender && !el?.isAccept;
        }) ? (
          <div className={styles.inputSection}>
            <i className="fa-solid fa-plus"></i>

            <form className={styles.inputForm} onSubmit={handleSend}>
              <input
                className={styles.input}
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message"
              />
            </form>
          </div>
        ) : chat?.sentTo?.some(
            (el: any) => !el?.isBlocked && el?.user === currentUser?.id
          ) ? (
          <InviteAccept
            sentBy={users[chat?.sentby]}
            handleAccept={handleInviteApproval}
          />
        ) : null // Display nothing if none of the conditions are met
      }
    </>
  );
}
