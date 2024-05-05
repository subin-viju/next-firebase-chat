import { useForm } from "react-hook-form";
import styles from "./usercreation.module.css";

type Propvalues = {
  handleCreate: any;
};

export default function UserCreation({ handleCreate }: Propvalues) {
  const { register, handleSubmit } = useForm();

  function onSubmit(data: any) {
    console.log(data);
    handleCreate(data.email, data.password);
  }

  return (
    <section>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input type="text" {...register("email")} placeholder="Email ID" />
        <input type="text" placeholder="Password" {...register("password")} />
        <button type="submit">Submit</button>
      </form>
    </section>
  );
}
