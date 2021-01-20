# Генерация кода резервирования

## Определение

Это действие генерирует уникальный код резервирования с использованием однозначного алфавита.

```php
class GenerateReservationCode
{
    use AsAction;

    const UNAMBIGUOUS_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

    public function handle(int $characters = 7): string
    {
        do {
            $code = $this->generateCode($characters);
        } while(Reservation::where('code', $code)->exists())

        return $code;
    }

    protected function generateCode(int $characters): string
    {
        return substr(str_shuffle(str_repeat(static::UNAMBIGUOUS_ALPHABET, $characters)), 0, $characters);
    }
}
```

## Использование в качестве объекта

В реальном приложении это действие обычно вложено в другое действие, которое создает новые резервирования.

```php{10}
class CreateNewReservation
{
    use AsAction;

    public function handle(User $user, Concert $concert, int $tickets = 1): Reservation
    {
        return $user->reservations()->create([
            'concert_id' => $concert->id,
            'price' => $concert->getTicketPrice() * $tickets,
            'code' => GenerateReservationCode::run(),
        ])
    }
}
```

## Использование как фейковый экземпляр объекта

Преимущество использования `::make()` или `::run()` в том, что оно разрешает действие из контейнера. Это означает, что при тестировании мы можем легко заменить его реализацию на макет.

```php{9}
/** @test */
public function it_generates_a_unique_code_when_creating_a_new_reservation()
{
    // Учитывая существующего пользователя и концерт.
    $user = User::factory()->create();
    $concert = Concert::factory()->create();

    // И учитывая, что мы пародируем код генератора.
    GenerateReservationCode::shouldRun()->andReturn('ABCD234');

    // Когда мы создаем новое резервирование для этого пользователя и этого концерта.
    $reservation = CreateNewReservation::run($user, $concert);

    // Затем мы сохранили ожидаемый код резервирования.
    $this->assertSame('ABCD234', $reservation->code);
}
```
