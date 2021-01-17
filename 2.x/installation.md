# Установка

Все, что Вам нужно сделать, чтобы начать - это добавить Laravel Action в зависимости Вашего композера.

```sh
composer require lorisleiva/laravel-actions
```

Затем Вы можете добавить трейт `AsAction` к любому из Ваших классов, чтобы сделать его экшеном.

```php
use Lorisleiva\Actions\Concerns\AsAction;

class UpdateUserPassword
{
    use AsAction;

    public function handle(User $user, string $newPassword)
    {
        // ...
    }
}
```
