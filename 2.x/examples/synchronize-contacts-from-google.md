# Синхронизировать контакты из Google

## Определение

Выбирает все контакты из учетной записи Google пользователя и синхронизирует их с нашим собственным определением контактов. Конкретно он добавляет или обновляет выбранные контакты и удаляет те, которые больше не являются частью выбранных контактов.

```php
class SynchronizeContactsFromGoogle
{
    use AsAction;

    protected Collection $fetchedIds;
    public string $commandSignature = 'users:sync-contacts {user_id}';
    public string $commandDescription = 'Синхронизируйте контакты Google данного пользователя.';

    public function __construct(): void
    {
        $this->fetchedIds = collect();
    }

    public function handle(User $user): void
    {
        // Делегируйте другое действие для получения фактических данных (упрощает имитацию).
        $googleContacts = FetchContactsFromGoogle::run($user);

        // Обновите или создайте контакты из полученных данных.
        $googleContacts->each(
            fn ($googleContact) => $this->upsertContact($user, $googleContact)
        );

        // Удалите все существующие контакты, которые не были частью выбранных контактов.
        $user->contacts()
            ->whereNotIn('google_id', $this->fetchedIds)
            ->delete();
    }

    protected function upsertContact(User $user, array $googleContact): void
    {
        $user->contacts()->updateOrCreate(
            [
                'google_id' => Arr::get($googleContact, 'id')
            ],
            [
                'name' => Arr::get($googleContact, 'name'),
                'company' => Arr::get($googleContact, 'company'),
                'phone' => Arr::get($googleContact, 'phone'),
                'email' => Arr::get($googleContact, 'email'),
            ],
        );

        $this->fetchedIds->push(Arr::get($googleContact, 'id'));
    }

    public function getControllerMiddleware(): array
    {
        return ['auth'];
    }

    public function asController(Request $request)
    {
        $this->handle($user = $request->user());

        return ContactResource::collection($user->contacts);
    }

    public function asListener(GoogleAccountChanged $event): void
    {
        $this->handle($event->googleAccount->user);
    }

    public function asCommand(Command $command): void
    {
        $this->handle(
            User::findOrFail($command->argument('user_id'))
        );

        $command->line('Done!');
    }
}
```

## Использование в качестве объекта

```php
SynchronizeContactsFromGoogle::run($user);
```

## Регистрация в качестве контроллера

```php
Route::post('users/contacts/sync', SynchronizeContactsFromGoogle::class);
```

## Отправка как асинхронное задание

```php
SynchronizeContactsFromGoogle::dispatch($user);
```

## Регистрация в качестве слушателя

```php
namespace App\Providers;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        GoogleAccountChanged::class => [
            SynchronizeContactsFromGoogle::class,
        ],
    ];

    // ...
}
```

## Регистрация как команда

```php
namespace App\Console;

class Kernel extends ConsoleKernel
{
    protected $commands = [
        SynchronizeContactsFromGoogle::class,
    ];
    
    // ...
}
```
