# Инсценируйте и проверьте свои действия

Одно из преимуществ использования действий Laravel состоит в том, что оно обеспечивает разрешение ваших действий из контейнера - даже при их выполнении как простых объектах. Это означает, что мы можем легко использовать это, чтобы заменить их реализацию на фиктивную или шпионскую, чтобы упростить тестирование.

## Инсценирование

Чтобы заменить действие на макет в Вашем тесте, просто используйте статический метод `mock` следующим образом:

```php
FetchContactsFromGoogle::mock();
```

Это вернет `MockInterface`, и, таким образом, Вы сможете связать свои фиктивные ожидания, как Вы привыкли.

```php
FetchContactsFromGoogle::mock()
    ->shouldReceive('handle')
    ->with(42)
    ->andReturn(['Loris', 'Will', 'Barney']);
```

Поскольку Вы, вероятно, больше всего будете издеваться над методом `handle`, вы также можете использовать вспомогательный метод `shouldRun`, чтобы его было легче читать. Приведенный ниже код эквивалентен предыдущему примеру.

```php
FetchContactsFromGoogle::shouldRun()
    ->with(42)
    ->andReturn(['Loris', 'Will', 'Barney']);
```

Вы также можете использовать вспомогательный метод `shouldNotRun`, чтобы добавить противоположное ожидание.

```php
FetchContactsFromGoogle::shouldNotRun();

// Эквивалентно:
FetchContactsFromGoogle::mock()->shouldNotReceive('handle');
```

## Частичное инсценирование

Если Вы хотите имитировать только те методы, которые имеют ожидания, Вы можете вместо этого использовать метод `partialMock`. В приведенном ниже примере будет имитироваться только метод `fetch`.

```php
FetchContactsFromGoogle::partialMock()
    ->shouldReceive('fetch')
    ->with('some_google_identifier')
    ->andReturn(['Loris', 'Will', 'Barney']);
```

## Шпионаж

Если Вы предпочитаете сначала запустить, а потом утверждать, Вы можете использовать шпион вместо имитации, используя метод `spy`.

```php
$spy = FetchContactsFromGoogle::spy()
    ->allows('handle')
    ->andReturn(['Loris', 'Will', 'Barney']);

// ...

$spy->shouldHaveReceived('handle')->with(42);
```

Вы также можете использовать вспомогательный метод `allowToRun`, чтобы сделать его более читабельным. Код ниже - эквивалентен предыдущему примеру.

```php
$spy = FetchContactsFromGoogle::allowToRun()
    ->andReturn(['Loris', 'Will', 'Barney']);

// ...

$spy->shouldHaveReceived('handle')->with(42);
```

## Обработка поддельных экземпляров

При использовании `mock`, `partialMock` или `spy` для действия он один раз сгенерирует новый `MockInterface`, а затем продолжит использовать тот же поддельный экземпляр.

Это означает, что независимо от того, сколько раз Вы вызываете метод `mock`, он всегда будет ссылаться на один и тот же `MockInterface`, позволяя добавлять ожидания в Ваши тесты.

Laravel Actions предоставляет два дополнительных метода, которые помогут Вам справиться с поддельными экземплярами.

Первый - это простой метод `isFake`, сообщающий Вам, является ли действие в настоящее время имитируемым или нет.

```php
FetchContactsFromGoogle::isFake(); // false
FetchContactsFromGoogle::mock();
FetchContactsFromGoogle::isFake(); // true
```

Второй, `clearFake`, позволяет Вам прикрепить `MockInterface` к действию, чтобы оно могло вернуться к его реальной реализации.

```php
FetchContactsFromGoogle::mock();
FetchContactsFromGoogle::isFake(); // true
FetchContactsFromGoogle::clearFake();
FetchContactsFromGoogle::isFake(); // false
```

Вот и все. Поздравляем, Вы завершили основную часть этого руководства! 🎉

Следующие две страницы являются необязательными и немного более сложными. Первый объясняет [как использовать более детально трейты](./granular-traits), чем `AsAction`, а второй немного глубже исследует [как Laravel Actions работают под капотом](./how-does-it-work).
