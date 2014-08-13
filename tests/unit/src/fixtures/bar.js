import foo from "./foo";

export default function (a, b) {
    return foo(a, b);
};

export function multi () {
    return foo.apply(this, arguments);
}
