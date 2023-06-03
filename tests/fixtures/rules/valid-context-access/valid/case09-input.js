import { setContext } from "svelte"

const something = () => {
  setContext("answer", 42)
}

const something2 = async () => {
  await Promise.resolve()
  setContext("answer", 42)
}

const aaa = (fn) => {
  fn()
}

aaa(() => something())
something2()
