export function distinctByKey(arr, keyCB) {
    const obj = {};
    return arr.reduce((preArr, currentItem) => {
      if (obj[keyCB(currentItem)]) {
        return preArr;
      } else {
        obj[keyCB(currentItem)] = true;
        return preArr.concat([currentItem]);
      }
    }, []);
  }

export function isObj(
  obj,
) {
  return /^\[object\sObject\]$/.test(Object.prototype.toString.call(obj));
}

export function isStr(str) {
  return typeof str === "string";
}

export class KwaiError extends Error {
  offIds = [];
  type;

  constructor(message, type, offIds = []){
    super(message);
    this.type = type
    this.offIds = offIds
  }

  addOffIds(ids){
    this.offIds = this.addOffIds.concat(ids)
  }
}