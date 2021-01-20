---
sidebarDepth: 2
---

# Как фейк

## Предоставляемый метод
*Перечисляет все методы, предоставляемые трейтом.*

### `mock`
Меняет действие с пародией.

```php
FetchContactsFromGoogle::mock()
    ->shouldReceive('handle')
    ->with(42)
    ->andReturn(['Loris', 'Will', 'Barney']);
```

### `partialMock`
Меняет местами действие частичным макетом. В приведенном ниже примере имитируется только метод `fetch`.

```php
FetchContactsFromGoogle::partialMock()
    ->shouldReceive('fetch')
    ->with('some_google_identifier')
    ->andReturn(['Loris', 'Will', 'Barney']);
```

### `spy`
Меняет действие на шпиона.

```php
$spy = FetchContactsFromGoogle::spy()
    ->allows('handle')
    ->andReturn(['Loris', 'Will', 'Barney']);

// ...

$spy->shouldHaveReceived('handle')->with(42);
```

### `shouldRun`
Вспомогательный метод, добавляющий ожидание к методу `handle`.

```php
FetchContactsFromGoogle::shouldRun();

// Эквивалентно:
FetchContactsFromGoogle::mock()->shouldReceive('handle');
```

### `shouldNotRun`
Вспомогательный метод, добавляющий ожидание к методу `handle`.

```php
FetchContactsFromGoogle::shouldNotRun();

// Эквивалентно:
FetchContactsFromGoogle::mock()->shouldNotReceive('handle');
```

### `allowToRun`
Вспомогательный метод, позволяющий использовать метод `handle` для шпиона.

```php
$spy = FetchContactsFromGoogle::allowToRun()
    ->andReturn(['Loris', 'Will', 'Barney']);

// ...

$spy->shouldHaveReceived('handle')->with(42);
```

### `isFake`
Было ли действие заменено на поддельный экземпляр.

```php
FetchContactsFromGoogle::isFake(); // false
FetchContactsFromGoogle::mock();
FetchContactsFromGoogle::isFake(); // true
```

### `clearFake`
Удалите поддельный экземпляр действия, если он есть.

```php
FetchContactsFromGoogle::mock();
FetchContactsFromGoogle::isFake(); // true
FetchContactsFromGoogle::clearFake();
FetchContactsFromGoogle::isFake(); // false
```
