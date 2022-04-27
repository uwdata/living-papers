export function splice(str, ins, i0 = 0, i1 = i0) {
  return str.slice(0, i0) + ins + str.slice(i1);
}
