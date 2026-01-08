import axios from "axios";
import config from "../util/config";
import { profileStore } from "../store/ProfileStore";

export const request = (url = "", method = "", data = {}) => {
  let { access_token } = profileStore.getState();
  let header = {
    "Content-Type": "application/json",
  };
  if (data instanceof FormData) {
    header = {
      "Content-Type": "multipart/form-data",
    };
  }

  return axios({
    url: config.base_url + url,
    method: method,
    data: data,
    headers: {
      ...header,
      Accept: "application/json",
      Authorization: `Bearer ${access_token}`,
    },
  })
    .then((res) => {
      return res.data;
    })
    .catch((error) => {
      console.log(error);
      const response = error.response;
      if (response) {
        const status = response.status;
        const data = response.data;
        let errors = {};
        if (status === 500) {
          errors.message = "Internal Server Error ! please contact admin";
        }

        if (data.errors) {
          Object.keys(data.errors).map((key) => {
            errors[key] = {
              help: data.errors[key][0],
              validateStatus: "error",
              hasFeedback: true,
            };
          });
        }

        return {
          status: status,
          errors: errors,
          message: data.message || "An error occurred",
        };
      }
    });
};
