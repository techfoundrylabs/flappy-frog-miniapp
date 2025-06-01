import { redirect, RedirectType } from "next/navigation";

const NotFound = () => {
  redirect("/", RedirectType.replace);
};

export default NotFound;
