---
sidebarDepth: 2
---

# Как объект

## Предоставляемый метод
*Перечисляет все методы, предоставляемые трейтом.*

### `make`
Разрешает действие из контейнера.

```php
MyAction::make();

// Эквивалентно:
app(MyAction::class);
```

### `run`
Разрешает и выполняет действие.

```php
MyAction::run($someArguments);

// Эквивалентно:
MyAction::make()->handle($someArguments);
```
