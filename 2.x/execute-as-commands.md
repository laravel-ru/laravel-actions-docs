# Выполнять как команды

## Регистрация команды

Первое, что Вам нужно сделать, чтобы запустить свое действие как команду мастера, - это зарегистрировать его в консоли `Kernel`, как и любой другой класс команд.

```php
namespace App\Console;

class Kernel extends ConsoleKernel
{
    protected $commands = [
        UpdateUserRole::class,
    ];

    // ...
}
```

## Подпись и параметры команды

Затем Вам нужно предоставить подпись команды для Вашего действия, используя свойство `$commandSignature`.

```php
class UpdateUserRole
{
    use AsAction;

    public string $commandSignature = 'users:update-role {user_id} {role}';

    // ...
}
```

Вы также можете предоставить описание и дополнительные параметры команды, используя следующие свойства.

```php
class UpdateUserRole
{
    use AsAction;

    public string $commandSignature = 'users:update-role {user_id} {role}';
    public string $commandDescription = 'Обновляет роль данного пользователя.';
    public string $commandHelp = 'Дополнительное сообщение отображается при использовании параметра --help.';
    public bool $commandHidden = true; // Скрывает команду из списка artisan.

    // ...
}
```

Если Вам нужно определить эти параметры, используя дополнительную логику, Вы можете вместо этого использовать следующие методы.

```php
class UpdateUserRole
{
    use AsAction;

    public function getCommandSignature(): string
    {
        return 'users:update-role {user_id} {role}';
    }

    public function getCommandDescription(): string
    {
        return 'Обновляет роль данного пользователя.';
    }

    public function getCommandHelp(): string
    {
        return 'Дополнительное сообщение отображается при использовании параметра --help.';
    }

    public function isCommandHidden(): bool
    {
        return true; // Скрывает команду из списка artisan.
    }

    // ...
}
```

## От команды к действию

Наконец, Вам нужно будет реализовать метод `asController`, чтобы преобразовать ввод команды в вызов Вашего метода `handle`.

Метод `asController` предоставляет Вам `CommandDecorator` в качестве первого аргумента, который является экземпляром `Illuminate\Console\Command`.

Это означает, что Вы можете использовать его для получения аргументов и параметров команд, а также для запроса и/или отображения чего-либо обратно в терминал.

```php
use Illuminate\Console\Command;

class UpdateUserRole
{
    use AsAction;

    public string $commandSignature = 'users:update-role {user_id} {role}';

    public function handle(User $user, string $newRole): void
    {
        $user->update(['role' => $newRole]);
    }

    public function asController(Command $command): void
    {
        $this->handle(
            User::findOrFail($command->argument('user_id')),
            $command->argument('role')
        );

        $command->info('Done!');
    }
}
```

В приведенном выше примере мы использовали аргументы `{user_id}` и `{role}`, но мы также могли запрашивать эти значения при запуске команды.

```php
class UpdateUserRole
{
    use AsAction;

    public string $commandSignature = 'users:update-role';

    public function handle(User $user, string $newRole): void
    {
        $user->update(['role' => $newRole]);
    }

    public function asController(Command $command): void
    {
        $userId = $command->ask('Какой ID пользователя?');

        if (! $user = User::find($userId)) {
            return $command->error('Этот пользователь не существует.');
        }

        $role = $command->choice('Какую новую роль мы должны назначить этому пользователю?', [
            'reader', 'author', 'moderator', 'admin',
        ]);

        $this->handle($user, $role);

        $command->info('Готово!');
    }
}
```

Теперь мы увидели, как выполнять наши действия разными способами. На следующей странице мы увидим [как имитировать их в наших тестах](./mock-and-test).
