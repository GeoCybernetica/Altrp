import Env from "@ioc:Adonis/Core/Env";

/**
 *
 * @param {string} key
 * @param {*} defaultValue
 */
export default function env(key, defaultValue = null) {
  Env.process()
  return Env.get(key, defaultValue)
}
