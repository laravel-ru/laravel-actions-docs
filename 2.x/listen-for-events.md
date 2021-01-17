# Слушатель для событий

## Регистрация слушателя

Зарегистрируйте свое действие как прослушиватель событий, просто зарегистрируйте его в своем `EventServiceProvider`, как и любой другой прослушиватель.

```php
namespace App\Providers;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        MyEvent::class => [
            MyAction::class,
        ],
    ];

    // ...
}
```

Вы также можете использовать метод `listen` на фасаде `Event`, чтобы зарегистрировать его где-нибудь еще.

```php
Event::listen(MyEvent::class, MyAction::class);

// Обратите внимание, что он также работает со строковыми событиями.
Event::listen('my_string_events.*', MyAction::class);
```

## От слушателя к действию

Как обычно, Вы можете использовать метод `asListener` для преобразования данных события в вызов Вашего метода `handle`.

```php
class SendOfferToNearbyDrivers
{
    use AsAction;

    public function handle(Address $source, Address $destination): void
    {
        // ...
    }

    public function asListener(TaxiRequested $event): void
    {
        $this->handle($event->source, $event->destination);
    }
}
```

Если Вы слушаете строковые события, тогда метод `asListener` получит все параметры события в качестве аргументов.

```php
// Когда мы отправляем это строковое событие с некоторыми параметрами.
Event::dispatch('taxi.requested', [$source, $destination]);

// Затем метод `asListener` принимает их как аргументы.
public function asListener(Source $source, Destination $destination): void
{
    $this->handle($source, $destination);
}
```

Обратите внимание, что в этом конкретном случае `asListener` может быть устаревшим, поскольку он имеет ту же сигнатуру, что и метод `handle`, и просто делегирует ему полномочия.

Вы также можете зарегистрировать свое действие как прослушиватель множества различных событий и использовать `asListener` как способ синтаксического анализа различных событий в Вашем методе `handle`.

```php
public function asListener(...$parameters): void
{
    $event = $parameters[0];

    if ($event instanceof TaxiRequested) {
        return $this->handle($event->source, $event->destination);
    }

    if ($event instanceof FoodDeliveryRequested) {
        return $this->handle($event->restaurant->address, $event->destination);
    }
    
    $this->handle(...$parameters);
}
```

Вот и все! Далее, давайте перейдем к [выполнению Ваших действий как ремесленных команд](./execute-as-commands).
