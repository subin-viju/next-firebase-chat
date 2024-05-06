"use client";
import { FormEvent, Fragment, useEffect, useRef, useState } from "react";
import styles from "./layout.module.css";
import {
  Timestamp,
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../../utils/firebase";
import { User } from "../../types/basic-types";
import InputSectionView from "./inputsectionView";
import { Popover } from "antd";
import ChatPopover from "./chatpopover";
import { convertTime } from "../../helpers/convert-time";

type ApprovalType = "isAccept" | "isBlocked";

export default function Chatroom() {
  const currentChatRef = useRef<any>(null);
  const [chat, setChat] = useState<any>(null);
  const [users, setUsers] = useState<any>([]);
  const [currentUser, setCurrentUser] = useState<any>([]);
  const [searchValue, setSearchValue] = useState("");
  const [chats, setChats] = useState<any>([]);
  const [message, setMessage] = useState<string>("");
  const [currentChat, setCurrentChat] = useState<any>(null);

  const SINGLE = "single";
  const GROUP = "group";

  //To List All Users...!
  async function getAllUsers() {
    try {
      let obj: any = {};
      const querySnapshot = await getDocs(collection(db, "users"));
      querySnapshot.forEach((doc) => {
        obj[doc.data().id] = doc.data();
      });
      const current = obj[auth.currentUser?.uid!];

      setUsers(obj);
      setCurrentUser(current);
    } catch (error) {}
  }

  //To List all Chats of the User...!
  async function getAllChats() {
    try {
      let obj: any = {};
      const q = query(
        collection(db, "chats"),
        where("members", "array-contains", auth?.currentUser?.uid)
      );
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        obj[doc.id] = doc.data();
      });

      setChats(obj);
    } catch (error) {}
  }

  //To invite a new user to the chat..!
  async function handleInvite(user: User) {
    try {
      const inviteObj = {
        isAccept: false,
        isBlocked: false,
        user: user?.id,
      };
      const docRef = await addDoc(collection(db, "chats"), {
        type: "single",
        sentby: currentUser?.id,
        sentTo: arrayUnion(inviteObj),
        members: arrayUnion(user.id, currentUser?.id),
        isBlockedbySender: false,
        messages: [],
      });

      await Promise.all([
        updateDoc(doc(db, "users", user.id), {
          chats: arrayUnion(docRef.id),
        }),
        updateDoc(doc(db, "users", currentUser?.id), {
          chats: arrayUnion(docRef.id),
        }),
        setUsers((prevState: any) => ({
          ...prevState,
          [currentUser?.id]: {
            ...prevState[currentUser?.id],
            chats: [...prevState[currentUser?.id].chats, docRef.id],
          },
          [user.id]: {
            ...prevState[user.id],
            chats: [...prevState[user.id].chats, docRef.id],
          },
        })),

        setCurrentUser((prevState: any) => ({
          ...prevState,
          chats: [...prevState.chats, docRef.id],
        })),
      ]);
    } catch (error) {
      console.log("errorr------", error);
    }
  }

  //to send a message to user..!
  async function handleSend(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      if (chat?.id === currentChat && message?.length) {
        const docRef = doc(db, "chats", chat.id);

        const lastMessage = {
          message,
          timestamp: Timestamp.now(),
        };

        let unread: any = {};

        chat?.members
          ?.filter((user: string) => user !== currentUser?.id)
          ?.map((el: string) => {
            unread[el] = chat?.unread?.[el] ? chat?.unread?.[el] + 1 : 1;
          });

        const newMessage = {
          sender: currentUser?.id,
          id: Math.random(),
          message: message,
          timestamp: Timestamp.now(),
        };

        await updateDoc(docRef, {
          lastMessage,
          unread,
          messages: arrayUnion(newMessage),
        });

        setMessage("");
      }
    } catch (error) {}
  }

  //to accept the invite of a user..!
  async function handleInviteApproval(type: ApprovalType) {
    try {
      const docRef = doc(db, "chats", chat.id);
      const docs = await getDoc(docRef);
      const inviteData = docs.data();

      let newArray = inviteData?.sentTo?.map((el: any) =>
        el?.user === auth.currentUser?.uid ? { ...el, [type]: true } : el
      );
      await updateDoc(docRef, {
        sentTo: newArray,
      });

      setChat((prev: any) => ({
        ...prev,
        sentTo: newArray,
      }));
    } catch (error) {}
  }

  //to change the read status of a chat..!
  async function handleReadMessage(chat: any, chatId: string) {
    setCurrentChat(chatId);
    setChat({ ...chat, id: chatId });

    const docRef = doc(db, "chats", chatId);
    const docs = await getDoc(docRef);

    let unread = { ...docs.data()?.unread };

    if (unread[currentUser?.id]) {
      unread[currentUser?.id] = 0;
    }

    await updateDoc(docRef, {
      unread,
    });
  }

  //to change the block status of a chat
  async function handleBlockStatus(type: number, status: boolean) {
    try {
      const docRef = doc(db, "chats", chat?.id);

      if (type === 1) {
        await updateDoc(docRef, {
          isBlockedbySender: status,
        });
      } else {
        let newArr = chat?.sentTo?.map((el: any) => {
          if (el?.user === currentUser?.id) {
            const updatedEl = { ...el };
            updatedEl.isBlocked = status;
            return updatedEl;
          }
          return el;
        });

        await updateDoc(docRef, {
          sentTo: newArr,
        });
      }
    } catch (error) {}
  }

  function showSingleChatUser(chat: any) {
    const user = chat.members.filter((id: string) => id !== currentUser.id)[0];
    return users[user]?.username;
  }

  function showGroupChatTitle(chat: any) {
    return "Group 1";
  }

  useEffect(() => {
    (async () => {
      await getAllUsers();
      await getAllChats();
    })();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "chats"), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          console.log("Added....");

          setChats((prev: any) => ({
            ...prev,
            [change.doc.id]: change.doc.data(),
          }));
        }

        if (change.type === "modified") {
          console.log("modifieddd");

          setChats((prev: any) => {
            const { [change.doc.id]: changeData, ...rest } = prev;
            return { [change.doc.id]: change.doc.data(), ...rest };
          });

          if (change.doc.id === currentChatRef.current) {
            setChat({ id: change.doc.id, ...change.doc.data() });
          }
        }
        if (change.type === "removed") {
          //change need to do
        }
      });
    });

    return () => unsubscribe(); // Unsubscribe when component unmounts
  }, []);

  useEffect(() => {
    currentChatRef.current = currentChat;
  }, [currentChat]);


  return (
    <section className={styles.mainSection}>
      <div className={styles.leftSection}>
        <header className={styles.leftHeader}>
          <div className={styles.headerlogo}>
            <img src="/images/michaelscott.png" alt="" />
            <h4>{currentUser?.username || ""}</h4>
          </div>
          <div className={styles.headerlogo}>
            <img src="/images/add-new-user.jpg" alt="" />
          </div>
        </header>
        <div className={styles.searchbar}>
          <input
            className={styles.searchinput}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            type="text"
            placeholder="Search user..."
          />
        </div>
        <ul className={styles.list}>
          {searchValue ? (
            <>
              {Object.keys(users)
                .filter(
                  (key: any) =>
                    key !== currentUser?.id &&
                    users[key]?.username
                      .toLowerCase()
                      .includes(searchValue.toLowerCase())
                )
                .map((user: any) => (
                  <Fragment key={user}>
                    {users[user].chats.some((id: string) =>
                      currentUser.chats.includes(id)
                    ) ? (
                      <li key={user}>
                        <div className={styles.userlogo}>
                          <img src="/images/michaelscott.png" alt="" />
                        </div>
                        <div className={styles.nameSection}>
                          <div>
                            <h6>{users[user].username}</h6>
                            <p>
                              {/* {users[user].chats.find((id: string) =>
                                currentUser.chats.includes(id)
                              )?.lastMessage?.message || ""} */}
                            </p>
                          </div>
                          <div className={styles.timeandcount}>
                            <p></p>
                            <p>Invite Sent</p>
                          </div>
                        </div>
                      </li>
                    ) : (
                      <li key={user}>
                        <div className={styles.userlogo}>
                          <img src="/images/michaelscott.png" alt="" />
                        </div>
                        <div className={styles.nameSection}>
                          <div>
                            <h6>{users[user].username}</h6>
                          </div>
                          <div className={styles.timeandcount}>
                            <p
                              onClick={() => handleInvite(users[user])}
                              className={styles.inviteBtn}
                            >
                              Invite
                            </p>
                          </div>
                        </div>
                      </li>
                    )}
                  </Fragment>
                ))}
            </>
          ) : (
            <>
              {Object.keys(chats).map((key: any, idx: number) => (
                <li
                  onClick={() => {
                    handleReadMessage(chats[key], key);
                  }}
                  key={idx}
                >
                  <div className={styles.userlogo}>
                    <img src="/images/michaelscott.png" alt="" />
                  </div>
                  <div className={styles.nameSection}>
                    <div>
                      <h6>
                        {chats[key].type === SINGLE
                          ? showSingleChatUser(chats[key])
                          : showGroupChatTitle(chats[key])}
                      </h6>
                      <p>{chats[key]?.lastMessage?.message}</p>
                    </div>
                    <div className={styles.timeandcount}>
                      <p>{convertTime(chats[key]?.lastMessage?.timestamp)}</p>
                      {key !== currentChat &&
                      chats[key]?.unread?.[currentUser?.id] ? (
                        <p className={styles.indicator}>
                          {chats[key]?.unread?.[currentUser?.id]}
                        </p>
                      ) : (
                        <></>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </>
          )}
        </ul>
      </div>
      <div className={styles.rightSection}>
        {!chat ? (
          <div className={styles.emptychatSection}>
            <h2>Chat With Friends</h2>
            <p>Chat with your Friends and family!</p>
          </div>
        ) : chat.id === currentChat ? (
          <>
            <header className={styles.leftHeader}>
              <div>
                <div className={styles.headerlogo}>
                  <img src="/images/michaelscott.png" alt="" />
                  <h4>
                    {chat.type === SINGLE
                      ? showSingleChatUser(chat)
                      : showGroupChatTitle(chat)}
                  </h4>
                </div>
              </div>
              <Popover
                content={
                  <ChatPopover
                    chat={chat}
                    currentUser={currentUser}
                    handleBlockStatus={handleBlockStatus}
                  />
                }
                title="Options"
                placement="leftTop"
                trigger="click"
              >
                <div className={styles.threedot}>
                  <img src="/images/dot.png" alt="" />
                </div>
              </Popover>
            </header>

            <div>
              <div className={styles.messageSection}>
                {chat?.messages?.map((content: any, idx: number) => (
                  <div
                    key={idx}
                    className={
                      content?.sender !== currentUser?.id
                        ? styles.incoming
                        : styles.outgoing
                    }
                  >
                    {content.message}
                  </div>
                ))}
              </div>
              <InputSectionView
                chat={chat}
                currentUser={currentUser}
                handleSend={handleSend}
                message={message}
                setMessage={setMessage}
                users={users}
                handleInviteApproval={handleInviteApproval}
              />
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
