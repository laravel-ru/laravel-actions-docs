---
sidebarDepth: 2
---

# Как команда

## Используемый метод
*Перечисляет все методы и свойства, распознаваемые и используемые `CommandDecorator`.*

### `asCommand`
Вызывается при выполнении в виде команды. Использует метод `handle` напрямую, когда метод `asCommand` не существует.

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

    public function asCommand(Command $command): void
    {
        $this->handle(
            User::findOrFail($command->argument('user_id')),
            $command->argument('role')
        );

        $command->info('Done!');
    }
}
```

### `getCommandSignature`
Определяет подпись команды. Это требуется при регистрации действия как команды в консоли `Kernel`. Вы можете определить подпись, используя свойство `$commandSignature` ниже.

```php
public function getCommandSignature(): string
{
    return 'users:update-role {user_id} {role}';
}
```

### `$commandSignature`
То же, что и `getCommandSignature`, но как свойство.

```php
public string $commandSignature = 'users:update-role {user_id} {role}';
```

### `getCommandDescription`
Предоставляет описание команды.

```php
public function getCommandDescription(): string
{
    return 'Updates the role of a given user.';
}
```

### `$commandDescription`
То же, что и `getCommandDescription`, но как свойство.

```php
public string $commandDescription = 'Updates the role of a given user.';
```

### `getCommandHelp`
Предоставляет дополнительное сообщение, отображаемое при использовании параметра `--help`.

```php
public function getCommandHelp(): string
{
    return 'My help message.';
}
```

### `$commandHelp`
То же, что и `getCommandHelp`, но как свойство.

```php
public string $commandHelp = 'My help message.';
```

### `isCommandHidden`
Определяет, следует ли скрывать команду из списка мастеров. По умолчанию: `false`.

```php
public function isCommandHidden(): bool
{
    return true;
}
```

### `$commandHidden`
То же, что и `isCommandHidden`, но как свойство.

```php
public bool $commandHidden = true;
```
