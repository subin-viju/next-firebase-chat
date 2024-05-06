import { List } from "antd";

type PropTypes = {
  chat: any;
  currentUser: any;
  handleBlockStatus:any
};

export default function ChatPopover({ chat, currentUser,handleBlockStatus }: PropTypes) {
  const isSender = chat?.sentby === currentUser?.id;
  const sentToUser = chat?.sentTo?.find(
    (el: any) => el?.user === currentUser?.id
  );

  const getStatusText = () => {
    if (isSender) {
      return chat?.isBlockedbySender ? "Unblock" : "Block";
    } else {
      return sentToUser?.isBlocked ? "Unblock" : "Block";
    }
  };

  async function handleClick(){
    const status = getStatusText() === 'Unblock' ? false : true;
    const type = isSender ? 1 : 2
    console.log(type)
    await handleBlockStatus(type,status)
  }

  return (
    <List>
      <List.Item onClick={handleClick}>{getStatusText()}</List.Item>
    </List>
  );
}
