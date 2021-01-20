---
sidebarDepth: 2
---

# Как слушатель

## Используемый метод
*Перечисляет все методы, признанные и используемые `ListenerDecorator`.*

### `asListener`
Вызывается при выполнении как прослушиватель событий. Использует метод `handle` напрямую, когда метод `asListener` не существует.

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
