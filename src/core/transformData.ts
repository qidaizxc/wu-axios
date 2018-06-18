import {forEach} from "../utils/commonUtils";

export default function (data: any, headers: any, fns: any) {
  forEach(fns, function (fn: any) {
    data = fn(data, headers);
  })
}