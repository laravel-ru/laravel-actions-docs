# Понизить членство в команде

## Определение

Обновить план данной команды до `free` и отключить проекты, которые больше не включены в план.

```php
class DemoteTeamMembership
{
    use AsAction;

    public string $commandSignature = 'teams:demote {team_id}';
    public string $commandDescription = 'Понизьте команду с данным идентификатором.';

    public function handle(Team $team): void
    {
        $team->update(['plan' => 'free' ]);
        $numberOfProjectsAllowed = config('app.plans.free.number_of_projects');

        if ($team->projects()->count() <= $numberOfProjectsAllowed) {
            return;
        }

        $team->projects()
            ->orderBy('created_at')
            ->skip($numberOfProjectsAllowed)
            ->update(['disabled_at' => now()]);
    }

    public function asListener(PaymentFailed $event): void
    {
        $this->handle($event->payment->team);
    }

    public function asCommand(Command $command): void
    {
        $team = Team::findOrFail($command->argument('team_id'));
        $this->handle($team);

        $command->line('Готово!');
    }
}
```

## Использование в качестве объекта

```php
DemoteTeamMembership::run($team);
```

## Регистрация в качестве слушателя

Чтобы Ваше действие прослушивало конкретное событие, просто добавьте его в свой `EventServiceProvider`.

```php
namespace App\Providers;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        PaymentFailed::class => [
            DemoteTeamMembership::class,
        ],
    ];

    // ...
}
```

## Использование в качестве команды

Было бы полезно зарегистрировать действие как команду, если нам нужно вручную понизить уровень команды. Для этого нам нужно зарегистрировать нашу команду в консоли `Kernel`.

```php
namespace App\Console;

class Kernel extends ConsoleKernel
{
    protected $commands = [
        DemoteTeamMembership::class,
    ];
    
    // ...
}
```

Теперь мы можем понизить команду с идентификатором `42` следующим образом:

```
php artisan teams:demote 42
```
