/**
 * Фабрика декоратора методу @LogExecutionTime()
 * Заміряє час виконання методу за допомогою Performance API та логує бенчмарк у мілісекундах
 */
export function LogExecutionTime() {
  return function (
    _target: object,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;

    descriptor.value = function (this: unknown, ...args: unknown[]) {
      const start = performance.now();
      const result = originalMethod.apply(this, args);
      const duration = (performance.now() - start).toFixed(2);
      console.log(`[BENCHMARK] Метод ${propertyKey} виконано за ${duration} ms.`);
      return result;
    };

    return descriptor;
  };
}
