/* jshint esnext:true */

import { counter, increment, decrement } from "./b";

export function up () {
  increment();
  return counter;
}

export function down () {
  decrement();
  return counter;
}

export function current () {
  return counter;
}
