import dayjs from "dayjs";
import { profileStore } from "../store/ProfileStore";
export const dateClient = (date, format = "DD MMM YYYY hh:mm a") => {
  if (date) {
    return dayjs(date).format(format);
  }
  return null;
};

export const isPermissionAction = (permission_name) => {
  // Product.Create  Category.Edit
  const { permission } = profileStore.getState();
  if (permission) {
    let findIndex = permission?.findIndex(
      (item) => item.name == permission_name
    );
    if (findIndex == -1) {
      return false; // not found permission
    }
    return true; // found permission
  }
};
