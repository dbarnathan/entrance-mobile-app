export default function DeepFreeze(object) {
  const propNames = Object.getOwnPropertyNames(object);

  for (const name of propNames) {
    const value = object[name];

    if (value && typeof value === "object") {
      DeepFreeze(value);
    }
  }

  return Object.freeze(object);
}