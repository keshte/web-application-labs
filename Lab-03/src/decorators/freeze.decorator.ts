/**
 * Декоратор класу @FrozenEntity()
 * Заморожує функцію-конструктор класу та його прототип за допомогою Object.freeze(),
 * забезпечуючи захист від динамічної мутації чи підміни методів у runtime (runtime tamper protection)
 */
export function FrozenEntity() {
  return function <T extends new (...args: any[]) => object>(constructor: T): void {
    Object.freeze(constructor);
    Object.freeze(constructor.prototype);
  };
}
