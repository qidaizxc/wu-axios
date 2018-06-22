import Axios from "./core/Axios";
import defaults from "./defaults";
import mergeConfig from "./core/mergeConfig";

const axios: any = new Axios(defaults);
axios.Axios = Axios;
axios.create = function (instanceConfig: any) {
  return new Axios(mergeConfig(defaults, instanceConfig));
};

// todo

export default axios;